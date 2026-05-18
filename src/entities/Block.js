import { BLOCK_WIDTH, BLOCK_HEIGHT, BUILDING_CONFIG } from '../constants.js';

export class Block {
  constructor(type = 'BLUE', x = 0, y = 0) {
    this.type = type;
    this.x = x;    
    this.y = y;    
    this.width = BLOCK_WIDTH;
    this.height = BLOCK_HEIGHT;
    this.tilt = 0;       
    this.overhang = 0;   
    this.placed = false;
    this.flashTimer = 0;
    this.isRoof = false;

    const cfg = BUILDING_CONFIG[type] || BUILDING_CONFIG.BLUE;
    this.colorBody      = cfg.colorBody;
    this.colorOutline   = cfg.colorOutline;
    this.colorHighlight = cfg.colorHighlight;
    this.colorShadow    = cfg.colorShadow;
    this.colorWindow    = cfg.colorWindow;
  }

  get left()   { return this.x - this.width / 2; }
  get right()  { return this.x + this.width / 2; }
  get top()    { return this.y; }
  get bottom() { return this.y + this.height; }
  get centerX(){ return this.x; }

  place(centerX, topY, tilt, overhang) {
    this.x = centerX;
    this.y = topY;
    this.tilt = tilt;
    this.overhang = overhang;
    this.placed = true;
    this.flashTimer = 0.25;
  }

  update(dt) {
    if (this.flashTimer > 0) this.flashTimer -= dt;
  }

  isFlashing() { return this.flashTimer > 0; }
}
