import { SCENES } from '../constants.js';

export class ModeSelectScene {
  constructor() { this.sceneManager = null; }
  onEnter() { this.sceneManager.switchTo(SCENES.MAIN_MENU); }
  onExit() {}
  update() {}
  render() {}
}
