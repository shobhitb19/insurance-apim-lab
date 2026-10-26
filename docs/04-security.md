# 4. Security baseline and JWT demonstration

**Objective:** distinguish subscription access from identity and authorization.
**Duration:** 35 minutes. **Prerequisites:** module 3; pair product-scoped key.
The optional live JWT segment needs a separate instructor-prepared demo API and
an approved identity configuration, not attendee app registrations.

## Participant steps

1. Open your API settings with the facilitator and verify **Subscription
   required**. Identify the pair product and active product-scoped subscription.
   Do not open or copy other pairs' keys.
2. Run **Gateway baseline > Baseline proxy** with your local secret variable.
   Then run **Missing subscription key** and **Invalid subscription key**.
3. Observe that a valid key allows a request without knowing which person is
   using it. It is a subscription credential, not user authentication or
   production authorization. Pair names and products are not tenant isolation.
4. Review `api-base.xml` and confirm the key, query-key and Authorization
   header are removed before forwarding. Never put a key in a URL.
5. Agree how to report an exposed key to the facilitator. Rotate only the
   assigned subscription under supervision; do not revoke other pairs.

## Facilitator OAuth/JWT demo

1. Use a separate rehearsal API. Privately configure an approved OAuth client
   and resource API, issuer, audience and `Workshop.Reader` application role.
   Assign the role only to the authorized demonstration identity. The exact
   tenant/client provisioning is outside this public lab.
2. Create named values `demo-openid-configuration-url`, `demo-audience`,
   `demo-issuer` with the rehearsed metadata. Use the issuer and metadata
   appropriate to the token version. Keep client secrets and live tokens out of
   named values, screenshots and this repository.
3. Insert [JWT fragment](../policies/jwt-demo.xml) immediately after
   `inbound/base` **before** the API base policy deletes Authorization.
   Retain subscription requirement as well for this demo.
4. Acquire a short-lived access token using the approved client flow. Do not use
   an ID token as an API access token. Send a valid subscription key plus
   `Authorization: Bearer <access token>` privately. Expect **200** and the
   baseline policy body.
5. Remove the bearer token: expect **401**. Try an expired or wrong-audience
   token, then an otherwise valid token without the required application role:
   expect **401** under this example's deliberately combined validation policy.
   Do not show token contents to the audience or log them.
6. Explain signature, expiry, issuer, audience and required-claim checks.
   A production design may distinguish 401 authentication failures from 403
   authorization failures, and requires an explicit authorization model.

If the identity prerequisites are not available, label this section
**walkthrough only, not executed**. Do not alter participant APIs to skip key
validation or pretend a live identity integration exists.

## Expected results and tests

Positive: pair key -> **200**
`{"policyId":"POL1001","status":"Active","product":"Home"}`.
Negative: absent/invalid key -> **401**, built-in APIM JSON
`{"statusCode":401,"message":"<platform message>"}`. Platform message wording can
vary; workshop error-body shape and correlation are not promised here.
The facilitator's JWT tests are separate from these baseline collection tests.

## Troubleshooting

A portal test console can auto-supply a key; use the explicit Postman negative
requests. JWT 401 can mean wrong token type/version, role, metadata reachability,
issuer/audience or policy order. Inspect only safe validation metadata with the
instructor; never paste a token into public decoders or issue comments.

## Checkpoint

Show baseline 200/401 and explain two missing production controls that subscription
keys alone cannot provide. Continue to [diagnostics](05-diagnostics.md).
