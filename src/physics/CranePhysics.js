import { PHYSICS } from '../constants.js';

export class CranePhysics {
  constructor() {
    this.reset();
  }

  reset() {
    this.time = 0;
    this.speed = PHYSICS.SPEED_START;
    this.maxAngle = PHYSICS.MAX_ANGLE_START * (Math.PI / 180);
    this.angle = 0;
    this.blockAngle = 0;
    this._blocksPlaced = 0;
    this._perfectCooldown = 0;
    this._baseSpeed = PHYSICS.SPEED_START;
    this._lastDirection = 1;
    this._tickCooldown = 0;
  }

  update(dt, eventBus) {
    if (this._perfectCooldown > 0) {
      this._perfectCooldown -= dt;
      if (this._perfectCooldown <= 0) {
        this._perfectCooldown = 0;
        this.speed = this._baseSpeed;
      }
    }

    this.time += dt * this.speed;
    this.angle = this.maxAngle * Math.sin(this.time);

    const lagFactor = Math.min(1, dt * PHYSICS.BLOCK_LAG);
    this.blockAngle += (this.angle - this.blockAngle) * lagFactor;

    const newDirection = Math.cos(this.time) >= 0 ? 1 : -1;
    if (newDirection !== this._lastDirection) {
      this._lastDirection = newDirection;
      if (eventBus) eventBus.emit('CRANE_TICK', {});
    }
  }

  onBlockPlaced(isPerfect) {
    this._blocksPlaced++;

    const maxDeg = PHYSICS.MAX_ANGLE_LIMIT * (Math.PI / 180);
    this.maxAngle = Math.min(maxDeg,
      PHYSICS.MAX_ANGLE_START * (Math.PI / 180) + this._blocksPlaced * PHYSICS.ANGLE_INCREMENT * (Math.PI / 180)
    );

    this._baseSpeed = Math.min(PHYSICS.SPEED_LIMIT,
      PHYSICS.SPEED_START + this._blocksPlaced * PHYSICS.SPEED_INCREMENT
    );

    if (isPerfect) {
      this.speed = Math.max(PHYSICS.SPEED_START * 0.6, this._baseSpeed - PHYSICS.PERFECT_SPEED_REDUCTION);
      this._perfectCooldown = PHYSICS.PERFECT_SPEED_DURATION;
    } else {
      this.speed = this._baseSpeed;
      this._perfectCooldown = 0;
    }
  }

  getTip(pivotX, pivotY, armLength) {
    return {
      x: pivotX + Math.sin(this.angle) * armLength,
      y: pivotY + Math.cos(this.angle) * armLength,
    };
  }

  getBlockCenter(tipX, tipY, ropeLength) {
    return {
      x: tipX + Math.sin(this.blockAngle) * ropeLength,
      y: tipY + Math.cos(this.blockAngle) * ropeLength,
    };
  }
}
