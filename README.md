# Matter Binding Studio

An administrator-only Home Assistant panel for inspecting and safely
provisioning **native** Matter Binding Cluster relationships.

This is an independent custom integration. It does not replace or modify
`ha-matter-binding-helper`, MatterLogicHub, Home Assistant dashboards, or
family-facing controls.

## Current scope: reviewed native bindings and automatic groups

The current source includes unreleased safety fixes on top of `0.5.0`.
These changes are not installed by updating to the existing `0.5.0` release.
The panel reads the existing Matter fabric and presents:

- endpoint-backed Home Assistant names, including bridged functional endpoints
- existing Binding Cluster relationships, shown as direct or native-group routes
- cached native Matter group membership from the root Group Key Management
  `GroupTable`, where devices expose it
- cached Group capacity and reported limits without exposing key material.
  Available key slots stay unknown in discovery: GroupKeyMap length is not
  the number of allocated key sets. Group write preflight enumerates actual
  IDs using `KeySetReadAllIndices`.

The **Target ACL** section reads one selected output endpoint on demand. It
shows the device-reported ACL capacity, administrator and operate rules, named
sources and endpoints, and whether a rule can be matched to a currently known
native Binding. It deliberately does not query every target whenever the
Fabric refreshes.

**Generic ACL reclaim is disabled pending ownership tracking.** A rule without
a matching Binding is labelled unknown, not unused: it may authorize another
application or a source that could not be read. Administrator rules remain
protected. The legacy reclaim API rejects requests without writing. Cleanup of
recorded Studio group grants remains a separate, guarded operation.

It can create a **single-target native unicast** relationship after a reviewed
plan and explicit confirmation. The transaction reads the current source
Binding list and target ACL, adds only the needed target access entry, writes
the Binding list, then compares the complete Binding table by readback,
including pre-existing entries. If the binding cannot
be verified, Studio reports that state rather than claiming success.

Before any unicast or groupcast provisioning begins, Studio also checks the
target ACL's reported entry capacity, aggregating all selected endpoints on
the same physical node. A known-full ACL is rejected during plan
review, before any Binding, Group Key, or group-membership write is attempted.
When a target reports more than one ACL target slot per entry, compatible
capabilities for the same source and endpoint are packed into the fewest
least-privilege ACL rules; an unavailable limit keeps the conservative
one-target-per-rule representation.

When two or more targets are selected, Studio chooses groupcast automatically.
It allocates a dedicated application Group ID and Group Key set, provisions the
key material on the source and member nodes, adds each target endpoint to the
native group, writes the least-privilege group ACLs, converts matching direct
bindings only after provisioning succeeds, then reads the group table and
source Binding Cluster back. The epoch key remains in Home Assistant's private
local storage and is never sent to the panel.

This is still a device-dependent Matter operation: the first real deployment
must be physically tested after the readback. If provisioning stops part-way,
the Studio records the group as needing repair instead of presenting it as
ready. Valid Bindings with an omitted cluster (wildcard) are preserved;
automatic conversion of a matching wildcard direct Binding to a group is
rejected rather than silently narrowing its scope. Unsupported Binding table
shapes stop writes instead of being discarded.

Existing direct and groupcast relationships can be removed through a separate
review-and-confirm transaction. Studio first re-reads the source Binding table,
removes only the entries belonging to the selected relationship, writes the
remaining table, then verifies the full table by readback. Removing a groupcast
relationship leaves its native group, Group Key, membership, and ACLs intact.
An idle group that was automatically created by Studio can then be cleaned up
through a separate reviewed action. Both review and apply require successful
live reads from every discovered Binding endpoint on HA's fabric; offline or
unreadable sources block cleanup. It rechecks that no Binding targets the
Group ID, removes concrete recorded ACL targets, members, Group Key mappings, and
Key Sets, then drops local metadata only after the device operations verify.
The remaining ACL and key-mapping tables are compared in full, and key removal
is verified by enumerating IDs. Ambiguous wildcard ACL targets are not deleted.
If an operation is uncertain, the group remains recorded as needing repair.
This checks HA's discovered fabric, not unknown sources or other controllers'
independent activity. Do not repurpose Studio-owned group IDs outside Studio.

## Compact UI and batch deletion

The main view is a compact Binding list with source/target search and area
filtering. **Select filtered results** selects only visible relationships;
changing filters clears the selection. Add Binding opens a side drawer.
Native groups and advanced ACL/capacity tools are collapsed by default.

Selected relationships can be deleted together after one reviewed confirmation.
The backend resolves the selection against a fresh snapshot and prepares one
remaining Binding table per source endpoint. All Studio mutation operations
share one transaction lock to protect shared target ACLs and Group Key tables,
in addition to the source endpoint lock. Apply rejects tables changed since
review, writes once per source, and verifies
readback. Results distinguish verified deletion, changed tables, failed reads,
and uncertain writes. This is **not an atomic transaction across devices**;
successful sources remain applied if another source fails. Binding deletion
never removes target ACLs, Group Keys, or group membership. The lock does not
serialize other HA integrations, external controllers, or device firmware;
avoid concurrent configuration through those tools.

The new administrator-only WebSocket commands are
`matter_binding_studio/prepare_bulk_remove_bindings` (`relationship_ids`, 1–200)
and `matter_binding_studio/apply_bulk_remove_bindings` (`plan_id`, `confirm: true`).
Plans are single-use and expire under the existing writer TTL. The standalone
preview simulates these commands; device I/O still requires live HA validation.

## HACS installation

1. In HACS, add this repository as a **Custom repository** of type
   **Integration**.
2. Download or re-download **Matter Binding Studio**.
3. Restart Home Assistant.
4. Open **Settings → Devices & services → Add integration**, then add
   **Matter Binding Studio**.
5. Open the **Matter Binding Studio** sidebar panel as an administrator.

Matter must already be configured in Home Assistant. The panel uses the
Home Assistant language setting (`hass.locale.language`, with `hass.language`
as fallback) and does not maintain a separate label or language registry.

### Localization

The panel supports English, Traditional Chinese and Simplified Chinese.
Explicit `zh-Hant`/`zh-Hans` scripts take precedence; Taiwan/Hong Kong/Macau
select Traditional Chinese, and China/Singapore/Malaysia select Simplified
Chinese. Bare `zh` keeps the historic Traditional Chinese default. Unsupported
languages fall back to English. Device and area names stay exactly as named in HA.

Panel labels are in `src/copy.ts`. Backend errors, plan steps, results and ACL
labels use stable codes and scalar parameters from `messages.json` beside the
integration source. Successful responses retain legacy English fields and add
`*_i18n` descriptors. Errors retain the HA error code/message and add a
`studio_message` descriptor. The panel retains raw descriptors so messages can
follow a language change without repeating a device operation. Unknown codes
use their English fallback. External transport errors may still use the
upstream service's original text.

Update through HACS, restart Home Assistant for the new backend, and reload the
panel. The update itself does not write any Binding, ACL, or group configuration.

## Development

```bash
npm ci
npm run build
node --test tests/messages.test.cjs
python -m unittest discover -s tests -v
```

The production bundle is committed at:

```text
custom_components/matter_binding_studio/frontend/matter-binding-studio-panel.js
```

This allows HACS to install a ready-to-run integration without requiring a
Node.js build environment on Home Assistant.

For a standalone visual preview, run `npm run dev`. It intentionally has no
Home Assistant connection; it uses mock data to exercise the multi-target
groupcast review flow without changing any Matter device.

CI runs the standard-library Python suite on Python 3.12/3.13, Node message
tests, a TypeScript/production build, and checks that the committed HACS bundle
matches source. Python tests use HA boundary stubs, not an installed HA runtime.
Lifecycle tests run the actual writer and group store against an in-memory
Matter transport, covering direct-to-group migration, removal, cleanup,
expired/changed plans, partial failure and persistence failures.

## Validation boundary and remaining work

Local tests/builds are not device certification. Earlier `0.5.0` deployment
and panel checks do not validate these unreleased changes. Before releasing:

- Validate discovery and loading on the target HA/Matter Server version.
- Test physical single-target and multi-target control after readback.
- With explicit approval, test destructive batch deletion, idle group cleanup,
  and failure/retry on expendable device relationships. Existing household
  Bindings must not be used as destructive test fixtures without approval.

Not implemented yet:

- Editing an existing relationship or its group members in place.
- A guided repair/resume UI. Partial groups retain metadata; idle-group cleanup
  can be retried, but provisioning is not automatically resumed or rolled back.
- Durable provenance for general ACL reclaim, including ownership of old rules.
- Persistent last-verified timestamps and operation history in the panel.

State projection, automation suggestions and heuristic binding recommendations
remain outside the current scope. Studio is not a runtime command relay.

## Design

The product decisions, current implementation and remaining safety work are
recorded in [the native binding Studio specification](docs/native-binding-studio-spec.md).

Before a write, validate the proposed source and target against the live
fabric. After the device readback confirms the Binding Cluster, test the
physical control and retain the resulting relationship in the Studio view.
