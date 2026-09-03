# Matter Binding Studio

An administrator-only Home Assistant panel for inspecting and safely
provisioning **native** Matter Binding Cluster relationships.

This is an independent custom integration. It does not replace or modify
`ha-matter-binding-helper`, MatterLogicHub, Home Assistant dashboards, or
family-facing controls.

## Current scope: verified direct bindings

Version `0.2.0` reads the existing Matter fabric and presents:

- endpoint-backed Home Assistant names, including bridged functional endpoints
- existing Binding Cluster relationships, shown as direct or native-group routes
- cached native Matter group membership where devices expose it
- cached Group and Group Key capacity without exposing any key material.

It can also create a **single-target native unicast** relationship after a
reviewed plan and explicit confirmation. The transaction reads the current
source Binding list and target ACL, adds only the needed target access entry,
writes the Binding list, then reads the Binding Cluster back. If the binding
cannot be verified, Studio reports that state rather than claiming success.

This release does not yet create, modify, or remove native Matter Groups or
Group Keys. Multi-target groupcast, relationship replacement, and removal are
separate transactions because they affect more devices and require dedicated
rollback/repair handling.

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
Home Assistant connection and displays a not-connected notice.

## Design

The product decisions and future write-transaction safety boundary are
recorded in [the native binding Studio specification](docs/native-binding-studio-spec.md).

Before a write, validate the proposed source and target against the live
fabric. After the device readback confirms the Binding Cluster, test the
physical control and retain the resulting relationship in the Studio view.
