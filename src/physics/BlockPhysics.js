import { PHYSICS } from '../constants.js';

export class BlockPhysics {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.falling = false;
    this.landed = false;
  }

  drop(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.vy = 0;
    this.falling = true;
    this.landed = false;
  }

  update(dt) {
    if (!this.falling || this.landed) return;
    this.vy += PHYSICS.GRAVITY * dt;
    this.y += this.vy * dt;
  }

  checkLanding(landingY, blockHeight) {
    if (!this.falling || this.landed) return false;
    if (this.y + blockHeight >= landingY) {
      this.y = landingY - blockHeight;
      this.vy = 0;
      this.falling = false;
      this.landed = true;
      return true;
    }
    return false;
  }
}
