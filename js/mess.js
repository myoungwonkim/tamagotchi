import { isSpritesEnabled, SPRITE_BASE, preloadSpriteMeta } from "./sprites.js";

/** 청결 이 값 미만일 때 더러움 오브젝트가 단계별로 나타남 */
export const MESS_THRESHOLD = 70;
/** threshold 아래로 이 간격마다 오브젝트 1개 추가 */
export const MESS_STEP = 12;
export const MAX_MESS = 5;

/** 스프라이트 박스 가장자리 밖 간격 */
const MESS_EDGE_GAP_CM = 0.5;

const CM_TO_PX_FALLBACK = 96 / 2.54;

const MESS_ITEM_HALF_FALLBACK_PX = 22;

let cmProbe;

const MESS_TYPES = [
  { id: "poop", emoji: "💩", label: "배변물" },
  { id: "fly", emoji: "🪰", label: "파리" },
];

/** 0° = 오른쪽, 시계 방향(화면 Y축) — 펫 아래·옆에 붙도록 */
const MESS_SLOTS = [
  { angleDeg: 110, rotate: -14 },
  { angleDeg: 70, rotate: 10 },
  { angleDeg: 130, rotate: 6 },
  { angleDeg: 50, rotate: -8 },
  { angleDeg: 90, rotate: 0 },
];

let pendingSync = 0;
let layoutRetries = 0;
let resizeObserver;

function getAppVersion() {
  return document.querySelector('meta[name="app-version"]')?.content || "";
}

/** 배변물·파리는 PNG만 존재 — spriteFormat(svg)와 무관 */
function getMessSpriteUrl(id) {
  const base = `${SPRITE_BASE}/ui/${id}.png`;
  const v = getAppVersion();
  const bust = `m=1`;
  return v ? `${base}?v=${v}&${bust}` : `${base}?${bust}`;
}

export function getMessCount(cleanliness) {
  if (cleanliness >= MESS_THRESHOLD) return 0;
  return Math.min(MAX_MESS, Math.ceil((MESS_THRESHOLD - cleanliness) / MESS_STEP));
}

function resolveMessAnchor(anchorRootEl) {
  if (!anchorRootEl) return null;

  const img = anchorRootEl.querySelector("img.pet-evolution-img:not([hidden])");
  if (img) {
    const rect = img.getBoundingClientRect();
    if (rect.width > 1 && rect.height > 1) return img;
  }

  const fallback = anchorRootEl.querySelector(
    ".pet-evolution-fallback, .pet-sprite-fallback:not([hidden])",
  );
  if (fallback) {
    const rect = fallback.getBoundingClientRect();
    if (rect.width > 1 && rect.height > 1) return fallback;
  }

  const rootRect = anchorRootEl.getBoundingClientRect();
  return rootRect.width > 1 && rootRect.height > 1 ? anchorRootEl : null;
}

function cmToPx(cm) {
  if (!cmProbe) {
    cmProbe = document.createElement("div");
    cmProbe.style.cssText =
      "position:absolute;visibility:hidden;width:1cm;height:1cm;pointer-events:none";
    document.body.append(cmProbe);
  }
  const unit = cmProbe.getBoundingClientRect().width;
  return (unit > 0 ? unit : CM_TO_PX_FALLBACK) * cm;
}

function getMessOrbitRadius(anchorEl, _anchorRootEl, messHalf) {
  const rect = anchorEl.getBoundingClientRect();
  const anchorHalf = Math.max(rect.width, rect.height) / 2;
  return anchorHalf + messHalf + cmToPx(MESS_EDGE_GAP_CM);
}

function clampMessPoint(x, y, layerEl, messHalf) {
  const pad = messHalf + 4;
  const w = layerEl.clientWidth;
  const h = layerEl.clientHeight;
  if (w < pad * 2 || h < pad * 2) return { x, y };
  return {
    x: Math.min(Math.max(x, pad), w - pad),
    y: Math.min(Math.max(y, pad), h - pad),
  };
}

function positionMessItem(item, slotIndex, anchorEl, anchorRootEl, layerEl) {
  if (!item || !anchorEl || !layerEl) return false;

  const slot = MESS_SLOTS[slotIndex % MESS_SLOTS.length];
  const anchor = anchorEl.getBoundingClientRect();
  const layer = layerEl.getBoundingClientRect();

  if (anchor.width < 1 || anchor.height < 1 || layer.width < 1) return false;

  const cx = anchor.left + anchor.width / 2 - layer.left;
  const cy = anchor.top + anchor.height / 2 - layer.top;
  const measuredHalf = item.getBoundingClientRect().width / 2;
  const messHalf = measuredHalf > 0 ? measuredHalf : MESS_ITEM_HALF_FALLBACK_PX;
  const clampHalf = Math.max(messHalf, MESS_ITEM_HALF_FALLBACK_PX);
  const radius = getMessOrbitRadius(anchorEl, anchorRootEl, messHalf);
  const rad = (slot.angleDeg * Math.PI) / 180;
  const rawX = cx + Math.cos(rad) * radius;
  const rawY = cy + Math.sin(rad) * radius;
  const { x, y } = clampMessPoint(rawX, rawY, layerEl, clampHalf);

  item.style.left = `${x}px`;
  item.style.top = `${y}px`;
  item.style.setProperty("--mess-rotate", `${slot.rotate}deg`);
  item.dataset.slotIndex = String(slotIndex);
  return true;
}

function ensureMessFallback(item, type) {
  let fallback = item.querySelector(".mess-item__fallback");
  if (!fallback) {
    fallback = document.createElement("span");
    fallback.className = "mess-item__fallback";
    fallback.textContent = type.emoji;
    item.append(fallback);
  }
  return fallback;
}

function showMessFallback(item, type) {
  const img = item.querySelector("img.mess-item__img");
  if (img) {
    img.removeAttribute("src");
    img.hidden = true;
  }
  const fallback = ensureMessFallback(item, type);
  fallback.hidden = false;
}

function bindMessImg(item, img, type, slotIndex, anchorRootEl, layerEl) {
  if (img.dataset.bound === "1") return;
  img.dataset.bound = "1";

  const fallback = ensureMessFallback(item, type);
  fallback.hidden = true;

  const reposition = () => {
    const anchor = resolveMessAnchor(anchorRootEl);
    if (anchor) positionMessItem(item, slotIndex, anchor, anchorRootEl, layerEl);
  };

  const onError = () => {
    if (!img.dataset.retryBust) {
      img.dataset.retryBust = "1";
      img.src = `${getMessSpriteUrl(type.id)}&_r=${Date.now()}`;
      return;
    }
    showMessFallback(item, type);
    reposition();
  };

  const onLoad = () => {
    img.hidden = false;
    fallback.hidden = true;
    reposition();
  };

  img.onerror = onError;
  img.onload = onLoad;

  if (img.complete) {
    if (img.naturalWidth > 0) onLoad();
    else onError();
  }
}

function createMessItem(index) {
  const type = MESS_TYPES[index % MESS_TYPES.length];
  const item = document.createElement("span");
  item.className = "mess-item mess-item--appear";
  item.setAttribute("aria-hidden", "true");
  item.dataset.messType = type.id;
  item.dataset.slotIndex = String(index);

  if (isSpritesEnabled()) {
    const img = document.createElement("img");
    img.className = "mess-item__img";
    img.alt = type.label;
    img.draggable = false;
    const fallback = ensureMessFallback(item, type);
    fallback.hidden = true;
    item.append(img, fallback);
    img.src = getMessSpriteUrl(type.id);
    preloadSpriteMeta({ src: img.src });
  } else {
    showMessFallback(item, type);
  }

  item.addEventListener(
    "animationend",
    () => item.classList.remove("mess-item--appear"),
    { once: true },
  );
  return item;
}

function needsMessSpriteUpgrade(item) {
  if (!isSpritesEnabled()) return false;
  const fallback = item.querySelector(".mess-item__fallback");
  if (fallback && !fallback.hidden) return true;
  const img = item.querySelector("img.mess-item__img");
  if (!img) return true;
  if (img.complete && img.naturalWidth === 0) return true;
  return false;
}

function removeMessItem(item) {
  if (!item) return;
  item.classList.add("mess-item--remove");
  const onEnd = () => {
    item.removeEventListener("animationend", onEnd);
    item.remove();
  };
  item.addEventListener("animationend", onEnd);
}

function repositionAllMessItems(layerEl, anchorEl, anchorRootEl) {
  const items = [...layerEl.querySelectorAll(".mess-item:not(.mess-item--remove)")];
  items.forEach((item, i) => {
    const slotIndex = Number(item.dataset.slotIndex);
    positionMessItem(
      item,
      Number.isFinite(slotIndex) ? slotIndex : i,
      anchorEl,
      anchorRootEl,
      layerEl,
    );
  });
}

function bindAnchorResize(anchorRootEl, layerEl) {
  if (!anchorRootEl || typeof ResizeObserver === "undefined") return;

  if (!resizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      if (!layerEl?.isConnected) return;
      const anchor = resolveMessAnchor(anchorRootEl);
      if (!anchor) return;
      repositionAllMessItems(layerEl, anchor, anchorRootEl);
    });
  }

  resizeObserver.disconnect();
  resizeObserver.observe(anchorRootEl);
  const img = anchorRootEl.querySelector("img.pet-evolution-img");
  if (img) resizeObserver.observe(img);
}

function bindPetSpriteLoad(anchorRootEl, layerEl) {
  const img = anchorRootEl?.querySelector("img.pet-evolution-img");
  if (!img) return;

  const onReady = () => {
    const anchor = resolveMessAnchor(anchorRootEl);
    if (anchor) repositionAllMessItems(layerEl, anchor, anchorRootEl);
  };

  if (img.complete) {
    onReady();
    return;
  }

  img.addEventListener("load", onReady, { once: true });
}

function appendMessItem(layerEl, index, anchorRootEl) {
  const item = createMessItem(index);
  layerEl.append(item);

  const img = item.querySelector("img.mess-item__img");
  if (img) {
    bindMessImg(item, img, MESS_TYPES[index % MESS_TYPES.length], index, anchorRootEl, layerEl);
  }

  const anchor = resolveMessAnchor(anchorRootEl);
  if (anchor) {
    positionMessItem(item, index, anchor, anchorRootEl, layerEl);
  }

  return item;
}

/** 청결 수치에 맞춰 더러움 오브젝트 개수·위치를 동기화 */
export function syncMessLayer(layerEl, cleanliness, anchorRootEl) {
  if (!layerEl) return;

  const target = getMessCount(cleanliness);
  let items = [...layerEl.querySelectorAll(".mess-item:not(.mess-item--remove)")];

  if (target > 0 && items.some(needsMessSpriteUpgrade)) {
    layerEl.replaceChildren();
    items = [];
  }

  while (items.length < target) {
    appendMessItem(layerEl, items.length, anchorRootEl);
    items = [...layerEl.querySelectorAll(".mess-item:not(.mess-item--remove)")];
  }

  while (items.length > target) {
    removeMessItem(items[items.length - 1]);
    items = [...layerEl.querySelectorAll(".mess-item:not(.mess-item--remove)")];
  }

  const anchorEl = resolveMessAnchor(anchorRootEl);

  if (!anchorEl && target > 0 && layoutRetries < 10) {
    layoutRetries += 1;
    scheduleMessLayer(layerEl, cleanliness, anchorRootEl);
    return;
  }

  if (anchorEl && target > 0) {
    layoutRetries = 0;
    repositionAllMessItems(layerEl, anchorEl, anchorRootEl);
    bindAnchorResize(anchorRootEl, layerEl);
    bindPetSpriteLoad(anchorRootEl, layerEl);
  } else if (target === 0) {
    layoutRetries = 0;
  }
}

/** 레이아웃·스프라이트 로드 후 위치 재계산 */
export function scheduleMessLayer(layerEl, cleanliness, anchorRootEl) {
  if (pendingSync) cancelAnimationFrame(pendingSync);

  pendingSync = requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      pendingSync = 0;
      syncMessLayer(layerEl, cleanliness, anchorRootEl);
    });
  });
}

export function clearMessLayer(layerEl) {
  if (!layerEl) return;
  layerEl.replaceChildren();
  layoutRetries = 0;
  resizeObserver?.disconnect();
}

export function preloadMessSprites() {
  if (!isSpritesEnabled()) return;
  for (const type of MESS_TYPES) {
    preloadSpriteMeta({ src: getMessSpriteUrl(type.id) });
  }
}
