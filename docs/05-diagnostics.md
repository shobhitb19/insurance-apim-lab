# 5. Safe diagnostics

**Objective:** correlate a client request to gateway/backend behavior without
logging credentials or sensitive bodies. **Duration:** 40 minutes.
**Prerequisites:** module 4; safe facilitator-configured diagnostics and access
to an approved trace or monitoring view.

## Steps

1. Ask the facilitator to confirm body logging is zero bytes and sensitive
   headers/query data are excluded at every inherited logging scope. Do not
   enable full payload capture as a troubleshooting shortcut.
2. Run **Gateway baseline > Baseline proxy**. Copy only its generated
   `X-Correlation-Id`, status and approximate timestamp into your local notes.
3. Under facilitator supervision, use APIM's current **Test/Trace** experience
   for this operation, or the approved diagnostic view. Trace access/authorization
   differs by gateway and portal version; use the method rehearsed for this
   service, not an old subscription-key tracing header.
4. Locate the generated correlation header in the outbound backend request.
   Confirm the backend is the approved `/pairs/pair-NN/baseline` path and that
   no `Ocp-Apim-Subscription-Key` or `Authorization` reaches it. Do not capture
   or export frontend credential headers from an otherwise authorized trace.
5. Run **Unknown policy** and **Invalid ID**. Compare statuses and backend
   activity: unknown policy reaches the backend; invalid ID is rejected before
   any backend call. Missing-key requests may be rejected before custom
   correlation exists.
6. Inspect only operation, time, status, duration and generated ID in monitoring.
   If a dashboard does not expose the custom header as a searchable field, use
   the supervised request trace; do not invent a KQL field or enable payload
   logging to make a query work.
7. Delete transient traces and notes according to the workshop retention rule.
   Share no raw traces, screenshots with credentials or private endpoint data.

## Expected results and tests

Positive: **200** baseline body, matching generated response/backend correlation
ID, and one provider HTTP call. Negative: **400** `InvalidPolicyId` with a
correlation ID and **no backend call**. `POL9999` is **404** `PolicyNotFound`
after one backend call.

The error shape is `{code,message,correlationId}` for workshop policy/provider
errors. The client header and body error correlation must agree.

## Troubleshooting

No diagnostic view can mean insufficient permission, disabled diagnostics or
ingestion delay; ask the facilitator rather than changing global settings.
Different IDs across requests are expected: each gateway request gets its own
ID. If a credential appears in a trace/export, stop sharing, report it privately,
rotate the affected credential and fix capture settings.

## Checkpoint

Explain exactly where the 400 and 404 originate. Show only safe request metadata.
Day 1 checkpoint: narrate client -> gateway -> provider -> response and identify
each owner. On Day 2 recap, swap roles and continue to
[provider extension](06-extension.md).
