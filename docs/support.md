# Recovery, backup and reporting

## Before changing devices

Keep a full HA backup and a record of working relationships. Stop other binding
tools while applying a Studio plan. Studio's lock covers its own writes only.

Back up the private HA storage records `matter_binding_studio_managed_groups` and
`matter_binding_studio_acl_provenance` with the HA configuration. Group storage
contains secret key material: never attach it to a public issue. Check the actual
backup includes these records; a screenshot of the panel is not a backup.

Restoring an older HA backup does **not** restore physical device tables. Local
metadata and devices may disagree. Read and reconcile current state before
cleanup; an old journal does not prove current ownership.

## Recovery by outcome

| Outcome | Meaning | Next step |
| --- | --- | --- |
| Plan rejected | No apply was requested by this plan | Check availability/capacity and review a new plan. |
| Table changed / plan expired | Reviewed assumptions no longer apply | Refresh and inspect, then review again. |
| Verified write | Configuration readback matched | Test physical control; firmware behavior is separate. |
| Apply timeout / unverified | A write may have reached devices | Save diagnostics, refresh and inspect before retrying. |
| Partial batch deletion | Some sources completed | Keep successful results; select only remaining relationships. ACLs and groups remain. |
| Pending / repair-needed group | Provisioning or cleanup stopped part-way | Preserve metadata. Inspect involved devices. Cleanup requires an idle Studio-owned group and fresh reads; do not bypass a blocked cleanup. |

If the next action is unclear, stop and report the issue. No automatic rollback
or provisioning-resume guarantee exists. Repeated new groups can consume scarce
ACL/group/key slots. Do not reset devices or delete unfamiliar ACLs to clear errors.

## Unload, uninstall and restore

Removing Studio removes its panel, not configuration already stored in Matter
devices. Bindings can remain operational. Remove relationships through reviewed
actions **before** uninstalling if that is your intention.

Do not delete `.storage` records by hand. Without group metadata/key material,
Studio may not safely manage previously created groups. Removing the HA Matter
integration, re-pairing nodes or resetting devices is not a Studio repair and
can invalidate identities/access rules.

## Report a problem safely

Include Studio, HA and Matter Server versions, device models/firmware, whether
bridged, the action attempted and result code. State whether physical control
worked, not just whether the plan was verified. Distinguish mock and device tests.

Never post tokens, pairing codes, Group Keys, raw Store files or unreviewed
complete Matter dumps. Screenshots/logs can contain room names, addresses and
identities. Review every attachment before posting it.

Do not put security exploit details or household data in public issues. A private
reporting channel is a maintainer setup task before wider distribution; do not
assume GitHub private vulnerability reporting is enabled until the repo offers it.
