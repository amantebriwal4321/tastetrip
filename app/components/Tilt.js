"use client";
import { useRef } from "react";
export default function Tilt({ children, style }) {
  const r = useRef(null);
  const m = (e) => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const b = r.current.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
    r.current.style.transform = `perspective(600px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) translateZ(6px)`; };
  const l = () => { r.current.style.transform = ""; };
  return <div ref={r} className="tilt" onPointerMove={m} onPointerLeave={l} style={{ transition: "transform .15s ease-out", transformStyle: "preserve-3d", ...style }}>{children}</div>;
}
