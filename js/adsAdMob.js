/**
 * Google AdMob provider (Capacitor Android / Play).
 * Default units are Google samples — set VITE_ADMOB_* for production (no local click-tests).
 */
import { suspendAudioForAds, resumeAudioAfterAds } from "./audio.js";

const SAMPLE_INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712";
const SAMPLE_REWARDED = "ca-app-pub-3940256099942544/5224354917";

function env(key, fallback) {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
      return import.meta.env[key];
    }
  } catch {
    // ignore
  }
  return fallback;
}

const UNIT_INTERSTITIAL = env("VITE_ADMOB_INTERSTITIAL_ID", SAMPLE_INTERSTITIAL);
const UNIT_REWARDED = env("VITE_ADMOB_REWARDED_ID", SAMPLE_REWARDED);

let AdMob = null;
let RewardAdPluginEvents = null;
let initialized = false;
const slotLoaded = { interstitial: false, rewarded: false };

async function loadPlugin() {
  if (AdMob) return AdMob;
  try {
    const mod = await import("@capacitor-community/admob");
    AdMob = mod.AdMob;
    RewardAdPluginEvents = mod.RewardAdPluginEvents;
    return AdMob;
  } catch {
    return null;
  }
}

export async function init() {
  const plugin = await loadPlugin();
  if (!plugin) return false;
  try {
    const testing = UNIT_INTERSTITIAL.includes("3940256099942544");
    await plugin.initialize({
      initializeForTesting: testing,
    });
    initialized = true;
    await preloadInterstitial();
    await preloadRewarded();
    return true;
  } catch (err) {
    console.warn("[adsAdMob] init failed", err);
    initialized = false;
    return false;
  }
}

export function isSupported() {
  return initialized && Boolean(AdMob);
}

export async function preloadInterstitial() {
  if (!isSupported()) return;
  try {
    await AdMob.prepareInterstitial({ adId: UNIT_INTERSTITIAL });
    slotLoaded.interstitial = true;
  } catch {
    slotLoaded.interstitial = false;
  }
}

export async function preloadRewarded() {
  if (!isSupported()) return;
  try {
    await AdMob.prepareRewardVideoAd({ adId: UNIT_REWARDED });
    slotLoaded.rewarded = true;
  } catch {
    slotLoaded.rewarded = false;
  }
}

export async function showInterstitial() {
  if (!isSupported()) return { shown: false, rewarded: false };
  if (!slotLoaded.interstitial) {
    await preloadInterstitial();
    if (!slotLoaded.interstitial) return { shown: false, rewarded: false };
  }
  suspendAudioForAds();
  try {
    await AdMob.showInterstitial();
    slotLoaded.interstitial = false;
    resumeAudioAfterAds();
    preloadInterstitial();
    return { shown: true, rewarded: false };
  } catch {
    resumeAudioAfterAds();
    slotLoaded.interstitial = false;
    preloadInterstitial();
    return { shown: false, rewarded: false };
  }
}

export async function showRewarded() {
  if (!isSupported()) return { shown: false, rewarded: false };
  if (!slotLoaded.rewarded) {
    await preloadRewarded();
    if (!slotLoaded.rewarded) return { shown: false, rewarded: false };
  }

  let rewarded = false;
  let rewardHandle = null;
  if (RewardAdPluginEvents?.Rewarded) {
    rewardHandle = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
      rewarded = true;
    });
  }

  suspendAudioForAds();
  try {
    await AdMob.showRewardVideoAd();
    // If no Rewarded event API, treat successful resolve as earned (plugin contract)
    if (!RewardAdPluginEvents?.Rewarded) rewarded = true;
    slotLoaded.rewarded = false;
    resumeAudioAfterAds();
    rewardHandle?.remove?.();
    preloadRewarded();
    return { shown: true, rewarded };
  } catch {
    resumeAudioAfterAds();
    rewardHandle?.remove?.();
    slotLoaded.rewarded = false;
    preloadRewarded();
    return { shown: false, rewarded: false };
  }
}
