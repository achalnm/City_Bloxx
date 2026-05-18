import { NokiaFont } from '../../assets/fonts/nokiaFont.js';
import { Building } from '../entities/Building.js';
import { CityGridRenderer } from '../rendering/CityGridRenderer.js';
import { Button } from '../ui/Button.js';
import { Renderer } from '../rendering/Renderer.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  GRID_SIZE, GRID_CELL_SIZE,
  BUILDING_CONFIG,
  SCENES, STORAGE,
} from '../constants.js';

const GRID_OX = (CANVAS_WIDTH - GRID_SIZE * GRID_CELL_SIZE) / 2;
const GRID_OY = 240;

const font = new NokiaFont(2);
const fontSm = new NokiaFont(1);

export class BuildCityScene {
  constructor(eventBus, audio) {
    this.eventBus = eventBus;
    this.audio = audio;
    this.sceneManager = null;

    this._gridRenderer = new CityGridRenderer();
    this._buildings = [];
    this._selectedCell = null;
    this._pendingCell = null;
    this._time = 0;
    this._unsub = [];
    this._notification = null;
    this._notifTimer = 0;

    this._buildBtn = new Button(
      CANVAS_WIDTH / 2 - 55, CANVAS_HEIGHT - 58, 110, 38, 'BUILD',
      { colorBg:'#1A3A1A', colorBorder:'#52B952', colorText:'#7FD97F',
        onClick: () => this._buildSelected() }
    );
    this._menuBtn = new Button(
      8, CANVAS_HEIGHT - 52, 70, 32, 'MENU',
      { colorBg:'#1A1A2A', colorBorder:'#4A4A8A', colorText:'#8080C0',
        onClick: () => this.sceneManager.switchTo(SCENES.MAIN_MENU) }
    );
    this._clearBtn = new Button(
      CANVAS_WIDTH - 78, CANVAS_HEIGHT - 52, 70, 32, 'CLEAR',
      { colorBg:'#2A1A1A', colorBorder:'#8B2020', colorText:'#E05252',
        onClick: () => this._clearCity() }
    );

    this._typeButtons = [];
    this._selectedType = 'BLUE';
    this._initTypeButtons();
  }

  _initTypeButtons() {
    const types = ['BLUE','RED','GREEN','YELLOW'];
    const colors = {
      BLUE:   { bg:'#1A2A4A', border:'#4A90D9', text:'#87C0F0' },
      RED:    { bg:'#2A1A1A', border:'#E05252', text:'#F07070' },
      GREEN:  { bg:'#1A2A1A', border:'#52B952', text:'#7FD97F' },
      YELLOW: { bg:'#2A2A0A', border:'#F0C040', text:'#FAE080' },
    };
    this._typeButtons = types.map((type, i) => {
      const x = 8 + i * 85;
      const c = colors[type];
      return new Button(x, 100, 80, 28, type, {
        colorBg: c.bg, colorBorder: c.border, colorText: c.text,
        onClick: () => { this._selectedType = type; this.audio.menuBlip(); },
      });
    });
  }

  onEnter(data = {}) {
    this._time = 0;
    this._loadCity();
    this._unsub.push(this.eventBus.on('INPUT_ACTION', (e) => this._handleInput(e)));
    this.audio.startMusic();

    if (data.buildingComplete) {
      this._onBuildingComplete(data);
    }
  }

  onExit() {
    for (const u of this._unsub) u();
    this._unsub = [];
  }

  _handleInput(e) {
    if (e.type === 'tap') {
      this._buildBtn.handleTap(e.x, e.y, this.audio);
      this._menuBtn.handleTap(e.x, e.y, this.audio);
      this._clearBtn.handleTap(e.x, e.y, this.audio);
      for (const btn of this._typeButtons) btn.handleTap(e.x, e.y, this.audio);
      this._handleGridTap(e.x, e.y);
    }
    if (e.type === 'back') this.sceneManager.switchTo(SCENES.MAIN_MENU);
    if (e.type === 'mute') this.audio.toggle();
  }

  _handleGridTap(tx, ty) {
    const col = Math.floor((tx - GRID_OX) / GRID_CELL_SIZE);
    const row = Math.floor((ty - GRID_OY) / GRID_CELL_SIZE);
    if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
      this._selectedCell = { x: col, y: row };
      this.audio.menuBlip();
    }
  }

  _getValidCells(type) {
    const required = BUILDING_CONFIG[type].adjacency;
    const valid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (this._buildings.find(b => b.gridX === col && b.gridY === row)) continue;
        if (required.length === 0) {
          valid.push({ x: col, y: row });
        } else {
          const adj = this._getAdjacentBuildings(col, row);
          const adjTypes = adj.map(b => b.type);
          if (required.every(r => adjTypes.includes(r))) {
            valid.push({ x: col, y: row });
          }
        }
      }
    }
    return valid;
  }

  _getAdjacentBuildings(col, row) {
    const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
    return dirs.flatMap(([dc, dr]) => {
      const nc = col + dc, nr = row + dr;
      if (nc < 0 || nr < 0 || nc >= GRID_SIZE || nr >= GRID_SIZE) return [];
      const b = this._buildings.find(b => b.gridX === nc && b.gridY === nr);
      return b ? [b] : [];
    });
  }

  _isCellValid(col, row, type) {
    return this._getValidCells(type).some(v => v.x === col && v.y === row);
  }

  _buildSelected() {
    if (!this._selectedCell) {
      this._notify('SELECT A CELL FIRST');
      return;
    }
    const { x, y } = this._selectedCell;
    if (this._buildings.find(b => b.gridX === x && b.gridY === y)) {
      this._notify('CELL ALREADY BUILT');
      return;
    }
    if (!this._isCellValid(x, y, this._selectedType)) {
      const req = BUILDING_CONFIG[this._selectedType].adjacency;
      if (req.length > 0) this._notify(`NEEDS ADJ: ${req.join(', ')}`);
      else this._notify('CANNOT BUILD HERE');
      return;
    }
    this._pendingCell = { x, y };
    this.sceneManager.switchTo(SCENES.STACKING, {
      mode: 'BUILD',
      buildingType: this._selectedType,
      gridX: x,
      gridY: y,
    });
  }

  _onBuildingComplete(data) {
    const { buildingType, population } = data;
    const cell = this._pendingCell;
    this._pendingCell = null;
    if (cell && !this._buildings.find(b => b.gridX === cell.x && b.gridY === cell.y)) {
      const b = new Building(buildingType, cell.x, cell.y, population);
      this._buildings.push(b);
      this._saveCity();
      this._notify(`+${population} RESIDENTS`);
      this._updateHighScore();
    }
  }

  _clearCity() {
    this._buildings = [];
    this._selectedCell = null;
    this._saveCity();
    this._notify('CITY CLEARED');
  }

  _notify(text) {
    this._notification = text;
    this._notifTimer = 2;
  }

  _getTotalPopulation() {
    return this._buildings.reduce((sum, b) => sum + b.population, 0);
  }

  _updateHighScore() {
    const pop = this._getTotalPopulation();
    const prev = parseInt(localStorage.getItem(STORAGE.BUILD_HS) || '0', 10);
    if (pop > prev) localStorage.setItem(STORAGE.BUILD_HS, String(pop));
  }

  _saveCity() {
    try {
      localStorage.setItem(STORAGE.CITY_STATE, JSON.stringify(this._buildings.map(b => b.toJSON())));
    } catch (e) {  }
  }

  _loadCity() {
    try {
      const raw = localStorage.getItem(STORAGE.CITY_STATE);
      if (raw) {
        const data = JSON.parse(raw);
        this._buildings = data.map(d => Building.fromJSON(d));
      } else {
        this._buildings = [];
      }
    } catch (e) {
      this._buildings = [];
    }
  }

  update(dt) {
    this._time += dt;
    this._buildBtn.update(dt);
    this._menuBtn.update(dt);
    this._clearBtn.update(dt);
    for (const btn of this._typeButtons) btn.update(dt);
    for (const b of this._buildings) b.update(dt);
    if (this._notifTimer > 0) this._notifTimer -= dt;
  }

  render(ctx) {
    const totalPop = this._getTotalPopulation();
    const validCells = this._getValidCells(this._selectedType);

    this._gridRenderer.render(ctx, this._buildings, this._selectedCell, validCells, totalPop, this._time);

    this._renderTypeSelector(ctx);
    this._renderButtons(ctx);

    if (this._notifTimer > 0) {
      const alpha = Math.min(1, this._notifTimer * 2);
      ctx.save();
      ctx.globalAlpha = alpha;
      Renderer.roundRect(ctx, CANVAS_WIDTH / 2 - 100, 140, 200, 28, 4,
        'rgba(255,50,50,0.2)', '#FF4040', 1);
      font.drawText(ctx, this._notification, CANVAS_WIDTH / 2, 147, '#FF8080', 'center');
      ctx.restore();
    }

    if (this._selectedCell) {
      const { x, y } = this._selectedCell;
      const existing = this._buildings.find(b => b.gridX === x && b.gridY === y);
      const cy = GRID_OY + GRID_SIZE * GRID_CELL_SIZE + 80;
      if (existing) {
        fontSm.drawText(ctx, `CELL (${x},${y}): ${existing.type} - POP ${existing.population}`,
          CANVAS_WIDTH / 2, cy, '#A0C0FF', 'center');
      } else {
        const valid = this._isCellValid(x, y, this._selectedType);
        fontSm.drawText(ctx, `CELL (${x},${y}): ${valid ? 'READY TO BUILD' : 'INVALID LOCATION'}`,
          CANVAS_WIDTH / 2, cy, valid ? '#80FF80' : '#FF6060', 'center');
      }
    }
  }

  _renderTypeSelector(ctx) {
    Renderer.roundRect(ctx, 4, 92, CANVAS_WIDTH - 8, 44, 4, 'rgba(10,10,30,0.8)', '#2A2A5A', 1);
    for (const btn of this._typeButtons) {
      if (btn.label === this._selectedType) {
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        Renderer.roundRect(ctx, btn.x - 2, btn.y - 2, btn.w + 4, btn.h + 4, 6, null, '#FFFFFF', 2);
      }
      btn.render(ctx);
    }
  }

  _renderButtons(ctx) {
    const hasSelected = this._selectedCell &&
      !this._buildings.find(b => b.gridX === this._selectedCell.x && b.gridY === this._selectedCell.y);
    this._buildBtn.disabled = !hasSelected;
    this._buildBtn.render(ctx);
    this._menuBtn.render(ctx);
    this._clearBtn.render(ctx);
  }
}
