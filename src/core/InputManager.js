export class InputManager {
  constructor(canvas, eventBus) {
    this.canvas = canvas;
    this.eventBus = eventBus;
    this._bound = {};
    this._enabled = true;
    this._init();
  }

  _init() {
    this._bound.keydown = this._onKeyDown.bind(this);
    this._bound.mousedown = this._onMouseDown.bind(this);
    this._bound.touchstart = this._onTouchStart.bind(this);

    window.addEventListener('keydown', this._bound.keydown);
    this.canvas.addEventListener('mousedown', this._bound.mousedown);
    this.canvas.addEventListener('touchstart', this._bound.touchstart, { passive: false });
  }

  destroy() {
    window.removeEventListener('keydown', this._bound.keydown);
    this.canvas.removeEventListener('mousedown', this._bound.mousedown);
    this.canvas.removeEventListener('touchstart', this._bound.touchstart);
  }

  enable() { this._enabled = true; }
  disable() { this._enabled = false; }

  _onKeyDown(e) {
    if (!this._enabled) return;
    if (e.code === 'Space' || e.code === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      this.eventBus.emit('INPUT_ACTION', { type: 'drop' });
    }
    if (e.code === 'Enter') {
      this.eventBus.emit('INPUT_ACTION', { type: 'confirm' });
    }
    if (e.code === 'Escape') {
      this.eventBus.emit('INPUT_ACTION', { type: 'back' });
    }
    if (e.code === 'KeyM') {
      this.eventBus.emit('INPUT_ACTION', { type: 'mute' });
    }
  }

  _onMouseDown(e) {
    if (!this._enabled) return;
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    this.eventBus.emit('INPUT_ACTION', { type: 'tap', x, y });
  }

  _onTouchStart(e) {
    if (!this._enabled) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    this.eventBus.emit('INPUT_ACTION', { type: 'tap', x, y });
  }

  getLastTap() {
    return this._lastTap;
  }
}
