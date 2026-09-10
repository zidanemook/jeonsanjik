# 수일치 문서 기반 객관식 20문제 추가 — v22

`research/ENGLISH-SUBJECT-VERB-AGREEMENT.md`의 현재 규칙과 적용 범위를 읽고 자체 응용문제를 만들었다. 기출 원문이 아니다. 기존 수일치 카드 20개마다 다른 객관식 1문제를 더했다. 기존 직접쓰기와 객관식은 보존하며, 복습 차례에 같은 규칙의 다른 예문이 나온다.

## 추가 문제 검토

| 주제 | 새 문항에서 확인할 차이 | 정답 근거 |
|---|---|---|
| as well as | technicians / supervisor, 쉼표 유무 | 앞의 A에 맞춰 have / has |
| not only / neither | assistants / technician | 이 어순에서 가까운 주어에 맞춰 are / is |
| 중심 주어 | list of documents | list가 단수이므로 are를 is로 수정 |
| 관계절 | a technician / several technicians | who의 선행사에 맞춰 maintains / maintain |
| each | employees each / each of employees | Each of the employees have에서 has로 수정 |
| a/the number | 여러 파일 / 파일 수 | are / is |
| 비율 | equipment / machines | is / are |
| scissors·pair | 가위 자체 / pair / pairs | These scissors is에서 are로 수정 |
| 동일인 | 누나와 남동생 두 명 / 친구이자 동료 한 명 | my를 한 번씩 썼어도 are / is |
| including·together with | engineers / manager | 덧붙임을 걷어 내면 are / is |
| 장소 도치·there | boxes / a key | 뒤의 실제 주어에 맞춰 are / is |
| 집합명사 | committee / members of the committee | 첫 문장은 is·are 모두 허용, 둘째는 are |
| 명사 형태 | physics·news·police·information | 학문 Physics are에서 is로 수정 |
| more than one | several과 구별 | More than one passenger have에서 has로 수정 |
| 시간 총량·물건 | two hours / two clocks | is / are |
| none of | furniture / chairs | 첫 문장은 is, 둘째는 is·are 모두 허용 |
| 부정대명사 | nobody / several of the residents | has / have |
| 사람 집단 | the rich / the poor | 둘 다 are. 보어 group에 일치시키지 않음 |
| both의 위치 | 미나의 두 역할 / 미나와 편집자 두 사람 | is / are |
| 구·절 주어 | that절 / to부정사구 | is / takes |

오답 보기에도 같은 문법 영역의 형태를 사용했다. 두 빈칸 조합 또는 네 문장 중 오류를 고르는 형식이다. 시제·철자 오류로 쉽게 소거하는 보기는 추가하지 않았다. 오류 찾기는 네 문장 각각의 일치 근거를 해설한다. 인원수에 따라 답이 바뀌는 문제는 인원을 먼저 명시했다. 집합명사와 none of는 가능한 형태 전체를 고르는 문제로 만들어, 실제 허용되는 단수·복수를 오답 처리하지 않는다.

## 근거와 한계

주 작업자가 새 20문제의 문맥, 네 보기, 정답, 해설을 직접 검토했다. 이번 작업에 별도 검토 에이전트는 사용하지 않았다. [Purdue OWL](https://owl.purdue.edu/owl/general_writing/grammar/subject_verb_agreement.html)의 중심 주어·덧붙임·각각·가위·there 설명, [Cambridge](https://dictionary.cambridge.org/grammar/british-grammar/subject-verb-agreement)의 집합명사 변이, [GrammarBook](https://www.grammarbook.com/grammar/subjectVerbAgree.asp)의 가까운 주어·총량·비율·none 설명을 Edge에서 확인했다. Purdue의 집합명사 설명만으로 영국식 복수 용례를 배제하지 않았다. 모든 세부 규칙의 근거를 이번에 새로 전수 조사했다는 뜻은 아니다.

이 자료는 문서의 주제를 다른 문장에서 적용해 보는 연습이다. 실제 시험 출제 빈도, 전체 문법 범위, 학습 전이의 달성을 보장하지 않는다. 원문 수집 기록은 작업 공간의 `research/raw/agreement-v22-*.json`에 보관했다.

## 앱과 검증

- 카드 수는 **51개**, 그중 수일치 **20개**로 그대로다. 문제는 기존 146개에서 **166개**로 늘었다. 전체 객관식 **71개**, 직접쓰기 **95개**다. 수일치는 객관식 40개와 직접쓰기 55개로 합계 **95문제**다.
- 과목별 안내가 카드 수를 '문제'라고 표시하던 부분은 실제 문항 수로 고쳤다. 국어 2문항 · 영어 156문항 · 한국사 8문항이다. 아래의 '복습 카드'는 규칙 묶음 수를 계속 표시한다.
- 카드마다 문제 순환에 새 객관식을 추가한다. 기존 복습 예정일을 강제로 오늘로 바꾸거나, 새 문항을 풀었다는 기록을 만들지 않는다.
- 이전 146문항의 ID·문제·보기·정답·해설이 보존되는지 비교한다. 새 문제 추가로 바뀌는 순환 순번·문항 수와 보기의 섞인 순서는 내용 변경과 구분한다.
- 객관식 변형도 기존 채점·풀이 저장·동기화·학습량 환산을 사용한다. 기존 답안은 원래 문제와 보기의 스냅샷을 유지한다.
- 콘텐츠 검토 지문(해시), 회전·보기 섞기·미완료 문제 복원, 기존 테스트와 Edge의 20문항 표시·정오 채점·저장·모바일 줄바꿈을 확인한다. 자동 검사는 의미적 정확성을 증명하지 않는다.
