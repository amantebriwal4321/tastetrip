"use client";
import { useEffect, useState } from "react";
const EX = "Chill indie weekend in Bengaluru. I love Prateek Kuhad, Before Sunrise and good filter coffee. Not into clubs.";
const Q = { background: "#ff4f8b", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, marginLeft: 8, verticalAlign: "middle" };
const Badge = () => <span style={Q}>Powered by Qloo</span>;
function Bar({ v, label }) { if (typeof v !== "number") return null; return <div style={{ fontSize: 11, opacity: .85 }}>{label} {v.toFixed(2)}<div style={{ height: 4, background: "#333", borderRadius: 2 }}><div style={{ width: Math.max(0, Math.min(1, v)) * 100 + "%", height: 4, background: "#ff4f8b", borderRadius: 2 }} /></div></div>; }
function md(s) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/^### (.*)$/gm,"<h4>$1</h4>").replace(/^## (.*)$/gm,"<h3>$1</h3>").replace(/^# (.*)$/gm,"<h2>$1</h2>").replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/^ *[*-] +(.*)$/gm,"<li>$1</li>").replace(/^\*\*\*$/gm,"<hr/>").replace(/\n/g,"<br/>"); }
export default function Page() {
  const [p, setP] = useState(EX), [r, setR] = useState(null), [busy, setBusy] = useState(false), [mode, setMode] = useState(""), [feats, setFeats] = useState([]);
  useEffect(() => { fetch("/api/plan").then(x => x.json()).then(d => { setMode(d.qloo); setFeats(d.features || []); }); }, []);
  async function go() { setBusy(true); setR(null);
    const d = await fetch("/api/plan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: p }) }).then(x => x.json()).catch(e => ({ error: e.message }));
    setR(d); setBusy(false); }
  return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
    <h1>TasteTrip</h1>
    <p style={{ opacity: .8 }}>Tell it your vibe, what you love and your city. A Gemini agent calls the Qloo Taste API and builds a weekend plan with reasons.</p>
    {mode === "demo" && <div style={{ background: "#5a3d00", padding: 10, borderRadius: 8, marginBottom: 12 }}>DEMO DATA: no Qloo API key configured yet, so Qloo results come from cached sample responses. The agent and Gemini are live.</div>}
    {mode === "live" && <div style={{ background: "#0d4a2a", padding: 10, borderRadius: 8, marginBottom: 12 }}>Live Qloo Taste AI API <Badge /></div>}
    <section style={{ background: "#1a1d24", border: "1px solid #ff4f8b55", padding: 12, borderRadius: 8, marginBottom: 16 }}>
      <b>How TasteTrip uses Qloo</b><Badge />
      <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 14 }}>{feats.map(f => <li key={f.tool}><code>{f.endpoint}</code> via <code>{f.tool}</code>: {f.what}</li>)}</ul>
      <p style={{ fontSize: 12, opacity: .7, margin: "8px 0 0" }}>Every place, artist, film and brand in your plan comes from Qloo. Gemini only orchestrates the calls and writes the itinerary.</p>
    </section>
    <textarea value={p} onChange={e => setP(e.target.value)} rows={4} style={{ width: "100%", padding: 10, borderRadius: 8, background: "#1a1d24", color: "#eee", border: "1px solid #333" }} />
    <button onClick={go} disabled={busy} style={{ marginTop: 10, padding: "10px 18px", borderRadius: 8, border: 0, background: "#7c5cff", color: "#fff", cursor: "pointer" }}>{busy ? "Agent is planning..." : "Plan my weekend"}</button>
    {r?.error && <p style={{ color: "#f77" }}>{r.error}</p>}
    {r?.trace && <details open style={{ marginTop: 20, background: "#1a1d24", padding: 12, borderRadius: 8 }}><summary>Qloo calls the agent made ({r.trace.length}){r.demo ? ", demo data" : ""}<Badge /></summary>
      {r.trace.map((t, i) => <div key={i} style={{ borderTop: "1px solid #2a2d35", padding: "10px 0" }}>
        <div style={{ fontSize: 13 }}><b>{(feats.find(f => f.tool === t.tool) || {}).endpoint || t.tool}</b> <code style={{ fontSize: 11, opacity: .7 }}>{JSON.stringify(t.args)}</code></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 8, marginTop: 6 }}>
          {(t.items || []).map((e, j) => <div key={j} style={{ background: "#232733", padding: 8, borderRadius: 6, fontSize: 12 }}>
            <div style={{ fontWeight: 600 }}>{e.name}</div>
            {e.type && <div style={{ opacity: .6 }}>{e.type}</div>}
            {e.age && <div style={{ opacity: .8 }}>age: {Object.entries(e.age).map(([k, v]) => k.replace(/_/g, " ") + " " + v).join(", ")}</div>}
            {e.tags?.length > 0 && <div style={{ opacity: .7 }}>{e.tags.join(", ")}</div>}
            <Bar v={e.affinity} label="Qloo affinity" /><Bar v={e.popularity} label="Qloo popularity" />
          </div>)}
        </div></div>)}</details>}
    {r?.plan && <h3 style={{ marginTop: 24 }}>Your plan<Badge /></h3>}
    {r?.plan && <div style={{ lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: md(r.plan) }} />}
    <p style={{ opacity: .5, fontSize: 12, marginTop: 40 }}>Taste data by Qloo Taste AI API. Orchestration by Gemini. <a style={{ color: "#aaa" }} href="https://github.com/amantebriwal4321/tastetrip">Source</a></p>
  </main>;
}
