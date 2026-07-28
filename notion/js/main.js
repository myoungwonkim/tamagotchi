/**
 * Freelancer OS /notion — minimal client script
 *
 * Lemon Squeezy checkout URLs are set via data-ls-url on .ls-cta anchors.
 * Never use mailto: anywhere — it can open/close the OS mail app in a loop
 * (also remove mailto from Lemon Squeezy product HTML / confirmation email).
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
            "Set data-ls-url on this button.\n" +
            "See landing/README.md."
        );
      });
    }
  });

  var form = document.getElementById("free-mini-form");
  var note = document.getElementById("form-note");
  var submitBtn = document.getElementById("free-mini-submit");

  function showEspNote(e) {
    if (e) e.preventDefault();
    if (note) note.hidden = false;
  }

  if (form) {
    form.addEventListener("submit", showEspNote);
  }
  if (submitBtn) {
    submitBtn.addEventListener("click", showEspNote);
  }
})();
