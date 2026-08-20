(function (global) {
  "use strict";
  var STORAGE_KEY = "nolsoop.lang";
  var STORAGE_KEY_LEGACY = "nolsoop-lang";
  var SUPPORTED = ["ko", "en", "ja"];
  var originals = {};

  function detect() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY_LEGACY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var candidates = [];
    if (navigator.languages && navigator.languages.length) {
      for (var i = 0; i < navigator.languages.length; i++) candidates.push(navigator.languages[i]);
    }
    if (navigator.language) candidates.push(navigator.language);
    for (var j = 0; j < candidates.length; j++) {
      var base = String(candidates[j] || "").toLowerCase().split("-")[0];
      if (SUPPORTED.indexOf(base) !== -1) return base;
    }
    return "ko";
  }

  function snapshot() {
    var nodes = document.querySelectorAll("[data-i18n], [data-i18n-html]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-i18n") || el.getAttribute("data-i18n-html");
      if (key && originals[key] == null) {
        originals[key] = el.hasAttribute("data-i18n-html") ? el.innerHTML : el.textContent;
      }
    }
  }

  function apply(lang, dict, meta) {
    if (SUPPORTED.indexOf(lang) === -1) lang = "ko";
    dict = dict || {};
    document.documentElement.lang = lang;
    if (meta) {
      if (meta.title) document.title = meta.title;
      var desc = document.querySelector('meta[name="description"]');
      if (desc && meta.description) desc.setAttribute("content", meta.description);
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && meta.ogTitle) ogTitle.setAttribute("content", meta.ogTitle);
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && meta.description) ogDesc.setAttribute("content", meta.description);
      var ogLocale = document.querySelector('meta[property="og:locale"]');
      if (ogLocale && meta.ogLocale) ogLocale.setAttribute("content", meta.ogLocale);
    }
    var textNodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < textNodes.length; i++) {
      var key = textNodes[i].getAttribute("data-i18n");
      if (lang === "ko" && originals[key] != null) textNodes[i].textContent = originals[key];
      else if (dict[key] != null) textNodes[i].textContent = dict[key];
    }
    var htmlNodes = document.querySelectorAll("[data-i18n-html]");
    for (var h = 0; h < htmlNodes.length; h++) {
      var hkey = htmlNodes[h].getAttribute("data-i18n-html");
      if (lang === "ko" && originals[hkey] != null) htmlNodes[h].innerHTML = originals[hkey];
      else if (dict[hkey] != null) htmlNodes[h].innerHTML = dict[hkey];
    }
    var buttons = document.querySelectorAll(".lang button");
    for (var b = 0; b < buttons.length; b++) {
      buttons[b].setAttribute("aria-pressed", buttons[b].getAttribute("data-lang") === lang ? "true" : "false");
    }
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      localStorage.setItem(STORAGE_KEY_LEGACY, lang);
    } catch (e) {}
    return lang;
  }

  function bind(dicts, metas, onChange) {
    snapshot();
    function go(lang) {
      var resolved = apply(lang, dicts && dicts[lang], metas && metas[lang]);
      if (typeof onChange === "function") onChange(resolved);
    }
    go(detect());
    var group = document.querySelector(".lang");
    if (!group) return;
    group.addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-lang]");
      if (!btn) return;
      go(btn.getAttribute("data-lang"));
    });
  }

  global.NolsoopI18n = { detect: detect, apply: apply, bind: bind, SUPPORTED: SUPPORTED };
})(typeof window !== "undefined" ? window : globalThis);
