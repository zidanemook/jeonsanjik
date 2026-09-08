# 학습 진행 동기화 연결

2026-09-09 Firebase 프로젝트 `jeonsanjik-study`에 연결했습니다. Spark 플랜, Standard Firestore의 서울 리전(`asia-northeast3`), Google 로그인, 본인 UID 허용 목록을 사용합니다. GitHub Pages 도메인 `zidanemook.github.io`를 승인했습니다. Analytics와 Gemini는 프로젝트 생성 시 활성화하지 않았습니다.

## 연결 순서

1. 소유자의 Firebase 콘솔에서 Spark 프로젝트를 만들거나 기존 프로젝트를 선택합니다. Analytics와 유료 플랜은 필요하지 않습니다.
2. 웹 앱을 등록하고 공개 웹 설정(apiKey, authDomain, projectId, appId)을 `firebase-config.js`에 넣습니다. 서비스 계정 키나 비밀번호를 넣지 않습니다.
3. Authentication에서 Google 로그인을 활성화하고 `zidanemook.github.io`를 승인 도메인에 추가합니다.
4. Cloud Firestore를 만들고 저장소의 `firestore.rules`를 게시합니다. 테스트 모드의 공개 접근 규칙을 사용하지 않습니다.
5. 소유자가 앱에서 처음 로그인하면 Authentication에 UID가 생성됩니다. 콘솔에서 `allowedUsers/{그 UID}` 문서를 생성합니다. 이 문서는 관리자만 생성할 수 있습니다. 다른 계정은 학습 기록 읽기와 쓰기가 모두 거부됩니다.
6. 설정을 배포하고 소유자의 두 기기에서 같은 Google 계정으로 로그인합니다. 첫 로그인 때 해당 기기에 있던 기존 기록을 자동 이관합니다.

## 동작

- 각 풀이에 고유 ID를 부여하고 서버에는 변경할 수 없는 이벤트로 저장합니다. 동일 ID 재전송은 중복 채점하지 않습니다.
- 실시간 구독으로 다른 기기의 풀이를 받고 기록 합집합에서 다음 복습일을 다시 계산합니다. 같은 날 중복 정답으로 간격이 늘어나지 않습니다.
- 오프라인 풀이는 브라우저에 남습니다. 네트워크 복구 또는 정기 재시도 때 전송합니다. 앱을 닫은 동안에는 전송되지 않으며 다음 실행 때 이어집니다.
- 오답 후 같은 날 정답을 맞히면 다음 날 다시 복습합니다. 같은 날 여러 오답의 간격 패널티는 한 번만 적용합니다.
- 문제와 보기 콘텐츠는 GitHub 배포로 공급합니다. 계정별 학습 기록과 현재 기기의 해설 화면은 분리합니다.
- 최초 이관 뒤에는 계정별 저장 영역을 사용합니다. 로그아웃하거나 계정을 바꿔도 다른 계정에 이전 계정의 기록을 올리지 않습니다.
- 이벤트 순서는 기록된 날짜·시각·ID로 결정됩니다. 단말기의 날짜가 잘못 설정된 상황까지 서버 시각으로 보정하지는 않습니다.

## 검증 범위

`sync-core.test.cjs`: 기기별 기록 합치기 순서 독립성, 중복 제거, 같은 날 충돌, 재시도 일정.

`sync.test.cjs`: 모의 서버를 이용한 두 클라이언트 실시간 전달, 오프라인 동시 풀이, 재전송, 계정 분리. 실제 Firebase 테스트를 대신하지 않습니다.

실제 서버 검증 완료: 서로 독립된 Edge 컨텍스트에서 동일 계정으로 로그인한 상태의 온라인 기록 전달, 양쪽 오프라인 동시 풀이 세 건 합집합, 재연결 후 일정 일치, 동일 이벤트 재전송 중복 없음. 타 사용자 경로 읽기·기존 이벤트 변조·삭제 및 미인증 SDK 읽기는 모두 `permission-denied`였습니다. 검증용 이벤트 세 건은 이후 관리자 콘솔에서 삭제했습니다. 이는 실제 Android 태블릿을 직접 조작한 테스트는 아닙니다.

공식 문서: [웹 설정](https://firebase.google.com/docs/web/setup), [Google 로그인](https://firebase.google.com/docs/auth/web/google-signin), [실시간 구독](https://firebase.google.com/docs/firestore/query-data/listen), [보안 규칙](https://firebase.google.com/docs/firestore/security/rules-conditions). 2026-09-09 Edge에서 확인했습니다. 웹 SDK는 공식 배포 파일 12.2.1을 vendor에 고정했습니다.
