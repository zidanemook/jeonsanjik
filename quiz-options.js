// Practice options, not verbatim exam sheets.
// 사진 보기용 국가유산 사진. 사진 한 장 한 장을 ccimId 단위로 확인해 공공누리 제1유형(출처표시·상업이용 가능·변경 가능)인 것만 담았다.
// 근거: docs/IMAGE-LICENSE-LEDGER.md · 파일 대장과 취득 시점 재확인 기록: assets/heritage/CREDITS.md · 제4유형 사진은 받지도 않는다.
// credit 문자열은 화면에 그대로 띄워야 하는 출처표시다. 줄이거나 빼면 이용 조건을 어긴다.
// alt에는 국가유산 이름을 넣지 않는다. 화면 낭독기 사용자에게 정답이 그대로 새기 때문이다(content-audit.cjs가 강제한다).
globalThis.HERITAGE_PHOTOS={
  "익산 미륵사지 석탑": {"src":"assets/heritage/iksan-mireuksaji-seoktap-6256170.webp","alt":"너른 절터에 홀로 선 여러 층의 석탑. 층마다 기둥을 세우고 얇고 넓은 지붕돌을 얹어 나무로 짠 탑을 돌로 옮긴 듯하며, 왼쪽 멀리 다른 석탑 한 기가 보인다.","credit":"본 저작물은 '국가유산청'에서 작성하여 공공누리 제1유형으로 개방한 '익산 미륵사지 석탑(2019년) 전경'을 이용하였으며, 해당 저작물은 '국가유산청, www.khs.go.kr'에서 무료로 다운받으실 수 있습니다."},
  "부여 정림사지 5층 석탑": {"src":"assets/heritage/buyeo-jeongnimsaji-otap-6347703.webp","alt":"기와 건물 앞마당에 선 다섯 층의 석탑. 지붕돌이 얇고 네 귀가 살짝 들려 있으며 몸돌이 위로 갈수록 빠르게 줄어든다.","credit":"본 저작물은 '국가유산청'에서 '2015년' 작성하여 공공누리 제1유형으로 개방한 '부여 정림사지 오층석탑_전경'을 이용하였으며, 해당 저작물은 '국가유산청, www.khs.go.kr'에서 무료로 다운받으실 수 있습니다."},
  "경주 분황사 모전 석탑": {"src":"assets/heritage/gyeongju-bunhwangsa-mojeon-6408132.webp","alt":"돌을 벽돌 모양으로 얇게 다듬어 층층이 쌓아 올린 세 층의 탑. 1층 네 면에 감실 문이 있고 문 양옆에 인왕상, 기단 모서리에 돌사자가 앉아 있다.","credit":"본 저작물은 '국가유산청'에서 '2007년' 작성하여 공공누리 제1유형으로 개방한 '경주 분황사 모전석탑_전경_건축_2007년(작성자 : 국립문화재연구소)'을 이용하였으며, 해당 저작물은 '국가유산청, www.khs.go.kr'에서 무료로 다운받으실 수 있습니다."},
  "경주 감은사지 동·서 3층 석탑": {"src":"assets/heritage/gyeongju-gameunsaji-samchungtap-1612830.webp","alt":"너른 절터 좌우에 똑같이 생긴 세 층짜리 석탑 두 기가 나란히 서 있고, 가운데 건물 터와 뒤쪽 산·논이 함께 보인다.","credit":"본 저작물은 '국가유산청'에서 작성하여 공공누리 제1유형으로 개방한 '경주 감은사지 동ㆍ서 삼층석탑 전경'을 이용하였으며, 해당 저작물은 '국가유산청, www.khs.go.kr'에서 무료로 다운받으실 수 있습니다."},
  "경주 불국사 3층 석탑(석가탑)": {"src":"assets/heritage/gyeongju-bulguksa-seokgatap-6409180.webp","alt":"기와 회랑을 뒤로 두고 마당에 선 세 층의 석탑. 조각 장식이 거의 없고 몸돌과 지붕돌이 반듯하게 줄어드는 단정한 모습이다.","credit":"본 저작물은 '국가유산청'에서 '2010년' 작성하여 공공누리 제1유형으로 개방한 '경주 불국사 삼층석탑_건축_2010년(작성자 : 국립문화재연구소)'을 이용하였으며, 해당 저작물은 '국가유산청, www.khs.go.kr'에서 무료로 다운받으실 수 있습니다."},
  "경주 불국사 다보탑": {"src":"assets/heritage/gyeongju-bulguksa-dabotap-1612673.webp","alt":"네 방향에 돌계단이 붙고 기둥과 난간을 짜 올린 화려한 탑. 위쪽에는 여덟 모난 몸돌과 연꽃무늬 받침이 얹혀 있다.","credit":"본 저작물은 '국가유산청'에서 작성하여 공공누리 제1유형으로 개방한 '경주 불국사 다보탑'을 이용하였으며, 해당 저작물은 '국가유산청, www.khs.go.kr'에서 무료로 다운받으실 수 있습니다."},
  "화순 쌍봉사 철감선사탑": {"src":"assets/heritage/hwasun-ssangbongsa-cheolgam-1612532.webp","alt":"여덟 모난 몸돌 위에 기와를 새긴 돌지붕을 얹은 낮고 둥근 탑. 받침돌에 사자와 연꽃, 구름무늬가 빽빽하게 조각돼 있다.","credit":"본 저작물은 '국가유산청'에서 작성하여 공공누리 제1유형으로 개방한 '화순 쌍봉사 철감선사탑'을 이용하였으며, 해당 저작물은 '국가유산청, www.khs.go.kr'에서 무료로 다운받으실 수 있습니다."},
  "경주 황룡사지 목탑 터": {"src":"assets/heritage/gyeongju-hwangnyongsaji-moktapji-1627506.webp","alt":"탑이 서 있지 않은 너른 풀밭 터. 네모지게 늘어선 주춧돌과 가운데 놓인 큰 돌 하나가 남아 있고 좌우에 계단이 있다.","credit":"본 저작물은 '국가유산청'에서 작성하여 공공누리 제1유형으로 개방한 '경주 황룡사지 목탑지'를 이용하였으며, 해당 저작물은 '국가유산청, www.khs.go.kr'에서 무료로 다운받으실 수 있습니다."}
};
// 사진 보기 문항. 정답을 첫 보기로 적고 Practice.select가 카드마다 다르게 섞는다(글자 보기와 완전히 같은 규칙).
function photoQuestion(choices){return {choices,correctIndex:0,choiceImages:Object.fromEntries(choices.map(name=>[name,HERITAGE_PHOTOS[name]]))};}
globalThis.QUIZ_OPTIONS={
  "core-ko-2026seoul-1": {
    "choices": [
      "적절하다. 조사는 항상 생략해도 된다.",
      "부적절하다. 목적격 조사 “을”을 생략했다.",
      "부적절하다. “하여”는 명사이기 때문이다.",
      "적절하다. 글자 수가 줄었기 때문이다."
    ],
    "correctIndex": 1
  },
  "core-ko-2026seoul-17": {
    "question": "“맑게”와 “젊다”의 표준 발음을 바르게 짝지은 것은?",
    "choices": [
      "맑게 [막께], 젊다 [절따]",
      "맑게 [말게], 젊다 [점다]",
      "맑게 [말께], 젊다 [점ː따]",
      "맑게 [막게], 젊다 [절ː따]"
    ],
    "correctIndex": 2
  },
  "core-en-2026national-3": {
    "question": "The manager requires that each worker check the file and ___ the result.\n빈칸에 들어갈 말로 알맞은 것은?",
    "choices": [
      "report",
      "reports",
      "to report",
      "reported"
    ],
    "correctIndex": 0
  },
  "core-en-2026national-13": {
    "question": "This is a region ___ lies near the coast.\n빈칸에 들어갈 말로 알맞은 것은?",
    "choices": [
      "where",
      "which",
      "when",
      "what"
    ],
    "correctIndex": 1
  },
  "core-en-2026national-14": {
    "question": "These problems are not guaranteed ___.\n빈칸에 들어갈 말로 알맞은 것은?",
    "choices": [
      "to solve",
      "solving",
      "to be solved",
      "have solved"
    ],
    "correctIndex": 2
  },
  "core-en-2026national-17": {
    "choices": [
      "그들은 관리 업무를 맡는 데 소극적이다.",
      "그들은 남을 감독하고 싶어 관리자 승진에 적극적이다.",
      "그들은 관리자에게 따르는 책임을 부담스러워한다.",
      "그들은 관리직 승진을 매력적인 경로로 보지 않는다."
    ],
    "correctIndex": 1
  },
  "core-hist-79-3": {
    "choices": [
      "근초고왕",
      "성왕",
      "의자왕",
      "무령왕"
    ],
    "correctIndex": 3
  },
  "core-hist-79-4": {
    "choices": [
      "금관가야 — 철",
      "동예 — 단궁",
      "고구려 — 소금",
      "고려 — 은병"
    ],
    "correctIndex": 0
  },
  "core-hist-79-5": {
    "question": "강수와 설총의 업적을 바르게 짝지은 것은?",
    "choices": [
      "강수 — 이두·화왕계 / 설총 — 외교 문서",
      "강수 — 외교 문서 / 설총 — 이두·화왕계",
      "강수 — 삼대목 / 설총 — 왕오천축국전",
      "강수 — 왕오천축국전 / 설총 — 삼대목"
    ],
    "correctIndex": 1
  },
  "core-hist-79-6": {
    "choices": [
      "황룡사탑 — 신라 9층 목탑",
      "미륵사지탑 — 백제 석탑",
      "평제탑 — 백제 5층 석탑",
      "다보탑 — 신라 석탑"
    ],
    "correctIndex": 2
  },
  "core-hist-79-7": {
    "choices": [
      "고구려",
      "백제",
      "신라",
      "발해"
    ],
    "correctIndex": 3
  },
  "core-hist-79-8": {
    "choices": [
      "국학 — 박사·조교",
      "고려 국자감 — 직강·박사",
      "향교 — 훈도·교수",
      "성균관 — 대사성·좨주"
    ],
    "correctIndex": 0
  },
  "core-hist-79-9": {
    "choices": [
      "견훤 — 집사부",
      "궁예 — 광평성",
      "왕건 — 정사암",
      "장보고 — 화백 회의"
    ],
    "correctIndex": 1
  },
  "core-hist-79-10": {
    "question": "혜공왕 피살과 장보고의 반란 사이에 발생한 사건은?",
    "choices": [
      "견훤의 후백제 건국",
      "최치원의 시무 10여 조 건의",
      "김헌창의 난",
      "김춘추의 즉위"
    ],
    "correctIndex": 2
  },
  "en-session-20260909-wish": {
    "choices": [
      "have bought",
      "bought",
      "had bought",
      "will have bought"
    ],
    "correctIndex": 2,
    "explanation": "작년에 실제로 사지 않은 집을 지금 아쉬워하는 문장이다. 이미 지나간 사실과 반대되는 바람은 I wish + 주어 + had p.p.로 나타내므로 had bought가 맞다. have bought는 현재완료라 이 과거 사실에 대한 아쉬움을 나타내는 자리에 맞지 않는다. bought는 단순과거형이지만, wish 뒤의 과거형은 보통 현재의 사실과 반대되는 바람을 나타내므로 여기서는 맞지 않는다. will have bought는 미래의 기준 시점까지 완료될 일을 나타내는 미래완료라 문맥에 맞지 않는다. last year만 보고 무조건 had를 고르는 것이 아니라, wish 뒤에서 이미 지나간 일을 아쉬워한다는 뜻을 함께 본다."
  },
  "en-session-20260909-considering": {
    "choices": [
      "Considered",
      "Considering",
      "Consider",
      "To considered"
    ],
    "correctIndex": 1
  },
  "en-session-20260909-provided": {
    "choices": [
      "provided that",
      "considered that",
      "because of",
      "during"
    ],
    "correctIndex": 0
  },
  "en-session-20260909-while": {
    "choices": [
      "while",
      "during",
      "although",
      "when"
    ],
    "correctIndex": 1
  },
  "en-session-20260909-while-short": {
    "choices": [
      "While studying, I listened to music.",
      "While study, I listened to music.",
      "During I was studying, I listened to music.",
      "While my study time, I listened to music."
    ],
    "correctIndex": 0
  },
  "en-session-20260909-comparative": {
    "choices": [
      "Faster / greater",
      "The faster / the greater",
      "The fast / the great",
      "The fastest / the greatest"
    ],
    "correctIndex": 1
  },
  "en-session-20260909-no-means": {
    "choices": [
      "영어를 배울 방법이 없다.",
      "영어를 배우는 것은 결코 쉽지 않다.",
      "영어는 어떤 방법으로든 쉽게 배운다.",
      "영어를 배우는 것은 언제나 쉽다."
    ],
    "correctIndex": 1
  },
  "en-session-20260909-poor-as": {
    "choices": [
      "Because she was exhausted",
      "As exhausted as she was busy",
      "Although she was exhausted",
      "When she became exhausted"
    ],
    "correctIndex": 2
  },
  "en-session-20260909-nothing": {
    "choices": [
      "Everything in business is as important as credit.",
      "Nothing in business is as important as credit.",
      "Credit is not important in business.",
      "Everything in business is more important than credit."
    ],
    "correctIndex": 1
  },
  "en-session-20260909-as-well": {
    "choices": [
      "is",
      "are",
      "am",
      "be"
    ],
    "correctIndex": 1
  },
  "en-session-20260909-adverb": {
    "choices": [
      "surprise",
      "surprising",
      "surprisingly",
      "surprised"
    ],
    "correctIndex": 2
  },
  "en-session-20260909-neither": {
    "choices": [
      "are",
      "is",
      "be",
      "were"
    ],
    "correctIndex": 1
  },
  "en-session-20260909-rage": {
    "choices": [
      "has been raged",
      "has been raging",
      "has being raged",
      "have been raging"
    ],
    "correctIndex": 1
  },
  "en-session-20260909-debate-head": {
    "choices": [
      "have been raging",
      "has been raging",
      "have being raging",
      "has been raged"
    ],
    "correctIndex": 1
  },
  "en-session-20260909-time-clause": {
    "choices": [
      "will get",
      "get",
      "will have got",
      "getting"
    ],
    "correctIndex": 1
  },
  "en-session-20260909-knowledge": {
    "choices": [
      "are",
      "is",
      "were",
      "be"
    ],
    "correctIndex": 1
  },
  "en-session-20260909-help": {
    "choices": [
      "become만 가능하다.",
      "to become만 가능하고 원형 become은 쓸 수 없다.",
      "become과 to become 모두 가능하다.",
      "becoming만 가능하다."
    ],
    "correctIndex": 2
  },
  "en-session-20260909-difficulty": {
    "choices": [
      "have difficulty remembering names만 가능",
      "have difficulty in remembering names만 가능",
      "두 표현 모두 가능",
      "두 표현 모두 틀림"
    ],
    "correctIndex": 2
  },
  "en-session-20260909-used-to": {
    "choices": [
      "live",
      "lived",
      "living",
      "have live"
    ],
    "correctIndex": 2
  },
  "en-session-20260909-both-whom": {
    "choices": [
      "they",
      "them",
      "who",
      "whom"
    ],
    "correctIndex": 3
  },
  "en-session-20260909-all-whom": {
    "choices": [
      "moving의 목적어이기 때문이다.",
      "whom 자체가 주어이기 때문이다.",
      "전치사 of의 목적어이기 때문이다.",
      "사람이 복수이면 항상 whom을 쓰기 때문이다."
    ],
    "correctIndex": 2
  },
  "grammar-agreement-each": {
    "question": "두 빈칸에 들어갈 말을 순서대로 고르세요.\nEach manager ___ a folder.\nThe managers each ___ a folder.",
    "choices": [
      "has / has",
      "has / have",
      "have / has",
      "have / have"
    ],
    "correctIndex": 1,
    "explanation": "첫 문장은 단수 each가 중심이므로 has, 둘째는 복수 managers가 주어이므로 have다. each가 어디에 놓였는지 확인한다.",
    "placement": "after"
  },
  "grammar-agreement-number": {
    "question": "두 빈칸에 들어갈 말을 순서대로 고르세요.\nThe number of applicants ___ increasing.\nA number of applicants ___ waiting.",
    "choices": [
      "is / is",
      "is / are",
      "are / is",
      "are / are"
    ],
    "correctIndex": 1,
    "explanation": "the number는 지원자 수 하나여서 is, a number of applicants는 여러 지원자여서 are다.",
    "placement": "after"
  },
  "grammar-agreement-portion": {
    "question": "두 빈칸에 들어갈 말을 순서대로 고르세요.\nHalf of the milk ___ gone.\nHalf of the guests ___ here.",
    "choices": [
      "is / is",
      "is / are",
      "are / is",
      "are / are"
    ],
    "correctIndex": 1,
    "explanation": "milk는 불가산명사라 is, guests는 복수라 are다. 절반이라는 비율보다 무엇의 절반인지를 본다.",
    "placement": "after"
  },
  "grammar-agreement-pair": {
    "question": "두 빈칸에 들어갈 말을 순서대로 고르세요.\nA pair of trousers ___ on the bed.\nThe trousers ___ clean.",
    "choices": [
      "is / is",
      "is / are",
      "are / is",
      "are / are"
    ],
    "correctIndex": 1,
    "explanation": "첫 문장에서는 단수 pair가 중심이라 is다. 둘째의 trousers는 복수 취급하여 are다.",
    "placement": "after"
  },
  "grammar-agreement-identity": {
    "question": "첫 문장: 준호 한 명이 내 친구이면서 동료다.\nMy friend and colleague ___ outside.\n둘째 문장: 친구 준호와 동료 수진, 두 명이 왔다.\nMy friend and my colleague ___ outside.\n두 빈칸에 들어갈 말을 순서대로 고르세요.",
    "choices": [
      "is / is",
      "is / are",
      "are / is",
      "are / are"
    ],
    "correctIndex": 1,
    "explanation": "첫 문장은 한 사람의 역할 둘이므로 is, 둘째는 서로 다른 두 사람이므로 are다. my의 개수가 아니라 제시된 인원 문맥으로 판단한다.",
    "placement": "after"
  },
  "grammar-agreement-together": {
    "question": "격식 문법 기준으로 두 빈칸에 들어갈 말을 고르세요.\nThe director, along with the assistants, ___ here.\nThe assistants, including their leader, ___ ready.",
    "choices": [
      "is / is",
      "is / are",
      "are / is",
      "are / are"
    ],
    "correctIndex": 1,
    "explanation": "along with와 including으로 덧붙인 말을 빼면 The director is와 The assistants are가 남는다.",
    "placement": "after"
  },
  "grammar-agreement-existential": {
    "question": "격식 문법 기준으로 두 빈칸에 들어갈 말을 고르세요.\nThere ___ two notices on the board.\nNear the entrance ___ a small table.",
    "choices": [
      "is / is",
      "is / are",
      "are / is",
      "are / are"
    ],
    "correctIndex": 2,
    "explanation": "첫 문장은 뒤의 two notices가 복수라 are, 둘째 장소 도치에서는 뒤의 a small table이 단수라 is다.",
    "placement": "after"
  },
  "grammar-agreement-collective": {
    "question": "영국식 용례를 포함하여 The team ___ ready.의 빈칸을 설명한 것으로 가장 알맞은 것은?",
    "choices": [
      "집합명사이므로 is만 가능하다.",
      "실제 팀원이 여러 명이므로 are만 가능하다.",
      "문맥과 사용역에 따라 is와 are가 모두 가능하다.",
      "team은 명사이므로 동사 없이도 완전한 문장이다."
    ],
    "correctIndex": 2,
    "explanation": "집합명사는 하나의 집단을 가리키면 단수로, 구성원들을 떠올리는 영국식 용례에서는 복수로도 쓴다. 단순히 실제 사람 수만 세어 정하지 않는다.",
    "placement": "after"
  },
  "grammar-agreement-noun-form": {
    "question": "두 빈칸에 들어갈 말을 순서대로 고르세요.\nThe equipment ___ expensive.\nThe news ___ surprising.",
    "choices": [
      "is / is",
      "is / are",
      "are / is",
      "are / are"
    ],
    "correctIndex": 0,
    "explanation": "equipment는 불가산명사이고 news도 단수로 취급한다. 둘 다 is다.",
    "placement": "after"
  },
  "grammar-agreement-one": {
    "question": "일반적인 격식 문법 기준으로 두 빈칸에 들어갈 말을 고르세요.\nOne of the applicants ___ arrived.\nMore than one applicant ___ called.",
    "choices": [
      "has / has",
      "has / have",
      "have / has",
      "have / have"
    ],
    "correctIndex": 0,
    "explanation": "one of는 여럿 중 하나, more than one + 단수명사도 보통 단수 동사를 쓴다. 둘 다 has다.",
    "placement": "after"
  },
  "grammar-agreement-amount": {
    "question": "첫 문장은 교통비 총액, 둘째 문장은 지폐 낱장을 말합니다. 두 빈칸에 들어갈 말을 고르세요.\nTen dollars ___ enough for the fare.\nTen one-dollar bills ___ on the desk.",
    "choices": [
      "is / is",
      "is / are",
      "are / is",
      "are / are"
    ],
    "correctIndex": 1,
    "explanation": "총액 10달러를 하나의 양으로 보는 첫 문장은 is, 지폐 여러 장을 세는 둘째 문장은 복수 bills에 맞춰 are다.",
    "placement": "after"
  },
  "grammar-agreement-none": {
    "question": "격식 문체와 일상 용례를 모두 포함할 때 옳은 설명은?",
    "choices": [
      "None of the water are clean.만 맞다.",
      "None of the students is here.만 가능하고 are는 격식 문체든 일상 용례든 모든 경우에 틀리며 none은 항상 단수다.",
      "None of the water is clean.이 맞고, None of the students는 is와 are 용례가 모두 있다.",
      "none은 항상 복수 동사와만 쓴다."
    ],
    "correctIndex": 2,
    "explanation": "불가산명사 water를 받으면 is다. 복수 students를 받는 none of는 단수와 복수 용례가 모두 있다. 사용역을 한정하지 않은 이 문제에서는 둘 다 인정한다.",
    "placement": "after"
  },
  "grammar-agreement-indefinite": {
    "question": "격식 문법 기준으로 두 빈칸에 들어갈 말을 고르세요.\nEveryone ___ a ticket.\nNeither of the visitors ___ a pass.",
    "choices": [
      "has / has",
      "has / have",
      "have / has",
      "have / have"
    ],
    "correctIndex": 0,
    "explanation": "everyone과 neither of는 이 격식 문법 기준에서 단수 has다. visitors의 복수형만 보고 have를 고르지 않는다.",
    "placement": "after"
  },
  "grammar-agreement-rich": {
    "question": "사람 집단을 가리키는 the rich와 the poor를 쓴 문장입니다. 두 빈칸에 들어갈 말을 고르세요.\nThe rich ___ not all alike.\nThe poor ___ adequate housing.",
    "choices": [
      "is / needs",
      "is / need",
      "are / needs",
      "are / need"
    ],
    "correctIndex": 3,
    "explanation": "두 표현 모두 각각 사람들을 집단적으로 가리키므로 복수 are와 need를 쓴다.",
    "placement": "after"
  },
  "grammar-agreement-both": {
    "question": "첫 문장에는 미나와 준 두 사람이 있습니다. 둘째의 미나는 교사이면서 작가인 한 명입니다. 두 빈칸에 들어갈 말을 고르세요.\nBoth Mina and Joon ___ here.\nMina ___ both a teacher and a writer.",
    "choices": [
      "is / is",
      "is / are",
      "are / is",
      "are / are"
    ],
    "correctIndex": 2,
    "explanation": "첫 문장의 both는 두 주어를 연결하므로 are다. 둘째의 both는 보어인 역할 둘을 연결하며, 주어 Mina는 단수여서 is다.",
    "placement": "after"
  },
  "grammar-agreement-unit": {
    "question": "두 빈칸에 들어갈 말을 순서대로 고르세요.\nReading books ___ relaxing.\nTo learn from mistakes ___ important.",
    "choices": [
      "is / is",
      "is / are",
      "are / is",
      "are / are"
    ],
    "correctIndex": 0,
    "explanation": "Reading books와 To learn from mistakes는 각각 하나의 구로서 주어다. 둘 다 단수 is를 쓴다.",
    "placement": "after"
  },
  "study-hist-20260910-01": {
    "choices": [
      "구석기 시대에 농경과 목축이 시작되어 정착 생활이 일반화되었다.",
      "신석기 시대에 농경과 목축이 시작되었지만 사냥·채집·고기잡이도 이어졌다.",
      "청동기 시대에 한반도 전역에서 처음 농경이 시작되었다.",
      "철기 시대에 처음으로 토기를 만들어 식량을 저장하였다."
    ],
    "correctIndex": 1
  },
  "study-hist-20260910-02": {
    "choices": [
      "비파형 동검 — 거친무늬 거울",
      "세형 동검 — 잔무늬 거울",
      "주먹도끼 — 슴베찌르개",
      "빗살무늬 토기 — 가락바퀴"
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-03": {
    "choices": [
      "구석기 시대",
      "신석기 시대",
      "청동기 시대",
      "철기 시대"
    ],
    "correctIndex": 2
  },
  "study-hist-20260910-04": {
    "choices": [
      "실을 잣고 옷이나 그물을 만들었다.",
      "곡식의 이삭을 베어 수확하였다.",
      "짐승을 사냥하기 위한 뗀석기를 만들었다.",
      "청동 유물을 주조하여 무기와 거울을 제작하였다."
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-05": {
    "choices": [
      "큰 돌을 운반하고 세울 노동력을 동원할 지배층과 계급 분화가 있었다.",
      "사냥과 채집을 위해 구성원이 계속 이동하는 평등 사회였다.",
      "정치적 지배와 제사 담당이 분리된 사회였다.",
      "철제 무기 생산을 국가가 독점한 중앙 집권 사회였다."
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-06": {
    "choices": [
      "청동제 농기구와 철제 의식용 거울이 함께 사용되었다.",
      "철제 농기구와 무기가 쓰였고 세형 동검·잔무늬 거울 같은 청동기 문화도 이어졌다.",
      "철제 의식용 무기만 사용되고 청동 유물은 모두 사라졌다.",
      "돌로 만든 농기구만 사용되고 철제 무기도 청동제 무기도 아직 등장하지 않은 단계였다."
    ],
    "correctIndex": 1
  },
  "study-hist-20260910-07": {
    "choices": [
      "연천 전곡리 — 구석기 / 공주 석장리 — 구석기",
      "서울 암사동 — 구석기 / 부여 송국리 — 신석기",
      "양양 오산리 — 청동기 / 고창 고인돌 — 신석기",
      "부여 송국리 — 철기 / 부산 동삼동 — 청동기"
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-08": {
    "choices": [
      "반달 돌칼",
      "가락바퀴",
      "주먹도끼",
      "세형 동검"
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-09": {
    "choices": [
      "한과 진 사이의 중계 무역을 통제하며 성장했고, 이를 둘러싸고 한과 대립하였다.",
      "중국과의 교류를 끊고 농경과 목축만으로 국력을 유지하였다.",
      "한 무제의 침략 이후에 처음 철기 문화를 받아들였다.",
      "연의 공격을 받아 서쪽 지역을 잃은 뒤 곧바로 삼한으로 편입되었다."
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-10": {
    "choices": [
      "여러 가가 사출도를 나누어 다스렸고, 12월에 영고를 열었다.",
      "천군이 소도에서 제사를 주관했고, 5월과 10월에 계절제를 열었다.",
      "읍군과 삼로가 다스렸고, 10월에 무천을 열었다.",
      "제가 회의로 왕을 보좌했고, 신부 집의 서옥에서 혼인 생활을 시작했다."
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-11": {
    "choices": [
      "혼인할 여자가 어린 나이에 남자 집에 들어가 성장하였다.",
      "혼인 뒤 신랑이 신부 집에 마련된 작은 집인 서옥에 머물렀다.",
      "같은 씨족끼리의 혼인을 금하고 다른 씨족과 혼인하였다.",
      "형이 죽으면 동생이 형수와 혼인하는 형사취수였다."
    ],
    "correctIndex": 1
  },
  "study-hist-20260910-12": {
    "choices": [
      "어린 여자가 장차 혼인할 남자 집에서 성장하였다.",
      "신랑이 신부 집의 서옥에서 혼인 생활을 시작하였다.",
      "형이 죽으면 동생이 형수와 혼인하는 형사취수였다.",
      "같은 씨족끼리의 혼인을 피하는 족외혼이었다."
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-13": {
    "choices": [
      "다른 읍락의 경계를 침범하면 책임을 지고 배상하였다.",
      "왕이 없는 대신 천군이 소도에서 정치와 제사를 모두 맡았다.",
      "죽은 뒤 가족 공동 무덤에 함께 묻는 장례 풍속이었다.",
      "12월에 하늘에 제사를 지내며 영고를 열었다."
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-14": {
    "choices": [
      "왕이 모든 읍락을 직접 다스리고 별도의 제사 담당자는 없었다.",
      "신지·읍차 같은 군장과 천군이 구분되며, 소도에는 군장의 정치 권력이 미치지 않았다.",
      "마가·우가·저가·구가가 사출도를 나누어 다스렸고, 12월에 영고를 열어 제사와 정치를 함께 맡았다.",
      "제가 회의가 왕권을 제한하고 서옥에서 혼인 생활을 하였다."
    ],
    "correctIndex": 1
  },
  "study-hist-20260910-15": {
    "choices": [
      "부여 — 영고 — 12월",
      "고구려 — 무천 — 10월",
      "동예 — 동맹 — 10월",
      "삼한 — 영고 — 12월"
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-16": {
    "choices": [
      "생명과 재산을 보호하고 농경 사회의 질서를 유지하려는 규범으로 볼 수 있다.",
      "사유 재산을 인정하지 않고 공동 생산만을 중시한 사회였음을 보여 준다.",
      "생명에 대한 처벌보다 제사와 농경 의례만을 중시한 사회였음을 보여 준다.",
      "농경과 무관하게 이동 생활만 하던 사회였음을 보여 준다."
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-17": {
    "choices": [
      "고국천왕",
      "고국원왕",
      "소수림왕",
      "광개토 태왕"
    ],
    "correctIndex": 2
  },
  "study-hist-20260910-18": {
    "choices": [
      "고국원왕",
      "고국천왕",
      "미천왕",
      "소수림왕"
    ],
    "correctIndex": 1
  },
  "study-hist-20260910-19": {
    "choices": [
      "태조왕",
      "동천왕",
      "장수왕",
      "미천왕"
    ],
    "correctIndex": 3
  },
  "study-hist-20260910-20": {
    "choices": [
      "광개토 태왕",
      "장수왕",
      "소수림왕",
      "미천왕"
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-21": {
    "choices": [
      "광개토 태왕",
      "장수왕",
      "고국원왕",
      "동천왕"
    ],
    "correctIndex": 1
  },
  "study-hist-20260910-22": {
    "choices": [
      "전기: 대가야·김해 / 후기: 금관가야·고령",
      "전기: 금관가야·고령 / 후기: 대가야·김해",
      "전기: 대가야·고령 / 후기: 금관가야·김해",
      "전기: 금관가야·김해 / 후기: 대가야·고령"
    ],
    "correctIndex": 3
  },
  "study-hist-20260910-23": {
    "choices": [
      "안시성 전투",
      "황산벌 전투",
      "살수 대첩",
      "기벌포 전투"
    ],
    "correctIndex": 2
  },
  "study-hist-20260910-24": {
    "choices": [
      "백제",
      "고구려",
      "금관가야",
      "대가야"
    ],
    "correctIndex": 1
  },
  "study-hist-20260910-25": {
    "choices": [
      "근초고왕",
      "고이왕",
      "개로왕",
      "무령왕"
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-26": {
    "choices": [
      "고이왕",
      "근초고왕",
      "침류왕",
      "성왕"
    ],
    "correctIndex": 2
  },
  "study-hist-20260910-27": {
    "choices": [
      "동성왕",
      "성왕",
      "고이왕",
      "무령왕"
    ],
    "correctIndex": 3
  },
  "study-hist-20260910-28": {
    "choices": [
      "개로왕",
      "문주왕",
      "무령왕",
      "성왕"
    ],
    "correctIndex": 1
  },
  "study-hist-20260910-29": {
    "choices": [
      "성왕",
      "동성왕",
      "무왕",
      "의자왕"
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-30": {
    "choices": [
      "내물 마립간",
      "법흥왕",
      "지증왕",
      "진흥왕"
    ],
    "correctIndex": 2
  },
  "study-hist-20260910-31": {
    "choices": [
      "지증왕",
      "진흥왕",
      "문무왕",
      "법흥왕"
    ],
    "correctIndex": 3
  },
  "study-hist-20260910-32": {
    "choices": [
      "법흥왕",
      "진흥왕",
      "지증왕",
      "내물 마립간"
    ],
    "correctIndex": 1
  },
  "study-hist-20260910-33": {
    "choices": [
      "복신·도침·부여풍",
      "복신·검모잠·부여풍",
      "고연무·검모잠·안승",
      "고연무·흑치상지·안승"
    ],
    "correctIndex": 2
  },
  "study-hist-20260910-34": {
    "choices": [
      "동맹 체결: 비유왕·눌지 / 혼인 동맹: 동성왕·소지",
      "동맹 체결: 동성왕·눌지 / 혼인 동맹: 비유왕·소지",
      "동맹 체결: 비유왕·소지 / 혼인 동맹: 동성왕·눌지",
      "동맹 체결: 동성왕·소지 / 혼인 동맹: 비유왕·눌지"
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-35": {
    "choices": [
      "금관가야: 진흥왕·532년 / 대가야: 법흥왕·562년",
      "금관가야: 법흥왕·562년 / 대가야: 진흥왕·532년",
      "금관가야: 진흥왕·562년 / 대가야: 법흥왕·532년",
      "금관가야: 법흥왕·532년 / 대가야: 진흥왕·562년"
    ],
    "correctIndex": 3
  },
  "study-hist-20260910-36": {
    "choices": [
      "나 → 가 → 다",
      "가 → 나 → 다",
      "가 → 다 → 나",
      "다 → 가 → 나"
    ],
    "correctIndex": 1
  },
  "study-hist-20260910-37": {
    "choices": [
      "수",
      "백제",
      "당",
      "고구려"
    ],
    "correctIndex": 2
  },
  "study-hist-20260910-38": {
    "choices": [
      "무왕",
      "무령왕",
      "성왕",
      "침류왕"
    ],
    "correctIndex": 0
  },
  "study-hist-20260910-39": {
    "choices": [
      "북한산의 비",
      "창녕의 비",
      "황초령의 비",
      "단양의 비"
    ],
    "correctIndex": 3
  },
  "study-hist-20260910-40": {
    "choices": [
      "당과 전쟁하지 않고 통일을 마무리했다.",
      "대체로 대동강 이남을 확보했으나 고구려의 옛 땅 대부분을 포함하지 못했다.",
      "고구려의 옛 영토를 모두 회복했다.",
      "백제와 고구려 유민은 당을 몰아내는 과정에 전혀 참여하지 않고 오히려 당을 도왔다."
    ],
    "correctIndex": 1
  },
  "summary-hist-20260910-001": {
    "choices": [
      "구석기—약 70만 년 전",
      "신석기—기원전 2000년경",
      "청동기—기원전 5세기경",
      "철기—약 1만 년 전"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-002": {
    "choices": [
      "사냥·채집·고기잡이를 하며 동굴이나 막집에서 이동 생활을 했다",
      "농경과 목축을 시작하고 움집에서 정착했다",
      "밭농사를 중심으로 잉여 생산물과 계급이 생겼다",
      "철제 농기구로 생산력이 높아지고 연맹 왕국이 성장했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-003": {
    "choices": [
      "연천 전곡리·공주 석장리",
      "서울 암사동·부산 동삼동",
      "부여 송국리·여주 흔암리",
      "고창 고인돌·제주 고산리"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-004": {
    "choices": [
      "제주 고산리—부여 송국리",
      "부여 송국리—서울 암사동",
      "고창 고인돌—양양 오산리",
      "여주 흔암리—부산 동삼동"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-005": {
    "choices": [
      "이른 민무늬 토기·덧무늬 토기",
      "미송리식 토기·비파형 동검",
      "세형 동검·잔무늬 거울",
      "명도전·반량전"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-006": {
    "choices": [
      "비파형 동검·거친무늬 거울·반달 돌칼",
      "주먹도끼·슴베찌르개·가락바퀴",
      "세형 동검·잔무늬 거울·철제 농기구",
      "명도전·반량전·오수전"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-007": {
    "choices": [
      "반달 돌칼처럼 간석기도 사용했으며 계급 분화와 군장이 나타났다",
      "청동 도구만 사용했으므로 간석기는 사라졌다",
      "정착 생활이 처음 시작되어 농경과 목축이 처음 나타났다",
      "왕국이 중앙 집권 체제로 완성되고 철제 무기가 보급되었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-008": {
    "choices": [
      "철기가 보급되어도 세형 동검·잔무늬 거울 같은 청동기 문화가 함께 나타났다",
      "철기 시대에는 청동 유물이 모두 사라졌다",
      "철기 시대의 대표 토기는 빗살무늬 토기뿐이다",
      "철기 시대에는 정복 활동과 여러 나라의 성장이 나타나지 않았다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-009": {
    "choices": [
      "명도전·반량전·오수전·붓",
      "비파형 동검·거친무늬 거울·반달 돌칼·고인돌",
      "가락바퀴·뼈바늘·빗살무늬 토기·움집",
      "널무덤·독무덤·세형 동검·철제 농기구"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-010": {
    "choices": [
      "지배층과 계급 사회의 등장",
      "모든 구성원이 재산 차이 없이 생활함",
      "왕 없이 읍군·삼로가 지배함",
      "천군이 소도에서 제사를 주관함"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-011": {
    "choices": [
      "애니미즘—자연물에도 영혼이 있다고 믿음",
      "토테미즘—인간과 신을 잇는 주술적 존재를 믿음",
      "샤머니즘—특정 동물·식물을 부족과 연결하여 숭배함",
      "애니미즘—군장이 정치와 제사를 함께 담당함"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-012": {
    "choices": [
      "군장이 정치적 지배와 제사를 함께 담당했다",
      "천군과 군장이 정치와 제사를 나누어 맡았다",
      "왕이 없이 읍군과 삼로만 존재했다",
      "신랑이 신부 집의 작은 집에서 머물렀다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-013": {
    "choices": [
      "반구대는 고래·사슴, 고령 장기리는 동심원 등 추상적 도형과 연결된다",
      "반구대는 비파형 동검, 고령 장기리는 고인돌과 연결된다",
      "두 유적의 모든 그림이 같은 시기에 한꺼번에 만들어졌다",
      "반구대는 신석기 토기, 고령 장기리는 철제 농기구 유적이다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-014": {
    "choices": [
      "농경은 신석기에 시작되었고, 벼농사는 청동기 항목에서 일부 지역에 보급되었다",
      "농경과 벼농사는 모두 철기에 처음 시작되었다",
      "농경은 청동기 항목에서 처음 시작되었고 신석기에는 사냥과 채집만 했으며 토기도 쓰지 않았다",
      "벼농사는 구석기에 보급되고 청동기에는 사라졌다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-015": {
    "choices": [
      "널무덤·독무덤·덧널무덤",
      "널무덤·고인돌·덧널무덤",
      "독무덤·고인돌·움집",
      "덧널무덤·움집·독무덤"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-016": {
    "choices": [
      "둘 다 노트에 제시된 구석기 유적이다",
      "둘 다 노트에 제시된 신석기 유적이다",
      "둘 다 노트에 제시된 청동기 유적이다",
      "금굴은 신석기, 두루봉은 청동기 유적이다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-017": {
    "choices": [
      "빗살무늬 토기—신석기 정착 생활과 식량 저장·조리",
      "가락바퀴—청동기 군장이 제사에서 쓴 의례용 청동 도구",
      "반달 돌칼—구석기 사냥용 뗀석기",
      "세형 동검—신석기 농경용 간석기"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-018": {
    "choices": [
      "슴베찌르개",
      "반달 돌칼",
      "가락바퀴",
      "세형 동검"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-019": {
    "choices": [
      "단양 금굴·단양 수양개",
      "양양 오산리·제주 고산리",
      "여주 흔암리·부여 송국리",
      "고창 고인돌·서울 암사동"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-020": {
    "choices": [
      "미송리식 토기—청동기",
      "덧띠 토기—신석기",
      "검은 간토기—구석기",
      "덧무늬 토기—철기"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-021": {
    "choices": [
      "움집에서 정착 생활—씨족 중심의 부족 사회",
      "막집을 옮겨 다니는 생활—중앙 집권 국가",
      "구릉의 집터—군장 중심의 계급 사회",
      "철제 무기를 이용한 정복—평등한 씨족 사회"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-022": {
    "choices": [
      "동굴·바위 그늘을 이용하는 이동 생활",
      "구릉 지대의 직사각형 집터와 지상 가옥으로의 변화",
      "평양으로 수도를 옮기고 도성을 축조한 변화",
      "소도를 중심으로 천군이 제사를 담당한 변화"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260910-023": {
    "choices": [
      "철제 농기구",
      "청동 방울",
      "불",
      "농경용 간석기"
    ],
    "correctIndex": 2
  },
  "summary-hist-20260910-024": {
    "choices": [
      "곡식 이삭을 베는 농경 도구",
      "실을 잣는 도구",
      "철을 주조하는 거푸집",
      "종교 의례에 쓰는 도구"
    ],
    "correctIndex": 3
  },
  "summary-hist-20260910-025": {
    "choices": [
      "농경 사회와 선민사상, 부족의 결합 및 제정일치",
      "철기 농기구에 따른 연맹 왕국의 완성",
      "천군과 소도의 제정분리",
      "읍군·삼로가 지배하는 왕 없는 사회"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-026": {
    "choices": [
      "요동을 중심으로 성장하여 대동강 유역까지 발전했고 비파형 동검·탁자식 고인돌과 연결된다",
      "처음부터 대동강 유역에만 머물러 요동으로는 나아가지 못했고 유물로는 철기 화폐와 잔무늬 거울만 남겼다",
      "한반도 남부의 삼한에서 성장하여 소도와 천군을 두었다",
      "송화강 평야에서 사출도를 운영하고 영고를 열었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-027": {
    "choices": [
      "기원전 4~3세기경 연과 대립했고 기원전 3세기 초 연의 공격으로 서쪽 지역을 잃었다",
      "기원전 2세기 초 위만이 준왕을 몰아내기 전에 연과 동맹하여 고조선을 멸망시켰다",
      "한 무제의 침략 이전에는 중국 세력과 대립한 기록이 노트에 없다",
      "기원전 3세기 초 고조선이 연을 공격하여 요동을 처음 차지했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-028": {
    "choices": [
      "생명·재산을 보호하고 농경 사회의 질서를 유지하려 했다",
      "소도 안에 군장의 정치 권력이 미치지 않았다",
      "왕 없이 읍군·삼로가 읍락을 지배했다",
      "사출도에서 네 가가 지방을 나누어 다스렸다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-029": {
    "choices": [
      "위만이 준왕을 몰아내고 왕이 되었으며 시점은 기원전 2세기 초이다",
      "위만은 한 무제의 장군으로 왕검성을 함락시켰다",
      "위만은 고조선의 건국자인 단군왕검과 같은 인물이다",
      "위만의 집권은 기원전 3세기 초 연 장수 진개의 공격보다 앞선 일이다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-030": {
    "choices": [
      "철기 문화를 본격적으로 수용하고 주변 세력을 정복했으며 한과 진 사이의 중계 무역을 했다",
      "철기 문화를 거부하고 농경만 유지했으며 한과의 교역을 끊었다",
      "연의 공격 직후 왕검성이 함락되면서 준왕이 한 무제에게 항복해 위만 조선은 끝내 성립하지 못했다",
      "삼한의 소도에서 제사를 주관하며 한반도 남부를 통치했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-031": {
    "choices": [
      "한 무제의 침략—우거왕 사망과 왕검성 함락—기원전 108년",
      "연의 공격—우거왕 사망과 왕검성 함락—기원전 2333년",
      "위만의 집권—왕검성 함락—기원전 3세기 초",
      "한 무제의 침략—준왕 축출—기원전 2세기 초"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-032": {
    "choices": [
      "왕 아래 마가·우가·저가·구가가 있었고 사출도와 5부족 연맹으로 연결된다",
      "왕 없이 읍군·삼로가 지배했고 소금·어물을 공납했다",
      "신지·읍차와 천군·소도로 정치와 제사를 나누었다",
      "제가 회의 아래 사자·조의·선인이 있었고 옥저를 공납지로 두었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-033": {
    "choices": [
      "농경·목축과 말·주옥·모피",
      "소금·어물 공납과 가족 공동 무덤",
      "단궁·과하마·반어피와 책화",
      "변한의 철 생산과 낙랑·왜 교역"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-034": {
    "choices": [
      "압록강 지류 동가강 유역과 산악 지역—5부족 연맹·제가 회의",
      "송화강 유역의 넓은 평야 지대—사출도·마가·우가·저가·구가·영고",
      "함경도 지역—왕과 제가 회의가 함께 지배",
      "한반도 남부—천군과 소도가 정치적 지배를 담당"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-035": {
    "choices": [
      "왕이 없이 읍군·삼로가 다스렸고 소금·어물 등을 고구려에 공납했다",
      "왕 아래 사출도가 있었고 영고를 열었다",
      "족외혼과 책화가 있었고 단궁·과하마가 유명했다",
      "천군이 소도에서 제사를 주관하고 변한이 철을 생산했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-036": {
    "choices": [
      "강원도 북부 동해안—족외혼·책화—단궁·과하마·반어피",
      "함경도—민며느리제·가족 공동 무덤—소금·어물",
      "송화강 평야—형사취수제·영고—말·주옥·모피",
      "한반도 남부—서옥제·동맹—철 생산만 담당"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-037": {
    "choices": [
      "신지·읍차 같은 군장이 정치 지배를 하고 천군이 소도에서 제사를 담당했다",
      "왕이 여러 가를 거느리고 사출도에서 정치와 제사를 함께 담당했다",
      "읍군·삼로가 왕을 대신해 제사를 담당하고 고구려에 공납했다",
      "제가 회의가 소도를 통치하고 천군이 정복 활동을 담당했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-038": {
    "choices": [
      "고구려—서옥제 / 옥저—민며느리제 / 동예—족외혼",
      "고구려—민며느리제 / 옥저—족외혼 / 동예—서옥제",
      "고구려—족외혼 / 옥저—서옥제 / 동예—민며느리제",
      "고구려—소도 / 옥저—책화 / 동예—사출도"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-039": {
    "choices": [
      "부여—영고 12월 / 고구려—동맹 10월 / 동예—무천 10월",
      "부여—동맹 10월 / 고구려—영고 12월 / 동예—무천 5월",
      "부여—무천 10월 / 고구려—영고 12월 / 동예—동맹 10월",
      "부여—5월 수릿날 / 고구려—영고 12월 / 동예—동맹 10월"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-040": {
    "choices": [
      "둘 다 왕과 여러 세력이 함께 존재했지만 부여는 사출도, 고구려는 제가 회의와 연결된다",
      "둘 다 왕이 없고 읍군·삼로만 존재했다",
      "부여는 천군과 소도가, 고구려는 신지·읍차가 정치를 담당했고 두 나라 모두 왕 아래 회의 기구는 없었다",
      "부여는 삼한의 나라이고 고구려는 동예의 별칭이다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-041": {
    "choices": [
      "부여—송화강 유역 평야 / 옥저—함경도 / 동예—강원도 북부 동해안",
      "부여—강원도 동해안 / 옥저—송화강 평야 / 동예—함경도",
      "고구려—한반도 남부 / 삼한—압록강 지류 동가강 / 옥저—송화강",
      "동예—요동 / 부여—대동강 / 삼한—송화강"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-042": {
    "choices": [
      "농경·벼농사와 두레, 저수지가 발달했고 변한은 철 생산·교역과 연결된다",
      "목축·모피와 사출도가 발달했고 변한은 소금·어물을 공납했다",
      "단궁·과하마와 반어피가 대표이며 천군이 왕을 대신했다",
      "철제 무기와 연맹 왕국이 완성되었고 소도는 군장의 행정 구역이었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-043": {
    "choices": [
      "순장·우제점법·1책 12법",
      "민며느리제·가족 공동 무덤·책화",
      "서옥제·동맹·소도",
      "족외혼·무천·단궁"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-044": {
    "choices": [
      "부여·고구려—형사취수제 / 옥저—가족 공동 무덤",
      "부여·고구려—족외혼 / 옥저—서옥제",
      "부여—민며느리제 / 고구려—책화 / 옥저—형사취수제",
      "부여—가족 공동 무덤 / 고구려—민며느리제 / 옥저—순장"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-045": {
    "choices": [
      "대가 아래 사자·조의·선인이 있었고 옥저의 공납과 부경이 연결된다",
      "천군 아래 사자·조의·선인이 있었고 소도가 곡물 창고였다",
      "마가·우가·저가·구가 아래 부경이 있었고 사출도가 공납을 받았다",
      "읍군·삼로 아래 사자·조의·선인이 있었고 고구려는 옥저에 공납했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-046": {
    "choices": [
      "5월 수릿날과 10월 계절제가 있었고 천군이 제사를 주관했다",
      "12월 영고만 있었고 왕이 소도에서 제사를 주관했다",
      "10월 동맹만 있었고 신지·읍차는 제사만 담당했다",
      "10월 무천과 12월 영고가 있었고 소도에 군장 권력이 미쳤다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-047": {
    "choices": [
      "위만이 준왕을 몰아낸 해다",
      "단군왕검의 건국 이야기에 전하는 연대다",
      "한 무제의 침략으로 왕검성이 함락된 해다",
      "연의 공격으로 고조선이 서쪽 지역을 잃은 해다"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260910-048": {
    "choices": [
      "소도에 군장의 권력이 미치지 않는 제정분리",
      "지배 집단의 신성한 기원을 내세우는 선민사상",
      "모든 사람이 같은 정치 권한을 갖는 평등사상",
      "왕 없이 읍군과 삼로가 지배하는 정치 구조"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260910-049": {
    "choices": [
      "동명성왕·주몽—졸본 건국 / 유리왕—국내성 천도",
      "온조—졸본 건국 / 유리왕—평양 천도",
      "동명성왕—국내성 천도 / 장수왕—졸본 건국",
      "주몽—사비 건국 / 유리왕—웅진 천도"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-050": {
    "choices": [
      "옥저를 정복하고 계루부 고씨의 왕위 세습을 확립했다",
      "진대법을 실시하고 부족적 5부를 행정적 5부로 개편했다",
      "전진에서 불교를 받아들이고 태학을 설립했다",
      "서안평을 점령하고 낙랑군·대방군을 축출했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-051": {
    "choices": [
      "동천왕—위나라 관구검의 공격으로 환도성 함락",
      "미천왕—백제 근초고왕의 공격으로 평양성에서 전사",
      "고국원왕—낙랑군·대방군 축출",
      "고국천왕—당 태종을 안시성에서 저지"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-052": {
    "choices": [
      "부자 상속 확립·진대법 실시·부족적 5부를 행정적 5부로 개편",
      "옥저 정복·고씨 왕위 세습·평양 천도",
      "불교 수용·태학 설립·안시성 전투",
      "서안평 점령·낙랑군과 대방군 축출·평양 천도·왕검성 함락·율령 반포"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-053": {
    "choices": [
      "서안평을 점령하고 낙랑군·대방군을 축출하여 대동강 유역을 확보했다",
      "위나라 관구검을 물리치고 환도성을 지켰다",
      "백제 근초고왕의 군대를 막다가 평양성 전투에서 화살에 맞아 전사했다",
      "당 태종의 침입을 안시성에서 막았다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-054": {
    "choices": [
      "백제 근초고왕의 공격으로 평양성 전투에서 전사했다",
      "고구려 장수왕의 공격으로 한성에서 전사했다",
      "위나라 관구검의 공격으로 환도성에서 전사했다",
      "당 태종의 공격을 안시성에서 막은 뒤 전사했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-055": {
    "choices": [
      "율령을 반포하고 전진에서 불교를 받아들이며 태학을 설립했다",
      "진대법을 실시하고 행정적 5부를 정비했다",
      "평양으로 천도하고 백제 한성을 함락했다",
      "신라에 군대를 보내 왜를 격퇴하고 영락 연호를 사용했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-056": {
    "choices": [
      "427년 평양 천도와 475년 한성 함락",
      "백제 공격과 한강 이북 장악",
      "신라에 침입한 왜 격퇴",
      "거란·후연 공격과 요동·만주 진출"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-057": {
    "choices": [
      "신라에 침입한 왜를 격퇴하고 영락 연호를 사용했다",
      "평양 천도 후 한성을 함락하고 광개토 태왕릉비를 세웠다",
      "안시성에서 당 태종을 막고 천리장성을 축조했다",
      "전진에서 불교를 수용하고 태학을 설립했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-058": {
    "choices": [
      "천리장성을 축조했고 642년 정변 뒤 보장왕이 즉위했다",
      "살수 대첩 뒤 612년에 천리장성을 축조하고 유리왕이 즉위했다",
      "안시성 전투 뒤 668년에 보장왕이 즉위했다",
      "평양 천도와 함께 427년에 연개소문이 정변을 일으켰다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-059": {
    "choices": [
      "수 양제·을지문덕·살수 대첩은 612년, 당 태종·안시성은 645년이다",
      "수 양제·안시성 싸움은 645년, 당 태종·을지문덕의 살수 대첩은 612년이다",
      "수 양제·살수는 668년, 당 태종·안시성은 642년이다",
      "수와 당 모두 을지문덕이 안시성에서 격퇴했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-060": {
    "choices": [
      "안시성에서 당 태종의 침입을 막은 전쟁이다",
      "살수에서 수 양제의 침입을 막은 전쟁이다",
      "환도성에서 위나라 관구검의 공격을 막은 전쟁이다",
      "평양성에서 백제 근초고왕의 공격을 막은 전쟁이다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-061": {
    "choices": [
      "장기간 전쟁과 한강 유역 상실, 지배층 내부 갈등이 겹쳤고 연개소문 사후 권력 다툼도 이어졌다",
      "외부 공격은 전혀 없었고 농경 생산만 감소했다",
      "연개소문 생전에 지배층 내분으로 평양성이 함락되었다",
      "수 양제가 이끈 군대에 살수에서 패배한 직후인 612년에 고구려가 곧바로 멸망했고 다른 요인은 전혀 없었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-062": {
    "choices": [
      "고연무·검모잠·안승—고구려 부흥 운동, 신라의 지원",
      "복신·도침·부여풍—고구려 부흥 운동, 당의 지원",
      "흑치상지·부여풍·안승—모두 백제 부흥 운동",
      "고연무·검모잠·부여풍—고구려 부흥 운동, 신라와 무관"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-063": {
    "choices": [
      "금관가야—철 생산·해상 교통·낙랑과 왜를 잇는 교역 / 대가야—내륙 농업·제철·철 산지·중국·왜 교류",
      "금관가야—고령의 내륙 농업·제철·철 산지 확보 / 대가야—김해의 해상 교통·낙랑과 왜를 잇는 중계 교역",
      "금관가야—철 생산·중국 교류 / 대가야—목축·사출도",
      "금관가야—벼농사·소도 / 대가야—해상 교통·영고"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-064": {
    "choices": [
      "전기 금관가야—김해·철 생산·해상 교통 → 후기 대가야—고령·내륙 농업·제철",
      "전기 대가야—고령·해상 교통·철 생산 → 후기 금관가야—김해·내륙 농업·제철",
      "전기 금관가야—고령·제철 → 후기 대가야—김해·해상 교통",
      "전기 금관가야—김해·사출도 → 후기 대가야—고령·소도"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-065": {
    "choices": [
      "532년 법흥왕의 금관가야 병합 → 562년 진흥왕의 대가야 병합",
      "562년 법흥왕의 금관가야 병합 → 532년 진흥왕의 대가야 병합",
      "532년 진흥왕의 대가야 병합 → 562년 법흥왕의 금관가야 병합",
      "668년 보장왕의 금관가야 병합 → 676년 문무왕의 대가야 병합"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-066": {
    "choices": [
      "각 소국이 독자적인 정치 기반을 유지했기 때문이다",
      "각 소국이 하나의 중앙 왕권 아래 묶였지만 철 생산만 부족했기 때문이다",
      "금관가야에서 대가야로 중심이 이동하자 곧바로 중앙 집권이 완성되었기 때문이다",
      "532년 병합 뒤 가야의 소국들이 독자적인 정치 기반을 처음 유지했기 때문이다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-067": {
    "choices": [
      "수로왕 건국 이야기—『삼국유사』 가락국기 / 광개토 태왕 군대의 공격으로 타격",
      "수로왕 건국 이야기—『삼국사기』 열전 / 진흥왕 군대의 공격으로 타격",
      "대가야 건국 이야기—『삼국유사』 가락국기 / 법흥왕 때 562년 멸망",
      "금관가야 건국 이야기—단군 본기 / 장수왕의 평양 천도로 타격"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-068": {
    "choices": [
      "고국원왕의 위기—소수림왕의 제도 정비—광개토 태왕·장수왕의 팽창",
      "소수림왕의 제도 정비—고국원왕의 위기—장수왕의 건국",
      "장수왕의 팽창—고국원왕의 위기—소수림왕의 건국",
      "광개토 태왕의 팽창—동명성왕의 건국—고국원왕의 위기"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-069": {
    "choices": [
      "전연의 침략을 받았고 백제 근초고왕의 공격으로 평양성 전투에서 전사했다",
      "위나라 관구검을 물리치고 환도성을 지켰다",
      "전진에서 불교를 받아들이고 태학을 세웠으며 율령을 반포해 체제를 정비했다",
      "평양 천도 뒤 백제 한성을 함락했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-070": {
    "choices": [
      "중국 남북조와 교류·광개토 태왕릉비 건립·427년 평양 천도",
      "영락 연호·신라 지원·왜 격퇴·612년 살수 대첩",
      "전연 격퇴·태학 설립·한강 이북 장악·532년 금관가야 병합",
      "642년 정변·천리장성·562년 대가야 병합·안승 임명"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-071": {
    "choices": [
      "부여풍",
      "복신",
      "도침",
      "안승"
    ],
    "correctIndex": 3
  },
  "summary-hist-20260910-072": {
    "choices": [
      "왕과 귀족이 함께 정치를 논의한 회의",
      "천군이 제사를 지낸 신성 구역",
      "곡식을 보관하는 창고",
      "지방관을 감찰하는 관청"
    ],
    "correctIndex": 2
  },
  "summary-hist-20260910-073": {
    "choices": [
      "온조",
      "고이왕",
      "문주왕",
      "성왕"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-074": {
    "choices": [
      "근초고왕",
      "고이왕",
      "무령왕",
      "의자왕"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260910-075": {
    "choices": [
      "동진의 마라난타를 통해 불교를 받아들였다",
      "고구려 평양성을 공격하고 고국원왕을 전사시켰다",
      "사비로 천도하고 국호를 남부여로 바꾸었다",
      "신라와 혼인 동맹을 맺어 나·제 동맹을 강화했다"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260910-076": {
    "choices": [
      "전진-소수림왕",
      "동진-마라난타",
      "양-무령왕",
      "당-신문왕"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260910-077": {
    "choices": [
      "나·제 동맹",
      "혼인 동맹",
      "당과의 군사 동맹",
      "고구려와의 책봉 관계"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-078": {
    "choices": [
      "개로왕-문주왕",
      "문주왕-개로왕",
      "성왕-동성왕",
      "동성왕-무령왕"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-079": {
    "choices": [
      "22담로에 왕족 파견",
      "9주에 외사정 파견",
      "5경에 대내상 파견",
      "소도에 천군 파견"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-080": {
    "choices": [
      "웅진에서 사비로 천도하고 국호를 남부여로 정했다",
      "한성에서 웅진으로 천도하고 한강을 포기했다",
      "익산에 미륵사를 세우고 수도를 옮겼다",
      "대야성을 공격해 신라와 혼인 동맹을 맺었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-081": {
    "choices": [
      "익산 미륵사",
      "황룡사",
      "감은사",
      "석굴암"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-082": {
    "choices": [
      "대야성",
      "관산성",
      "한성",
      "평양성"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-083": {
    "choices": [
      "계백이 황산벌에서 싸운 뒤 사비성이 함락되고 의자왕이 항복했다",
      "복신이 황산벌에서 승리해 사비를 되찾았다",
      "장문휴가 당의 등주를 공격한 뒤 사비성을 함락시켜 백제를 멸망시켰다",
      "왕건이 일리천에서 백제군을 격파했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-084": {
    "choices": [
      "복신·도침·흑치상지-부여풍 추대와 백강 전투",
      "고연무·검모잠·안승-황산벌 전투",
      "김춘추·문무왕-대야성 탈환",
      "대문예·장문휴-주류성 부흥군"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-085": {
    "choices": [
      "박혁거세",
      "내물 마립간",
      "지증왕",
      "법흥왕"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-086": {
    "choices": [
      "김씨 왕위 세습을 확립하고 왜의 침입을 막기 위해 고구려 광개토 태왕에게 지원을 요청했다",
      "박씨 왕위 세습을 확립하고 나·제 동맹을 맺은 뒤 당에 사신을 보내 왜를 막을 지원을 요청했다",
      "금관가야를 병합하고 왜에 칠지도를 보냈다",
      "나·제 동맹을 맺고 백제 동성왕과 혼인했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-087": {
    "choices": [
      "국호를 신라로 정하고 왕 칭호를 사용했다",
      "우산국을 정복하고 우경을 장려했다",
      "순장을 금지하고 동시전을 설치했다",
      "율령을 반포하고 불교를 공인했다"
    ],
    "correctIndex": 3
  },
  "summary-hist-20260910-088": {
    "choices": [
      "율령 반포·불교 공인·병부 설치",
      "22담로·양과 교류·무령왕릉",
      "화랑도 국가 조직화·대가야 정복·국사 편찬",
      "관료전 지급·녹읍 폐지·국학 설치"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-089": {
    "choices": [
      "화랑도를 국가 조직으로 개편하고 거칠부에게 국사를 편찬하게 했으며 대가야를 정복했다",
      "불교를 처음 공인하고 병부를 설치했으며 율령을 반포하고 금관가야를 병합해 낙동강 하류까지 나아갔다",
      "신라 국호를 정하고 우산국을 정복했다",
      "관료전을 지급하고 녹읍을 폐지했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-090": {
    "choices": [
      "단양 적성비는 순수비 네 곳과 별도로 분류한다",
      "창녕비는 신문왕의 녹읍 폐지를 기록한 비석이다",
      "북한산비는 백제 성왕의 사비 천도를 기념한 비석이다",
      "황초령비와 마운령비는 발해 선왕의 비석이다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-091": {
    "choices": [
      "642년 고구려에 도움 요청이 결렬된 뒤 648년 당과 동맹을 맺었다",
      "648년 고구려에 도움 요청을 한 뒤 642년 당과 동맹을 맺었다",
      "660년 당과 동맹을 맺은 뒤 668년 고구려에 도움을 요청했다",
      "675년 고구려에 도움을 요청한 뒤 676년 당과 동맹을 맺었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-092": {
    "choices": [
      "660년 백제 멸망-668년 고구려 멸망",
      "642년 백제 멸망-648년 고구려 멸망",
      "675년 백제 멸망-676년 고구려 멸망",
      "926년 백제 멸망-935년 고구려 멸망"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-093": {
    "choices": [
      "매소성-675년, 기벌포-676년",
      "황산벌-675년, 관산성-676년",
      "공산-675년, 고창-676년",
      "등주-675년, 백강-676년"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-094": {
    "choices": [
      "웅진도독부·안동도호부·계림도독부",
      "9주·5소경·10정",
      "정당성·중정대·주자감",
      "6좌평·16관등·22담로"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-095": {
    "choices": [
      "고구려·백제 유민과 함께 당 세력을 몰아냈지만 대동강 이남 중심이라는 한계가 있었다",
      "당의 안동도호부 지배를 그대로 인정하는 대신 한반도 전역은 신라가 직접 통치하기로 합의했다",
      "고구려 옛 땅 대부분을 확보했지만 백제 유민은 배제했다",
      "백제 멸망 직후 전쟁 없이 삼국을 완전히 통합했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-096": {
    "choices": [
      "성왕-사비 천도, 법흥왕-금관가야 병합",
      "무령왕-사비 천도, 진흥왕-불교 공인",
      "고이왕-대가야 정복, 지증왕-22담로",
      "의자왕-6좌평 정비, 근초고왕-동시전 설치"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-097": {
    "choices": [
      "동진·왜와 교류하고 왜에 칠지도를 전했다",
      "양과 교류하고 22담로를 설치했다",
      "당과 동맹하고 계림도독부를 설치했다",
      "일본과 신라도를 개설하고 대흥 연호를 사용했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-098": {
    "choices": [
      "혼인 동맹을 맺어 나·제 동맹을 강화했다",
      "불교 수용을 함께 추진했다",
      "당과의 군사 동맹을 체결했다",
      "관산성 전투에서 함께 전사했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-099": {
    "choices": [
      "관산성 전투",
      "황산벌 전투",
      "공산 전투",
      "기벌포 전투"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-100": {
    "choices": [
      "신라는 고구려 부흥 운동을 지원하고 당의 한반도 지배 기구에 맞섰다",
      "신라는 당의 웅진도독부를 받아들여 통일을 포기했다",
      "신라는 발해의 10위를 지휘해 당을 물리쳤다",
      "신라는 후백제와 연합해 936년 일리천에서 당군을 격파했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-101": {
    "choices": [
      "부자 상속 확립과 마한 정복",
      "22담로에 왕족 파견과 양과의 교류",
      "사비 천도와 국호 남부여",
      "신라와 혼인 동맹을 통한 나·제 동맹 강화"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-102": {
    "choices": [
      "침류왕",
      "무령왕",
      "개로왕",
      "무왕"
    ],
    "correctIndex": 2
  },
  "summary-hist-20260910-103": {
    "choices": [
      "내물 마립간",
      "지증왕",
      "법흥왕",
      "진흥왕"
    ],
    "correctIndex": 2
  },
  "summary-hist-20260910-104": {
    "choices": [
      "법흥왕",
      "지증왕",
      "진흥왕",
      "소지 마립간"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-105": {
    "choices": [
      "영락",
      "건원",
      "인안",
      "대흥"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260910-106": {
    "choices": [
      "인안·대흥·건흥",
      "영락·건원·인안",
      "개국·대창·홍제",
      "건원·대흥·건흥"
    ],
    "correctIndex": 2
  },
  "summary-hist-20260910-107": {
    "choices": [
      "처음부터 김씨만 왕위를 계승하다가 내물 마립간 때 박씨 세습으로 완전히 바뀌었다",
      "초기에는 박·석·김씨가 왕위를 계승했고 내물 때 김씨 왕위 세습이 확립되었다",
      "초기에는 고씨와 부여씨가 교대로 왕위를 계승하였다",
      "내물 때 처음으로 모든 왕을 진골 출신으로 제한하였다"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260910-108": {
    "choices": [
      "대내상",
      "외사정",
      "상대등",
      "천군"
    ],
    "correctIndex": 2
  },
  "summary-hist-20260910-109": {
    "choices": [
      "왜의 지원을 받았으나 백강 전투 패배와 지도층 내분 등으로 실패했다",
      "당의 지원으로 신라를 공격하여 사비를 되찾고 왕조를 유지했다",
      "고구려의 안승을 왕으로 추대하고 보덕국으로 이어졌다",
      "거란의 지원을 받아 발해를 세우면서 부흥에 성공했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-110": {
    "choices": [
      "연합하여 한강 유역 회복을 추진했으나 이후 대립했고 성왕은 관산성 전투에서 전사했다",
      "처음부터 끝까지 나·제 동맹을 유지했고 성왕이 진흥왕과 함께 대가야 병합을 지휘했다",
      "성왕이 진흥왕의 한성을 공격해 개로왕을 전사시켰다",
      "진흥왕이 당과 연합하여 성왕을 황산벌에서 물리쳤다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-111": {
    "choices": [
      "진덕 여왕 때인 648년의 외교 활동이다",
      "태종 무열왕 즉위 뒤인 660년의 외교 활동이다",
      "문무왕 때인 676년의 전투 결과이다",
      "신문왕 때인 692년의 교육 정책이다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-112": {
    "choices": [
      "나·당 전쟁을 거쳐 676년 삼국 통일을 완성했다",
      "김흠돌의 난을 진압하고 국학을 설치했다",
      "녹읍을 부활시키고 한화 정책을 실시했다",
      "발해를 건국하고 동모산에 도읍했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-113": {
    "choices": [
      "김흠돌의 난을 진압하고 진골 귀족을 숙청했다",
      "장문휴를 보내 당의 등주를 공격했다",
      "견훤의 항복을 받아 후삼국을 통일했다",
      "고구려에 사신을 보내 왜의 침입을 막았다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-114": {
    "choices": [
      "관료전 지급·녹읍 폐지·국학 설치",
      "정전 지급·녹읍 부활·주자감 설치",
      "녹읍 지급·태학 설치·9주 폐지",
      "22담로 설치·관료전 지급·국사 편찬"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-115": {
    "choices": [
      "정전 지급",
      "녹읍 폐지",
      "녹읍 부활",
      "관료전 지급"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-116": {
    "choices": [
      "경덕왕",
      "성덕왕",
      "문무왕",
      "진흥왕"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-117": {
    "choices": [
      "집사부·시중을 중심으로 왕권이 강화되고 상대등·화백 회의의 기능은 약화되는 방향이었다",
      "집사부·시중이 발해의 정당성과 대내상을 대신했다",
      "집사부는 지방군 10정과 서당을 직접 지휘하고 시중은 유학 교육 기관인 주자감을 관할했다",
      "집사부·시중은 신라 말에 권한이 약화된 적이 없었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-118": {
    "choices": [
      "사정부",
      "중정대",
      "문적원",
      "외사정"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-119": {
    "choices": [
      "9주는 지방 행정 구역이고 5소경은 수도 편중을 보완하는 거점이었다",
      "9주는 중앙군이고 5소경은 지방군이었다",
      "9주는 발해의 지방 행정 제도이고 5소경은 백제가 왕족을 보낸 담로였다",
      "9주·5소경은 모두 신라의 중앙 교육 기관이었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-120": {
    "choices": [
      "외사정",
      "사정부",
      "대내상",
      "상대등"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-121": {
    "choices": [
      "9서당-중앙군, 10정-지방군",
      "10위-중앙군, 9정-지방군",
      "9서당-지방군, 10정-중앙군",
      "5경-중앙군, 15부-지방군"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-122": {
    "choices": [
      "고구려·백제·말갈계 사람도 포함한 중앙군이었다",
      "9주에 한 부대씩 배치한 지방군이었다",
      "발해의 10위와 같은 조직이었다",
      "유학 교육을 담당한 국학의 학생 조직이었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-123": {
    "choices": [
      "국학",
      "주자감",
      "태학",
      "문적원"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-124": {
    "choices": [
      "집사부 아래 위화부 등을 포함한 13부로 행정 업무를 나누었다",
      "정당성 아래 좌사정이 충·인·의부를, 우사정이 지·예·신부를 맡았다",
      "6좌평과 16관등으로 중앙 부서를 나누었다",
      "3성 6부 없이 오직 화백 회의로 행정했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-125": {
    "choices": [
      "왕위 쟁탈과 김헌창의 난·장보고의 난 등이 나타나며 왕권이 약해졌다",
      "신문왕이 진골 귀족을 숙청한 뒤 상대등 권한이 계속 약화되었다",
      "왕권 강화로 호족이 지방 행정권을 잃었다",
      "9서당 설치 직후 농민 봉기가 모두 사라졌다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-126": {
    "choices": [
      "상대등의 권한은 강화되고 시중의 권한은 약화되었다",
      "시중의 권한은 강화되고 상대등은 사라졌다",
      "정당성의 대내상이 신라 중앙을 장악했다",
      "외사정이 상대등을 대신해 왕이 되었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-127": {
    "choices": [
      "성주·장군을 자처하며 지방의 행정권과 군사권을 장악했다",
      "집사부의 시중으로 임명되어 중앙 행정을 독점했다",
      "주자감에서 유학을 가르치며 발해의 왕권을 강화했다",
      "9서당에 편입되어 지방 세력을 모두 해체했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-128": {
    "choices": [
      "골품제의 모순을 비판하고 개혁을 주장하며 호족과 연계했다",
      "진골 귀족의 왕위 세습을 강화하고 호족을 해체했다",
      "발해의 3성과 6부를 설치했다",
      "골품제의 제한 없이 상대등 등 최고 관직에 진출했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-129": {
    "choices": [
      "원종과 애노의 난",
      "적고적의 난",
      "김헌창의 난",
      "장보고의 난"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-130": {
    "choices": [
      "장보고의 청해진",
      "신문왕의 국학",
      "진흥왕의 황룡사",
      "선왕의 5경"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-131": {
    "choices": [
      "실천과 수행을 강조하는 사상 흐름으로 지방 호족의 성장과 연결된다",
      "경주 중심 관념을 넘어 지방의 중요성을 강조한 지리 사상이다",
      "경전과 교리를 중시하는 불교 흐름으로 선종과 구별된다",
      "유학 경전 교육을 담당한 국가 교육 기관이다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-132": {
    "choices": [
      "경주 중심의 지리 관념에서 벗어나 지방의 중요성을 뒷받침했다",
      "경주 중심 질서를 강화해 지방의 중요성을 부정했다",
      "실천과 수행을 강조한 불교 흐름과 같은 사상이다",
      "당 장안성을 본떠 도성을 설계한 발해의 건축 원리다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-133": {
    "choices": [
      "9주·5소경은 행정, 9서당·10정은 군사이다",
      "9서당·10정은 행정, 9주·5소경은 군사이다",
      "5경·15부·62주는 통일 신라의 행정, 10위는 신라 중앙군이다",
      "6좌평·16관등은 통일 신라 지방군, 22담로는 중앙 행정이다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-134": {
    "choices": [
      "달구벌 천도를 시도하고 감은사 건립 및 만파식적 설화와 연결된다",
      "달구벌로 천도에 성공해 금성을 버리고 수도를 그곳으로 완전히 옮겼다",
      "상경으로 천도하고 신라도를 개설했다",
      "동모산에 도읍하고 인안 연호를 사용했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-135": {
    "choices": [
      "최초의 진골 출신 왕으로 직계 자손의 왕위 세습과 연결된다",
      "최초의 성골 출신 왕으로 녹읍을 부활시켰다",
      "최초의 6두품 출신 왕으로 발해를 건국했다",
      "최초의 왕으로 국호 신라와 우산국 정복을 시행했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-136": {
    "choices": [
      "9주에 배치하되 한주에는 2정을 두었다",
      "5소경에 배치하되 수도에는 두지 않았다",
      "9주에 한 정씩만 배치해 모두 9정이었다",
      "발해의 10위와 같은 중앙군으로 편성했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-137": {
    "choices": [
      "김헌창의 난",
      "김흠돌의 난",
      "적고적의 난",
      "연개소문의 정변"
    ],
    "correctIndex": 2
  },
  "summary-hist-20260910-138": {
    "choices": [
      "사정부—태종 무열왕 / 외사정—문무왕",
      "사정부—문무왕 / 외사정—태종 무열왕",
      "사정부—신문왕 / 외사정—경덕왕",
      "사정부—성덕왕 / 외사정—진흥왕"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-139": {
    "choices": [
      "신문왕",
      "혜공왕",
      "성덕왕",
      "문무왕"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260910-140": {
    "choices": [
      "군·현",
      "성·부",
      "성·위",
      "서당·정"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-141": {
    "choices": [
      "대조영이 고구려 유민과 말갈인을 이끌고 동모산에서 698년에 건국했다",
      "대조영이 고구려 유민만 이끌고 상경에서 698년에 건국했다",
      "문왕이 고구려 유민과 말갈인을 이끌고 동모산에서 698년에 건국했다",
      "대조영이 고구려 유민과 말갈인을 이끌고 동모산에서 676년에 건국했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-142": {
    "choices": [
      "일본에 보낸 국서에서 고구려 왕을 칭했고 지배층에는 고구려인이 많았다",
      "고구려 계승을 부정하고 당의 지방 행정관만으로 지배했다",
      "말갈인의 참여를 부정하고 백제 왕족만으로 지배했다",
      "신라의 국서를 그대로 사용하고 신라 왕족이 지배층을 이루었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-143": {
    "choices": [
      "당의 등주",
      "신라의 대야성",
      "고구려의 평양성",
      "후백제의 완산주"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-144": {
    "choices": [
      "흑수 말갈 공격을 대문예에게 지시했으나 대문예가 당으로 망명했다",
      "당과 친선 외교를 유지하며 신라도를 처음 개설했다",
      "요동 진출과 5경·15부·62주 정비로 해동성국이 되었다",
      "상경을 개척하고 신라도를 개설해 문왕의 제도 정비를 완성했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-145": {
    "choices": [
      "당과 친선 관계를 맺고 신라도를 개설했으며 당의 제도·문물을 받아들였다",
      "당 등주를 공격하고 흑수 말갈 정벌을 지시했다",
      "고구려 옛 땅 대부분을 차지하고 해동성국이라 불리며 5경 15부 62주를 정비했다",
      "후고구려 국호를 마진과 태봉으로 바꾸었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-146": {
    "choices": [
      "중경에서 상경으로, 뒤에 동경으로 옮겼다",
      "동모산에서 완산주로, 뒤에 송악으로 옮겼다",
      "상경에서 중경으로, 뒤에 사비로 옮겼다",
      "웅진에서 사비로, 뒤에 상경으로 옮겼다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-147": {
    "choices": [
      "해동성국-5경·15부·62주",
      "인안-6좌평·16관등",
      "대흥-9주·5소경",
      "건원-22담로·5부"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-148": {
    "choices": [
      "5경·15부·62주",
      "9주·5소경·10정",
      "5부·22담로·6좌평",
      "3성·6부·9서당"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-149": {
    "choices": [
      "정당성",
      "선조성",
      "중대성",
      "집사부"
    ],
    "correctIndex": 3
  },
  "summary-hist-20260910-150": {
    "choices": [
      "정당성을 중심으로 국정을 총괄했다",
      "관리 감찰과 처벌만 담당했다",
      "서적과 외교 문서만 보관했다",
      "주자감에서 유교 교육을 담당했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-151": {
    "choices": [
      "좌사정은 충·인·의부, 우사정은 지·예·신부를 관할했다",
      "좌사정은 지·예·신부, 우사정은 충·인·의부를 관할했다",
      "좌사정은 정당성, 우사정은 중정대를 관할했다",
      "좌사정은 9서당, 우사정은 10정을 관할했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-152": {
    "choices": [
      "중정대",
      "사정부",
      "집사부",
      "외사정"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-153": {
    "choices": [
      "서적 관리와 주요 문서 작성을 담당했다",
      "지방군 10위를 지휘했다",
      "정당성의 국정을 총괄했다",
      "관리 감찰과 탄핵을 담당했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-154": {
    "choices": [
      "10위",
      "9서당",
      "10정",
      "5경"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-155": {
    "choices": [
      "주자감-유교 교육과 당 유학생 파견",
      "국학-발해 지방군 교육",
      "태학-발해 3성 교육",
      "문적원-신라 왕족 교육"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-156": {
    "choices": [
      "926년 거란의 침입으로 멸망했다",
      "935년 신라의 항복으로 멸망했다",
      "936년 일리천 전투에서 왕건에게 멸망했다",
      "660년 나·당 연합군에게 멸망했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-157": {
    "choices": [
      "정혜 공주 묘의 굴식 돌방무덤과 온돌·기와",
      "무령왕릉의 벽돌무덤과 22담로",
      "황산벌 전적지와 계백의 결사대",
      "단양 적성비와 진흥왕 순수"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-158": {
    "choices": [
      "무왕-인안 연호와 일본·돌궐 교류",
      "문왕-건흥 연호와 요동 진출",
      "선왕-대흥 연호와 신라도 개설",
      "대조영-인안 연호와 해동성국"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-159": {
    "choices": [
      "문왕 인안—선왕 대흥",
      "문왕 건원—선왕 영락",
      "문왕 건흥—선왕 대흥",
      "문왕 대흥—선왕 건흥"
    ],
    "correctIndex": 3
  },
  "summary-hist-20260910-160": {
    "choices": [
      "장안성",
      "국내성",
      "사비성",
      "왕검성"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-161": {
    "choices": [
      "중앙군 9서당—지방군 10정",
      "중앙군 10위—지방군은 지방관이 지휘",
      "중앙군 10정—지방군은 주자감이 지휘",
      "중앙군 10위—지방군은 문적원이 지휘"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260910-162": {
    "choices": [
      "당 제도를 받아들이면서 명칭과 운영에 독자성을 유지했다",
      "당 제도를 수용했으므로 중앙 관청의 이름과 운영도 모두 같았다",
      "당 제도를 거부하고 신라의 집사부와 9주만 그대로 두었다",
      "3성은 지방군이고 6부는 지방 유교 교육 기관이었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-163": {
    "choices": [
      "요동으로 진출하고 고구려의 옛 땅 대부분을 차지했다",
      "백제의 한성을 함락시켜 개로왕을 전사시켰다",
      "한강 유역을 장악하고 대가야를 병합했다",
      "완산주에 도읍하고 신라를 공격했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-164": {
    "choices": [
      "견훤-900년-완산주",
      "궁예-901년-송악",
      "왕건-918년-철원",
      "대조영-698년-동모산"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-165": {
    "choices": [
      "901년 후고구려를 세운 뒤 마진, 태봉으로 국호를 바꾸었다",
      "900년 후백제를 세운 뒤 고려로 국호를 바꾸었다",
      "918년 고려를 세운 뒤 마진, 태봉으로 바꾸었다",
      "698년 발해를 세운 뒤 상경, 동경으로 국호를 바꾸었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-166": {
    "choices": [
      "왕건",
      "견훤",
      "신검",
      "경순왕"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-167": {
    "choices": [
      "국호는 904년 마진, 911년 태봉으로 바뀌었고 905년 송악에서 철원으로 천도했다",
      "국호는 905년 마진, 911년 고려로 바뀌었고 904년 완산주로 천도했다",
      "국호 변경과 천도는 모두 왕건이 918년에 시행했다",
      "국호는 900년 후백제, 905년 태봉으로 바뀌었다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-168": {
    "choices": [
      "공산에서는 왕건이 견훤에게 패하고, 고창에서는 왕건이 후백제에 승리했다",
      "공산에서는 왕건이 견훤을 물리치고, 고창에서는 견훤이 왕건을 크게 물리쳤다",
      "두 전투 모두 발해와 거란 사이의 전투였다",
      "공산은 936년, 고창은 935년에 일어났다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-169": {
    "choices": [
      "견훤이 신검의 정변으로 쫓겨난 뒤 고려에 귀순했고, 같은 해 신라 경순왕도 고려에 항복했다",
      "견훤이 후백제를 세운 직후 신라 경애왕에게 항복했고, 경순왕은 고려가 아니라 발해로 망명했다",
      "신검이 고려에 귀순한 뒤 견훤이 신라 왕이 되었다",
      "경순왕이 935년에 후백제를 세우고 견훤이 신라를 통치했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-170": {
    "choices": [
      "936년 일리천 전투 등에서 고려가 신검의 후백제군을 격파했다",
      "930년 고창 전투 직후 발해가 고려에 병합되었다",
      "935년 공산 전투에서 고려가 후백제를 멸망시켰다",
      "926년 일리천 전투에서 신라가 후백제를 멸망시켰다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-171": {
    "choices": [
      "발해 멸망 → 공산 전투 → 경순왕의 고려 귀순 → 일리천 전투",
      "공산 전투 → 발해 멸망 → 경순왕의 고려 귀순 → 일리천 전투",
      "발해 멸망 → 공산 전투 → 일리천 전투 → 경순왕의 고려 귀순",
      "발해 멸망 → 경순왕의 고려 귀순 → 공산 전투 → 일리천 전투"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260910-172": {
    "choices": [
      "집사부",
      "정당성",
      "광평성",
      "문적원"
    ],
    "correctIndex": 2
  },
  "summary-hist-20260910-173": {
    "choices": [
      "풍수지리설",
      "유교의 예법",
      "선종의 수행 전통",
      "미륵 신앙"
    ],
    "correctIndex": 3
  },
  "summary-hist-20260910-174": {
    "choices": [
      "전진",
      "후당",
      "동진",
      "북위"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260911-001": {
    "choices": [
      "상수리 제도",
      "기인 제도",
      "사출도",
      "책화"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260911-002": {
    "choices": [
      "96각간의 난",
      "김흠돌의 난",
      "원종과 애노의 난",
      "연개소문의 정변"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260911-003": {
    "choices": [
      "6두품 — 설총",
      "6두품 — 김흠돌",
      "진골 — 거칠부",
      "성골 — 이차돈"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260911-004": {
    "choices": [
      "무태·성책·수덕만세·정개",
      "영락·건원·개국·대창",
      "인안·대흥·보력·건흥",
      "천수·광덕·준풍·경운"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260911-005": {
    "choices": [
      "정개 연호를 쓰고 후당·오월에 사신을 보내 오월로부터 검교태보의 직을 받았다",
      "건원 연호를 쓰고 전진에 사신을 보내 승려 순도를 맞이하며 불교를 받아들였다",
      "영락 연호를 쓰고 북위에 국서를 보내 고구려를 견제했다",
      "대흥 연호를 쓰고 신라도를 개설해 신라와 교류했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260911-006": {
    "choices": [
      "경애왕을 죽게 하고 김부를 경순왕으로 즉위시켰다",
      "경순왕을 죽이고 스스로 신라 왕이 되었다",
      "왕건을 사로잡아 후백제로 데려갔다",
      "신라의 항복을 받아 후삼국을 통일했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260911-007": {
    "choices": [
      "중앙 관청 22부, 지방 5부 5방",
      "6좌평 16관등, 22담로",
      "9주 5소경, 9서당 10정",
      "5경 15부 62주, 10위"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260911-008": {
    "choices": [
      "품주",
      "병부",
      "집사부",
      "사정부"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260911-009": {
    "choices": [
      "왕 아래 상가·대로·패자·고추가 등이 있고 대가들도 각각 사자·조의·선인을 두었다",
      "왕 아래 마가·우가·저가·구가가 있고 이들이 사출도를 나누어 다스리며 대사자·사자를 두었다",
      "왕 없이 읍군·삼로가 다스리고 소금·어물을 공납했다",
      "신지·읍차가 정치를 맡고 천군이 소도에서 제사를 주관했다"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260911-010": {
    "choices": [
      "봉산 지탑리 — 불에 탄 좁쌀",
      "부산 동삼동 — 비파형 동검",
      "연천 전곡리 — 주먹도끼",
      "고창 고인돌 — 반달 돌칼"
    ],
    "correctIndex": 0
  },
  "summary-hist-20260911-011": {
    "choices": [
      "온돌·이불병좌상·돌사자상·석등",
      "칠지도·무령왕릉·산수무늬 벽돌",
      "첨성대·황룡사 구층목탑·성덕대왕신종",
      "주먹도끼·빗살무늬 토기·반달 돌칼"
    ],
    "correctIndex": 0
  },
  "lecture-hist-20260911-001": {
    "choices": [
      "토지에 매겨 곡물이나 포를 거두는 것",
      "지역의 특산물을 바치게 하는 것",
      "요역·군역처럼 노동력을 징발하는 것",
      "귀족의 땅을 빌려 지은 농민이 수확의 절반 이상을 바치는 것"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-002": {
    "choices": [
      "소를 이용한 우경을 장려하고 농사철에는 부역 징발을 금지했다",
      "농사철에 부역을 집중적으로 징발해 황무지를 개간하게 했다",
      "모내기법(이앙법)을 전국에 보급해 벼와 보리의 이모작을 널리 퍼뜨렸다",
      "성덕왕 때처럼 모든 백성에게 정전을 나누어 주었다"
    ],
    "correctIndex": 0
  },
  "lecture-hist-20260911-003": {
    "choices": [
      "상인이 원료와 자금을 미리 대 주는 선대제가 널리 퍼졌다",
      "민간 수공업이 중심이었고 관청이 수공업자를 둔 일은 없었다",
      "사원(절)에서 종이·기와 등을 만드는 사원 수공업이 중심이었다",
      "관청에 수공업자를 배정해 왕실과 지배층에 필요한 무기·장신구 등을 만들었다"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-004": {
    "choices": [
      "신라—도시부 / 백제—동시전",
      "신라—동시전 / 백제—도시부",
      "신라—정사암 / 백제—동시전",
      "신라—동시전 / 백제—주자감"
    ],
    "correctIndex": 1
  },
  "lecture-hist-20260911-005": {
    "choices": [
      "삼국의 대외 무역은 1세기부터 주로 사무역 형태로 발달했다",
      "신라는 건국 초부터 당항성을 통해 중국과 직접 교역했다",
      "고구려는 중국 남북조·유목 민족과, 백제는 중국 남조·왜와 교류했다",
      "백제는 울산항을 통해 아라비아 상인과 교역했다"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-006": {
    "choices": [
      "한강 유역 확보—당항성",
      "대가야 정복—울산항",
      "금관가야 병합—영암",
      "청해진 설치—완도"
    ],
    "correctIndex": 0
  },
  "lecture-hist-20260911-007": {
    "choices": [
      "성덕왕 정전 지급 → 신문왕 관료전 지급·녹읍 폐지 → 경덕왕 녹읍 부활",
      "신문왕 관료전 지급·녹읍 폐지 → 경덕왕 녹읍 부활 → 성덕왕 정전 지급",
      "경덕왕 녹읍 폐지 → 성덕왕 정전 지급 → 신문왕 녹읍 부활",
      "신문왕 관료전 지급·녹읍 폐지 → 성덕왕 정전 지급 → 경덕왕 녹읍 부활"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-008": {
    "choices": [
      "조세는 수확량의 1/2 이상을 거두고, 공물은 촌락 단위로 특산물을 거두었다",
      "조세는 대체로 수확량의 1/10을 거두고, 공물은 촌락 단위로 특산물을 거두었다",
      "조세는 대체로 수확량의 1/10을 거두고, 공물은 토지 결수에 따라 쌀·베·동전으로 거두었다",
      "조세는 대체로 수확량의 1/10을 거두고, 역은 나이와 관계없이 모든 남녀에게 부과했다"
    ],
    "correctIndex": 1
  },
  "lecture-hist-20260911-009": {
    "choices": [
      "경주 불국사 3층 석탑 안에서 발견되었고 경주 부근 마을을 기록했다",
      "중국 둔황 석굴에서 발견되었고 인도와 중앙아시아의 나라들을 기록했다",
      "일본 도다이사 쇼소인에서 발견되었고 서원경(청주) 부근 4개 촌을 기록했다",
      "일본 도다이사 쇼소인에서 발견되었고 금관경(김해) 부근 10개 촌을 기록했다"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-010": {
    "choices": [
      "촌주가 토지·인구·소와 말·나무 등을 파악해 3년마다 작성했고, 조세와 노동력 징발에 활용했다",
      "지방관인 도독이 해마다 인구만 조사해 작성했고, 국학 학생의 관리 선발에 참고했다",
      "촌주가 10년마다 사찰의 승려 수와 탑의 수를 조사해 작성했고, 불교 공인에 활용했다",
      "집사부 시중이 귀족 회의 참석자와 발언을 기록해 작성했고, 화백 회의 의결에 활용했다"
    ],
    "correctIndex": 0
  },
  "lecture-hist-20260911-011": {
    "choices": [
      "진흥왕 때 동시를 열었고, 통일 후 신문왕이 동시를 폐지했다",
      "지증왕 때 동시·서시·남시를 한꺼번에 열었다",
      "지증왕 때 동시와 동시전을 두었고, 통일 후 서시·남시를 추가로 설치했다",
      "통일 후 처음으로 동시를 열었고, 지증왕 때 서시·남시를 더했다"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-012": {
    "choices": [
      "신라방—사원 / 신라소—거주지 / 신라원—관청",
      "신라방—관청 / 신라소—사원 / 신라원—거주지",
      "신라방—거주지 / 신라소—사원 / 신라원—관청",
      "신라방—거주지 / 신라소—관청 / 신라원—사원"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-013": {
    "choices": [
      "벽란도·울산항·당항성",
      "당항성·영암·울산항",
      "당항성·제물포·영암",
      "부산포·염포·제포"
    ],
    "correctIndex": 1
  },
  "lecture-hist-20260911-014": {
    "choices": [
      "완도에 청해진을 설치해 신라·당·일본을 잇는 해상 무역을 장악하고 법화원을 세웠다",
      "한강 유역을 확보한 뒤 당항성을 열어 중국 남조와 처음으로 직접 교역하는 길을 뚫었다",
      "산둥반도에 발해관을 두어 발해 사신의 교류 거점으로 삼았다",
      "벽란도를 중심으로 송·아라비아 상인과 교역했다"
    ],
    "correctIndex": 0
  },
  "lecture-hist-20260911-015": {
    "choices": [
      "벼농사 중심이었고 밭농사는 거의 이루어지지 않았으며 목축도 드물었다",
      "밭농사 중심이었고 솔빈부의 돼지와 막힐부의 말이 특산물로 유명했다",
      "밭농사 중심이었고 목축이 발달해 솔빈부의 말이 특산물로 유명했다",
      "밭농사 중심이었고 수렵으로 얻은 모피·녹용·사향을 주로 수입했다"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-016": {
    "choices": [
      "영주도·압록조공도—당 / 신라도—신라",
      "영주도—신라 / 거란도—당",
      "압록조공도—일본 / 일본도—당",
      "신라도—거란 / 거란도—신라"
    ],
    "correctIndex": 0
  },
  "lecture-hist-20260911-017": {
    "choices": [
      "발해관은 발해 수도 상경에, 신라방은 신라 수도 경주에 있던 외국인 거주지였다",
      "발해관은 신라 땅에, 신라방은 발해 땅에 두어 서로의 사신을 맞았다",
      "둘 다 일본에 있었고, 한 번에 수백 명의 사신과 상인이 머물렀다",
      "둘 다 당에 있었고, 발해관은 발해의 교류 거점, 신라방은 신라인 거주지였다"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-018": {
    "choices": [
      "고구려—정사암 / 백제—제가 회의 / 신라—화백 회의",
      "고구려—제가 회의 / 백제—화백 회의 / 신라—정사암",
      "고구려—제가 회의 / 백제—정사암 / 신라—화백 회의",
      "고구려—화백 회의 / 백제—정사암 / 신라—제가 회의"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-019": {
    "choices": [
      "왕족 부여씨와 8성 귀족이 지배층이었고, 진씨·해씨가 왕비족을 이루어 정사암에서 재상을 뽑았다",
      "왕족 고씨를 비롯한 5부 출신 귀족이 지배층이었고, 고국천왕 때 진대법을 실시했다",
      "귀족들이 정사암에 모여 정치를 논의하고 재상을 선출했다",
      "화백 회의에서 만장일치로 국가 중대사를 논의했다"
    ],
    "correctIndex": 1
  },
  "lecture-hist-20260911-020": {
    "choices": [
      "왕족 고씨와 5부 출신 귀족—정사암",
      "왕족 부여씨와 8성 귀족—화백 회의",
      "왕족 부여씨와 8성 귀족—정사암",
      "성골·진골 귀족—제가 회의"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-021": {
    "choices": [
      "관직 진출만 제한했을 뿐 가옥 규모나 장신구 같은 일상생활은 규제하지 않았다",
      "삼국 통일 후 6두품 이하는 모두 평민과 같은 신분이 되었다",
      "능력만 있으면 어느 골품이든 최고 관직까지 오를 수 있었다",
      "골품에 따라 관직 진출 상한이 있었고, 가옥·수레·장신구까지 규제했다"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-022": {
    "choices": [
      "진골 귀족만 낭도가 될 수 있어 신분 구별을 더욱 엄격하게 했다",
      "고구려의 경당에서 비롯되어 지방 청소년에게 유학과 무술을 가르쳤다",
      "원화에서 기원했고, 귀족인 화랑과 귀족·평민인 낭도로 구성되었다",
      "원효가 지은 세속 5계를 행동 규범으로 삼아 불교를 대중화했다"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-023": {
    "choices": [
      "원효의 무애가—진흥왕",
      "원광의 세속 5계—진흥왕",
      "원광의 세속 5계—법흥왕",
      "의상의 화엄일승법계도—진평왕"
    ],
    "correctIndex": 1
  },
  "lecture-hist-20260911-024": {
    "choices": [
      "골품제를 폐지하고 출신과 관계없이 능력에 따라 관직을 주었다",
      "9서당은 신라인만으로 구성하고 옛 백제·고구려 땅에는 주를 두지 않았다",
      "5경 15부 62주를 두어 옛 고구려 땅 대부분을 편입했다",
      "백제·고구려 귀족에게 관직을 주고, 9서당에 고구려인·백제인·말갈인까지 포함했다"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-025": {
    "choices": [
      "옛 신라 땅에 5주, 옛 백제·고구려 땅에 각각 2주를 두었다",
      "신라·고구려·백제의 옛 땅에 각각 3주씩 두었다",
      "옛 고구려 땅에만 9주를 두고 옛 신라 땅은 5소경으로 다스렸다",
      "수도 경주 주변에 9주를 모아 두어 수도를 지키게 했다"
    ],
    "correctIndex": 1
  },
  "lecture-hist-20260911-026": {
    "choices": [
      "진골과 함께 상대등·시중 등 최고 관직을 나누어 차지했다",
      "삼국 통일 후 3두품 이하와 함께 평민과 같은 신분이 되었다",
      "학문·실무로 국왕을 보좌했으나 관청의 장관은 될 수 없었다",
      "진골 대신 화백 회의를 이끌며 만장일치로 왕을 추대했다"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-027": {
    "choices": [
      "이두를 정리하고 신문왕에게 화왕계를 지어 바쳤다",
      "외교 문서에 능해 청방인문표를 지어 이름을 떨쳤다",
      "진골 출신으로 화랑세기·고승전·한산기를 지었다",
      "빈공과에 합격하고 진성 여왕에게 시무 10여 조를 올렸다"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-028": {
    "choices": [
      "진골 귀족의 왕위 다툼이 끝나고 호족이 몰락해 중앙의 지방 통제력이 강해졌다",
      "6두품의 개혁안이 받아들여져 골품제가 폐지되고 호족 세력이 사라졌다",
      "진골의 왕위 다툼과 귀족의 대토지 소유 속에 호족이 성장하고 농민 반란이 일어났다",
      "농민에게 정전 지급을 늘려 농민 반란이 줄고 중앙 집권이 강해졌다"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-029": {
    "choices": [
      "고구려인과 말갈인이 주민을 이루었고, 당의 제도를 받아들이면서도 고유 전통을 유지했다",
      "거란인과 여진인이 주민의 대부분이었고, 당의 제도를 받아들이지 않았다",
      "고구려인만으로 주민이 이루어졌고, 당의 제도·문화를 모두 거부했다",
      "고구려인과 말갈인이 주민을 이루었지만, 전통을 버리고 당의 풍습만 따랐다"
    ],
    "correctIndex": 0
  },
  "lecture-hist-20260911-030": {
    "choices": [
      "소수림왕 때 중앙에 태학을 세웠고, 지방의 경당에서는 유학과 무술을 가르쳤다",
      "태학은 지방에, 경당은 수도에 두어 두 곳 모두 귀족 자제만 가르쳤다",
      "장수왕 때 태학을 세워 평민 자제에게 유교 경전 대신 불교 경전을 가르쳤다",
      "경당은 승려를 기르는 절 부속 학교로, 불교 경전과 계율을 가르쳤다"
    ],
    "correctIndex": 0
  },
  "lecture-hist-20260911-031": {
    "choices": [
      "태학을 세워 귀족 자제에게 유교 경전과 역사서를 가르쳤다",
      "오경박사·의박사·역박사를 두고, 왕인이 일본에 논어를 전했다",
      "두 청년이 유학 경전 공부를 맹세한 내용을 돌에 새겨 남겼다",
      "주자감을 세워 유교 경전을 가르치고 당에 유학생을 보냈다"
    ],
    "correctIndex": 1
  },
  "lecture-hist-20260911-032": {
    "choices": [
      "사택지적비—신라 청년들의 유학 공부 맹세 / 임신서기석—백제의 한문학 수준",
      "사택지적비—고구려 태학의 교육 과정 / 임신서기석—신라 청년들의 유학 공부 맹세",
      "사택지적비—백제의 한문학 수준 / 임신서기석—발해 주자감의 교육 과정",
      "사택지적비—백제의 한문학 수준 / 임신서기석—신라 청년들의 유학 공부 맹세"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-033": {
    "choices": [
      "세속 5계를 지었고, 진흥왕 때 당에 건너가 군사 동맹을 맺고 걸사표를 올렸다",
      "두 청년과 함께 임신서기석을 새겨 유학 공부를 맹세했다",
      "세속 5계를 지었고, 진평왕 때 왕명으로 수에 군사를 청하는 걸사표를 지었다",
      "인도와 중앙아시아를 순례하고 왕오천축국전을 지었다"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-034": {
    "choices": [
      "신문왕—국학 학생의 유교 경전 이해 정도를 평가해 관리 선발에 참고했다",
      "원성왕—국학 학생의 유교 경전 이해 정도를 평가해 관리 선발에 참고했다",
      "원성왕—귀족 자제에게 유교 경전과 역사서를 가르치는 태학을 세웠다",
      "광종—쌍기의 건의로 과거제를 처음 실시했다"
    ],
    "correctIndex": 1
  },
  "lecture-hist-20260911-035": {
    "choices": [
      "설총—화왕계 / 강수—청방인문표 / 김대문—화랑세기",
      "설총—청방인문표 / 강수—화왕계 / 김대문—화랑세기",
      "설총—화왕계 / 강수—화랑세기 / 김대문—청방인문표",
      "설총—계원필경 / 강수—청방인문표 / 김대문—화왕계"
    ],
    "correctIndex": 0
  },
  "lecture-hist-20260911-036": {
    "choices": [
      "국학을 세우고 독서삼품과를 마련해 관리 선발에 참고했다",
      "중앙에 태학, 지방에 경당을 두어 유학과 무술을 가르쳤다",
      "6부에 충·인·의·지·예·신의 이름을 쓰고 주자감을 두었다",
      "오경박사를 두었고, 왕인이 일본에 논어와 천자문을 전했다"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-037": {
    "choices": [
      "고구려—태학 / 통일 신라—국학 / 발해—주자감",
      "고구려—국학 / 통일 신라—주자감 / 발해—태학",
      "고구려—주자감 / 통일 신라—태학 / 발해—국학",
      "고구려—태학 / 통일 신라—주자감 / 발해—국학"
    ],
    "correctIndex": 0
  },
  "lecture-hist-20260911-038": {
    "choices": [
      "신집—고흥(영양왕) / 서기—이문진(근초고왕) / 국사—거칠부(진흥왕)",
      "신집—이문진(소수림왕) / 서기—고흥(근초고왕) / 국사—거칠부(법흥왕)",
      "신집—이문진(영양왕) / 서기—고흥(근초고왕) / 국사—거칠부(진흥왕)",
      "신집—이문진(영양왕) / 서기—고흥(성왕) / 국사—김대문(진흥왕)"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-039": {
    "choices": [
      "고구려—금동 대향로 / 백제—사신도",
      "고구려—산수무늬 벽돌 / 신라—금동 대향로",
      "백제—사신도 / 신라—산수무늬 벽돌",
      "고구려—사신도 / 백제—금동 대향로·산수무늬 벽돌"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-040": {
    "choices": [
      "전진에 승려 파견을 요청해 불교를 공인했다",
      "수에 군사를 청하는 걸사표를 지었다",
      "도교를 진흥하려고 당에 도사 파견을 요청했다",
      "당에 유학생을 보내 빈공과에 응시하게 했다"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-041": {
    "choices": [
      "고구려 소수림왕—전진의 순도 / 백제 침류왕—동진의 마라난타",
      "고구려 소수림왕—동진의 마라난타 / 백제 침류왕—전진의 순도",
      "고구려 침류왕—전진의 순도 / 백제 소수림왕—동진의 마라난타",
      "고구려 장수왕—전진의 순도 / 백제 근초고왕—동진의 마라난타"
    ],
    "correctIndex": 0
  },
  "lecture-hist-20260911-042": {
    "choices": [
      "눌지왕 때 동진의 승려 마라난타가 전래했고, 법흥왕 때 공인되었다",
      "법흥왕 때 묵호자가 전래했고, 진흥왕 때 이차돈의 순교로 공인되었다",
      "지증왕 때 전진의 승려 순도가 전래해 곧바로 공인되었다",
      "눌지왕 때 묵호자가 전래했고, 법흥왕 때 이차돈의 순교로 공인되었다"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-043": {
    "choices": [
      "관세음보살을 믿어 현세의 고난을 구제받는 관음 신앙을 퍼뜨렸다",
      "‘나무아미타불’만 외우면 극락에 갈 수 있다는 아미타 신앙을 퍼뜨렸다",
      "인도와 중앙아시아를 순례하고 왕오천축국전을 지었다",
      "경전보다 실천 수행을 강조하며 9산 선문을 열었다"
    ],
    "correctIndex": 1
  },
  "lecture-hist-20260911-044": {
    "choices": [
      "관음 신앙—화엄일승법계도",
      "일심 사상—왕오천축국전",
      "화쟁 사상—십문화쟁론",
      "화쟁 사상—화왕계"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-045": {
    "choices": [
      "무애가를 지어 불교를 대중에게 퍼뜨렸다",
      "인도와 중앙아시아를 순례하고 기행문을 남겼다",
      "진평왕 때 수에 군사를 청하는 걸사표를 지었다",
      "당에서 유학하고 돌아와 화엄종을 열고 부석사를 세웠다"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-046": {
    "choices": [
      "원효—화엄일승법계도 / 의상—십문화쟁론",
      "원효—일심·화쟁 사상 / 의상—화엄종 개창·부석사",
      "원효—부석사 건립 / 의상—무애가 전파",
      "원효—당 유학 후 화엄종 개창 / 의상—대승기신론소"
    ],
    "correctIndex": 1
  },
  "lecture-hist-20260911-047": {
    "choices": [
      "의상",
      "원효",
      "혜초",
      "자장"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-048": {
    "choices": [
      "경전과 교리를 중시했고 중앙의 진골 귀족이 주로 후원했다",
      "‘나무아미타불’만 외우면 누구나 극락에 갈 수 있다고 가르쳤다",
      "실천 수행을 통한 깨달음을 추구해 지방 호족의 사상적 배경이 되었다",
      "산천 숭배·신선 사상과 결합해 귀족 사회를 중심으로 발달했다"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-049": {
    "choices": [
      "화엄일승법계도를 지어 화엄 사상을 정리했다",
      "선덕 여왕에게 황룡사 9층 목탑 건립을 건의했다",
      "진평왕 때 수에 군사를 청하는 걸사표를 지었다",
      "풍수지리설을 퍼뜨리는 데 큰 영향을 미쳤다"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-050": {
    "choices": [
      "금동 연가 7년명 여래 입상",
      "서산 용현리 마애 여래 삼존상",
      "경주 배동 석조 여래 삼존 입상",
      "이불병좌상"
    ],
    "correctIndex": 1
  },
  "lecture-hist-20260911-051": {
    "choices": [
      "통일 신라—이불병좌상 / 발해—석굴암 본존불",
      "통일 신라—서산 용현리 마애 여래 삼존상 / 발해—금동 연가 7년명 여래 입상",
      "통일 신라—석굴암 본존불 / 발해—금동 미륵보살 반가 사유상",
      "통일 신라—석굴암 본존불 / 발해—이불병좌상"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-052": {
    "choices": [
      "부여 정림사지 5층 석탑은 목탑 양식을 보이며 ‘평제탑’이라고도 불렸다",
      "고구려는 주로 석탑을 만들어 여러 기가 오늘날 남아 있다",
      "익산 미륵사지 석탑은 신라 선덕 여왕 때 자장의 건의로 세웠다",
      "경주 분황사 모전 석탑은 흙을 구워 만든 벽돌로 쌓은 전탑이다"
    ],
    "correctIndex": 0
  },
  "lecture-hist-20260911-053": {
    "choices": [
      "진흥왕 때 원효의 건의로 세웠고 지금도 경주에 남아 있다",
      "돌을 벽돌 모양으로 다듬어 쌓은 탑으로 지금도 남아 있다",
      "선덕 여왕 때 자장의 건의로 세웠고 고려 때 몽골 침입으로 불탔다",
      "신문왕 때 동서로 나란히 세운 두 기의 석탑이다"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-054": {
    "choices": [
      "양양 진전사지 3층 석탑은 벽돌로 쌓은 전탑이다",
      "불국사 다보탑에서 무구정광대다라니경이 발견되었다",
      "화순 쌍봉사 철감선사탑은 부처의 사리를 모신 쌍탑이다",
      "경주 감은사지 3층 석탑은 신문왕 때 세운 쌍탑이다"
    ],
    "correctIndex": 3
  },
  "lecture-hist-20260911-055": {
    "choices": [
      "경주 불국사 다보탑",
      "경주 감은사지 3층 석탑",
      "경주 불국사 3층 석탑",
      "경주 분황사 모전 석탑"
    ],
    "correctIndex": 2
  },
  "lecture-hist-20260911-056": {
    "choices": [
      "영광탑은 돌을 벽돌 모양으로 다듬어 쌓았고, 분황사 탑은 흙벽돌로 쌓은 전탑이다",
      "둘 다 나무로 만든 목탑이라 오늘날 남아 있지 않다",
      "영광탑은 벽돌로 쌓은 전탑이고, 분황사 탑은 돌을 벽돌 모양으로 다듬어 쌓은 모전 석탑이다",
      "둘 다 목탑에서 석탑으로 넘어가는 과도기의 탑이다"
    ],
    "correctIndex": 2
  },
  "summary-hist-20260912-01": {
    "choices": [
      "원성왕 → 흥덕왕 → 헌덕왕 → 문성왕 → 진성여왕",
      "헌덕왕 → 원성왕 → 흥덕왕 → 진성여왕 → 문성왕",
      "원성왕 → 헌덕왕 → 흥덕왕 → 문성왕 → 진성여왕",
      "원성왕 → 헌덕왕 → 문성왕 → 흥덕왕 → 진성여왕"
    ],
    "correctIndex": 2
  },
  "summary-hist-20260912-02": {
    "choices": [
      "왕의 장인 김흠돌이 난을 일으켰으나 진압되어 왕권이 오히려 강해졌다",
      "국학을 세워 유학 교육을 시작하고 9주 5소경을 정비했다",
      "백성에게 정전을 지급하고 수도에 서시·남시를 두었다",
      "진골 귀족 대공이 난을 일으켰고, 결국 왕이 피살되어 중대가 끝났다"
    ],
    "correctIndex": 3
  },
  "summary-hist-20260912-03": {
    "choices": [
      "관료전—성덕왕 / 정전—경덕왕 / 녹읍 부활—신문왕",
      "관료전—신문왕 / 정전—성덕왕 / 녹읍 부활—경덕왕",
      "관료전—경덕왕 / 정전—신문왕 / 녹읍 부활—성덕왕",
      "관료전—신문왕 / 정전—경덕왕 / 녹읍 부활—성덕왕"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260912-04": {
    "choices": [
      "원성왕",
      "헌덕왕",
      "흥덕왕",
      "혜공왕"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260912-05": {
    "choices": [
      "문성왕",
      "헌덕왕",
      "흥덕왕",
      "신무왕"
    ],
    "correctIndex": 2
  },
  "summary-hist-20260912-06": {
    "choices": [
      "헌덕왕의 명으로 김헌창의 난을 진압한 공을 인정받아 청해진을 얻었다",
      "청해진의 군사력을 바탕으로 신무왕의 즉위를 도왔으나, 뒤를 이은 문성왕 때 암살되었다",
      "희강왕과 민애왕을 차례로 몰아내고 스스로 왕위에 올라 청해진에서 나라를 다스렸다",
      "원종과 애노의 난을 일으킨 농민을 청해진 군사로 진압해 진성여왕을 도왔다"
    ],
    "correctIndex": 1
  },
  "summary-hist-20260912-07": {
    "choices": [
      "삼대목 편찬 · 김헌창의 난 · 독서삼품과 실시",
      "청해진 설치 · 원종과 애노의 난 · 최치원의 시무 10여 조",
      "국학 설치 · 적고적의 난 · 최치원의 시무 10여 조",
      "삼대목 편찬 · 원종과 애노의 난 · 최치원의 시무 10여 조"
    ],
    "correctIndex": 3
  },
  "summary-hist-20260912-08": {
    "choices": [
      "김흠돌의 난—중대 진골 귀족 / 김헌창의 난—하대 진골 출신 지방관 / 원종과 애노의 난—하대 농민",
      "김흠돌의 난—하대 진골 귀족 / 김헌창의 난—중대 진골 출신 지방관 / 원종과 애노의 난—하대 농민",
      "김흠돌의 난—중대 농민 / 김헌창의 난—하대 진골 귀족 / 원종과 애노의 난—하대 진골 출신 지방관",
      "김흠돌의 난—중대 진골 귀족 / 김헌창의 난—하대 농민 / 원종과 애노의 난—하대 진골 출신 지방관"
    ],
    "correctIndex": 0
  },
  "heritage-hist-20260912-01": {
    "choices": [
      "익산 미륵사지 석탑 — 백제 무왕 때 세운 석탑",
      "부여 정림사지 5층 석탑 — 신라 진흥왕 때 세운 석탑",
      "경주 분황사 모전 석탑 — 고구려 장수왕 때 세운 석탑",
      "경주 감은사지 3층 석탑 — 백제 성왕 때 세운 석탑"
    ],
    "correctIndex": 0
  },
  "heritage-hist-20260912-02": {
    "choices": [
      "익산 미륵사지 석탑 · 부여 정림사지 5층 석탑",
      "경주 분황사 모전 석탑 · 경주 황룡사 9층 목탑",
      "부여 정림사지 5층 석탑 · 경주 감은사지 3층 석탑",
      "익산 미륵사지 석탑 · 화순 쌍봉사 철감선사탑"
    ],
    "correctIndex": 0
  },
  "heritage-hist-20260912-03": {
    "choices": [
      "경주 분황사 모전 석탑 · 경주 황룡사 9층 목탑",
      "경주 분황사 모전 석탑 · 익산 미륵사지 석탑",
      "경주 황룡사 9층 목탑 · 경주 감은사지 3층 석탑",
      "경주 불국사 3층 석탑 · 경주 불국사 다보탑"
    ],
    "correctIndex": 0
  },
  "heritage-hist-20260912-04": {
    "choices": [
      "화순 쌍봉사 철감선사탑 — 통일 신라 하대의 승탑",
      "경주 불국사 다보탑 — 통일 신라 하대의 승탑",
      "경주 감은사지 3층 석탑 — 통일 신라 하대의 승탑",
      "경주 분황사 모전 석탑 — 신라 하대의 승탑"
    ],
    "correctIndex": 0
  },
  "heritage-hist-20260912-05": {
    "choices": [
      "금동 연가 7년명 여래 입상 — 고구려의 불상",
      "서산 용현리 마애 여래 삼존상 — 고구려의 불상",
      "경주 배동 석조 여래 삼존 입상 — 백제의 불상",
      "이불병좌상 — 통일 신라 경덕왕 때의 불상"
    ],
    "correctIndex": 0
  },
  "heritage-hist-20260912-06": {
    "choices": [
      "삼국 시대에 만들어졌으며 일본 고류사의 목조 미륵보살 반가 사유상과 모습이 비슷하다",
      "발해에서 만들어졌으며 두 부처가 나란히 앉은 모습으로 고구려 불상 양식을 이어받았다",
      "통일 신라 경덕왕 때 만들어졌으며 석굴암 안에 모신 본존불로 오늘날까지 널리 알려져 있다",
      "백제에서 만들어졌으며 ‘백제의 미소’로 불리는 바위에 새긴 마애 여래 삼존상으로 전해진다"
    ],
    "correctIndex": 0
  },
  "heritage-hist-20260912-07": {
    "choices": [
      "발해의 불상으로 고구려 불상 양식을 이어받은 것으로 본다",
      "백제의 불상으로 중국 남조 양식을 이어받은 것으로 본다",
      "고구려의 불상으로 광배에 연가 7년이라는 글자가 새겨져 있다",
      "통일 신라의 불상으로 경덕왕 때 석굴암에 모신 본존불이다"
    ],
    "correctIndex": 0
  },
  "heritage-hist-20260912-08": {
    "choices": [
      "신선과 산악을 담은 도교 요소와 연꽃 같은 불교 요소가 함께 나타난다",
      "산수무늬 벽돌과 함께 신라 귀족이 쓰던 도교 공예품으로 만들어졌다",
      "왜에 전해진 칠지도와 함께 고구려의 도교 신앙을 보여 주는 대표 유물이다",
      "무령왕릉에서 지석과 함께 나온 중국 남조풍의 청동 거울로 알려졌다"
    ],
    "correctIndex": 0
  },
  "heritage-hist-20260912-09": {
    "choices": [
      "한성기 서울 석촌동 계단식 돌무지무덤 — 웅진기 공주 무령왕릉 벽돌무덤",
      "한성기 공주 무령왕릉 벽돌무덤 — 웅진기 서울 석촌동 계단식 돌무지무덤",
      "한성기 서울 석촌동 굴식 돌방무덤 — 웅진기 경주 천마총 돌무지덧널무덤",
      "한성기 경주 천마총 돌무지덧널무덤 — 웅진기 부여 능산리 계단식 돌무지무덤"
    ],
    "correctIndex": 0
  },
  "heritage-hist-20260912-10": {
    "choices": [
      "고구려 무덤은 벽에 수렵도·사신도를 그렸고 천마총 천마도는 말다래에 그린 그림이다",
      "고구려 무덤은 벽에 천마도를 그렸고 신라 천마총의 수렵도는 말다래에 그린 그림이다",
      "두 무덤 모두 벽에 그림을 남겼고 천마총 천마도 역시 무덤 벽에 그린 벽화이다",
      "고구려 무덤에는 벽화가 없고 신라 돌무지덧널무덤의 벽에만 사신도 벽화가 남았다"
    ],
    "correctIndex": 0
  },
  "daily-hist-20260912-01": {
    "choices": [
      "갈돌·갈판 — 신석기의 조리 도구 / 반달 돌칼 — 청동기의 수확 도구",
      "갈돌·갈판 — 청동기의 수확 도구 / 반달 돌칼 — 신석기의 조리 도구",
      "갈돌·갈판 — 구석기의 사냥 도구 / 반달 돌칼 — 신석기의 조리 도구",
      "갈돌·갈판 — 신석기의 옷 만드는 도구 / 반달 돌칼 — 철기의 무기"
    ],
    "correctIndex": 0
  },
  "daily-hist-20260912-02": {
    "choices": [
      "거푸집 — 청동기를 한반도에서 직접 만들었음을 보여 준다",
      "명도전 — 청동기를 한반도에서 직접 만들었음을 보여 준다",
      "창원 다호리 붓 — 중국 화폐로 물건을 사고팔았음을 보여 준다",
      "오수전 — 이 무렵 한자를 쓰기 시작했음을 보여 준다"
    ],
    "correctIndex": 0
  },
  "daily-hist-20260912-03": {
    "choices": [
      "신석기는 원형 움집에 화덕이 가운데, 청동기는 직사각형 움집에 화덕이 벽 쪽에 있다",
      "신석기는 직사각형 움집에 화덕이 벽 쪽, 청동기는 원형 움집에 화덕이 가운데에 있다",
      "신석기에는 동굴과 막집을 옮겨 다녔고, 청동기에 처음으로 원형 움집이 나타났다",
      "두 시대 모두 화덕 없이 지상에 지은 집에 살았고 움집은 철기에 처음 나타났다"
    ],
    "correctIndex": 0
  },
  "daily-hist-20260912-04": {
    "choices": [
      "뗀석기 — 돌을 깨뜨려 만든 구석기 도구 / 간석기 — 돌을 갈아 만든 신석기 도구",
      "뗀석기 — 돌을 갈아 만든 신석기 도구 / 간석기 — 돌을 깨뜨려 만든 구석기 도구",
      "뗀석기 — 주먹도끼처럼 청동기에 쓴 도구 / 간석기 — 반달 돌칼처럼 철기에 쓴 도구",
      "뗀석기 — 슴베찌르개처럼 신석기 도구 / 간석기 — 가락바퀴처럼 청동기 도구"
    ],
    "correctIndex": 0
  },
  "daily-hist-20260912-05": {
    "choices": [
      "청동기 — 비파형 동검·거친무늬 거울 / 철기 — 세형 동검·잔무늬 거울",
      "청동기 — 세형 동검·잔무늬 거울 / 철기 — 비파형 동검·거친무늬 거울",
      "청동기 — 비파형 동검·잔무늬 거울 / 철기 — 세형 동검·거친무늬 거울",
      "청동기 — 세형 동검·거친무늬 거울 / 철기 — 비파형 동검·잔무늬 거울"
    ],
    "correctIndex": 0
  },
  "daily-hist-20260912-06": {
    "choices": [
      "주먹도끼 — 구석기 / 가락바퀴 — 신석기 / 반달 돌칼 — 청동기 / 거푸집 — 철기",
      "주먹도끼 — 신석기 / 가락바퀴 — 구석기 / 반달 돌칼 — 철기 / 거푸집 — 청동기",
      "주먹도끼 — 구석기 / 가락바퀴 — 청동기 / 반달 돌칼 — 철기 / 거푸집 — 신석기",
      "주먹도끼 — 청동기 / 가락바퀴 — 신석기 / 반달 돌칼 — 구석기 / 거푸집 — 철기"
    ],
    "correctIndex": 0
  },
  "photo-hist-20260912-01": photoQuestion([
    "부여 정림사지 5층 석탑",
    "경주 분황사 모전 석탑",
    "경주 감은사지 동·서 3층 석탑",
    "화순 쌍봉사 철감선사탑"
  ]),
  "photo-hist-20260912-02": photoQuestion([
    "익산 미륵사지 석탑",
    "경주 불국사 다보탑",
    "경주 분황사 모전 석탑",
    "화순 쌍봉사 철감선사탑"
  ]),
  "photo-hist-20260912-03": photoQuestion([
    "경주 불국사 3층 석탑(석가탑)",
    "경주 불국사 다보탑",
    "경주 감은사지 동·서 3층 석탑",
    "부여 정림사지 5층 석탑"
  ]),
  "photo-hist-20260912-04": photoQuestion([
    "경주 분황사 모전 석탑",
    "익산 미륵사지 석탑",
    "경주 감은사지 동·서 3층 석탑",
    "경주 불국사 다보탑"
  ]),
  "photo-hist-20260912-05": photoQuestion([
    "화순 쌍봉사 철감선사탑",
    "경주 불국사 다보탑",
    "경주 감은사지 동·서 3층 석탑",
    "익산 미륵사지 석탑"
  ]),
  "photo-hist-20260912-06": photoQuestion([
    "경주 황룡사지 목탑 터",
    "익산 미륵사지 석탑",
    "경주 감은사지 동·서 3층 석탑",
    "화순 쌍봉사 철감선사탑"
  ]),
  "photo-hist-20260912-07": photoQuestion([
    "경주 감은사지 동·서 3층 석탑",
    "익산 미륵사지 석탑",
    "경주 분황사 모전 석탑",
    "화순 쌍봉사 철감선사탑"
  ])
};
