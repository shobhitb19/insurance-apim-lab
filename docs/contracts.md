# HTTP contract and fixtures

All data and IDs are fictional, not vendor API contracts. Every pair uses
`pair-01` through `pair-06` with identical deterministic records. Namespaces
organize fixtures, not security isolation.

## Direct provider routes

Base: local `http://127.0.0.1:7071` or the approved distinct fixture HTTPS host.

| Method/path | Normal body |
|---|---|
| GET `/pairs/{pairId}/baseline/policies/{policyId}` | policyId, status, product |
| GET `/pairs/{pairId}/extended/policies/{policyId}` | baseline fields plus riskCategory |
| GET `/pairs/{pairId}/claims/policies/{policyId}/summary` | policyId, openClaimCount, totalIncurred, currency |

`POL1001`: Active, Home, Elevated (only extended), 1 open claim, NZD 1250.
`POL1002`: Active, Motor, Standard (only extended), 0 open claims, NZD 0.
`POL9999` and other unseeded IDs: 404 `PolicyNotFound`. IDs use `POL` plus
four digits. API base policy rejects malformed gateway IDs with 400; direct
fixture unknown routes/IDs use 404.

`POL5001` through `POL5004` have valid Home/Elevated policies but deliberately
faulty claims: 503, 3.5s delay, wrong policy ID, and non-JSON respectively.
No client query/header activates failures. The reserved IDs make failures
deterministic without exposing a configurable fault-injection endpoint.
All provider routes are GET-only (others 405). Queries are unsupported (400).

## Gateway surface

Full base `https://<assigned-gateway>/pair-NN/insurance`.
Key header: `Ocp-Apim-Subscription-Key`; never put a key in a URL.

| Method/path | Success |
|---|---|
| GET `/policies/{policyId}` | 200 baseline, later extended policy |
| GET `/policies/{policyId}/overview` | 200 `{policy,claimsSummary}` after module 7 |
| GET `/policies/{policyId}/risk` | challenge only; not in baseline/final core contract |

The policyId in every overview component must match the requested policy.
Claims is a **required dependency**. No partial 200 response is permitted.
The overview allows two sequential two-second waits plus gateway overhead,
with no retries or durable work.

## Gateway errors

| Case | Status / code |
|---|---|
| Matched operation but malformed ID | 400 / InvalidPolicyId |
| Unknown policy | 404 / PolicyNotFound |
| Overview required dependency HTTP failure | 502 / DependencyFailure |
| Overview response null (timeout or transport) | 504 / DependencyTransportFailure |
| Overview fields/IDs invalid | 502 / InvalidDependencyResponse |
| Invalid dependency JSON or other policy/forwarding execution failure | 502 / GatewayFailure |

Workshop errors use:

```json
{"code":"DependencyFailure","message":"Required claims dependency failed.","correlationId":"<generated ID>"}
```

No backend error body, exception, credentials or sensitive payload is exposed.
Missing/invalid subscription is APIM's **401** platform shape with `statusCode`
and `message`, possibly before workshop correlation. Unknown **operation**
is a platform 404, not the workshop's unknown-**policy** error.
Do not assert exact platform message wording.

Successful and workshop error responses include `X-Correlation-Id`; gateway
overwrites client-supplied IDs with its own generated request ID. Direct fixture
tests accept safe alphanumeric/hyphen IDs up to 64 characters, otherwise generate
a UUID. Proxy successes include `X-Lab-Route`; overview `return-response` sets
its own headers and does not promise that routing header.
