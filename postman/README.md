# Postman

Import `insurance-lab.postman_collection.json` and
`workshop.postman_environment.json`; select that environment. These are standard
Postman collection v2.1 / environment JSON files. Regenerate with `npm run postman`.

Run **Provider** locally without a key. Gateway folders need the assigned
`gatewayBaseUrl` (full suffix, no trailing slash), `pairId` and pair subscription
key in a **local/current** secret variable or Postman Vault. Never put a live key
in a shared/initial value, export, screenshot, repository, cloud monitor or console.
Do not export a filled environment.

Run one checkpoint folder at a time: baseline and extended expectations are
mutually exclusive after the provider switch. Composition is added later.
Every request has status and body assertions, and workshop responses assert
correlation. Default invalid gateway URLs deliberately cannot call Azure.
Use a request timeout above 5 seconds for the composition timeout exercise;
otherwise Postman can time out before receiving the expected gateway 504.
