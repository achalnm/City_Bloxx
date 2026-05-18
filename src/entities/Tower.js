import { BLOCK_HEIGHT, PLATFORM_Y, CANVAS_WIDTH } from '../constants.js';
import { Block } from './Block.js';

export class Tower {
  constructor() {
    this.blocks = [];
    this.centerX = CANVAS_WIDTH / 2;  
    this.baseY = PLATFORM_Y;          
  }

  reset() {
    this.blocks = [];
    this.centerX = CANVAS_WIDTH / 2;
  }

  get count() { return this.blocks.length; }

  get topY() {
    return this.baseY - this.blocks.length * BLOCK_HEIGHT;
  }

  topScreenY(scrollY) {
    return this.topY + scrollY;
  }

  addBlock(block) {
    block.y = this.topY - BLOCK_HEIGHT;   
    this.blocks.push(block);
    this.centerX = block.x;               
  }

  placeBlock(type, dropX, tilt, overhang, isRoof = false) {
    const block = new Block(type, dropX, this.topY - BLOCK_HEIGHT);
    block.isRoof = isRoof;
    block.tilt = tilt;
    block.overhang = overhang;
    block.placed = true;
    block.flashTimer = 0.25;
    this.blocks.push(block);
    this.centerX = dropX;
    return block;
  }

  update(dt) {
    for (const b of this.blocks) b.update(dt);
  }
}
