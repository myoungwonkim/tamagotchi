/**
 * Web game ads — Google Ad Placement API (AdSense H5 interstitial + rewarded).
 * @see docs/ADS-WEB.md
 */
import { suspendAudioForAds, resumeAudioAfterAds, isMuted } from "./audio.js";
import { getWebAdsenseClient } from "./platformEnv.js";

let initialized = false;

function adBreakFn() {
  return typeof window.adBreak === "function" ? window.adBreak : null;
}

function adConfigFn() {
  return typeof window.adConfig === "function" ? window.adConfig : null;
}

export function syncWebAdConfig() {
  const adConfig = adConfigFn();
  if (!adConfig) return;
  adConfig({ sound: isMuted() ? "off" : "on" });
}

export async function init() {
  if (!getWebAdsenseClient()) return false;
  if (!adBreakFn()) return false;
  syncWebAdConfig();
  window.__syncWebAdConfig = syncWebAdConfig;
  initialized = true;
  return true;
}

export function isSupported() {
  return initialized && Boolean(adBreakFn());
}

export function preloadInterstitial() {}

export function preloadRewarded() {}

function runInterstitialAdBreak(name) {
  const adBreak = adBreakFn();
  if (!adBreak) return Promise.resolve({ shown: false, rewarded: false });

  return new Promise((resolve) => {
    let settled = false;
    const settle = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    adBreak({
      type: "next",
      name,
      beforeAd: () => suspendAudioForAds(),
      afterAd: () => {
        resumeAudioAfterAds();
        settle({ shown: true, rewarded: false });
      },
      adBreakDone: (info) => {
        const status = info?.breakStatus;
        if (status === "viewed" || status === "dismissed") return;
        settle({ shown: false, rewarded: false });
      },
    });
  });
}

export async function showInterstitial() {
  if (!isSupported()) return { shown: false, rewarded: false };
  return runInterstitialAdBreak("abysspet-interstitial");
}

export async function showRewarded() {
  if (!isSupported()) return { shown: false, rewarded: false };

  const adBreak = adBreakFn();
  if (!adBreak) return { shown: false, rewarded: false };

  return new Promise((resolve) => {
    let settled = false;
    const settle = (result) => {
      if (settled) return;
      settled = true;
      resumeAudioAfterAds();
      resolve(result);
    };

    suspendAudioForAds();
    adBreak({
      type: "reward",
      name: "abysspet-reward",
      beforeReward: (showAdFn) => {
        // Reward button click is already a user gesture; play immediately.
        showAdFn();
      },
      beforeAd: () => suspendAudioForAds(),
      afterAd: () => resumeAudioAfterAds(),
      adViewed: () => settle({ shown: true, rewarded: true }),
      adDismissed: () => settle({ shown: true, rewarded: false }),
      adBreakDone: (info) => {
        const status = info?.breakStatus;
        if (status === "viewed" || status === "dismissed") return;
        settle({ shown: false, rewarded: false });
      },
    });
  });
}
