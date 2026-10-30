# Matter Binding Studio

An administrator-only Home Assistant panel for managing **native Matter
bindings**: choose a controller endpoint, choose the lights it should control,
review the changes, then apply.

**Experimental software.** Readback verifies configuration, not physical control.
Use expendable relationships for initial testing and keep a current HA backup.
This is an independent custom integration, not an official HA or Matter project.

## What it does

- Uses HA device, entity and area names, including bridged endpoints.
- Lists relationships with search, area filtering and batch deletion.
- Uses unicast for one target and automatic native groups for multiple targets,
  showing partial capability coverage before writing.
- Offers reviewed idle-group cleanup and read-only ACL/capacity inspection.
  Advanced information stays collapsed by default.
- Follows HA's language: English, Traditional Chinese or Simplified Chinese.

Studio configures devices; **it is not a runtime command relay**. It does not
replace family-facing dashboards. A source must implement Binding and relevant
client clusters; a button that only emits events is not sufficient. An endpoint
looking like a light in HA does not guarantee native binding compatibility.

## Install through HACS

1. Configure the **Matter** integration in HA first.
2. In HACS, add `https://github.com/CroachX/ha-matter-binding-studio` as a
   **Custom repository**, type **Integration**.
3. Download **Matter Binding Studio**, then restart HA.
4. Open **Settings → Devices & services → Add integration → Matter Binding Studio**.
5. Open the sidebar panel as an administrator.

No separate backend, credentials or exposed Matter Server port are required.
Updates need an HA restart for backend changes and a panel reload. Updating
Studio itself does not write Binding, ACL or group configuration.

### Compatibility and verification

The declared minimum is **HA 2026.8.3**; this is not a tested-device matrix.
Published **v0.5.1** was checked on HA **2026.10.1** for loading, read-only APIs
and desktop/mobile rendering: [dated verification](docs/validation-v0.5.1.md).
Live destructive batch deletion, group cleanup and interrupted-write recovery
have not been accepted on real devices. Offline tests do not change that boundary.

## First relationship

1. Choose **Add control relationship**, then a source endpoint.
2. Select one or more targets. Same-area filtering starts after choosing a source;
   turn it off to control another area.
3. Check capability coverage and review the write plan. Capacity checks can block
   a plan before any device write.
4. Confirm the plan, check its result, then **physically test the controller**.
5. To delete, select relationships in the list and review the deletion plan.

Deleting a Binding **leaves ACLs, group membership and keys in place**. Idle-group
cleanup is separate. Generic ACL reclaim is disabled: no known relationship
does not mean safe to delete.

## If something fails

A planning error is not an apply. A timeout or failed apply can mean **part of
the operation reached devices**. Refresh and inspect current relationships and
group status before retrying. Batch deletion is not atomic across devices;
successful sources remain applied. Do not repeatedly recreate repair-needed
groups or assume automatic rollback. Read [recovery and reporting](docs/support.md).

## Released versus unreleased

**v0.5.1** includes relationship management, automatic groups, reviewed deletion
and the safety fixes described in [implementation notes](docs/implementation-notes.md).

**Unreleased source** adds ACL provenance and known-sharing diagnostics. Its
journal records intent before writes and evidence after full readback; uncertain
writes, unknown identity and legacy grants remain unknown. It does not enable
generic reclaim. See [ACL provenance](docs/acl-provenance.md).

The [Public Beta checklist](docs/public-beta.md) separates implementation,
automated checks and physical acceptance. A source commit is not a new release.

## Development

```bash
npm ci
npm run dev                 # mock fabric only; no HA connection
npm run build
node --test tests/*.test.cjs
python -m unittest discover -s tests -v
```

The production bundle is committed under
`custom_components/matter_binding_studio/frontend/` so HACS needs no Node build
on HA. CI checks it matches source. The stdlib Python suite uses HA boundary
stubs and an in-memory Matter transport, not physical devices.

## Limits and roadmap

- No in-place editing of group members or automatic provisioning resume/rollback.
- No generic ACL reclamation, legacy adoption or ownership guarantee.
- No state projection, automation suggestions or binding recommendations.
- Other controllers/tools can change device tables outside Studio's write lock.

See the [design](docs/native-binding-studio-spec.md) for technical details.

**License selection is pending.** No project license has been chosen; this
repository does not currently make an open-source licensing claim. Dependency
licenses remain separate. Licensing is a release-readiness item for the owner.
