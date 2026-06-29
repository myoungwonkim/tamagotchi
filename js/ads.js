import {
  AD_GROUP_INTERSTITIAL,
  AD_GROUP_REWARDED,
  AD_TUNING,
  INTERSTITIAL_TRIGGERS,
  REWARD_TYPES,
} from "./adConfig.js";
import { isMockAdsEnabled, isTossEnv } from "./tossEnv.js";
import { suspendAudioForAds, resumeAudioAfterAds } from "./audio.js";

const SESSION_KEY = "tamagotchi-ad-session";

const slotState = {
  interstitial: { loaded: false, loadUnsub: null, showUnsub: null },
  rewarded: { loaded: false, loadUnsub: null, showUnsub: null },
};

let sdk = null;
let sdkPromise = null;

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

async function loadSdk() {
  if (sdk) return sdk;
  if (!sdkPromise) {
    sdkPromise = import("@apps-in-toss/web-framework")
      .then((mod) => {
        sdk = mod;
        return mod;
      })
      .catch(() => null);
  }
  return sdkPromise;
}

export function isAdsSupported() {
  if (isMockAdsEnabled() && isTossEnv()) return true;
  if (!sdk?.loadFullScreenAd?.isSupported) return false;
  try {
    return sdk.loadFullScreenAd.isSupported();
  } catch {
    return false;
  }
}

function cleanupSlot(slotName) {
  const slot = slotState[slotName];
  slot.loadUnsub?.();
  slot.showUnsub?.();
  slot.loadUnsub = null;
  slot.showUnsub = null;
}

function mockShowAd(kind) {
  return new Promise((resolve, reject) => {
    suspendAudioForAds();
    window.setTimeout(() => {
      resumeAudioAfterAds();
      if (kind === "rewarded") {
        resolve({ rewarded: true });
      } else {
        resolve({ rewarded: false });
      }
    }, AD_TUNING.mockAdDurationMs);
  });
}

function preloadSlot(slotName, adGroupId) {
  if (!isAdsSupported()) return;
  if (isMockAdsEnabled()) return;
  if (!sdk?.loadFullScreenAd) return;
  const slot = slotState[slotName];
  if (slot.loaded || slot.loadUnsub) return;

  cleanupSlot(slotName);

  slot.loadUnsub = sdk.loadFullScreenAd({
    options: { adGroupId },
    onEvent: (event) => {
      if (event.type === "loaded") {
        slot.loaded = true;
      }
    },
    onError: () => {
      slot.loaded = false;
      slot.loadUnsub = null;
    },
  });
}

export function preloadInterstitial() {
  preloadSlot("interstitial", AD_GROUP_INTERSTITIAL);
}

export function preloadRewarded() {
  preloadSlot("rewarded", AD_GROUP_REWARDED);
}

function showSlot(slotName, adGroupId) {
  return new Promise((resolve) => {
    if (!isAdsSupported()) {
      resolve({ shown: false, rewarded: false });
      return;
    }

    if (isMockAdsEnabled()) {
      mockShowAd(slotName === "rewarded" ? "rewarded" : "interstitial").then((r) => {
        resolve({ shown: true, rewarded: Boolean(r.rewarded) });
      });
      return;
    }

    const slot = slotState[slotName];
    if (!slot.loaded) {
      resolve({ shown: false, rewarded: false });
      preloadSlot(slotName, adGroupId);
      return;
    }

    let rewarded = false;
    suspendAudioForAds();

    slot.showUnsub = sdk.showFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === "userEarnedReward") {
          rewarded = true;
        }
        if (event.type === "dismissed" || event.type === "failedToShow") {
          resumeAudioAfterAds();
          slot.showUnsub?.();
          slot.showUnsub = null;
          slot.loaded = false;
          preloadSlot(slotName, adGroupId);
          resolve({
            shown: event.type === "dismissed",
            rewarded,
          });
        }
      },
      onError: () => {
        resumeAudioAfterAds();
        slot.showUnsub = null;
        slot.loaded = false;
        preloadSlot(slotName, adGroupId);
        resolve({ shown: false, rewarded: false });
      },
    });
  });
}

export function canShowInterstitial(trigger) {
  if (!isTossEnv() && !isMockAdsEnabled()) return false;
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

  const result = await showSlot("interstitial", AD_GROUP_INTERSTITIAL);
  if (result.shown) recordInterstitialShown(trigger);
  return result.shown;
}

export function canOfferRevive(deathId) {
  if (!isTossEnv() && !isMockAdsEnabled()) return false;
  if (!isAdsSupported()) return false;
  const s = readSession();
  return deathId && s.reviveUsedForDeathId !== deathId;
}

export function markReviveUsed(deathId) {
  writeSession({ reviveUsedForDeathId: deathId });
}

export async function showRewardedRevive() {
  const result = await showSlot("rewarded", AD_GROUP_REWARDED);
  return result.rewarded;
}

export function canOfferEmergencyCare() {
  if (!isTossEnv() && !isMockAdsEnabled()) return false;
  if (!isAdsSupported()) return false;
  const s = readSession();
  return s.emergencyCareCount < AD_TUNING.maxEmergencyCarePerSession;
}

export function recordEmergencyCareUsed() {
  const s = readSession();
  writeSession({ emergencyCareCount: s.emergencyCareCount + 1 });
}

export async function showRewardedEmergencyCare() {
  const result = await showSlot("rewarded", AD_GROUP_REWARDED);
  if (result.rewarded) recordEmergencyCareUsed();
  return result.rewarded;
}

export function canOfferNeglectReset() {
  if (!isTossEnv() && !isMockAdsEnabled()) return false;
  if (!isAdsSupported()) return false;
  const s = readSession();
  return s.neglectResetCount < AD_TUNING.maxNeglectResetPerSession;
}

export function recordNeglectResetUsed() {
  const s = readSession();
  writeSession({ neglectResetCount: s.neglectResetCount + 1 });
}

export async function showRewardedNeglectReset() {
  const result = await showSlot("rewarded", AD_GROUP_REWARDED);
  if (result.rewarded) recordNeglectResetUsed();
  return result.rewarded;
}

export async function initAds() {
  ensureSessionStarted();
  if (!isTossEnv() && !isMockAdsEnabled()) return false;

  await loadSdk();
  if (!isAdsSupported()) return false;

  preloadInterstitial();
  preloadRewarded();
  return true;
}

export { REWARD_TYPES, INTERSTITIAL_TRIGGERS };
