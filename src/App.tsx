import { useCallback, useEffect, useRef, useState } from "react";
import { copy, type Copy, type Language } from "./copy";

export interface HomeAssistant {
  callWS<T>(message: { type: string; [key: string]: unknown }): Promise<T>;
  language?: string;
  locale?: { language?: string };
}

type Endpoint = {
  node_id: number | null;
  endpoint_id: number | null;
  node_name: string;
  name: string;
  area_name: string | null;
  capabilities: number[];
  client_capabilities: number[];
  server_capabilities: number[];
  can_bind: boolean;
  can_be_target: boolean;
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
  devices: Endpoint[];
  relationships: Relationship[];
  native_control_sets: ControlSet[];
  capacities: Capacity[];
  warnings: string[];
};

type UnicastPlan = {
  plan_id: string;
  expires_in_seconds: number;
  route: "direct";
  source: Endpoint;
  target: Endpoint;
  clusters: number[];
  existing_binding_count: number;
  acl: "will_add" | "already_granted";
  steps: string[];
};

type ApplyResult = {
  success: boolean;
  verified: boolean;
  repair_needed?: boolean;
  message: string;
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
            <span className="mbs-eyebrow">{t.directBinding}</span>
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
        {snapshot ? (
          <>
            <UnicastComposer
              hass={hass}
              snapshot={snapshot}
              refresh={refresh}
              t={t}
            />
            <StudioData snapshot={snapshot} t={t} />
          </>
        ) : null}
      </main>
    </div>
  );
}

function UnicastComposer({
  hass,
  snapshot,
  refresh,
  t,
}: {
  hass?: HomeAssistant;
  snapshot: StudioSnapshot;
  refresh: () => Promise<void>;
  t: Copy;
}) {
  const [sourceKey, setSourceKey] = useState("");
  const [targetKey, setTargetKey] = useState("");
  const [sameAreaOnly, setSameAreaOnly] = useState(true);
  const [clusters, setClusters] = useState<number[]>([]);
  const [plan, setPlan] = useState<UnicastPlan | null>(null);
  const [working, setWorking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sources = snapshot.devices.filter((device) => device.can_bind);
  const source = sources.find((device) => endpointKey(device) === sourceKey);
  const availableTargets = snapshot.devices.filter(
    (device) => device.can_be_target && endpointKey(device) !== sourceKey,
  );
  const targets = sameAreaOnly && source?.area_name
    ? availableTargets.filter((device) => device.area_name === source.area_name)
    : availableTargets;
  const target = targets.find((device) => endpointKey(device) === targetKey);
  const compatibleClusters = source && target
    ? compatibleClustersFor(source, target)
    : [];

  const chooseSource = (value: string) => {
    const nextSource = sources.find((device) => endpointKey(device) === value);
    const selectedTarget = availableTargets.find(
      (device) => endpointKey(device) === targetKey,
    );
    setSourceKey(value);
    const keepsTarget = !(
      targetKey === value
      || (sameAreaOnly && !sameArea(nextSource, selectedTarget))
    );
    if (!keepsTarget) {
      setTargetKey("");
    }
    setClusters(keepsTarget ? compatibleClustersFor(nextSource, selectedTarget) : []);
    setPlan(null);
    setMessage(null);
  };
  const chooseTarget = (value: string) => {
    const nextTarget = targets.find((device) => endpointKey(device) === value);
    setTargetKey(value);
    setClusters(compatibleClustersFor(source, nextTarget));
    setPlan(null);
    setMessage(null);
  };
  const chooseSameAreaOnly = (checked: boolean) => {
    setSameAreaOnly(checked);
    const selectedTarget = availableTargets.find(
      (device) => endpointKey(device) === targetKey,
    );
    if (checked && !sameArea(source, selectedTarget)) {
      setTargetKey("");
      setClusters([]);
      setPlan(null);
    }
  };
  const toggleCluster = (cluster: number) => {
    setPlan(null);
    setClusters((selected) =>
      selected.includes(cluster)
        ? selected.filter((item) => item !== cluster)
        : [...selected, cluster],
    );
  };

  const prepare = async () => {
    if (!hass || !source || !target || !clusters.length) return;
    setWorking(true);
    setMessage(null);
    try {
      const nextPlan = await hass.callWS<UnicastPlan>({
        type: "matter_binding_studio/prepare_unicast",
        source_node_id: source.node_id,
        source_endpoint_id: source.endpoint_id,
        target_node_id: target.node_id,
        target_endpoint_id: target.endpoint_id,
        clusters,
      });
      setConfirmed(false);
      setPlan(nextPlan);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setWorking(false);
    }
  };

  const apply = async () => {
    if (!hass || !plan || !confirmed) return;
    setWorking(true);
    setMessage(null);
    try {
      const result = await hass.callWS<ApplyResult>({
        type: "matter_binding_studio/apply_unicast",
        plan_id: plan.plan_id,
        confirm: true,
      });
      setMessage(result.message);
      if (result.success && result.verified) {
        await refresh();
      }
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      // A reviewed plan is single-use, even when its write needs repair.
      setPlan(null);
      setConfirmed(false);
      setWorking(false);
    }
  };

  return (
    <section className="mbs-composer">
      <div className="mbs-section-title">
        <h2>{t.addRelationship}</h2>
        <span>{t.direct}</span>
      </div>
      <p className="mbs-description">{t.addRelationshipDescription}</p>
      <div className="mbs-form-grid">
        <label>
          <span>{t.source}</span>
          <select value={sourceKey} onChange={(event) => chooseSource(event.target.value)}>
            <option value="" disabled>{t.chooseSource}</option>
            {sources.map((device) => (
              <option key={endpointKey(device)} value={endpointKey(device)}>
                {endpointLabel(device)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t.target}</span>
          <select value={targetKey} onChange={(event) => chooseTarget(event.target.value)}>
            <option value="" disabled>{t.chooseTarget}</option>
            {targets.map((device) => (
              <option key={endpointKey(device)} value={endpointKey(device)}>
                {endpointLabel(device)}
              </option>
            ))}
          </select>
        </label>
        <label className="mbs-area-filter">
          <input
            type="checkbox"
            checked={sameAreaOnly}
            onChange={(event) => chooseSameAreaOnly(event.target.checked)}
          />
          <span>{t.sameAreaOnly}</span>
        </label>
      </div>
      {source && target ? (
        <fieldset className="mbs-capability-picker">
          <legend>{t.capabilities}</legend>
          {compatibleClusters.length ? compatibleClusters.map((cluster) => (
            <label key={cluster}>
              <input
                type="checkbox"
                checked={clusters.includes(cluster)}
                onChange={() => toggleCluster(cluster)}
              />
              {clusterName(cluster, t)}
            </label>
          )) : <p className="mbs-warning">{t.noSharedCapabilities}</p>}
        </fieldset>
      ) : null}
      <div className="mbs-actions">
        <button
          type="button"
          onClick={() => void prepare()}
          disabled={!source || !target || !clusters.length || working}
        >
          {working ? t.working : t.reviewPlan}
        </button>
      </div>
      {plan ? (
        <div className="mbs-review">
          <strong>{t.reviewTitle}</strong>
          <p>{endpointLabel(plan.source)} → {endpointLabel(plan.target)}</p>
          <CapabilityList clusters={plan.clusters} t={t} />
          <ul>
            {plan.steps.map((step) => <li key={step}>{step}</li>)}
          </ul>
          <p className="mbs-meta">
            {plan.acl === "will_add" ? t.aclWillAdd : t.aclAlreadyGranted}
          </p>
          <label className="mbs-confirm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            {t.confirmWrite}
          </label>
          <button type="button" onClick={() => void apply()} disabled={!confirmed || working}>
            {working ? t.working : t.applyBinding}
          </button>
        </div>
      ) : null}
      {message ? <p className="mbs-warning">{message}</p> : null}
    </section>
  );
}

function endpointKey(endpoint: Endpoint): string {
  return `${endpoint.node_id}:${endpoint.endpoint_id}`;
}

function endpointLabel(endpoint: Endpoint): string {
  const area = endpoint.area_name?.trim() || "";
  const name = stripAreaPrefix(endpoint.name.trim(), area);
  const deviceLayer = endpointDeviceLayer(endpoint, name);
  const prefix = area ? `${area} - ` : "";
  return deviceLayer ? `${prefix}${deviceLayer} · ${name}` : `${prefix}${name}`;
}

function endpointDeviceLayer(endpoint: Endpoint, endpointName: string): string | null {
  const nodeName = stripAreaPrefix(
    endpoint.node_name?.trim() || "",
    endpoint.area_name?.trim() || "",
  );
  if (!nodeName || sameLabel(nodeName, endpointName)) {
    return null;
  }
  return nodeName;
}

function stripAreaPrefix(value: string, area: string): string {
  let result = value;
  if (area) {
    const areaPrefix = new RegExp(`^${escapeRegExp(area)}\\s*[-–—]\\s*`);
    result = result.replace(areaPrefix, "").trim();
  }
  return result;
}

function sameArea(source?: Endpoint, target?: Endpoint): boolean {
  return Boolean(source?.area_name && target?.area_name && source.area_name === target.area_name);
}

function compatibleClustersFor(source?: Endpoint, target?: Endpoint): number[] {
  if (!source || !target) return [];
  return source.client_capabilities.filter((cluster) =>
    target.server_capabilities.includes(cluster),
  );
}

function sameLabel(left: string, right: string): boolean {
  return normaliseLabel(left) === normaliseLabel(right);
}

function normaliseLabel(value: string): string {
  return value.toLocaleLowerCase().replace(/[\s\-–—]/g, "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      message?: unknown;
      error?: { message?: unknown };
    };
    if (typeof candidate.message === "string" && candidate.message) {
      return candidate.message;
    }
    if (typeof candidate.error?.message === "string" && candidate.error.message) {
      return candidate.error.message;
    }
  }
  return "The requested Matter operation failed.";
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
      : members[0] ? endpointLabel(members[0]) : relationship.targets.name;
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
      <strong>{endpointLabel(endpoint)}</strong>
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
        <span key={`${member.node_id}-${member.endpoint_id}`}>{endpointLabel(member)}</span>
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
