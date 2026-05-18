import { NokiaFont } from '../../assets/fonts/nokiaFont.js';
import { Button } from '../ui/Button.js';
import { Renderer } from '../rendering/Renderer.js';
import { ScoreManager } from '../core/ScoreManager.js';
import { drawStarBurst } from '../../assets/sprites/sprites.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SCENES } from '../constants.js';

const fontLg = new NokiaFont(4);
const fontMd = new NokiaFont(2);
const fontSm = new NokiaFont(1);

export class GameOverScene {
  constructor(eventBus, audio) {
    this.eventBus = eventBus;
    this.audio = audio;
    this.sceneManager = null;

    this._finalScore = 0;
    this._blocksPlaced = 0;
    this._isHighScore = false;
    this._displayScore = 0;
    this._scoreCountSpeed = 0;
    this._time = 0;
    this._mode = 'QUICK';
    this._particles = [];
    this._unsub = [];

    const cx = CANVAS_WIDTH / 2;
    this._replayBtn = new Button(cx - 85, 450, 170, 46, 'PLAY AGAIN', {
      colorBg:'#1A2A4A', colorBorder:'#4A90D9', colorText:'#87C0F0',
      onClick: () => {
        if (this._mode === 'QUICK') this.sceneManager.switchTo(SCENES.STACKING, { mode: 'QUICK' });
        else this.sceneManager.switchTo(SCENES.BUILD_CITY);
      },
    });
    this._menuBtn = new Button(cx - 85, 508, 170, 46, 'MAIN MENU', {
      colorBg:'#1A1A2A', colorBorder:'#4A4A8A', colorText:'#8080C0',
      onClick: () => this.sceneManager.switchTo(SCENES.MAIN_MENU),
    });
  }

  onEnter(data = {}) {
    this._finalScore   = data.score || 0;
    this._blocksPlaced = data.blocksPlaced || 0;
    this._mode         = data.mode || 'QUICK';
    this._displayScore = 0;
    this._time         = 0;
    this._scoreCountSpeed = Math.max(10, this._finalScore / 120);

    const hs = ScoreManager.getHighScoreList();
    this._isHighScore = this._finalScore > hs.quick && this._mode === 'QUICK';
    if (this._isHighScore) {
      this._spawnStarburst();
    }

    this._unsub.push(this.eventBus.on('INPUT_ACTION', (e) => {
      if (e.type === 'tap') {
        this._replayBtn.handleTap(e.x, e.y, this.audio);
        this._menuBtn.handleTap(e.x, e.y, this.audio);
      }
      if (e.type === 'back') this.sceneManager.switchTo(SCENES.MAIN_MENU);
    }));
  }

  onExit() {
    for (const u of this._unsub) u();
    this._unsub = [];
    this._particles = [];
  }

  _spawnStarburst() {
    for (let i = 0; i < 25; i++) {
      setTimeout(() => {
        const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
        const y = 60 + Math.random() * 200;
        const color = ['#FFD700','#FF8C00','#FF4040','#80FF80','#40C0FF'][Math.floor(Math.random()*5)];
        this._particles.push({ x, y, vx: (Math.random()-0.5)*60, vy: -40-Math.random()*80,
          life: 1.5+Math.random(), maxLife: 1.5, size: 3+Math.random()*5, color });
      }, i * 80);
    }
  }

  update(dt) {
    this._time += dt;
    this._replayBtn.update(dt);
    this._menuBtn.update(dt);

    if (this._displayScore < this._finalScore) {
      this._displayScore = Math.min(this._finalScore,
        Math.round(this._displayScore + this._scoreCountSpeed * dt * 60));
    }

    for (const p of this._particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt;
      p.life -= dt;
    }
    this._particles = this._particles.filter(p => p.life > 0);

    if (this._isHighScore && Math.random() < dt * 3) {
      this._spawnSingleParticle();
    }
  }

  _spawnSingleParticle() {
    const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
    const y = 40 + Math.random() * 180;
    const color = ['#FFD700','#FF8C00','#FFFFFF'][Math.floor(Math.random()*3)];
    this._particles.push({ x, y, vx: (Math.random()-0.5)*40, vy: -20-Math.random()*50,
      life: 0.8+Math.random()*0.4, maxLife: 0.8, size: 2+Math.random()*3, color });
  }

  render(ctx) {
    
    ctx.fillStyle = '#06060F';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = 'rgba(40,40,100,0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }

    for (const p of this._particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = p.color;
      const s = Math.max(1, p.size);
      ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
    }
    ctx.globalAlpha = 1;

    const pulse = 1 + 0.05 * Math.sin(this._time * 3);
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, 140);
    ctx.scale(pulse, pulse);
    fontLg.drawTextShadow(ctx, 'GAME', 0, -30, '#FF4040', 'center');
    fontLg.drawTextShadow(ctx, 'OVER', 0, 10, '#FF4040', 'center');
    ctx.restore();

    Renderer.roundRect(ctx, 20, 210, CANVAS_WIDTH - 40, 100, 8, '#0A0A20', '#2A2A5A', 1);
    fontSm.drawText(ctx, 'FINAL SCORE', CANVAS_WIDTH / 2, 222, '#808080', 'center');

    const scoreStr = String(this._displayScore);
    const scoreFont = new NokiaFont(4);
    scoreFont.drawTextShadow(ctx, scoreStr, CANVAS_WIDTH / 2, 238, '#FFD700', 'center');

    fontMd.drawText(ctx, `BLOCKS PLACED: ${this._blocksPlaced}`, CANVAS_WIDTH / 2, 292, '#CCCCCC', 'center');

    if (this._isHighScore) {
      const bPulse = 0.5 + 0.5 * Math.sin(this._time * 4);
      Renderer.roundRect(ctx, 30, 325, CANVAS_WIDTH - 60, 36, 6,
        `rgba(100,80,0,${0.6 + bPulse * 0.4})`, '#FFD700', 2);
      drawStarBurst(ctx, 55, 343, 12, 5, '#FFD700');
      drawStarBurst(ctx, CANVAS_WIDTH - 55, 343, 12, 5, '#FFD700');
      fontMd.drawText(ctx, 'NEW HIGH SCORE!', CANVAS_WIDTH / 2, 333, '#FFD700', 'center');
    } else {
      const prevHS = ScoreManager.getHighScoreList().quick;
      fontSm.drawText(ctx, `BEST: ${prevHS}`, CANVAS_WIDTH / 2, 332, '#505070', 'center');
    }

    this._replayBtn.render(ctx);
    this._menuBtn.render(ctx);

    fontSm.drawText(ctx, 'SPACE = PLAY AGAIN', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10, '#303050', 'center');
  }
}
