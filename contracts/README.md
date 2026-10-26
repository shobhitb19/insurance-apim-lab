# Importable contracts

Run `npm run contracts` to refresh `import/*.json`. Those committed files are
self-contained: download and import them in the Azure portal. Root documents
use shared schemas for maintainability and are also valid OpenAPI documents.
Never upload `schemas.json` as an API.

The baseline import is used first. The extended provider and final gateway
contracts document later checkpoints, not the baseline response. Importing an
OpenAPI schema into APIM documents the contract; it does not by itself validate
all backend responses or implement the overview operation.

The `.invalid` gateway hostname is intentionally non-resolving. Provider servers
default to local HTTP for direct fixture testing only. Override the API's web
service URL with the approved reachable fixture host before a gateway call.
