const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const practice=require('./practice.js'),bank=require('./practice-bank.js'),policy=require('./review-policy.js'),record=require('./review-record.js');
// 카드 하나 = 문제 하나. 복습 일정·진행 수·드릴이 모두 카드 단위로 도는데, 카드 하나가 여러 문장을 돌려 내면
// "전체 N문제"와 "지금 풀 차례 M문제"가 서로 다른 단위가 되고 대부분의 문장에 닿지 못한다(v56까지 영어 규칙 카드). 다시 들어오지 못하게 막는다.
const ONE_QUESTION='Every card must yield exactly one question (no multi-question bundles): ';
function catalog(){const ctx={GICHUL_READ:require('./gichul-files.cjs').read};vm.createContext(ctx);for(const f of ['core-review-pack.js','quiz-options.js','hanneung-data.js','hanneung-explanations.js','hanneung.js','gichul-index.js','gichul.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);const cards=[...ctx.CORE_REVIEW_PACK];for(const id of Object.keys(bank))if(!cards.some(c=>c.id===id)){const e=practice.select({id,question:'',explanation:''},[],bank,ctx.QUIZ_OPTIONS);cards.push({id,subject:'영어',question:e?.question||'',explanation:e?.explanation||''});}
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
  assert(/공공누리 제1유형/.test(meta.credit||'')&&/국가유산청/.test(meta.credit||''),'Photo option must carry its 공공누리 제1유형 attribution: '+choice);
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
 assert.equal(policy.schema,1);const byCard=new Map();for(const item of items){if(!byCard.has(item.card.id))byCard.set(item.card.id,[]);byCard.get(item.card.id).push(item);if(item.exercise.type==='choice'){const paper=item.card.id.startsWith('hanneung-');assert.equal(item.exercise.choices.length,paper?5:4,(paper?'Five options required: ':'Four options required: ')+item.card.id);if(paper)assert(item.exercise.fixedOrder&&item.exercise.image,'Original choices and image required');
  // 인사혁신처 9급 기출은 원문 ①~④를 보기 글자에 그대로 달고 나온다. 순서를 섞으면 번호와 내용이 어긋난다.
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
}
// 보기 길이로 정답을 맞히지 못하게 막는다. 4지선다에서 "가장 긴 보기"를 고르면 기대 정답률은 25%인데,
// 정답만 조건을 정확히 서술해 길어지면 이 비율이 올라가 지식 없이도 풀린다(2026-09-12 측정 38.1%).
// 공식 기출은 원문 표현을 한 글자도 바꾸지 않고 싣는 문항이라 분자에서도 분모에서도 뺀다.
// 보기를 늘여 비율을 맞추는 것 자체가 전사 위반이고, 분모에 넣으면 자체 제작 문항의 래칫만 헐거워진다.
// 대상은 id 접두사로만 가른다: 'hanneung-'(국사편찬위원회 심화 기출), 'gichul-'(인사혁신처 9급 기출).
// 사진 보기 문항도 제외한다. 보기 글자가 화면에 나오지 않아 '가장 긴 보기 고르기' 전략 자체가 성립하지 않고,
// 분모에 넣으면 래칫 비율만 희석되어 검사가 헐거워진다. 대신 photos()가 네 보기 전부 사진임을 따로 강제한다.
// LONGEST_LIMIT: 09·10강 확장 뒤 실측 21.1%를 상한으로 다시 조인 래칫(이전 27.8%). 문항을 더하다 이 값을 넘기면 실패한다.
// MARGIN: 실측 최대 초과폭 7자에 여유 5자를 더한 값. 후보 문항은 모두 통과하지만 24자씩 튀던 예전 문항은 걸린다.
const LONGEST_LIMIT=0.212,MARGIN=12,VERBATIM_OFFICIAL=/^(?:hanneung|gichul)-/;
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
function verify(items,ledger){single(items);structural(items);concepts(items);coverage(items);lengthBias(items);assert.equal(ledger.schema,1);assert.equal(Object.keys(ledger.items).length,items.length,'Unreviewed addition/deletion');for(const item of items)assert.equal(ledger.items[item.exercise.exerciseId],digest(item),'Content changed: review meaning, alternatives and context before updating ledger: '+item.exercise.exerciseId);}
module.exports={catalog,digest,single,concepts,structural,coverage,lengthBias,verify};
if(require.main===module){const items=catalog();verify(items,JSON.parse(fs.readFileSync(__dirname+'/content-review.json','utf8')));const bias=lengthBias(items);console.log('PASS content audit: '+items.length+' reviewed exercises, every card exactly one question; structure, answer acceptance, context regression and review fingerprints; length bias '+bias.longest+'/'+bias.total+' ('+(bias.ratio*100).toFixed(1)+'%, limit '+(LONGEST_LIMIT*100).toFixed(1)+'%, chance 25%) self-made choice answers uniquely longest, mean +'+bias.delta.toFixed(1)+' chars vs distractor average, per-question margin <='+MARGIN+'; '+bias.photo+' photo-option exercises gated by image/licence checks instead of option length');}
