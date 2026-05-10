import { useEffect, useRef } from 'react';

const CANVAS_SIZE = 600;
const PALETTE = {
  deepOrange: '#C4622D',
  amber: '#E8A045',
  paleGold: '#F5D78E',
  cream: '#FDF0C0',
  ink: '#2C1A0E',
};

const STALKS = [
  { baseX: 115, baseY: 590, height: 505, width: 28, curve: -24, lean: -5, nodes: 7, alpha: 0.82 },
  { baseX: 225, baseY: 604, height: 565, width: 34, curve: 18, lean: 8, nodes: 8, alpha: 0.78 },
  { baseX: 345, baseY: 592, height: 520, width: 30, curve: -15, lean: 4, nodes: 7, alpha: 0.86 },
  { baseX: 475, baseY: 610, height: 555, width: 32, curve: 26, lean: -7, nodes: 8, alpha: 0.76 },
];

const LEAVES = [
  { stalk: 0, t: 0.25, side: 1, length: 120, width: 22, angle: -0.45, bend: 28, alpha: 0.72, phase: 0.2 },
  { stalk: 0, t: 0.36, side: -1, length: 92, width: 18, angle: -2.55, bend: -16, alpha: 0.68, phase: 1.1 },
  { stalk: 0, t: 0.53, side: 1, length: 105, width: 19, angle: -0.7, bend: 17, alpha: 0.8, phase: 2.0 },
  { stalk: 1, t: 0.18, side: -1, length: 112, width: 21, angle: -2.65, bend: -24, alpha: 0.76, phase: 2.8 },
  { stalk: 1, t: 0.28, side: 1, length: 145, width: 25, angle: -0.38, bend: 30, alpha: 0.73, phase: 0.9 },
  { stalk: 1, t: 0.44, side: -1, length: 112, width: 20, angle: -2.85, bend: -20, alpha: 0.82, phase: 1.7 },
  { stalk: 1, t: 0.6, side: 1, length: 96, width: 17, angle: -0.85, bend: 14, alpha: 0.67, phase: 3.0 },
  { stalk: 2, t: 0.22, side: 1, length: 118, width: 20, angle: -0.28, bend: 19, alpha: 0.7, phase: 1.5 },
  { stalk: 2, t: 0.35, side: -1, length: 126, width: 23, angle: -2.62, bend: -22, alpha: 0.77, phase: 2.4 },
  { stalk: 2, t: 0.5, side: 1, length: 100, width: 18, angle: -0.72, bend: 16, alpha: 0.85, phase: 0.3 },
  { stalk: 2, t: 0.68, side: -1, length: 86, width: 15, angle: -2.35, bend: -13, alpha: 0.66, phase: 3.4 },
  { stalk: 3, t: 0.2, side: -1, length: 136, width: 24, angle: -2.75, bend: -28, alpha: 0.78, phase: 2.2 },
  { stalk: 3, t: 0.33, side: 1, length: 102, width: 18, angle: -0.5, bend: 17, alpha: 0.7, phase: 0.6 },
  { stalk: 3, t: 0.54, side: -1, length: 100, width: 17, angle: -2.38, bend: -14, alpha: 0.81, phase: 1.8 },
];

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function stalkPoint(stalk, t) {
  const y = stalk.baseY - stalk.height * t;
  const sway = Math.sin(t * Math.PI) * stalk.curve;
  const lean = stalk.lean * t;
  const x = stalk.baseX + sway + lean;
  return { x, y };
}

function drawSoftBackground(ctx) {
  const sunset = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
  sunset.addColorStop(0, PALETTE.deepOrange);
  sunset.addColorStop(0.42, PALETTE.amber);
  sunset.addColorStop(0.78, PALETTE.paleGold);
  sunset.addColorStop(1, PALETTE.cream);
  ctx.fillStyle = sunset;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const glow = ctx.createRadialGradient(445, 120, 15, 445, 120, 470);
  glow.addColorStop(0, rgba(PALETTE.cream, 0.72));
  glow.addColorStop(0.46, rgba(PALETTE.paleGold, 0.2));
  glow.addColorStop(1, rgba(PALETTE.deepOrange, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.save();
  ctx.globalAlpha = 0.11;
  for (let i = 0; i < 130; i += 1) {
    const x = (i * 47) % CANVAS_SIZE;
    const y = (i * 83) % CANVAS_SIZE;
    const radius = 0.5 + ((i * 19) % 10) / 10;
    ctx.fillStyle = i % 2 ? PALETTE.cream : PALETTE.deepOrange;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawStalk(ctx, stalk, index) {
  const top = stalkPoint(stalk, 1);
  const base = stalkPoint(stalk, 0);
  const highlightOffset = stalk.width * 0.22;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const bodyGradient = ctx.createLinearGradient(base.x - stalk.width, 0, base.x + stalk.width, 0);
  bodyGradient.addColorStop(0, rgba(PALETTE.deepOrange, stalk.alpha * 0.82));
  bodyGradient.addColorStop(0.36, rgba(PALETTE.amber, stalk.alpha));
  bodyGradient.addColorStop(0.7, rgba(PALETTE.paleGold, stalk.alpha * 0.88));
  bodyGradient.addColorStop(1, rgba(PALETTE.deepOrange, stalk.alpha * 0.62));

  ctx.strokeStyle = bodyGradient;
  ctx.lineWidth = stalk.width;
  ctx.beginPath();
  ctx.moveTo(base.x, base.y);
  ctx.bezierCurveTo(
    stalk.baseX + stalk.curve * 0.4,
    stalk.baseY - stalk.height * 0.34,
    stalk.baseX + stalk.curve * 1.12 + stalk.lean * 0.7,
    stalk.baseY - stalk.height * 0.68,
    top.x,
    top.y,
  );
  ctx.stroke();

  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = PALETTE.cream;
  ctx.lineWidth = Math.max(3, stalk.width * 0.14);
  ctx.beginPath();
  ctx.moveTo(base.x + highlightOffset, base.y - 5);
  ctx.bezierCurveTo(
    stalk.baseX + highlightOffset + stalk.curve * 0.42,
    stalk.baseY - stalk.height * 0.35,
    stalk.baseX + highlightOffset + stalk.curve * 1.05 + stalk.lean * 0.7,
    stalk.baseY - stalk.height * 0.68,
    top.x + highlightOffset * 0.45,
    top.y + 2,
  );
  ctx.stroke();
  ctx.globalAlpha = 1;

  for (let node = 1; node < stalk.nodes; node += 1) {
    const t = node / stalk.nodes;
    const point = stalkPoint(stalk, t);
    const wobble = Math.sin((index + 1) * node * 1.7) * 2.2;
    const nodeWidth = stalk.width * (0.76 + (node % 3) * 0.05);

    ctx.save();
    ctx.translate(point.x, point.y + wobble);
    ctx.rotate((stalk.curve / 600) * Math.sin(t * Math.PI));

    ctx.strokeStyle = rgba(PALETTE.ink, 0.46);
    ctx.lineWidth = 1.4 + (node % 2) * 0.45;
    ctx.beginPath();
    ctx.moveTo(-nodeWidth / 2, -2);
    ctx.bezierCurveTo(-nodeWidth / 5, 4, nodeWidth / 5, -3, nodeWidth / 2, 1.5);
    ctx.stroke();

    ctx.fillStyle = rgba(PALETTE.deepOrange, 0.28);
    ctx.beginPath();
    ctx.ellipse(0, 3, nodeWidth * 0.48, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawLeaf(ctx, leaf, time) {
  const stalk = STALKS[leaf.stalk];
  const anchor = stalkPoint(stalk, leaf.t);
  const sway = Math.sin(time * 0.0014 + leaf.phase) * 0.055;
  const angle = leaf.angle + sway;
  const tip = {
    x: anchor.x + Math.cos(angle) * leaf.length,
    y: anchor.y + Math.sin(angle) * leaf.length,
  };
  const normal = { x: -Math.sin(angle), y: Math.cos(angle) };
  const center = {
    x: anchor.x + Math.cos(angle) * leaf.length * 0.48,
    y: anchor.y + Math.sin(angle) * leaf.length * 0.48 + Math.sin(time * 0.001 + leaf.phase) * 2,
  };
  const irregular = Math.sin(leaf.phase * 7.3) * 3.5;
  const bend = leaf.bend + Math.sin(time * 0.0012 + leaf.phase) * 3;

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.globalAlpha = leaf.alpha;

  ctx.fillStyle = rgba(PALETTE.ink, 0.92);
  ctx.beginPath();
  ctx.moveTo(anchor.x, anchor.y);
  ctx.bezierCurveTo(
    center.x + normal.x * (leaf.width + irregular),
    center.y + normal.y * leaf.width + bend * 0.22,
    tip.x - Math.cos(angle) * leaf.length * 0.24 + normal.x * leaf.width * 0.34,
    tip.y - Math.sin(angle) * leaf.length * 0.24 + normal.y * leaf.width * 0.22,
    tip.x,
    tip.y,
  );
  ctx.bezierCurveTo(
    tip.x - Math.cos(angle) * leaf.length * 0.28 - normal.x * leaf.width * 0.22,
    tip.y - Math.sin(angle) * leaf.length * 0.28 - normal.y * leaf.width * 0.18,
    center.x - normal.x * (leaf.width * 0.66 - irregular * 0.35),
    center.y - normal.y * leaf.width * 0.72 + bend * 0.08,
    anchor.x,
    anchor.y,
  );
  ctx.fill();

  ctx.globalAlpha = Math.min(0.5, leaf.alpha);
  ctx.strokeStyle = rgba(PALETTE.cream, 0.34);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(anchor.x + normal.x * 1.5, anchor.y + normal.y * 1.5);
  ctx.quadraticCurveTo(center.x + bend * 0.2, center.y + bend * 0.18, tip.x, tip.y);
  ctx.stroke();

  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(anchor.x, anchor.y);
  ctx.quadraticCurveTo(center.x - bend * 0.08, center.y + bend * 0.14, tip.x, tip.y);
  ctx.stroke();
  ctx.restore();
}

function drawPorcelainSheen(ctx) {
  const sheen = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  sheen.addColorStop(0, rgba(PALETTE.cream, 0.22));
  sheen.addColorStop(0.48, rgba(PALETTE.cream, 0.02));
  sheen.addColorStop(1, rgba(PALETTE.cream, 0.18));
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.strokeStyle = rgba(PALETTE.cream, 0.36);
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, CANVAS_SIZE - 10, CANVAS_SIZE - 10);
}

export default function NoritakeBambooCanvas({ className = '', style }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frameId;

    const render = (time = 0) => {
      const pixelRatio = window.devicePixelRatio || 1;
      if (canvas.width !== CANVAS_SIZE * pixelRatio || canvas.height !== CANVAS_SIZE * pixelRatio) {
        canvas.width = CANVAS_SIZE * pixelRatio;
        canvas.height = CANVAS_SIZE * pixelRatio;
      }

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawSoftBackground(ctx);
      STALKS.forEach((stalk, index) => drawStalk(ctx, stalk, index));
      LEAVES.forEach((leaf) => drawLeaf(ctx, leaf, time));
      drawPorcelainSheen(ctx);
      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      role="img"
      aria-label="Hand-painted Japanese-style bamboo in warm Noritake lusterware sunset tones"
      style={{
        display: 'block',
        width: `${CANVAS_SIZE}px`,
        height: `${CANVAS_SIZE}px`,
        borderRadius: '18px',
        boxShadow: '0 24px 70px rgba(44, 26, 14, 0.28)',
        ...style,
      }}
    />
  );
}
