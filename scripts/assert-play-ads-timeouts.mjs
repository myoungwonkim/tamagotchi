/**
 * Fail the Play build if AdMob timing/preload regresses to the twice-seen bug:
 * JS gives up before native load, or preload is a no-op, or sample IDs leak.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const adConfig = readFileSync(join(root, "js/adConfig.js"), "utf8");
const adsJs = readFileSync(join(root, "js/ads.js"), "utf8");
const adsAdMob = readFileSync(join(root, "js/adsAdMob.js"), "utf8");
const mainJs = readFileSync(join(root, "js/main.js"), "utf8");
const plugin = readFileSync(
  join(root, "android/app/src/main/java/com/nolsoopgames/abysspet/AbyssPetAdsPlugin.java"),
  "utf8",
);

function num(src, name) {
  const m = src.match(new RegExp(`${name}:\\s*([0-9_]+)`));
  if (!m) throw new Error(`missing ${name} in adConfig PLAY_AD_LOAD`);
  return Number(m[1].replaceAll("_", ""));
}

function javaLong(name) {
  const m = plugin.match(new RegExp(`long ${name} = ([0-9]+);`));
  if (!m) throw new Error(`missing ${name} in AbyssPetAdsPlugin`);
  return Number(m[1]);
}

const nativeLoad = num(adConfig, "nativeLoadTimeoutMs");
const nativeInit = num(adConfig, "nativeInitTimeoutMs");
const hang = num(adConfig, "jsShowHangGuardMs");
const ready = num(adConfig, "jsReadyGateMs");

const errors = [];

if (hang <= nativeLoad) {
  errors.push(`jsShowHangGuardMs (${hang}) must be > nativeLoadTimeoutMs (${nativeLoad})`);
}
if (ready < nativeInit) {
  errors.push(`jsReadyGateMs (${ready}) must be >= nativeInitTimeoutMs (${nativeInit})`);
}
if (javaLong("LOAD_TIMEOUT_MS") !== nativeLoad) {
  errors.push("Java LOAD_TIMEOUT_MS != PLAY_AD_LOAD.nativeLoadTimeoutMs");
}
if (javaLong("INIT_TIMEOUT_MS") !== nativeInit) {
  errors.push("Java INIT_TIMEOUT_MS != PLAY_AD_LOAD.nativeInitTimeoutMs");
}

if (!adsJs.includes("PLAY_AD_LOAD.jsShowHangGuardMs")) {
  errors.push("ads.js Play show gate must use PLAY_AD_LOAD.jsShowHangGuardMs (no magic 8s/25s)");
}
if (/playBoundary \? 25\s*\*\s*1000|playBoundary \? 25000|gateMs = 8000|GATE_MS = 8000|SHOW_GATE/.test(adsJs)) {
  errors.push("ads.js still has a short Play show timeout (8s/25s race)");
}
if (!adsJs.includes("usesPlayProtectAds()") || !adsJs.includes("waitForFill || usesPlayProtectAds()")) {
  errors.push("Play rewarded must wait for SDK ready (no 1s race)");
}

if (!adsAdMob.includes("preloadInterstitial(nativeOpts") && !adsAdMob.includes("preloadInterstitial(")) {
  errors.push("adsAdMob.preloadInterstitial must call the native preload");
}
if (/export async function preloadInterstitial\(\) \{\s*await init\(\);\s*\}/.test(adsAdMob)) {
  errors.push("adsAdMob.preloadInterstitial is a no-op again");
}
if (!adsAdMob.includes("showRewardedInterstitial") || !adsAdMob.includes('showNative("showRewarded"')) {
  errors.push("Play protect must fall back to regular rewarded if RI has no fill");
}
if (/UNIT_INTERSTITIAL\.includes\([\s\S]*UNIT_REWARDED/.test(adsAdMob)) {
  errors.push("do not OR sample-unit detection across slots (one sample ID must not force all to test)");
}

if (!readFileSync(join(root, "package.json"), "utf8").includes("vite build --mode play")) {
  errors.push("build:play must use --mode play so .env.play unit IDs are baked in");
}

if (plugin.includes("showing = true") && /showing = true;\s*startSdk/.test(plugin)) {
  errors.push("do not set showing=true before the ad is on screen (blocks protect during T1 load)");
}
if (!/public void initialize\(PluginCall call\) \{\s*startSdk\(/.test(plugin)) {
  errors.push("initialize() must wait for MobileAds via startSdk (do not resolve immediately)");
}
if (!mainJs.includes("preloadInterstitial()") || !mainJs.includes("preloadRewarded()")) {
  errors.push("main.js must preload interstitial and rewarded on death so T1/protect can fill");
}

if (errors.length) {
  console.error("Play ads regression checks failed:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("Play ads timeout/preload checks ok");
