export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    if (!this._listeners.has(event)) return;
    const arr = this._listeners.get(event);
    const i = arr.indexOf(fn);
    if (i !== -1) arr.splice(i, 1);
  }

  emit(event, data) {
    if (!this._listeners.has(event)) return;
    for (const fn of [...this._listeners.get(event)]) fn(data);
  }

  clear() {
    this._listeners.clear();
  }
}
