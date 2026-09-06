/**
 * Ads façade — platform-invariant gates (T1–T4 / R1–R3) + provider routing.
 * @see docs/MONETIZATION.md
 */
import {
  AD_TUNING,
  INTERSTITIAL_TRIGGERS,
  REWARD_TYPES,
} from "./adConfig.js";
import { getPlatform, isMockAdsEnabled, isWebAdsEnabled } from "./platformEnv.js";
import { getProtectAdUiState, STAT_PROTECT_COOLDOWN_MS } from "./pet.js";
import { readProtectUsedAt } from "./storage.js";

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
      if (platform === "toss" || isMockAdsEnabled()) {
        provider = await import("./adsToss.js");
      } else if (platform === "web" && isWebAdsEnabled()) {
        provider = await import("./adsWeb.js");
      } else if (platform === "play" && !playAdsOff) {
        provider = await import("./adsAdMob.js");
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

/** Ensure provider module is loaded and its init() has settled (AdMob SDK ready). */
async function ensureAdsReady() {
  const p = await loadProvider();
  if (!p) return false;
  if (typeof p.ensureReady === "function") {
    return Boolean(await p.ensureReady());
  }
  if (typeof p.init === "function") {
    return Boolean(await p.init());
  }
  return isAdsSupported();
}

/** Play ads are on unless the empty-ads build (`VITE_PLAY_ADS=0`) is baked in. */
function playAdsEnabled() {
  try {
    return import.meta.env?.VITE_PLAY_ADS !== "0";
  } catch {
    return true;
  }
}

/**
 * Reward CTAs must not wait for the provider import or AdMob initialize.
 * First paint runs while `provider` is still null (`void initAds()`), and a hung
 * SDK init would otherwise leave Play protect / web reward CTAs hidden forever.
 */
export function adsUiAvailable() {
  if (isAdsSupported()) return true;
  if (getPlatform() === "play" && playAdsEnabled()) {
    void ensureAdsReady();
    return true;
  }
  if (getPlatform() === "toss" || isMockAdsEnabled() || isWebAdsEnabled()) {
    void ensureAdsReady();
    return true;
  }
  // AdMob module loaded but SDK still initializing — keep reward CTAs visible.
  if (provider && typeof provider.ensureReady === "function") {
    void ensureAdsReady();
    return true;
  }
  return false;
}

/** Play uses only the 8h protect rewarded ad. Web / toss keep T1–T4 + R1–R3. */
export function usesPlayProtectAds() {
  return getPlatform() === "play" && playAdsEnabled();
}

export function preloadInterstitial() {
  if (usesPlayProtectAds()) return;
  void (async () => {
    await ensureAdsReady();
    provider?.preloadInterstitial?.();
  })();
}

export function preloadRewarded() {
  void (async () => {
    await ensureAdsReady();
    provider?.preloadRewarded?.();
  })();
}

export function canShowInterstitial(trigger) {
  if (usesPlayProtectAds()) return false;
  if (!isAdsSupported()) return false;

  const s = readSession();
  const now = Date.now();

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

const READY_GATE_MS = 3000;
/** Web/toss only. Play protect waits for a real fill instead. */
const REWARD_READY_GATE_MS = 1000;

let rewardedInflight = null;

async function gatedRewarded({ waitForFill = false } = {}) {
  if (rewardedInflight) return rewardedInflight;
  rewardedInflight = (async () => {
    try {
      const ready = waitForFill
        ? await ensureAdsReady()
        : await Promise.race([
            ensureAdsReady(),
            new Promise((resolve) => setTimeout(() => resolve(false), REWARD_READY_GATE_MS)),
          ]);
      if (!ready || !isAdsSupported()) return { shown: false, rewarded: false };
      return (await provider.showRewarded()) ?? { shown: false, rewarded: false };
    } catch (err) {
      console.warn("[ads] rewarded failed", err);
      return { shown: false, rewarded: false };
    }
  })().finally(() => {
    rewardedInflight = null;
  });
  return rewardedInflight;
}

export async function tryShowInterstitial(trigger) {
  if (usesPlayProtectAds()) return false;
  // Game flow (e.g. «새 펫 키우기») must not wait on AdMob. Callers should
  // fire-and-forget this; the gates only cap how long a background show can run.
  const GATE_MS = 4000;
  try {
    const ready = await Promise.race([
      ensureAdsReady(),
      new Promise((resolve) => setTimeout(() => resolve(false), READY_GATE_MS)),
    ]);
    if (!ready || !canShowInterstitial(trigger)) return false;
    const result = await Promise.race([
      provider.showInterstitial(),
      new Promise((resolve) =>
        setTimeout(() => resolve({ shown: false, rewarded: false }), GATE_MS),
      ),
    ]);
    if (result?.shown) recordInterstitialShown(trigger);
    return Boolean(result?.shown);
  } catch (err) {
    console.warn("[ads] tryShowInterstitial failed", trigger, err);
    return false;
  }
}

export function canOfferRevive(deathId) {
  if (usesPlayProtectAds()) return false;
  if (!adsUiAvailable()) return false;
  const s = readSession();
  return deathId && s.reviveUsedForDeathId !== deathId;
}

export function markReviveUsed(deathId) {
  writeSession({ reviveUsedForDeathId: deathId });
}

export async function showRewardedRevive() {
  return gatedRewarded();
}

export function canOfferEmergencyCare() {
  if (usesPlayProtectAds()) return false;
  if (!adsUiAvailable()) return false;
  const s = readSession();
  return s.emergencyCareCount < AD_TUNING.maxEmergencyCarePerSession;
}

export function recordEmergencyCareUsed() {
  const s = readSession();
  writeSession({ emergencyCareCount: s.emergencyCareCount + 1 });
}

export async function showRewardedEmergencyCare() {
  const result = await gatedRewarded();
  if (result.rewarded) recordEmergencyCareUsed();
  return result;
}

export function canOfferNeglectReset() {
  if (usesPlayProtectAds()) return false;
  if (!adsUiAvailable()) return false;
  const s = readSession();
  return s.neglectResetCount < AD_TUNING.maxNeglectResetPerSession;
}

export function canOfferStatProtect(pet) {
  if (!usesPlayProtectAds()) return false;
  if (!adsUiAvailable()) return false;
  if (pet) return getProtectAdUiState(pet).canWatch;
  const usedAt = readProtectUsedAt();
  return usedAt <= 0 || Date.now() >= usedAt + STAT_PROTECT_COOLDOWN_MS;
}

export async function showRewardedStatProtect() {
  return gatedRewarded({ waitForFill: true });
}

export function recordNeglectResetUsed() {
  const s = readSession();
  writeSession({ neglectResetCount: s.neglectResetCount + 1 });
}

export async function showRewardedNeglectReset() {
  const result = await gatedRewarded();
  if (result.rewarded) recordNeglectResetUsed();
  return result;
}

export async function initAds() {
  ensureSessionStarted();
  return ensureAdsReady();
}

export { REWARD_TYPES, INTERSTITIAL_TRIGGERS };
