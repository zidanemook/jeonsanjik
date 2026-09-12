# 영어 어법 카드 변형 풀 확대 (2026-09-12, v40)

## 왜 늘렸나

`Day 1`의 `grammar-verb-*` 카드 12개는 카드마다 직접쓰기 2~4개 + 4지선다 1개, 모두 44문항이었다.
`practice.select`는 같은 카드를 다시 풀 때마다 `count % variants.length`로 다음 변형을 내주므로,
변형이 4개인 카드는 **다섯 번째 시도에서 첫 문장으로 되돌아온다**.
계속 틀리는 카드일수록 같은 문장을 반복해서 보게 되고, 그러면 규칙이 아니라 그 문장을 외우게 된다.

고친 방식은 변형을 그냥 늘리는 것이 아니라 **한 규칙을 여러 트리거 단어로 훈련**하는 것이다.
각 카드의 `rule`에는 이미 단어 가족이 적혀 있었다(approach·discuss·enter·marry·reach·resemble,
encourage·allow·advise·cause·force·persuade, resist·admit·avoid·deny·mind·postpone …).
그 단어마다 문장을 하나씩 주면, approach를 틀린 학습자가 다음에는 discuss를, 그다음에는 marry를 만난다.
표면은 매번 바뀌고 규칙만 남는다.

**엔진은 바꾸지 않았다.** `practice.js`·`practice.test.cjs`·`content-audit.cjs`는 그대로다.
변형이 늘면 반복 회차의 다양성은 자동으로 늘어난다.

## 무엇이 바뀌었나

| 카드 | 직접쓰기 | 4지선다 | 새로 다룬 트리거 단어 |
|---|---|---|---|
| `grammar-verb-preposition` | 3 → 9 | 1 → 3 | explain, suggest, discuss, enter, marry, resemble (기존 introduce·approach·wait) |
| `grammar-verb-object-form` | 3 → 9 | 1 → 3 | allow, persuade, cause, let, have, prevent (기존 encourage·keep·make) |
| `grammar-verb-gerund-only` | 2 → 8 | 1 → 3 | admit, avoid(수동 동명사), deny, mind, enjoy, finish (기존 resist·postpone) |
| `grammar-verb-object-voice` | 4 → 9 | 1 → 3 | hear, listen to, have, make, expect (기존 see·keep·let·want) |
| `grammar-verb-lookalike` | 3 → 8 | 1 → 3 | lie의 lay·lain·lying 전 활용형, find의 found, found의 was founded |
| `grammar-verb-question-form` | 2 → 8 | 1 → 3 | 간접의문문 where·why, 부가의문문 be동사·일반동사 과거·부정어(rarely)·부정문 |
| `grammar-verb-infinitive-gerund` | 3 → 8 | 1 → 3 | forget·remember·regret·stop을 각각 두 뜻 모두 |
| `grammar-verb-linking` | 2 → 7 | 1 → 3 | smell, sound, look, feel, stay (기존 taste·remain) |
| `grammar-verb-prep-pair` | 2 → 7 | 1 → 3 | regard as, refer to as, accuse of -ing, blame for와의 혼동 교정 |
| `grammar-verb-no-passive` | 3 → 7 | 1 → 3 | read·wash 능동형 수동 의미, rise의 과거 rose, raise의 수동태 대비 |
| `grammar-verb-finite` | 3 → 7 | 1 → 3 | reason for, need for, being·having을 정동사로 고치기 |
| `grammar-verb-it-takes` | 2 → 6 | 1 → 3 | took, 가주어 It, 사람 자리 목적격 them, to부정사 |
| **합계** | **32 → 93** | **12 → 36** | |

전체 문항 1,695 → **1,780**. 영어 200 → **285**. 카드 수(53)와 카드 id·`topic`(`Day 1`)·`title`·`rule`·`hook`·`examples`,
`review-policy.js`의 `conceptId` 묶음은 하나도 바꾸지 않았다. 기존 변형은 하나도 지우지 않고 옆에 덧붙였다.

## 답 길이

이 앱은 휴대폰으로 푼다. 입력이 가장 큰 마찰이라 답을 짧게 유지하는 것이 사용 가능성의 조건이다.

- 기존 32개: 1단어 18개, 중앙값 7자, 최장 22자.
- 새로 넣은 61개: **1단어 42개, 2단어 15개, 3단어 4개**, 중앙값 **7자**, 최장 **16자**(`have been raised`).
- 전체 93개: 1단어 60개, 2단어 26개, 3단어 7개. 절 단위 답은 하나도 없다.

## 예문 출처

카드의 출처는 촬영된 문제집이지만, **여기 들어간 영어 문장은 한 문장도 원서에서 가져오지 않았다**.
규칙만 참고하고 어휘·인물·상황이 모두 다른 문장을 새로 썼다. 같은 카드 안에서도 한 문장의 단어만 바꾼 형태가
되지 않도록 상황을 서로 다르게 잡았다(도서관·정전·항구·법정·병원·수리점 …).

## 4지선다 검토

새 24문항은 모두 네 문장 중 어법상 옳지 않은 하나를 고르는 형식이고, 정답은 한국인 학습자가 실제로 저지르는
오류 문장이다(discussed **about**, married **with**, let her **to** travel, avoided **to answer**,
heard my name **calling**, tasted **saltily**, have **laid** for 자동사, regard **to be**, when **did** the train leave,
Every applicant **having**, There **takes** …). 나머지 세 문장은 **한 문장씩 두 번째 오류가 없는지 확인**했다.

판정이 갈릴 수 있는 형태는 오답으로 쓰지 않았다. 예를 들어 `make oneself heard`처럼 실제로 쓰이는
사역동사 + 과거분사, `I want this form signed`처럼 정상적인 want + 목적어 + 과거분사, 부사로도 읽히는
`looked nervously`·`remained silently`는 “틀린 문장” 자리에 넣지 않았다.

한 카드가 4지선다를 세 개 갖게 되면서 지시문도 셋으로 나눴다. `practice.test.cjs`는 카드 안의 객관식 변형을
**지시문으로 구분**하기 때문에(같은 지시문이 둘이면 `shown.length` 검사가 깨진다) `judge()`에 선택적 `question`
인자를 더하고, 새 두 문항에 “다음 네 문장 중 어법상 옳지 않은 것을 고르세요.”와 “다음 중 어법에 맞지 않는 문장
하나를 고르세요.”를 붙였다. 기존 12문항의 지시문은 그대로라 그 지문 해시는 지시문 때문에 바뀌지 않았다.
검사 파일 자체는 고치지 않았다.

## 보기 길이 편향

`content-audit.cjs`의 래칫(`LONGEST_LIMIT = 0.278`, 문항별 여유 12자)은 **그대로 두었다**.

- 정답이 유일하게 가장 긴 문항: **100/412 (24.3%) → 100/436 (22.9%)**.
- 새 24문항 중 정답이 유일하게 가장 긴 것은 **0개**. 초안에서 1자 차이로 걸린 2문항은
  래칫을 올리는 대신 오답 보기를 늘려 맞췄다.
- 정답과 오답 평균의 길이 차이: +2.2자 → **+2.0자**.

## 검사

`.github/workflows/pages.yml`의 15개 검사를 하나씩 따로 돌려 종료 코드를 확인했다.
`content-review.json`은 프로그램으로 갱신했다. 카드의 lesson 객체가 바뀌면 그 카드의 모든 문항 지문 해시가
함께 바뀌므로, 신규 85건 외에 12개 카드의 기존 44건도 갱신되었다(나머지 1,651건은 그대로).

자동 검사는 구조·정답 수용·해시 일치를 확인할 뿐 **의미의 정확성을 증명하지 않는다**.
영어 문장의 어법 판정은 사람이 다시 읽어야 한다.
