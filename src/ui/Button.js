import { NokiaFont } from '../../assets/fonts/nokiaFont.js';
import { Renderer } from '../rendering/Renderer.js';

const font = new NokiaFont(2);

export class Button {
  constructor(x, y, w, h, label, options = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.colorBg     = options.colorBg     || '#1A1A3A';
    this.colorBorder = options.colorBorder || '#4A90D9';
    this.colorText   = options.colorText   || '#FFFFFF';
    this.colorHover  = options.colorHover  || '#2A2A5A';
    this.colorPress  = options.colorPress  || '#0A0A20';
    this.disabled    = options.disabled    || false;
    this.hovered = false;
    this.pressed = false;
    this._pressTimer = 0;
    this.onClick = options.onClick || null;
    this._flashTimer = 0;
  }

  contains(x, y) {
    return x >= this.x && x <= this.x + this.w &&
           y >= this.y && y <= this.y + this.h;
  }

  handleTap(x, y, audio) {
    if (this.disabled) return false;
    if (this.contains(x, y)) {
      this.pressed = true;
      this._pressTimer = 0.12;
      this._flashTimer = 0.15;
      if (audio) audio.menuBlip();
      if (this.onClick) this.onClick();
      return true;
    }
    return false;
  }

  update(dt) {
    if (this._pressTimer > 0) {
      this._pressTimer -= dt;
      if (this._pressTimer <= 0) this.pressed = false;
    }
    if (this._flashTimer > 0) this._flashTimer -= dt;
  }

  render(ctx) {
    const flash = this._flashTimer > 0;
    const bg = this.disabled ? '#111122' :
               flash ? '#4A90D9' :
               this.pressed ? this.colorPress : this.colorBg;
    const border = this.disabled ? '#2A2A4A' : this.colorBorder;
    const text = this.disabled ? '#444466' : flash ? '#FFFFFF' : this.colorText;

    Renderer.roundRect(ctx, this.x, this.y, this.w, this.h, 6, bg, border, 2);

    if (!this.disabled) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, this.h / 2 - 2);
    }

    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 - 7;
    font.drawTextShadow(ctx, this.label, cx, cy, text, 'center');
  }
}
