# ACL provenance and known sharing

Status: implemented locally after v0.5.1; not released or installed on HA.
General ACL reclaim remains disabled. No device write runs on startup,
discovery or integration update.

## Evidence model

The HA-local version-1 `matter_binding_studio_acl_provenance` Store contains
operations with random IDs, UTC timestamps, origins, target identity scope,
before/after table fingerprints, new concrete entries and invalidated
fingerprints. Origins identify unicast, groupcast or cleanup and the relevant
source/target endpoints or group, plus source commissioning scope when known.

Target scope is compressed Fabric ID + Node ID + commissioning timestamp.
These are available through the Matter client's
[server information and node data](https://github.com/home-assistant-libs/python-matter-server/blob/main/matter_server/common/models.py).
Missing identity produces unscoped, unknown evidence; it does not block an
otherwise supported ACL operation. Names, IPs and FabricIndex are not identity.

Fingerprints cover privilege, authentication mode, subjects and complete
targets. Ordering and FabricIndex are ignored. Absent and empty wildcard lists
are equivalent. Duplicate entries are ambiguous. Administrator/wildcard grants
are never newly attributed, and existing entries are never adopted.

## Write sequence

1. Under the Studio transaction lock, read and validate the ACL.
2. Durably save a `pending` journal operation before ACL I/O. Stop if saving fails.
3. Write the ACL and compare the complete table by readback.
4. On success, durably mark `verified`; on failure mark `uncertain` if possible.
   Interruption or final persistence failure leaves the durable pending record.
5. Proceed with Binding commit only after the ACL journal is finalized.
   Group operations retain their existing repair-needed handling.

ACL verification is not whole-Binding-transaction completion. A later Binding
failure can leave a verified ACL with no users. No rollback/reclaim is implied.
Pending/uncertain records conservatively block attribution on that identity
scope until a future explicit reconciliation workflow; retries do not silently
erase uncertainty. Operations are retained without automatic history pruning.

Storage uses locking and copy-on-save: failed persistence cannot publish a new
verified in-memory state. Malformed top-level data fails closed rather than
being silently replaced with an empty journal. No manual adoption API exists.

## Read model

The existing admin-only `matter_binding_studio/get_acl_overview` command adds:

- `provenance`: `state` (`studio_recorded` or `unknown`), entry fingerprint,
  operation ID, creation/verification timestamps, origin, `safe_to_reclaim: false`.
- `references`: known relationship IDs/names, source Node/Endpoint IDs and
  only the capabilities granted by this entry.
- `references_complete`: whether the supplied Binding inventory is fresh and
  complete. Normal cached discovery yields false.

ACL overview shares the Studio transaction lock so it cannot observe a local
mutation halfway through its journal updates. It may persist invalidation of
missing/edited/duplicate evidence locally, but never writes Matter attributes.
A failed ACL read is not treated as an empty table or evidence of non-use.

CASE grants authorize source nodes, not source endpoints: two endpoints on one
controller can share a grant. IDs stay distinct even with identical HA names.
Group references match the group subject and member capabilities. References
are recalculated from snapshots, not increment/decrement counters that drift
after external changes. Zero known references is never cleanup permission.

## Removal boundary

Single/bulk Binding deletion leaves ACLs untouched. Separately reviewed
Studio-group cleanup journals ACL replacements and retires affected evidence;
it never adopts the remainder of a legacy packed grant. Cleanup eligibility
is not broadened by this feature.

All general ACL reclaim APIs still reject writes, even for recorded grants.
Future reclaim needs separate review of current tables, complete usage
evidence, stale backups, other controllers, shared grants and pending writes.
Matching fingerprints cannot detect identical external remove/recreate between
observations. This is historical evidence, not continuous ownership proof.

## Offline acceptance

Tests cover durable intent/reload, initial/final save failures, uncertain
writes, legacy/wildcard/duplicate entries, ordering, other fabrics,
recommissioning, disappearance/reappearance, and capability-specific references.
Real writer tests cover shared CASE grants, single/bulk Binding deletion,
external-grant reuse, group creation/cleanup, read failure and aborting Binding
commit when the ACL journal cannot be finalized.

HA/CHIP boundary substitutes and an in-memory transport do not establish live
HA Store compatibility, host crash durability, device wire compatibility or
physical control. Panel diagnostics and guided repair/resume remain follow-ups.
