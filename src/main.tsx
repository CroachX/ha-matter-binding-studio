import { StrictMode } from "react";
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
  native_control_sets: [],
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

const previewHass: HomeAssistant = {
  locale: { language: "zh-Hant" },
  async callWS<T>(message: { type: string; [key: string]: unknown }): Promise<T> {
    if (message.type === "matter_binding_studio/get_snapshot") {
      return previewSnapshot as T;
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
        ],
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
          entries_to_add: clusters.length,
        },
        steps: ["Preview only — no device will be changed."],
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App hass={previewHass} />
  </StrictMode>,
);
