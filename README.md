# City Bloxx

A faithful browser recreation of the classic Nokia mobile game *Tower Bloxx* by Digital Chocolate.

## How to Play

**Quick Game**
- A crane swings back and forth across the screen
- Press **Space**, click, or tap to drop a block
- Land the block as close to the centre of the tower as possible
- Precise drops earn "PERFECT!" and "GREAT!" ratings
- Chain 3+ good drops for a combo multiplier (×2, ×3, ×4…)
- The crane speeds up as your tower grows — stay sharp!
- Miss (block falls off) = Game Over

**Build City**
1. Select a building type (Blue/Red/Green/Yellow) from the top bar
2. Tap a valid grid cell (valid cells glow green)
3. Press "BUILD" to launch the stacking mini-game
4. The better you stack, the more residents move in!

**Adjacency Rules**
| Type   | Requires adjacent |
|--------|-------------------|
| BLUE (Residential) | — |
| RED (Commercial)   | BLUE |
| GREEN (Office)     | BLUE + RED |
| YELLOW (Luxury)    | BLUE + RED + GREEN |

**Controls**
| Action | Keyboard | Mouse / Touch |
|--------|----------|---------------|
| Drop block | Space / ↓ | Click / Tap |
| Back | Esc | — |
| Toggle music | M | — |

## Running the Game

No build step required. Serve the `city-bloxx/` folder with any static server:

```bash
# Using Node.js npx
cd city-bloxx
npx serve .

# Using Python
python -m http.server 8080

# Using VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Then open `http://localhost:3000` (or whatever port) in your browser.

## Project Structure

```
city-bloxx/
├── index.html               Entry point
├── src/
│   ├── main.js              App init, wires everything together
│   ├── constants.js         All game constants
│   ├── core/
│   │   ├── GameEngine.js    RAF game loop + delta time
│   │   ├── EventBus.js      Pub/sub events
│   │   ├── AudioManager.js  Procedural Web Audio sounds
│   │   ├── ScoreManager.js  Scoring + localStorage high scores
│   │   └── InputManager.js  Keyboard / mouse / touch
│   ├── physics/
│   │   ├── CranePhysics.js       Pendulum swing math
│   │   ├── BlockPhysics.js       Drop + gravity
│   │   └── CollisionDetector.js  Landing + overhang calculation
│   ├── entities/
│   │   ├── Crane.js         Crane arm entity
│   │   ├── Block.js         Individual block
│   │   ├── Tower.js         Stack of placed blocks
│   │   ├── Resident.js      Animated window resident
│   │   └── Building.js      Completed building in city grid
│   ├── rendering/
│   │   ├── Renderer.js           Base renderer utilities
│   │   ├── BackgroundRenderer.js Scrolling city skyline
│   │   ├── TowerRenderer.js      Block stack rendering
│   │   ├── CraneRenderer.js      Crane arm + rope
│   │   ├── UIRenderer.js         HUD, overlays, toasts
│   │   └── CityGridRenderer.js   Build City 5×5 grid
│   ├── scenes/
│   │   ├── SceneManager.js       Scene transitions
│   │   ├── MainMenuScene.js      Title screen
│   │   ├── StackingScene.js      Core crane mini-game (shared)
│   │   ├── QuickGameScene.js     Quick Game mode
│   │   ├── BuildCityScene.js     Build City mode
│   │   ├── GameOverScene.js      Score + high score
│   │   └── HighScoresScene.js    All-time bests
│   └── ui/
│       ├── Button.js        Canvas button
│       ├── ProgressBar.js   Population bar
│       └── Toast.js         Rating popup (PERFECT!, COMBO!)
└── assets/
    ├── fonts/nokiaFont.js   5×7 bitmap pixel font
    └── sprites/
        ├── sprites.js       Procedural sprite drawers
        └── palette.js       Nokia-era colour palette
```

## Tech

- Vanilla JS (ES6 modules, no framework, no build step)
- HTML5 Canvas 2D
- Web Audio API (procedural sounds only, no audio files)
- localStorage for persistence

## Scoring

| Rating  | Overhang | Points |
|---------|----------|--------|
| PERFECT | 0–5%     | 300 × combo |
| GREAT   | 5–20%    | ~250 × combo |
| GOOD    | 20–40%   | ~200 × combo |
| OK      | 40–60%   | ~100 × combo |
| MISS    | >60%     | Game over! |
