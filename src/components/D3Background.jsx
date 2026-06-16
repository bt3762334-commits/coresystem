import { useEffect, useRef } from "react";

const COLORS = [
  "rgba(108,99,255,0.10)",
  "rgba(16,185,129,0.08)",
  "rgba(245,158,11,0.06)",
  "rgba(244,63,94,0.05)",
  "rgba(108,99,255,0.07)",
];

export default function D3Background() {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const ns = "http://www.w3.org/2000/svg";
    let W = window.innerWidth;
    let H = window.innerHeight;
    let rafId;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      svg.setAttribute("width", W);
      svg.setAttribute("height", H);
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    }
    resize();
    window.addEventListener("resize", resize);

    // Grid
    const grid = document.createElementNS(ns, "g");
    grid.setAttribute("opacity", "0.05");
    for (let x = 0; x < 3000; x += 56) {
      const l = document.createElementNS(ns, "line");
      l.setAttribute("x1", x); l.setAttribute("y1", 0);
      l.setAttribute("x2", x); l.setAttribute("y2", 3000);
      l.setAttribute("stroke", "#7C6EFF");
      l.setAttribute("stroke-width", "0.4");
      grid.appendChild(l);
    }
    for (let y = 0; y < 3000; y += 56) {
      const l = document.createElementNS(ns, "line");
      l.setAttribute("x1", 0); l.setAttribute("y1", y);
      l.setAttribute("x2", 3000); l.setAttribute("y2", y);
      l.setAttribute("stroke", "#7C6EFF");
      l.setAttribute("stroke-width", "0.4");
      grid.appendChild(l);
    }
    svg.appendChild(grid);

    // Blobs
    const nodes = Array.from({ length: 14 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 80 + Math.random() * 160,
      c: COLORS[i % COLORS.length],
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));

    const circles = nodes.map((n) => {
      const c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", n.x);
      c.setAttribute("cy", n.y);
      c.setAttribute("r", n.r);
      c.setAttribute("fill", n.c);
      c.style.filter = "blur(28px)";
      svg.appendChild(c);
      return c;
    });

    function tick() {
      nodes.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -n.r || n.x > W + n.r) n.vx *= -1;
        if (n.y < -n.r || n.y > H + n.r) n.vy *= -1;
        circles[i].setAttribute("cx", n.x);
        circles[i].setAttribute("cy", n.y);
      });
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      style={{
        position: "fixed", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}
