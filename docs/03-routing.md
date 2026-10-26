# 3. Policies and controlled routing

**Objective:** apply safe headers, input validation and facilitator-approved
backend routing without changing provider data. **Duration:** 45 minutes.
**Prerequisites:** module 2; the three named values provisioned for your pair.

## Steps

1. Download [API base policy](../policies/api-base.xml). Replace every `pair-01`
   token with your own pair ID, including named value names.
2. In APIM > APIs > your API > **All operations**, open the inbound policy
   code editor. Review inherited/global policies with the facilitator.
   Replace the API policy document with your adjusted file; retain all
   `<base />` elements. Save. A save/compile failure must be resolved before
   testing; this example is not a tested deployment to your service.
3. Read the policy: it generates a gateway correlation ID, strips the subscriber
   key and Authorization before forwarding, rejects malformed IDs, and sets
   the backend from pair-scoped named values. The stage remains `baseline`.
4. Run **Baseline proxy**, **Unknown policy** and **Invalid ID** from the gateway
   baseline folder. Inspect only the safe response headers, not request keys.
5. Add a client header `X-Correlation-Id: participant-input` and resend.
   The gateway replaces it with its own request ID. Do not treat untrusted
   client IDs as authoritative identity or log labels.
6. Add `X-Backend-Url: https://not-a-backend.example.invalid` to a copy of the
   baseline request. Resend; it must not affect routing. Remove the header.
   No policy reads arbitrary client URLs.
7. Compare the response body with module 2. The controlled transformation is
   metadata only: `X-Lab-Route: baseline`, correlation and no-store headers;
   the provider record remains unchanged.

## Expected results and tests

Positive: **200** with
`{"policyId":"POL1001","status":"Active","product":"Home"}`,
`X-Lab-Route: baseline`, `Cache-Control: no-store`, and generated
`X-Correlation-Id`. The provider receives no subscriber key or bearer token.

Negative: `/policies/INVALID` returns **400**:

```json
{"code":"InvalidPolicyId","message":"Use POL followed by four digits.","correlationId":"<generated request ID>"}
```

`POL9999` still returns **404** `PolicyNotFound`. An arbitrary backend header
does not change the successful response. Never test routing with real enterprise
or third-party URLs.

## Troubleshooting

Unresolved named values mean missing names or a pair-token mismatch; ask the
facilitator rather than changing a shared value. Portal save errors often mean
XML escaping was lost; upload/copy the original file, not rendered Markdown.
Malformed-ID 404 instead of 400 can mean the policy was pasted at the wrong
scope or the operation did not match.

## Checkpoint

Show the generated correlation ID, unchanged data and explicit 400.
Identify the allowlisted route and explain why a request header cannot select
an arbitrary backend. Continue to [security](04-security.md).
