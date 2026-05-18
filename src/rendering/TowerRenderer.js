import { BLOCK_WIDTH, BLOCK_HEIGHT, PLATFORM_Y, PLATFORM_WIDTH, PLATFORM_HEIGHT, CANVAS_WIDTH } from '../constants.js';
import { drawPlatformSprite } from '../../assets/sprites/sprites.js';

export class TowerRenderer {
  renderPlatform(ctx, scrollY) {
    const screenY = PLATFORM_Y + scrollY;
    drawPlatformSprite(ctx, CANVAS_WIDTH / 2, screenY, PLATFORM_WIDTH, PLATFORM_HEIGHT);
  }

  renderTower(ctx, tower, scrollY) {
    const blocks = tower.blocks;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const screenY = block.y + scrollY;
      this._renderBlock(ctx, block, block.x, screenY, block.isFlashing());
    }
  }

  renderFallingBlock(ctx, block, blockX, blockY, blockType) {
    this._renderBlockRaw(ctx, blockX, blockY, BLOCK_WIDTH, BLOCK_HEIGHT, blockType, 0, false);
  }

  _renderBlock(ctx, block, cx, screenY, flash) {
    this._renderBlockRaw(ctx, cx, screenY, block.width, block.height, block.type, block.tilt, flash);
  }

  _renderBlockRaw(ctx, cx, screenY, w, h, type, tilt, flash) {
    ctx.save();
    ctx.translate(Math.round(cx), Math.round(screenY + h / 2));
    ctx.rotate(tilt * Math.PI / 180);

    const cfg = this._getColors(type);

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w, h);

    ctx.fillStyle = flash ? '#FFFFFF' : cfg.body;
    ctx.fillRect(-w / 2, -h / 2, w, h);

    if (!flash) {
      
      ctx.fillStyle = cfg.highlight;
      ctx.fillRect(-w / 2 + 1, -h / 2 + 1, w - 2, Math.ceil(h * 0.4));

      ctx.fillStyle = cfg.shadow;
      ctx.fillRect(-w / 2 + 1, h / 2 - 5, w - 2, 4);

      const winCount = Math.max(2, Math.floor(w / 22));
      const winW = 7;
      const winH = Math.max(6, Math.floor(h * 0.45));
      const spacing = (w - winCount * winW) / (winCount + 1);
      ctx.fillStyle = cfg.window;
      for (let i = 0; i < winCount; i++) {
        const wx = -w / 2 + spacing + i * (winW + spacing);
        const wy = -winH / 2 + 2;
        ctx.fillRect(Math.round(wx), Math.round(wy), winW, winH);
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(Math.round(wx), Math.round(wy), winW, 2);
        ctx.fillStyle = cfg.window;
      }
    }

    ctx.strokeStyle = cfg.outline;
    ctx.lineWidth = 2;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);

    ctx.restore();
  }

  _getColors(type) {
    const map = {
      BLUE:   { body:'#4A90D9', outline:'#2C5F8A', highlight:'#87C0F0', shadow:'#1A3A5A', window:'#FFE080' },
      RED:    { body:'#E05252', outline:'#8B2020', highlight:'#F07070', shadow:'#4A1010', window:'#80FFFF' },
      GREEN:  { body:'#52B952', outline:'#2A6B2A', highlight:'#7FD97F', shadow:'#1A3A1A', window:'#FFFFFF' },
      YELLOW: { body:'#F0C040', outline:'#8B6A00', highlight:'#FAE080', shadow:'#4A3A00', window:'#FFB0FF' },
    };
    return map[type] || map.BLUE;
  }

  renderRoofBlock(ctx, cx, screenY, type, roofType) {
    const w = BLOCK_WIDTH;
    const h = BLOCK_HEIGHT;
    const cfg = this._getColors(type);

    ctx.save();
    ctx.translate(Math.round(cx), Math.round(screenY));

    switch (roofType) {
      case 'flat':
        ctx.fillStyle = cfg.body;
        ctx.fillRect(-w / 2, 0, w, h * 0.6);
        ctx.fillStyle = cfg.highlight;
        ctx.fillRect(-w / 2 + 2, 2, w - 4, 6);
        ctx.strokeStyle = cfg.outline;
        ctx.lineWidth = 2;
        ctx.strokeRect(-w / 2, 0, w, h * 0.6);
        break;

      case 'angled':
        ctx.fillStyle = cfg.body;
        ctx.beginPath();
        ctx.moveTo(-w / 2, h * 0.6);
        ctx.lineTo(0, 0);
        ctx.lineTo(w / 2, h * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = cfg.outline;
        ctx.lineWidth = 2;
        ctx.stroke();
        break;

      case 'pointed':
        ctx.fillStyle = cfg.body;
        ctx.beginPath();
        ctx.moveTo(-w / 2, h * 0.7);
        ctx.lineTo(0, -h * 0.2);
        ctx.lineTo(w / 2, h * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = cfg.outline;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = cfg.highlight;
        ctx.beginPath();
        ctx.moveTo(-2, -h * 0.2);
        ctx.lineTo(0, -h * 0.6);
        ctx.lineTo(2, -h * 0.2);
        ctx.closePath();
        ctx.fill();
        break;

      case 'dome':
        
        ctx.fillStyle = cfg.body;
        ctx.beginPath();
        ctx.arc(0, h * 0.4, w * 0.4, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = cfg.outline;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = cfg.highlight;
        ctx.fillRect(-w * 0.25, h * 0.3, w * 0.5, h * 0.3);
        ctx.strokeStyle = cfg.outline;
        ctx.lineWidth = 1;
        ctx.strokeRect(-w * 0.25, h * 0.3, w * 0.5, h * 0.3);
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, h * 0.4 - w * 0.4, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    ctx.restore();
  }
}
