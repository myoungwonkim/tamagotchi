"""Emit docs/shark-mouth-design-preview.html.

Staging preview for `assets/sprites/ui/shark.png` candidates: a screen-covering
shark maw approaching. Reference: segyu draft variant 1 (enormous head close-up),
left-gazing, 256px, lingyu workflow. Staging + preview only; no game changes.

docs/*-preview.html is .cursorignore'd, so this generator writes it via a normal
script run instead of the editor.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "shark-mouth-design-preview.html"

HTML = r"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#0a2028">
  <title>상어 습격 · 화면 뒤덮는 아가리 시안 3종 (segyu 시안1 기반)</title>
  <style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a2028;
    --text: #cfe6ec;
    --accent: #45c8dc;
    --border-subtle: #20464f;
    --pet-viewport-bg: linear-gradient(180deg, #57b4d2 0%, #3f9cbe 60%, #348fb0 100%);
    --pet-border: #6fb6d0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
    background: var(--bg);
    color: var(--text);
    padding:
      calc(22px + env(safe-area-inset-top))
      calc(14px + env(safe-area-inset-right))
      calc(48px + env(safe-area-inset-bottom))
      calc(14px + env(safe-area-inset-left));
    line-height: 1.5;
  }

  .page-head { max-width: 960px; margin: 0 auto 6px; text-align: center; }
  .page-head h1 { font-size: 1.125rem; font-weight: 700; margin-bottom: 6px; }
  .page-head p { font-size: 0.8125rem; color: #8fb4c4; max-width: 700px; margin: 0 auto; }
  .page-head strong { color: #bfe6f2; }
  .page-head code { color: #bfe6f2; background: #10303a; padding: 1px 5px; border-radius: 5px; font-size: .78em; }

  .controls {
    position: sticky; top: 0; z-index: 30;
    max-width: 960px; margin: 16px auto 22px;
    display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
    gap: 8px 10px; padding: 12px 14px;
    background: #10303a; border: 1px solid var(--border-subtle); border-radius: 12px;
  }
  .controls .lbl { font-size: 0.6875rem; color: #8fb4c4; margin: 0 2px 0 6px; }
  .controls .sep { width: 1px; height: 22px; background: #2a5260; margin: 0 4px; }
  .chip {
    font: inherit; font-size: 0.72rem; font-weight: 600;
    color: #cfe6ec; background: #17414e; border: 1px solid #2f5d6c;
    border-radius: 999px; padding: 6px 12px; cursor: pointer; -webkit-tap-highlight-color: transparent;
  }
  .chip[aria-pressed="true"] { background: #256e83; border-color: #45c8dc; color: #fff; }
  .btn {
    font: inherit; font-size: 0.78rem; font-weight: 700; color: #fff;
    background: #b5462f; border: 1px solid #d9663f; border-radius: 8px;
    padding: 8px 14px; cursor: pointer; -webkit-tap-highlight-color: transparent;
  }

  .wrap { max-width: 960px; margin: 0 auto; }

  .variant {
    background: #12313b; border: 1px solid #223f48; border-radius: 16px;
    padding: 16px 16px 18px; margin-bottom: 20px;
  }
  .v-head { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 14px; }
  .v-num {
    flex: 0 0 auto; width: 26px; height: 26px; border-radius: 8px;
    display: grid; place-items: center; font-size: 0.8rem; font-weight: 800;
    color: #04222c; background: linear-gradient(180deg,#7fe0f0,#45c8dc);
  }
  .v-title { font-size: 0.95rem; font-weight: 800; color: #eaf6fb; }
  .v-desc { font-size: 0.78rem; color: #9cc0ce; margin-top: 2px; }

  .v-body { display: flex; gap: 16px; flex-wrap: wrap; align-items: stretch; }

  .swatch { flex: 1 1 200px; max-width: 240px; display: flex; flex-direction: column; }
  .sw-stage {
    flex: 1; min-height: 200px; border-radius: 12px; border: 1px solid #26505c;
    background-color: #0c1418;
    background-image:
      linear-gradient(45deg, #16242b 25%, transparent 25%),
      linear-gradient(-45deg, #16242b 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #16242b 75%),
      linear-gradient(-45deg, transparent 75%, #16242b 75%);
    background-size: 18px 18px;
    background-position: 0 0, 0 9px, 9px -9px, -9px 0;
    display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 10px;
  }
  .sw-img {
    max-width: 96%; max-height: 190px; width: auto; height: auto;
    image-rendering: pixelated; image-rendering: crisp-edges;
  }
  .sw-cap { font-size: 0.625rem; color: #86a6b4; text-align: center; margin-top: 6px; letter-spacing: .06em; text-transform: uppercase; }

  .stage-wrap { flex: 1 1 320px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .stage {
    position: relative; width: 100%; max-width: 480px; height: 320px;
    border-radius: 14px; overflow: hidden;
    border: 2px solid var(--pet-border);
    background: var(--pet-viewport-bg);
    box-shadow: inset 0 0 44px rgba(16,74,104,0.28);
    isolation: isolate;
  }
  .stage.shake { animation: stageShake .4s ease; }
  @keyframes stageShake {
    0%,100%{transform:translate(0,0)} 20%{transform:translate(-7px,4px)} 40%{transform:translate(7px,-4px)}
    60%{transform:translate(-6px,-2px)} 80%{transform:translate(6px,2px)}
  }

  .water { position: absolute; inset: 0; z-index: 1; overflow: hidden; pointer-events: none; }
  .water span {
    position: absolute; bottom: -20px; border-radius: 50%;
    background: radial-gradient(circle at 34% 30%, rgba(255,255,255,.85), rgba(255,255,255,.2) 55%, transparent 72%);
    animation: bubbleRise linear infinite;
  }
  @keyframes bubbleRise { 0%{transform:translateY(0);opacity:0} 15%{opacity:.85} 100%{transform:translateY(-340px);opacity:0} }
  .water span:nth-child(1){left:16%;width:7px;height:7px;animation-duration:12s;animation-delay:-2s}
  .water span:nth-child(2){left:42%;width:5px;height:5px;animation-duration:9s;animation-delay:-5s}
  .water span:nth-child(3){left:70%;width:9px;height:9px;animation-duration:15s;animation-delay:-8s}
  .water span:nth-child(4){left:86%;width:6px;height:6px;animation-duration:11s;animation-delay:-3s}

  .darken {
    position: absolute; inset: 0; z-index: 3; pointer-events: none;
    background: radial-gradient(circle at 50% 42%, rgba(3,20,30,0) 0%, rgba(3,18,28,.2) 100%), linear-gradient(180deg, rgba(4,18,26,.12), rgba(2,10,16,.55));
    opacity: 0; transition: opacity .7s ease;
  }
  .stage.is-warn .darken, .stage.is-chomp .darken { opacity: 1; }

  .warn-badge {
    position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
    z-index: 9; opacity: 0;
    background: rgba(181,70,47,.92); color: #fff; font-size: .72rem; font-weight: 800;
    padding: 5px 12px; border-radius: 999px; letter-spacing: .02em;
    box-shadow: 0 3px 10px rgba(0,0,0,.4);
  }
  .stage.is-warn .warn-badge { animation: warnPulse 1s ease-in-out infinite; opacity: 1; }
  .stage.is-chomp .warn-badge { opacity: 0; }
  @keyframes warnPulse {
    0%,100% { transform: translateX(-50%) scale(1); opacity:.9; }
    50% { transform: translateX(-50%) scale(1.08); opacity:1; }
  }

  .pet {
    position: absolute; left: 50%; top: 56%; transform: translate(-50%,-50%);
    width: 64px; height: auto; z-index: 5;
    image-rendering: pixelated; image-rendering: crisp-edges;
    filter: drop-shadow(0 7px 10px rgba(6,40,62,.4));
    animation: petFloat 4.5s ease-in-out infinite;
  }
  @keyframes petFloat { 0%,100%{transform:translate(-50%,-50%)} 50%{transform:translate(-50%,calc(-50% - 8px))} }
  .stage.is-warn .pet { animation: petScared .25s ease-in-out infinite; }
  @keyframes petScared {
    0%,100%{transform:translate(-50%,-50%) rotate(-3deg)} 50%{transform:translate(-52%,-50%) rotate(3deg)}
  }
  .stage.is-chomp .pet { opacity: 0; }
  .stage.is-settle .pet { opacity: 1; transition: opacity .5s ease .2s; }

  .shark {
    position: absolute; left: 50%; top: 52%; z-index: 4; opacity: 0;
    width: 150%; height: auto;
    transform: translate(-46%,-50%) scale(0.14);
    image-rendering: pixelated; image-rendering: crisp-edges;
    filter: drop-shadow(0 8px 18px rgba(0,0,0,.5));
    will-change: transform, opacity;
  }
  .stage.is-warn .shark { animation: mawLoom var(--dur,1.6s) cubic-bezier(.42,0,.2,1) forwards; }
  @keyframes mawLoom {
    0%   { opacity: 0;   transform: translate(-46%,-50%) scale(0.14); }
    18%  { opacity: 1; }
    72%  { transform: translate(-48%,-50%) scale(0.95); opacity: 1; }
    100% { opacity: 1;   transform: translate(-50%,-50%) scale(1.35); }
  }
  .stage.is-settle .shark { opacity: 0 !important; animation: none !important; transition: opacity .6s ease; }

  .flash { position: absolute; inset: 0; z-index: 8; background: #fff; opacity: 0; pointer-events: none; }
  .stage.is-chomp .flash { animation: flashBang .4s ease; }
  @keyframes flashBang { 0%{opacity:0} 20%{opacity:.92} 100%{opacity:0} }

  .back-link { display:block; text-align:center; margin-top:30px; font-size:0.8125rem; }
  .back-link a { color:#7fb8cd; text-decoration:none; }

  @media (max-width: 640px) {
    .v-body { flex-direction: column; }
    .swatch { max-width: none; }
    .sw-stage { min-height: 170px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .pet, .water span, .shark, .stage { animation: none !important; }
    .shark { opacity: .95 !important; transform: translate(-50%,-50%) scale(1) !important; }
    .warn-badge, .flash { display: none !important; }
  }
  </style>
</head>
<body>
  <header class="page-head">
    <h1>상어 습격 · 화면 뒤덮는 아가리 시안 3종 <span style="color:#8fb4c4;font-weight:600;">(segyu 시안1 기반)</span></h1>
    <p><strong>화면을 뒤덮는 상어 입이 다가오는</strong> 연출을 위한 <code>assets/sprites/ui/shark.png</code> 후보 3종입니다. 레퍼런스는 <strong>segyu 시안1</strong>의 초대형 헤드샷 느낌, <strong>왼쪽 응시·256px·lingyu 워크플로</strong>로 제작했습니다. 왼쪽은 <strong>투명 확인용 어두운 체커보드 스와치</strong>, 오른쪽은 아가리가 작게 나타나 <strong>화면을 뒤덮으며 확대</strong>되는 습격 연출입니다. 가운데 작은 펫은 크기 비교용. <strong>스테이징만(게임 미반영)</strong>.</p>
  </header>

  <div class="controls">
    <span class="lbl">펫 테마:</span>
    <button type="button" class="chip theme-chip" data-theme="base" aria-pressed="true">🐟 심해어</button>
    <button type="button" class="chip theme-chip" data-theme="mermaid" aria-pressed="false">🧜 인어</button>
    <button type="button" class="chip theme-chip" data-theme="vent" aria-pressed="false">🌋 열수구</button>
    <span class="sep"></span>
    <button type="button" class="btn" id="play-all">▶ 전체 재생</button>
  </div>

  <div class="wrap" id="wrap"></div>

  <p class="back-link"><a href="index.html">← 시안 허브로</a></p>

  <script>
    const PET_SRC = {
      base: "../assets/sprites/adult/standard.png",
      mermaid: "../assets/sprites/mermaid/adult/standard.png",
      vent: "../assets/sprites/vent/adult/standard.png",
    };

    const VARIANTS = [
      { key: "1", title: "\uce21\uba74 \ub300\ud615 \ud5e4\ub4dc (\uc815\ub3c8\ud615)", desc: "\uc606\ubaa8\uc2b5 \uac70\ub300 \uba38\ub9ac\uac00 \uc544\uac00\ub9ac\ub97c \ubc8c\ub9b0 \ucc44 \ub2e4\uac00\uc635\ub2c8\ub2e4. \ub208\u00b7\uc544\uac00\ubbf8 \ub178\ucd9c, segyu \uc2dc\uc548\uacfc \uac00\uc7a5 \uac00\uae4c\uc6b4 \uc815\ub3c8\ud615.", img: "shark-1.png", approach: 1600 },
      { key: "2", title: "3/4 \ub3cc\uc9c4 \uc544\uac00\ub9ac",          desc: "\ube44\uc2a4\ub4ef\uc774 \ub2ec\ub824\ub4dc\ub294 \uac70\ub300 \uc544\uac00\ub9ac. \ubd89\uc740 \uc783\ubab8\u00b7\uc774\ube68\uc774 \uac15\uc870\ub41c \uac00\uc7a5 \uacf5\uaca9\uc801\uc778 \uad6c\ub3c4.", img: "shark-2.png", approach: 1500 },
      { key: "3", title: "\uc815\uba74 \ub300\ud615 \uc544\uac00\ub9ac",          desc: "\uc815\uba74 \uc544\uac00\ub9ac\uac00 \uc774\ube68 \ub9c1\uacfc \ud568\uaed8 \ud654\uba74\uc744 \ud1b5\uc9f8\ub85c \uc0bc\ud0ac \ub4ef \ud655\ub300\ub429\ub2c8\ub2e4. \uac00\uc7a5 \uc704\ud611\uc801.", img: "shark-3.png", approach: 1400 },
    ];

    const wrap = document.getElementById("wrap");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let theme = "base";

    function makeVariant(v, idx) {
      const card = document.createElement("div");
      card.className = "variant";
      card.innerHTML = `
        <div class="v-head">
          <span class="v-num">${idx + 1}</span>
          <div>
            <div class="v-title">${v.title}</div>
            <div class="v-desc">${v.desc}</div>
          </div>
        </div>
        <div class="v-body">
          <div class="swatch">
            <div class="sw-stage"><img class="sw-img" src="../assets/custom/${v.img}" alt="${v.title} 스프라이트"></div>
            <div class="sw-cap">스프라이트 (투명 QA)</div>
          </div>
          <div class="stage-wrap">
            <div class="stage" data-approach="${v.approach}" style="--dur:${(v.approach / 1000).toFixed(2)}s">
              <div class="water"><span></span><span></span><span></span><span></span></div>
              <div class="darken"></div>
              <img class="shark" src="../assets/custom/${v.img}" alt="">
              <div class="warn-badge">⚠ 무언가 다가온다…</div>
              <img class="pet" src="${PET_SRC[theme]}" alt="비교용 펫">
              <div class="flash"></div>
            </div>
            <button type="button" class="btn replay">▶ 재생</button>
          </div>
        </div>`;
      const stage = card.querySelector(".stage");
      card.querySelector(".replay").addEventListener("click", () => play(stage));
      return card;
    }

    function reset(stage) {
      if (stage._timers) stage._timers.forEach(clearTimeout);
      stage._timers = [];
      stage.classList.remove("is-warn", "is-chomp", "is-settle", "shake");
    }

    function play(stage) {
      if (reduceMotion) return;
      reset(stage);
      void stage.offsetWidth;
      const approach = +stage.dataset.approach || 1500;
      stage.classList.add("is-warn");
      stage._timers.push(setTimeout(() => stage.classList.add("is-chomp", "shake"), approach));
      stage._timers.push(setTimeout(() => stage.classList.remove("shake"), approach + 430));
      stage._timers.push(setTimeout(() => {
        stage.classList.remove("is-warn", "is-chomp");
        stage.classList.add("is-settle");
      }, approach + 1300));
    }

    function setTheme(t) {
      theme = t;
      document.querySelectorAll(".theme-chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.theme === t)));
      document.querySelectorAll(".pet").forEach((p) => { p.src = PET_SRC[t]; });
    }

    VARIANTS.forEach((v, i) => wrap.append(makeVariant(v, i)));

    document.querySelectorAll(".theme-chip").forEach((c) => c.addEventListener("click", () => setTheme(c.dataset.theme)));
    document.getElementById("play-all").addEventListener("click", () => document.querySelectorAll(".stage").forEach(play));

    if (!reduceMotion && "IntersectionObserver" in window) {
      const seen = new WeakSet();
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !seen.has(e.target)) { seen.add(e.target); play(e.target); }
        });
      }, { threshold: 0.55 });
      document.querySelectorAll(".stage").forEach((s) => io.observe(s));
    }
  </script>
</body>
</html>
"""


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(HTML, encoding="utf-8")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
