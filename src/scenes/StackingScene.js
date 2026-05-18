import { NokiaFont } from '../../assets/fonts/nokiaFont.js';
import { Crane } from '../entities/Crane.js';
import { Tower } from '../entities/Tower.js';
import { Resident } from '../entities/Resident.js';
import { BlockPhysics } from '../physics/BlockPhysics.js';
import { CollisionDetector } from '../physics/CollisionDetector.js';
import { BackgroundRenderer } from '../rendering/BackgroundRenderer.js';
import { TowerRenderer } from '../rendering/TowerRenderer.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { Renderer } from '../rendering/Renderer.js';
import { ToastManager } from '../ui/Toast.js';
import { ScoreManager } from '../core/ScoreManager.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  BLOCK_WIDTH, BLOCK_HEIGHT,
  PLATFORM_Y,
  CRANE_PIVOT_X, CRANE_PIVOT_Y,
  ROPE_LENGTH,
  SCROLL_THRESHOLD_Y,
  BUILDING_CONFIG, SCENES,
} from '../constants.js';

export class StackingScene {
  constructor(eventBus, audio) {
    this.eventBus = eventBus;
    this.audio = audio;
    this.sceneManager = null;

    this._bgRenderer    = new BackgroundRenderer();
    this._towerRenderer = new TowerRenderer();
    this._uiRenderer    = new UIRenderer();
    this._toasts        = new ToastManager();
    this._score         = new ScoreManager();

    this._crane     = new Crane();
    this._tower     = new Tower();
    this._blockPhys = new BlockPhysics();
    this._residents = [];

    this._fontLg = new NokiaFont(4);
    this._fontMd = new NokiaFont(2);
    this._fontSm = new NokiaFont(1);

    this._mode         = 'QUICK';
    this._buildingType = 'BLUE';
    this._totalFloors  = Infinity;

    this._state = 'idle';
    this._scrollY = 0;
    this._targetScrollY = 0;
    this._screenShake = 0;

    this._missTimer  = 0;
    this._missBlockX = 0;
    this._missBlockY = 0;
    this._missBlockVX = 0;
    this._missBlockVY = 0;

    this._particles    = [];
    this._firstDrop    = true;
    this._showTapPrompt= true;
    this._unsub        = [];
  }

  onEnter(data = {}) {
    this._mode = data.mode || 'QUICK';
    this._buildingType = data.buildingType || 'BLUE';
    const cfg = BUILDING_CONFIG[this._buildingType];
    this._totalFloors = this._mode === 'BUILD' ? cfg.floors : Infinity;

    this._crane.reset();
    this._tower.reset();
    this._blockPhys.falling = false;
    this._blockPhys.landed  = false;
    this._residents = [];
    this._toasts.clear();
    this._score.reset();
    this._particles = [];

    this._state         = 'idle';
    this._scrollY       = 0;
    this._targetScrollY = 0;
    this._screenShake   = 0;
    this._missTimer     = 0;
    this._firstDrop      = true;
    this._showTapPrompt  = true;
    this._inputLockTimer = 0.4;   

    this._unsub.push(this.eventBus.on('INPUT_ACTION', (e) => this._handleInput(e)));
    this._unsub.push(this.eventBus.on('CRANE_TICK', () => this.audio.swingTick()));

    this.audio.stopMusic();
    this.audio.startMusic();
    this.audio.gameStart();
  }

  onExit() {
    for (const u of this._unsub) u();
    this._unsub = [];
  }

  _handleInput(e) {
    if (e.type === 'back') {
      this._cleanupAndGo(SCENES.MAIN_MENU);
      return;
    }
    if (e.type === 'mute') {
      this.audio.toggle();
      return;
    }
    if (this._state === 'gameover' && (e.type === 'drop' || e.type === 'tap')) {
      this._goToGameOver();
      return;
    }
    if (this._state === 'complete' && (e.type === 'drop' || e.type === 'tap')) {
      this._finishBuilding();
      return;
    }
    if ((e.type === 'drop' || e.type === 'tap') && this._state === 'idle' && this._inputLockTimer <= 0) {
      this._dropBlock();
    }
  }

  _dropBlock() {
    if (this._firstDrop) {
      this._firstDrop = false;
      this._showTapPrompt = false;
    }
    this._blockPhys.drop(
      this._crane.blockCenterX,
      this._crane.blockCenterY - BLOCK_HEIGHT / 2
    );
    this._state = 'dropping';
    this.audio.drop();
  }

  update(dt) {
    if (this._inputLockTimer > 0) this._inputLockTimer -= dt;
    this._bgRenderer.update(dt);
    this._crane.update(dt, this.eventBus);
    this._toasts.update(dt);
    this._tower.update(dt);
    this._uiRenderer.update(dt);

    this._scrollY += (this._targetScrollY - this._scrollY) * Math.min(1, dt * 5);
    if (this._screenShake > 0) this._screenShake = Math.max(0, this._screenShake - dt * 10);

    this._updateParticles(dt);
    for (const r of this._residents) r.update(dt);
    this._residents = this._residents.filter(r => !r.done);

    if (this._state === 'dropping') {
      this._blockPhys.update(dt);
      const landY = this._tower.topScreenY(this._scrollY);
      if (this._blockPhys.checkLanding(landY, BLOCK_HEIGHT)) {
        this._onBlockLanded();
      } else if (this._blockPhys.y > CANVAS_HEIGHT + 120) {
        this._onMiss(this._blockPhys.x, this._blockPhys.y);
      }
    } else if (this._state === 'miss') {
      this._missTimer -= dt;
      this._missBlockY  += this._missBlockVY * dt;
      this._missBlockVY += 900 * dt;
      this._missBlockX  += this._missBlockVX * dt;
      if (this._missTimer <= 0) this._state = 'gameover';
    }
  }

  _onBlockLanded() {
    const dropX       = this._blockPhys.x;
    const towerCenterX = this._tower.centerX;
    const overhang    = CollisionDetector.computeOverhang(dropX, towerCenterX);

    if (CollisionDetector.isMiss(overhang)) {
      const dx = dropX < towerCenterX ? -120 : 120;
      this._onMiss(dropX, this._blockPhys.y, dx);
      return;
    }

    const result = this._score.addBlock(overhang);
    const tilt   = CollisionDetector.getTiltAngle(dropX, towerCenterX);
    const isRoof = this._mode === 'BUILD' && this._tower.count + 1 >= this._totalFloors;

    this._tower.placeBlock(this._buildingType, dropX, tilt, overhang, isRoof);
    this._crane.onBlockPlaced(result.rating === 'PERFECT');

    if (result.rating === 'PERFECT')     this.audio.landPerfect();
    else if (result.rating === 'GREAT')  this.audio.landGood();
    else if (result.rating === 'GOOD')   this.audio.landGood();
    else                                  this.audio.landOk();

    const toastY = this._tower.topScreenY(this._scrollY) - 40;
    this._toasts.addRating(result.rating, CANVAS_WIDTH / 2, Math.max(80, toastY));
    if (result.comboCount >= 3) {
      this.audio.combo();
      this._toasts.addCombo(result.comboCount, CANVAS_WIDTH / 2, Math.max(50, toastY - 40));
    }

    if (result.rating === 'PERFECT') {
      this._spawnPerfectParticles(dropX, this._tower.topScreenY(this._scrollY));
    }

    for (let i = 0; i < result.newResidents; i++) {
      const wx = this._tower.blocks[this._tower.count - 1].x + (Math.random() - 0.5) * BLOCK_WIDTH * 0.8;
      const wy = this._tower.topScreenY(this._scrollY) + Math.random() * BLOCK_HEIGHT * 0.8;
      this._residents.push(new Resident(wx, wy));
      setTimeout(() => this.audio.residentIn(), i * 90);
    }

    this._updateScroll();

    if (this._mode === 'BUILD' && this._tower.count >= this._totalFloors) {
      this._state = 'complete';
    } else {
      this._state = 'idle';
    }
  }

  _onMiss(blockX, blockY, vx = 0) {
    if (this._state === 'miss' || this._state === 'gameover') return;
    this._missBlockX   = blockX;
    this._missBlockY   = blockY;
    this._missBlockVX  = vx;
    this._missBlockVY  = -60;
    this._state        = 'miss';
    this._missTimer    = 1.4;
    this._screenShake  = 0.35;
    this.audio.stopMusic();
    this.audio.landMiss();
  }

  _updateScroll() {
    const towerTopWorld = this._tower.topY;
    this._targetScrollY = Math.max(0, SCROLL_THRESHOLD_Y - towerTopWorld);
  }

  _spawnPerfectParticles(cx, cy) {
    const colors = ['#FFD700','#FFE080','#FFFFFF','#87C0F0','#FF8080'];
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const speed = 90 + Math.random() * 110;
      const lifeT = 0.5 + Math.random() * 0.5;
      this._particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: lifeT, maxLife: lifeT,
        color: colors[i % colors.length],
        size: 2 + Math.random() * 3,
      });
    }
  }

  _updateParticles(dt) {
    for (const p of this._particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 350 * dt;
      p.vx *= Math.pow(0.96, dt * 60);
      p.life -= dt;
    }
    this._particles = this._particles.filter(p => p.life > 0);
  }

  _goToGameOver() {
    if (this._mode === 'QUICK') this._score.saveQuickHighScore();
    this._cleanupAndGo(SCENES.GAME_OVER, {
      score: this._score.score,
      blocksPlaced: this._score.blocksPlaced,
      mode: this._mode,
    });
  }

  _finishBuilding() {
    const pop = this._score.getBuildingPopulation(this._buildingType);
    this._cleanupAndGo(SCENES.BUILD_CITY, {
      buildingComplete: true,
      buildingType: this._buildingType,
      population: pop,
    });
  }

  _cleanupAndGo(scene, data = {}) {
    this.sceneManager.switchTo(scene, data);
  }

  render(ctx) {
    ctx.save();
    if (this._screenShake > 0) {
      const amt = this._screenShake * 5;
      ctx.translate((Math.random() - 0.5) * amt, (Math.random() - 0.5) * amt);
    }

    this._bgRenderer.render(ctx, this._scrollY);
    this._towerRenderer.renderPlatform(ctx, this._scrollY);
    this._towerRenderer.renderTower(ctx, this._tower, this._scrollY);

    if (this._state === 'dropping') {
      this._towerRenderer._renderBlockRaw(
        ctx, this._blockPhys.x, this._blockPhys.y,
        BLOCK_WIDTH, BLOCK_HEIGHT, this._buildingType, 0, false
      );
    }

    if (this._state === 'miss') {
      ctx.save();
      ctx.translate(Math.round(this._missBlockX), Math.round(this._missBlockY));
      ctx.rotate(this._missTimer * 2.5);
      this._towerRenderer._renderBlockRaw(ctx, 0, 0, BLOCK_WIDTH, BLOCK_HEIGHT, this._buildingType, 0, false);
      ctx.restore();
      const missAlpha = 1 - Math.min(1, this._missTimer / 1.4);
      ctx.fillStyle = `rgba(255,20,20,${missAlpha * 0.35})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    this._renderCraneCtx(ctx, this._state === 'idle');

    for (const r of this._residents) r.render(ctx);
    this._renderParticles(ctx);
    this._toasts.render(ctx);

    if (this._mode === 'QUICK') {
      this._uiRenderer.renderQuickHUD(ctx,
        this._score.score, this._score.blocksPlaced,
        this._score.comboCount, this.audio.enabled
      );
      if (this._showTapPrompt) this._renderTapPrompt(ctx);
    } else {
      this._uiRenderer.renderBuildHUD(ctx,
        this._buildingType, this._tower.count, this._totalFloors,
        this._score.comboCount
      );
    }

    if (this._state === 'gameover')  this._renderGameOverPrompt(ctx);
    if (this._state === 'complete')  this._renderCompletePrompt(ctx);

    ctx.restore();
  }

  _renderTapPrompt(ctx) {
    const alpha = 0.5 + 0.5 * Math.sin(Date.now() / 300);
    ctx.save();
    ctx.globalAlpha = alpha;
    Renderer.roundRect(ctx, CANVAS_WIDTH / 2 - 66, CANVAS_HEIGHT - 42, 132, 26, 6,
      'rgba(0,0,0,0.5)', '#4A90D9', 1);
    this._fontMd.drawText(ctx, 'TAP TO DROP', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 37, '#87C0FF', 'center');
    ctx.restore();
  }

  _renderCraneCtx(ctx, showBlock) {
    const px = CRANE_PIVOT_X, py = CRANE_PIVOT_Y;
    const { tipX, tipY } = this._crane;

    ctx.strokeStyle = '#909090'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, py); ctx.stroke();
    ctx.strokeStyle = '#707070'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(px - 22, 0); ctx.lineTo(px + 22, 0); ctx.stroke();

    ctx.strokeStyle = '#B0B0B0'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tipX, tipY); ctx.stroke();
    ctx.strokeStyle = '#606060'; ctx.lineWidth = 1; ctx.stroke();

    const bx = this._crane.blockCenterX;
    const by = this._crane.blockCenterY;
    ctx.strokeStyle = '#C89838'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(bx, by); ctx.stroke();

    ctx.fillStyle = '#909090';
    ctx.beginPath(); ctx.arc(tipX, tipY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#606060'; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#606060'; ctx.lineWidth = 2; ctx.stroke();

    if (showBlock) {
      const tiltDeg = this._crane.blockAngle * 0.12 * 180 / Math.PI;
      
      this._towerRenderer._renderBlockRaw(ctx, bx, by - BLOCK_HEIGHT / 2, BLOCK_WIDTH, BLOCK_HEIGHT, this._buildingType, tiltDeg, false);
    } else {
      
      ctx.strokeStyle = '#909090'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, by - 5);
      ctx.arc(bx, by, 5, -Math.PI / 2, Math.PI);
      ctx.stroke();
    }
  }

  _renderParticles(ctx) {
    for (const p of this._particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      const s = Math.max(1, p.size);
      ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
    }
    ctx.globalAlpha = 1;
  }

  _renderGameOverPrompt(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this._fontLg.drawTextShadow(ctx, 'GAME OVER', CANVAS_WIDTH / 2, 190, '#FF4040', 'center');
    this._fontMd.drawText(ctx, `SCORE: ${this._score.score}`, CANVAS_WIDTH / 2, 250, '#FFD700', 'center');
    this._fontMd.drawText(ctx, `BLOCKS: ${this._score.blocksPlaced}`, CANVAS_WIDTH / 2, 275, '#CCCCCC', 'center');
    this._fontMd.drawText(ctx, 'TAP TO CONTINUE', CANVAS_WIDTH / 2, 320, '#80A0FF', 'center');
    this._fontSm.drawText(ctx, 'ESC = MAIN MENU', CANVAS_WIDTH / 2, 360, '#404060', 'center');
  }

  _renderCompletePrompt(ctx) {
    ctx.fillStyle = 'rgba(0,0,20,0.82)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const f3 = new NokiaFont(3);
    f3.drawTextShadow(ctx, 'BUILDING', CANVAS_WIDTH / 2, 185, '#FFD700', 'center');
    f3.drawTextShadow(ctx, 'COMPLETE!', CANVAS_WIDTH / 2, 215, '#FFD700', 'center');
    const pop = this._score.getBuildingPopulation(this._buildingType);
    this._fontMd.drawText(ctx, `POPULATION: ${pop}`, CANVAS_WIDTH / 2, 268, '#80FF80', 'center');
    this._fontMd.drawText(ctx, 'TAP TO PLACE', CANVAS_WIDTH / 2, 310, '#80A0FF', 'center');
  }

}
