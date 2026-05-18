export class SceneManager {
  constructor() {
    this._scenes = new Map();
    this._current = null;
    this._currentName = null;
  }

  register(name, scene) {
    this._scenes.set(name, scene);
    scene.sceneManager = this;
  }

  get current() { return this._current; }
  get currentName() { return this._currentName; }

  switchTo(name, data = {}) {
    const next = this._scenes.get(name);
    if (!next) { console.error('Scene not found:', name); return; }

    if (this._current && this._current.onExit) this._current.onExit();

    this._currentName = name;
    this._current = next;

    if (this._current.onEnter) this._current.onEnter(data);
  }
}
