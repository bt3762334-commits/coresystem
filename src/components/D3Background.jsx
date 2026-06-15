import { useEffect, useRef } from "react";

export default function D3Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let raf;

    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initParticles();
    };
    window.addEventListener("resize", onResize);

    // Particles
    const COUNT = Math.min(80, Math.floor((W * H) / 14000));
    let particles = [];

    function initParticles() {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.3,
        vx: (Math.random() - .5) * .25,
        vy: (Math.random() - .5) * .25,
        alpha: Math.random() * .6 + .2,
        color: Math.random() > .6
          ? `rgba(124,110,255,`
          : Math.random() > .5
          ? `rgba(16,217,138,`
          : `rgba(168,155,255,`,
      }));
    }
    initParticles();

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // subtle grid lines
      ctx.strokeStyle = "rgba(42,38,80,.35)";
      ctx.lineWidth = .5;
      const grid = 80;
      for (let x = 0; x < W; x += grid) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += grid) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(124,110,255,${(.12 * (1 - dist/130)).toFixed(3)})`;
            ctx.lineWidth = .7;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // particles
      particles.forEach(p => {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha.toFixed(2)})`;
        ctx.fill();

        // glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grd.addColorStop(0, `${p.color}${(p.alpha * .4).toFixed(2)})`);
        grd.addColorStop(1, `${p.color}0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, zIndex: 0,
        pointerEvents: "none",
        opacity: .7,
      }}
    />
  );
}
