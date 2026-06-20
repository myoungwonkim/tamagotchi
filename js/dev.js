export function mountDevPanel(handlers) {
  const panel = document.createElement("aside");
  panel.className = "dev-panel";
  panel.setAttribute("aria-label", "개발 테스트 도구");

  const title = document.createElement("p");
  title.className = "dev-panel__title";
  title.textContent = "테스트 (dev 모드)";

  const hint = document.createElement("p");
  hint.className = "dev-panel__hint";
  hint.textContent = "콘솔 붙여넣기 없이 버튼으로 확인하세요.";

  panel.append(title, hint);

  const tests = [
    { label: "건강 게임 오버", action: handlers.simulateHealthGameOver },
    { label: "방치 게임 오버 (11분)", action: handlers.simulateNeglectGameOver },
    { label: "5분 오프라인", action: () => handlers.simulateOffline(5) },
    { label: "30분 오프라인", action: () => handlers.simulateOffline(30) },
    { label: "나이 +1일", action: handlers.simulateAgePlusOne },
    { label: "진화 테스트", action: handlers.simulateEvolution },
  ];

  for (const test of tests) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dev-panel__btn";
    btn.textContent = test.label;
    btn.addEventListener("click", test.action);
    panel.append(btn);
  }

  document.body.append(panel);
}
