# Facilitator challenge solution

**Instructor reference.** Review the [challenge](09-challenge.md) before opening
this page with participants. This is a teaching solution, not a hidden test key.

## Reference implementation

1. In a non-current revision add `GET /policies/{policyId}/risk`, operation ID
   `getPolicyRisk`. Keep the API base policy and subscription requirement.
2. Download [risk solution policy](../policies/risk-solution.xml), replace every
   pair token, and install it at the **risk operation** only.
3. The operation pins the approved extended backend and rewrites the provider
   path to `/policies/{policyId}` without forwarding arbitrary query parameters.
   It does one genuine provider HTTP call using the inherited backend pipeline.
4. On 200 it checks the requested ID and risk enum, then projects only policyId
   and riskCategory. Invalid content throws explicitly into the API-scope
   `GatewayFailure` handler (502), rather than returning a successful default.
   Provider 404 is preserved. Other provider statuses become explicit 502.
5. Transport errors follow the inherited 502 `GatewayFailure` path. Unlike the
   overview's explicit two-second `send-request` budget, this exercise uses the
   inherited forwarding timeout. Ask the participant to identify and document
   that difference; do not claim this solution has overview's timing behavior.

## Acceptance review

`POL1001` -> 200 `{"policyId":"POL1001","riskCategory":"Elevated"}`.
`POL1002` -> 200 `{"policyId":"POL1002","riskCategory":"Standard"}`.
`POL9999` -> 404 `PolicyNotFound`; invalid ID -> 400 `InvalidPolicyId`;
missing key -> 401 APIM shape. A privately supervised unreachable backend ->
502 `GatewayFailure`, not a successful risk result. Invalid provider ID/risk or
malformed JSON -> 502. API base outbound policies add correlation and no-store.

Check that no hardcoded risk mapping exists, secrets are not forwarded, the
change is operation-scoped, and proxy/overview regression cases still pass.
Do not make the revision current until reviewed; restore the candidate's
approved backend after any supervised fault test.

Local repository checks validate the supplied fixture, contracts and XML syntax,
**not execution of this policy in Azure**. Rehearse this solution before delivery.
