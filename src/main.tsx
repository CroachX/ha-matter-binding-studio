import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App, { type HomeAssistant, type StudioSnapshot } from "./App";
import "./styles.css";

// The Vite entry is never bundled into the Home Assistant panel.  Keeping a
// small in-memory fabric here makes the local preview useful for reviewing the
// full multi-target flow without credentials or real-device writes.
const previewSnapshot: StudioSnapshot = {
  devices: [
    {
      node_id: 1001,
      endpoint_id: 2,
      node_name: "Study - Multi Function Switch",
      name: "Smart light",
      area_name: "Study",
      capabilities: [6, 8, 768],
      client_capabilities: [6, 8, 768],
      server_capabilities: [6, 8, 768],
      can_bind: true,
      can_be_target: true,
    },
    {
      node_id: 1002,
      endpoint_id: 1,
      node_name: "Study - Smart Light",
      name: "Smart light",
      area_name: "Study",
      capabilities: [6, 8, 768],
      client_capabilities: [],
      server_capabilities: [6, 8, 768],
      can_bind: false,
      can_be_target: true,
    },
    {
      node_id: 1003,
      endpoint_id: 1,
      node_name: "Study - Light Strip",
      name: "Light strip",
      area_name: "Study",
      capabilities: [6, 8],
      client_capabilities: [],
      server_capabilities: [6, 8],
      can_bind: false,
      can_be_target: true,
    },
    {
      node_id: 1004,
      endpoint_id: 1,
      node_name: "Main Bedroom - Smart Light",
      name: "Smart light",
      area_name: "Main Bedroom",
      capabilities: [6, 8, 768],
      client_capabilities: [],
      server_capabilities: [6, 8, 768],
      can_bind: false,
      can_be_target: true,
    },
  ],
  relationships: [
    {
      id: "1001-2-endpoint-1002-1",
      source: {
        node_id: 1001,
        endpoint_id: 2,
        node_name: "Study - Multi Function Switch",
        name: "Smart light",
        area_name: "Study",
        capabilities: [6, 8, 768],
        client_capabilities: [6, 8, 768],
        server_capabilities: [6, 8, 768],
        can_bind: true,
        can_be_target: true,
      },
      targets: {
        kind: "endpoint",
        name: "Smart light",
        members: [
          {
            node_id: 1002,
            endpoint_id: 1,
            node_name: "Study - Smart Light",
            name: "Smart light",
            area_name: "Study",
            capabilities: [6, 8, 768],
            client_capabilities: [],
            server_capabilities: [6, 8, 768],
            can_bind: false,
            can_be_target: true,
          },
        ],
      },
      route: "direct",
      clusters: [6, 8],
    },
  ],
  native_control_sets: [
    {
      group_id: 32768,
      name: "Study smart lighting control set",
      members: [],
      clusters: [6, 8, 768],
      active_relationships: 0,
      managed_by_studio: true,
      status: "active",
    },
  ],
  capacities: [
    {
      node_id: 1001,
      name: "Study - Multi Function Switch",
      max_groups_per_fabric: 4,
      max_group_keys_per_fabric: 3,
      group_table_entries: 0,
      group_key_map_entries: 0,
      status: "available",
    },
  ],
  warnings: [],
};

previewSnapshot.native_control_sets[0]!.members = [
  previewSnapshot.devices[1],
  previewSnapshot.devices[2],
];

// Exercise multi-target deletion on the same source and filtering across rooms.
previewSnapshot.relationships.push(
  { ...structuredClone(previewSnapshot.relationships[0]), id: "1001-2-endpoint-1003-1",
    targets: { kind: "endpoint", name: "Light strip", members: [previewSnapshot.devices[2]] }, clusters: [6, 8] },
  { ...structuredClone(previewSnapshot.relationships[0]), id: "1001-2-endpoint-1004-1",
    targets: { kind: "endpoint", name: "Main Bedroom light", members: [previewSnapshot.devices[3]] }, clusters: [6] },
);
let previewRemoval: string[] = [];

const previewHass: HomeAssistant = {
  locale: { language: "zh-Hant" },
  async callWS<T>(message: { type: string; [key: string]: unknown }): Promise<T> {
    if (message.type === "matter_binding_studio/get_snapshot") {
      return structuredClone(previewSnapshot) as T;
    }
    if (message.type === "matter_binding_studio/prepare_bulk_remove_bindings") {
      const ids = message.relationship_ids as string[];
      const rows = previewSnapshot.relationships.filter(row => ids.includes(row.id));
      previewRemoval = rows.map(row => row.id);
      return { plan_id: "preview-bulk", relationships: rows,
        source_count: new Set(rows.map(row => `${row.source.node_id}:${row.source.endpoint_id}`)).size,
        removed_entry_count: rows.reduce((n, row) => n + row.clusters.length, 0),
      } as T;
    }
    if (message.type === "matter_binding_studio/apply_bulk_remove_bindings") {
      const rows = previewSnapshot.relationships.filter(row => previewRemoval.includes(row.id));
      const grouped = new Map<string, typeof rows>();
      for (const row of rows) {
        const key = `${row.source.node_id}:${row.source.endpoint_id}`;
        grouped.set(key, [...(grouped.get(key) ?? []), row]);
      }
      previewSnapshot.relationships = previewSnapshot.relationships.filter(row => !previewRemoval.includes(row.id));
      return { success: true, results: [...grouped.values()].map(group => ({
        source: group[0].source, relationship_ids: group.map(row => row.id), status: "verified",
      })) } as T;
    }
    if (message.type === "matter_binding_studio/get_acl_overview") {
      const target = previewSnapshot.devices.find((device) =>
        device.node_id === message.target_node_id && device.endpoint_id === message.target_endpoint_id,
      );
      return {
        target,
        capacity: {
          used: 2,
          maximum: 4,
          available: 2,
          targets_per_entry: 3,
        },
        entries: [
          {
            entry_index: 0,
            kind: "administrator",
            auth_mode: "case",
            subjects: ["Home Assistant"],
            targets: [{ endpoint: "All endpoints", capability: "All capabilities" }],
            usage: { state: "protected", relationship_names: [], safe_to_reclaim: false },
          },
          {
            entry_index: 1,
            kind: "operate",
            auth_mode: "case",
            subjects: ["Study - Multi Function Switch"],
            targets: [
              { endpoint: "Study - Smart light", capability: "On / Off" },
              { endpoint: "Study - Smart light", capability: "Brightness" },
            ],
            usage: {
              state: "used",
              relationship_names: ["Smart light → Smart light"],
              safe_to_reclaim: false,
            },
          },
          {
            entry_index: 2,
            kind: "operate",
            auth_mode: "case",
            subjects: ["Retired controller"],
            targets: [{ endpoint: "Study - Smart light", capability: "Color temperature" }],
            usage: { state: "unused", relationship_names: [], safe_to_reclaim: true },
          },
          {
            entry_index: 3,
            kind: "operate",
            auth_mode: "group",
            subjects: ["Unused native group"],
            targets: [{ endpoint: "Study - Smart light", capability: "On / Off" }],
            usage: { state: "unused", relationship_names: [], safe_to_reclaim: true },
          },
        ],
      } as T;
    }
    if (message.type === "matter_binding_studio/prepare_remove_acl") {
      const entries = [
        {
          entry_index: 2,
          kind: "operate",
          auth_mode: "case",
          subjects: ["Retired controller"],
          targets: [{ endpoint: "Study - Smart light", capability: "Color temperature" }],
          usage: { state: "unused", relationship_names: [], safe_to_reclaim: true },
        },
        {
          entry_index: 3,
          kind: "operate",
          auth_mode: "group",
          subjects: ["Unused native group"],
          targets: [{ endpoint: "Study - Smart light", capability: "On / Off" }],
          usage: { state: "unused", relationship_names: [], safe_to_reclaim: true },
        },
      ].filter((entry) => Array.isArray(message.entry_indexes) ? message.entry_indexes.includes(entry.entry_index) : entry.entry_index === message.entry_index);
      return {
        plan_id: "preview-acl-removal",
        expires_in_seconds: 300,
        target: previewSnapshot.devices[1],
        entry: entries[0],
        entries,
        capacity_before: { used: 3, maximum: 4, available: 1, targets_per_entry: 3 },
        steps: [
          "Preview only — no ACL will be changed.",
          "The remaining ACL table would be read back after removal.",
        ],
      } as T;
    }
    if (message.type === "matter_binding_studio/apply_remove_acl") {
      return {
        success: true,
        verified: true,
        message: "Preview ACL reclaim completed. No Matter device was changed.",
      } as T;
    }
    if (message.type === "matter_binding_studio/prepare_cleanup_group") {
      return {
        plan_id: "preview-group-cleanup",
        expires_in_seconds: 300,
        group_id: 32768,
        name: "Study smart lighting control set",
        source: previewSnapshot.devices[0],
        members: [previewSnapshot.devices[1], previewSnapshot.devices[2]],
        clusters: [6, 8, 768],
        steps: [
          "Preview only — no group state will be changed.",
          "The group membership and Binding table would be read back after cleanup.",
        ],
      } as T;
    }
    if (message.type === "matter_binding_studio/apply_cleanup_group") {
      previewSnapshot.native_control_sets = [];
      return {
        success: true,
        verified: true,
        message: "Preview native group cleanup completed. No Matter device was changed.",
      } as T;
    }
    const clusters = Array.isArray(message.clusters)
      ? message.clusters.map(Number)
      : [];
    if (message.type === "matter_binding_studio/prepare_unicast") {
      return {
        plan_id: "preview-direct",
        expires_in_seconds: 300,
        route: "direct",
        source: previewSnapshot.devices[0],
        target: previewSnapshot.devices.find((device) =>
          device.node_id === message.target_node_id && device.endpoint_id === message.target_endpoint_id,
        ),
        clusters,
        existing_binding_count: 0,
        acl: "will_add",
        acl_capacity: {
          used: 2,
          maximum: 4,
          available: 2,
          targets_per_entry: 3,
          entries_to_add: 1,
        },
        steps: ["Preview only — no device will be changed."],
        steps_i18n: [{ code: "step_read_binding_acl" }, { code: "step_grant_source" }, { code: "step_write_binding" }, { code: "step_verify_binding" }],
      } as T;
    }
    if (message.type === "matter_binding_studio/prepare_groupcast") {
      const targets = Array.isArray(message.targets) ? message.targets : [];
      const selected = previewSnapshot.devices.filter((device) =>
        targets.some((target) =>
          typeof target === "object" && target !== null
          && device.node_id === (target as { node_id?: number }).node_id
          && device.endpoint_id === (target as { endpoint_id?: number }).endpoint_id,
        ),
      );
      return {
        plan_id: "preview-groupcast",
        expires_in_seconds: 300,
        route: "native_group",
        source: previewSnapshot.devices[0],
        targets: selected,
        clusters,
        coverage: clusters.map((cluster_id) => ({
          cluster_id,
          supported_members: selected.filter((target) => target.server_capabilities.includes(cluster_id)).length,
          total_members: selected.length,
          unsupported_members: selected
            .filter((target) => !target.server_capabilities.includes(cluster_id))
            .map((target) => target.name),
        })),
        replaces_direct_binding: false,
        steps: ["Preview only — no group, Group Key, ACL, or Binding will be changed."],
        steps_i18n: [{ code: "step_read_group_capacity" }, { code: "step_provision_key" }, { code: "step_add_members" }, { code: "step_grant_group" }, { code: "step_replace_direct" }, { code: "step_verify_group" }],
      } as T;
    }
    if (message.type === "matter_binding_studio/prepare_remove_binding") {
      return {
        plan_id: "preview-removal",
        expires_in_seconds: 300,
        route: "direct",
        source: previewSnapshot.devices[0],
        clusters: [6, 8],
        removed_entry_count: 2,
        keeps_native_group: false,
        steps: [
          "Preview only — no Binding will be changed.",
          "The source Binding Cluster would be read back after removal.",
        ],
      } as T;
    }
    if (message.type === "matter_binding_studio/apply_remove_binding") {
      previewSnapshot.relationships = [];
      return {
        success: true,
        verified: true,
        message: "Preview removal completed. No Matter device was changed.",
      } as T;
    }
    return {
      success: true,
      verified: true,
      message: "Preview completed. No Matter device was changed.",
    } as T;
  },
};

function Preview() {
  const [language, setLanguage] = useState("zh-Hant");
  const [scenario, setScenario] = useState("normal");
  const hass: HomeAssistant = { ...previewHass, locale: { language }, async callWS<T>(request: { type: string; [key: string]: unknown }): Promise<T> {
    if (scenario === "acl-full" && request.type.includes("/prepare_")) {
      throw { code: "plan_failed", message: "The target ACL is full (3/3).", studio_message: { code: "acl_full", params: { used: 3, maximum: 3 } } };
    }
    return previewHass.callWS<T>(request);
  } };
  return <>
    <div style={{ padding: 12, display: "flex", flexWrap: "wrap", gap: 12 }}>
      <span>Preview only · 模擬資料，不連線 HA</span>
      <select aria-label="Preview language" value={language} onChange={e => setLanguage(e.target.value)}><option value="zh-Hant">繁體中文</option><option value="zh-Hans">简体中文</option><option value="en">English</option></select>
      <select aria-label="Preview scenario" value={scenario} onChange={e => setScenario(e.target.value)}><option value="normal">Normal</option><option value="acl-full">ACL full error</option></select>
    </div>
    <App hass={hass} />
  </>;
}

const previewRoot = createRoot(document.getElementById("root")!);
import.meta.hot?.dispose(() => previewRoot.unmount());
previewRoot.render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
