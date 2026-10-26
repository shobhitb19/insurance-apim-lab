# Facilitator readiness

**Audience:** instructor. Complete before participants arrive. Infrastructure is
pre-provisioned; this guide deliberately does not pick a cloud SKU, create a
resource or execute a deployment. Reserve enough rehearsal time to resolve
policy, networking, cost and RBAC issues before offering the workshop.

## Readiness gates

1. Use an approved dedicated non-production subscription/resource group and one
   workshop APIM. Agree its SKU/gateway type, owner, budget, region, retention,
   allowed ingress/egress and teardown responsibility. Check current feature
   availability for revisions, versions, diagnostics, JWT and any stretch topic.
   Never treat a development tier as production. No SKU is assumed here.
2. Start the fixture locally with `npm ci`, `npm run check`, `npm run mock`.
   Verify `/health`, both policies and the claims failure IDs. Do not substitute
   APIM mock-response policies: the gateway must make real backend HTTP calls.
3. Arrange an **approved distinct HTTPS backend host** for the fixture, with valid
   TLS, gateway-reachable DNS and network path. Options include an existing
   workshop compute host or an organization-approved temporary endpoint. Hosting
   is an external prerequisite, not provisioned by this repo. Review
   authentication/firewall restrictions and service lifetime. The fixture has
   no built-in authentication; expose only synthetic data, restrict access where
   practical, and remove access after the workshop. No backend secret belongs in
   a policy URL or public named value.
4. Configure that host to run `node mock/server.mjs`, with its platform's `PORT`
   and `HOST` settings. Provide HTTPS termination, health checks, lifecycle and
   logging controls using the approved host. Do not log credentials or bodies.
   The Azure gateway **cannot** call `127.0.0.1`, `localhost` or
   `host.docker.internal` on a participant machine. Do not disable TLS verification.
5. Verify from **APIM's actual gateway path**, not only your laptop, that the
   fixture's `/pairs/pair-01/baseline/policies/POL1001` returns 200. A successful
   laptop curl is insufficient. Rehearse both policy imports and every gateway
   Postman folder, including the 504 and malformed-data cases.
6. Prepare six pair allocations using the table below. Use secret distribution
   rather than a public roster. Participant permissions must be approved and
   rehearsed with a representative non-admin identity. Broad APIM Service
   Contributor access can expose other APIs and keys; do not promise pair
   isolation based on names, products or subscriptions. If safe API-scoped
   management access is unavailable, use facilitator-assisted portal changes
   rather than granting broad access. Check whether import, revision/version
   creation and product association require facilitator action.
7. Disable body logging and sensitive header capture before testing. Use zero
   request/response body bytes, no Authorization/subscription-key headers, and
   exclude query strings containing credentials. Review inherited/global logging
   and tracing policies. Use only allowlisted metadata: operation, timestamp,
   duration, status and generated correlation ID. Rehearse trace access, retention
   and deletion with the chosen monitoring setup.
8. Confirm no inherited policy changes the lab response or opens anonymous API
   access. Use a pair-specific product-scoped subscription with approval
   requirements as appropriate; require subscriptions on each participant API.
   Avoid all-APIs or built-in service subscriptions for attendees.
9. Rehearse the separate [JWT demonstration](04-security.md) with an instructor
   identity, approved tenant and non-sensitive demo tokens. If unavailable,
   discuss validation with a clearly labeled non-executed walkthrough; do not
   imply an identity integration was completed.
10. Record rehearsal date, gateway/SKU, runtime, observed status matrix and
    readiness owner in a **private** delivery record. Do not place actual
    tenant IDs, endpoint URLs, keys or traces in this public repository.

## Pair allocation

For each `NN` from `01` to `06`, reserve:

| Resource | Naming / value |
|---|---|
| API ID and display name | `pair-NN-insurance` |
| API URL suffix | `pair-NN/insurance` |
| Product ID | `pair-NN-product` |
| Product subscription | `pair-NN-subscription` (unique key) |
| Provider namespace | `/pairs/pair-NN` |
| Named value `pair-NN-backend-url` | approved HTTPS root, no trailing slash |
| Named value `pair-NN-id` | `pair-NN` |
| Named value `pair-NN-fixture-stage` | `baseline`, later `extended` |

Do not create a backend named value with a query token. Reserve demo values
`demo-openid-configuration-url`, `demo-audience`, `demo-issuer` privately if
showing JWT. Participant API and product creation can be done just in time by
the instructor during module 2; pair resource ownership must already be clear.

## Portal setup rehearsal

1. Open APIM > APIs > **Add API > OpenAPI**, choose file upload, and select the
   self-contained baseline JSON from `contracts/import`. Set the pair API ID,
   name and suffix explicitly. Set the web service URL to the approved fixture
   root plus `/pairs/pair-NN/baseline`, not the imported local server URL.
2. Require a subscription. Create or select the pair's product, add only that
   pair API, publish the product as appropriate for the attendee experience,
   and create an active product-scoped subscription.
3. Create the three pair named values. Rehearse `api-base.xml` on All operations,
   replacing every pair token for the assigned pair. Confirm 200 and 404 with
   a valid key, and 401 without one. Check no key reaches backend logs.
4. Switch stage to `extended`, add `GET /policies/{policyId}/overview`, and save
   `overview.xml` at that operation only. Verify its complete status/body matrix.
   Save/compile failures block readiness; XML parsing alone does not clear them.
5. Reset participant APIs to baseline, remove overview and rehearsal revisions,
   and set stage back to `baseline`. Keep only approved pair allocations.

## Go / no-go

Proceed only when all pairs can execute the baseline positive/negative tests,
permissions prevent unintended cross-pair changes (or facilitator-assisted
editing is in place), diagnostics are safe, and the extension/composition
matrix has been rehearsed. A blocked gateway path permits **local contract
learning only**, not a claim that the APIM workshop was delivered end to end.

Current Microsoft references:
[Import OpenAPI](https://learn.microsoft.com/azure/api-management/import-api-from-oas),
[policy reference](https://learn.microsoft.com/azure/api-management/api-management-policies),
[RBAC](https://learn.microsoft.com/azure/api-management/api-management-role-based-access-control),
[subscriptions](https://learn.microsoft.com/azure/api-management/api-management-subscriptions),
[send-request](https://learn.microsoft.com/azure/api-management/send-request-policy).
