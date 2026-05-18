import { GameEngine }       from './core/GameEngine.js';
import { EventBus }         from './core/EventBus.js';
import { AudioManager }     from './core/AudioManager.js';
import { InputManager }     from './core/InputManager.js';
import { SceneManager }     from './scenes/SceneManager.js';

import { MainMenuScene }    from './scenes/MainMenuScene.js';
import { ModeSelectScene }  from './scenes/ModeSelectScene.js';
import { QuickGameScene }   from './scenes/QuickGameScene.js';
import { BuildCityScene }   from './scenes/BuildCityScene.js';
import { StackingScene }    from './scenes/StackingScene.js';
import { GameOverScene }    from './scenes/GameOverScene.js';
import { HighScoresScene }  from './scenes/HighScoresScene.js';

import { SCENES }           from './constants.js';

function init() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) { console.error('Canvas not found'); return; }

  const eventBus     = new EventBus();
  const audio        = new AudioManager();
  const inputManager = new InputManager(canvas, eventBus);
  const sceneManager = new SceneManager();

  const mainMenu   = new MainMenuScene(eventBus, audio);
  const modeSelect = new ModeSelectScene();
  const quickGame  = new QuickGameScene(eventBus, audio);
  const buildCity  = new BuildCityScene(eventBus, audio);
  const stacking   = new StackingScene(eventBus, audio);
  const gameOver   = new GameOverScene(eventBus, audio);
  const highScores = new HighScoresScene(eventBus, audio);

  sceneManager.register(SCENES.MAIN_MENU,   mainMenu);
  sceneManager.register(SCENES.MODE_SELECT, modeSelect);
  sceneManager.register(SCENES.QUICK_GAME,  quickGame);
  sceneManager.register(SCENES.BUILD_CITY,  buildCity);
  sceneManager.register(SCENES.STACKING,    stacking);
  sceneManager.register(SCENES.GAME_OVER,   gameOver);
  sceneManager.register(SCENES.HIGH_SCORES, highScores);

  sceneManager.switchTo(SCENES.MAIN_MENU);

  const engine = new GameEngine(canvas, sceneManager);
  engine.start();

  const unlock = () => {
    audio.unlock();
    audio.startMusic();
    document.removeEventListener('click', unlock);
    document.removeEventListener('keydown', unlock);
    document.removeEventListener('touchstart', unlock);
  };
  document.addEventListener('click', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });
  document.addEventListener('touchstart', unlock, { once: true, passive: true });

  function handleResize() {
    const container = canvas.parentElement;
    if (!container) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gameAspect = 360 / 640;
    const screenAspect = vw / vh;
    let cssW, cssH;
    if (screenAspect < gameAspect) {
      cssW = vw;
      cssH = vw / gameAspect;
    } else {
      cssH = vh;
      cssW = vh * gameAspect;
    }
    container.style.width  = `${cssW}px`;
    container.style.height = `${cssH}px`;
  }
  window.addEventListener('resize', handleResize);
  handleResize();

  canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  canvas.addEventListener('wheel',     e => e.preventDefault(), { passive: false });

  window._cityBloxx = { engine, sceneManager, eventBus, audio };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
