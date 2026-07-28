/**
 * Freelancer OS /notion — minimal client script
 *
 * Lemon Squeezy checkout URLs are set via data-ls-url on .ls-cta anchors.
 * Never use mailto: anywhere — it can open/close the OS mail app in a loop.
 */

(function () {
  "use strict";

  var cfg = window.NOTION_LS || {};

  document.querySelectorAll(".ls-cta").forEach(function (el) {
    var product = el.getAttribute("data-product");
    var fromData = el.getAttribute("data-ls-url");
    var fromCfg = "";
    if (product === "project-tracker") fromCfg = cfg.tracker || "";
    else if (product === "freelancer-os") fromCfg = cfg.os || "";
    else if (product === "free-mini") fromCfg = cfg.freeMini || "";

    var url = (fromData && fromData.trim()) || fromCfg || "";

    if (url) {
      el.setAttribute("href", url);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    } else {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        alert(
          "Checkout link not configured yet.\n\n" +
            "Set data-ls-url on this button.\n" +
            "See landing/README.md."
        );
      });
    }
  });
})();
