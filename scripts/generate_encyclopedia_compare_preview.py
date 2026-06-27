#!/usr/bin/env python3
"""Staging: mermaid encyclopedia flavor text + deepsea vs mermaid compare page. Game not touched."""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STAGING = ROOT / ".sprite-staging-mermaid"
OUT_HTML = STAGING / "preview-encyclopedia-compare.html"
OUT_JSON = STAGING / "encyclopedia-mermaid-descriptions.json"

# Current game deep-sea text (encyclopedia.js) — copied for compare only
DEEPSEA_DESCRIPTIONS = {
    "golden": (
        "{name}의 등에는 영원히 꺼지지 않는 할로겐이 붙어 있어요. 심해 한가운데서도 길을 잃지 않지만, "
        "가끔 지나가던 물고기 눈을 멀게 합니다. 밤마다 등불을 켜 두는 이유는 '어둠이 무서워서'라고 주장하지만, "
        "사실은 지나가는 친구에게 인사하려는 것뿐이에요. 전기세는 주인 몫입니다."
    ),
    "fluffy": (
        "{name}은 달빛을 먹고 자란다고 해요. 몸이 반투명해서 속이 비치는데, 그 안에는 어제 먹은 플랑크톤과 "
        "어제의 비밀이 둥둥 떠다닙니다. 기분이 좋으면 빛나고, 기분이 나쁘면 더 빛나요. 구분법은 없습니다. "
        "그냥 항상 빛납니다."
    ),
    "sparkle": (
        "{name}이 기분이 좋으면 몸 전체가 깜빡여요. 파티 조명 대신 쓰기 좋지만, 밤에 재우려면 먼저 눈을 가려야 "
        "할지도 모릅니다. 깜빡임 패턴은 모스 부호처럼 보이는데, 해독하면 대부분 '밥 줘'입니다. "
        "가끔 '놀아줘'도 섞여 있어요."
    ),
    "standard": (
        "{name}은 산호초 옆에서 평범하게 살아요. 특별한 능력은 없지만, 물고기 친구들 사이에서 가장 무난한 "
        "인사를 건넵니다. '별일 없음'이 최대 특기이고, 분노 임계값은 매우 높습니다. 한번 화내면 산호초도 "
        "조용해진다는 소문이 있지만, 아무도 본 적 없어요."
    ),
    "farm": (
        "{name}의 지느러미 사이사이에 해조류가 자라요. 스스로 키운 채소를 먹는다고 주장하지만, 사실은 그냥 "
        "안 빗겨 주는 겁니다. 수확 시기마다 몸이 무거워져 헤엄치기 귀찮아하고, 그때가 바로 '채소 다이어트'를 "
        "시작하는 때예요. 다음 날 또 자랍니다."
    ),
    "plain": (
        "{name}은 진흙과 한 몸이 된 지 오래예요. 색이 바닥이랑 똑같아서 찾기 어렵지만, 발밑에서 '안녕' 하고 "
        "손을 흔듭니다. 숨바꼭질 대회에서 항상 우승하지만, 상장은 받은 적 없어요. 심사위원이 {name}을 못 "
        "찾거든요."
    ),
    "scruffy": (
        "{name}은 바닷속 냉장고에서 3년을 보냈어요. 냄새는 나지만 정이 많고, 지나가던 가오리에게도 먼저 "
        "인사를 건넵니다. '유통기한'이라는 말을 들으면 잠깐 슬퍼하다가, 곧 '그래도 맛있었지'라고 말합니다. "
        "주변 생물들은 의견이 갈립니다."
    ),
    "grumpy": (
        "{name}의 송곳니는 생각보다 부드러워요. 표정만 험악할 뿐, 사실은 쓰다듬어 달라고 입을 벌리고 "
        "기다립니다. 첫인상은 '물리면 안 됨'이지만, 실제로 물린 적 있는 생물은 아직 없어요. 대신 눈빛으로 "
        "협박은 자주 합니다."
    ),
    "sickly": (
        "{name} 몸에 기생충이 살지만 이름표를 달고 다녀요. 주인은 기생충이고, 기생충이 진짜 주인인지는 아직 "
        "논쟁 중입니다. {name}은 '함께 사는 룸메이트'라고 부르고, 기생충은 '월세 미납'이라고 주장합니다. "
        "매달 조용히 틈틈이 밥을 먹어 치웁니다."
    ),
}

# New mermaid-only flavor text (tier concept characters)
MERMAID_DESCRIPTIONS = {
    "golden": (
        "{name}의 장미 티아라는 매일 아침 닦아야 빛이 나요. 분홍 가운과 장미빛 꼬리는 우아하지만, 꼬리에 "
        "박힌 진주 점은 헤엄칠 때마다 하나씩 떨어집니다. {name}은 '의도한 장식'이라고 하고, 주운 갈매기는 "
        "대답하지 않아요. 그래도 미소는 공주 교과서에서 베낀 것처럼 정확합니다."
    ),
    "fluffy": (
        "{name}은 은빛 달 망토를 두른 왕자예요. 망토 끝이 물살에 닿으면 조금씩 밀려 오르는데, 그때마다 "
        "은발을 넘기며 '밀려도 괜찮다'고 중얼거립니다. 초승달 관은 밤에만 빛나고 낮엔 살짝 기울어져 있어요. "
        "이웃 고래는 노래 소리가 좋다고 하면서도 이불을 뒤집어 씁니다."
    ),
    "sparkle": (
        "{name}의 보랏빛 꼬리에는 청록 별 점이 박혀 있어요. 기분이 좋으면 별이 반짝이고, 졸리면 하나씩 "
        "꺼집니다. 어느 날 천문 애호가가 '새 성좌' 사진을 올렸을 때 당황한 건 {name}뿐이었습니다. "
        "사실 별 점의 절반은 '간식 줘'를 뜻하는 신호였어요."
    ),
    "standard": (
        "{name}은 태양 클립 때문에 오른쪽 머리만 살짝 탔어요. 줄무늬 탑과 산호빛 꼬리로 인사하면 바닷가 "
        "풍경이 한 장 더 늘어난 기분입니다. 파도가 세면 꼬리보다 포니테일을 먼저 감추지만, 웃는 건 포기하지 "
        "않아요. '평범한 해변 소녀'가 최고의 칭찬이라고 합니다."
    ),
    "farm": (
        "{name}은 낡은 항구 모자를 절대 벗지 않아요. 모자 안에는 젖은 엽전과 사탕이 함께 살고, 주황 "
        "바람막이 주머니에는 어느 부두 열쇠인지 모르는 열쇠가 들어 있습니다. 해초록 꼬리로 헤엄칠 때는 "
        "물고기인데, 부두에 올라서면 갑자기 사람 같아 보여요. {name}도 그 차이를 설명하긴 어렵다고 합니다."
    ),
    "plain": (
        "{name}은 머스타드 가디건과 잿빛 꼬리가 잘 어울리는 비 오는 날 전문가예요. 땋은 머리 끝에서 가끔 "
        "빗방울 픽셀이 떨어지는데, 맑은 날엔 '오늘은 안 왔네' 하고 살짝 실망합니다. 우산은 없지만 "
        "가디건이 비를 대신 맞아 준다고 믿고 있어요. 믿음의 문제입니다."
    ),
    "scruffy": (
        "{name}은 위는 평범한 회색 물고기인데 아래는 청바지와 운동화예요. 헤엄치다가 갑자기 걸으면 "
        "친구들이 '어디 산책 갔다 왔어?'라고 물어봅니다. 한쪽 눈을 감은 건 위협이 아니라 길이 "
        "헷갈려서라고 주장해요. 바지 밑단이 젖어 있으면 그날은 기분이 좋습니다."
    ),
    "grumpy": (
        "{name}의 물고기 얼굴은 항상 입을 벌리고 있어요. 이빨이 보이면 화난 줄 알지만, 사실은 바닷물 "
        "온도를 확인하는 중입니다. 사람 다리로 걸을 때마다 구두 밑창에 조개가 끼면 표정이 조금 "
        "부드러워져요. 첫인상은 험하지만, 쓰다듬어 달라고 기다리는 시간이 더 깁니다."
    ),
    "sickly": (
        "{name}은 은빛 반점이 있는 물고기 상체와 창백한 사람 다리를 가졌어요. 거울 앞에 서면 어색해서 "
        "피하지만, 거울 없는 날엔 오히려 제일 활발합니다. 한쪽 눈이 비어 보이는 건 무서운 게 아니라 "
        "'오늘은 여기까지 쉴게요'라는 신호래요. 발끝까지 신발을 신는 성실함은 인정받고 있습니다."
    ),
}

VARIANTS = [
    ("golden", "pretty", "등불어", "진주 인어", "장미 진주 공주"),
    ("fluffy", "pretty", "달빛 해파리", "달빛 실크 인어", "은빛 달 왕자"),
    ("sparkle", "pretty", "발광 오징어", "별빛 인어", "성좌 공주"),
    ("standard", "normal", "산호어", "산호 인어", "해변 소녀"),
    ("farm", "normal", "해조어", "해초 인어", "항구 소년"),
    ("plain", "normal", "진흙어", "늪 인어", "비 오는 날 소녀"),
    ("scruffy", "defective", "썩은 아귀", "헝클 어인", "회색 물고기 상체 + 다리·발"),
    ("grumpy", "defective", "송곳니어", "투성 어인", "푸른 물고기 상체 + 다리·발"),
    ("sickly", "defective", "기생어", "반점 어인", "은빛 물고기 상체 + 다리·발"),
]

TIER_KO = {
    "pretty": ("pretty · 빛나는", "공주/왕자 상체 + 물고기 꼬리"),
    "normal": ("normal · 보통", "일반인 상체 + 물고기 꼬리"),
    "defective": ("defective · 뒤집힌", "일반 물고기 상체 + 사람 다리·발"),
}

SAMPLE_NAME = "마린"


def sample(text: str) -> str:
    return text.replace("{name}", SAMPLE_NAME)


def esc(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def variant_card(vid, tier, ds_label, mm_label, concept):
    ds_desc = sample(DEEPSEA_DESCRIPTIONS[vid])
    mm_desc = sample(MERMAID_DESCRIPTIONS[vid])
    return f"""    <article class="variant" data-tier="{tier}">
      <header class="variant__head">
        <div class="variant__sprites">
          <figure>
            <img src="../assets/sprites/adult/{vid}.png" width="64" height="64" alt="">
            <figcaption>심해어</figcaption>
          </figure>
          <figure class="variant__sprites--mermaid">
            <img src="tier-concept/adult/{vid}.png" width="64" height="64" alt="">
            <figcaption>인어 시안</figcaption>
          </figure>
        </div>
        <div class="variant__titles">
          <h3><span class="tag tag--{tier}">{tier}</span></h3>
          <p class="names"><span class="deepsea-name">{esc(ds_label)}</span> ↔ <span class="mermaid-name">{esc(mm_label)}</span></p>
          <p class="concept">{esc(concept)}</p>
        </div>
      </header>
      <div class="compare-cols">
        <section class="col col--deepsea">
          <h4>🐟 심해어 도감</h4>
          <p>{esc(ds_desc)}</p>
        </section>
        <section class="col col--mermaid">
          <h4>🧜 인어 도감 <span class="new">NEW</span></h4>
          <p>{esc(mm_desc)}</p>
        </section>
      </div>
    </article>"""


def build_sections():
    blocks = []
    for tier in ("pretty", "normal", "defective"):
        title, sub = TIER_KO[tier]
        cards = [
            variant_card(vid, tier, ds, mm, concept)
            for vid, t, ds, mm, concept in VARIANTS
            if t == tier
        ]
        blocks.append(
            f"""  <section class="tier-block" id="tier-{tier}">
    <h2>{title}</h2>
    <p class="tier-sub">{sub}</p>
{chr(10).join(cards)}
  </section>"""
        )
    return "\n".join(blocks)


def build_html() -> str:
    sections = build_sections()
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>도감 설명 비교 — 심해어 vs 인어</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0c1426;
      color: #e3f2fd;
      padding: 20px 14px 48px;
      line-height: 1.55;
    }}
    .wrap {{ max-width: 920px; margin: 0 auto; }}
    h1 {{ font-size: 18px; color: #00e5ff; margin-bottom: 6px; }}
    .lead {{ font-size: 12px; color: #78909c; margin-bottom: 16px; }}
    .nav {{
      display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;
    }}
    .nav a {{
      font-size: 11px; color: #90caf9; text-decoration: none;
      padding: 6px 10px; border: 1px solid #1e3a5f; border-radius: 4px;
    }}
    .nav a:hover {{ border-color: #00e5ff; color: #00e5ff; }}
    .notice {{
      background: #152238; border: 1px solid #1e3a5f; border-radius: 6px;
      padding: 12px 14px; font-size: 11px; color: #b0bec5; margin-bottom: 20px;
    }}
    .notice strong {{ color: #ffd54f; }}
    .tier-block {{ margin-bottom: 28px; }}
    .tier-block h2 {{
      font-size: 14px; color: #ffd54f; margin-bottom: 4px;
      border-bottom: 1px solid #1e3a5f; padding-bottom: 8px;
    }}
    .tier-sub {{ font-size: 11px; color: #80cbc4; margin-bottom: 12px; }}
    .variant {{
      background: #152238; border: 1px solid #1e3a5f; border-radius: 8px;
      padding: 14px; margin-bottom: 12px;
    }}
    .variant__head {{
      display: flex; gap: 14px; align-items: flex-start; margin-bottom: 12px;
      flex-wrap: wrap;
    }}
    .variant__sprites {{ display: flex; gap: 12px; }}
    .variant__sprites figure {{ text-align: center; }}
    .variant__sprites img {{
      image-rendering: pixelated; background: #0a1020; border-radius: 4px;
      display: block;
    }}
    .variant__sprites figcaption {{ font-size: 9px; color: #78909c; margin-top: 4px; }}
    .variant__sprites--mermaid img {{ outline: 2px solid #00e5ff; }}
    .variant__sprites--mermaid figcaption {{ color: #00e5ff; }}
    .tag {{
      display: inline-block; font-size: 9px; font-weight: 700;
      padding: 2px 6px; border-radius: 3px; text-transform: uppercase;
    }}
    .tag--pretty {{ background: #4a148c; color: #e1bee7; }}
    .tag--normal {{ background: #1b5e20; color: #c8e6c9; }}
    .tag--defective {{ background: #4e342e; color: #ffccbc; }}
    .names {{ font-size: 13px; font-weight: 600; margin: 6px 0 2px; }}
    .deepsea-name {{ color: #ffab91; }}
    .mermaid-name {{ color: #80deea; }}
    .concept {{ font-size: 10px; color: #78909c; }}
    .compare-cols {{
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    }}
    @media (max-width: 640px) {{
      .compare-cols {{ grid-template-columns: 1fr; }}
    }}
    .col {{
      border-radius: 6px; padding: 12px; font-size: 12px;
    }}
    .col h4 {{ font-size: 11px; margin-bottom: 8px; font-weight: 700; }}
    .col--deepsea {{ background: #1a1208; border: 1px solid #4e342e; }}
    .col--deepsea h4 {{ color: #ffab91; }}
    .col--mermaid {{ background: #0d1f2d; border: 1px solid #006064; }}
    .col--mermaid h4 {{ color: #80deea; }}
    .new {{
      font-size: 8px; background: #00e5ff; color: #0c1426;
      padding: 1px 4px; border-radius: 2px; vertical-align: middle;
    }}
    .footer {{
      text-align: center; margin-top: 24px;
      font-size: 10px; color: #546e7a;
    }}
    .footer a {{ color: #00e5ff; }}
    .stamp {{
      display: inline-block; margin-top: 8px; padding: 5px 12px;
      background: #00e5ff; color: #0c1426; font-weight: 700; border-radius: 3px;
    }}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>도감 설명 비교 — 심해어 vs 인어</h1>
    <p class="lead">이름 예시: <strong>{SAMPLE_NAME}</strong> · 인어 스프라이트는 티어 콘셉트 시안 · <strong>게임 미반영</strong></p>
    <nav class="nav">
      <a href="#tier-pretty">pretty</a>
      <a href="#tier-normal">normal</a>
      <a href="#tier-defective">defective</a>
      <a href="preview-tier-concept.html">← 스프라이트 시안</a>
    </nav>
    <div class="notice">
      <strong>심해어</strong> 열은 현재 게임 <code>encyclopedia.js</code> 문구입니다.
      <strong>인어</strong> 열은 티어 콘셉트 캐릭터에 맞춘 <strong>새 도감 설명</strong> (스테이징 전용)입니다.
    </div>
{sections}
    <p class="footer">
      <span class="stamp">STAGING ONLY</span><br>
      데이터: <code>encyclopedia-mermaid-descriptions.json</code>
    </p>
  </div>
</body>
</html>"""


def write_json():
    import json

    payload = {
        "note": "Staging only — not loaded by game. Apply to js/encyclopedia.js when approved.",
        "sampleName": SAMPLE_NAME,
        "mermaid": MERMAID_DESCRIPTIONS,
        "deepseaReference": DEEPSEA_DESCRIPTIONS,
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    STAGING.mkdir(parents=True, exist_ok=True)
    write_json()
    html = build_html()
    OUT_HTML.write_text(html, encoding="utf-8")
    print(f"Mermaid text -> {OUT_JSON}")
    print(f"Compare page -> {OUT_HTML}")
    print(f"Open: file://{OUT_HTML.resolve()}")


if __name__ == "__main__":
    main()
