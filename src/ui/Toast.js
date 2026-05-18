import { NokiaFont } from '../../assets/fonts/nokiaFont.js';
import { CANVAS_WIDTH } from '../constants.js';
import { Renderer } from '../rendering/Renderer.js';

const fontLg = new NokiaFont(3);
const font   = new NokiaFont(2);

const RATING_CONFIG = {
  PERFECT: { color: '#FFD700', bg: '#3A2A00', border: '#FFD700', scale: 1.2 },
  GREAT:   { color: '#80FF80', bg: '#0A2A0A', border: '#40C040', scale: 1.0 },
  GOOD:    { color: '#60CFFF', bg: '#0A1A2A', border: '#40A0CF', scale: 0.9 },
  OK:      { color: '#CCCCCC', bg: '#1A1A1A', border: '#888888', scale: 0.8 },
  POOR:    { color: '#FF8040', bg: '#2A0A00', border: '#FF6020', scale: 0.85 },
  COMBO:   { color: '#FF8800', bg: '#2A1A00', border: '#FF8800', scale: 1.1 },
};

export class Toast {
  constructor(text, x, y, type = 'GOOD') {
    this.text = text;
    this.x = x;
    this.y = y;
    this.type = type;
    this.timer = 0;
    this.lifetime = type === 'PERFECT' ? 1.2 : 0.9;
    this.done = false;
    this._cfg = RATING_CONFIG[type] || RATING_CONFIG.GOOD;
    this._baseY = y;
    this._velY = -80; 
  }

  update(dt) {
    this.timer += dt;
    this.y += this._velY * dt;
    this._velY *= Math.pow(0.92, dt * 60);
    if (this.timer >= this.lifetime) this.done = true;
  }

  render(ctx) {
    const t = this.timer / this.lifetime;
    const alpha = t < 0.2 ? t / 0.2 : t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
    const scale = this._cfg.scale * (t < 0.15 ? 0.5 + (t / 0.15) * 0.5 : 1);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(Math.round(this.x), Math.round(this.y));
    ctx.scale(scale, scale);

    const f = this.type === 'PERFECT' || this.type === 'COMBO' ? fontLg : font;
    const tw = f.measureText(this.text) + 16;
    const th = f.charH + 8;

    Renderer.roundRect(ctx, -tw / 2, -th / 2, tw, th, 4,
      this._cfg.bg + 'CC', this._cfg.border, 2);
    f.drawText(ctx, this.text, 0, -f.charH / 2, this._cfg.color, 'center');

    ctx.restore();
  }
}

export class ToastManager {
  constructor() {
    this.toasts = [];
  }

  add(text, x, y, type) {
    
    this.toasts = this.toasts.filter(t => t.type !== type || t.timer < 0.1);
    this.toasts.push(new Toast(text, x, y, type));
  }

  addRating(rating, x, y) {
    this.add(rating, x, y, rating);
  }

  addCombo(count, x, y) {
    this.add(`COMBO x${count}`, x, y, 'COMBO');
  }

  update(dt) {
    for (const t of this.toasts) t.update(dt);
    this.toasts = this.toasts.filter(t => !t.done);
  }

  render(ctx) {
    for (const t of this.toasts) t.render(ctx);
  }

  clear() { this.toasts = []; }
}
