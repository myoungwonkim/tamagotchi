/**
 * Play rewarded ads via the in-app AbyssPetAds native plugin.
 * The community AdMob JS plugin never reached MobileAds on device (no I/Ads).
 */
import { Capacitor, registerPlugin } from "@capacitor/core";
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

const FORCE_TEST = env("VITE_ADMOB_FORCE_TEST", "") === "1";
const UNIT_INTERSTITIAL = FORCE_TEST
  ? SAMPLE_INTERSTITIAL
  : env("VITE_ADMOB_INTERSTITIAL_ID", SAMPLE_INTERSTITIAL);
const UNIT_REWARDED = FORCE_TEST
  ? SAMPLE_REWARDED
  : env("VITE_ADMOB_REWARDED_ID", SAMPLE_REWARDED);
const USING_SAMPLE_UNITS =
  FORCE_TEST ||
  UNIT_INTERSTITIAL.includes("3940256099942544") ||
  UNIT_REWARDED.includes("3940256099942544");

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

export async function preloadInterstitial() {}

export async function preloadRewarded() {
  await init();
}

export async function showInterstitial() {
  return { shown: false, rewarded: false };
}

export async function showRewarded() {
  if (!(await ensureReady()) || !isSupported()) {
    return { shown: false, rewarded: false };
  }
  suspendAudioForAds();
  try {
    const result = await AbyssPetAds.showRewarded({
      adId: UNIT_REWARDED,
      isTesting: USING_SAMPLE_UNITS,
    });
    resumeAudioAfterAds();
    return {
      shown: Boolean(result?.shown),
      rewarded: Boolean(result?.rewarded),
    };
  } catch (err) {
    resumeAudioAfterAds();
    console.warn("[adsAdMob] native showRewarded failed", err);
    return { shown: false, rewarded: false };
  }
}
