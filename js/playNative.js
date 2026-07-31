/**
 * Capacitor Android shell helpers: back button, status bar.
 */
import { getPlatform } from "./platformEnv.js";

function isOverlayOpen(el) {
  return Boolean(el && !el.hidden);
}

/** Close the topmost visible overlay; returns true if one was closed. */
export function dismissTopOverlay() {
  const encyclopediaDetail = document.getElementById("encyclopedia-detail");
  if (encyclopediaDetail && !encyclopediaDetail.hidden) {
    const back = document.getElementById("btn-encyclopedia-detail-back");
    if (back) {
      back.click();
      return true;
    }
  }

  const encyclopedia = document.getElementById("encyclopedia-overlay");
  if (isOverlayOpen(encyclopedia)) {
    encyclopedia.hidden = true;
    return true;
  }

  const graduate = document.getElementById("graduate-overlay");
  if (isOverlayOpen(graduate)) {
    const cancel = document.getElementById("btn-graduate-cancel");
    if (cancel) {
      cancel.click();
      return true;
    }
    graduate.hidden = true;
    return true;
  }

  // name / game-over: do not auto-dismiss (require explicit action)
  return false;
}

export async function initPlayNative() {
  if (getPlatform() !== "play") return;

  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (dismissTopOverlay()) return;
      if (canGoBack) {
        window.history.back();
        return;
      }
      const ok = window.confirm("어비스펫을 종료할까요?");
      if (ok) App.exitApp();
    });
  } catch (err) {
    console.warn("[playNative] App plugin unavailable", err);
  }

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0a2028" });
  } catch {
    // optional
  }
}
