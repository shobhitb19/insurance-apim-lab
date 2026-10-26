# 9. Independent challenge

**Objective:** demonstrate independent contract reasoning, safe policy changes
and regression testing rather than copying a new feature. **Duration:** 60
minutes. **Prerequisites:** modules 1-8 complete, extended fixture and overview
working. Facilitator solution is on a separate page; do not read it first.

## Assignment

An API consumer needs a compact risk result for an existing policy. Add
`GET /policies/{policyId}/risk` to your pair API. Its successful body must be:

```json
{"policyId":"POL1001","riskCategory":"Elevated"}
```

The value must come from the **extended provider**, not an APIM lookup table.
No claims call is needed. Keep existing proxy and overview behavior intact.

## Steps

1. Write the success schema and error matrix in your local scratch notes.
   Decide which existing API-scope controls should be inherited.
2. Create a **non-current revision** and add the GET risk operation there.
   Do not change the provider fixture or another pair.
3. Use the existing provider contract and policy techniques to fetch the
   extended policy and project only the two specified fields.
4. Return explicit errors for a missing policy, invalid ID and an unavailable
   dependency. Retain generated correlation, key stripping and no-store.
   Do not return risk defaults, nulls or empty successful objects.
5. Create local Postman requests with assertions for `POL1001`, `POL1002`,
   `POL9999`, malformed ID and missing key. For dependency failure, ask the
   facilitator to temporarily point **your candidate revision's operation**
   at an approved unreachable test destination in a supervised test; do not
   break a shared named value or shut down a shared fixture.
6. Demonstrate the candidate using its revision URL; run proxy and overview
   regression tests. Leave it non-current until facilitator review.

## Expected results and tests

Positive: **200**, exactly `{"policyId":"POL1001","riskCategory":"Elevated"}`;
second policy **200**, exactly `{"policyId":"POL1002","riskCategory":"Standard"}`.
No claims summary, product or status fields appear.
Negative: unknown **404** `PolicyNotFound`; malformed ID **400**
`InvalidPolicyId`; missing key **401** platform shape; dependency failure **502**
or **504** as explicitly documented by your chosen policy path, never 200.

The existing overview failure matrix must still pass. State which negative
case was actually executed; if a safe unreachable destination is unavailable,
mark that case unexecuted rather than altering shared infrastructure.

## Troubleshooting and checkpoint

If you are stuck, identify the failing scope (frontend match, inherited policy,
backend reachability or projection) before asking the facilitator. Do not inject
a risk value to make a test green. Checkpoint: explain data ownership, show the
two exact success bodies and negative tests, and justify the chosen error status.
Then compare with the separate [facilitator solution](solution.md).
