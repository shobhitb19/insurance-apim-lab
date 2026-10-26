# 8. Revisions and versions

**Objective:** distinguish a safe implementation revision from an explicit
consumer-facing version change. **Duration:** 30 minutes.
**Prerequisites:** module 7; facilitator-reviewed permissions and clean
extended/composition checkpoint.

## Steps

1. Record the current API revision and run the successful overview test once.
   In your API > **Revisions**, choose **Add revision**, description
   `Add safe workshop response metadata`. Do not make it current yet.
2. In the new revision only, add an API outbound header policy before the
   closing outbound tag:

```xml
<set-header name="X-Lab-Revision" exists-action="override"><value>candidate</value></set-header>
```

3. Use the gateway's revision URL format shown by the portal for the new
   revision. Normally the revision marker is appended to the API suffix before
   the operation, for example `/pair-NN/insurance;rev=2/policies/POL1001`.
   Confirm the actual revision number rather than assuming 2.
4. Call the **proxy policy** route on the candidate: expect 200 extended policy
   plus `X-Lab-Revision: candidate`. The overview uses `return-response` in
   inbound, so it intentionally does not gain an outbound-only header.
5. Negative/regression test: call the current revision's proxy URL; it must
   still return 200 **without** the candidate header. Run candidate overview
   `POL5001`: it must still be 502 `DependencyFailure`, not masked by a revision.
6. With facilitator approval, make the candidate current (create its release
   entry), verify the normal URL includes the new header, then practice making
   the previous revision current again. Confirm the header disappears while
   data and failures stay unchanged. Do not delete another pair's revision.
7. Discuss a hypothetical breaking change: rename/remove `riskCategory`.
   Do **not** silently make it a revision of the same consumer contract. On a
   facilitator demo API, create a version set using path versioning, keep v1,
   and create a separate v2 API with a deliberately documented response change.
   Portal API/version-set operations may require instructor permissions.
8. If live version creation was rehearsed, verify both version URLs: v1 returns
   its old documented body; v2 returns its changed body. An undefined version
   returns 404. Otherwise label the version segment **discussion only** and
   do not claim two live versions were implemented.

## Expected results and tests

Positive: candidate proxy **200** extended body with candidate header; after
release, normal URL has the header. Negative: original current revision does
not acquire the header prematurely; candidate dependency failure remains **502**.
Rollback restores old metadata without breaking the payload.

## Troubleshooting

Missing header on overview is expected because inbound `return-response`
short-circuits outbound. Missing header on proxy can mean wrong revision URL
or edits at the wrong scope. Version creation may change API identifiers and
suffixes; inspect the portal rather than guessing URLs.

## Checkpoint

Explain revision vs version using an actual rollback and a hypothetical breaking
change. Continue to the [independent challenge](09-challenge.md), with the
[approved-provider discussion](provider-mapping.md) before or after it.
