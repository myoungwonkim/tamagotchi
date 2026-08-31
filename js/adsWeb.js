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

// Ad Placement API가 비활성이면(스크립트 차단, 승인 전 도메인 등) adBreak 호출이
// 어떤 콜백도 없이 사라진다. 광고가 시작되지 않은 채 이 시간이 지나면 실패로 간주한다.
const AD_START_TIMEOUT_MS = 6000;

function runInterstitialAdBreak(name) {
  const adBreak = adBreakFn();
  if (!adBreak) return Promise.resolve({ shown: false, rewarded: false });

  return new Promise((resolve) => {
    let settled = false;
    let started = false;
    const settle = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    setTimeout(() => {
      if (!started) settle({ shown: false, rewarded: false });
    }, AD_START_TIMEOUT_MS);

    adBreak({
      type: "next",
      name,
      beforeAd: () => {
        started = true;
        suspendAudioForAds();
      },
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
    let started = false;
    const settle = (result) => {
      if (settled) return;
      settled = true;
      resumeAudioAfterAds();
      resolve(result);
    };

    setTimeout(() => {
      if (!started) settle({ shown: false, rewarded: false });
    }, AD_START_TIMEOUT_MS);

    suspendAudioForAds();
    adBreak({
      type: "reward",
      name: "abysspet-reward",
      beforeReward: (showAdFn) => {
        started = true;
        // Reward button click is already a user gesture; play immediately.
        showAdFn();
      },
      beforeAd: () => {
        started = true;
        suspendAudioForAds();
      },
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
