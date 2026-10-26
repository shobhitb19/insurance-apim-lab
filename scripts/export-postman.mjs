import { mkdir, writeFile } from 'node:fs/promises';

const local = '{{fixtureBaseUrl}}/pairs/{{pairId}}';
const gateway = '{{gatewayBaseUrl}}';
const cases = [
  ['Provider (local, no key)', [
    ['Baseline policy', `${local}/baseline/policies/POL1001`, 200, { policyId: 'POL1001', status: 'Active', product: 'Home' }],
    ['Extended policy', `${local}/extended/policies/POL1001`, 200, { policyId: 'POL1001', status: 'Active', product: 'Home', riskCategory: 'Elevated' }],
    ['Claims for second policy', `${local}/claims/policies/POL1002/summary`, 200, { policyId: 'POL1002', openClaimCount: 0, totalIncurred: 0, currency: 'NZD' }],
    ['Unknown policy', `${local}/baseline/policies/POL9999`, 404, { code: 'PolicyNotFound' }],
    ['Claims dependency failure', `${local}/claims/policies/POL5001/summary`, 503, { code: 'FixtureUnavailable' }]
  ]],
  ['Gateway baseline (modules 2-5)', [
    ['Baseline proxy', `${gateway}/policies/POL1001`, 200, { policyId: 'POL1001', status: 'Active', product: 'Home' }],
    ['Missing subscription key', `${gateway}/policies/POL1001`, 401, { statusCode: 401 }, false],
    ['Invalid subscription key', `${gateway}/policies/POL1001`, 401, { statusCode: 401 }, 'invalid-workshop-key'],
    ['Unknown policy', `${gateway}/policies/POL9999`, 404, { code: 'PolicyNotFound' }],
    ['Invalid ID', `${gateway}/policies/INVALID`, 400, { code: 'InvalidPolicyId' }]
  ]],
  ['Gateway extended (module 6 onward)', [
    ['Extended proxy', `${gateway}/policies/POL1001`, 200, { policyId: 'POL1001', status: 'Active', product: 'Home', riskCategory: 'Elevated' }],
    ['Second extended policy', `${gateway}/policies/POL1002`, 200, { policyId: 'POL1002', status: 'Active', product: 'Motor', riskCategory: 'Standard' }]
  ]],
  ['Gateway composition (module 7 onward)', [
    ['Overview first policy', `${gateway}/policies/POL1001/overview`, 200, { policy: { policyId: 'POL1001', status: 'Active', product: 'Home', riskCategory: 'Elevated' }, claimsSummary: { policyId: 'POL1001', openClaimCount: 1, totalIncurred: 1250, currency: 'NZD' } }],
    ['Overview second policy', `${gateway}/policies/POL1002/overview`, 200, { policy: { policyId: 'POL1002', status: 'Active', product: 'Motor', riskCategory: 'Standard' }, claimsSummary: { policyId: 'POL1002', openClaimCount: 0, totalIncurred: 0, currency: 'NZD' } }],
    ['Unknown overview', `${gateway}/policies/POL9999/overview`, 404, { code: 'PolicyNotFound' }],
    ['Failed claims overview', `${gateway}/policies/POL5001/overview`, 502, { code: 'DependencyFailure' }],
    ['Timed out overview', `${gateway}/policies/POL5002/overview`, 504, { code: 'DependencyTransportFailure' }],
    ['Mismatched overview', `${gateway}/policies/POL5003/overview`, 502, { code: 'InvalidDependencyResponse' }],
    ['Malformed overview', `${gateway}/policies/POL5004/overview`, 502, { code: 'GatewayFailure' }]
  ]]
];
const collection = {
  info: {
    name: 'Insurance APIM guided lab',
    description: 'Synthetic data only. Run Provider locally; gateway folders require facilitator readiness. Run baseline OR extended for the current checkpoint, not both. Gateway exercises have not been validated against your Azure service.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: cases.map(([name, requests]) => ({
    name,
    item: requests.map(([title, url, status, expected, key = true]) => {
      const isGateway = url.startsWith(gateway);
      const exact = status === 200;
      const test = [
        `pm.test('Expected HTTP ${status}', () => pm.response.to.have.status(${status}));`,
        'const body = pm.response.json();',
        `pm.test('Expected response body', () => pm.expect(body).to.${exact ? 'deep.equal' : 'include'}(${JSON.stringify(expected)}));`,
        ...(status !== 401 ? [
          "pm.test('Safe correlation header', () => pm.expect(pm.response.headers.get('X-Correlation-Id')).to.match(/^[A-Za-z0-9-]{1,64}$/));"
        ] : []),
        ...(status >= 400 && status !== 401 ? [
          "pm.test('Error is explicit and correlated', () => { pm.expect(body).to.have.all.keys('code','message','correlationId'); pm.expect(body.correlationId).to.equal(pm.response.headers.get('X-Correlation-Id')); });"
        ] : [])
      ];
      return {
        name: title,
        request: {
          method: 'GET',
          header: isGateway && key !== false ? [{ key: 'Ocp-Apim-Subscription-Key', value: typeof key === 'string' ? key : '{{subscriptionKey}}', type: 'text' }] : [],
          url,
          description: `Expected ${status}. No response body or credentials are written to the console.`
        },
        event: [{ listen: 'test', script: { type: 'text/javascript', exec: test } }]
      };
    })
  }))
};
await mkdir('postman', { recursive: true });
await writeFile('postman/insurance-lab.postman_collection.json', JSON.stringify(collection, null, 2) + '\n');
await writeFile('postman/workshop.postman_environment.json', JSON.stringify({
  name: 'Insurance lab - fill locally, never export secrets',
  values: [
    { key: 'fixtureBaseUrl', value: 'http://127.0.0.1:7071', enabled: true },
    { key: 'gatewayBaseUrl', value: 'https://gateway.example.invalid/pair-01/insurance', enabled: true },
    { key: 'pairId', value: 'pair-01', enabled: true },
    { key: 'subscriptionKey', value: '', type: 'secret', enabled: true }
  ],
  _postman_variable_scope: 'environment'
}, null, 2) + '\n');
console.log('Exported secret-free Postman collection and environment.');
