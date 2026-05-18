import { NokiaFont } from '../../assets/fonts/nokiaFont.js';
import { Button } from '../ui/Button.js';
import { Renderer } from '../rendering/Renderer.js';
import { ScoreManager } from '../core/ScoreManager.js';
import { drawStarBurst } from '../../assets/sprites/sprites.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SCENES } from '../constants.js';

const fontLg = new NokiaFont(3);
const fontMd = new NokiaFont(2);
const fontSm = new NokiaFont(1);

export class HighScoresScene {
  constructor(eventBus, audio) {
    this.eventBus = eventBus;
    this.audio = audio;
    this.sceneManager = null;
    this._time = 0;
    this._unsub = [];

    this._backBtn = new Button(CANVAS_WIDTH / 2 - 60, CANVAS_HEIGHT - 70, 120, 40, 'BACK', {
      colorBg:'#1A1A2A', colorBorder:'#4A4A8A', colorText:'#8080C0',
      onClick: () => this.sceneManager.switchTo(SCENES.MAIN_MENU),
    });
  }

  onEnter() {
    this._time = 0;
    this._scores = ScoreManager.getHighScoreList();
    this._unsub.push(this.eventBus.on('INPUT_ACTION', (e) => {
      if (e.type === 'tap') this._backBtn.handleTap(e.x, e.y, this.audio);
      if (e.type === 'back' || e.type === 'confirm') this.sceneManager.switchTo(SCENES.MAIN_MENU);
    }));
  }

  onExit() {
    for (const u of this._unsub) u();
    this._unsub = [];
  }

  update(dt) {
    this._time += dt;
    this._backBtn.update(dt);
  }

  render(ctx) {
    ctx.fillStyle = '#06060F';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    Renderer.roundRect(ctx, 20, 20, CANVAS_WIDTH - 40, 60, 6, '#0A0A20', '#4A4A8A', 1);
    fontLg.drawTextShadow(ctx, 'HIGH SCORES', CANVAS_WIDTH / 2, 32, '#FFD700', 'center');

    Renderer.roundRect(ctx, 20, 110, CANVAS_WIDTH - 40, 130, 6, '#0A0A20', '#4A90D9', 1);
    fontSm.drawText(ctx, 'QUICK GAME', CANVAS_WIDTH / 2, 120, '#87C0F0', 'center');

    drawStarBurst(ctx, 50, 175, 20, 5, '#4A90D9');
    drawStarBurst(ctx, CANVAS_WIDTH - 50, 175, 20, 5, '#4A90D9');

    const qFont = new NokiaFont(4);
    qFont.drawTextShadow(ctx, String(this._scores.quick), CANVAS_WIDTH / 2, 148, '#FFD700', 'center');

    const pulse = 0.5 + 0.5 * Math.sin(this._time * 2);
    fontSm.drawText(ctx,
      this._scores.quick > 0 ? 'PERSONAL BEST' : 'NO SCORE YET',
      CANVAS_WIDTH / 2, 210,
      this._scores.quick > 0 ? `rgba(255,215,0,${pulse})` : '#404060',
      'center'
    );

    Renderer.roundRect(ctx, 20, 260, CANVAS_WIDTH - 40, 130, 6, '#0A0A20', '#52B952', 1);
    fontSm.drawText(ctx, 'BUILD CITY', CANVAS_WIDTH / 2, 270, '#7FD97F', 'center');

    drawStarBurst(ctx, 50, 325, 20, 5, '#52B952');
    drawStarBurst(ctx, CANVAS_WIDTH - 50, 325, 20, 5, '#52B952');

    const bFont = new NokiaFont(4);
    bFont.drawTextShadow(ctx, String(this._scores.build), CANVAS_WIDTH / 2, 295, '#80FF80', 'center');
    fontSm.drawText(ctx,
      this._scores.build > 0 ? 'MAX POPULATION' : 'NO CITY YET',
      CANVAS_WIDTH / 2, 360,
      this._scores.build > 0 ? '#80FF80' : '#404060',
      'center'
    );

    Renderer.roundRect(ctx, 20, 415, CANVAS_WIDTH - 40, 68, 6, 'rgba(10,10,20,0.5)', '#303050', 1);
    fontSm.drawText(ctx, 'TIPS:', 30, 423, '#606080');
    fontSm.drawText(ctx, 'PERFECT DROP = FULL BONUS + COMBO', 30, 437, '#404060');
    fontSm.drawText(ctx, 'COMBO x3+ = SPEED BONUS RESETS', 30, 449, '#404060');
    fontSm.drawText(ctx, 'YELLOW NEEDS ALL 3 TYPES ADJ', 30, 461, '#404060');
    fontSm.drawText(ctx, 'PRESS M TO TOGGLE MUSIC', 30, 473, '#404060');

    this._backBtn.render(ctx);
  }
}
