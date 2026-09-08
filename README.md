# 차곡 — 전산직 공부 복습 앱

PC·태블릿·휴대폰에서 사용하는 개인 복습 웹앱입니다.

## 기능

- 카드 추가·편집·검색, 정답 확인과 복습 기록
- 정답·헷갈림·오답에 따라 다음 복습 간격 조정
- AI와 별도 대화로 만든 JSON 문제 가져오기
- 학습 자료 및 기록 JSON 백업·복원

현재 데이터는 기기별 브라우저 localStorage에 저장합니다. 로그인과 자동 기기 간 동기화는 아직 구현하지 않았습니다. 브라우저 데이터 삭제에 대비해 백업을 보관하세요. GitHub에는 개인 학습 기록을 올리지 않습니다.

## 실행

`python -m http.server 8766 --bind 127.0.0.1`

PC에서 http://localhost:8766 에 접속합니다. 설치·오프라인 기능은 HTTPS 또는 localhost가 필요합니다. 실제 Android 설치 검증은 아직 남아 있습니다.

## 배포

GitHub Settings → Pages → Source를 **GitHub Actions**로 설정합니다. main 브랜치 변경 시 포함된 워크플로가 앱 파일만 배포합니다.

## 검증

`node scheduler.test.cjs`

적응형 간격은 단순 휴리스틱이며 FSRS·SM-2의 정확한 구현이나 기억률 보장이 아닙니다.
