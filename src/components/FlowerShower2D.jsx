import { useEffect, useRef } from "react";

const PETAL_COLORS = [
  "#E59A38", // Marigold gold
  "#D97724", // Deep saffron genda
  "#F4B942", // Bright haldi yellow
  "#C97A82", // Rose pink
  "#E8A5AB", // Soft blush lotus
  "#7C9B6E", // Sacred belpatra green
];

function createFlower(width, height, fromTop = true, isBurst = false) {
  const kindRoll = Math.random();
  // 0 = marigold 2D flower, 1 = rose 2D blossom, 2 = belpatra leaf, 3 = lotus petal
  const kind =
    kindRoll < 0.34 ? 0 : kindRoll < 0.64 ? 1 : kindRoll < 0.84 ? 2 : 3;

  return {
    kind,
    x: isBurst ? width * (0.15 + Math.random() * 0.7) : Math.random() * width,
    y: fromTop ? (isBurst ? -20 - Math.random() * 140 : -30 - Math.random() * height * 0.4) : Math.random() * height,
    size: kind === 0 || kind === 1 ? 9 + Math.random() * 9 : 8 + Math.random() * 7,
    vy: isBurst ? 1.6 + Math.random() * 1.9 : 0.65 + Math.random() * 0.95,
    vx: isBurst ? (Math.random() - 0.5) * 2.2 : (Math.random() - 0.5) * 0.45,
    swayAmp: 0.45 + Math.random() * 0.85,
    swayFreq: 0.015 + Math.random() * 0.02,
    phase: Math.random() * Math.PI * 2,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.03,
    alpha: 0.68 + Math.random() * 0.28,
    color:
      kind === 0
        ? PETAL_COLORS[Math.floor(Math.random() * 3)]
        : kind === 1
          ? PETAL_COLORS[3 + Math.floor(Math.random() * 2)]
          : kind === 2
            ? PETAL_COLORS[5]
            : "#E7A1AC",
    isBurst,
  };
}

function drawMarigold(ctx, r, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 8; i += 1) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.55, r * 0.34, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#B85314";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function drawRose(ctx, r, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i += 1) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.5, r * 0.42, r * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#F4D186";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.24, 0, Math.PI * 2);
  ctx.fill();
}

function drawBelpatra(ctx, r, color) {
  // Three sacred leaves (Trifoliate Belpatra for Mahadev)
  ctx.fillStyle = color;
  const angles = [0, -0.95, 0.95];
  angles.forEach((angle, idx) => {
    ctx.save();
    ctx.rotate(angle);
    const scale = idx === 0 ? 1 : 0.78;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(r * 0.42 * scale, -r * 0.55 * scale, 0, -r * 1.15 * scale);
    ctx.quadraticCurveTo(-r * 0.42 * scale, -r * 0.55 * scale, 0, 0);
    ctx.fill();
    ctx.restore();
  });
}

function drawPetal(ctx, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.bezierCurveTo(r * 0.85, -r * 0.4, r * 0.75, r * 0.75, 0, r);
  ctx.bezierCurveTo(-r * 0.75, r * 0.75, -r * 0.85, -r * 0.4, 0, -r);
  ctx.fill();
}

export default function FlowerShower2D({ enabled = true, burstKey = 0 }) {
  const canvasRef = useRef(null);
  const burstQueueRef = useRef(0);

  useEffect(() => {
    if (burstKey > 0) {
      burstQueueRef.current += 28;
    }
  }, [burstKey]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let rafId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const ambientCount = width < 640 ? 16 : 26;
    const items = Array.from({ length: ambientCount }, () =>
      createFlower(width, height, false, false)
    );

    const tick = () => {
      if (burstQueueRef.current > 0) {
        const spawn = Math.min(6, burstQueueRef.current);
        for (let i = 0; i < spawn; i += 1) {
          items.push(createFlower(width, height, true, true));
        }
        burstQueueRef.current -= spawn;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = items.length - 1; i >= 0; i -= 1) {
        const f = items[i];
        f.phase += f.swayFreq;
        f.x += f.vx + Math.sin(f.phase) * f.swayAmp;
        f.y += f.vy;
        f.rot += f.rotSpeed;

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.globalAlpha = f.alpha;

        if (f.kind === 0) drawMarigold(ctx, f.size, f.color);
        else if (f.kind === 1) drawRose(ctx, f.size, f.color);
        else if (f.kind === 2) drawBelpatra(ctx, f.size, f.color);
        else drawPetal(ctx, f.size, f.color);

        ctx.restore();

        if (f.y > height + 30 || f.x < -50 || f.x > width + 50) {
          if (f.isBurst && items.length > ambientCount) {
            items.splice(i, 1);
          } else {
            items[i] = createFlower(width, height, true, false);
          }
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-30 pointer-events-none"
    />
  );
}
