const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const css=fs.readFileSync(__dirname+'/style.css','utf8');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const app=fs.readFileSync(__dirname+'/app.js','utf8');
const boot=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const control=app.slice(app.indexOf('// Appearance is device-local'),app.indexOf('function profileKey'));
function fixture(saved,{getThrows=false,setThrows=false}={}){
 const writes=[],button={setAttribute(k,v){this[k]=v;}},meta={},root={dataset:{}};
 const ctx={document:{documentElement:root,querySelector:s=>s==='#themeToggle'?button:meta},
  localStorage:{getItem(){if(getThrows)throw Error('blocked');return saved;},setItem(k,v){if(setThrows)throw Error('full');writes.push([k,v]);}},
  getComputedStyle:el=>({getPropertyValue:()=>({green:'#e8f1e4',cream:'#f7f1e3',dark:'#111318'}[el.dataset.theme])})};
 ctx.$=ctx.document.querySelector;vm.createContext(ctx);vm.runInContext(boot,ctx);
 const firstTheme=root.dataset.theme,firstMeta=meta.content;
 vm.runInContext(control,ctx);return {button,meta,root,writes,firstTheme,firstMeta};
}
const defaultScreen=fixture(null);
assert.equal(defaultScreen.firstTheme,'green');assert.equal(defaultScreen.firstMeta,'#e8f1e4');
assert.equal(defaultScreen.button.textContent,'화면: 연한 초록');
for(const [theme,name,color] of [['cream','미색','#f7f1e3'],['dark','어둡게','#111318'],['green','연한 초록','#e8f1e4']]){
 defaultScreen.button.onclick();assert.equal(defaultScreen.root.dataset.theme,theme);
 assert.equal(defaultScreen.button.textContent,'화면: '+name);assert.equal(defaultScreen.meta.content,color);
 assert.deepEqual(defaultScreen.writes.at(-1),['chagog-theme',theme]);
}
for(const theme of ['green','cream','dark']){
 const f=fixture(theme);assert.equal(f.firstTheme,theme);assert.equal(f.root.dataset.theme,theme);
 assert.equal(f.firstMeta,f.meta.content);assert.equal(f.writes.length,0);
}
assert.equal(fixture('invalid').root.dataset.theme,'green');
const blocked=fixture(null,{getThrows:true,setThrows:true});assert.equal(blocked.firstTheme,'green');
assert.doesNotThrow(()=>blocked.button.onclick());assert.equal(blocked.root.dataset.theme,'cream');
assert.ok(html.indexOf('<script>')<html.indexOf('href="style.css'), 'theme is chosen before loading CSS');
assert.match(html,/<header>[\s\S]*id="themeToggle"[\s\S]*<\/header>/);
assert.ok(!/[\u00b7\u2194]|\uce74\ub4dc|\ubb38\ud56d|\uad50\uc7ac/.test(defaultScreen.button.textContent));
assert.ok(!/matchMedia|prefers-color-scheme/.test(control+boot));
for(const file of ['sync.js','sync-core.js','storage.js'])assert.ok(!/chagog-theme|screenTheme|SCREEN_THEMES/.test(fs.readFileSync(__dirname+'/'+file,'utf8')),file+' excludes appearance');
assert.ok(!/commit\(|\bdata\./.test(control));

const palettes={};
for(const theme of ['green','cream','dark']){
 const block=css.match(new RegExp(':root\\[data-theme="'+theme+'"\\] \\{([^}]+)'))[1];
 palettes[theme]=Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
}
function luminance(hex){
 let h=hex.slice(1);if(h.length===3)h=[...h].map(x=>x+x).join('');
 const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
 return .2126*c[0]+.7152*c[1]+.0722*c[2];
}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
// The suffix records the original dark hex value, including alpha values.
for(const [key,value] of Object.entries(palettes.dark)){
 const m=key.match(/^--(?:ink|surface|line|shadow)-[a-z]+-([\da-f]{3,8})$/);
 if(m)assert.equal(value,'#'+m[1],key+' preserves the original dark value');
}
const results={};
for(const theme of ['green','cream','dark']){
 const p=palettes[theme];let pairs;
 if(theme!=='dark'){
  const inks=Object.entries(p).filter(([k,v])=>/^--ink-|^--link$|^--placeholder$|^--badge-ink$/.test(k)&&v.startsWith('#'));
  const backgrounds=Object.entries(p).filter(([k,v])=>/^--surface-|^--highlight-badge$|^--image-paper$/.test(k)&&v.startsWith('#'));
  pairs=inks.flatMap(([i])=>backgrounds.map(([b])=>[i,b]));
 }else pairs=[['--ink-neutral-fff','--surface-blue-111318'],['--ink-neutral-d1d7e0','--surface-blue-1b2028'],['--ink-success-98e7b6','--surface-success-183b2b'],['--ink-danger-ffb1b1','--surface-danger-49282e'],['--ink-warm-ffd479','--surface-warm-1a1812'],['--ink-success-82d6a4','--surface-success-17301f'],['--ink-danger-ffb3b3','--surface-danger-5a2a30']];
 let minimum=Infinity,worst;
 for(const [ink,bg] of pairs){assert.ok(p[ink]&&p[bg],ink+' '+bg);const r=contrast(p[ink],p[bg]);assert.ok(r>=4.5,`${theme} ${ink} / ${bg}: ${r.toFixed(3)}`);if(r<minimum){minimum=r;worst=[ink,bg];}}
 results[theme]={pairs:pairs.length,minimum:+minimum.toFixed(3),worst};
 for(const fill of ['--ink-success-82d6a4','--ink-warm-ffd98a'])assert.ok(contrast(p[fill],p['--surface-blue-2c3646'])>=4.5,theme+' progress fill remains visible');
}
// No literal colors are allowed outside the theme palettes.
const rules=css.slice(css.indexOf(':root {'));
assert.ok(!/#[\da-f]{3,8}\b|rgba?\(/i.test(rules));
assert.ok(!/#[\da-f]{3,8}\b|rgba?\(/i.test(control));
console.log('theme.test.cjs passed',JSON.stringify(results));
module.exports={palettes,contrast,results};
