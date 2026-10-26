# 2. Proxy your first API

**Objective:** expose an existing HTTP provider without changing its data.
**Duration:** 60 minutes. **Prerequisites:** module 1; approved gateway-reachable
fixture; facilitator available for privileged resource/product operations.

> These portal steps require rehearsal on the chosen APIM gateway. No automated
> local test imports an API into Azure.

## Steps

1. Download [baseline OpenAPI](../contracts/import/provider-baseline.json).
   In APIM > APIs > **Add API > OpenAPI**, choose file upload. Do not upload
   the root document with external schema references.
2. Set display name and API ID `pair-NN-insurance`; set API URL suffix
   `pair-NN/insurance` for your allocation. Do not accept another pair's
   defaults. Leave versioning off initially.
3. Set the web service URL to the approved HTTPS fixture root plus
   `/pairs/pair-NN/baseline`. Replace the imported `127.0.0.1` URL. Keep
   `/policies/{policyId}` as the operation path; do not duplicate the base path.
4. In the API settings, require a subscription. Ask the facilitator to associate
   only this API with `pair-NN-product` and activate your product-scoped
   subscription. Do not use an all-APIs or admin subscription.
5. Save. Select **GET /policies/{policyId}** and inspect the frontend operation.
   Confirm the backend URL shown by the portal. Do not add mock-response.
6. In Postman, run **Gateway baseline > Baseline proxy** with your assigned key
   header `Ocp-Apim-Subscription-Key`. Call `/policies/POL1001`.
7. Run **Unknown policy** (`POL9999`). Run **Missing subscription key** separately;
   do not rely on a portal test console that might attach a key automatically.
8. With the facilitator, confirm a request actually reached the separate HTTP
   backend (safe status/operation metadata only). Explain which path segment
   belongs to the API suffix and which to the provider namespace.

## Expected results and tests

Positive: **200**, exactly the same baseline body as the provider:

```json
{"policyId":"POL1001","status":"Active","product":"Home"}
```

Negative: `POL9999` returns **404** `PolicyNotFound` with a correlated provider
error. Missing key returns APIM's built-in **401** JSON containing
`statusCode:401` and a message; no workshop correlation guarantee exists before
policies run. Risk category must still be absent. Gateway **Invalid ID** is not
expected to return 400 until module 3 installs validation.

## Troubleshooting

A backend connection error often means a local URL survived import, TLS/DNS
is wrong, or gateway egress is blocked. Test from the gateway, not just a laptop.
404 for every ID can indicate a duplicated `/pairs/...` prefix or missing API
suffix. 401 with a key means wrong/disabled subscription, product association or
API subscription setting; never paste keys into chat for troubleshooting.

## Checkpoint

Show gateway 200/404/401, identify the unmodified provider body, and explain why
a key is not a user's identity. Continue to [policies and routing](03-routing.md).
