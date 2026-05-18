import { SCENES } from '../constants.js';

export class QuickGameScene {
  constructor(eventBus, audio) {
    this.eventBus = eventBus;
    this.audio = audio;
    this.sceneManager = null;
  }

  onEnter(data = {}) {
    
    this.sceneManager.switchTo(SCENES.STACKING, { mode: 'QUICK' });
  }

  onExit() {}
  update() {}
  render() {}
}
