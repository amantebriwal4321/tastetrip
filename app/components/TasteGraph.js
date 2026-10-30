"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// 3D taste graph: center node is you, Qloo entities orbit it, distance and link brightness follow Qloo affinity.
export default function TasteGraph({ nodes }) {
  const ref = useRef(null), [tip, setTip] = useState(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let r; try { r = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { return; }
    const W = () => el.clientWidth, H = () => el.clientHeight;
    r.setPixelRatio(Math.min(2, window.devicePixelRatio)); r.setSize(W(), H()); el.appendChild(r.domElement);
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 100); cam.position.set(0, 1.5, 9);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6)); const pl = new THREE.PointLight(0xff4f8b, 40); pl.position.set(3, 4, 5); scene.add(pl);
    const g = new THREE.Group(); scene.add(g);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 1), new THREE.MeshStandardMaterial({ color: 0x7c5cff, emissive: 0x2a1a66, flatShading: true }));
    core.userData = { name: "You", type: "taste profile" }; g.add(core);
    const colors = { place: 0xff4f8b, artist: 0x4fd1ff, movie: 0xffc94f, brand: 0x7dff9b, book: 0xff9b4f, tag: 0xcccccc };
    const pick = [core];
    nodes.slice(0, 40).forEach((n, i) => {
      const a = typeof n.affinity === "number" ? n.affinity : 0.6, rad = 2 + (1 - a) * 5;
      const th = i * 2.399, ph = Math.acos(1 - 2 * ((i + 0.5) / Math.max(nodes.length, 1)));
      const p = new THREE.Vector3(rad * Math.sin(ph) * Math.cos(th), rad * Math.cos(ph) * 0.6, rad * Math.sin(ph) * Math.sin(th));
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.12 + a * 0.18, 16, 16), new THREE.MeshStandardMaterial({ color: colors[n.type] || 0xffffff, emissive: colors[n.type] || 0x333333, emissiveIntensity: 0.35 }));
      m.position.copy(p); m.userData = n; g.add(m); pick.push(m);
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), p]), new THREE.LineBasicMaterial({ color: 0xff4f8b, transparent: true, opacity: 0.15 + a * 0.6 })));
    });
    const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(); let drag = null, vy = reduce ? 0 : 0.003, hover = null;
    const pos = (e) => { const b = r.domElement.getBoundingClientRect(); const t = e.touches?.[0] || e; return [t.clientX - b.left, t.clientY - b.top]; };
    const move = (e) => { const [x, y] = pos(e);
      if (drag) { g.rotation.y += (x - drag[0]) * 0.01; g.rotation.x += (y - drag[1]) * 0.005; drag = [x, y]; }
      mouse.set(x / W() * 2 - 1, -(y / H()) * 2 + 1); ray.setFromCamera(mouse, cam);
      const hit = ray.intersectObjects(pick)[0]?.object;
      if (hover && hover !== hit) hover.scale.setScalar(1); hover = hit; if (hit) hit.scale.setScalar(1.6);
      setTip(hit ? { ...hit.userData, x, y } : null); };
    const down = (e) => { drag = pos(e); }, up = () => { drag = null; };
    const c = r.domElement; c.addEventListener("pointermove", move); c.addEventListener("pointerdown", down); window.addEventListener("pointerup", up);
    const rs = () => { cam.aspect = W() / H(); cam.updateProjectionMatrix(); r.setSize(W(), H()); }; window.addEventListener("resize", rs);
    let raf; const loop = () => { if (!drag) g.rotation.y += vy; core.rotation.x += vy; r.render(scene, cam); raf = requestAnimationFrame(loop); }; loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rs); window.removeEventListener("pointerup", up); r.dispose(); el.innerHTML = ""; };
  }, [nodes]);
  return <div style={{ position: "relative" }}>
    <div ref={ref} style={{ width: "100%", height: 340, borderRadius: 12, background: "radial-gradient(circle at 50% 40%, #241a4a, #0f1115 70%)", touchAction: "pan-y", cursor: "grab" }} />
    {tip && <div style={{ position: "absolute", left: Math.min(tip.x + 12, 600), top: tip.y + 12, background: "#000c", padding: "6px 10px", borderRadius: 6, fontSize: 12, pointerEvents: "none" }}>
      <b>{tip.name}</b>{tip.type && <div style={{ opacity: .7 }}>{tip.type}</div>}{typeof tip.affinity === "number" && <div>Qloo affinity {tip.affinity.toFixed(2)}</div>}</div>}
    <div style={{ position: "absolute", bottom: 8, left: 12, fontSize: 11, opacity: .6 }}>Drag to spin, hover a node. Closer and brighter = higher Qloo affinity.</div>
  </div>;
}
