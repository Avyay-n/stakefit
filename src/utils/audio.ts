// Web Audio API Synthesizer - 100% Native, Zero Dependencies, Zero Latency

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('stakefit_sound_enabled');
  return stored === null ? true : stored === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('stakefit_sound_enabled', String(enabled));
}

// 1. Cash Chime / Coin Settlement Sound
export function playCashChime(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Note 1: E6
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(1318.51, now);
  gain1.gain.setValueAtTime(0.2, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.35);

  // Note 2: B6 (higher sparkle)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1975.53, now + 0.08);
  gain2.gain.setValueAtTime(0.25, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.5);
}

// 2. Athletic Workout Gong / Check-In Success
export function playGong(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const fundamental = 120; // Low resonant base

  [fundamental, fundamental * 1.5, fundamental * 2.1, fundamental * 3.2].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = idx === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    
    const initialVol = 0.25 / (idx + 1);
    gain.gain.setValueAtTime(initialVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  });
}

// 3. Shame Wall / Default Thud
export function playSkullThud(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.4);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.45);
}

// 4. Streak Shield Deployment Shimmer
export function playShieldSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(960, now + 0.4);

  gain.gain.setValueAtTime(0.05, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.6);
}

// 5. Crisp Pop / Reaction Click
export function playPop(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

