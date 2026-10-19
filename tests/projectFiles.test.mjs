import test from 'node:test'
import assert from 'node:assert/strict'
import {migrateProjectFiles} from '../src/services/projectFileMigration.js'
const empty={blocks:{blocks:[]}}
test('saving a local multi-file project reuses defaults and retries without duplicate filenames',async()=>{
 let rows=[{id:'html',filename:'index.html',blocks_json:empty},{id:'css',filename:'style.css',blocks_json:empty},{id:'js',filename:'script.js',blocks_json:empty}]
 const files=[{filename:'index.html',blocks_json:{blocks:{blocks:[{type:'heading'}]}}},{filename:'main.js',blocks_json:{blocks:{blocks:[{type:'js_comment'}]}}}]
 const services={projectId:'project',files,readFiles:async()=>structuredClone(rows),saveFile:async(_p,name,state,id)=>{rows=rows.map(row=>row.id===id?{...row,blocks_json:state}:row)},createFile:async(_p,name,state)=>{rows.push({id:name,filename:name,blocks_json:state})},deleteFile:async id=>{rows=rows.filter(row=>row.id!==id)}}
 await migrateProjectFiles(services);await migrateProjectFiles(services)
 assert.deepEqual(rows.map(row=>row.filename).sort(),['index.html','main.js'])
 assert.equal(rows.find(row=>row.id==='html').blocks_json.blocks.blocks[0].type,'heading')
})
test('a failed migration preserves local source and never deletes populated remote work',async()=>{
 const files=[{filename:'index.html',blocks_json:empty}];let deleted=false
 await assert.rejects(()=>migrateProjectFiles({projectId:'p',files,readFiles:async()=>[{id:'other',filename:'other.html',blocks_json:{blocks:{blocks:[{type:'heading'}]}}}],saveFile:async()=>{},createFile:async()=>{throw new Error('Offline')},deleteFile:async()=>{deleted=true}}),/Offline/)
 assert.equal(files.length,1);assert.equal(deleted,false)
})
