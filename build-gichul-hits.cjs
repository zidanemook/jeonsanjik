'use strict';
// 정보보호론 기초 개념 줄마다 9급 기출에 나온 횟수 계산(v428).
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const OUT=path.join(__dirname,'gichul-hits.js');

function build(){
 const ctx={console};vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'basics.js'),'utf8').replace(/\r\n/g,'\n'),ctx,{filename:'basics.js'});
 const {boxes,apply}=ctx.STUDY_BASICS,counts={};
 for(const boxId of Object.keys(boxes).filter(k=>k.startsWith('sec-')).sort())counts[boxId]={};
 for(const [qid,a] of Object.entries(apply)){
  if(!qid.startsWith('gichul-')||!a?.box?.startsWith('sec-'))continue;
  const box=boxes[a.box];if(!box)continue;
  const tables=new Map((box.tables||[]).map(t=>[t.id,t.rowIds||[]]));
  const hit=new Set();
  for(const raw of a.use||[]){
   const id=String(raw).split(':').pop();
   if(tables.has(id))for(const r of tables.get(id))hit.add(r);
   else hit.add(id);
  }
  const c=counts[a.box]||(counts[a.box]={});
  for(const id of hit)c[id]=(c[id]||0)+1;
 }
 const out={};
 for(const boxId of Object.keys(counts).sort()){
  const c=counts[boxId],sorted={};
  for(const id of Object.keys(c).sort())sorted[id]=c[id];
  out[boxId]=sorted;
 }
 return '// 자동 생성: node build-gichul-hits.cjs (정보보호론 기초 개념 줄마다 9급 기출에 나온 횟수)\n'
  +'globalThis.SEC_GICHUL_HITS='+JSON.stringify(out)+';\n';
}

if(require.main===module){
 const text=build();
 if(process.argv.includes('--check')){
  const cur=fs.existsSync(OUT)?fs.readFileSync(OUT,'utf8').replace(/\r\n/g,'\n'):'';
  if(cur!==text){console.error('FAIL gichul-hits.js 낡음');process.exit(1);}
  console.log('PASS gichul-hits');
 }else fs.writeFileSync(OUT,text);
}

module.exports={build};
