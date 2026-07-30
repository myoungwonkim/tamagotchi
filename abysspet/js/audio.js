import { getSpriteUrl } from "./sprites.js";

const SETTINGS_KEY = "tamagotchi-settings";

const SFX_PRESETS = {
  feed: { frequencies: [520], duration: 0.1, type: "sine", gain: 0.08 },
  play: { frequencies: [660, 880], duration: 0.08, gap: 0.06, type: "square", gain: 0.06 },
  clean: { frequencies: [440, 554], duration: 0.12, gap: 0.05, type: "triangle", gain: 0.07 },
  sleep: { frequencies: [330], duration: 0.18, type: "sine", gain: 0.07 },
  wake: { frequencies: [494, 587], duration: 0.09, gap: 0.05, type: "sine", gain: 0.07 },
  evolve: { frequencies: [523, 659, 784, 1047], duration: 0.1, gap: 0.07, type: "square", gain: 0.06 },
  gameover: { frequencies: [392, 330, 262], duration: 0.2, gap: 0.08, type: "sine", gain: 0.08 },
  message: { frequencies: [587], duration: 0.08, type: "sine", gain: 0.05 },
  shark: { frequencies: [160, 110, 70], duration: 0.16, gap: 0.03, type: "sawtooth", gain: 0.1 },
};

let audioContext = null;
let muted = false;
let unlocked = false;
let adsSuspended = false;
let preAdMuted = null;

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return;
    const settings = JSON.parse(raw);
    muted = Boolean(settings.muted);
  } catch {
    muted = false;
  }
}

function saveSettings() {
  try {
    const existing = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...existing, muted }));
  } catch {
    // ignore
  }
}

loadSettings();

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = Boolean(value);
  saveSettings();
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

export function initAudio() {
  if (audioContext) {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    unlocked = true;
    return;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  audioContext = new AudioCtx();
  unlocked = true;

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playTone(frequency, duration, type, gain, startAt) {
  const osc = audioContext.createOscillator();
  const amp = audioContext.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startAt);
  amp.gain.setValueAtTime(gain, startAt);
  amp.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  osc.connect(amp);
  amp.connect(audioContext.destination);

  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

export function playSfx(name, options = {}) {
  if (muted || adsSuspended) return;

  if (!audioContext) {
    if (!unlocked) return;
    initAudio();
  }

  if (!audioContext || audioContext.state === "suspended") return;

  const preset = SFX_PRESETS[name];
  if (!preset) return;

  const now = audioContext.currentTime + 0.01;
  const frequencies = options.frequencies || preset.frequencies;
  const gap = preset.gap ?? 0;

  frequencies.forEach((frequency, index) => {
    playTone(
      frequency,
      preset.duration,
      preset.type,
      preset.gain,
      now + index * (preset.duration + gap),
    );
  });
}

export function updateMuteButton(button) {
  if (!button) return;
  const img = button.querySelector(".header-icon");
  if (img) {
    img.src = getSpriteUrl("ui", muted ? "sound-off" : "sound-on");
  } else {
    button.textContent = muted ? "🔇" : "🔊";
  }
  button.setAttribute("aria-label", muted ? "소리 켜기" : "소리 끄기");
  button.setAttribute("aria-pressed", muted ? "true" : "false");
}

/** 인앱 광고 재생 중 Web Audio 일시 정지 (앱인토스 정책) */
export function suspendAudioForAds() {
  adsSuspended = true;
  preAdMuted = muted;
  if (audioContext?.state === "running") {
    audioContext.suspend().catch(() => {});
  }
}

export function resumeAudioAfterAds() {
  adsSuspended = false;
  if (audioContext?.state === "suspended" && !preAdMuted) {
    audioContext.resume().catch(() => {});
  }
  preAdMuted = null;
}
