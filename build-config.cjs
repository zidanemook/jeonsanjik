'use strict';
const fs=require('node:fs'),path=require('node:path');
function build(raw,dir='_site'){
 if(!raw)throw Error('Missing STUDY_FIREBASE_CONFIG build secret');
 let parsed;try{parsed=JSON.parse(raw);}catch{throw Error('Invalid Firebase build configuration JSON');}
 const config={};for(const key of ['apiKey','authDomain','projectId','appId']){if(typeof parsed?.[key]!=='string'||!parsed[key].trim())throw Error('Missing Firebase configuration field: '+key);config[key]=parsed[key];}
 if(!/^[a-z0-9.-]+$/i.test(config.authDomain))throw Error('Invalid Firebase auth domain');
 fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'firebase-config.js'),'// Public runtime configuration generated during deployment.\nglobalThis.STUDY_FIREBASE_CONFIG='+JSON.stringify(config)+';\n');
}
module.exports={build};if(require.main===module){try{build(process.env.STUDY_FIREBASE_CONFIG);}catch(e){console.error(e.message);process.exitCode=1;}}
