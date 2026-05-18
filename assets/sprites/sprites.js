
import { BUILDING_CONFIG } from '../../src/constants.js';

export function drawBlockSprite(ctx, x, y, w, h, type, tilt = 0) {
  const cfg = BUILDING_CONFIG[type] || BUILDING_CONFIG.BLUE;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(tilt * Math.PI / 180);

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w, h);

  ctx.fillStyle = cfg.colorBody;
  ctx.fillRect(-w / 2, -h / 2, w, h);

  ctx.fillStyle = cfg.colorHighlight;
  ctx.fillRect(-w / 2 + 1, -h / 2 + 1, w - 2, Math.floor(h * 0.35));

  const wCount = Math.max(2, Math.floor(w / 20));
  const wSize = 6;
  const wSpacing = (w - wCount * wSize) / (wCount + 1);
  ctx.fillStyle = cfg.colorWindow || '#FFE080';
  for (let i = 0; i < wCount; i++) {
    const wx = -w / 2 + wSpacing + i * (wSize + wSpacing);
    ctx.fillRect(wx, 2, wSize, wSize);
  }

  ctx.strokeStyle = cfg.colorOutline;
  ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2, -h / 2, w, h);

  ctx.restore();
}

export function drawPlatformSprite(ctx, cx, y, w, h) {
  
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(cx - w / 2 + 4, y + 4, w, h);

  ctx.fillStyle = '#9B7920';
  ctx.fillRect(cx - w / 2, y, w, h);

  ctx.fillStyle = '#C4A050';
  ctx.fillRect(cx - w / 2 + 1, y + 1, w - 2, 5);

  ctx.strokeStyle = '#6A5010';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - w / 2, y, w, h);

  ctx.fillStyle = '#7A6010';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(cx - w / 2 + 10 + i * 24, y + 7, 16, 4);
  }
}

export function drawResidentSprite(ctx, x, y, alpha = 1) {
  ctx.globalAlpha = alpha;
  
  ctx.fillStyle = '#FFD0A0';  
  ctx.fillRect(x + 3, y, 3, 3); 
  ctx.fillStyle = '#4040C0'; 
  ctx.fillRect(x + 2, y + 3, 4, 4); 
  ctx.fillStyle = '#202080'; 
  ctx.fillRect(x + 2, y + 7, 2, 2);
  ctx.fillRect(x + 4, y + 7, 2, 2);
  ctx.globalAlpha = 1;
}

export function drawStarBurst(ctx, cx, cy, radius, points, color) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.4;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    if (i === 0) ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    else ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawCraneSprite(ctx, pivotX, pivotY, angle, blockAngle, ropeLen, armLen) {
  const ax = pivotX + Math.sin(angle) * armLen;
  const ay = pivotY + Math.cos(angle) * armLen;

  ctx.strokeStyle = '#B0B0B0';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(ax, ay);
  ctx.stroke();

  ctx.strokeStyle = '#606060';
  ctx.lineWidth = 1;
  ctx.stroke();

  const bx = ax + Math.sin(blockAngle) * ropeLen;
  const by = ay + Math.cos(blockAngle) * ropeLen;
  ctx.strokeStyle = '#C89838';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();

  ctx.fillStyle = '#909090';
  ctx.beginPath();
  ctx.arc(ax, ay, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#606060';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  return { bx, by };
}

export function drawCraneBase(ctx, pivotX, pivotY) {
  
  ctx.strokeStyle = '#909090';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(pivotX, 0);
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#707070';
  ctx.beginPath();
  ctx.moveTo(pivotX - 20, 0);
  ctx.lineTo(pivotX + 20, 0);
  ctx.stroke();

  ctx.fillStyle = '#B0B0B0';
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#606060';
  ctx.lineWidth = 2;
  ctx.stroke();
}
