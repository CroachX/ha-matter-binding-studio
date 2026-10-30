# Public Beta release gate

This is not a certification or release announcement. Separate implementation,
automated validation and real-device acceptance.

## Local preparation

- [x] Short install/first-use README with released/unreleased distinction.
- [x] Recovery/backup guidance, including uninstall semantics.
- [x] Issue template with version and physical-test information.
- [ ] Owner selects LICENSE and reviews third-party notices.
- [ ] Maintainer confirms a private security reporting channel.
- [ ] Sanitized diagnostics, with privacy regression tests.
- [ ] Actionable failure guidance in the panel; no automatic retry/rollback claim.
- [ ] Real HA lifecycle, config-flow and API permission tests.
- [ ] Validate minimum/current HA versions and HACS packaging.

## Device acceptance — NOT RUN for this milestone

Use expendable relationships with explicit approval. Record versions,
models/firmware, topology, expected result, readback, physical behavior and cleanup.

- [ ] Single-target create → physical on/off/level/color control.
- [ ] Multi-target create with complete and partial capability coverage.
- [ ] Direct-to-group conversion preserves unrelated bindings/grants.
- [ ] Single/batch delete preserves unrelated bindings, ACLs and groups.
- [ ] Idle-group cleanup preserves unrelated memberships and keys.
- [ ] Offline devices and lost responses fail safely.
- [ ] Interrupted apply/restart → truthful status and safe reviewed retry.
- [ ] Backup restore mismatch → inspect/reconcile, never assume ownership.

## Distribution decision

Until device acceptance is recorded, write/group functions remain experimental.
Do not advertise universal support or reliable automatic recovery. Review this
checklist, CI, the committed bundle and release notes before publishing.
A deploy/load/UI check alone cannot close a device gate.
