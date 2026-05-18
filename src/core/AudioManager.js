import { STORAGE } from '../constants.js';

export class AudioManager {
  constructor() {
    this._ctx = null;
    this._enabled = localStorage.getItem(STORAGE.AUDIO) !== 'false';
    this._musicEnabled = localStorage.getItem(STORAGE.AUDIO_MUSIC) !== 'false';
    this._musicGain = null;
    this._musicNodes = [];
    this._musicPlaying = false;
    this._unlocked = false;
  }

  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
    return this._ctx;
  }

  unlock() {
    if (this._unlocked) return;
    this._unlocked = true;
    const ctx = this._getCtx();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  }

  get enabled() { return this._enabled; }
  get musicEnabled() { return this._musicEnabled; }

  toggle() {
    this._enabled = !this._enabled;
    localStorage.setItem(STORAGE.AUDIO, String(this._enabled));
    return this._enabled;
  }

  toggleMusic() {
    this._musicEnabled = !this._musicEnabled;
    localStorage.setItem(STORAGE.AUDIO_MUSIC, String(this._musicEnabled));
    if (!this._musicEnabled) this.stopMusic();
    else if (!this._musicPlaying) this.startMusic();
    return this._musicEnabled;
  }

  _play(type, gain = 0.4) {
    if (!this._enabled) return;
    try {
      const ctx = this._getCtx();
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.connect(ctx.destination);

      switch (type) {
        case 'swing_tick':   this._playSwingTick(ctx, g); break;
        case 'drop':         this._playDrop(ctx, g); break;
        case 'land_perfect': this._playLandPerfect(ctx, g); break;
        case 'land_good':    this._playLandGood(ctx, g); break;
        case 'land_ok':      this._playLandOk(ctx, g); break;
        case 'land_miss':    this._playLandMiss(ctx, g); break;
        case 'combo':        this._playCombo(ctx, g); break;
        case 'resident_in':  this._playResidentIn(ctx, g); break;
        case 'menu_blip':    this._playMenuBlip(ctx, g); break;
        case 'game_start':   this._playGameStart(ctx, g); break;
      }
    } catch (e) {  }
  }

  _osc(ctx, dest, freq, type, start, dur, startGain = 0.3, endGain = 0) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    g.gain.setValueAtTime(startGain, ctx.currentTime + start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, endGain), ctx.currentTime + start + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.01);
  }

  _playSwingTick(ctx, dest) {
    this._osc(ctx, dest, 80, 'sine', 0, 0.05, 0.15, 0);
  }

  _playDrop(ctx, dest) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(dest);
    src.start(ctx.currentTime);
  }

  _playLandGood(ctx, dest) {
    this._osc(ctx, dest, 220, 'sine', 0, 0.1, 0.4, 0);
  }

  _playLandPerfect(ctx, dest) {
    this._osc(ctx, dest, 440, 'sine', 0, 0.06, 0.5, 0.2);
    this._osc(ctx, dest, 880, 'sine', 0.06, 0.1, 0.4, 0);
    this._osc(ctx, dest, 1320, 'sine', 0.12, 0.08, 0.3, 0);
  }

  _playLandOk(ctx, dest) {
    this._osc(ctx, dest, 180, 'triangle', 0, 0.08, 0.3, 0);
  }

  _playLandMiss(ctx, dest) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
    g.gain.setValueAtTime(0.5, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(g);
    g.connect(dest);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.41);
  }

  _playCombo(ctx, dest) {
    this._osc(ctx, dest, 523, 'square', 0,    0.1, 0.3, 0);
    this._osc(ctx, dest, 659, 'square', 0.1,  0.1, 0.3, 0);
    this._osc(ctx, dest, 784, 'square', 0.2,  0.12, 0.4, 0);
  }

  _playResidentIn(ctx, dest) {
    this._osc(ctx, dest, 880, 'sine', 0, 0.04, 0.2, 0);
  }

  _playMenuBlip(ctx, dest) {
    this._osc(ctx, dest, 440, 'square', 0, 0.05, 0.2, 0);
  }

  _playGameStart(ctx, dest) {
    this._osc(ctx, dest, 261, 'square', 0,    0.1, 0.3, 0.1);
    this._osc(ctx, dest, 329, 'square', 0.1,  0.1, 0.3, 0.1);
    this._osc(ctx, dest, 392, 'square', 0.2,  0.1, 0.3, 0.1);
    this._osc(ctx, dest, 523, 'square', 0.3,  0.2, 0.5, 0);
  }

  swingTick()  { this._play('swing_tick', 0.08); }
  drop()       { this._play('drop', 0.3); }
  landPerfect(){ this._play('land_perfect', 0.45); }
  landGood()   { this._play('land_good', 0.35); }
  landOk()     { this._play('land_ok', 0.25); }
  landMiss()   { this._play('land_miss', 0.5); }
  combo()      { this._play('combo', 0.35); }
  residentIn() { this._play('resident_in', 0.15); }
  menuBlip()   { this._play('menu_blip', 0.2); }
  gameStart()  { this._play('game_start', 0.4); }

  startMusic() {
    if (!this._musicEnabled || this._musicPlaying) return;
    try {
      const ctx = this._getCtx();

      this._musicGain = ctx.createGain();
      this._musicGain.gain.setValueAtTime(0, ctx.currentTime);
      this._musicGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2.5);

      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 3200;
      lpf.Q.value = 0.5;

      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.34;
      const fbGain = ctx.createGain();
      fbGain.gain.value = 0.26;
      const wetGain = ctx.createGain();
      wetGain.gain.value = 0.28;

      this._musicGain.connect(lpf);
      lpf.connect(ctx.destination);    
      lpf.connect(delay);
      delay.connect(fbGain);
      fbGain.connect(delay);           
      delay.connect(wetGain);
      wetGain.connect(ctx.destination); 

      this._musicNodes = [delay, fbGain, wetGain, lpf];
      this._musicPlaying = true;
      this._scheduleMelody(ctx);
    } catch (e) {  }
  }

  _scheduleMelody(ctx) {
    if (!this._musicPlaying || !this._musicEnabled) return;

    const beat = 60 / 76; 

    const note = (freq, startBeat, durationBeats, vol = 0.22) => {
      const t0  = ctx.currentTime + startBeat * beat;
      const dur = durationBeats * beat;
      const atk = Math.min(0.12, dur * 0.18);
      const rel = Math.min(0.45, dur * 0.45);
      const holdT = Math.max(t0 + atk + 0.01, t0 + dur - rel);

      for (const sign of [-1, 1]) {
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq * Math.pow(2, sign * 3 / 1200); 
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(vol, t0 + atk);
        g.gain.setValueAtTime(vol, holdT);
        g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(g);
        g.connect(this._musicGain);
        osc.start(t0);
        osc.stop(t0 + dur + 0.1);
        this._musicNodes.push(osc);
      }
    };

    const pad = (freqs, sb, db) => freqs.forEach(f => note(f, sb, db, 0.09));

    const G2=98.0,  C3=130.8, E3=164.8, G3=196.0, A3=220.0;
    const C4=261.6, D4=293.7, E4=329.6, G4=392.0, A4=440.0;
    const C5=523.3, D5=587.3, E5=659.3, G5=784.0;


    
    pad([C3, G3, C4, E4], 0,  4);
    pad([A3, C4, E4, A4], 4,  4);
    pad([G3, C4, E4, G4], 8,  4);
    pad([G3, D4, G4],    12,  4);

    [
      [C3, 0], [C3, 2], [A3, 4], [A3, 6],
      [G3, 8], [E3, 10], [G3, 12], [G2, 14],
    ].forEach(([f, s]) => note(f, s, 1.6, 0.28));

    [
      [C5,  0,   1.5], [E5,  1.5, 0.5], [G5,  2,   1.5], [E5,  3.5, 0.5],
      [D5,  4,   1  ], [C5,  5,   1  ], [A4,  6,   2  ],
      [G4,  8,   1  ], [A4,  9,   1  ], [C5,  10,  1.5], [D5,  11.5, 0.5],
      [E5,  12,  1  ], [C5,  13,  1  ], [A4,  14,  1  ], [G4,  15,  1  ],
    ].forEach(([f, s, d]) => note(f, s, d, 0.2));

    const loopMs = 16 * beat * 1000;
    setTimeout(() => {
      if (this._musicPlaying && this._enabled) this._scheduleMelody(ctx);
    }, loopMs - 300);
  }

  stopMusic() {
    this._musicPlaying = false;
    for (const n of this._musicNodes) {
      try { n.stop(); } catch (e) {  }
    }
    this._musicNodes = [];
  }
}
