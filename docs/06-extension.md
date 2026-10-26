# 6. Expose a provider-owned extension

**Objective:** expose an attribute supplied by a changed backend contract,
not fabricate it in a gateway policy. **Duration:** 45 minutes.
**Prerequisites:** module 5; baseline working; facilitator can change the
pair's approved stage named value.

## Steps

1. Run the direct **Provider > Baseline policy** and **Extended policy** requests.
   Compare the bodies. The only difference for `POL1001` is
   `"riskCategory":"Elevated"`. Confirm both calls go to the distinct HTTP
   backend, at `/baseline` and `/extended` respectively.
2. Download [extended provider contract](../contracts/import/provider-extended.json).
   Compare its 200 schema with the baseline; discuss compatibility, ownership
   and how a real provider would approve/expose such an attribute. This fixture
   is not a contract for any commercial product.
3. Ask the facilitator to set **your pair's**
   `pair-NN-fixture-stage` named value from `baseline` to `extended`. Leave
   `pair-NN-backend-url` unchanged. Do not change service-wide policies.
4. Refresh the API's documented response schema. In APIM APIs select your
   API > **... > Import** (update an existing API, not Add API), upload the
   extended provider file and retain the existing API ID/suffix and product
   association. If that portal/SKU does not support this update flow, use
   Design > GET policy > Frontend to replace the 200 response definition with
   the extended schema under facilitator supervision.
5. After any import, re-check subscription requirement, operation path, API
   policy and web service URL. Set the approved extended fixture URL if import
   reset it to the local server URL. Reapply your pair-adjusted `api-base.xml`
   if the import changed policies; never assume import preserves every setting.
6. Run **Gateway extended > Extended proxy** and **Second extended policy**.
   Run **Gateway baseline > Unknown policy** as the negative regression test.
   Stop running the old baseline success assertion now; its exact body is
   intentionally different.
7. Read the API policy: there must be no `set-body` or expression that inserts
   `riskCategory` into a successful policy response. Error-body construction is
   unrelated to provider extension.

## Expected results and tests

Positive: **200**, `X-Lab-Route: extended`:

```json
{"policyId":"POL1001","status":"Active","product":"Home","riskCategory":"Elevated"}
```

`POL1002` is **200**, product `Motor`, risk `Standard`. Direct baseline still
has no risk field, proving the fixture distinction is real.
Negative: `POL9999` remains **404** `PolicyNotFound`; missing key remains **401**.

## Troubleshooting

No risk field means the stage or backend URL still points at baseline, a named
value has not propagated yet, or you called the old API suffix/revision.
A local-server error after import means the approved backend URL was overwritten.
Do not "fix" either by injecting a hardcoded risk value at APIM.

## Checkpoint

Demonstrate baseline absent / direct extended present / gateway extended present,
and describe how an approved real backend extension would be tested separately.
Continue to [composition](07-composition.md).
