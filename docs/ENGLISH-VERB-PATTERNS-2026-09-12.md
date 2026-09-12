# 영어 어법 · 문장의 구조와 동사 유형 (2026-09-12, v39)

## 자료와 저작권

공무원 영어 문제집 **PART 01 문장의 구조·동사 유형** 001~030(O/X와 고쳐 쓰기 형식) 여섯 쪽을 읽고 **문법 규칙만** 뽑았다.
규칙은 저작 대상이 아니지만 **예문은 원서의 저작물**이므로, 이 문서와 앱에 들어간 영어 문장은 **한 문장도 원서에서 가져오지 않았다**.
같은 규칙을 검사하되 어휘·상황·인물이 모두 다른 문장을 새로 썼다. 공식 기출이 아니며, 문제집의 정답표는 촬영되지 않아 정오 판단은 이쪽에서 다시 확인했다.

**제외한 항목**: 001번 `ask something of someone`. `ask something of someone`이 성립하는 용법이라 원서가 무엇을 오답으로 보았는지 확정할 수 없어 넣지 않았다.

## 카드 12개와 묶은 기준

한 규칙으로 설명되는 항목끼리 묶었다. 원서의 30항목이 실제로는 12개의 규칙으로 수렴한다.

| 카드 id | 규칙 | 흡수한 원서 항목 |
|---|---|---|
| `grammar-verb-preposition` | 전치사를 넣을 자리와 넣지 않을 자리 | introduce/explain/suggest/announce + to, approach·discuss·enter·marry·reach·resemble·answer 타동사, wait **for** |
| `grammar-verb-lookalike` | 형태가 겹치는 동사 | lie/lay, find-found-found vs found-founded-founded |
| `grammar-verb-no-passive` | 수동태를 쓰지 않는 자리 | rise 자동사(수동 불가), sell 능동형·수동 의미 |
| `grammar-verb-object-voice` | 목적어가 동작을 받을 때의 보어 | 지각동사 + 과거분사/현재분사, keep + O + p.p., let + O + be p.p., want + O + to be p.p. |
| `grammar-verb-object-form` | 동사가 정해 주는 목적어 뒤 형태 | encourage/allow/advise/cause/force/persuade + to do, make + 원형, keep/prevent/stop A from -ing |
| `grammar-verb-linking` | 2형식 동사 뒤의 보어 | 감각동사 + 형용사(tastes bad), remain + 과거분사(seated) |
| `grammar-verb-prep-pair` | A of B와 A as B 짝 | accuse A of B, think of/regard A as B |
| `grammar-verb-question-form` | 간접의문문과 부가의문문 | 간접의문문 어순, 부가의문문은 주절 기준 |
| `grammar-verb-gerund-only` | 동명사만 목적어로 쓰는 동사 | resist/admit/avoid/deny/mind/postpone + -ing |
| `grammar-verb-infinitive-gerund` | to부정사와 동명사의 뜻 차이 | forget, regret, stop |
| `grammar-verb-finite` | 명사의 전치사와 문장의 본동사 | demand **for** + 정동사(분사로 서술어를 대신할 수 없음) |
| `grammar-verb-it-takes` | It takes 시간 to do | 가주어 It + take + 시간 + to부정사 |

`help + O + (to) do`는 기존 카드 `en-session-20260909-help`가 이미 다루므로 새로 만들지 않았다.

## 문항 형식

카드마다 **직접쓰기 2~4개 + 4지선다 1개**, 모두 44문항(직접쓰기 32, 4지선다 12)이다.

- **직접쓰기**는 원서 지시문의 뒷부분(“틀린 부분을 옳게 고치세요”)에 해당한다. 대괄호나 빈칸의 **교정 형태를 직접 입력**하게 하고, 필요한 단어 수와 형태를 지시문에 명시해 정답이 하나로 정해지게 했다.
- **4지선다**는 국가직·지방직 9급 어법 문항과 같은 형식이다. 네 문장 중 **어법상 옳지 않은 하나**가 정답이고, 나머지 세 문장은 같은 정리의 **다른 규칙을 지킨 옳은 문장**이라 오답을 읽어도 배울 것이 있다. 세 문장에 두 번째 오류가 섞이지 않았는지 문장 단위로 확인했다.
- 오답으로 쓴 오류는 모두 한국인 학습자가 실제로 저지르는 것이다(approach **to**, has been **risen**, keeps me **posting**, resisted **to be** arrested, forget **-ing** for a future task 등).
- 해설은 한국어로 쓰고, 틀린 곳의 **교정 형태**와 나머지 세 문장이 왜 맞는지를 함께 적었다.

## 보기 길이 편향

4지선다 12문항 모두 정답(=틀린 문장)이 **유일하게 가장 긴 보기가 아니다**.
전체 비율은 **25.0%(100/400) → 24.3%(100/412)**로 내려갔다. 래칫 `LONGEST_LIMIT = 0.278`과 문항별 여유 12자는 **그대로 두었다**.

## 형제 묶음

서로 정답을 알려 주는 카드만 `review-policy.js`에 묶었다.

- `grammar-verb-transitivity`: lookalike + no-passive (자·타동사 짝)
- `grammar-verb-object-complement`: object-voice + object-form (목적어 뒤 형태)
- `grammar-verb-nonfinite-object`: gerund-only + infinitive-gerund (준동사 목적어)
- `grammar-verb-preposition-choice`: preposition + prep-pair (전치사 선택)

forget·regret·stop은 세 카드로 나누지 않고 한 카드의 세 변형으로 넣었기 때문에 따로 묶을 필요가 없다.
기존 카드의 개념 묶음은 하나도 바꾸지 않았다(바꾸면 이미 검토·기록된 문항의 지문 해시가 달라진다).

## 검사

`content-coverage.json`의 `requiredRules`에 12개 규칙을 등록해 카드가 사라지면 배포 검사가 실패하게 했다.
`content-review.json`에는 새 44문항의 검토 해시만 추가했고 기존 1,651건은 그대로다.
`content-audit.cjs`·`practice.js`·`review-record.js`는 **한 줄도 고치지 않았다**. 4지선다 형식이라 엔진 변경이 필요 없다.
배포 워크플로의 검사 15개를 개별 실행해 모두 종료 코드 0을 확인했다.
