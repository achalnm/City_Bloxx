import { BUILDING_CONFIG } from '../constants.js';

export class Building {
  constructor(type, gridX, gridY, population) {
    this.type = type;
    this.gridX = gridX;
    this.gridY = gridY;
    this.population = population;
    this.cfg = BUILDING_CONFIG[type];
    this.animTimer = 0;
    this.animPhase = 'drop'; 
    this.animY = -60;        
    this.targetY = 0;
    this.lights = [];
    this._initLights();
  }

  _initLights() {
    const floors = this.cfg.floors;
    for (let f = 0; f < floors; f++) {
      const numW = Math.floor(2 + Math.random() * 2);
      for (let w = 0; w < numW; w++) {
        this.lights.push({
          floor: f,
          col: w,
          numW,
          on: Math.random() > 0.3,
          blinkTimer: Math.random() * 4,
          blinkRate: 2 + Math.random() * 4,
        });
      }
    }
  }

  update(dt) {
    this.animTimer += dt;
    if (this.animPhase === 'drop') {
      this.animY += (this.targetY - this.animY) * Math.min(1, dt * 6);
      if (Math.abs(this.animY - this.targetY) < 0.5) {
        this.animY = this.targetY;
        this.animPhase = 'idle';
      }
    }
    for (const l of this.lights) {
      l.blinkTimer -= dt;
      if (l.blinkTimer <= 0) {
        l.on = !l.on;
        l.blinkTimer = l.blinkRate;
      }
    }
  }

  toJSON() {
    return { type: this.type, gridX: this.gridX, gridY: this.gridY, population: this.population };
  }

  static fromJSON(data) {
    return new Building(data.type, data.gridX, data.gridY, data.population);
  }
}
