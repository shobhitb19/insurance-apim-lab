# Approved-provider mapping discussion

**Duration:** 60 minutes. This is a generic readiness checklist, not live
integration instructions. Keep any customer/provider-specific material in a
separate access-controlled companion, never in this public repo, history or site.

## Mapping checklist

1. Identify approved non-production API owners, actual contracts and permission
   to use them. Do not infer a vendor API from these fictional policy names.
2. Establish network/DNS/TLS reachability from the chosen APIM gateway, service
   identity/authentication, authorization and secret-management ownership.
   Do not carry a participant key into the provider's trust domain.
3. Map policy identifiers, request paths and field semantics. Verify that any
   extension is **provider-owned**, supported and actually served by that
   provider version. An APIM-injected field is not a backend extension.
4. Validate policy-to-claims linkage using non-sensitive approved test records.
   Confirm units/currency, null semantics, not-found behavior, required vs
   optional dependencies and error schemas.
5. Agree timeout/retry/circuit-breaker budgets, rate limits and partial-failure
   behavior. Reassess whether composition belongs in a backend service once it
   exceeds simple bounded read aggregation.
6. Approve telemetry allowlists, payload exclusions, retention and restricted
   access. Prove correlation without exposing data or credentials.
7. Define deployment/change review, compatibility/versioning, rollback,
   support ownership and a repeatable private acceptance matrix.

## Exit criteria

An approved mapping has an accountable owner for each item and evidence from a
separate non-production integration test. If access/contracts are unavailable,
record the gaps privately and retain the mock-backed path. Completion of this
lab does not establish production readiness or a live provider integration.
