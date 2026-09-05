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
    group_id?: number;
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
  managed_by_studio?: boolean;
  status?: "active" | "pending" | "repair_needed";
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
  acl_capacity?: AclCapacity;
  steps: string[];
};

type GroupcastPlan = {
  plan_id: string;
  expires_in_seconds: number;
  route: "native_group";
  source: Endpoint;
  targets: Endpoint[];
  clusters: number[];
  coverage: CapabilityCoverage[];
  replaces_direct_binding: boolean;
  acl_capacity?: Array<AclCapacity & { target: Endpoint }>;
  steps: string[];
};

type BindingPlan = UnicastPlan | GroupcastPlan;

type CapabilityCoverage = {
  cluster_id: number;
  supported_members: number;
  total_members: number;
  unsupported_members: string[];
};

type ApplyResult = {
  success: boolean;
  verified: boolean;
  repair_needed?: boolean;
  message: string;
};

type RemovalPlan = {
  plan_id: string;
  expires_in_seconds: number;
  route: "direct" | "native_group";
  source: Endpoint;
  clusters: number[];
  removed_entry_count: number;
  keeps_native_group: boolean;
  steps: string[];
};

type AclCapacity = {
  used: number | null;
  maximum: number | null;
  available: number | null;
  targets_per_entry: number | null;
  entries_to_add?: number;
};

type AclTarget = {
  endpoint: string;
  capability: string;
};

type AclEntry = {
  entry_index: number;
  kind: "administrator" | "operate";
  auth_mode: "case" | "group" | "other";
  subjects: string[];
  targets: AclTarget[];
  usage: {
    state: "protected" | "used" | "unused" | "unknown";
    relationship_names: string[];
    safe_to_reclaim: boolean;
  };
};

type AclOverview = {
  target: Endpoint;
  capacity: AclCapacity;
  entries: AclEntry[];
};

type AclRemovalPlan = {
  plan_id: string;
  expires_in_seconds: number;
  target: Endpoint;
  entry: AclEntry;
  capacity_before: AclCapacity;
  steps: string[];
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
            <BindingComposer
              hass={hass}
              snapshot={snapshot}
              refresh={refresh}
              t={t}
            />
            <StudioData hass={hass} snapshot={snapshot} refresh={refresh} t={t} />
          </>
        ) : null}
      </main>
    </div>
  );
}

function BindingComposer({
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
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  // Before an operator chooses a source, every eligible target should remain
  // visible. Choosing a source starts with the helpful same-area filter on.
  const [sameAreaOnly, setSameAreaOnly] = useState(false);
  const [clusters, setClusters] = useState<number[]>([]);
  const [plan, setPlan] = useState<BindingPlan | null>(null);
  const [working, setWorking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);

  const sources = snapshot.devices.filter((device) => device.can_bind);
  const source = sources.find((device) => endpointKey(device) === sourceKey);
  const availableTargets = snapshot.devices
    .filter((device) => device.can_be_target && endpointKey(device) !== sourceKey)
    .sort(compareEndpoints);
  const targets = sameAreaOnly && source?.area_name
    ? availableTargets.filter((device) => device.area_name === source.area_name)
    : availableTargets;
  const selectedTargets = targets.filter((device) => targetKeys.includes(endpointKey(device)));
  const compatibleClusters = compatibleClustersForTargets(source, selectedTargets);
  const coverage = capabilityCoverage(source, selectedTargets, compatibleClusters);
  const route = selectedTargets.length > 1 ? "native_group" : "direct";

  const chooseSource = (value: string) => {
    const nextSource = sources.find((device) => endpointKey(device) === value);
    const selected = availableTargets.filter((device) => targetKeys.includes(endpointKey(device)));
    const nextSameAreaOnly = Boolean(nextSource?.area_name);
    setSourceKey(value);
    setSameAreaOnly(nextSameAreaOnly);
    const nextTargets = selected.filter((target) =>
      endpointKey(target) !== value && (!nextSameAreaOnly || sameArea(nextSource, target)),
    );
    setTargetKeys(nextTargets.map(endpointKey));
    setClusters(compatibleClustersForTargets(nextSource, nextTargets));
    setPlan(null);
    setMessage(null);
  };
  const chooseTargets = (values: string[]) => {
    const nextTargets = targets.filter((device) => values.includes(endpointKey(device)));
    setTargetKeys(nextTargets.map(endpointKey));
    setClusters(compatibleClustersForTargets(source, nextTargets));
    setPlan(null);
    setMessage(null);
  };
  const chooseSameAreaOnly = (checked: boolean) => {
    setSameAreaOnly(checked);
    const nextTargets = checked
      ? selectedTargets.filter((target) => sameArea(source, target))
      : selectedTargets;
    setTargetKeys(nextTargets.map(endpointKey));
    setClusters(compatibleClustersForTargets(source, nextTargets));
    setPlan(null);
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
    if (!hass || !source || !selectedTargets.length || !clusters.length) return;
    setWorking(true);
    setMessage(null);
    try {
      const nextPlan = selectedTargets.length === 1
        ? await hass.callWS<UnicastPlan>({
            type: "matter_binding_studio/prepare_unicast",
            source_node_id: source.node_id,
            source_endpoint_id: source.endpoint_id,
            target_node_id: selectedTargets[0].node_id,
            target_endpoint_id: selectedTargets[0].endpoint_id,
            clusters,
          })
        : await hass.callWS<GroupcastPlan>({
            type: "matter_binding_studio/prepare_groupcast",
            source_node_id: source.node_id,
            source_endpoint_id: source.endpoint_id,
            targets: selectedTargets.map((target) => ({
              node_id: target.node_id,
              endpoint_id: target.endpoint_id,
            })),
            clusters,
          });
      setConfirmed(false);
      setPlan(nextPlan);
    } catch (error) {
      setMessage(errorMessage(error));
      setMessageIsError(true);
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
        type: plan.route === "direct"
          ? "matter_binding_studio/apply_unicast"
          : "matter_binding_studio/apply_groupcast",
        plan_id: plan.plan_id,
        confirm: true,
      });
      setMessage(result.message);
      setMessageIsError(!result.success || !result.verified);
      if (result.success && result.verified) {
        await refresh();
      }
    } catch (error) {
      setMessage(errorMessage(error));
      setMessageIsError(true);
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
        <span>{route === "native_group" ? t.nativeGroup : t.direct}</span>
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
        <fieldset className="mbs-target-picker">
          <legend>{t.targets}</legend>
          {targets.length ? targets.map((device) => {
            const key = endpointKey(device);
            return (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={targetKeys.includes(key)}
                  onChange={(event) => chooseTargets(
                    event.target.checked
                      ? [...targetKeys, key]
                      : targetKeys.filter((candidate) => candidate !== key),
                  )}
                />
                <span>{endpointLabel(device)}</span>
              </label>
            );
          }) : <p className="mbs-meta">{t.noTargets}</p>}
        </fieldset>
        <label className="mbs-area-filter">
          <input
            type="checkbox"
            checked={sameAreaOnly}
            onChange={(event) => chooseSameAreaOnly(event.target.checked)}
          />
          <span>{t.sameAreaOnly}</span>
        </label>
      </div>
      {source && selectedTargets.length ? (
        <fieldset className="mbs-capability-picker">
          <legend>{t.capabilities}</legend>
          {compatibleClusters.length ? compatibleClusters.map((cluster) => (
            <label key={cluster}>
              <input
                type="checkbox"
                checked={clusters.includes(cluster)}
                onChange={() => toggleCluster(cluster)}
              />
              <span>{clusterName(cluster, t)}</span>
              <small className={coverageFor(coverage, cluster)?.supported_members === selectedTargets.length ? "" : "mbs-partial"}>
                {coverageLabel(coverageFor(coverage, cluster), t)}
              </small>
            </label>
          )) : <p className="mbs-warning">{t.noSharedCapabilities}</p>}
        </fieldset>
      ) : null}
      <div className="mbs-actions">
        <button
          type="button"
          onClick={() => void prepare()}
          disabled={!source || !selectedTargets.length || !clusters.length || working}
        >
          {working ? t.working : t.reviewPlan}
        </button>
      </div>
      {plan ? (
        <div className="mbs-review">
          <strong>{t.reviewTitle}</strong>
          <p>
            {endpointLabel(plan.source)} → {plan.route === "direct"
              ? endpointLabel(plan.target)
              : `${plan.targets.length} ${t.members}`}
          </p>
          <CapabilityList clusters={plan.clusters} t={t} />
          {plan.route === "native_group" ? (
            <>
              <MemberList members={plan.targets} />
              <PlanCoverage coverage={plan.coverage} t={t} />
              {plan.replaces_direct_binding ? <p className="mbs-meta">{t.replacesDirect}</p> : null}
            </>
          ) : null}
          <ul>
            {plan.steps.map((step) => <li key={step}>{step}</li>)}
          </ul>
          <p className="mbs-meta">
            {plan.route === "direct"
              ? (plan.acl === "will_add" ? t.aclWillAdd : t.aclAlreadyGranted)
              : t.groupAclReview}
          </p>
          {plan.route === "direct" && plan.acl_capacity ? (
            <AclCapacitySummary capacity={plan.acl_capacity} t={t} />
          ) : null}
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
      {message ? <p className={messageIsError ? "mbs-warning" : "mbs-success"}>{message}</p> : null}
    </section>
  );
}

function endpointKey(endpoint: Endpoint): string {
  return `${endpoint.node_id}:${endpoint.endpoint_id}`;
}

const endpointCollator = new Intl.Collator("zh-Hant", {
  numeric: true,
  sensitivity: "base",
});

function compareEndpoints(left: Endpoint, right: Endpoint): number {
  return (
    endpointCollator.compare(left.area_name ?? "", right.area_name ?? "") ||
    endpointCollator.compare(left.node_name ?? "", right.node_name ?? "") ||
    endpointCollator.compare(left.name, right.name) ||
    (left.node_id ?? Number.MAX_SAFE_INTEGER) - (right.node_id ?? Number.MAX_SAFE_INTEGER) ||
    (left.endpoint_id ?? Number.MAX_SAFE_INTEGER) - (right.endpoint_id ?? Number.MAX_SAFE_INTEGER)
  );
}

function endpointLabel(endpoint: Endpoint): string {
  const area = endpoint.area_name?.trim() || "";
  // `name` is the user-facing HA entity name. Keep it intact: an area prefix
  // can be meaningful when one controller exposes endpoints for multiple rooms.
  const name = endpoint.name.trim();
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

function compatibleClustersForTargets(source?: Endpoint, targets: Endpoint[] = []): number[] {
  if (!source || !targets.length) return [];
  return source.client_capabilities.filter((cluster) =>
    targets.some((target) => target.server_capabilities.includes(cluster)),
  );
}

function capabilityCoverage(
  source: Endpoint | undefined,
  targets: Endpoint[],
  clusters: number[],
): CapabilityCoverage[] {
  if (!source) return [];
  return clusters.map((cluster_id) => {
    const supported = targets.filter((target) => target.server_capabilities.includes(cluster_id));
    return {
      cluster_id,
      supported_members: supported.length,
      total_members: targets.length,
      unsupported_members: targets
        .filter((target) => !supported.includes(target))
        .map(endpointLabel),
    };
  });
}

function coverageFor(coverage: CapabilityCoverage[], cluster: number): CapabilityCoverage | undefined {
  return coverage.find((item) => item.cluster_id === cluster);
}

function coverageLabel(coverage: CapabilityCoverage | undefined, t: Copy): string {
  if (!coverage) return "";
  const status = coverage.supported_members === coverage.total_members ? t.coverageReady : t.coveragePartial;
  return `${coverage.supported_members} / ${coverage.total_members} ${status}`;
}

function formatCount(template: string, count: number): string {
  return template.replace("{count}", String(count));
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

function StudioData({
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
  const [removalPlan, setRemovalPlan] = useState<RemovalPlan | null>(null);
  const [removalRelationship, setRemovalRelationship] = useState<Relationship | null>(null);
  const [removalConfirmed, setRemovalConfirmed] = useState(false);
  const [removalWorking, setRemovalWorking] = useState(false);
  const [removalMessage, setRemovalMessage] = useState<string | null>(null);
  const [removalMessageIsError, setRemovalMessageIsError] = useState(false);

  const reviewRemoval = async (relationship: Relationship) => {
    if (!hass || relationship.source.node_id === null || relationship.source.endpoint_id === null) {
      setRemovalMessage(t.removalUnavailable);
      setRemovalMessageIsError(true);
      return;
    }
    const message: { type: string; [key: string]: unknown } = {
      type: "matter_binding_studio/prepare_remove_binding",
      source_node_id: relationship.source.node_id,
      source_endpoint_id: relationship.source.endpoint_id,
      target_kind: relationship.targets.kind,
    };
    if (relationship.targets.kind === "group") {
      if (relationship.targets.group_id === undefined) {
        setRemovalMessage(t.removalUnavailable);
        setRemovalMessageIsError(true);
        return;
      }
      message.target_group_id = relationship.targets.group_id;
    } else {
      const target = relationship.targets.members[0];
      if (!target || target.node_id === null || target.endpoint_id === null) {
        setRemovalMessage(t.removalUnavailable);
        setRemovalMessageIsError(true);
        return;
      }
      message.target_node_id = target.node_id;
      message.target_endpoint_id = target.endpoint_id;
    }

    setRemovalWorking(true);
    setRemovalMessage(null);
    try {
      setRemovalPlan(await hass.callWS<RemovalPlan>(message));
      setRemovalRelationship(relationship);
      setRemovalConfirmed(false);
    } catch (error) {
      setRemovalMessage(errorMessage(error));
      setRemovalMessageIsError(true);
    } finally {
      setRemovalWorking(false);
    }
  };

  const applyRemoval = async () => {
    if (!hass || !removalPlan || !removalConfirmed) return;
    setRemovalWorking(true);
    setRemovalMessage(null);
    try {
      const result = await hass.callWS<ApplyResult>({
        type: "matter_binding_studio/apply_remove_binding",
        plan_id: removalPlan.plan_id,
        confirm: true,
      });
      setRemovalMessage(result.message);
      setRemovalMessageIsError(!result.success || !result.verified);
      if (result.success && result.verified) {
        await refresh();
      }
    } catch (error) {
      setRemovalMessage(errorMessage(error));
      setRemovalMessageIsError(true);
    } finally {
      // Removal plans are single-use just like creation plans.
      setRemovalPlan(null);
      setRemovalRelationship(null);
      setRemovalConfirmed(false);
      setRemovalWorking(false);
    }
  };

  return (
    <div className="mbs-content">
      <section>
        <SectionTitle title={t.controlRelationships} count={snapshot.relationships.length} />
        <p className="mbs-description">{t.relationshipDescription}</p>
        {snapshot.relationships.length ? (
          <div className="mbs-list">
            {snapshot.relationships.map((relationship) => (
              <RelationshipRow
                key={relationship.id}
                relationship={relationship}
                t={t}
                onReviewRemoval={reviewRemoval}
                removalWorking={removalWorking}
              />
            ))}
          </div>
        ) : (
          <Empty text={t.noRelationships} />
        )}
        {removalPlan && removalRelationship ? (
          <div className="mbs-review mbs-removal-review">
            <strong>{t.removalReviewTitle}</strong>
            <p>
              {endpointLabel(removalRelationship.source)} → {relationshipTargetLabel(removalRelationship)}
            </p>
            <CapabilityList clusters={removalPlan.clusters} t={t} />
            <p className="mbs-meta">
              {removalPlan.removed_entry_count} {t.bindingEntries}
            </p>
            {removalPlan.keeps_native_group ? <p className="mbs-warning">{t.removalKeepsGroup}</p> : null}
            <ul>
              {removalPlan.steps.map((step) => <li key={step}>{step}</li>)}
            </ul>
            <label className="mbs-confirm">
              <input
                type="checkbox"
                checked={removalConfirmed}
                onChange={(event) => setRemovalConfirmed(event.target.checked)}
              />
              {t.confirmRemoval}
            </label>
            <div className="mbs-review-actions">
              <button
                type="button"
                onClick={() => {
                  setRemovalPlan(null);
                  setRemovalRelationship(null);
                  setRemovalConfirmed(false);
                }}
                disabled={removalWorking}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                className="mbs-danger-button"
                onClick={() => void applyRemoval()}
                disabled={!removalConfirmed || removalWorking}
              >
                {removalWorking ? t.working : t.removeBinding}
              </button>
            </div>
          </div>
        ) : null}
        {removalMessage ? (
          <p className={removalMessageIsError ? "mbs-warning" : "mbs-success"}>
            {removalMessage}
          </p>
        ) : null}
      </section>

      <AclInspector hass={hass} snapshot={snapshot} t={t} />

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
                {controlSet.status === "pending" ? (
                  <p className="mbs-warning">{t.controlSetPending}</p>
                ) : null}
                {controlSet.status === "repair_needed" ? (
                  <p className="mbs-warning">{t.controlSetRepairNeeded}</p>
                ) : null}
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

function AclInspector({
  hass,
  snapshot,
  t,
}: {
  hass?: HomeAssistant;
  snapshot: StudioSnapshot;
  t: Copy;
}) {
  const targets = snapshot.devices
    .filter((device) => device.can_be_target && device.node_id !== null && device.endpoint_id !== null)
    .sort(compareEndpoints);
  const [targetKey, setTargetKey] = useState("");
  const [overview, setOverview] = useState<AclOverview | null>(null);
  const [working, setWorking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [removalPlan, setRemovalPlan] = useState<AclRemovalPlan | null>(null);
  const [removalConfirmed, setRemovalConfirmed] = useState(false);
  const [removalMessage, setRemovalMessage] = useState<string | null>(null);
  const [removalFailed, setRemovalFailed] = useState(false);
  const selectedTarget = targets.find((target) => endpointKey(target) === targetKey);

  const readAcl = async () => {
    if (!hass || !selectedTarget || selectedTarget.node_id === null || selectedTarget.endpoint_id === null) return;
    setWorking(true);
    setFailed(false);
    try {
      setOverview(await hass.callWS<AclOverview>({
        type: "matter_binding_studio/get_acl_overview",
        target_node_id: selectedTarget.node_id,
        target_endpoint_id: selectedTarget.endpoint_id,
      }));
    } catch {
      setFailed(true);
      setOverview(null);
    } finally {
      setWorking(false);
    }
  };

  const reviewRemoval = async (entry: AclEntry) => {
    if (!hass || !selectedTarget || selectedTarget.node_id === null || selectedTarget.endpoint_id === null) return;
    setWorking(true);
    setRemovalMessage(null);
    setRemovalFailed(false);
    try {
      setRemovalPlan(await hass.callWS<AclRemovalPlan>({
        type: "matter_binding_studio/prepare_remove_acl",
        target_node_id: selectedTarget.node_id,
        target_endpoint_id: selectedTarget.endpoint_id,
        entry_index: entry.entry_index,
      }));
      setRemovalConfirmed(false);
    } catch (error) {
      setRemovalMessage(errorMessage(error));
      setRemovalFailed(true);
    } finally {
      setWorking(false);
    }
  };

  const applyRemoval = async () => {
    if (!hass || !removalPlan || !removalConfirmed) return;
    setWorking(true);
    setRemovalMessage(null);
    try {
      const result = await hass.callWS<ApplyResult>({
        type: "matter_binding_studio/apply_remove_acl",
        plan_id: removalPlan.plan_id,
        confirm: true,
      });
      setRemovalMessage(result.message);
      setRemovalFailed(!result.success || !result.verified);
      if (result.success && result.verified) {
        await readAcl();
      }
    } catch (error) {
      setRemovalMessage(errorMessage(error));
      setRemovalFailed(true);
    } finally {
      setRemovalPlan(null);
      setRemovalConfirmed(false);
      setWorking(false);
    }
  };

  return (
    <section>
      <SectionTitle title={t.acl} count={overview?.entries.length ?? 0} />
      <p className="mbs-description">{t.aclDescription}</p>
      <div className="mbs-acl-toolbar">
        <label>
          <span>{t.target}</span>
          <select
            value={targetKey}
            onChange={(event) => {
              setTargetKey(event.target.value);
              setOverview(null);
              setFailed(false);
              setRemovalPlan(null);
              setRemovalMessage(null);
            }}
          >
            <option value="" disabled>{t.chooseAclTarget}</option>
            {targets.map((target) => (
              <option key={endpointKey(target)} value={endpointKey(target)}>
                {endpointLabel(target)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void readAcl()}
          disabled={!hass || !selectedTarget || working}
        >
          {working ? t.readingAcl : t.readAcl}
        </button>
      </div>
      {failed ? <p className="mbs-warning">{t.aclReadFailed}</p> : null}
      {overview ? (
        <>
          <AclCapacitySummary capacity={overview.capacity} t={t} />
          <div className="mbs-list">
            {overview.entries.map((entry) => (
              <AclEntryRow
                entry={entry}
                key={entry.entry_index}
                t={t}
                onReviewRemoval={reviewRemoval}
                working={working}
              />
            ))}
          </div>
        </>
      ) : null}
      {removalPlan ? (
        <div className="mbs-review mbs-removal-review">
          <strong>{t.aclRemovalReviewTitle}</strong>
          <AclEntryRow entry={removalPlan.entry} t={t} />
          <p className="mbs-meta">{t.aclRemovalKeepsInUse}</p>
          <ul>{removalPlan.steps.map((step) => <li key={step}>{step}</li>)}</ul>
          <label className="mbs-confirm">
            <input
              type="checkbox"
              checked={removalConfirmed}
              onChange={(event) => setRemovalConfirmed(event.target.checked)}
            />
            {t.confirmAclRemoval}
          </label>
          <div className="mbs-review-actions">
            <button
              type="button"
              onClick={() => {
                setRemovalPlan(null);
                setRemovalConfirmed(false);
              }}
              disabled={working}
            >
              {t.cancel}
            </button>
            <button
              type="button"
              className="mbs-danger-button"
              onClick={() => void applyRemoval()}
              disabled={!removalConfirmed || working}
            >
              {working ? t.working : t.reclaimAcl}
            </button>
          </div>
        </div>
      ) : null}
      {removalMessage ? <p className={removalFailed ? "mbs-warning" : "mbs-success"}>{removalMessage}</p> : null}
    </section>
  );
}

function AclEntryRow({
  entry,
  t,
  onReviewRemoval,
  working = false,
}: {
  entry: AclEntry;
  t: Copy;
  onReviewRemoval?: (entry: AclEntry) => void;
  working?: boolean;
}) {
  const kind = entry.kind === "administrator" ? t.aclAdministrator : t.aclOperate;
  const authMode = entry.auth_mode === "case"
    ? t.aclCase
    : entry.auth_mode === "group"
      ? t.aclGroup
      : t.aclOther;
  const usage = entry.usage.state === "protected"
    ? t.aclProtected
    : entry.usage.state === "used"
      ? t.aclInUse
      : entry.usage.state === "unused"
        ? t.aclUnused
        : t.aclUnknown;
  return (
    <article className="mbs-card mbs-acl-entry">
      <div className="mbs-card-topline">
        <strong>{kind}</strong>
        <span className={`mbs-acl-state mbs-acl-${entry.usage.state}`}>{usage}</span>
      </div>
      <p className="mbs-meta">{authMode}</p>
      <div className="mbs-acl-details">
        <div>
          <small>{t.aclSubjects}</small>
          <p>{entry.subjects.join(", ")}</p>
        </div>
        <div>
          <small>{t.aclTargets}</small>
          <p>{entry.targets.map((target) => `${target.endpoint} · ${target.capability}`).join("；")}</p>
        </div>
      </div>
      {entry.usage.relationship_names.length ? (
        <p className="mbs-meta">{entry.usage.relationship_names.join("；")}</p>
      ) : null}
      {entry.usage.safe_to_reclaim && onReviewRemoval ? (
        <div className="mbs-card-actions">
          <button
            type="button"
            className="mbs-quiet-danger-button"
            onClick={() => onReviewRemoval(entry)}
            disabled={working}
          >
            {t.reviewAclReclaim}
          </button>
        </div>
      ) : null}
    </article>
  );
}

function AclCapacitySummary({ capacity, t }: { capacity: AclCapacity; t: Copy }) {
  const used = capacity.used ?? "–";
  const maximum = capacity.maximum ?? t.unavailable;
  const available = capacity.available ?? "–";
  return (
    <div className="mbs-acl-capacity" aria-label={t.acl}>
      <span>{t.aclUsed}: <strong>{used} / {maximum}</strong></span>
      <span>{t.aclAvailable}: <strong>{available}</strong></span>
      <span>{t.aclTargetsPerRule}: <strong>{capacity.targets_per_entry ?? t.unavailable}</strong></span>
      {capacity.entries_to_add ? (
        <span>{formatCount(t.aclWillAddEntries, capacity.entries_to_add)}</span>
      ) : null}
    </div>
  );
}

function RelationshipRow({
  relationship,
  t,
  onReviewRemoval,
  removalWorking,
}: {
  relationship: Relationship;
  t: Copy;
  onReviewRemoval: (relationship: Relationship) => void;
  removalWorking: boolean;
}) {
  const members = relationship.targets.members;
  const targetName = relationshipTargetLabel(relationship);
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
      <div className="mbs-card-actions">
        <button
          type="button"
          className="mbs-quiet-danger-button"
          onClick={() => onReviewRemoval(relationship)}
          disabled={removalWorking}
        >
          {t.reviewRemoval}
        </button>
      </div>
    </article>
  );
}

function relationshipTargetLabel(relationship: Relationship): string {
  return relationship.route === "native_group"
    ? relationship.targets.name
    : relationship.targets.members[0]
      ? endpointLabel(relationship.targets.members[0])
      : relationship.targets.name;
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

function PlanCoverage({ coverage, t }: { coverage: CapabilityCoverage[]; t: Copy }) {
  return coverage.length ? (
    <div className="mbs-coverage-list">
      {coverage.map((item) => (
        <p key={item.cluster_id} className={item.supported_members === item.total_members ? "mbs-meta" : "mbs-partial"}>
          <strong>{clusterName(item.cluster_id, t)}</strong>
          {" · "}{coverageLabel(item, t)}
          {item.unsupported_members.length
            ? ` · ${t.notSupportedBy}: ${item.unsupported_members.join(", ")}`
            : ""}
        </p>
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
