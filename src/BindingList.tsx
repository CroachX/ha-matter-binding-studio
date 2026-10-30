import { useEffect, useRef, useState } from "react";
import { RecoveryAdvice } from "./SupportPanel";
import type { Copy } from "./copy";
import { endpointLabel, relationshipTargetLabel, clusterName } from "./App";
import { errorMessage, formatMessage, studioCall, type Message } from "./messages";
import type { HomeAssistant, Relationship, Endpoint } from "./App";

type Plan = { plan_id: string; relationships: Relationship[]; source_count: number; removed_entry_count: number };
type Result = { relationship_ids: string[]; source: Endpoint; status: "verified" | "changed" | "failed" | "unverified" };

export default function BindingList({ hass, relationships, refresh, t }: {
  hass?: HomeAssistant; relationships: Relationship[]; refresh: () => Promise<void>; t: Copy;
}) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<Message | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const allCheck = useRef<HTMLInputElement>(null);
  const areas = [...new Set(relationships.flatMap(row => [row.source, ...row.targets.members].map(e => e.area_name).filter((a): a is string => Boolean(a))))].sort();
  const filtered = relationships.filter(row => {
    const endpoints = [row.source, ...row.targets.members];
    return (!area || endpoints.some(e => e.area_name === area)) &&
      `${endpointLabel(row.source)} ${relationshipTargetLabel(row)}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  }).sort((a, b) => endpointLabel(a.source).localeCompare(endpointLabel(b.source), "zh-Hant", { numeric: true }) || a.id.localeCompare(b.id));
  const selectedSet = new Set(selected);
  const allSelected = filtered.length > 0 && filtered.every(row => selectedSet.has(row.id));
  useEffect(() => {
    const current = new Set(relationships.map(row => row.id));
    setSelected(previous => previous.filter(id => current.has(id)));
  }, [relationships]);
  useEffect(() => {
    if (area && !relationships.some(row => [row.source, ...row.targets.members].some(e => e.area_name === area))) {
      setArea("");
    }
  }, [relationships, area]);
  useEffect(() => { if (allCheck.current) allCheck.current.indeterminate = selected.length > 0 && !allSelected; }, [selected.length, allSelected]);
  useEffect(() => {
    if (plan) dialog.current?.showModal();
    else dialog.current?.close();
  }, [plan]);

  const review = async (ids: string[]) => {
    if (!hass || !ids.length) return;
    setWorking(true); setError(null); setUnconfirmed(false); setResults([]);
    try {
      setPlan(await studioCall<Plan>(hass, { type: "matter_binding_studio/prepare_bulk_remove_bindings", relationship_ids: ids }));
    } catch (err) { setError(errorMessage(err)); }
    finally { setWorking(false); }
  };
  const apply = async () => {
    if (!hass || !plan) return;
    setWorking(true); setError(null); setUnconfirmed(false);
    try {
      const response = await studioCall<{ results: Result[] }>(hass, { type: "matter_binding_studio/apply_bulk_remove_bindings", plan_id: plan.plan_id, confirm: true });
      setResults(response.results);
      const completed = new Set(response.results.filter(r => r.status === "verified").flatMap(r => r.relationship_ids));
      setSelected(ids => ids.filter(id => !completed.has(id)));
    } catch (err) { setError(errorMessage(err)); setUnconfirmed(true); }
    finally { setPlan(null); await refresh(); setWorking(false); }
  };

  return <section className="mbs-binding-section">
    <div className="mbs-section-title"><h2>{t.controlRelationships}</h2><span>{relationships.length}</span></div>
    <div className="mbs-list-toolbar">
      <input aria-label={t.searchRelationships} placeholder={t.searchRelationships} value={query} disabled={working || Boolean(plan)} onChange={e => { setQuery(e.target.value); setSelected([]); }} />
      <select aria-label={t.filterArea} value={area} disabled={working || Boolean(plan)} onChange={e => { setArea(e.target.value); setSelected([]); }}>
        <option value="">{t.allAreas}</option>{areas.map(a => <option key={a}>{a}</option>)}
      </select>
    </div>
    <div className="mbs-selection-bar">
      <label><input ref={allCheck} type="checkbox" checked={allSelected} disabled={!filtered.length || working || Boolean(plan)} onChange={e => setSelected(e.target.checked ? filtered.map(row => row.id) : [])} />{t.selectVisible}</label>
      <span>{t.selectedRelationships.replace("{count}", String(selected.length))}</span>
      {selected.length > 0 ? <><button disabled={working} onClick={() => setSelected([])}>{t.clearSelection}</button><button className="mbs-danger-button" disabled={working} onClick={() => void review(selected)}>{t.deleteSelected.replace("{count}", String(selected.length))}</button></> : null}
    </div>
    <div className="mbs-compact-list">
      {filtered.map(row => <article className="mbs-binding-row" key={row.id}>
        <input type="checkbox" aria-label={`${t.selectRelationship}: ${endpointLabel(row.source)} → ${relationshipTargetLabel(row)}`} checked={selectedSet.has(row.id)} disabled={working || Boolean(plan)} onChange={e => setSelected(ids => e.target.checked ? [...ids, row.id] : ids.filter(id => id !== row.id))} />
        <div className="mbs-binding-path"><strong>{endpointLabel(row.source)}</strong><span aria-hidden="true">→</span><strong>{relationshipTargetLabel(row)}</strong></div>
        <span className="mbs-inline-capabilities">{row.clusters.map(c => clusterName(c, t)).join(" · ")}</span>
        <details className="mbs-row-details"><summary>{t.details}</summary>
          <p>{row.route === "direct" ? t.direct : t.nativeGroup}</p>
          <p>Node {row.source.node_id} / Endpoint {row.source.endpoint_id}</p>
          {row.targets.members.map(member => <p key={`${member.node_id}:${member.endpoint_id}`}>{endpointLabel(member)} · Node {member.node_id} / Endpoint {member.endpoint_id}</p>)}
          <button disabled={working} onClick={() => void review([row.id])}>{t.removeBinding}</button>
        </details>
      </article>)}
      {!filtered.length ? <p className="mbs-empty">{relationships.length ? t.noMatchingRelationships : t.noRelationships}</p> : null}
    </div>
    {error ? <p role="alert" className="mbs-warning">{formatMessage(error, t)}{unconfirmed ? ` ${t.refreshBeforeRetry}` : ""}</p> : null}
    {results.length ? <div aria-live="polite" className="mbs-batch-results"><strong>{t.removalResults}</strong>{results.map(r => <p key={`${r.source.node_id}:${r.source.endpoint_id}`} className={r.status === "verified" ? "mbs-success" : "mbs-warning"}>{endpointLabel(r.source)} — {t[r.status]} ({r.relationship_ids.length})</p>)}</div> : null}
    {error || results.some(result => result.status !== "verified") ? <RecoveryAdvice kind={unconfirmed || results.length ? "batch" : "plan"} t={t} /> : null}
    <dialog ref={dialog} className="mbs-dialog" aria-labelledby="mbs-delete-title" onCancel={e => { if (working) e.preventDefault(); else setPlan(null); }}>
      {plan ? <><h2 id="mbs-delete-title">{t.deleteSelected.replace("{count}", String(plan.relationships.length))}</h2>
        <ul>{plan.relationships.map(row => <li key={row.id}>{endpointLabel(row.source)} → {relationshipTargetLabel(row)}</li>)}</ul>
        <p>{t.batchSummary.replace("{sources}", String(plan.source_count)).replace("{entries}", String(plan.removed_entry_count))}</p>
        <p>{t.removalKeepsGroup}</p>
        <div className="mbs-review-actions"><button autoFocus disabled={working} onClick={() => setPlan(null)}>{t.cancel}</button><button disabled={working} className="mbs-danger-button" onClick={() => void apply()}>{working ? t.working : t.confirmDelete}</button></div>
      </> : null}
    </dialog>
  </section>;
}
