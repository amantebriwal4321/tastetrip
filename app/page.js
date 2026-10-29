"use client";
import { useEffect, useState } from "react";
const EX = "Chill indie weekend in Bengaluru. I love Prateek Kuhad, Before Sunrise and good filter coffee. Not into clubs.";
function md(s) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/^### (.*)$/gm,"<h4>$1</h4>").replace(/^## (.*)$/gm,"<h3>$1</h3>").replace(/^# (.*)$/gm,"<h2>$1</h2>").replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/^ *[*-] +(.*)$/gm,"<li>$1</li>").replace(/^\*\*\*$/gm,"<hr/>").replace(/\n/g,"<br/>"); }
export default function Page() {
  const [p, setP] = useState(EX), [r, setR] = useState(null), [busy, setBusy] = useState(false), [mode, setMode] = useState("");
  useEffect(() => { fetch("/api/plan").then(x => x.json()).then(d => setMode(d.qloo)); }, []);
  async function go() { setBusy(true); setR(null);
    const d = await fetch("/api/plan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: p }) }).then(x => x.json()).catch(e => ({ error: e.message }));
    setR(d); setBusy(false); }
  return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
    <h1>TasteTrip</h1>
    <p style={{ opacity: .8 }}>Tell it your vibe, what you love and your city. A Gemini agent calls the Qloo Taste API and builds a weekend plan with reasons.</p>
    {mode === "demo" && <div style={{ background: "#5a3d00", padding: 10, borderRadius: 8, marginBottom: 12 }}>DEMO DATA: no Qloo API key configured yet, so Qloo results come from cached sample responses. The agent and Gemini are live.</div>}
    {mode === "live" && <div style={{ background: "#0d4a2a", padding: 10, borderRadius: 8, marginBottom: 12 }}>Live Qloo Taste API</div>}
    <textarea value={p} onChange={e => setP(e.target.value)} rows={4} style={{ width: "100%", padding: 10, borderRadius: 8, background: "#1a1d24", color: "#eee", border: "1px solid #333" }} />
    <button onClick={go} disabled={busy} style={{ marginTop: 10, padding: "10px 18px", borderRadius: 8, border: 0, background: "#7c5cff", color: "#fff", cursor: "pointer" }}>{busy ? "Agent is planning..." : "Plan my weekend"}</button>
    {r?.error && <p style={{ color: "#f77" }}>{r.error}</p>}
    {r?.trace && <details open style={{ marginTop: 20, background: "#1a1d24", padding: 12, borderRadius: 8 }}><summary>Agent tool calls ({r.trace.length}){r.demo ? " , demo data" : ""}</summary>
      {r.trace.map((t, i) => <pre key={i} style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{t.tool}({JSON.stringify(t.args)}) → {JSON.stringify(t.sample)}</pre>)}</details>}
    {r?.plan && <div style={{ marginTop: 20, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: md(r.plan) }} />}
    <p style={{ opacity: .5, fontSize: 12, marginTop: 40 }}>Powered by Qloo Taste API and Gemini. <a style={{ color: "#aaa" }} href="https://github.com/amantebriwal4321/tastetrip">Source</a></p>
  </main>;
}
