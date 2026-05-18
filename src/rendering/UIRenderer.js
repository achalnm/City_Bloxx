import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, CITY_LEVELS } from '../constants.js';
import { NokiaFont } from '../../assets/fonts/nokiaFont.js';
import { Renderer } from './Renderer.js';

const font = new NokiaFont(2);
const fontSm = new NokiaFont(1);
const fontLg = new NokiaFont(3);

export class UIRenderer {
  constructor() {
    this._tapPromptAlpha = 1;
    this._tapPromptTimer = 0;
    this._showTapPrompt = true;
  }

  hideTapPrompt() { this._showTapPrompt = false; }

  update(dt) {
    this._tapPromptTimer += dt;
    this._tapPromptAlpha = 0.5 + 0.5 * Math.sin(this._tapPromptTimer * 3);
  }

  renderQuickHUD(ctx, score, blocksPlaced, combo, audioEnabled) {
    
    Renderer.roundRect(ctx, 4, 4, 110, 32, 4, COLORS.UI_PANEL, COLORS.UI_BORDER, 1);
    fontSm.drawText(ctx, 'SCORE', 10, 8, COLORS.UI_TEXT);
    font.drawText(ctx, String(score), 10, 18, COLORS.UI_ACCENT);

    Renderer.roundRect(ctx, CANVAS_WIDTH - 80, 4, 76, 32, 4, COLORS.UI_PANEL, COLORS.UI_BORDER, 1);
    fontSm.drawText(ctx, 'BLOCKS', CANVAS_WIDTH - 74, 8, COLORS.UI_TEXT);
    font.drawText(ctx, String(blocksPlaced), CANVAS_WIDTH - 74, 18, COLORS.UI_ACCENT);

    if (combo >= 2) {
      const comboText = `COMBO x${combo}`;
      const w = font.measureText(comboText) + 16;
      const x = CANVAS_WIDTH / 2 - w / 2;
      Renderer.roundRect(ctx, x, 42, w, 22, 4, '#FF6000', '#FF9040', 2);
      font.drawText(ctx, comboText, CANVAS_WIDTH / 2, 46, '#FFFFFF', 'center');
    }

    const muteLabel = audioEnabled ? 'M:SFX' : 'M:MUTE';
    fontSm.drawText(ctx, muteLabel, CANVAS_WIDTH - 42, CANVAS_HEIGHT - 14, '#606080');
  }

  renderBuildHUD(ctx, buildingType, floor, totalFloors, combo) {
    
    Renderer.roundRect(ctx, 4, 4, 130, 32, 4, COLORS.UI_PANEL, COLORS.UI_BORDER, 1);
    fontSm.drawText(ctx, 'FLOOR', 10, 8, COLORS.UI_TEXT);
    font.drawText(ctx, `${floor} / ${totalFloors}`, 10, 18, COLORS.UI_ACCENT);

    const typeColors = {
      BLUE: '#4A90D9', RED: '#E05252', GREEN: '#52B952', YELLOW: '#F0C040'
    };
    const typeLabels = {
      BLUE: 'RESIDENTIAL', RED: 'COMMERCIAL', GREEN: 'OFFICE', YELLOW: 'LUXURY'
    };
    const col = typeColors[buildingType] || '#4A90D9';
    const lbl = typeLabels[buildingType] || buildingType;
    const tw = font.measureText(lbl) + 16;
    Renderer.roundRect(ctx, CANVAS_WIDTH - tw - 4, 4, tw, 22, 4, col + '40', col, 1);
    font.drawText(ctx, lbl, CANVAS_WIDTH - 8, 8, col, 'right');

    if (combo >= 2) {
      const comboText = `COMBO x${combo}`;
      const w = font.measureText(comboText) + 16;
      const x = CANVAS_WIDTH / 2 - w / 2;
      Renderer.roundRect(ctx, x, 42, w, 22, 4, '#FF6000', '#FF9040', 2);
      font.drawText(ctx, comboText, CANVAS_WIDTH / 2, 46, '#FFFFFF', 'center');
    }
  }

  renderRatingFlash(ctx, rating, alpha) {
    if (alpha <= 0) return;
    const colors = {
      PERFECT: '#FFD700',
      GREAT:   '#80FF80',
      GOOD:    '#60CFFF',
      OK:      '#FFFFFF',
      POOR:    '#FF8040',
    };
    const col = colors[rating] || '#FFFFFF';
    ctx.save();
    ctx.globalAlpha = alpha;
    fontLg.drawTextShadow(ctx, rating, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, col, 'center');
    ctx.restore();
  }

  renderGameOver(ctx, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    fontLg.drawTextShadow(ctx, 'GAME OVER', CANVAS_WIDTH / 2, 200, '#FF4040', 'center');
    ctx.restore();
  }

  renderMissOverlay(ctx, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = '#FF2020';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }

  static drawPixelText(ctx, text, x, y, color, size = 2, align = 'left') {
    const f = new NokiaFont(size);
    f.drawText(ctx, text, x, y, color, align);
  }

  static getCityLevel(pop) {
    let level = CITY_LEVELS[0];
    for (const l of CITY_LEVELS) {
      if (pop >= l.min) level = l;
    }
    return level;
  }
}
