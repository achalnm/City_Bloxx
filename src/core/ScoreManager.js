import { SCORING, PLACEMENT, STORAGE, BUILDING_CONFIG } from '../constants.js';

export class ScoreManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.score = 0;
    this.blocksPlaced = 0;
    this.comboCount = 0;
    this.lastRating = null;
    this.residents = 0;
    this._overhangHistory = [];
  }

  getRating(overhangFraction) {
    if (overhangFraction <= PLACEMENT.PERFECT_MAX) return 'PERFECT';
    if (overhangFraction <= PLACEMENT.GOOD_MAX)    return 'GREAT';
    if (overhangFraction <= PLACEMENT.OK_MAX)      return 'GOOD';
    if (overhangFraction <= PLACEMENT.POOR_MAX)    return 'OK';
    return 'POOR';
  }

  addBlock(overhangFraction) {
    const rating = this.getRating(overhangFraction);
    const isGoodEnough = overhangFraction <= PLACEMENT.OK_MAX;

    if (isGoodEnough) {
      this.comboCount++;
    } else {
      this.comboCount = 0;
    }

    const comboMult = 1 + Math.max(0, this.comboCount - 1) * SCORING.COMBO_MULT_INCREMENT;
    const precisionBonus = (1 - Math.min(1, overhangFraction / PLACEMENT.POOR_MAX)) * SCORING.MAX_PRECISION_BONUS;
    const blockScore = Math.round((SCORING.BASE + precisionBonus) * comboMult);

    this.score += blockScore;
    this.blocksPlaced++;
    this.lastRating = rating;

    const newResidents = Math.floor((1 - Math.min(1, overhangFraction / PLACEMENT.POOR_MAX)) * 4);
    this.residents += newResidents;

    this._overhangHistory.push(overhangFraction);

    return { rating, blockScore, comboMult, comboCount: this.comboCount, newResidents };
  }

  getBuildingPopulation(buildingType) {
    if (this._overhangHistory.length === 0) return 0;
    const cfg = BUILDING_CONFIG[buildingType];
    if (!cfg) return 0;
    const avgOverhang = this._overhangHistory.reduce((a, b) => a + b, 0) / this._overhangHistory.length;
    const factor = 2 - Math.min(1, avgOverhang / PLACEMENT.POOR_MAX);
    return Math.round(cfg.basePop * factor);
  }

  saveQuickHighScore() {
    const prev = this.getQuickHighScore();
    if (this.score > prev) {
      localStorage.setItem(STORAGE.QUICK_HS, String(this.score));
      return true;
    }
    return false;
  }

  getQuickHighScore() {
    return parseInt(localStorage.getItem(STORAGE.QUICK_HS) || '0', 10);
  }

  getBuildHighScore() {
    return parseInt(localStorage.getItem(STORAGE.BUILD_HS) || '0', 10);
  }

  updateBuildHighScore(pop) {
    const prev = this.getBuildHighScore();
    if (pop > prev) {
      localStorage.setItem(STORAGE.BUILD_HS, String(pop));
      return true;
    }
    return false;
  }

  static getHighScoreList() {
    return {
      quick: parseInt(localStorage.getItem(STORAGE.QUICK_HS) || '0', 10),
      build: parseInt(localStorage.getItem(STORAGE.BUILD_HS) || '0', 10),
    };
  }
}
