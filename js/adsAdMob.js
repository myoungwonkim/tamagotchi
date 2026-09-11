/**
 * Play ads via the in-app AbyssPetAds native plugin.
 * Protect: rewarded interstitial, fallback to rewarded. T1/T3: interstitial.
 */
import { Capacitor, registerPlugin } from "@capacitor/core";
import { suspendAudioForAds, resumeAudioAfterAds } from "./audio.js";

const SAMPLE_INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712";
const SAMPLE_REWARDED = "ca-app-pub-3940256099942544/5224354917";
const SAMPLE_REWARDED_INTERSTITIAL = "ca-app-pub-3940256099942544/5354046379";

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

const FORCE_TEST = env("VITE_ADMOB_FORCE_TEST", "") === "1";
const UNIT_INTERSTITIAL = FORCE_TEST
  ? SAMPLE_INTERSTITIAL
  : env("VITE_ADMOB_INTERSTITIAL_ID", SAMPLE_INTERSTITIAL);
const UNIT_REWARDED = FORCE_TEST
  ? SAMPLE_REWARDED
  : env("VITE_ADMOB_REWARDED_ID", SAMPLE_REWARDED);
const UNIT_REWARDED_INTERSTITIAL = FORCE_TEST
  ? SAMPLE_REWARDED_INTERSTITIAL
  : env("VITE_ADMOB_REWARDED_INTERSTITIAL_ID", SAMPLE_REWARDED_INTERSTITIAL);

function isSampleUnit(id) {
  return Boolean(id && id.includes("3940256099942544"));
}

const AbyssPetAds = registerPlugin("AbyssPetAds");

let initialized = false;
let initPromise = null;

async function doInitialize() {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await AbyssPetAds.initialize();
    initialized = true;
    return true;
  } catch (err) {
    console.warn("[adsAdMob] native init failed", err);
    initialized = false;
    return false;
  }
}

export async function init() {
  if (initialized) return true;
  if (!initPromise) {
    initPromise = doInitialize().finally(() => {
      if (!initialized) initPromise = null;
    });
  }
  return initPromise;
}

export async function ensureReady() {
  return init();
}

export function isSupported() {
  return initialized && Capacitor.isNativePlatform();
}

function nativeOpts(adId) {
  return { adId, isTesting: FORCE_TEST || isSampleUnit(adId) };
}

export async function preloadInterstitial() {
  if (!(await init()) || !isSupported()) return;
  try {
    await AbyssPetAds.preloadInterstitial(nativeOpts(UNIT_INTERSTITIAL));
  } catch (err) {
    console.warn("[adsAdMob] preloadInterstitial failed", err);
  }
}

export async function preloadRewarded() {
  if (!(await init()) || !isSupported()) return;
  try {
    await AbyssPetAds.preloadRewardedInterstitial(nativeOpts(UNIT_REWARDED_INTERSTITIAL));
    await AbyssPetAds.preloadRewarded(nativeOpts(UNIT_REWARDED));
  } catch (err) {
    console.warn("[adsAdMob] preloadRewarded failed", err);
  }
}

async function showNative(method, adId) {
  if (!(await ensureReady()) || !isSupported()) {
    return { shown: false, rewarded: false };
  }
  suspendAudioForAds();
  try {
    const result = await AbyssPetAds[method](nativeOpts(adId));
    resumeAudioAfterAds();
    return {
      shown: Boolean(result?.shown),
      rewarded: Boolean(result?.rewarded),
    };
  } catch (err) {
    resumeAudioAfterAds();
    console.warn("[adsAdMob] native", method, "failed", err);
    return { shown: false, rewarded: false };
  }
}

export async function showInterstitial() {
  return showNative("showInterstitial", UNIT_INTERSTITIAL);
}

/** Play protect: RI first, then the 1.0.25 rewarded unit if that fill is empty. */
export async function showRewarded() {
  const ri = await showNative("showRewardedInterstitial", UNIT_REWARDED_INTERSTITIAL);
  if (ri.shown) return ri;
  return showNative("showRewarded", UNIT_REWARDED);
}
