# Optional lifecycle and portal topics

These are **stretch modules**, not core prerequisites. Use spare time only after
all core positive and negative checkpoints pass.

## CI/CD discussion and local rehearsal (30-45 minutes)

**Objective:** separate documentation automation from gateway deployment.
**Prerequisites:** a fork or approved workshop branch; repository Actions access.

1. Review `.github/workflows/pages.yml` in the repository. Its check job runs
   `npm ci` and `npm run check`, then uploads static documentation. It contains
   **no Azure login, cloud credentials or gateway deployment**.
2. In a disposable local clone, edit one sentence and run `npm run check`.
   Positive: tests and a site build pass. Negative: a broken relative docs link
   must fail the documentation link check; restore it.
3. Review how real APIM CI/CD would export/review OpenAPI/policy changes and
   use least-privilege federated deployment identity, environment approvals,
   secret references and rollback. No deployable APIM pipeline is supplied here;
   do not add a personal access token or service-principal secret to demonstrate it.

**Checkpoint:** distinguish Pages publishing from API deployment; describe
the missing production review/approval gates. Troubleshooting: check Actions
permissions, lockfile consistency and Pages source, not Azure credentials.

## Developer portal exploration (20-30 minutes)

**Objective:** observe discovery and subscription onboarding.
**Prerequisites:** selected SKU supports it; facilitator has preconfigured a
workshop-only portal/product with no sensitive branding or data.

1. Visit only the assigned workshop portal. Browse the pair product and policy
   documentation. Check whether the extension schema and errors are current.
2. Under instructor supervision, use the approved subscription/onboarding
   process. A portal account is not automatically authorization to all APIs.
3. Positive: an approved pair subscription can call the intended API.
   Negative: a missing-key request remains 401; portal discovery does not
   bypass API subscription enforcement.
4. Do not publish other pairs' APIs, expose tokens in examples, customize shared
   service branding or republish the entire portal without instructor approval.

**Checkpoint:** explain discovery vs API authorization. Troubleshooting:
unpublished products, portal refresh, permissions and SKU support are
facilitator concerns. If no portal was provisioned, label this a discussion,
not an implemented participant exercise.
