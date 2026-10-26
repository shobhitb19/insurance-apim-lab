# 1. Pair orientation

**Objective:** identify your resources, validate the client setup and explain the
two network hops. **Duration:** 20 minutes. **Prerequisites:** facilitator
readiness gates passed; browser/Postman; assigned pair and workshop key.

## Steps

1. Agree driver/navigator roles. Privately record your pair ID, API name/suffix,
   product name and approved gateway URL. Check that you are using the dedicated
   workshop service, not an enterprise service.
2. Open the Azure portal and find the assigned APIM > APIs. Read the API names;
   do not change another pair or service-wide settings. If the API has not been
   imported yet, module 2 creates it with the facilitator.
3. Import the [Postman collection](../postman/insurance-lab.postman_collection.json)
   and [environment template](../postman/workshop.postman_environment.json).
   Select the environment. Set `pairId`; put your key only in a local/current
   secret value or Vault. Set `gatewayBaseUrl` to the **full** assigned gateway
   URL including `/pair-NN/insurance`, with no trailing slash.
4. If running the fixture on your machine, use `npm run mock` and keep
   `fixtureBaseUrl=http://127.0.0.1:7071`. Otherwise use the approved fixture
   root supplied by the instructor. This variable is for **direct provider**
   tests, not the gateway backend configuration.
5. Run **Provider > Baseline policy** and **Unknown policy**. If local provider
   access is not part of your workstation setup, the facilitator demonstrates
   both tests against the approved fixture host.
6. Draw the two hops on paper: Postman -> APIM -> provider. Identify the
   subscription-key boundary and who owns provider data. Never publish a drawing
   with real endpoints or keys.

## Expected results and tests

Positive: baseline is **200**:

```json
{"policyId":"POL1001","status":"Active","product":"Home"}
```

Negative: `POL9999` is **404**, with `code=PolicyNotFound`, a message and
`correlationId`. This demonstrates the provider only; no gateway subscription
is required yet. Both include `X-Correlation-Id`.

## Troubleshooting

Connection refused means the fixture is not listening at that host/port.
Unresolved `{{variables}}` means no environment was selected or a name differs.
A public host may require the approved network route; do not bypass restrictions
with an unapproved tunnel. Missing portal permissions go to the facilitator.

## Checkpoint

Show the positive and negative provider result. Name your pair API, who can
change global configuration, and why a namespace is not a security boundary.
Continue to [first API](02-first-api.md).
