// Web Audio API Synthesizer & Procedural Ambient Music Engine for BLOOM

class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private loopInterval: number | null = null;
  private volume: number = 0.65;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a soft, dreamy ambient chord progression (E minor 9 -> C maj 9 -> G maj 7 -> D sus4)
  private playChord(frequencies: number[], duration: number, timeOffset: number = 0) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const startTime = this.ctx.currentTime + timeOffset;

    frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Soft sine & triangle blend for warm Rhodes / Celesta feel
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      // Low pass filter for soft dreaminess
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900 + Math.random() * 300, startTime);
      filter.Q.setValueAtTime(1.5, startTime);

      // Gentle attack and long dreamy release
      const baseGain = 0.08 / Math.max(1, frequencies.length * 0.4);
      oscGain.gain.setValueAtTime(0.0001, startTime);
      oscGain.gain.exponentialRampToValueAtTime(baseGain, startTime + 1.2 + idx * 0.15);
      oscGain.gain.exponentialRampToValueAtTime(0.00001, startTime + duration);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(startTime + idx * 0.08);
      osc.stop(startTime + duration + 0.5);
    });
  }

  // Play a delicate high twinkle / arpeggio note
  private playTwinkle(freq: number, startTime: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.04, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.00001, startTime + 1.8);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 2);
  }

  private chordSequence = [
    // Chord 1: Em9 (E3, B3, G4, D5, F#5)
    { freqs: [164.81, 246.94, 392.0, 587.33, 739.99], dur: 6 },
    // Chord 2: Cmaj9 (C3, G3, E4, B4, D5)
    { freqs: [130.81, 196.0, 329.63, 493.88, 587.33], dur: 6 },
    // Chord 3: Gmaj7 (G3, D4, B4, F#5)
    { freqs: [196.0, 293.66, 493.88, 739.99], dur: 6 },
    // Chord 4: Dadd9 / Bm7 (D3, A3, F#4, C#5, E5)
    { freqs: [146.83, 220.0, 369.99, 554.37, 659.25], dur: 6 },
  ];

  private currentChordIndex = 0;
  private soundscapeMode: 'bloom' | 'celesta' | 'golden' = 'bloom';

  private celestaSequence = [
    { freqs: [392.0, 523.25, 659.25, 783.99, 1046.5], dur: 5.5 },
    { freqs: [329.63, 440.0, 523.25, 659.25, 880.0], dur: 5.5 },
    { freqs: [349.23, 440.0, 523.25, 698.46, 880.0], dur: 5.5 },
    { freqs: [392.0, 493.88, 587.33, 783.99, 987.77], dur: 5.5 },
  ];

  private goldenSequence = [
    { freqs: [146.83, 220.0, 329.63, 440.0, 554.37], dur: 6.0 },
    { freqs: [196.0, 246.94, 392.0, 493.88, 659.25], dur: 6.0 },
    { freqs: [130.81, 196.0, 261.63, 392.0, 523.25], dur: 6.0 },
    { freqs: [174.61, 220.0, 349.23, 440.0, 659.25], dur: 6.0 },
  ];

  private triggerNextAmbientMeasure = () => {
    if (!this.isPlaying) return;

    let seq = this.chordSequence;
    if (this.soundscapeMode === 'celesta') seq = this.celestaSequence;
    if (this.soundscapeMode === 'golden') seq = this.goldenSequence;

    const chord = seq[this.currentChordIndex % seq.length];
    this.playChord(chord.freqs, chord.dur);

    // Random delicate star sparkle notes
    if (this.ctx) {
      const now = this.ctx.currentTime;
      const scale = [659.25, 739.99, 880.0, 987.77, 1174.66, 1318.51];
      const randomNote1 = scale[Math.floor(Math.random() * scale.length)];
      const randomNote2 = scale[Math.floor(Math.random() * scale.length)];
      this.playTwinkle(randomNote1, now + 1.2 + Math.random() * 0.8);
      this.playTwinkle(randomNote2, now + 3.2 + Math.random() * 0.8);
    }

    this.currentChordIndex = (this.currentChordIndex + 1) % seq.length;
  };

  public setSoundscape(mode: 'bloom' | 'celesta' | 'golden') {
    this.soundscapeMode = mode;
    this.currentChordIndex = 0;
    if (this.isPlaying) {
      this.triggerNextAmbientMeasure();
    }
  }

  public getSoundscape(): 'bloom' | 'celesta' | 'golden' {
    return this.soundscapeMode;
  }

  public startMusic() {
    this.initContext();
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.triggerNextAmbientMeasure();
    this.loopInterval = window.setInterval(this.triggerNextAmbientMeasure, 5800);
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.loopInterval !== null) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
    }
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  // SOUND EFFECTS

  public playSparkle() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const notes = [880, 1108.73, 1318.51, 1661.22, 1975.53];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.05, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + idx * 0.05 + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.7);
    });
  }

  public playEnvelopeOpen() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Soft paper whoosh
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.35);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.04, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);

    // Followed by gentle chime
    this.playTwinkle(1046.5, now + 0.2);
    this.playTwinkle(1318.51, now + 0.35);
  }

  public playBlowCandles() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Soft breath noise
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.08, now + 0.15);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);

    // Magical celebratory twinkle
    setTimeout(() => {
      this.playSparkle();
    }, 400);
  }

  public playGiftOpen() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const chords = [523.25, 659.25, 783.99, 1046.5];
    const now = this.ctx.currentTime;

    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.07, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
    });
  }

  public playRoseBloom() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const harpNotes = [392.0, 493.88, 587.33, 739.99, 880.0, 987.77, 1174.66];
    const now = this.ctx.currentTime;

    harpNotes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.04, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + idx * 0.12 + 1.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.5);
    });
  }
}

export const audioSystem = new AmbientMusicEngine();

