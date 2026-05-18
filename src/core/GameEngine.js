import { MAX_DELTA } from '../constants.js';

export class GameEngine {
  constructor(canvas, sceneManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sceneManager = sceneManager;
    this._running = false;
    this._lastTime = 0;
    this._rafId = null;
    this._fps = 0;
    this._frameCount = 0;
    this._fpsTimer = 0;
  }

  start() {
    this._running = true;
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._loop.bind(this));
  }

  stop() {
    this._running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }

  _loop(timestamp) {
    if (!this._running) return;

    let dt = (timestamp - this._lastTime) / 1000;
    this._lastTime = timestamp;
    dt = Math.min(dt, MAX_DELTA);

    this._frameCount++;
    this._fpsTimer += dt;
    if (this._fpsTimer >= 1) {
      this._fps = this._frameCount;
      this._frameCount = 0;
      this._fpsTimer -= 1;
    }

    const ctx = this.ctx;
    const scene = this.sceneManager.current;
    if (scene) {
      scene.update(dt);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      scene.render(ctx);
    }

    this._rafId = requestAnimationFrame(this._loop.bind(this));
  }

  get fps() { return this._fps; }
}
