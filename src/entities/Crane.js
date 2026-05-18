import { CranePhysics } from '../physics/CranePhysics.js';
import {
  CRANE_PIVOT_X, CRANE_PIVOT_Y,
  CRANE_ARM_LENGTH, ROPE_LENGTH,
  BLOCK_WIDTH, BLOCK_HEIGHT
} from '../constants.js';

export class Crane {
  constructor() {
    this.physics = new CranePhysics();
    this.pivotX = CRANE_PIVOT_X;
    this.pivotY = CRANE_PIVOT_Y;
    this.armLength = CRANE_ARM_LENGTH;
    this.ropeLength = ROPE_LENGTH;

    this.tipX = this.pivotX;
    this.tipY = this.pivotY + this.armLength;
    this.blockCenterX = this.tipX;
    this.blockCenterY = this.tipY + this.ropeLength;
  }

  reset() {
    this.physics.reset();
  }

  update(dt, eventBus) {
    this.physics.update(dt, eventBus);
    const tip = this.physics.getTip(this.pivotX, this.pivotY, this.armLength);
    this.tipX = tip.x;
    this.tipY = tip.y;
    const bc = this.physics.getBlockCenter(this.tipX, this.tipY, this.ropeLength);
    this.blockCenterX = bc.x;
    this.blockCenterY = bc.y;
  }

  onBlockPlaced(isPerfect) {
    this.physics.onBlockPlaced(isPerfect);
  }

  getDropPosition() {
    return {
      x: this.blockCenterX,
      y: this.blockCenterY - BLOCK_HEIGHT / 2,  
    };
  }

  get angle() { return this.physics.angle; }
  get blockAngle() { return this.physics.blockAngle; }
}
