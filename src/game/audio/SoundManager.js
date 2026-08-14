// Web Audio API Procedural Sound Synthesizer & Dynamic Chiptune Engine

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterVolume = 0.8;
    this.sfxVolume = 0.9;
    this.musicVolume = 0.6;
    this.bgmPlaying = false;
    this.bgmInterval = null;
    this.currentTrack = null;
    this.step = 0;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (err) {
      console.warn('[SoundManager] AudioContext init warning:', err);
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  setVolumes({ master, sfx, music }) {
    if (master !== undefined) this.masterVolume = master;
    if (sfx !== undefined) this.sfxVolume = sfx;
    if (music !== undefined) this.musicVolume = music;
  }

  // --- SOUND EFFECTS (FX) ---

  playPistol() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.09);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  playHMG() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(620, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.06);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.06);
    } catch (e) {}
  }

  playShotgun() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = i === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(220 + i * 80, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);

        gain.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
      }
    } catch (e) {}
  }

  playRocketLaunch() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(750, t + 0.25);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0.35 * this.sfxVolume * this.masterVolume, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch (e) {}
  }

  playExplosion() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.4);

      gain.gain.setValueAtTime(0.6 * this.sfxVolume * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);

      this.playNoise(0.35, 0.4);
    } catch (e) {}
  }

  playSodaGrenadeFizz() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.08);

      gain.gain.setValueAtTime(0.15 * this.sfxVolume * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {}
  }

  playJump() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(540, t + 0.15);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  playHurt() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.2);

      gain.gain.setValueAtTime(0.4 * this.sfxVolume * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {}
  }

  playEnemyPop() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350 + Math.random() * 100, t);
      osc.frequency.exponentialRampToValueAtTime(650, t + 0.1);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {}
  }

  playCandyPickup() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const f = notes[Math.floor(Math.random() * notes.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.12);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch (e) {}
  }

  playHostageRescue() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const chord = [587.33, 739.99, 880.00, 1174.66];
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.2, t + i * 0.04 + 0.25);

        gain.gain.setValueAtTime(0.25 * this.sfxVolume * this.masterVolume, t + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.04);
        osc.stop(t + i * 0.04 + 0.25);
      });
    } catch (e) {}
  }

  playWeaponPickup(weaponName = 'POWER UP') {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);

        gain.gain.setValueAtTime(0.2 * this.sfxVolume * this.masterVolume, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.2);
      });

      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          let phrase = 'Power up!';
          if (weaponName.includes('HMG') || weaponName.includes('MARSHMALLOW')) phrase = 'Heavy Marshmallow Gun!';
          else if (weaponName.includes('SHOT')) phrase = 'Shot-Gum!';
          else if (weaponName.includes('ROCKET')) phrase = 'Rocket Popsicle!';
          else if (weaponName.includes('GRENADE')) phrase = 'Soda Grenade!';

          const utter = new SpeechSynthesisUtterance(phrase);
          utter.pitch = 1.6;
          utter.rate = 1.3;
          utter.volume = Math.min(1, this.masterVolume * this.sfxVolume);
          window.speechSynthesis.speak(utter);
        } catch (e) {}
      }
    } catch (e) {}
  }

  playBossAlarm() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, t + i * 0.25);
        osc.frequency.linearRampToValueAtTime(900, t + i * 0.25 + 0.12);
        osc.frequency.linearRampToValueAtTime(600, t + i * 0.25 + 0.24);

        gain.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, t + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.25 + 0.24);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.25);
        osc.stop(t + i * 0.25 + 0.24);
      }
    } catch (e) {}
  }

  playBossHurt() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  playBossDefeat() {
    if (this.isMuted || !this.ctx) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      // Big triumphant descending/ascending chord
      const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + idx * 0.08 + 0.4);

        gain.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.4);
      });
    } catch (e) {}
  }

  playNoise(duration = 0.2, volume = 0.2) {
    if (this.isMuted || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume * this.sfxVolume * this.masterVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (e) {}
  }

  // --- DYNAMIC BACKGROUND MUSIC (BGM) SYNTHESIZER ---

  startBGM(track = 'stage') {
    this.init();
    if (this.bgmPlaying && this.currentTrack === track) return;
    this.stopBGM();
    this.currentTrack = track;
    this.bgmPlaying = true;
    this.step = 0;

    const tempo = track === 'boss' ? 145 : 126;
    const stepInterval = (60 / tempo / 4) * 1000;

    const stageBass = [
      130.81, 130.81, 130.81, 164.81,
      174.61, 174.61, 174.61, 220.00,
      196.00, 196.00, 196.00, 246.94,
      220.00, 196.00, 174.61, 146.83
    ];

    const stageMelody = [
      523.25, 0, 659.25, 783.99,  1046.50, 0, 783.99, 0,
      880.00, 0, 1046.50, 880.00, 783.99, 659.25, 523.25, 0,
      659.25, 783.99, 880.00, 1046.50, 1174.66, 0, 1046.50, 880.00,
      987.77, 0, 783.99, 0, 1046.50, 0, 0, 0
    ];

    const bossBass = [
      146.83, 146.83, 220.00, 146.83,
      174.61, 174.61, 261.63, 174.61,
      130.81, 130.81, 196.00, 130.81,
      116.54, 116.54, 174.61, 233.08
    ];

    const bossMelody = [
      587.33, 587.33, 698.46, 880.00,  0, 880.00, 1046.50, 880.00,
      698.46, 0, 880.00, 698.46,       587.33, 523.25, 587.33, 0,
      698.46, 698.46, 880.00, 1046.50, 1174.66, 0, 1046.50, 1174.66,
      1396.91, 1174.66, 1046.50, 880.00, 698.46, 587.33, 698.46, 0
    ];

    this.bgmInterval = setInterval(() => {
      if (this.isMuted || !this.ctx || !this.bgmPlaying) return;
      try {
        const t = this.ctx.currentTime;
        const curStep = this.step;
        const isBoss = this.currentTrack === 'boss';

        const bassPattern = isBoss ? bossBass : stageBass;
        const melodyPattern = isBoss ? bossMelody : stageMelody;

        const bassFreq = bassPattern[curStep % bassPattern.length];
        if (bassFreq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = isBoss ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(bassFreq, t);

          const vol = 0.22 * this.musicVolume * this.masterVolume;
          gain.gain.setValueAtTime(vol, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.12);
        }

        const melodyFreq = melodyPattern[curStep % melodyPattern.length];
        if (melodyFreq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(melodyFreq, t);

          const vol = 0.16 * this.musicVolume * this.masterVolume;
          gain.gain.setValueAtTime(vol, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.14);
        }

        const subStep = curStep % 16;
        if (subStep % 4 === 0) {
          const kick = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kick.type = 'sine';
          kick.frequency.setValueAtTime(140, t);
          kick.frequency.exponentialRampToValueAtTime(30, t + 0.08);

          kickGain.gain.setValueAtTime(0.35 * this.musicVolume * this.masterVolume, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

          kick.connect(kickGain);
          kickGain.connect(this.ctx.destination);
          kick.start(t);
          kick.stop(t + 0.08);
        }

        if (subStep === 4 || subStep === 12) {
          this.playNoise(0.06, 0.18 * this.musicVolume);
        } else if (subStep % 2 === 1) {
          this.playNoise(0.02, 0.08 * this.musicVolume);
        }

        this.step++;
      } catch (e) {}
    }, stepInterval);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.bgmPlaying = false;
  }
}

// Wrap with Proxy to guarantee calling ANY undefined method never crashes the game
const rawSoundManager = new SoundManager();
export const soundManager = new Proxy(rawSoundManager, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    // Safe no-op function for any missing sound method
    return () => {};
  }
});

export default soundManager;
