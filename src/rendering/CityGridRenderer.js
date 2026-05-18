import { GRID_SIZE, GRID_CELL_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, BUILDING_CONFIG, COLORS } from '../constants.js';
import { NokiaFont } from '../../assets/fonts/nokiaFont.js';
import { UIRenderer } from './UIRenderer.js';
import { Renderer } from './Renderer.js';

const font = new NokiaFont(2);
const fontSm = new NokiaFont(1);

const GRID_ORIGIN_X = (CANVAS_WIDTH - GRID_SIZE * GRID_CELL_SIZE) / 2;
const GRID_ORIGIN_Y = 240;

const TYPE_COLORS = {
  BLUE:   { bg: '#1A3A6A', border: '#4A90D9', fill: '#4A90D9' },
  RED:    { bg: '#5A1A1A', border: '#E05252', fill: '#E05252' },
  GREEN:  { bg: '#1A4A1A', border: '#52B952', fill: '#52B952' },
  YELLOW: { bg: '#4A3A0A', border: '#F0C040', fill: '#F0C040' },
};

export class CityGridRenderer {
  render(ctx, buildings, selectedCell, validCells, totalPop, time) {
    this._renderBackground(ctx);
    this._renderCityInfo(ctx, totalPop);
    this._renderGrid(ctx, buildings, selectedCell, validCells, time);
    this._renderLegend(ctx);
  }

  _renderBackground(ctx) {
    ctx.fillStyle = '#080818';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = 'rgba(60,60,120,0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }
  }

  _renderCityInfo(ctx, totalPop) {
    const level = UIRenderer.getCityLevel(totalPop);

    Renderer.roundRect(ctx, 8, 8, CANVAS_WIDTH - 16, 80, 6, COLORS.UI_PANEL, COLORS.UI_BORDER, 1);

    font.drawText(ctx, 'BUILD CITY', CANVAS_WIDTH / 2, 14, COLORS.UI_ACCENT, 'center');

    const levelColors = {
      'Village':     '#80A080',
      'Town':        '#80B0FF',
      'City':        '#FFD080',
      'Big City':    '#FF8040',
      'Metropolis':  '#FF4080',
      'Megalopolis': '#C040FF',
      'World City':  '#FFD700',
    };
    const col = levelColors[level.name] || '#FFFFFF';
    const lgFont = new NokiaFont(3);
    lgFont.drawTextShadow(ctx, level.name.toUpperCase(), CANVAS_WIDTH / 2, 30, col, 'center');

    fontSm.drawText(ctx, `POPULATION: ${totalPop.toLocaleString()}`, CANVAS_WIDTH / 2, 65, '#A0C0FF', 'center');
  }

  _renderGrid(ctx, buildings, selectedCell, validCells, time) {
    const gox = GRID_ORIGIN_X;
    const goy = GRID_ORIGIN_Y;
    const cs = GRID_CELL_SIZE;

    Renderer.roundRect(ctx, gox - 6, goy - 6, GRID_SIZE * cs + 12, GRID_SIZE * cs + 12,
      4, '#0A0A20', '#2A2A60', 1);

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cx = gox + col * cs;
        const cy = goy + row * cs;
        const building = buildings.find(b => b.gridX === col && b.gridY === row);
        const isSelected = selectedCell && selectedCell.x === col && selectedCell.y === row;
        const isValid = validCells && validCells.some(v => v.x === col && v.y === row);

        this._renderCell(ctx, cx, cy, cs, building, isSelected, isValid, time);
      }
    }
  }

  _renderCell(ctx, x, y, size, building, isSelected, isValid, time) {
    const inner = size - 2;

    if (building) {
      const cols = TYPE_COLORS[building.type] || TYPE_COLORS.BLUE;
      ctx.fillStyle = cols.bg;
      ctx.fillRect(x + 1, y + 1, inner, inner);
      this._renderMiniBuilding(ctx, x + size / 2, y + size / 2, building.type, size * 0.7, time);
    } else {
      ctx.fillStyle = '#12122A';
      ctx.fillRect(x + 1, y + 1, inner, inner);

      if (isValid) {
        
        const pulse = 0.5 + 0.5 * Math.sin(time * 4);
        ctx.fillStyle = `rgba(100,200,100,${0.1 + pulse * 0.15})`;
        ctx.fillRect(x + 1, y + 1, inner, inner);
        ctx.strokeStyle = `rgba(100,220,100,${0.6 + pulse * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 1, y + 1, inner, inner);
      }
    }

    if (isSelected) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 5);
      ctx.strokeStyle = `rgba(255,220,60,${0.8 + pulse * 0.2})`;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x + 1, y + 1, inner, inner);
    } else {
      
      ctx.strokeStyle = '#2A2A50';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, size, size);
    }
  }

  _renderMiniBuilding(ctx, cx, cy, type, size, time) {
    const cols = TYPE_COLORS[type] || TYPE_COLORS.BLUE;
    const cfg = BUILDING_CONFIG[type];
    const h = Math.min(size * 0.8, size);
    const w = size * 0.55;

    ctx.fillStyle = cols.fill;
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);

    ctx.fillStyle = 'rgba(255,220,80,0.8)';
    const floors = Math.min(4, cfg.floors);
    for (let f = 0; f < floors; f++) {
      const wy = cy - h / 2 + 3 + f * (h / (floors + 1));
      for (let wi = 0; wi < 2; wi++) {
        const wx = cx - w / 4 + wi * (w / 2.5);
        const blink = Math.sin(time * 2 + f + wi * 1.3) > 0;
        ctx.fillStyle = blink ? 'rgba(255,220,80,0.9)' : 'rgba(80,80,160,0.5)';
        ctx.fillRect(wx, wy, 3, 3);
      }
    }

    ctx.fillStyle = cols.border;
    ctx.fillRect(cx - w / 2, cy - h / 2 - 3, w, 4);

    ctx.strokeStyle = cols.border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  }

  _renderLegend(ctx) {
    const types = ['BLUE', 'RED', 'GREEN', 'YELLOW'];
    const labels = ['RESIDENTIAL', 'COMMERCIAL', 'OFFICE', 'LUXURY'];
    const y0 = GRID_ORIGIN_Y + GRID_SIZE * GRID_CELL_SIZE + 16;

    Renderer.roundRect(ctx, 8, y0 - 4, CANVAS_WIDTH - 16, 60, 4, COLORS.UI_PANEL, COLORS.UI_BORDER, 1);

    for (let i = 0; i < 4; i++) {
      const x = 20 + i * 82;
      const cols = TYPE_COLORS[types[i]];
      ctx.fillStyle = cols.fill;
      ctx.fillRect(x, y0 + 4, 10, 10);
      ctx.strokeStyle = cols.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y0 + 4, 10, 10);
      fontSm.drawText(ctx, labels[i], x + 13, y0 + 5, cols.fill);
    }

    fontSm.drawText(ctx, 'TAP CELL TO SELECT  BUILD TO CONSTRUCT', CANVAS_WIDTH / 2, y0 + 24, '#606080', 'center');
  }
}
