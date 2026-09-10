// Adversarial content review, 2026-09-09. Do not overwrite historical answers.
(function(root){
const updates={
  "study-hist-20260910-05-b807d6a1": {
  "question": "고인돌을 통해 추론할 수 있는 청동기 시대 사회 모습은 무엇인가?",
  "answer": "큰 돌을 운반하고 세울 노동력을 동원할 지배층과 계급 분화가 있었다.",
  "explanation": "정답 근거\n고인돌은 청동기 시대 지배층과 계급 사회를 보여 주는 무덤 유적이다. 큰 돌을 운반하고 세우려면 여러 사람을 조직할 노동력과 이를 이끌 지배층이 필요했을 것으로 이해할 수 있다.\n\n보기 비교\n‘사냥과 채집을 위해 구성원이 계속 이동하는 평등 사회였다’는 구석기의 이동 생활과 평등 사회를 고인돌에 연결한 것이다. ‘정치적 지배와 제사 담당이 분리된 사회였다’는 삼한의 천군·소도와 관련된 제정분리이다. 고인돌만으로 철제 무기 생산의 국가 독점이나 중앙 집권을 추론할 수는 없다. 고인돌은 청동기 지배층과 계급 분화를 보여 주는 단서다.\n\n기억 연결\n고인돌은 큰 돌 자체보다 이를 세울 노동력의 조직과 지배층·계급 분화를 연결한다.",
  "note": "고인돌에서 철제 무기 생산의 국가 독점이나 중앙 집권까지 추론할 수 없다는 설명으로 바로잡았습니다. 문제와 정답은 같습니다."
},
  "core-ko-2026seoul-1-e519ca9b": {
    "question": "공공문서에서 “지원 계획을 수립하여”를 “지원 계획 수립하여”로 고쳤다. 조사·어미를 지나치게 생략하지 않는다는 원칙에 비추어 적절한가?",
    "explanation": "이 문제는 제시된 공공문서 작성 원칙을 적용하는 문제다. 목적어인 ‘지원 계획’ 뒤의 ‘을’을 빼는 수정은 그 원칙에 맞지 않는다. 일상 대화에서도 조사를 절대로 생략할 수 없다는 일반 규칙으로 확대하지 않는다.",
    "answer": "부적절하다. 목적격 조사 “을”을 생략했다.",
    "note": "제시된 공공문서 작성 원칙의 적용임을 분명히 했습니다. 일상 대화에서의 조사 생략까지 금지하는 규칙이 아닙니다."
  },
  "core-ko-2026seoul-17-43ae156d": {
    "question": "“맑게”와 “젊다”의 표준 발음을 바르게 짝지은 것은?",
    "explanation": "맑게의 ㄺ은 용언 어간 끝에서 ㄱ 앞에 있으므로 ㄹ로 발음하고, 뒤의 ㄱ은 된소리 ㄲ이 된다. 젊다의 ㄻ은 자음 앞에서 ㅁ으로 발음하고, 어간 뒤의 ㄷ도 된소리 ㄸ이 된다. 따라서 [말께], [점ː따]다. ː는 앞 모음을 길게 발음한다는 표시다.",
    "answer": "맑게 [말께], 젊다 [점ː따]",
    "note": "젊다에도 된소리되기가 적용된다는 설명과 소리 길이 표시를 보완했습니다. 정답은 같습니다."
  },
  "core-hist-79-3-13da165": {
    "question": "백제의 지방 22담로에 왕족을 파견해 지방 통제를 강화한 왕은?",
    "explanation": "22담로에 왕족을 파견한 업적은 무령왕과 연결한다. 원문은 삼근왕 이후에 있었던 일을 묻는다. 삼근왕의 바로 다음 왕을 묻는 문제가 아니므로 두 질문을 혼동하지 않는다.",
    "answer": "무령왕",
    "note": "삼근왕의 바로 다음 왕을 묻는 문제와 혼동하지 않도록 설명을 보완했습니다. 정답은 무령왕입니다."
  },
  "en-session-20260909-wish-104aeb0f": {
    "question": "작년에 더 열심히 공부했더라면 좋을 텐데.\nI wish I ___ harder last year.\nstudy를 had + 과거분사 형태로 바꿔 빈칸에 쓸 말만 입력하세요.",
    "explanation": "과거 공부에 대한 아쉬움을 이번 문제에서 지정한 had + 과거분사로 쓰면 had studied다. 과거의 지속적인 공부를 아쉬워할 때는 had been studying도 가능하지만, 이 문제는 형태를 지정했다.",
    "answer": "had studied",
    "note": "had been studying도 가능한 문맥이라, 이제 문제에서 had + 과거분사 형태를 지정합니다."
  },
  "en-session-20260909-comparative-dac1c09e": {
    "question": "___ you drive, ___ the risk becomes.\n“더 빨리 운전할수록 위험은 더 커진다”에 알맞은 짝은?",
    "explanation": "the + 비교급 ..., the + 비교급 ...으로 두 변화의 관계를 나타낸다. The faster you drive, the greater the risk becomes. faster는 운전하는 속도를, greater는 위험의 크기를 나타낸다.",
    "answer": "The faster / the greater",
    "note": "두 변화의 관계가 더 분명한 운전 속도와 위험 예문으로 바꿨습니다. 이전 문장의 비교급 구조는 맞습니다."
  },
  "en-session-20260909-poor-as-92fc6d6a": {
    "question": "Exhausted as she was, she kept working.\n앞부분을 같은 뜻으로 바꾼 것은?",
    "explanation": "여기서 Exhausted as she was는 Although she was exhausted, 즉 ‘몹시 지쳤지만’이라는 양보 의미다. 지쳤는데도 일을 계속했다는 상황이 양보 관계를 분명히 해 준다. 형용사 + as + 주어 + 동사가 항상 양보라는 뜻은 아니며 문맥도 확인한다.",
    "answer": "Although she was exhausted",
    "note": "양보 관계가 분명한 피곤함과 작업 지속 예문으로 바꿨습니다. 이전 문장의 문법은 맞습니다."
  },
  "en-session-20260909-adverb-32b9b3fb": {
    "question": "Bats are ___ long-lived.\n“박쥐는 놀라울 정도로 오래 산다”라는 뜻이 되도록 빈칸에 알맞은 말을 고르세요.",
    "explanation": "이 문장은 형용사 long-lived의 정도를 ‘놀라울 정도로’라고 꾸미므로 부사 surprisingly가 맞다. 명사 앞에서는 surprising creatures처럼 surprising이 생물을 직접 꾸밀 수도 있다. 따라서 단어의 위치와 수식 대상을 함께 확인한다.",
    "answer": "surprisingly",
    "note": "이전 문장에서는 surprising이 creatures를 직접 꾸미는 해석도 가능했습니다. 형용사의 정도를 수식한다는 조건이 분명한 문장으로 바꿨습니다."
  },
  "en-session-20260909-time-clause-2a7b644b": {
    "question": "When I ___ home, I will call you.",
    "explanation": "집에 도착하는 미래의 때를 정하는 시간 부사절이므로 보기 중 get이 맞다. 이런 절에서는 단순한 미래 예측의 will 대신 단순현재를 쓰고, 완료를 강조하려면 현재완료도 가능하다. 모든 when절에 적용하는 규칙은 아니다.",
    "answer": "get",
    "note": "현재완료형 has arrived와 has stopped도 올바른 답입니다. 이전 채점에서 이를 오답 처리했다면 문항의 허용 답안 누락입니다."
  },
  "en-session-20260909-time-clause-62edc4c9": {
    "question": "[will arrive]를 arrive의 단순현재 또는 현재완료 형태로 고쳐 쓰세요.\nWhen she [will arrive], we will leave.",
    "explanation": "arrives와 has arrived 모두 가능하다. has arrived는 도착이 완료된 다음 출발한다는 점을 강조한다. 미래의 때를 정하는 이 부사절에서는 단순한 미래 예측의 will arrive를 쓰지 않는다.",
    "answer": "arrives / has arrived",
    "note": "현재완료형 has arrived와 has stopped도 올바른 답입니다. 이전 채점에서 이를 오답 처리했다면 문항의 허용 답안 누락입니다."
  },
  "en-session-20260909-time-clause-39d9e6fe": {
    "question": "“비가 그칠 때까지 기다릴게.”\nI will wait until the rain ___.\nstop의 단순현재 또는 현재완료 형태로 빈칸만 쓰세요.",
    "explanation": "stops와 has stopped 모두 가능하다. has stopped는 비가 그친 상태에 도달함을 강조한다. until 뒤라고 현재완료가 금지되는 것은 아니다.",
    "answer": "stops / has stopped",
    "note": "현재완료형 has arrived와 has stopped도 올바른 답입니다. 이전 채점에서 이를 오답 처리했다면 문항의 허용 답안 누락입니다."
  },
  "en-session-20260909-difficulty-129c396e": {
    "question": "[understand]를 -ing형으로 고쳐 쓰세요. 이 표현에서 선택적인 전치사 in은 함께 써도 됩니다.\nShe has difficulty [understand] the rule.",
    "explanation": "have difficulty understanding과 have difficulty in understanding 모두 가능하다. in을 넣거나 생략할 수 있다는 규칙을 채점에도 똑같이 적용한다.",
    "answer": "understanding / in understanding",
    "note": "in understanding도 올바른 답입니다. 이전 채점에서 이를 오답 처리했다면 문항의 허용 답안 누락입니다."
  },
  "en-session-20260909-used-to-a365382d": {
    "question": "동사 [answer]를 -ing형으로 고쳐 쓰세요.\nI got used to [answer] calls at night.",
    "explanation": "answer calls는 전화를 받는다는 뜻이다. get used to의 to는 전치사이므로 뒤의 동사 answer를 answering으로 바꾼다.",
    "answer": "answering",
    "note": "work를 명사로 읽을 여지를 없애고, 동명사를 연습한다는 지시를 명확히 했습니다."
  },
  "core-en-2026national-17-2b528299": {
    "question": "글의 중심 내용은 “젊은 직원들이 관리자 역할을 피한다”이다. 이 중심 내용과 반대 방향인 문장은?",
    "explanation": "관리자 역할을 피한다는 중심 내용에 비추면, 관리자로 승진하여 남을 감독하고 싶다는 문장이 반대 방향이다. 단어가 비슷한지보다 주장 방향을 비교한다.",
    "answer": "그들은 남을 감독하고 싶어 관리자 승진에 적극적이다.",
    "note": "같은 문장을 지지/반대 중에서 고르던 연습을 네 문장 중 논지에 반대되는 문장을 고르는 문제로 바꿨습니다."
  },
  "core-hist-79-8-9fffcaac": {
    "question": "신문왕 때 설치된 신라의 중앙 교육기관은? 교수 담당 관직 두 가지는?",
    "explanation": "신문왕 때 신라의 중앙 교육기관은 국학이고, 박사와 조교를 두었다. 고려 국자감과 조선 향교·성균관은 시기와 기관이 다르다. 직강·박사라는 짝 자체를 잘못된 사실로 외우지는 않는다. 고려 공민왕 때 국자감에도 직강과 박사가 있었지만, 이 문제는 신라를 묻기 때문에 오답이다.",
    "answer": "국학 — 박사·조교",
    "note": "고려 공민왕 때 국자감에도 직강과 박사가 있었습니다. 관직 짝 자체가 잘못된 것이 아니라 신문왕 때 신라를 묻는 문항이라 오답이라는 점을 명확히 했습니다."
  },
  "en-session-20260909-debate-head-7245efb5": {
    "question": "The debate over salaries that ___ for a year remains unresolved.",
    "explanation": "관계절의 동작 rage는 여기서 논쟁 등이 격렬하게 계속된다는 뜻이다. 후보를 넣으면 the debate has been raging은 자연스럽지만, 임금 액수들인 the salaries have been raging은 이 문맥의 뜻에 맞지 않는다. 따라서 debate를 가리키는 that에 단수 has를 쓴다. 가까운 명사나 주절 주어를 무조건 고르는 규칙은 아니다.",
    "answer": "has been raging",
    "note": "관계절의 동작에 후보 명사를 각각 넣어 선행사를 판단하는 절차를 보완했습니다. 정답은 그대로입니다."
  }
};
function find(snapshot){const u=updates[snapshot?.exerciseId];return u&&(snapshot.question!==u.question||snapshot.explanation!==u.explanation)?u:null;}
const api={find};root.ContentCorrections=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
