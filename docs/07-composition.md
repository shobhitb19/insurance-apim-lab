# 7. Compose two read-only APIs

**Objective:** synchronously aggregate a policy and its matching claims summary
with bounded latency and explicit failure semantics. **Duration:** 60 minutes.
**Prerequisites:** module 6; extended policy working; claims fixture reachable;
API base policy installed; facilitator rehearsed operation policy.

## Steps

1. Inspect [claims OpenAPI](../contracts/import/provider-claims.json) and run
   **Provider > Claims for second policy**. Its zero counts are valid data,
   not a failure fallback.
2. Review [final gateway contract](../contracts/import/gateway.json) as the target.
   In your existing API choose **Add operation**: display name
   `Get policy overview`, operation ID `getPolicyOverview`, method `GET`,
   URL `/policies/{policyId}/overview`. Add the `policyId` template parameter
   if the portal does not create it automatically.
3. Download [overview operation policy](../policies/overview.xml), replace every
   `pair-01` token with your pair ID. Paste the full policy document at the
   **new operation only**. Leave API-level `api-base.xml` in place. Save.
4. Read the flow before testing: inherit API validation/correlation; call
   extended policy with 2s timeout; handle policy 404/failure; call matching
   claims with 2s timeout; reject failures/mismatched records/invalid fields;
   return one object. Two sequential read calls, no writes, no retries.
5. In Frontend responses document 200 with the gateway `Overview` schema and
   400/404/502/504 with `{code,message,correlationId}`; document 401 as the
   built-in APIM shape. The imported target contract can be used by the
   facilitator to refresh the existing API documentation after rehearsal;
   recheck policies and backend settings after any import.
6. Set Postman's request timeout above 5 seconds. Run the entire
   **Gateway composition** folder: first and second policies, unknown policy,
   failed claims, timed out claims, mismatched claims and malformed JSON.
7. Inspect a supervised safe trace for success. There are two distinct HTTP
   backend requests and both policy IDs equal the client ID. An unknown policy
   stops before claims. No client subscription key is sent on either dependency.
8. Repeat with driver/navigator swapped. Explain why a four-second dependency
   budget (plus overhead) is unsuitable for a long-running business workflow.

## Expected results and tests

Positive: `POL1001` -> **200**:

```json
{
  "policy":{"policyId":"POL1001","status":"Active","product":"Home","riskCategory":"Elevated"},
  "claimsSummary":{"policyId":"POL1001","openClaimCount":1,"totalIncurred":1250,"currency":"NZD"}
}
```

`POL1002` -> **200**, `Motor/Standard`, both IDs `POL1002`, zero open claims
and zero incurred. Do not accidentally attach `POL1001`'s claims to it.

| Negative test ID | Status | Body `code` | Meaning |
|---|---|---|---|
| POL9999 | 404 | PolicyNotFound | Required policy absent; do not call claims |
| POL5001 | 502 | DependencyFailure | Claims returned 503 |
| POL5002 | 504 | DependencyTransportFailure | Claims exceeds 2s; no successful fallback |
| POL5003 | 502 | InvalidDependencyResponse | Claims belongs to another policy |
| POL5004 | 502 | GatewayFailure | Claims is not parseable JSON |

Every workshop error includes a generic `message`, `correlationId` and matching
header; it must not return partial `policy`/`claimsSummary`. `ignore-error=true`
only enables explicit null handling: 504 covers timeout **or** transport failure.
The null response cannot identify the exact cause. Successful overview
sets correlation/no-store itself because `return-response` skips outbound policy.

## Troubleshooting

Save errors mean policy syntax/engine compatibility must be fixed before this
module is ready. 404 for the overview route can mean wrong operation URL/method.
502 on every policy can mean a baseline URL, mismatched pair token or invalid
JSON/contract. 504 on both dependencies means gateway DNS/TLS/network readiness
has regressed. Never replace an error with empty claims or call back through
the same gateway to hide a connectivity problem.

## Checkpoint

Show the two successful bodies and all five negative results with no partial
successes. Explain latency bounds, correlation, policy-ID matching and when a
proper backend service (not APIM) should own more complex aggregation.
Continue to [revisions and versions](08-lifecycle.md).
