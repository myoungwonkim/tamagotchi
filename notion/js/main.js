/**
 * Freelancer OS /notion — minimal client script
 *
 * Env-style placeholders (set when LS / ESP are ready):
 *   window.NOTION_LS = {
 *     tracker: "https://YOURSTORE.lemonsqueezy.com/checkout/buy/VARIANT_ID",
 *     os:      "https://YOURSTORE.lemonsqueezy.com/checkout/buy/VARIANT_ID"
 *   };
 * Or set data-ls-url on each .ls-cta anchor in index.html.
 */

(function () {
  "use strict";

  var cfg = window.NOTION_LS || {};

  document.querySelectorAll(".ls-cta").forEach(function (el) {
    var product = el.getAttribute("data-product");
    var fromData = el.getAttribute("data-ls-url");
    var fromCfg =
      product === "project-tracker"
        ? cfg.tracker
        : product === "freelancer-os"
          ? cfg.os
          : "";
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
            "Set data-ls-url on this button, or window.NOTION_LS via a small inline script.\n" +
            "See landing/README.md."
        );
      });
    }
  });

  var form = document.getElementById("free-mini-form");
  var note = document.getElementById("form-note");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Do NOT auto-open mailto — that can spam the mail client (open/close loop).
      // TODO: Wire Beehiiv / ConvertKit / MailerLite. Until then, show note + manual link.
      if (note) note.hidden = false;
    });
  }
})();
