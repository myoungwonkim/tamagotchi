/**
 * 앱인토스 광고·빈도 설정.
 * 출시 후 튜닝: docs/AD-TUNING.md
 */

const TEST_INTERSTITIAL = "ait-ad-test-interstitial-id";
const TEST_REWARDED = "ait-ad-test-rewarded-id";

function readEnv(key, fallback) {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
      return import.meta.env[key];
    }
  } catch {
    // ignore
  }
  return fallback;
}

export const AD_TUNING = {
  maxInterstitialPerSession: 3,
  interstitialCooldownMs: 8 * 60 * 1000,
  tutorialGraceMs: 10 * 60 * 1000,
  maxEmergencyCarePerSession: 3,
  maxNeglectResetPerSession: 2,
  emergencyCareStatThreshold: 40,
  neglectPromptAvgThreshold: 20,
  mockAdDurationMs: 1500,
};

export const AD_GROUP_INTERSTITIAL = readEnv("VITE_AD_INTERSTITIAL_ID", TEST_INTERSTITIAL);
export const AD_GROUP_REWARDED = readEnv("VITE_AD_REWARDED_ID", TEST_REWARDED);

export const INTERSTITIAL_TRIGGERS = {
  T1_GAME_OVER: "T1",
  T2_ADULT_EVOLVE: "T2",
  T3_GRADUATE: "T3",
  T4_LONG_RETURN: "T4",
};

export const REWARD_TYPES = {
  REVIVE: "R1",
  EMERGENCY_CARE: "R2",
  NEGLECT_RESET: "R3",
};
