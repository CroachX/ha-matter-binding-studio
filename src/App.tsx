import { useCallback, useEffect, useRef, useState } from "react";
import BindingList from "./BindingList";
import SupportPanel, { RecoveryAdvice } from "./SupportPanel";
import { errorMessage, formatMessage, resolveLanguage, studioCall, type Message } from "./messages";
import { copy, type Copy } from "./copy";

export interface HomeAssistant {
  callWS<T>(message: { type: string; [key: string]: unknown }): Promise<T>;
  language?: string;
  locale?: { language?: string };
}

export type Endpoint = {
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

export type Relationship = {
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
  warnings: Message[];
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
  steps: Message[];
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
  steps: Message[];
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
  message: Message;
};


type AclCapacity = {
  used: number | null;
  maximum: number | null;
  available: number | null;
  targets_per_entry: number | null;
  entries_to_add?: number;
};

type AclTarget = {
  endpoint: Message;
  capability: Message;
};

type AclEntry = {
  entry_index: number;
  kind: "administrator" | "operate";
  auth_mode: "case" | "group" | "other";
  subjects: Message[];
  targets: AclTarget[];
  usage: {
    state: "protected" | "used" | "unused" | "unknown";
    relationship_names: string[];
    safe_to_reclaim: boolean;
  };
  provenance?: { state: "studio_recorded" | "unknown" };
  references?: Array<{ relationship_id: string; name: string; clusters: number[] }>;
  references_complete?: boolean;
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
  entries?: AclEntry[];
  capacity_before: AclCapacity;
  steps: Message[];
};

type GroupCleanupPlan = {
  plan_id: string;
  expires_in_seconds: number;
  group_id: number;
  name: string;
  source: Endpoint;
  members: Endpoint[];
  clusters: number[];
  steps: Message[];
};

export default function App({ hass }: { hass?: HomeAssistant }) {
  const language = resolveLanguage(hass);
  const t = copy[language];
  const hassRef = useRef(hass);
  const hasLoadedRef = useRef(false);
  const [snapshot, setSnapshot] = useState<StudioSnapshot | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [readFailed, setReadFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [composerBusy, setComposerBusy] = useState(false);

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
        await studioCall<StudioSnapshot>(activeHass, {
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
            <h1>{t.appName}</h1>
          </div>
          <div className="mbs-header-actions"><button disabled={!snapshot || !hass} onClick={() => setAdding(true)}>{t.addRelationship}</button><button
            type="button"
            onClick={() => void refresh()}
            disabled={!hass || refreshing}
            aria-busy={refreshing}
          >
            {refreshing && snapshot ? t.refreshing : t.refresh}
          </button></div>
        </header>

        <details className="mbs-help"><summary>{t.help}</summary><p>{t.scope}</p></details>

        {!hass ? <p className="mbs-notice">{t.notConnected}</p> : null}
        {readFailed ? <p className="mbs-warning">{t.readFailed}</p> : null}
        {snapshot?.warnings.map((warning, index) => (
          <p className="mbs-warning" key={index}>
            {formatMessage(warning, t)}
          </p>
        ))}

        {initialLoading ? <p className="mbs-loading">{t.loading}</p> : null}
        {snapshot ? (
          <>
            {adding ? <ComposerDrawer busy={composerBusy} close={() => setAdding(false)} t={t}><BindingComposer
              hass={hass}
              snapshot={snapshot}
              refresh={refresh}
              t={t}
              onBusy={setComposerBusy}
            /></ComposerDrawer> : null}
            <StudioData hass={hass} snapshot={snapshot} refresh={refresh} t={t} />
          </>
        ) : null}
        <SupportPanel hass={hass} t={t} />
      </main>
    </div>
  );
}

function ComposerDrawer({ children, close, t, busy }: { children: React.ReactNode; close: () => void; t: Copy; busy: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="mbs-dialog mbs-drawer" aria-label={t.addRelationship} onCancel={e => { if (busy) e.preventDefault(); else close(); }}>
    <button className="mbs-drawer-close" disabled={busy} onClick={close}>{t.close}</button>{children}
  </dialog>;
}

function BindingComposer({
  hass,
  snapshot,
  refresh,
  t,
  onBusy,
}: {
  hass?: HomeAssistant;
  snapshot: StudioSnapshot;
  refresh: () => Promise<void>;
  t: Copy;
  onBusy: (busy: boolean) => void;
}) {
  const [sourceKey, setSourceKey] = useState("");
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  // Before an operator chooses a source, every eligible target should remain
  // visible. Choosing a source starts with the helpful same-area filter on.
  const [sameAreaOnly, setSameAreaOnly] = useState(false);
  const [clusters, setClusters] = useState<number[]>([]);
  const [plan, setPlan] = useState<BindingPlan | null>(null);
  const [working, setWorking] = useState(false);
  useEffect(() => { onBusy(working); }, [working, onBusy]);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);
  const [recovery, setRecovery] = useState<"plan" | "apply" | "group">("plan");

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
    setRecovery("plan");
    try {
      const nextPlan = selectedTargets.length === 1
        ? await studioCall<UnicastPlan>(hass, {
            type: "matter_binding_studio/prepare_unicast",
            source_node_id: source.node_id,
            source_endpoint_id: source.endpoint_id,
            target_node_id: selectedTargets[0].node_id,
            target_endpoint_id: selectedTargets[0].endpoint_id,
            clusters,
          })
        : await studioCall<GroupcastPlan>(hass, {
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
    setRecovery(plan.route === "native_group" ? "group" : "apply");
    try {
      const result = await studioCall<ApplyResult>(hass, {
        type: plan.route === "direct"
          ? "matter_binding_studio/apply_unicast"
          : "matter_binding_studio/apply_groupcast",
        plan_id: plan.plan_id,
        confirm: true,
      });
      setMessage(result.message);
      setMessageIsError(!result.success || !result.verified);
    } catch (error) {
      setMessage(errorMessage(error));
      setMessageIsError(true);
    } finally {
      // A reviewed plan is single-use, even when its write needs repair.
      setPlan(null);
      setConfirmed(false);
      await refresh();
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
            {plan.steps.map((step, index) => <li key={index}>{formatMessage(step, t)}</li>)}
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
      {message ? <p className={messageIsError ? "mbs-warning" : "mbs-success"}>{formatMessage(message, t)}</p> : null}
      {message && messageIsError ? <RecoveryAdvice kind={recovery} t={t} /> : null}
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

export function endpointLabel(endpoint: Endpoint): string {
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
  const [groupCleanupPlan, setGroupCleanupPlan] = useState<GroupCleanupPlan | null>(null);
  const [groupCleanupConfirmed, setGroupCleanupConfirmed] = useState(false);
  const [groupCleanupWorking, setGroupCleanupWorking] = useState(false);
  const [groupCleanupMessage, setGroupCleanupMessage] = useState<Message | null>(null);
  const [groupCleanupMessageIsError, setGroupCleanupMessageIsError] = useState(false);
  const [cleanupRecovery, setCleanupRecovery] = useState<"plan" | "group">("plan");

  const reviewGroupCleanup = async (controlSet: ControlSet) => {
    setCleanupRecovery("plan");
    if (!hass || !controlSet.managed_by_studio || controlSet.active_relationships > 0) {
      setGroupCleanupMessage(
        controlSet.active_relationships > 0 ? t.groupCleanupNeedsBindingRemoval : t.groupCleanupUnavailable,
      );
      setGroupCleanupMessageIsError(true);
      return;
    }
    setGroupCleanupWorking(true);
    setGroupCleanupMessage(null);
    try {
      setGroupCleanupPlan(await studioCall<GroupCleanupPlan>(hass, {
        type: "matter_binding_studio/prepare_cleanup_group",
        group_id: controlSet.group_id,
      }));
      setGroupCleanupConfirmed(false);
    } catch (error) {
      setGroupCleanupMessage(errorMessage(error));
      setGroupCleanupMessageIsError(true);
    } finally {
      setGroupCleanupWorking(false);
    }
  };

  const applyGroupCleanup = async () => {
    if (!hass || !groupCleanupPlan || !groupCleanupConfirmed) return;
    setGroupCleanupWorking(true);
    setGroupCleanupMessage(null);
    setCleanupRecovery("group");
    try {
      const result = await studioCall<ApplyResult>(hass, {
        type: "matter_binding_studio/apply_cleanup_group",
        plan_id: groupCleanupPlan.plan_id,
        confirm: true,
      });
      setGroupCleanupMessage(result.message);
      setGroupCleanupMessageIsError(!result.success || !result.verified);
    } catch (error) {
      setGroupCleanupMessage(errorMessage(error));
      setGroupCleanupMessageIsError(true);
    } finally {
      setGroupCleanupPlan(null);
      setGroupCleanupConfirmed(false);
      await refresh();
      setGroupCleanupWorking(false);
    }
  };

  return (
    <div className="mbs-content">
      <BindingList hass={hass} relationships={snapshot.relationships} refresh={refresh} t={t} />

      <details className="mbs-fold"><summary>{t.controlSets} ({snapshot.native_control_sets.length})
        {snapshot.native_control_sets.some(group => group.status === "pending" || group.status === "repair_needed") ? <span className="mbs-attention"> · {t.groupsNeedAttention}</span> : null}
      </summary>
      <section>
        <SectionTitle title={t.controlSets} count={snapshot.native_control_sets.length} />
        <p className="mbs-description">{t.controlSetsDescription}</p>
        {snapshot.native_control_sets.length ? (
          <div className="mbs-list">
            {snapshot.native_control_sets.map((controlSet) => (
              <ControlSetRow
                controlSet={controlSet}
                key={controlSet.group_id}
                t={t}
                onReviewCleanup={reviewGroupCleanup}
                cleanupWorking={groupCleanupWorking}
              />
            ))}
          </div>
        ) : (
          <Empty text={t.noControlSets} />
        )}
        {groupCleanupPlan ? (
          <div className="mbs-review mbs-removal-review">
            <strong>{t.groupCleanupReviewTitle}</strong>
            <p>{groupCleanupPlan.name}</p>
            <MemberList members={groupCleanupPlan.members} />
            <CapabilityList clusters={groupCleanupPlan.clusters} t={t} />
            <ul>{groupCleanupPlan.steps.map((step, index) => <li key={index}>{formatMessage(step, t)}</li>)}</ul>
            <label className="mbs-confirm">
              <input
                type="checkbox"
                checked={groupCleanupConfirmed}
                onChange={(event) => setGroupCleanupConfirmed(event.target.checked)}
              />
              {t.confirmGroupCleanup}
            </label>
            <div className="mbs-review-actions">
              <button
                type="button"
                onClick={() => {
                  setGroupCleanupPlan(null);
                  setGroupCleanupConfirmed(false);
                }}
                disabled={groupCleanupWorking}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                className="mbs-danger-button"
                onClick={() => void applyGroupCleanup()}
                disabled={!groupCleanupConfirmed || groupCleanupWorking}
              >
                {groupCleanupWorking ? t.working : t.cleanupGroup}
              </button>
            </div>
          </div>
        ) : null}
        {groupCleanupMessage ? (
          <p className={groupCleanupMessageIsError ? "mbs-warning" : "mbs-success"}>
            {formatMessage(groupCleanupMessage, t)}
          </p>
        ) : null}
        {groupCleanupMessage && groupCleanupMessageIsError ? <RecoveryAdvice kind={cleanupRecovery} t={t} /> : null}
      </section>

      </details>
      <details className="mbs-fold"><summary>{t.advanced}</summary>
      <AclInspector hass={hass} snapshot={snapshot} t={t} />
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
      </section></details>
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
  const [removalMessage, setRemovalMessage] = useState<Message | null>(null);
  const [removalFailed, setRemovalFailed] = useState(false);
  const [selectedEntryIndexes, setSelectedEntryIndexes] = useState<number[]>([]);
  const selectedTarget = targets.find((target) => endpointKey(target) === targetKey);
  const reclaimableEntries = overview?.entries.filter((entry) => entry.usage.safe_to_reclaim) ?? [];
  const selectedEntryIndexSet = new Set(selectedEntryIndexes);
  const allReclaimableSelected = reclaimableEntries.length > 0 && reclaimableEntries.every((entry) => selectedEntryIndexSet.has(entry.entry_index));

  const readAcl = async () => {
    if (!hass || !selectedTarget || selectedTarget.node_id === null || selectedTarget.endpoint_id === null) return;
    setWorking(true);
    setFailed(false);
    try {
      setOverview(await studioCall<AclOverview>(hass, {
        type: "matter_binding_studio/get_acl_overview",
        target_node_id: selectedTarget.node_id,
        target_endpoint_id: selectedTarget.endpoint_id,
      }));
      setSelectedEntryIndexes([]);
    } catch {
      setFailed(true);
      setOverview(null);
      setSelectedEntryIndexes([]);
    } finally {
      setWorking(false);
    }
  };

  const reviewRemoval = async (entries: AclEntry[]) => {
    if (!hass || !selectedTarget || selectedTarget.node_id === null || selectedTarget.endpoint_id === null) return;
    const entryIndexes = entries.filter((entry) => entry.usage.safe_to_reclaim).map((entry) => entry.entry_index);
    if (!entryIndexes.length) {
      setRemovalMessage(t.noAclEntriesSelected);
      setRemovalFailed(true);
      return;
    }
    setWorking(true);
    setRemovalMessage(null);
    setRemovalFailed(false);
    try {
      setRemovalPlan(await studioCall<AclRemovalPlan>(hass, {
        type: "matter_binding_studio/prepare_remove_acl",
        target_node_id: selectedTarget.node_id,
        target_endpoint_id: selectedTarget.endpoint_id,
        entry_indexes: entryIndexes,
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
      const result = await studioCall<ApplyResult>(hass, {
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
              setSelectedEntryIndexes([]);
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
          {reclaimableEntries.length ? (
            <div className="mbs-acl-bulkbar">
              <label>
                <input
                  type="checkbox"
                  checked={allReclaimableSelected}
                  onChange={(event) => {
                    setSelectedEntryIndexes(event.target.checked ? reclaimableEntries.map((entry) => entry.entry_index) : []);
                  }}
                />
                {t.selectAllReclaimableAcl}
              </label>
              <span>{formatCount(t.selectedAclEntries, selectedEntryIndexes.length)}</span>
              <button
                type="button"
                className="mbs-quiet-danger-button"
                onClick={() => void reviewRemoval(reclaimableEntries.filter((entry) => selectedEntryIndexSet.has(entry.entry_index)))}
                disabled={working || selectedEntryIndexes.length === 0}
              >
                {t.reviewSelectedAclReclaim}
              </button>
            </div>
          ) : null}
          <div className="mbs-list">
            {overview.entries.map((entry) => (
              <AclEntryRow
                entry={entry}
                key={entry.entry_index}
                t={t}
                selected={selectedEntryIndexSet.has(entry.entry_index)}
                onSelectionChange={(selected) => {
                  setSelectedEntryIndexes((current) =>
                    selected
                      ? Array.from(new Set([...current, entry.entry_index])).sort((left, right) => left - right)
                      : current.filter((index) => index !== entry.entry_index),
                  );
                }}
                onReviewRemoval={(entry) => reviewRemoval([entry])}
                working={working}
              />
            ))}
          </div>
        </>
      ) : null}
      {removalPlan ? (
        <div className="mbs-review mbs-removal-review">
          <strong>{t.aclRemovalReviewTitle}</strong>
          {(removalPlan.entries ?? [removalPlan.entry]).map((entry) => (
            <AclEntryRow entry={entry} key={entry.entry_index} t={t} />
          ))}
          <p className="mbs-meta">{t.aclRemovalKeepsInUse}</p>
          <ul>{removalPlan.steps.map((step, index) => <li key={index}>{formatMessage(step, t)}</li>)}</ul>
          <label className="mbs-confirm">
            <input
              type="checkbox"
              checked={removalConfirmed}
              onChange={(event) => setRemovalConfirmed(event.target.checked)}
            />
            {formatCount(t.confirmAclRemoval, (removalPlan.entries ?? [removalPlan.entry]).length)}
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
      {removalMessage ? <p className={removalFailed ? "mbs-warning" : "mbs-success"}>{formatMessage(removalMessage, t)}</p> : null}
    </section>
  );
}

function AclEntryRow({
  entry,
  t,
  selected,
  onSelectionChange,
  onReviewRemoval,
  working = false,
}: {
  entry: AclEntry;
  t: Copy;
  selected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
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
        <div className="mbs-acl-entry-title">
          {onSelectionChange && entry.usage.safe_to_reclaim ? (
            <input
              type="checkbox"
              checked={selected ?? false}
              onChange={(event) => onSelectionChange(event.target.checked)}
              disabled={working}
              aria-label={`${t.selectAclEntry} ${entry.entry_index}`}
            />
          ) : null}
          <strong>{kind}</strong>
        </div>
        <span className={`mbs-acl-state mbs-acl-${entry.usage.state}`}>{usage}</span>
      </div>
      <p className="mbs-meta">{authMode}</p>
      <div className="mbs-acl-details">
        <div>
          <small>{t.aclSubjects}</small>
          <p>{entry.subjects.map(subject => formatMessage(subject, t)).join(", ")}</p>
        </div>
        <div>
          <small>{t.aclTargets}</small>
          <p>{entry.targets.map((target) => `${formatMessage(target.endpoint, t)} · ${formatMessage(target.capability, t)}`).join("；")}</p>
        </div>
      </div>
      {entry.usage.relationship_names.length ? (
        <p className="mbs-meta">{entry.usage.relationship_names.join("；")}</p>
      ) : null}
      <details className="mbs-recovery">
        <summary>{t.aclEvidence}</summary>
        <p>{entry.provenance?.state === "studio_recorded" ? t.aclRecorded : t.aclUnrecorded}</p>
        <p>{formatCount(t.aclReferences, entry.references?.length ?? 0)}</p>
        {entry.references?.length ? <ul>{entry.references.map(ref => <li key={ref.relationship_id}>
          {ref.name} · {ref.clusters.map(cluster => clusterName(cluster, t)).join(" · ")}
        </li>)}</ul> : null}
        {!entry.references_complete ? <p className="mbs-meta">{t.aclReferencesIncomplete}</p> : null}
      </details>
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

function ControlSetRow({
  controlSet,
  t,
  onReviewCleanup,
  cleanupWorking,
}: {
  controlSet: ControlSet;
  t: Copy;
  onReviewCleanup: (controlSet: ControlSet) => void;
  cleanupWorking: boolean;
}) {
  const canCleanup = Boolean(
    controlSet.managed_by_studio && controlSet.active_relationships === 0,
  );
  return (
    <article className="mbs-card">
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
      {controlSet.managed_by_studio ? (
        <div className="mbs-card-actions">
          <button
            type="button"
            className="mbs-quiet-danger-button"
            onClick={() => onReviewCleanup(controlSet)}
            disabled={!canCleanup || cleanupWorking}
          >
            {t.reviewGroupCleanup}
          </button>
          {!canCleanup ? <span className="mbs-meta">{t.groupCleanupNeedsBindingRemoval}</span> : null}
        </div>
      ) : null}
    </article>
  );
}

export function relationshipTargetLabel(relationship: Relationship): string {
  return relationship.route === "native_group"
    ? relationship.targets.name
    : relationship.targets.members[0]
      ? endpointLabel(relationship.targets.members[0])
      : relationship.targets.name;
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



export function clusterName(cluster: number, t: Copy): string {
  if (cluster === 6) return t.onOff;
  if (cluster === 8) return t.brightness;
  if (cluster === 768) return t.colorTemperature;
  return String(cluster);
}
