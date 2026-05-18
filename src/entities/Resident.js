export class Resident {
  constructor(targetX, targetY) {
    this.x = targetX + (Math.random() - 0.5) * 60;
    this.y = targetY - 20;
    this.targetX = targetX;
    this.targetY = targetY;
    this.alpha = 0;
    this.scale = 0.3;
    this.state = 'entering'; 
    this.timer = 0;
    this.idleDuration = 1.5 + Math.random() * 2;
    this.done = false;

    const hues = ['#FFE080', '#80FFFF', '#FF80FF', '#80FF80'];
    this.color = hues[Math.floor(Math.random() * hues.length)];
  }

  update(dt) {
    this.timer += dt;

    if (this.state === 'entering') {
      const t = Math.min(1, this.timer / 0.4);
      this.alpha = t;
      this.scale = 0.3 + 0.7 * t;
      this.x += (this.targetX - this.x) * Math.min(1, dt * 8);
      this.y += (this.targetY - this.y) * Math.min(1, dt * 8);
      if (this.timer >= 0.4) {
        this.state = 'idle';
        this.timer = 0;
        this.x = this.targetX;
        this.y = this.targetY;
      }
    } else if (this.state === 'idle') {
      this.alpha = 1;
      this.scale = 1;
      
      this.y = this.targetY + Math.sin(this.timer * 3) * 1.5;
      if (this.timer >= this.idleDuration) {
        this.state = 'leaving';
        this.timer = 0;
      }
    } else if (this.state === 'leaving') {
      const t = Math.min(1, this.timer / 0.3);
      this.alpha = 1 - t;
      if (this.timer >= 0.3) {
        this.done = true;
      }
    }
  }

  render(ctx) {
    if (this.done) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    
    ctx.fillStyle = '#FFD0A0';
    ctx.fillRect(-2, -10, 5, 4);
    
    ctx.fillStyle = this.color;
    ctx.fillRect(-3, -6, 7, 5);
    
    ctx.fillStyle = '#303060';
    ctx.fillRect(-3, -1, 3, 3);
    ctx.fillRect(1,  -1, 3, 3);
    
    ctx.fillStyle = this.color;
    ctx.fillRect(-6, -6, 3, 3);
    ctx.fillRect(4, -6, 3, 3);

    ctx.restore();
  }
}
