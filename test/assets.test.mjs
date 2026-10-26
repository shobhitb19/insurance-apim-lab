import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import SwaggerParser from '@apidevtools/swagger-parser';
import { XMLValidator, XMLParser } from 'fast-xml-parser';

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const names = ['provider-baseline', 'provider-extended', 'provider-claims', 'gateway'];

test('source and self-contained portal OpenAPI documents validate and stay in sync', async () => {
  for (const name of names) {
    const source = await SwaggerParser.validate(`contracts/${name}.json`);
    const bundled = await SwaggerParser.validate(`contracts/import/${name}.json`);
    assert.equal(source.info.version, bundled.info.version);
    assert.deepEqual(Object.keys(source.paths), Object.keys(bundled.paths));
    assert.deepEqual(await readJson(`contracts/import/${name}.json`),
      await SwaggerParser.bundle(`contracts/${name}.json`));
    const raw = await readFile(`contracts/import/${name}.json`, 'utf8');
    for (const ref of raw.matchAll(/"\$ref":\s*"([^"]+)"/g)) {
      assert.ok(ref[1].startsWith('#/'), `${name}: external ref cannot be uploaded alone`);
    }
  }
});

test('gateway operations, baseline and extension describe their actual checkpoints', async () => {
  const baseline = await SwaggerParser.dereference('contracts/provider-baseline.json');
  const extended = await SwaggerParser.dereference('contracts/provider-extended.json');
  const gateway = await SwaggerParser.dereference('contracts/gateway.json');
  const shape = doc => doc.paths['/policies/{policyId}'].get.responses[200].content['application/json'].schema;
  assert.equal('riskCategory' in shape(baseline).properties, false);
  assert.equal(shape(extended).required.includes('riskCategory'), true);
  assert.equal(gateway.components.securitySchemes.subscriptionKey.name, 'Ocp-Apim-Subscription-Key');
  const operation = gateway.paths['/policies/{policyId}/overview'].get;
  assert.equal(operation.operationId, 'getPolicyOverview');
  assert.deepEqual(Object.keys(operation.responses).sort(), ['200', '400', '401', '404', '502', '504']);
});

test('all policy examples are well-formed XML with pair-scoped routing and inherited error handling', async () => {
  const parser = new XMLParser({ ignoreAttributes: false });
  for (const file of (await readdir('policies')).filter(name => name.endsWith('.xml'))) {
    const raw = await readFile(path.join('policies', file), 'utf8');
    assert.equal(XMLValidator.validate(raw), true, file);
    const parsed = parser.parse(raw);
    if (file === 'jwt-demo.xml') {
      assert.ok(parsed['validate-jwt']);
    } else {
      for (const section of ['inbound', 'backend', 'outbound', 'on-error']) {
        assert.ok(Object.hasOwn(parsed.policies, section), `${file}: missing ${section}`);
      }
      assert.ok(raw.includes('{{pair-01-backend-url}}'), file);
      assert.ok(raw.includes('<base />'), file);
    }
    assert.doesNotMatch(raw, /mock-response|trace source=|log-to-eventhub/);
    assert.doesNotMatch(raw, /set-header name="Server" exists-action="delete"/);
  }
});

test('composition XML has two bounded new HTTP requests with explicit null/failure/mismatch guards', async () => {
  const raw = await readFile('policies/overview.xml', 'utf8');
  const parsed = new XMLParser({ ignoreAttributes: false }).parse(raw);
  const calls = parsed.policies.inbound['send-request'];
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.equal(call['@_mode'], 'new');
    assert.equal(call['@_timeout'], '2');
    assert.equal(call['@_ignore-error'], 'true');
    assert.equal(call['set-method'], 'GET');
    assert.equal(call['set-header']['@_name'], 'X-Correlation-Id');
  }
  for (const code of ['DependencyTransportFailure', 'DependencyFailure', 'PolicyNotFound', 'InvalidDependencyResponse']) {
    assert.ok(raw.includes(code), code);
  }
  assert.match(raw, /policy\[&quot;policyId&quot;\] == id/);
  assert.match(raw, /claims\[&quot;policyId&quot;\] == id/);
  assert.match(raw, /claims\[&quot;openClaimCount&quot;\]\.Type == JTokenType.Integer/);
  const base = await readFile('policies/api-base.xml', 'utf8');
  assert.ok(base.includes('GatewayFailure'));
  assert.match(base, /name="Authorization" exists-action="delete"/);
  assert.match(base, /name="Ocp-Apim-Subscription-Key" exists-action="delete"/);
});

test('Postman assets are secret-free, have expected assertions, and target every gateway fault case', async () => {
  const collection = await readJson('postman/insurance-lab.postman_collection.json');
  const environment = await readJson('postman/workshop.postman_environment.json');
  assert.equal(collection.info.schema, 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json');
  assert.equal(environment.values.find(item => item.key === 'subscriptionKey').value, '');
  assert.match(environment.values.find(item => item.key === 'gatewayBaseUrl').value, /example\.invalid/);
  const variables = new Set(environment.values.map(item => item.key));
  const requests = collection.item.flatMap(folder => folder.item);
  assert.equal(requests.length, 19);
  for (const item of requests) {
    assert.equal(item.request.method, 'GET');
    assert.ok(item.event[0].script.exec.some(line => line.includes('Expected HTTP')));
    assert.ok(item.event[0].script.exec.some(line => line.includes('Expected response body')));
    for (const variable of JSON.stringify(item).matchAll(/\{\{([^}]+)\}\}/g)) {
      assert.ok(variables.has(variable[1]), `undefined Postman variable ${variable[1]}`);
    }
    assert.doesNotMatch(JSON.stringify(item), /console\.log|subscription-key=/);
  }
  const composition = collection.item.find(folder => folder.name.startsWith('Gateway composition')).item;
  for (const id of ['POL1001', 'POL1002', 'POL9999', 'POL5001', 'POL5002', 'POL5003', 'POL5004']) {
    assert.ok(composition.some(item => item.request.url.includes(id)), id);
  }
  const missing = requests.find(item => item.name === 'Missing subscription key');
  assert.equal(missing.request.header.length, 0);
});

test('Markdown links resolve, core modules contain delivery checkpoints, and built pages link to real outputs', async () => {
  const files = (await readdir('docs')).filter(file => file.endsWith('.md'));
  for (const file of files) {
    const source = await readFile(path.join('docs', file), 'utf8');
    for (const [, link] of source.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^(?:https?:|#)/.test(link)) continue;
      await access(path.resolve('docs', link.split('#')[0]));
    }
    if (/^0[1-9]-/.test(file)) {
      for (const marker of ['Objective', 'Duration', 'Prerequisites', 'Steps', 'Expected results', 'Troubleshooting', 'Checkpoint']) {
        assert.ok(source.toLowerCase().includes(marker.toLowerCase()), `${file}: missing ${marker}`);
      }
    }
    const html = await readFile(path.join('_site', file.replace(/\.md$/, '.html')), 'utf8');
    assert.match(html, /<html lang="en">/);
    assert.match(html, /aria-current="page"/);
    assert.match(html, /--cp-accent:/);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (/^(?:https?:|#)/.test(href)) continue;
      await access(path.resolve('_site', href.split('#')[0]));
    }
  }
  const home = await readFile('_site/index.html', 'utf8');
  assert.match(home, /Find a module/);
  assert.doesNotMatch(home, /google-analytics|googletagmanager|UA-\d/);
});
