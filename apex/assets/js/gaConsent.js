/**
 * Consent Mode v2 defaults + GA4 bootstrap helper.
 *
 * GA4 (this repo / abysspet + apex landing): G-VZ2DXER02Y
 * GA4 (bazi-web, other repo): G-ZZE20NFCE9 — do not use here
 *
 * EEA/UK/CH: analytics + ads storage denied until a CMP grants consent.
 * Other regions: granted (no banner required for current traffic mix).
 *
 * Usage (before loading gtag.js):
 *   NolsoopConsent.bootstrap('G-VZ2DXER02Y');
 */
(function (global) {
  "use strict";

  var EEA_UK_CH = [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
    "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
    "SE", "IS", "LI", "NO", "GB", "CH"
  ];

  function ensureGtag() {
    global.dataLayer = global.dataLayer || [];
    if (typeof global.gtag !== "function") {
      global.gtag = function gtag() {
        global.dataLayer.push(arguments);
      };
    }
    return global.gtag;
  }

  function applyConsentDefaults(gtag) {
    // Worldwide default: denied (EEA/UK/CH and unknown regions stay here
    // until a CMP calls NolsoopConsent.grantAll()).
    gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "granted",
      security_storage: "granted",
      wait_for_update: 500
    });
    // Primary audiences (KR/JP + common non-EEA): grant without a banner.
    gtag("consent", "default", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
      region: ["KR", "JP", "US", "CA", "AU", "NZ", "SG", "TW", "HK", "MY", "TH", "VN", "ID", "PH", "IN"]
    });
  }

  function loadGtagJs(measurementId) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    document.head.appendChild(s);
  }

  function bootstrap(measurementId, options) {
    if (!measurementId) return;
    var opts = options || {};
    var gtag = ensureGtag();
    applyConsentDefaults(gtag);
    if (opts.loadScript !== false) loadGtagJs(measurementId);
    gtag("js", new Date());
    gtag("config", measurementId, opts.config || {});
  }

  /** Call after a future CMP “Accept” on EEA (no UI yet). */
  function grantAll() {
    var gtag = ensureGtag();
    gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted"
    });
  }

  global.NolsoopConsent = {
    MEASUREMENT_ABYSSPET: "G-VZ2DXER02Y",
    MEASUREMENT_BAZI_DO_NOT_USE_HERE: "G-ZZE20NFCE9",
    bootstrap: bootstrap,
    grantAll: grantAll,
    EEA_UK_CH: EEA_UK_CH
  };
})(typeof window !== "undefined" ? window : globalThis);
