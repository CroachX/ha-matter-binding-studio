# v0.5.1 deployment and read-only validation

Observed: 2026-10-29 (Asia/Taipei). Historical record, not a live health check;
this does not cover subsequent unreleased code.

- Release: [v0.5.1](https://github.com/CroachX/ha-matter-binding-studio/releases/tag/v0.5.1)
- Commit: `50b1de5dcde95cf8288452842d377661d9429488`.
- Target: HA 2026.10.1; installed via HACS and restarted.
- Core reached `RUNNING`; Studio's config entry reported `loaded`.
- HACS installed/latest version was `v0.5.1`, with no remaining restart request.
- Served frontend SHA-256 matched the local release bundle:
  `32a4401b028494a10b2e99d37756bad64d51e4ae96818a7662c7a82d167f26e7`.

## Checks passed

- Discovery returned 41 presentation endpoints and three direct relationships.
- Before/after relationship IDs, target addresses and cluster lists matched.
- No snapshot read warnings; the new backend snapshot field was present.
- Read-only ACL inspection succeeded; protected, used and unknown entries
  were non-reclaimable.
- Desktop 1440x1000 and mobile 390x844 rendered meaningful content with no
  framework or console errors after the loading overlay cleared.
- Search narrowed three relationships to one; clearing restored all three.
- Add drawer opened/closed on desktop and mobile without applying a plan;
  manual refresh worked.
- 56 local Python tests, five message tests and the production build passed.
  GitHub CI passed on Python 3.12/3.13 and Node 22.

Validation used isolated Playwright/Chrome because the Browser plugin was
unavailable. Its context was closed afterward. Tokens, household addresses,
keys and private screenshots are not committed with this record.

## Not validated

No Binding, ACL, group membership or Group Key mutation ran during deployment
validation. Physical control, destructive batch deletion, group cleanup and
device failure/retry remain separate acceptance tasks. Later ACL provenance
changes are not covered.

OTBR was observed in `setup_retry` during startup. Its relationship to startup
delay was not established; no OTBR/Thread setting was changed.
