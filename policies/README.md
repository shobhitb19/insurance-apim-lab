# APIM policy examples

These are policy-engine examples, not a locally runnable gateway. XML syntax
checks are not an Azure policy compilation test. Rehearse save and execution
on the actual gateway/SKU before participants arrive.

`api-base.xml` replaces the **API / All operations** policy document for
`pair-01-insurance`. `overview.xml` replaces the **GET overview operation**
policy document only. Both retain `<base />` inheritance. Inspect inherited
global/product policies first with the facilitator: participants must not
override service-wide configuration. `jwt-demo.xml` is a fragment for a separate
facilitator demo API only.

For pair 02 through 06 replace **every** `pair-01` token in both full documents
with the assigned pair ID before pasting. Do not change another pair's named values.

| Named value | Example (not a real deployment) |
|---|---|
| `pair-01-backend-url` | `https://fixture.example.invalid` (root, no trailing slash) |
| `pair-01-id` | `pair-01` |
| `pair-01-fixture-stage` | `baseline`, later `extended` |

The backend must be a distinct, approved HTTPS HTTP host reachable from the
gateway. The base policy appends `/pairs/{pairId}/{stage}`; the imported operation
adds `/policies/{policyId}`. The overview uses explicit provider URLs so it can
compose extended policy and claims without calling itself or using a shared
gateway subscription. Do not send the attendee's key or bearer token downstream.

`ignore-error="true"` is used only to let the immediately following branch
handle a null `send-request` response as **504**. It is not a successful fallback:
both dependencies are required. Each call has a two-second timeout and there are
no retries. Calls are sequential (at most about four seconds of dependency wait,
plus gateway overhead); this is bounded read aggregation, not orchestration.
Transport failures and timeouts share the documented 504 contract because a
null response does not distinguish them. A response with non-200 status is 502
(policy 404 is preserved). Invalid JSON reaches the inherited explicit 502
`GatewayFailure` handler. No dependency body or exception is returned to clients.

APIM `return-response` bypasses outbound policies. The overview therefore sets
its own success/error Content-Type and correlation headers. It does not promise
the proxy's `X-Lab-Route` header. Authentication errors may occur before these
policies and use APIM's built-in error shape.
