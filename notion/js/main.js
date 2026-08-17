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

  function initPreviewSlider(root) {
    var track = root.querySelector(".preview-track");
    var slides = root.querySelectorAll(".preview-shot");
    var prev = root.querySelector(".preview-prev");
    var next = root.querySelector(".preview-next");
    var indexEl = root.querySelector("[data-preview-index]");
    var totalEl = root.querySelector("[data-preview-total]");
    if (!track || !slides.length) return;

    var total = slides.length;
    if (totalEl) totalEl.textContent = String(total);

    function currentIndex() {
      var w = track.clientWidth || 1;
      return Math.round(track.scrollLeft / w);
    }

    function goTo(i) {
      var max = total - 1;
      var nextIndex = Math.max(0, Math.min(max, i));
      track.scrollTo({
        left: nextIndex * track.clientWidth,
        behavior: "smooth",
      });
      update(nextIndex);
    }

    function update(i) {
      if (typeof i !== "number") i = currentIndex();
      if (indexEl) indexEl.textContent = String(i + 1);
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= total - 1;
    }

    if (prev) {
      prev.addEventListener("click", function () {
        goTo(currentIndex() - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        goTo(currentIndex() + 1);
      });
    }

    var scrollTimer = null;
    track.addEventListener("scroll", function () {
      if (scrollTimer) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(function () {
        update();
      }, 60);
    });

    window.addEventListener("resize", function () {
      var i = currentIndex();
      track.scrollLeft = i * track.clientWidth;
      update(i);
    });

    update(0);
  }

  document.querySelectorAll("[data-preview-slider]").forEach(initPreviewSlider);
})();
