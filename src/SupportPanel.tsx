import { useState } from "react";
import type { HomeAssistant } from "./App";
import type { Copy } from "./copy";
import { errorMessage, formatMessage, studioCall, type Message } from "./messages";

export default function SupportPanel({ hass, t }: { hass?: HomeAssistant; t: Copy }) {
  const [report, setReport] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<"copied" | "manual" | null>(null);
  const [error, setError] = useState<Message | null>(null);
  const load = async () => {
    if (!hass) return;
    setBusy(true); setError(null); setNotice(null); setReport("");
    try {
      const result = await studioCall<unknown>(hass, { type: "matter_binding_studio/get_diagnostics" });
      setReport(JSON.stringify(result, null, 2));
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  };
  const copyReport = async () => {
    try { await navigator.clipboard.writeText(report); setNotice("copied"); }
    catch { setNotice("manual"); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([report], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url; link.download = "matter-binding-studio-diagnostics.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <details className="mbs-fold mbs-support">
    <summary>{t.supportTitle}</summary>
    <section>
      <p className="mbs-description">{t.supportPrivacy}</p>
      <div className="mbs-review-actions"><button disabled={!hass || busy} onClick={() => void load()}>{busy ? t.working : t.inspectDiagnostics}</button></div>
      {error ? <p role="alert" className="mbs-warning">{formatMessage(error, t)}</p> : null}
      {report ? <>
        <textarea aria-label={t.supportTitle} readOnly rows={10} value={report} />
        <div className="mbs-review-actions">
          <button onClick={() => void copyReport()}>{t.copyDiagnostics}</button>
          <button onClick={download}>{t.downloadDiagnostics}</button>
        </div>
        {notice ? <p role="status">{notice === "copied" ? t.diagnosticsCopied : t.diagnosticsManualCopy}</p> : null}
      </> : null}
    </section>
  </details>;
}

export function RecoveryAdvice({ kind, t }: { kind: "plan" | "apply" | "group" | "batch"; t: Copy }) {
  return <details className="mbs-recovery">
    <summary>{t.recoveryTitle}</summary>
    <p>{kind === "plan" ? t.recoveryPlan : kind === "group" ? t.recoveryGroup : kind === "batch" ? t.recoveryBatch : t.recoveryApply}</p>
    <p>{t.recoveryDiagnostics}</p>
  </details>;
}
