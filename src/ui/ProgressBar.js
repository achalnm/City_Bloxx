import { Renderer } from '../rendering/Renderer.js';
import { NokiaFont } from '../../assets/fonts/nokiaFont.js';

const fontSm = new NokiaFont(1);

export class ProgressBar {
  constructor(x, y, w, h, options = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.value = options.value || 0;    
    this.label = options.label || '';
    this.colorFill  = options.colorFill  || '#4A90D9';
    this.colorBg    = options.colorBg    || '#0A0A20';
    this.colorBorder= options.colorBorder|| '#2A2A5A';
    this._displayValue = this.value;
  }

  update(dt) {
    this._displayValue += (this.value - this._displayValue) * Math.min(1, dt * 6);
  }

  render(ctx) {
    Renderer.roundRect(ctx, this.x, this.y, this.w, this.h, 3, this.colorBg, this.colorBorder, 1);

    const fillW = Math.max(0, Math.round(this._displayValue * (this.w - 4)));
    if (fillW > 0) {
      ctx.fillStyle = this.colorFill;
      ctx.fillRect(this.x + 2, this.y + 2, fillW, this.h - 4);
      
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(this.x + 2, this.y + 2, fillW, Math.floor((this.h - 4) / 2));
    }

    if (this.label) {
      fontSm.drawText(ctx, this.label, this.x + 4, this.y + Math.floor(this.h / 2) - 3, '#FFFFFF');
    }
  }
}
