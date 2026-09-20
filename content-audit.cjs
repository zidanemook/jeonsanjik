const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const practice=require('./practice.js'),bank=require('./practice-bank.js'),policy=require('./review-policy.js'),record=require('./review-record.js');
// 카드 하나 = 문제 하나. 복습 일정·진행 수·드릴이 모두 카드 단위로 도는데, 카드 하나가 여러 문장을 돌려 내면
// "전체 N문제"와 "지금 풀 차례 M문제"가 서로 다른 단위가 되고 대부분의 문장에 닿지 못한다(v56까지 영어 규칙 카드). 다시 들어오지 못하게 막는다.
const ONE_QUESTION='Every card must yield exactly one question (no multi-question bundles): ';
function catalog(){const ctx={GICHUL_READ:require('./gichul-files.cjs').read};vm.createContext(ctx);for(const f of ['core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung-explanations.js','hanneung.js','gichul-index.js','gichul.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);const cards=[...ctx.CORE_REVIEW_PACK];for(const id of Object.keys(bank))if(!cards.some(c=>c.id===id)){const e=practice.select({id,question:'',explanation:''},[],bank,ctx.QUIZ_OPTIONS);cards.push({id,subject:bank[id].subject||'영어',question:e?.question||'',explanation:e?.explanation||''});}
 for(const id of Object.keys(ctx.QUIZ_OPTIONS))assert(cards.some(c=>c.id===id),'Orphan MCQ: '+id);
 const ids=new Set(),items=[];
 for(const c of cards){assert(!ids.has(c.id),'Duplicate card');ids.add(c.id);const n=(ctx.QUIZ_OPTIONS[c.id]?1:0)+(bank[c.id]?.variants.length||0);assert.equal(n,1,ONE_QUESTION+c.id+' yields '+n);for(let i=0;i<n;i++){const exercise=practice.select(c,Array.from({length:i},()=>({cardId:c.id})),bank,ctx.QUIZ_OPTIONS);items.push({card:c,lesson:bank[c.id],exercise,conceptId:policy.concept(c.id)});}}
 return items;
}
function digest(item){return crypto.createHash('sha256').update(JSON.stringify([item.exercise,item.lesson||null,item.conceptId])).digest('hex');}
// 사진 보기 문항의 게이트. 사진은 공공누리 제1유형만 쓰고(제4유형은 상업적 이용·변경 금지),
// 출처표시 문자열이 보기마다 붙어 있어야 화면에 띄울 수 있다. 근거는 docs/IMAGE-LICENSE-LEDGER.md.
// 대체 텍스트에 국가유산 이름을 넣으면 화면 낭독기 사용자에게 정답이 그대로 새므로 금지한다.
function photos(e){
 if(!e.choiceImages)return;
 assert(!e.fixedOrder,'Photo options must still shuffle: '+e.exerciseId);
 assert.equal(Object.keys(e.choiceImages).length,e.choices.length,'Every photo option needs exactly one image: '+e.exerciseId);
 const seen=new Set();
 for(const choice of e.choices){
  const meta=e.choiceImages[choice];
  assert(meta&&typeof meta==='object','Photo option without an image: '+choice+' / '+e.exerciseId);
  assert(/^assets\/heritage\/[\w.-]+\.webp$/.test(meta.src||''),'Photo option must point at a repository webp: '+meta.src);
  assert(fs.existsSync(__dirname+'/'+meta.src),'Missing photo file: '+meta.src);
  assert(!seen.has(meta.src),'Two options share one photo: '+meta.src);seen.add(meta.src);
  assert(typeof meta.alt==='string'&&meta.alt.trim().length>=10,'Photo option needs alt text: '+choice);
  assert(!meta.alt.includes(choice),'Alt text must describe the photo, not name the option: '+choice);
  // 쓸 수 있는 사진은 두 갈래다. 공공 기관(국가유산청·국립중앙박물관)은 공공누리 제1유형(출처표시만 하면 상업 이용·변경 허용),
  // 위키미디어 공용은 CC0·CC BY·CC BY-SA(출처표시 조건). 비상업(NC)·변경금지(ND)는 어느 쪽이든 쓰지 않는다.
  // 국립중앙박물관은 2026-09-19에 천산대렵도(소장품 본관2094)를 받으며 늘렸다. 유형은 기관이 아니라 사진 한 장 단위로 확인한다.
  const credit=meta.credit||'';
  const nuri=/공공누리 제1유형/.test(credit)&&/(국가유산청|국립중앙박물관)/.test(credit);
  const commons=/위키미디어 공용/.test(credit)&&/(CC0|CC BY|Public domain)/.test(credit);
  assert(nuri||commons,'Photo option must carry a usable attribution (공공누리 제1유형 or Commons CC0/CC BY): '+choice);
  assert(!/NC|비상업|ND|변경\s*금지|제4유형/.test(credit),'Non-commercial or no-derivative photo must not be used: '+choice);
 }
}
function structural(items){const seen=new Set();for(const item of items){const e=item.exercise;assert(e.question.trim()&&e.explanation.trim(),'Missing question/explanation');assert(!seen.has(e.exerciseId),'Duplicate exercise identity');seen.add(e.exerciseId);
 if(e.type==='choice'){assert(e.choices.length>=2&&e.choices.length<=6);assert(Number.isInteger(e.correctIndex)&&e.correctIndex>=0&&e.correctIndex<e.choices.length);assert.equal(new Set(e.choices.map(practice.normalize)).size,e.choices.length,'Duplicate normalized options');photos(e);}
 else{assert(e.answers.length>0);assert.equal(new Set(e.answers.map(practice.normalize)).size,e.answers.length,'Duplicate accepted answer');for(const answer of e.answers)assert(practice.grade(e,answer),'Accepted answer rejected');}
 record.create(item.card,e,e.type==='choice'?e.correctIndex:e.answers[0],item.lesson,item.conceptId);
 if(item.lesson?.ruleId==='grammar-agreement-identity')assert(/한 명|두 명/.test(e.question),'Person count context required');
 }
}
// 목록 단위의 같은 불변식. catalog()는 원본을 읽을 때, single()은 이미 만든 문항 목록에서 확인한다.
function single(items){const seen=new Map();for(const item of items)seen.set(item.card.id,(seen.get(item.card.id)||0)+1);for(const [id,n]of seen)assert.equal(n,1,ONE_QUESTION+id+' yields '+n);}
// 영어 문제를 규칙 카드에서 나눈 뒤에도 같은 규칙의 문제는 한 개념으로 묶여 있어야 한다(하나를 틀리면 나머지가 형제 간격 뒤에 나온다).
// 나뉜 문제는 원래 규칙과 같은 개념, 문제집 Day 1은 같은 문법 포인트끼리 같은 개념이고 포인트가 다르면 개념도 다르다.
function concepts(items){
 const byPoint=new Map();
 for(const item of items){const l=item.lesson;if(!l)continue;assert(l.ruleId,'Rule id required: '+item.card.id);
  if(l.point){assert.equal(item.conceptId,policy.concept(item.card.id));if(!byPoint.has(l.point))byPoint.set(l.point,new Set());byPoint.get(l.point).add(item.conceptId);}
  else assert.equal(item.conceptId,policy.concept(l.ruleId),'A split question must keep its rule concept: '+item.card.id);}
 const owners=new Map();
 for(const [point,set]of byPoint){assert.equal(set.size,1,'One grammar point, one concept: '+point);const concept=[...set][0];assert(!owners.has(concept),'Two grammar points share a concept: '+point+' / '+owners.get(concept));owners.set(concept,point);}
}
function coverage(items,policy=JSON.parse(fs.readFileSync(__dirname+'/content-coverage.json','utf8'))){
 assert.equal(policy.schema,1);const byCard=new Map();for(const item of items){if(!byCard.has(item.card.id))byCard.set(item.card.id,[]);byCard.get(item.card.id).push(item);if(item.exercise.type==='choice'){const paper=item.card.id.startsWith('hanneung-');const n=item.exercise.choices.length;assert.ok(paper?n===5:(n===4||n===5),(paper?'Five options required: ':'Four or five options required: ')+item.card.id+' ('+n+')');assert.equal(new Set(item.exercise.choices).size,n,'Duplicate option: '+item.card.id);if(paper)assert(item.exercise.fixedOrder&&item.exercise.image,'Original choices and image required');
  // 인사혁신처 9급 기출은 원문 ①~④를 보기 글자에 그대로 달고 나온다. 순서를 섞으면 번호와 내용이 어긋난다.
  // 자체 제작 문항에서 보기를 섞지 않는 것은 연표 칸 표지((가)~(마))뿐이다. 다른 보기를 고정하면 정답 자리가 늘 같아진다(2026-09-16 순서 배열 10문항이 모두 ①이었다).
  if(!VERBATIM_OFFICIAL.test(item.card.id)&&item.exercise.fixedOrder)assert.equal(item.exercise.choices.join(),'(가),(나),(다),(라),(마)','Only timeline-slot labels may keep a fixed order in self-made questions: '+item.card.id);
  if(VERBATIM_OFFICIAL.test(item.card.id)&&!paper){assert(item.exercise.fixedOrder,'Official paper options must keep the exam order: '+item.card.id);
   item.exercise.choices.forEach((choice,i)=>assert(choice.startsWith(['①','②','③','④'][i]),'Official option must keep its printed number: '+item.card.id+' / '+choice));}}}
 // 영어 문법 범위 검사. v56까지는 카드 하나가 여러 문장을 돌려 냈으므로 "카드마다 직접쓰기 2개 이상 + 4지선다 + 규칙 정리"를 요구했다.
 // 이제 카드 하나가 문제 하나라 같은 요구를 규칙(ruleId) 단위로 건다: 모든 영어 문법 문제는 규칙 정리를 들고 있고,
 // 규칙마다 4지선다가 1개 이상, 직접쓰기가 주제별 하한(englishWrittenFloor) 이상이며, 한 규칙의 직접쓰기 문장은 모두 서로 다르다.
 const byRule=new Map();
 for(const [id,rows]of byCard){if(rows[0].card.subject!=='영어'||policy.englishNonGrammar.includes(id))continue;const lesson=rows[0].lesson;assert(lesson&&lesson.rule&&lesson.ruleId,'Grammar lesson required: '+id);if(!byRule.has(lesson.ruleId))byRule.set(lesson.ruleId,[]);byRule.get(lesson.ruleId).push(...rows);}
 for(const [rule,id]of Object.entries(policy.requiredRules))assert(byRule.has(id),'Missing coverage: '+rule+' / '+id);
 for(const [ruleId,rows]of byRule){
  const topic=rows[0].lesson.topic,floor=policy.englishWrittenFloor[topic],typed=rows.filter(x=>x.exercise.type==='text');
  assert(Number.isInteger(floor)&&floor>=1,'Written-question floor required for topic: '+topic);
  assert(rows.every(x=>x.lesson.topic===topic),'One rule belongs to one topic: '+ruleId);
  assert(typed.length>=floor,'At least '+floor+' written questions required: '+ruleId);
  assert(rows.some(x=>x.exercise.type==='choice'),'MCQ required: '+ruleId);
  assert.equal(new Set(typed.map(x=>practice.normalize(x.exercise.question))).size,typed.length,'Distinct written questions required: '+ruleId);
 }
 // 국어 교재 범위(사고의 힘 논리 1장~6장). 영어의 직접쓰기 하한은 걸지 않는다(위 반복문은 영어만 본다).
 // 대신 장마다 문제 수 하한(koreanTextbook.floor)과 필수 개념(requiredPoints)을 요구하고, 사용자 요청에 따라 모두 4지선다여야 한다.
 const byTopic=new Map();
 for(const [id,rows]of byCard){const lesson=rows[0].lesson;if(rows[0].card.subject!=='국어'||!lesson)continue;
  assert(lesson.rule&&lesson.ruleId&&lesson.point&&lesson.topic,'Korean textbook lesson required: '+id);
  assert(policy.koreanTextbook[lesson.topic],'Unknown Korean textbook range: '+lesson.topic+' / '+id);
  for(const x of rows)assert.equal(x.exercise.type,'choice','Korean textbook questions are four-option only: '+id);
  if(!byTopic.has(lesson.topic))byTopic.set(lesson.topic,[]);byTopic.get(lesson.topic).push(...rows);}
 for(const [topic,spec]of Object.entries(policy.koreanTextbook)){
  const rows=byTopic.get(topic)||[],points=new Set(rows.map(x=>x.lesson.point));
  assert(Number.isInteger(spec.floor)&&spec.floor>=1&&spec.requiredPoints.length>0,'Korean textbook spec required: '+topic);
  assert(rows.length>=spec.floor,'Korean textbook floor: '+topic+' has '+rows.length+', needs '+spec.floor);
  for(const point of spec.requiredPoints)assert(points.has(point),'Missing Korean coverage: '+topic+' / '+point);
 }
}
// 보기 길이로 정답을 맞히지 못하게 막는다. 4지선다에서 "가장 긴 보기"를 고르면 기대 정답률은 25%인데,
// 정답만 조건을 정확히 서술해 길어지면 이 비율이 올라가 지식 없이도 풀린다(2026-09-12 측정 38.1%).
// 공식 기출은 원문 표현을 한 글자도 바꾸지 않고 싣는 문항이라 분자에서도 분모에서도 뺀다.
// 보기를 늘여 비율을 맞추는 것 자체가 전사 위반이고, 분모에 넣으면 자체 제작 문항의 래칫만 헐거워진다.
// 대상은 id 접두사로만 가른다: 'hanneung-'(국사편찬위원회 심화 기출), 'gichul-'(인사혁신처 9급 기출).
// 사진 보기 문항도 제외한다. 보기 글자가 화면에 나오지 않아 '가장 긴 보기 고르기' 전략 자체가 성립하지 않고,
// 분모에 넣으면 래칫 비율만 희석되어 검사가 헐거워진다. 대신 photos()가 네 보기 전부 사진임을 따로 강제한다.
// LONGEST_LIMIT: 2026-09-16 복습용 한국사 86문항의 오답을 늘려 실측 2.8%(53/1927)로 조임(이전 7.3%).
// LONGEST_LIMIT: 국어 사고의 힘 논리 2장 보강 67·3장 181문제(모두 4지선다, 정답이 가장 긴 보기 12개) 추가 뒤 실측 10.7%(138/1291)를 상한으로 다시 조인 래칫(이전 12.1%, 13.5%, 15.8%, 21.2%, 27.8%). 문제를 더하다 이 값을 넘기면 실패한다.
// 2026-09-15: 한국사 자체 제작 165문제의 정답 노출(성씨·글자·종류·중심 보기)을 고친 뒤 실측 10.3%(133/1291, 0.10302)를 소수 셋째 자리에서 올린 0.104로 다시 조였다.
// 2026-09-15: 고려 10~12강 기반 기출형 48문제를 더하면서 정답이 유일하게 가장 긴 15문제의 오답 하나씩을 정확한 내용으로 늘려, 실측 133/1339(0.09933)를 소수 셋째 자리에서 올린 0.100로 다시 조였다.
// 2026-09-15: 선사~삼국·가야 55문제·통일 신라·발해·후삼국 53문제 기출형 연습을 더했다(새 108문제 중 정답이 유일하게 가장 긴 보기는 0개). 실측 133/1447(0.09191)을 소수 셋째 자리에서 올린 0.092로 다시 조였다.
// MARGIN: 실측 최대 초과폭 7자에 여유 5자를 더한 값. 후보 문항은 모두 통과하지만 24자씩 튀던 예전 문항은 걸린다.
// 2026-09-15(v79): 13강 고려(경제, 사회) 60문제(정답이 유일하게 가장 긴 보기 0개)를 더한 뒤 실측 133/1507(0.08825)을 소수 셋째 자리에서 올린 0.089로 다시 조였다.
// 2026-09-15(v80): 14강 고려(문화 I) 기출형 43문제(정답이 유일하게 가장 긴 보기 0개)를 더한 뒤 실측 133/1550(0.08581)을 소수 셋째 자리에서 올린 0.086으로 다시 조였다.
// 2026-09-15(v81): 문제집 Day 4 152문제(4지선다 102)를 더한 뒤 실측 134/1652(0.08111)를 소수 셋째 자리에서 올린 0.082로 다시 조였다.
// 2026-09-15(v82): 국어 사고의 힘 논리 4장 술어 논리 147·5장 귀납 논증 128문제(정답이 유일하게 가장 긴 보기 15개 가운데 10개는 오답을 정확한 내용으로 늘려 맞추고, 보기가 식에서 만들어지는 4문제와 이름 보기 1문제 5개만 남김)를 더한 뒤 실측 139/1927(0.07213)을 소수 셋째 자리에서 올린 0.073으로 다시 조였다.
// 2026-09-16(v97): 15강 고려(문화 2) 63문제(글자 보기 43문제 중 정답이 유일하게 가장 긴 보기 0개, 사진 보기 20문제는 분모 제외)를 더한 뒤 실측 51/2050(0.02488)을 소수 셋째 자리에서 올린 0.025로 다시 조였다.
// 2026-09-17(v98): 문법 공식 훈련 364문제(4지선다 238, 정답이 유일하게 가장 긴 보기 0개)를 더한 뒤 실측 51/2289(0.02228)를 소수 셋째 자리에서 올린 0.023로 다시 조였다.
// 2026-09-19(v100): 16강 조선 전기(정치) 80문제(정답이 유일하게 가장 긴 보기 0개 — 걸린 23문제는 오답을 정확한 내용으로 늘렸다)를 더한 뒤 실측 51/2369(0.02153)을 소수 셋째 자리에서 올린 0.022로 다시 조였다.
// LONGEST_LIMIT: 2026-09-20(v115) 문제집 Day 5 196문제(4지선다 130, 정답이 가장 긴 보기 0개)를 더한 뒤 실측 51/2499(0.02041)를 소수 셋째 자리에서 올린 0.021로 다시 조였다.
const LONGEST_LIMIT=0.021,MARGIN=12,VERBATIM_OFFICIAL=/^(?:hanneung|gichul)-/;
function lengthBias(items){
 const rows=items.filter(i=>i.exercise.type==='choice'&&!VERBATIM_OFFICIAL.test(i.card.id)&&!i.exercise.choiceImages);
 assert(rows.length>0,'No self-made choice exercises to measure');
 let longest=0,sum=0;
 for(const item of rows){
  const e=item.exercise,lengths=e.choices.map(c=>c.length),correct=lengths[e.correctIndex];
  const others=lengths.filter((_,i)=>i!==e.correctIndex),top=Math.max(...others);
  if(correct>top)longest++;
  sum+=correct-others.reduce((a,b)=>a+b,0)/others.length;
  assert(correct-top<=MARGIN,'Correct option longer than every distractor by more than '+MARGIN+' characters ('+(correct-top)+'): '+item.exercise.exerciseId);
 }
 const ratio=longest/rows.length;
 assert(ratio<=LONGEST_LIMIT,'Length bias regression: correct option is uniquely longest in '+longest+'/'+rows.length+' ('+(ratio*100).toFixed(1)+'%), above the '+(LONGEST_LIMIT*100).toFixed(1)+'% ratchet. Pad distractors instead of shortening correct answers.');
 return {total:rows.length,longest,ratio,delta:sum/rows.length,photo:items.filter(i=>i.exercise.choiceImages).length};
}
// 순서 배열 문항: 항목을 실제 순서대로 적으면 정답이 늘 '가 → 나 → 다 → 라'가 되어 지식 없이 풀린다(2026-09-15 사용자 지적, 23문제 중 12개).
// 자체 제작 문항에서는 가나다(라) 차례 그대로인 배열을 정답으로도 오답으로도 두지 않는다. 정답 하나를 늘 빼 두면 그것도 요령이 되기 때문이다.
function sequenceBias(items){
 const seq=/^[가나다라마](?: → [가나다라마])+$/,labels='가나다라마';let checked=0;
 for(const item of items){const e=item.exercise;if(e.type!=='choice'||VERBATIM_OFFICIAL.test(item.card.id)||!e.choices.every(c=>seq.test(c)))continue;checked++;
  for(const c of e.choices){const parts=c.split(' → ');assert(parts.join('')!==labels.slice(0,parts.length),'Label-order question offers the listing order '+c+' as a choice (list the items out of order): '+e.exerciseId);}}
 return checked;
}
function verify(items,ledger){single(items);structural(items);concepts(items);coverage(items);lengthBias(items);sequenceBias(items);assert.equal(ledger.schema,1);assert.equal(Object.keys(ledger.items).length,items.length,'Unreviewed addition/deletion');for(const item of items)assert.equal(ledger.items[item.exercise.exerciseId],digest(item),'Content changed: review meaning, alternatives and context before updating ledger: '+item.exercise.exerciseId);}
module.exports={catalog,digest,single,concepts,structural,coverage,lengthBias,sequenceBias,verify};
if(require.main===module){const items=catalog();verify(items,JSON.parse(fs.readFileSync(__dirname+'/content-review.json','utf8')));const bias=lengthBias(items);console.log('PASS content audit: '+items.length+' reviewed exercises, every card exactly one question; structure, answer acceptance, context regression and review fingerprints; length bias '+bias.longest+'/'+bias.total+' ('+(bias.ratio*100).toFixed(1)+'%, limit '+(LONGEST_LIMIT*100).toFixed(1)+'%, chance 25%) self-made choice answers uniquely longest, mean +'+bias.delta.toFixed(1)+' chars vs distractor average, per-question margin <='+MARGIN+'; '+bias.photo+' photo-option exercises gated by image/licence checks instead of option length');}
