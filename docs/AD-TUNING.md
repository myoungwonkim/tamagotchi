# 광고 빈도 A/B 튜닝 가이드 (출시 후)

콘솔 **인앱 광고 → 분석** 탭 지표를 보고 [`js/adConfig.js`](../js/adConfig.js) 상수를 조정합니다.

## 모니터링 KPI

| 지표 | 건강 | 조치 |
|------|------|------|
| 노출 성공률 | ≥ 85% | load/show 타이밍 점검 |
| eCPM (리워드) | 전면형보다 높음 | R1 버튼 카피·위치 실험 |
| 사용자당 일 전면 노출 | 1.5~2.5 | 캡·쿨다운 조정 |
| D1 리텐션 | ≥ 35% | 전면 빈도 **낮추기** |
| 광고 비중 (체류 대비) | 과도 시 이탈 | T4·T2 비중 축소 |

## A/B 실험 절차

1. **한 번에 하나만** 변경 (`adConfig.js` 커밋)
2. 최소 **7일** 데이터 수집 (D+1 08시 갱신)
3. 변경 전·후 스냅샷을 이 문서 하단에 기록

## 조정 가능 파라미터

```javascript
// js/adConfig.js
export const AD_TUNING = {
  maxInterstitialPerSession: 3,      // A: 2 / B: 3 / C: 4
  interstitialCooldownMs: 8 * 60e3,  // A: 12분 / B: 8분
  tutorialGraceMs: 10 * 60e3,      // 첫 세션 무광고 구간
  maxEmergencyCarePerSession: 3,     // R2
  maxNeglectResetPerSession: 2,      // R3
};
```

### 권장 실험 순서

1. **쿨다운** 8분 → 12분 (리텐션 하락 시)
2. **세션 캡** 3 → 2 (eCPM 유지·이탈 감소)
3. **T4 장기복귀** on/off (복귀 유저 불만 시 off)
4. **R2 응급돌봄** 노출 임계값 40 → 30 (보상형 eCPM 상승)

## 실험 로그

| 날짜 | 변경 | DAU | D1 | 전면/DAU | eCPM 전면 | eCPM 리워드 | 메모 |
|------|------|-----|-----|----------|-----------|-------------|------|
| (출시) | 기본값 | | | | | | |

## No Fill 대응

- 요청 대비 수신 저하 → 네트워크 Fill 이슈, 시간대별 패턴 확인
- 수신 대비 노출 시도 저하 → `preload` 실패 로그, `initAds()` 재호출
- iOS만 저하 → ATT·Web Inspector로 load 이벤트 확인
