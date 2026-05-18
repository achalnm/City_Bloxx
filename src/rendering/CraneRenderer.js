import { CRANE_PIVOT_X, CRANE_PIVOT_Y, BLOCK_WIDTH, BLOCK_HEIGHT } from '../constants.js';
import { drawCraneSprite, drawCraneBase } from '../../assets/sprites/sprites.js';

export class CraneRenderer {
  render(ctx, crane, fallingBlock = null) {
    drawCraneBase(ctx, CRANE_PIVOT_X, CRANE_PIVOT_Y);

    const { bx, by } = drawCraneSprite(
      ctx,
      CRANE_PIVOT_X, CRANE_PIVOT_Y,
      crane.angle, crane.blockAngle,
      crane.ropeLength, crane.armLength
    );

    if (!fallingBlock) {
      this._renderDanglingBlock(ctx, bx, by, crane.blockAngle);
    }
  }

  _renderDanglingBlock(ctx, cx, cy, angle) {
    const w = BLOCK_WIDTH;
    const h = BLOCK_HEIGHT;
    ctx.save();
    ctx.translate(Math.round(cx), Math.round(cy));
    ctx.rotate(angle * 0.15); 

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w, h);

    ctx.fillStyle = '#4A90D9';
    ctx.fillRect(-w / 2, -h / 2, w, h);

    ctx.fillStyle = '#87C0F0';
    ctx.fillRect(-w / 2 + 1, -h / 2 + 1, w - 2, Math.ceil(h * 0.4));

    ctx.fillStyle = '#FFE080';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-w / 2 + 10 + i * 22, -3, 7, 8);
    }

    ctx.strokeStyle = '#2C5F8A';
    ctx.lineWidth = 2;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    ctx.restore();
  }

  renderDanglingTypedBlock(ctx, cx, cy, angle, type, towerRenderer) {
    ctx.save();
    ctx.translate(Math.round(cx), Math.round(cy));
    ctx.rotate(angle * 0.12);
    ctx.translate(-Math.round(cx), -Math.round(cy));
    towerRenderer._renderBlockRaw(ctx, cx, cy, BLOCK_WIDTH, BLOCK_HEIGHT, type, 0, false);
    ctx.restore();
  }

  renderFallingBlock(ctx, x, y, type, towerRenderer) {
    towerRenderer._renderBlockRaw(ctx, x, y + BLOCK_HEIGHT / 2, BLOCK_WIDTH, BLOCK_HEIGHT, type, 0, false);
  }
}
