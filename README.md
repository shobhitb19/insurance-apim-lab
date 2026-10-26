# Insurance API Management guided lab

A flexible two-day, portal-and-Postman workshop for roughly 12 participants working
in six pairs on one pre-provisioned Azure API Management service. All contracts,
identifiers and records are fictional. This is not a production architecture or
an implementation of any commercial insurance platform.

## Start locally

Install Node.js 22 or newer, then run:

```powershell
npm ci
npm run check
npm run mock
```

The fixture listens on `http://127.0.0.1:7071`. In a separate terminal:

```powershell
curl.exe http://127.0.0.1:7071/pairs/pair-01/baseline/policies/POL1001
npm run build
npx --yes http-server@14.1.1 _site -p 8080 -c-1
```

Open `http://127.0.0.1:8080`. The preview command is optional; `_site` is a
complete static site. No Azure resource is created by these commands.

Read [Start here](docs/index.md), then the
[facilitator readiness guide](docs/facilitator.md). Participants start with
[pair orientation](docs/01-orientation.md).

## Included

- Original guided modules, checkpoints, challenge and separate facilitator solution.
- A distinct HTTP provider fixture with isolated pair namespaces and deterministic
  baseline/extended policy and claims responses, including dependency failures.
- Importable [OpenAPI](contracts/) and [Postman](postman/) assets.
- [APIM policies](policies/) for proxying, correlation, controlled routing,
  bounded read aggregation and an optional JWT demonstration.
- Local HTTP/contract checks and a static-site build, plus GitHub Pages automation.

Local tests do **not** execute the Azure policy engine, prove Azure connectivity,
or validate portal/RBAC behavior. Every cloud exercise needs a pre-workshop
rehearsal. An Azure gateway cannot call the facilitator's `localhost`.

## Publishing

The [Pages workflow](.github/workflows/pages.yml) checks and builds on every push
and pull request; it deploys only on a push to `main` or a manual run on `main`.
In repository **Settings > Pages**, select **GitHub Actions** as the build source.
Then run the workflow and verify the deployment URL in its environment output.
The presence of a workflow does not mean Pages is enabled or live.

## Provenance and license

Inspired by the modular learning approach of
[Azure/apim-lab](https://azure.github.io/apim-lab/), which uses Jekyll and
Just the Docs. This repository uses a small Node/Markdown static builder instead
to share one runtime with the fixture. Lab prose, code and contracts here are
original; no source lab code, logos, theme or text has been copied.
This is an independent community lab, not sponsored or endorsed by Microsoft.
See [LICENSE](LICENSE) for this repository's MIT license. Dependencies retain
their own licenses in installed packages.

Tooling versions are pinned and locked. Contract validation covers OpenAPI 3.0;
review the dependency audit and rerun `npm run check` when upgrading tooling.
