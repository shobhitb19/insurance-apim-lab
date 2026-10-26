# Start here

Build a small insurance API facade with **Azure API Management (APIM)** using
fictional providers. Learn to proxy, route, secure, diagnose, expose a
provider-owned extension, and compose two read-only APIs without inventing
an integration platform.

> **Cloud readiness:** The local fixture and documentation have automated checks.
> Portal steps and policy examples must be rehearsed on the selected APIM gateway
> and SKU. This repository does not provision or deploy Azure resources. Local
> success is not evidence that a live Azure gateway can reach the backend.

## What you will build

Postman calls your pair's API on one workshop APIM. The gateway calls a separate
HTTP provider fixture. First it proxies a policy; later it reads an extended
policy and a claims summary to return one policy overview. The provider owns
`riskCategory`; APIM does not manufacture it.

One dedicated workshop service supports six pairs, with separate API suffixes,
products, subscriptions and fixture namespaces. These conventions are **not
strong security boundaries**. Only the facilitator controls global policies,
networking, named values, diagnostics and service configuration.

## Flexible two-day path

Use these budgets to adjust pacing, not as fixed daily hours. Breaks and lunch
are additional. Swap driver/navigator roles between exercises.

| Day | Activity | Suggested budget |
|---|---|---|
| 1 | Facilitated architecture discussion | 90-120 min |
| 1 | [Pair orientation](01-orientation.md) | 20 min |
| 1 | [First provider API](02-first-api.md) | 60 min |
| 1 | [Policies and routing](03-routing.md) | 45 min |
| 1 | [Security baseline and JWT demo](04-security.md) | 35 min |
| 1 | [Diagnostics](05-diagnostics.md) | 40 min |
| 1 | Checkpoint: explain one request end to end | 15 min |
| 2 | Recap and role swap | 15 min |
| 2 | [Provider extension](06-extension.md) | 45 min |
| 2 | [Synchronous composition](07-composition.md) | 60 min |
| 2 | [Revisions and versions](08-lifecycle.md) | 30 min |
| 2 | [Approved-provider mapping discussion](provider-mapping.md) | 60 min |
| 2 | [Independent challenge](09-challenge.md) | 60 min |
| 2 | [Handover and closeout](closeout.md) | 30 min |

Optional [CI/CD and developer portal](stretch.md) topics are outside core timings.
The [facilitator guide](facilitator.md) and [solution](solution.md) are separate
pages; the solution is public teaching material, not a secret assessment.

## Prerequisites

Participants need basic HTTP/JSON/OpenAPI knowledge, a browser, Postman desktop
or an approved desktop agent, and a pre-rehearsed portal account. No mandatory
attendee app registration or OAuth setup. Facilitators need the
[readiness checklist](facilitator.md), Node.js 22+ for the fixture, an approved
reachable backend host, and permission to configure workshop resources.

Use only fictional records and instructor-issued workshop keys. Do not enter
personal data, private contracts or enterprise URLs here. An approved real
provider can be discussed later using a separate private mapping.

## Architecture discussion prompts

Identify client, gateway and provider responsibilities. Follow the request and
trust boundaries. Compare subscription metering with user authentication.
Explain why the gateway should not own provider data or durable workflow.
Describe dependency latency budgets, version ownership, error contracts and
the operational owner for each hop.

Out of scope: AI gateways, MCP, mobile apps, production rollout, durable
orchestration and new integration middleware.

## Reference and assets

The learning structure is inspired by the independent use of
[Azure's APIM guided lab](https://azure.github.io/apim-lab/).
All content here is original and fictional. No Microsoft sponsorship is implied.
Download [baseline OpenAPI](../contracts/import/provider-baseline.json),
[extended OpenAPI](../contracts/import/provider-extended.json),
[claims OpenAPI](../contracts/import/provider-claims.json),
[gateway OpenAPI](../contracts/import/gateway.json),
[Postman collection](../postman/insurance-lab.postman_collection.json) and
[blank environment](../postman/workshop.postman_environment.json).
