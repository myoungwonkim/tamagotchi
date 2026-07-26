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
      // TODO: Wire Beehiiv / ConvertKit / MailerLite — until then show note
      if (note) note.hidden = false;
      var email = form.querySelector("#free-email");
      if (email && email.value) {
        var subject = encodeURIComponent("Free Mini Notion board");
        var body = encodeURIComponent(
          "Please send me the Free Mini starter board.\n\nEmail: " + email.value
        );
        // Soft fallback — does not replace ESP auto-delivery
        window.location.href =
          "mailto:hello@nolsoopgames.com?subject=" + subject + "&body=" + body;
      }
    });
  }
})();
