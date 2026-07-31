/**
 * Apps in Toss fullscreen ad provider.
 * Dynamic-imports @apps-in-toss/web-framework so Play bundles can omit it.
 */
import {
  AD_GROUP_INTERSTITIAL,
  AD_GROUP_REWARDED,
  AD_TUNING,
} from "./adConfig.js";
import { isMockAdsEnabled } from "./platformEnv.js";
import { suspendAudioForAds, resumeAudioAfterAds } from "./audio.js";

const slotState = {
  interstitial: { loaded: false, loadUnsub: null, showUnsub: null },
  rewarded: { loaded: false, loadUnsub: null, showUnsub: null },
};

let sdk = null;
let sdkPromise = null;

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

function cleanupSlot(slotName) {
  const slot = slotState[slotName];
  slot.loadUnsub?.();
  slot.showUnsub?.();
  slot.loadUnsub = null;
  slot.showUnsub = null;
}

function mockShowAd(kind) {
  return new Promise((resolve) => {
    suspendAudioForAds();
    window.setTimeout(() => {
      resumeAudioAfterAds();
      resolve({ shown: true, rewarded: kind === "rewarded" });
    }, AD_TUNING.mockAdDurationMs);
  });
}

export async function init() {
  await loadSdk();
  if (!isSupported()) return false;
  preloadInterstitial();
  preloadRewarded();
  return true;
}

export function isSupported() {
  if (isMockAdsEnabled()) return true;
  if (!sdk?.loadFullScreenAd?.isSupported) return false;
  try {
    return sdk.loadFullScreenAd.isSupported();
  } catch {
    return false;
  }
}

function preloadSlot(slotName, adGroupId) {
  if (!isSupported()) return;
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
    if (!isSupported()) {
      resolve({ shown: false, rewarded: false });
      return;
    }

    if (isMockAdsEnabled()) {
      mockShowAd(slotName === "rewarded" ? "rewarded" : "interstitial").then(resolve);
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

export function showInterstitial() {
  return showSlot("interstitial", AD_GROUP_INTERSTITIAL);
}

export function showRewarded() {
  return showSlot("rewarded", AD_GROUP_REWARDED);
}
