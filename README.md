# Matter Binding Studio

An administrator-only Home Assistant panel for inspecting and safely
provisioning **native** Matter Binding Cluster relationships.

This is an independent custom integration. It does not replace or modify
`ha-matter-binding-helper`, MatterLogicHub, Home Assistant dashboards, or
family-facing controls.

## Current scope: reviewed native bindings and automatic groups

Version `0.3.0` reads the existing Matter fabric and presents:

- endpoint-backed Home Assistant names, including bridged functional endpoints
- existing Binding Cluster relationships, shown as direct or native-group routes
- cached native Matter group membership where devices expose it
- cached Group and Group Key capacity without exposing any key material.

The **Target ACL** section reads one selected output endpoint on demand. It
shows the device-reported ACL capacity, administrator and operate rules, named
sources and endpoints, and whether a rule can be matched to a currently known
native Binding. It deliberately does not query every target whenever the
Fabric refreshes.

An explicitly unused operate rule with concrete source and target fields can
be reclaimed through its own review-and-confirm transaction. Studio never
offers administrator rules or a rule matched to a current Binding for reclaim;
the complete remaining ACL table is read back before success is reported.

It can create a **single-target native unicast** relationship after a reviewed
plan and explicit confirmation. The transaction reads the current source
Binding list and target ACL, adds only the needed target access entry, writes
the Binding list, then reads the Binding Cluster back. If the binding cannot
be verified, Studio reports that state rather than claiming success.

Before any unicast or groupcast provisioning begins, Studio also checks the
target ACL's reported entry capacity. A known-full ACL is rejected during plan
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
ready.

Existing direct and groupcast relationships can be removed through a separate
review-and-confirm transaction. Studio first re-reads the source Binding table,
removes only the entries belonging to the selected relationship, writes the
remaining table, then verifies the full table by readback. Removing a groupcast
relationship leaves its native group, Group Key, membership, and ACLs intact.
An idle group that was automatically created by Studio can then be cleaned up
through a separate reviewed action. It rechecks that no Binding targets the
Group ID, removes its recorded ACL targets, members, Group Key mappings, and
Key Sets, then drops local metadata only after the device operations verify.
If an operation is uncertain, the group remains recorded as needing repair.

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

## Development

```bash
npm install
npm run build
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

## Design

The product decisions and future write-transaction safety boundary are
recorded in [the native binding Studio specification](docs/native-binding-studio-spec.md).

Before a write, validate the proposed source and target against the live
fabric. After the device readback confirms the Binding Cluster, test the
physical control and retain the resulting relationship in the Studio view.
