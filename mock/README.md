# Synthetic HTTP provider

Run `npm run mock`. Defaults: `HOST=127.0.0.1`, `PORT=7071`. For an approved
network host, configure those environment variables in the host's service
configuration. Binding to `0.0.0.0` exposes a listener; it does not add TLS,
authentication, firewall rules or an Azure route.

This fixture is **not an integration layer**, user data store or production API.
It has no write endpoints, no secrets and no external dependencies. It emits
no request headers or bodies to logs. Restarting resets the process; data is
computed deterministically and never mutated.

| Route (prefix `/pairs/{pairId}`) | Meaning |
|---|---|
| `/baseline/policies/{policyId}` | Provider policy before extension |
| `/extended/policies/{policyId}` | Provider-owned `riskCategory` added |
| `/claims/policies/{policyId}/summary` | Independent read-only claims API |

`pairId` is exactly `pair-01` through `pair-06`. Pair namespaces contain identical
synthetic data and are organizational conventions, **not security isolation**.
Unknown namespaces return 404. All routes accept GET only. Query parameters
are rejected with 400. `/health` returns `{"status":"ok"}`.

| ID | Policy product / extended risk | Claims behavior |
|---|---|---|
| POL1001 | Home / Elevated | 200, 1 open claim, NZD 1250 |
| POL1002 | Motor / Standard | 200, 0 open claims, NZD 0 |
| POL5001 | Home / Elevated | 503 explicit dependency failure |
| POL5002 | Home / Elevated | 200 after 3.5s; exceeds gateway's 2s dependency timeout |
| POL5003 | Home / Elevated | 200 for the wrong policy (POL1002); gateway must reject |
| POL5004 | Home / Elevated | 200 non-JSON; gateway must reject |
| Any other ID | 404 | 404 |

Failure routes deliberately violate the normal claims contract to test the
gateway. Do not publish these as real provider behaviors. There is no composition
endpoint on the mock: composition belongs to the APIM exercise, making its
two backend HTTP calls observable in a facilitator trace.

All responses include `X-Correlation-Id`. Safe incoming values match
`[A-Za-z0-9-]{1,64}`; other values are replaced with a UUID.
Errors use `{code, message, correlationId}`. See the
[HTTP contract](../docs/contracts.md) for gateway error semantics.
