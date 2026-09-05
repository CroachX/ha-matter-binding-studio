# Native Matter Binding Studio — Specification

Status: approved product direction. The current implementation provides
guarded single-target native unicast and reviewed automatic multi-target
groupcast creation with Binding/GroupTable readback, plus reviewed Binding
removal with source-table readback. Editing, native-group cleanup, and repair
actions remain intentionally deferred. Each newly supported device combination
still needs a physical-control test after readback before it is treated as
proven.

## Confirmed direction

- The Studio is an admin-only panel inside the existing Home Assistant custom
  integration. It is not a separate backend service or a MatterLogicHub
  deployment.
- The Studio provisions and inspects native Matter bindings only. It does not
  become a hub-managed command relay.
- The first version creates reviewed batches of cluster-specific native
  bindings. One conceptual relationship may therefore create multiple Binding
  Cluster entries.
- The author selects one or more named control targets, never a transport
  mode. One target is provisioned as native unicast; two or more targets are
  provisioned as an automatically managed native Matter Group and groupcast.
- Each automatically managed group is owned by one conceptual control
  relationship. Version one allocates one independent Group Key for that
  group; it does not share keys across relationships.
- Home Assistant remains the family-facing dashboard, application, automation,
  and scene surface.
- Home Assistant user-assigned names are authoritative for presentation-device
  labels in the first version.
- Group capabilities may be partial. The Studio must make that coverage
  explicit instead of rejecting the group solely because its members have
  different capabilities.

## 1. Problem

The current helper exposes Matter's raw selection hierarchy:

```text
Node -> Endpoint number -> Device type number -> Cluster
```

It is technically faithful, but it is difficult to use with multi-endpoint
bridges. For example, a user may know that a control should operate
"Study ambient light", but the target selector offers only `Endpoint 53` or a
numeric device type.

MatterLogicHub provides a better mental model: Matter nodes retain their
technical identity, while endpoint-backed product devices have names, roles,
capabilities, and clear relationships. This proposal adopts that presentation
model without changing execution from native Matter Binding to hub-managed
software forwarding.

## 2. Goal

Provide an operator-oriented UI that makes native Matter bindings
understandable and safe to author without asking the operator to choose
unicast versus groupcast.

The UI must let an operator answer, before writing anything:

1. Which named control endpoint is the source?
2. Which named output devices are the targets?
3. Which capabilities will work for every selected member?
4. Which route will Studio safely choose, and what exact Binding Cluster,
   ACL, group-membership, and group-key changes will be written?
5. Was the final binding read back from the source device?
6. Which native bindings already exist, and what relationship do they express?

## 3. Non-goals

- Do not create a virtual Matter target device.
- Do not relay ordinary binding commands through Home Assistant or this
  integration after provisioning.
- Do not implement MatterLogicHub's software binding, aggregation, or state
  projection model.
- Do not replace Home Assistant dashboards, scenes, automations, or family UI.
- Do not present Generic Switch event endpoints as native binding targets.
  They belong in an automation/event workflow.
- Do not generate heuristic binding recommendations in the first version.
  Compatibility and area are useful filters, not sufficient evidence that two
  endpoints should be linked.
- Do not generate or create Home Assistant automations in the first version.

## 4. Execution boundary

The product is a UI and metadata layer over the existing native mechanism:

```text
Studio UI
  -> current Binding Cluster / group / ACL / group-key backend
  -> source device Binding table
  -> native Matter unicast or groupcast at runtime
```

It must never silently fall back to a Home Assistant automation or a
hub-managed fan-out. The runtime always uses one of these explicit modes, but
the normal authoring view presents a plain-language route instead:

- `Native unicast`
- `Native groupcast`
- `HA automation` (event-only reference; not authored by this Studio)

## 5. Product model

### 5.1 Native Matter node

The technical Matter identity used for commissioning, diagnostics, ACLs, and
network operations. A node can contain many endpoints.

### 5.2 Native endpoint

The exact `node id + endpoint id` address. It owns the Matter client/server
clusters and, when applicable, the Binding Cluster.

### 5.3 Presentation device

A read-only product view of one native endpoint. It is not a virtual Matter
node and it has no separate runtime state.

Initial naming precedence:

1. Home Assistant entity user-assigned name for that endpoint
2. Home Assistant child-device name
3. Home Assistant node/device name
4. Human-readable Matter device-type name
5. `Endpoint <id>` as the final fallback

The presentation device shows:

- display name and area
- role: `output`, `control source`, `event source`, or `diagnostic`
- human-readable capability chips, such as `On/Off`, `Brightness`, and
  `Color temperature`
- technical details on demand: endpoint ID, Matter device type, clusters, and
  node identity

`Home Assistant names only` means the Studio has no independent text field
such as `Studio display alias`. When a device or entity is renamed in Home
Assistant, the Studio reads and shows the new name after refresh. This avoids
having two names for one endpoint and avoids a second metadata backup/migration
problem. A local override is deliberately out of scope for the first version.

### 5.4 Automatically managed native Matter group

A real Matter Group ID with member `node id + endpoint id` pairs. It is not a
virtual target device.

Matter groups are untyped on the wire. The Studio creates and maintains the
descriptive metadata for an automatic group only when a relationship has two
or more targets. The operator does not create groups, select a Group ID, or
manage group members directly. The one-page registry presents the resulting
set as a read-only explanation of which output devices will act together.

Each automatic group records:

- generated relationship-derived name and optional area
- member endpoints
- declared intended clusters, for example `On/Off`, `Level`, and `Color`
- computed capability coverage per cluster

### 5.5 Native binding relationship

A conceptual relationship shown to the user. It may map to one or more
Binding TargetStruct entries on the source endpoint's Binding Cluster list.

Examples of the runtime projection:

```text
Desk controller / Main
  -> Study smart light / On/Off

Desk controller / Main
  -> Study smart light + light strip / automatically managed native group /
     On/Off
```

The relationship view groups entries by source and target, while preserving the
underlying binding-table rows for diagnostics and deletion.

## 6. UX

### 6.1 Device inventory

The default inventory is endpoint-first, not raw-node-first.

```text
Study H2
  Study smart light       Output        On/Off
  Study ambient light     Output        On/Off
  Third relay             Output        On/Off       Needs a name
  First key               Event source  Switch event
  Second key              Event source  Switch event
```

The node header is expandable for diagnostics. Raw endpoint numbers and Matter
device types appear in a secondary technical line, never as the primary label.

### 6.2 Automatic control sets

The default page has two sections: control relationships first, then the
read-only automatic control sets that exist because a relationship has more
than one target. The group section is explanatory, not a second management
workflow.

For each automatic set, the Studio shows its members and capability coverage:

```text
Study main-light control set           2 members

On/Off                                 2 / 2  ready
Brightness                             2 / 2  ready
Color temperature                      2 / 2  ready
```

When composing a relationship, the target picker may include endpoints that
share at least one intended capability. It must not imply that a partial
capability will control all members.

Coverage has three semantic states. Colour or visual style is an implementation
detail to decide later; the meaning is mandatory:

- `available` — every member exposes the target server cluster, for example
  `On/Off 3 / 3`.
- `partial` — one or more members expose the target server cluster, for
  example `Brightness 2 / 3`. This capability may be used, but the execution
  plan must name the members that do not advertise support.
- `unavailable` — no member exposes the target server cluster, for example
  `Color temperature 0 / 3`. No binding entry can be authored for it.

### 6.3 Binding composer

The composer is relationship-first:

1. Choose a named source presentation device. Only endpoints with a Binding
   Cluster and relevant client clusters are selectable.
2. Choose one or more named output devices.
3. Select one or more compatible capabilities/clusters as a reviewed batch.
4. Review an execution plan.
5. Explicitly confirm write and read-back verification.

Example execution plan:

```text
Source: Study controller / Main
Targets: Study smart light, light strip
Route: automatically managed native groupcast

[x] On/Off                 2 / 2 members
[x] Brightness              2 / 2 members
[x] Color temperature       2 / 2 members

Will preflight: Group and Group Key capacity on source and every target
Will provision: group membership, one independent Group Key on source and
                members, and group ACLs for On/Off and Brightness
Will write: 2 Binding Cluster entries on the source endpoint only after all
            provisioning succeeds
Will verify: read Binding Cluster back from the source device
```

A partial cluster is selectable. Before writing, the execution plan must name
the members that do not advertise the target server cluster. An unavailable
cluster is never selectable. A one-target relationship skips all group and
Group Key work and uses native unicast. A multi-target relationship must pass
capacity preflight before any group provisioning begins. Groupcast
configuration read-back verifies the binding, group key, and ACL setup; it
does not prove that every individual member executed a later multicast command.

The write is a reviewed batch, not an opaque all-or-nothing abstraction. The
confirmation lists every cluster-specific Binding TargetStruct entry that will
be written, and the result reports verification for every requested entry.

### 6.4 Binding registry and relationship overview

The registry of existing bindings is a first-version requirement. It reads each
source endpoint's native Binding table and groups rows into understandable
relationships. It is inspired by MatterLogicHub Binding Studio:

```text
Source control             Capabilities             Target
Study controller / Main    On/Off      complete     Study lighting
                           Brightness  partial      2 of 3 members
```

Each relationship must show:

- named source presentation device
- named target output devices
- a plain-language route summary: `direct` or `automatic control set`
- one row for every bound cluster, including coverage for a group target
- last successful Binding-table read-back status
- an explicit delete or repair entry point

It uses plain-language labels first and shows the exact `cluster / endpoint /
node` details and `unicast / groupcast` transport in an expandable diagnostics
section. A binding not created by the Studio still appears if it is present in
the source device's Binding table; missing presentation metadata falls back to
the raw technical address.

### 6.5 Diagnostics and recovery

Diagnostics remain available but never drive the normal authoring flow:

- raw Binding table entries
- target type: unicast or groupcast
- endpoint ID, Matter device type, clusters, and server/client direction
- ACL and group-key provisioning status
- last read-back result and timestamp
- separate delete/repair actions with confirmation

### 6.6 Target ACL inspection and preflight

Access Control is a target-device concern, so it is read only when an operator
selects a target endpoint. The normal Fabric refresh never loops through every
device ACL. The ACL view shows entry capacity, administrator and operate
rules, named source/group subjects, target endpoints and capabilities, and a
best-effort reference to a current native Binding. A rule without a concrete
source and target is never treated as safe to reclaim.

Every reviewed unicast or groupcast plan reads the reported
`AccessControlEntriesPerFabric` limit where available. If the planned
cluster-specific grants would exceed that known limit, planning fails before
any Matter write. An unavailable capacity attribute is presented as unknown;
it is not silently interpreted as zero.

For one source and target endpoint, capabilities are packed into the smallest
number of least-privilege ACL entries allowed by the reported
`TargetsPerAccessControlEntry` limit. If that limit is unavailable, Studio
keeps one target per entry rather than assuming an unsupported table shape.

An ACL entry is eligible for reclaim only when it is not an administrator rule,
has concrete subjects and targets, and cannot be matched to any currently read
Binding relationship. Reclaiming is never implicit: the operator reviews the
single entry, confirms it, and Studio re-reads the complete ACL table before
reporting success. A changed ACL table, an administrator entry, and an
in-use/ambiguous rule all fail closed.

## 7. Safety rules

- Discovery is read-only.
- Before every write, capture the current source Binding table in the operation
  result and show it in diagnostics.
- Creating a unicast relationship appends one target entry without dropping
  existing entries.
- Creating a groupcast relationship does not claim success until group
  membership, key/ACL provisioning, and source Binding Cluster read-back have
  each reported their result.
- When a one-target relationship becomes multi-target, the Studio keeps the
  existing unicast binding until group membership, key, and ACL provisioning
  have succeeded. It then performs one complete Binding-table update and reads
  it back. A provisioning failure therefore leaves the old unicast route in
  place.
- Before creating an automatic group, the Studio reads `MaxGroupsPerFabric`
  and `MaxGroupKeysPerFabric` for the source and every target. Version one
  requires one available group slot and one available key slot on each
  participating physical node.
- A partial failure is reported as partial; the UI must not describe it as an
  operational group binding.
- Groupcast read-back verifies configuration, not a per-member acknowledgement
  of a later multicast command.
- Removing a relationship re-reads the complete source Binding table, removes
  only the cluster entries belonging to the reviewed target, writes the
  remaining table, and verifies that complete table by readback. It does not
  remove target ACLs or clean up native-group state.
- Studio may clean an idle, Studio-owned native group only through a separate
  review-and-confirm transaction. It rechecks that no Binding targets the
  Group ID, removes concrete recorded group ACL targets, membership, Group Key
  mappings, and Key Sets, then removes local metadata only after confirmation.
  Any uncertain partial result stays `repair_needed`; Studio never cleans a
  group created by another controller.
- The Studio never creates a hidden virtual device to stand in for a group.

## 8. Existing backend to retain

The current fork already has the protocol-sensitive pieces that should remain
behind a stable API:

- native Binding Cluster read/write and read-back verification
- preserving existing Binding TargetStruct entries on append
- unicast ACL provisioning
- native group membership, group-key distribution, and group-auth ACL
  provisioning
- Matter node discovery and Home Assistant registry lookup

Only the presentation/API shape required by the new UI should be added. The
existing raw diagnostic panel can remain as an advanced view during migration.

## 9. Decision log

Confirmed:

1. Use Home Assistant names only for the first version; do not add local
   endpoint aliases.
2. Permit partial group capabilities and make their coverage explicit.
3. Create cluster-specific native bindings as a reviewed batch. The UI may
   present one relationship, but the plan and result expose every individual
   entry.
4. Do not include heuristic binding recommendations in the first version.
5. Do not include automation recommendations or automation generation in the
   first version.
6. The native Binding-table registry and relationship overview are first-version
   features.
7. Deliver the Studio as a panel in the current CroachX Matter Binding Helper
   fork. Do not create a separate backend service.
8. Keep the Studio admin-only; Home Assistant remains the family-facing
   dashboard and app.
9. Hide unicast versus groupcast from the normal authoring flow. The user picks
   one or more named targets; Studio selects unicast for one and an automatic
   native group for two or more.
10. Show automatic groups as read-only control sets beneath the relationship
    list. Do not expose manual Group ID, membership, or Group Key management.
11. Allocate one automatic group and one independent Group Key per conceptual
    relationship in version one. Capacity preflight is mandatory before a
    multi-target write.

## 10. Proposed discussion order

1. Confirm the product model and safety boundary.
2. Define the inventory, automatic-control-set section, binding composer, and
   binding registry information hierarchy using the Study setup as the first
   real scenario.
3. Connect the approved prototype to a read-only discovery API.
4. Add the reviewed write, preflight, provisioning, and read-back sequence only
   after the API contract and rollback evidence are agreed.
