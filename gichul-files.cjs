'use strict';
// Node 전용: 공무원 9급 기출 회차 파일(gichul/<회차 id>.json)을 디스크에서 읽는다.
// 앱(브라우저)은 이 파일을 쓰지 않는다. 앱은 회차를 열 때 그 회차 파일 하나만 fetch로 받는다(gichul.js).
// 검사·감사(content-audit.cjs, *.test.cjs)는 모든 회차를 한꺼번에 본다.
const fs=require('node:fs'),path=require('node:path');
const dir=path.join(__dirname,'gichul');
function read(id){
 if(!/^[a-z0-9]+-\d{4}[a-z]?-[a-z]+$/.test(id))throw Error('Bad paper id: '+id);
 return JSON.parse(fs.readFileSync(path.join(dir,id+'.json'),'utf8'));
}
function ids(){return fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5)).sort();}
module.exports={dir,read,ids};
