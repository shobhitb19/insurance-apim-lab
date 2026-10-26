# Closeout, reset and cleanup

**Objective:** leave a safe workshop state and capture learning without sensitive
artifacts. **Duration:** 30 minutes. **Prerequisites:** challenge reviewed;
facilitator owns shared cleanup and retention decisions.

## Participant handover

1. Demonstrate proxy, extension and matching overview, plus 401, 404, dependency
   502, timeout 504 and mismatch rejection. State any unexecuted Azure steps.
2. Explain subscription keys vs identity, provider ownership vs transformation,
   bounded read aggregation vs orchestration, and revisions vs versions.
3. Remove local secret/current values and tokens from Postman, clipboard and
   scratch notes. Never export a populated environment. Clear approved transient
   traces/screenshots per retention policy.
4. Close the local fixture terminal with Ctrl+C if you started one. No provider
   data needs deleting: it was synthetic and in-memory/deterministic.

## Facilitator reset for another cohort

1. Confirm resource ownership before any mutation. On each **workshop pair API
   only**, restore the baseline API/operation definition, remove overview/risk
   operations and extra rehearsal revisions/versions after approval.
2. Restore the pair's `fixture-stage` to `baseline`, backend to the approved
   host, and the known base policy. Recheck subscription requirement and
   pair-only product association.
3. Rotate/revoke old pair subscription keys and distribute new values securely.
   Review attendee RBAC; remove access no longer needed.
4. Re-run baseline 200/404/401, and rehearse extension/composition separately
   before the next cohort. No fixture reset API is needed.

## Final teardown

Only the facilitator may remove resources. Follow the approved resource
inventory and hosting owner's process; do not run broad resource-group deletion
against a subscription with unrelated assets. Revoke temporary hosting routes,
credentials, RBAC and demo identity grants; stop the fixture hosting service;
apply trace/log retention and confirm workshop resource costs have stopped.
Do not assume stopping a local process removes cloud-hosted resources.

This repository executes no cloud teardown command. Keep actual resource IDs,
cost records and environment cleanup evidence private.
