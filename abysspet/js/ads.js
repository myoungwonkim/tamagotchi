/**
 * Ads façade — platform-invariant gates (T1–T4 / R1–R3) + provider routing.
 * @see docs/MONETIZATION.md
 */
import {
  AD_TUNING,
  INTERSTITIAL_TRIGGERS,
  REWARD_TYPES,
} from "./adConfig.js";
import { getPlatform, isMockAdsEnabled, isTossEnv } from "./platformEnv.js";

const SESSION_KEY = "tamagotchi-ad-session";

let provider = null;
let providerPromise = null;

function readSession() {
  const defaults = {
    sessionStartedAt: Date.now(),
    interstitialCount: 0,
    lastInterstitialAt: 0,
    t2Shown: false,
    t4Shown: false,
    reviveUsedForDeathId: null,
    emergencyCareCount: 0,
    neglectResetCount: 0,
  };
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

function writeSession(patch) {
  const next = { ...readSession(), ...patch };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

function ensureSessionStarted() {
  const s = readSession();
  if (!s.sessionStartedAt) writeSession({ sessionStartedAt: Date.now() });
}

async function loadProvider() {
  if (provider) return provider;
  if (!providerPromise) {
    providerPromise = (async () => {
      const platform = getPlatform();
      // Empty-ads: VITE_PLAY_ADS=0 forces no-op on Play (Phase 1 shell)
      const playAdsOff = import.meta.env?.VITE_PLAY_ADS === "0";
      if (isMockAdsEnabled() || platform === "toss" || (isTossEnv() && isMockAdsEnabled())) {
        provider = await import("./adsToss.js");
      } else if (platform === "play" && !playAdsOff) {
        provider = await import("./adsAdMob.js");
      } else if (platform === "play" && playAdsOff) {
        provider = await import("./adsEmpty.js");
      } else {
        provider = await import("./adsEmpty.js");
      }
      return provider;
    })();
  }
  return providerPromise;
}

export function isAdsSupported() {
  return Boolean(provider?.isSupported?.());
}

export function preloadInterstitial() {
  provider?.preloadInterstitial?.();
}

export function preloadRewarded() {
  provider?.preloadRewarded?.();
}

export function canShowInterstitial(trigger) {
  if (!isAdsSupported()) return false;

  const s = readSession();
  const now = Date.now();

  if (now - s.sessionStartedAt < AD_TUNING.tutorialGraceMs) return false;
  if (s.interstitialCount >= AD_TUNING.maxInterstitialPerSession) return false;
  if (s.lastInterstitialAt && now - s.lastInterstitialAt < AD_TUNING.interstitialCooldownMs) {
    return false;
  }
  if (trigger === INTERSTITIAL_TRIGGERS.T2_ADULT_EVOLVE && s.t2Shown) return false;
  if (trigger === INTERSTITIAL_TRIGGERS.T4_LONG_RETURN && s.t4Shown) return false;

  return true;
}

function recordInterstitialShown(trigger) {
  const s = readSession();
  const patch = {
    interstitialCount: s.interstitialCount + 1,
    lastInterstitialAt: Date.now(),
  };
  if (trigger === INTERSTITIAL_TRIGGERS.T2_ADULT_EVOLVE) patch.t2Shown = true;
  if (trigger === INTERSTITIAL_TRIGGERS.T4_LONG_RETURN) patch.t4Shown = true;
  writeSession(patch);
}

export async function tryShowInterstitial(trigger) {
  if (!canShowInterstitial(trigger)) return false;
  const result = await provider.showInterstitial();
  if (result.shown) recordInterstitialShown(trigger);
  return result.shown;
}

export function canOfferRevive(deathId) {
  if (!isAdsSupported()) return false;
  const s = readSession();
  return deathId && s.reviveUsedForDeathId !== deathId;
}

export function markReviveUsed(deathId) {
  writeSession({ reviveUsedForDeathId: deathId });
}

export async function showRewardedRevive() {
  const result = await provider.showRewarded();
  return result.rewarded;
}

export function canOfferEmergencyCare() {
  if (!isAdsSupported()) return false;
  const s = readSession();
  return s.emergencyCareCount < AD_TUNING.maxEmergencyCarePerSession;
}

export function recordEmergencyCareUsed() {
  const s = readSession();
  writeSession({ emergencyCareCount: s.emergencyCareCount + 1 });
}

export async function showRewardedEmergencyCare() {
  const result = await provider.showRewarded();
  if (result.rewarded) recordEmergencyCareUsed();
  return result.rewarded;
}

export function canOfferNeglectReset() {
  if (!isAdsSupported()) return false;
  const s = readSession();
  return s.neglectResetCount < AD_TUNING.maxNeglectResetPerSession;
}

export function recordNeglectResetUsed() {
  const s = readSession();
  writeSession({ neglectResetCount: s.neglectResetCount + 1 });
}

export async function showRewardedNeglectReset() {
  const result = await provider.showRewarded();
  if (result.rewarded) recordNeglectResetUsed();
  return result.rewarded;
}

export async function initAds() {
  ensureSessionStarted();
  const p = await loadProvider();
  if (!p) return false;
  return p.init();
}

export { REWARD_TYPES, INTERSTITIAL_TRIGGERS };
