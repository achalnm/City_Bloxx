import { NokiaFont } from '../../assets/fonts/nokiaFont.js';
import { Button } from '../ui/Button.js';
import { Renderer } from '../rendering/Renderer.js';
import { BackgroundRenderer } from '../rendering/BackgroundRenderer.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SCENES } from '../constants.js';

const fontLg = new NokiaFont(4);
const fontMd = new NokiaFont(2);
const fontSm = new NokiaFont(1);

export class MainMenuScene {
  constructor(eventBus, audio) {
    this.eventBus = eventBus;
    this.audio = audio;
    this.sceneManager = null;

    this._bg = new BackgroundRenderer();
    this._time = 0;
    this._unsub = [];

    this._craneAngle = 0;
    this._craneSpeed = 1.2;
    this._craneDir = 1;
    this._logoBounce = 0;

    this._initButtons();
  }

  _initButtons() {
    const cx = CANVAS_WIDTH / 2;

    this._navButtons = [
      new Button(cx - 90, 310, 180, 44, 'QUICK GAME', {
        colorBg: '#1A2A4A', colorBorder: '#4A90D9', colorText: '#87C0F0',
        onClick: () => this.sceneManager.switchTo(SCENES.QUICK_GAME),
      }),
      new Button(cx - 90, 366, 180, 44, 'BUILD CITY', {
        colorBg: '#2A1A1A', colorBorder: '#E05252', colorText: '#F07070',
        onClick: () => this.sceneManager.switchTo(SCENES.BUILD_CITY),
      }),
      new Button(cx - 90, 422, 180, 44, 'HIGH SCORES', {
        colorBg: '#1A1A2A', colorBorder: '#4A4A8A', colorText: '#8080C0',
        onClick: () => this.sceneManager.switchTo(SCENES.HIGH_SCORES),
      }),
    ];

    this._musicBtn = new Button(14, 500, 158, 30, 'MUSIC: ON', {
      colorBg: '#0A1A0A', colorBorder: '#3A5A3A', colorText: '#5A8A5A',
      onClick: () => {
        const on = this.audio.toggleMusic();
        this._musicBtn.label = on ? 'MUSIC: ON' : 'MUSIC: OFF';
      },
    });

    this._sfxBtn = new Button(188, 500, 158, 30, 'SOUND: ON', {
      colorBg: '#0A1A0A', colorBorder: '#3A5A3A', colorText: '#5A8A5A',
      onClick: () => {
        const on = this.audio.toggle();
        this._sfxBtn.label = on ? 'SOUND: ON' : 'SOUND: OFF';
      },
    });

    this._buttons = [...this._navButtons, this._musicBtn, this._sfxBtn];
  }

  onEnter() {
    this._time = 0;
    this._bg = new BackgroundRenderer();
    this._musicBtn.label = this.audio.musicEnabled ? 'MUSIC: ON' : 'MUSIC: OFF';
    this._sfxBtn.label = this.audio.enabled ? 'SOUND: ON' : 'SOUND: OFF';
    this._unsub.push(this.eventBus.on('INPUT_ACTION', (e) => this._handleInput(e)));
    this.audio.startMusic();
  }

  onExit() {
    for (const u of this._unsub) u();
    this._unsub = [];
  }

  _handleInput(e) {
    if (e.type === 'tap') {
      for (const btn of this._buttons) btn.handleTap(e.x, e.y, this.audio);
    }
    if (e.type === 'mute') this.audio.toggle();
    if (e.type === 'confirm') this.sceneManager.switchTo(SCENES.QUICK_GAME);
  }

  update(dt) {
    this._time += dt;
    this._bg.update(dt);
    this._logoBounce = Math.sin(this._time * 2.5) * 5;

    this._craneAngle += this._craneSpeed * this._craneDir * dt;
    if (Math.abs(this._craneAngle) > 35) this._craneDir *= -1;

    for (const btn of this._buttons) btn.update(dt);
  }

  render(ctx) {
    this._bg.render(ctx, 0);
    this._renderCrane(ctx);
    this._renderLogo(ctx);
    this._renderButtons(ctx);
    this._renderFooter(ctx);
  }

  _renderCrane(ctx) {
    const px = CANVAS_WIDTH / 2;
    const py = 80;
    const armLen = 100;
    const angle = this._craneAngle * Math.PI / 180;

    ctx.strokeStyle = '#808080'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, py); ctx.stroke();
    ctx.strokeStyle = '#606060'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px - 18, 0); ctx.lineTo(px + 18, 0); ctx.stroke();

    const tx = px + Math.sin(angle) * armLen;
    const ty = py + Math.cos(angle) * armLen;

    ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tx, ty); ctx.stroke();

    ctx.strokeStyle = '#C89838'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty + 40); ctx.stroke();

    const bx = tx - 30, by = ty + 42;
    ctx.fillStyle = '#4A90D9';
    ctx.fillRect(bx, by, 60, 22);
    ctx.fillStyle = '#87C0F0';
    ctx.fillRect(bx + 1, by + 1, 58, 9);
    ctx.strokeStyle = '#2C5F8A'; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, 60, 22);
    ctx.fillStyle = '#FFE080';
    for (let i = 0; i < 2; i++) ctx.fillRect(bx + 12 + i * 22, by + 6, 8, 8);

    ctx.fillStyle = '#B0B0B0';
    ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
  }

  _renderLogo(ctx) {
    const y = 180 + this._logoBounce;

    Renderer.roundRect(ctx, 20, y - 10, CANVAS_WIDTH - 40, 80, 8,
      'rgba(0,0,30,0.7)', '#4A4A8A', 1);

    const blockColors = ['#4A90D9', '#E05252', '#52B952', '#F0C040'];
    for (let i = 0; i < 4; i++) {
      const bx = 30 + i * 22;
      const bOff = Math.sin(this._time * 2.5 + i * 0.8) * 4;
      ctx.fillStyle = blockColors[i];
      ctx.fillRect(bx, y + 10 + bOff, 18, 14);
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(bx, y + 10 + bOff, 18, 14);
    }
    for (let i = 0; i < 4; i++) {
      const bx = CANVAS_WIDTH - 52 + (i - 2) * 22;
      const bOff = Math.sin(this._time * 2.5 + i * 0.7 + Math.PI) * 4;
      ctx.fillStyle = blockColors[(i + 2) % 4];
      ctx.fillRect(bx, y + 10 + bOff, 18, 14);
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(bx, y + 10 + bOff, 18, 14);
    }

    fontLg.drawTextShadow(ctx, 'CITY', CANVAS_WIDTH / 2, y + 5, '#FFD700', 'center');
    fontLg.drawTextShadow(ctx, 'BLOXX', CANVAS_WIDTH / 2, y + 37, '#FF8C00', 'center');
    fontSm.drawText(ctx, 'INSPIRED BY TOWER BLOXX', CANVAS_WIDTH / 2, y + 68, '#404060', 'center');
  }

  _renderButtons(ctx) {
    Renderer.roundRect(ctx, 10, 488, CANVAS_WIDTH - 20, 54, 4, 'rgba(0,0,0,0.3)', '#1A2A1A', 1);
    fontSm.drawText(ctx, 'AUDIO', 22, 492, '#304030');
    for (const btn of this._buttons) btn.render(ctx);
  }

  _renderFooter(ctx) {
    fontSm.drawText(ctx, 'SPACE / TAP TO PLAY', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 22, '#303050', 'center');
    fontSm.drawText(ctx, 'by Achal Nanjundamurthy', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 8, '#232333', 'center');
  }
}
