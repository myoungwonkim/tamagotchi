/**
 * Firebase Analytics + Crashlytics — Play (Capacitor Android) only.
 *
 * Web/Toss/capture builds keep the existing GA4 gtag in index.html; everything
 * here is a no-op off Play so the plugins never load in those bundles.
 * Every call is best-effort: telemetry must not break gameplay.
 */
import { getPlatform } from "./platformEnv.js";

let analytics = null;
let crashlytics = null;
let enabled = false;
let initPromise = null;

function appVersion() {
  if (typeof document === "undefined") return "";
  return document.querySelector('meta[name="app-version"]')?.content?.trim() || "";
}

async function doInit() {
  try {
    const [{ FirebaseAnalytics }, { FirebaseCrashlytics }] = await Promise.all([
      import("@capacitor-firebase/analytics"),
      import("@capacitor-firebase/crashlytics"),
    ]);
    analytics = FirebaseAnalytics;
    crashlytics = FirebaseCrashlytics;
  } catch (err) {
    console.warn("[firebase] plugin import failed", err);
    return false;
  }

  try {
    await analytics.setEnabled({ enabled: true });
  } catch (err) {
    console.warn("[firebase] analytics setEnabled failed", err);
  }

  try {
    await crashlytics.setEnabled({ enabled: true });
    const version = appVersion();
    if (version) {
      await crashlytics.setCustomKey({ key: "app_version", value: version, type: "string" });
    }
  } catch (err) {
    console.warn("[firebase] crashlytics setup failed", err);
  }

  enabled = true;
  logGameEvent("play_boot", { app_version: appVersion() || "unknown" });
  return true;
}

export async function initFirebasePlay() {
  if (getPlatform() !== "play") return false;
  if (!initPromise) {
    initPromise = doInit().catch((err) => {
      console.warn("[firebase] init failed", err);
      return false;
    });
  }
  return initPromise;
}

export function logGameEvent(name, params = {}) {
  if (!enabled || !analytics) return;
  analytics
    .logEvent({ name, params })
    .catch((err) => console.warn("[firebase] logEvent failed", name, err));
}

export function logPetHatch(pet) {
  logGameEvent("pet_hatch", { species_theme: pet?.speciesTheme ?? "deepsea" });
}

export function logPetEvolve(pet, stageId) {
  logGameEvent("pet_evolve", {
    stage: stageId ?? "",
    species_theme: pet?.speciesTheme ?? "deepsea",
    adult_variant: pet?.adultVariantId ?? "",
  });
}

/** action: feed | play | clean | sleep */
export function logPetCare(action) {
  logGameEvent("pet_care", { action });
}

export function logEncyclopediaOpen() {
  logGameEvent("encyclopedia_open");
}

/** Non-fatal report so handled failures still surface in Crashlytics. */
export function recordNonFatal(message, err) {
  if (!enabled || !crashlytics) return;
  crashlytics
    .recordException({ message: `${message}: ${err?.message ?? err}` })
    .catch(() => {
      // reporting must never throw into gameplay
    });
}
