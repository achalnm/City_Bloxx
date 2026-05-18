import { BLOCK_WIDTH, PLACEMENT } from '../constants.js';

export class CollisionDetector {
  
  static computeOverhang(blockCenterX, towerCenterX) {
    const offset = Math.abs(blockCenterX - towerCenterX);
    return offset / BLOCK_WIDTH;
  }

  static getRating(overhangFraction) {
    if (overhangFraction <= PLACEMENT.PERFECT_MAX) return 'PERFECT';
    if (overhangFraction <= PLACEMENT.GOOD_MAX)    return 'GREAT';
    if (overhangFraction <= PLACEMENT.OK_MAX)      return 'GOOD';
    if (overhangFraction <= PLACEMENT.POOR_MAX)    return 'OK';
    return 'MISS';
  }

  static isMiss(overhangFraction) {
    return overhangFraction > PLACEMENT.POOR_MAX;
  }

  static getTiltAngle(blockCenterX, towerCenterX) {
    const offset = blockCenterX - towerCenterX;
    return (offset / BLOCK_WIDTH) * 8;
  }
}
