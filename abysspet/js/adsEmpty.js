/** Ads no-op provider (web / Play Phase 1 empty-ads) */

export async function init() {
  return false;
}

export function isSupported() {
  return false;
}

export function preloadInterstitial() {}

export function preloadRewarded() {}

export async function showInterstitial() {
  return { shown: false, rewarded: false };
}

export async function showRewarded() {
  return { shown: false, rewarded: false };
}
