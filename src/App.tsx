import { useCallback, useEffect, useRef, useState } from "react";
import { copy, type Copy, type Language } from "./copy";

export interface HomeAssistant {
  callWS<T>(message: { type: string }): Promise<T>;
  language?: string;
  locale?: { language?: string };
}

type Endpoint = {
  node_id: number | null;
  endpoint_id: number | null;
  name: string;
  area_name: string | null;
  capabilities: number[];
};

type Relationship = {
  id: string;
  source: Endpoint;
  targets: {
    kind: "endpoint" | "group";
    name: string;
    members: Endpoint[];
  };
  route: "direct" | "native_group";
  clusters: number[];
};

type ControlSet = {
  group_id: number;
  name: string;
  members: Endpoint[];
  clusters: number[];
  active_relationships: number;
};

type Capacity = {
  node_id: number;
  name: string;
  max_groups_per_fabric: number | null;
  max_group_keys_per_fabric: number | null;
  group_table_entries: number | null;
  group_key_map_entries: number | null;
  status: "available" | "unavailable";
};

export type StudioSnapshot = {
  relationships: Relationship[];
  native_control_sets: ControlSet[];
  capacities: Capacity[];
  warnings: string[];
};

export default function App({ hass }: { hass?: HomeAssistant }) {
  const language = resolveLanguage(hass);
  const t = copy[language];
  const hassRef = useRef(hass);
  const hasLoadedRef = useRef(false);
  const [snapshot, setSnapshot] = useState<StudioSnapshot | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [readFailed, setReadFailed] = useState(false);

  // Home Assistant replaces `hass` whenever any state changes. Keep only the
  // latest client reference, rather than treating every replacement as a
  // reason to fetch the Matter fabric again.
  hassRef.current = hass;

  const refresh = useCallback(async () => {
    const activeHass = hassRef.current;
    if (!activeHass) return;
    setRefreshing(true);
    setReadFailed(false);
    try {
      setSnapshot(
        await activeHass.callWS<StudioSnapshot>({
          type: "matter_binding_studio/get_snapshot",
        }),
      );
    } catch {
      setReadFailed(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!hass || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    void refresh();
  }, [hass]);

  const initialLoading = Boolean(hass) && snapshot === null && refreshing;

  return (
    <div className="mbs-root">
      <main className="mbs-panel">
        <header className="mbs-header">
          <div>
            <span className="mbs-eyebrow">{t.readOnly}</span>
            <h1>{t.appName}</h1>
            <p>{t.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={!hass || refreshing}
            aria-busy={refreshing}
          >
            {refreshing && snapshot ? t.refreshing : t.refresh}
          </button>
        </header>

        <p className="mbs-scope">{t.scope}</p>

        {!hass ? <p className="mbs-notice">{t.notConnected}</p> : null}
        {readFailed ? <p className="mbs-warning">{t.readFailed}</p> : null}
        {snapshot?.warnings.map((warning) => (
          <p className="mbs-warning" key={warning}>
            {warning}
          </p>
        ))}

        {initialLoading ? <p className="mbs-loading">{t.loading}</p> : null}
        {snapshot ? <StudioData snapshot={snapshot} t={t} /> : null}
      </main>
    </div>
  );
}

function StudioData({ snapshot, t }: { snapshot: StudioSnapshot; t: Copy }) {
  return (
    <div className="mbs-content">
      <section>
        <SectionTitle title={t.controlRelationships} count={snapshot.relationships.length} />
        <p className="mbs-description">{t.relationshipDescription}</p>
        {snapshot.relationships.length ? (
          <div className="mbs-list">
            {snapshot.relationships.map((relationship) => (
              <RelationshipRow key={relationship.id} relationship={relationship} t={t} />
            ))}
          </div>
        ) : (
          <Empty text={t.noRelationships} />
        )}
      </section>

      <section>
        <SectionTitle title={t.controlSets} count={snapshot.native_control_sets.length} />
        <p className="mbs-description">{t.controlSetsDescription}</p>
        {snapshot.native_control_sets.length ? (
          <div className="mbs-list">
            {snapshot.native_control_sets.map((controlSet) => (
              <article className="mbs-card" key={controlSet.group_id}>
                <div className="mbs-card-topline">
                  <strong>{controlSet.name}</strong>
                  <CapabilityList clusters={controlSet.clusters} t={t} />
                </div>
                <p className="mbs-meta">
                  {controlSet.members.length} {t.members} · {controlSet.active_relationships} {t.activeRelationships}
                </p>
                <MemberList members={controlSet.members} />
              </article>
            ))}
          </div>
        ) : (
          <Empty text={t.noControlSets} />
        )}
      </section>

      <section>
        <SectionTitle title={t.capacity} count={snapshot.capacities.length} />
        <p className="mbs-description">{t.capacityDescription}</p>
        <div className="mbs-capacity-grid">
          {snapshot.capacities.map((capacity) => (
            <article className="mbs-capacity" key={capacity.node_id}>
              <strong>{capacity.name}</strong>
              {capacity.status === "available" ? (
                <div className="mbs-capacity-values">
                  <CapacityValue
                    label={t.groups}
                    used={capacity.group_table_entries}
                    maximum={capacity.max_groups_per_fabric}
                    unavailable={t.unavailable}
                  />
                  <CapacityValue
                    label={t.groupKeys}
                    used={capacity.group_key_map_entries}
                    maximum={capacity.max_group_keys_per_fabric}
                    unavailable={t.unavailable}
                  />
                </div>
              ) : (
                <p className="mbs-meta">{t.unavailable}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function RelationshipRow({
  relationship,
  t,
}: {
  relationship: Relationship;
  t: Copy;
}) {
  const members = relationship.targets.members;
  const targetName =
    relationship.route === "native_group"
      ? relationship.targets.name
      : members[0]?.name ?? relationship.targets.name;
  return (
    <article className="mbs-card">
      <div className="mbs-card-topline">
        <div className="mbs-route">
          <EndpointName endpoint={relationship.source} />
          <span aria-hidden="true">→</span>
          <div>
            <strong>{targetName}</strong>
            {relationship.route === "native_group" ? (
              <p className="mbs-meta">
                {members.length} {t.members}
              </p>
            ) : null}
          </div>
        </div>
        <span className="mbs-route-label">
          {relationship.route === "native_group" ? t.nativeGroup : t.direct}
        </span>
      </div>
      <CapabilityList clusters={relationship.clusters} t={t} />
      {relationship.route === "native_group" ? <MemberList members={members} /> : null}
    </article>
  );
}

function EndpointName({ endpoint }: { endpoint: Endpoint }) {
  return (
    <div>
      <strong>{endpoint.name}</strong>
      {endpoint.area_name ? <p className="mbs-meta">{endpoint.area_name}</p> : null}
    </div>
  );
}

function CapabilityList({ clusters, t }: { clusters: number[]; t: Copy }) {
  return clusters.length ? (
    <div className="mbs-chips">
      {clusters.map((cluster) => (
        <span key={cluster}>{clusterName(cluster, t)}</span>
      ))}
    </div>
  ) : null;
}

function MemberList({ members }: { members: Endpoint[] }) {
  return members.length ? (
    <div className="mbs-members">
      {members.map((member) => (
        <span key={`${member.node_id}-${member.endpoint_id}`}>{member.name}</span>
      ))}
    </div>
  ) : null;
}

function CapacityValue({
  label,
  used,
  maximum,
  unavailable,
}: {
  label: string;
  used: number | null;
  maximum: number | null;
  unavailable: string;
}) {
  return (
    <div>
      <small>{label}</small>
      <strong>{used !== null && maximum !== null ? `${used} / ${maximum}` : unavailable}</strong>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="mbs-section-title">
      <h2>{title}</h2>
      <span>{count}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="mbs-empty">{text}</p>;
}

function resolveLanguage(hass?: HomeAssistant): Language {
  const language = hass?.locale?.language ?? hass?.language ?? "en";
  return language.toLowerCase().startsWith("zh") ? "zh-Hant" : "en";
}

function clusterName(cluster: number, t: Copy): string {
  if (cluster === 6) return t.onOff;
  if (cluster === 8) return t.brightness;
  if (cluster === 768) return t.colorTemperature;
  return String(cluster);
}
