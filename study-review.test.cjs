const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);for(const f of ['core-review-pack.js','quiz-options.js','study-review-catalog.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const catalog=ctx.STUDY_REVIEW_CATALOG,ids=new Set(),cards=new Map(ctx.CORE_REVIEW_PACK.map(c=>[c.id,c]));
assert.equal(catalog.schema,1);assert.equal(catalog.total,Object.keys(catalog.questions).length);
for(const [i,set]of catalog.sets.entries()){
 assert.equal(set.number,i+1);assert(set.title);assert(set.ids.length>0&&set.ids.length<=8,'A work-break set must contain at most eight questions');
 for(const id of set.ids){assert(!ids.has(id),'Question in two sets: '+id);ids.add(id);assert(cards.has(id),'Unknown card: '+id);const meta=catalog.questions[id],options=ctx.QUIZ_OPTIONS[id];assert(meta&&meta.section&&meta.sourceSection&&meta.coverage.length,'Missing scope metadata: '+id);assert.equal(options.choices.length,4);assert.equal(cards.get(id).answer,options.choices[options.correctIndex]);}
}
assert.equal(ids.size,catalog.total);for(const id of Object.keys(catalog.questions))assert(ids.has(id),'Unreachable practice question: '+id);
for(const card of cards.values())if(/^(?:(?:study|summary)-hist-20260910-|summary-hist-20260911-|lecture-hist-20260911-)/.test(card.id))assert(ids.has(card.id),'Summary question excluded from scope: '+card.id);
// Textbook lecture ranges: every summary question sits in exactly one lecture, in catalog order.
const lectures=JSON.parse(JSON.stringify(catalog.lectures)),inLecture=new Map();
assert.deepEqual(lectures.map(l=>l.id),['02-05','06','07-08']);
assert.deepEqual(lectures.map(l=>l.title),['02~05강 선사 시대~삼국 통일','06강 통일 신라·발해·후삼국','07·08강 고대 경제·사회·문화']);
for(const l of lectures){assert(l.ids.length>0,'Empty lecture '+l.id);for(const id of l.ids){assert(!inLecture.has(id),'Question in two lectures: '+id);assert(catalog.questions[id],'Unknown lecture question: '+id);inLecture.set(id,l.id);}const numbers=l.ids.map(id=>catalog.questions[id].number);assert.deepEqual(numbers,[...numbers].sort((a,b)=>a-b),'Lecture keeps catalog order: '+l.id);}
assert.equal(inLecture.size,catalog.total);
for(const [id,q]of Object.entries(catalog.questions)){const expected=id.startsWith('lecture-hist-20260911-')?'07-08':['통일 신라','발해','후삼국'].includes(q.section)?'06':'02-05';assert.equal(inLecture.get(id),expected,'Lecture by section: '+id);}
const newIds=Object.keys(catalog.questions).filter(id=>id.startsWith('lecture-hist-20260911-'));assert.equal(newIds.length,56);assert.deepEqual(lectures[2].ids,newIds);
assert(newIds.every(id=>catalog.questions[id].number>225),'New questions continue after the earlier catalog numbers');
assert(catalog.sets.filter(s=>s.title.startsWith('07·08강 고대 경제·사회·문화')).length===7);
// Earlier saved selections retain the same membership after the expansion.
for(let set=1;set<=5;set++)assert.deepEqual(Array.from(catalog.sets[set-1].ids),Array.from({length:8},(_,i)=>'study-hist-20260910-'+String((set-1)*8+i+1).padStart(2,'0')));
const index=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8'),deploy=fs.readFileSync(__dirname+'/.github/workflows/pages.yml','utf8');
const script=index.match(/study-review-catalog\.js\?v=\d+/)?.[0];assert(script&&sw.includes(script),'Offline cache lacks the same scope catalog as HTML');assert(index.indexOf(script)<index.indexOf('src="app.js'),'Catalog must load before the app');assert(deploy.includes('cp study-review-catalog.js '),'Pages artifact lacks the new runtime file');
console.log('PASS summary practice: '+catalog.total+' questions, '+catalog.sets.length+' bounded sets, '+lectures.length+' lecture ranges, complete membership, answer mapping, old scopes and deployment assets');
