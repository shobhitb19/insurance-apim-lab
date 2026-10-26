import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { validator } from '@exodus/schemasafe';
import { createFixtureServer, pairs, policyIds, policyFor, claimsFor } from '../mock/server.mjs';

const schemas = JSON.parse(await readFile('contracts/schemas.json', 'utf8'));
const validate = name => validator({ ...schemas, $ref: `#/definitions/${name}` });
const validators = Object.fromEntries(Object.keys(schemas.definitions).map(name => [name, validate(name)]));
let server;
let base;
before(async () => {
  server = createFixtureServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

async function get(route, options) {
  const response = await fetch(base + route, options);
  const body = await response.json();
  assert.match(response.headers.get('x-correlation-id'), /^[A-Za-z0-9-]{1,64}$/);
  return { response, body };
}

test('all six pair namespaces serve deterministic baseline and provider-owned extension schemas', async () => {
  for (const pair of pairs) {
    for (const id of policyIds) {
      for (const stage of ['baseline', 'extended']) {
        const { response, body } = await get(`/pairs/${pair}/${stage}/policies/${id}`);
        assert.equal(response.status, 200);
        assert.deepEqual(body, policyFor(id, stage === 'extended'));
        assert.equal(validators[stage === 'baseline' ? 'Policy' : 'ExtendedPolicy'](body), true);
        assert.equal('riskCategory' in body, stage === 'extended');
      }
    }
  }
});

test('normal claims match the requested policy, including a valid zero-claims result', async () => {
  for (const pair of pairs) {
    for (const id of ['POL1001', 'POL1002']) {
      const { response, body } = await get(`/pairs/${pair}/claims/policies/${id}/summary`);
      assert.equal(response.status, 200);
      assert.deepEqual(body, claimsFor(id));
      assert.equal(validators.ClaimsSummary(body), true);
    }
  }
});

test('unknown policies return explicit, correlated 404 errors across all provider APIs', async () => {
  for (const stage of ['baseline', 'extended', 'claims']) {
    const { response, body } = await get(`/pairs/pair-01/${stage}/policies/POL9999${stage === 'claims' ? '/summary' : ''}`);
    assert.equal(response.status, 404);
    assert.equal(body.code, 'PolicyNotFound');
    assert.equal(validators.Error(body), true);
    assert.equal(body.correlationId, response.headers.get('x-correlation-id'));
  }
});

test('fixture rejects invalid pair/routes, query parameters and writes', async () => {
  const cases = [
    ['/pairs/pair-07/baseline/policies/POL1001', {}, 404, 'RouteNotFound'],
    ['/pairs/pair-01/claims/policies/POL1001', {}, 404, 'RouteNotFound'],
    ['/pairs/pair-01/baseline/policies/POL1001/summary', {}, 404, 'RouteNotFound'],
    ['/pairs/pair-01/baseline/policies/POL1001?anything=1', {}, 400, 'UnexpectedQuery'],
    ['/pairs/pair-01/baseline/policies/POL1001', { method: 'POST' }, 405, 'MethodNotAllowed']
  ];
  for (const [route, options, status, code] of cases) {
    const { response, body } = await get(route, options);
    assert.equal(response.status, status);
    assert.equal(body.code, code);
    assert.equal(validators.Error(body), true);
  }
});

test('correlation accepts safe direct-provider IDs and replaces unsafe values', async () => {
  const route = '/pairs/pair-01/baseline/policies/POL1001';
  const safe = await get(route, { headers: { 'X-Correlation-Id': 'direct-provider-check-01' } });
  assert.equal(safe.response.headers.get('x-correlation-id'), 'direct-provider-check-01');
  for (const value of ['x'.repeat(65), '<untrusted>']) {
    const result = await get(route, { headers: { 'X-Correlation-Id': value } });
    assert.notEqual(result.response.headers.get('x-correlation-id'), value);
  }
});

test('composition failure fixtures expose 503, mismatched IDs and malformed JSON, never empty claims', async () => {
  const route = id => `/pairs/pair-01/claims/policies/${id}/summary`;
  const unavailable = await get(route('POL5001'));
  assert.equal(unavailable.response.status, 503);
  assert.equal(unavailable.body.code, 'FixtureUnavailable');
  assert.equal(validators.Error(unavailable.body), true);
  const mismatch = await get(route('POL5003'));
  assert.equal(mismatch.response.status, 200);
  assert.equal(mismatch.body.policyId, 'POL1002');
  assert.notEqual(mismatch.body.policyId, 'POL5003');
  const malformed = await fetch(base + route('POL5004'));
  assert.equal(malformed.status, 200);
  assert.equal(await malformed.text(), 'not-json');
});

test('slow dependency exceeds the documented two-second budget and permits client cancellation', async () => {
  const route = `${base}/pairs/pair-01/claims/policies/POL5002/summary`;
  const start = performance.now();
  const response = await fetch(route);
  assert.equal(response.status, 200);
  assert.ok(performance.now() - start >= 3400, 'fixture must exceed the 2s APIM dependency budget');
  assert.deepEqual(await response.json(), claimsFor('POL5002'));
  await assert.rejects(fetch(route, { signal: AbortSignal.timeout(2000) }), { name: 'TimeoutError' });
});

test('health endpoint reports a live HTTP fixture', async () => {
  const { response, body } = await get('/health');
  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: 'ok' });
});
