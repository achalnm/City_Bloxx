import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../constants.js';

const SILHOUETTE = (() => {
  const buildings = [];
  const rng = (n) => ((n * 7919 + 13) % 1000) / 1000;
  let x = -20;
  let i = 0;
  while (x < CANVAS_WIDTH + 40) {
    const w = 20 + rng(i * 3) * 40;
    const h = 30 + rng(i * 3 + 1) * 120;
    buildings.push({ x, w, h });
    x += w + 2 + rng(i * 3 + 2) * 6;
    i++;
  }
  return buildings;
})();

const STARS = (() => {
  const s = [];
  for (let i = 0; i < 80; i++) {
    const rx = ((i * 9337 + 7) % 1000) / 1000;
    const ry = ((i * 6271 + 11) % 1000) / 1000;
    const rb = ((i * 4457 + 3) % 1000) / 1000;
    s.push({ x: rx * CANVAS_WIDTH, y: ry * CANVAS_HEIGHT * 0.7, b: 0.3 + rb * 0.7 });
  }
  return s;
})();

const CLOUDS = [
  { x: 40,  y: 120, w: 70, h: 20 },
  { x: 200, y: 90,  w: 90, h: 25 },
  { x: 290, y: 150, w: 60, h: 18 },
  { x: 100, y: 200, w: 80, h: 22 },
];

export class BackgroundRenderer {
  constructor() {
    this.cloudOffset = 0;
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
    this.cloudOffset = (this.cloudOffset + dt * 8) % (CANVAS_WIDTH + 100);
  }

  render(ctx, scrollY = 0) {
    
    const heightFraction = Math.min(1, scrollY / 400);
    this._drawSky(ctx, heightFraction);
    this._drawStars(ctx, heightFraction);
    this._drawMoon(ctx, heightFraction, scrollY);
    this._drawClouds(ctx, heightFraction, scrollY);
    this._drawSilhouette(ctx, scrollY);
    this._drawGround(ctx, scrollY);
  }

  _drawSky(ctx, frac) {
    
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    
    const topR = Math.round(6   + frac * 0);
    const topG = Math.round(6   + frac * 0);
    const topB = Math.round(15  + frac * 10);
    const midR = Math.round(13  - frac * 5);
    const midG = Math.round(27  - frac * 10);
    const midB = Math.round(62  + frac * 20);
    const botR = Math.round(46  - frac * 30);
    const botG = Math.round(90  - frac * 50);
    const botB = Math.round(142 - frac * 80);

    grad.addColorStop(0,   `rgb(${topR},${topG},${topB})`);
    grad.addColorStop(0.5, `rgb(${midR},${midG},${midB})`);
    grad.addColorStop(1,   `rgb(${botR},${botG},${botB})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  _drawStars(ctx, frac) {
    if (frac < 0.1) return;
    const alpha = Math.min(1, (frac - 0.1) / 0.3);
    ctx.save();
    for (const s of STARS) {
      const twinkle = 0.6 + 0.4 * Math.sin(this.time * 2 + s.x);
      ctx.globalAlpha = alpha * s.b * twinkle;
      ctx.fillStyle = COLORS.STAR;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
      if (s.b > 0.7) ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2);
    }
    ctx.restore();
  }

  _drawMoon(ctx, frac, scrollY) {
    if (frac < 0.3) return;
    const alpha = Math.min(1, (frac - 0.3) / 0.3);
    const moonY = 50 - scrollY * 0.1;
    ctx.save();
    ctx.globalAlpha = alpha;

    const glow = ctx.createRadialGradient(290, moonY, 5, 290, moonY, 30);
    glow.addColorStop(0, 'rgba(232,224,160,0.3)');
    glow.addColorStop(1, 'rgba(232,224,160,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(260, moonY - 30, 60, 60);

    ctx.fillStyle = COLORS.MOON;
    ctx.beginPath();
    ctx.arc(290, moonY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#C8C090';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#D8D090';
    ctx.beginPath(); ctx.arc(283, moonY - 4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(296, moonY + 6, 2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  _drawClouds(ctx, frac, scrollY) {
    if (frac > 0.7) return;
    const alpha = Math.max(0, 1 - frac * 1.4);
    ctx.save();
    ctx.globalAlpha = alpha * 0.7;
    for (const c of CLOUDS) {
      const cx = ((c.x + this.cloudOffset) % (CANVAS_WIDTH + 100)) - 50;
      const cy = c.y - scrollY * 0.05;
      this._drawCloud(ctx, cx, cy, c.w, c.h);
    }
    ctx.restore();
  }

  _drawCloud(ctx, x, y, w, h) {
    ctx.fillStyle = COLORS.CLOUD;
    
    const cx = x + w / 2;
    ctx.beginPath();
    ctx.ellipse(cx, y + h, w / 2, h * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.2, y + h * 0.8, w * 0.35, h * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + w * 0.2, y + h * 0.8, w * 0.3, h * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawSilhouette(ctx, scrollY) {
    const baseY = CANVAS_HEIGHT - 80 + scrollY * 0.15;
    ctx.fillStyle = '#0A1020';
    for (const b of SILHOUETTE) {
      ctx.fillRect(b.x, baseY - b.h, b.w, b.h + 80);
      
      ctx.fillStyle = 'rgba(255,220,80,0.15)';
      const numW = Math.floor(b.w / 10);
      for (let row = 0; row < Math.floor(b.h / 14); row++) {
        for (let col = 0; col < numW; col++) {
          if ((row + col + Math.floor(this.time * 0.2)) % 7 !== 0) {
            ctx.fillRect(b.x + 3 + col * 10, baseY - b.h + 5 + row * 14, 5, 7);
          }
        }
      }
      ctx.fillStyle = '#0A1020';
    }
  }

  _drawGround(ctx, scrollY) {
    const groundY = CANVAS_HEIGHT - 80 + scrollY * 0.15;
    ctx.fillStyle = COLORS.GROUND;
    ctx.fillRect(0, groundY, CANVAS_WIDTH, CANVAS_HEIGHT - groundY);
    
    ctx.fillStyle = '#252525';
    ctx.fillRect(0, groundY + 40, CANVAS_WIDTH, 20);
    
    ctx.fillStyle = '#555555';
    const roadMarkOffset = (this.time * 30) % 40;
    for (let x = -40 + roadMarkOffset; x < CANVAS_WIDTH + 40; x += 40) {
      ctx.fillRect(x, groundY + 47, 20, 4);
    }
  }
}
