import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile,mkdir } from 'node:fs/promises'
import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import { validateTutorialReference } from '../src/utils/validation/tutorialStepValidation.js'
await mkdir('node_modules/.cache/curriculum-tests',{recursive:true})
await build({entryPoints:['src/blockly/tutorialRuntime.js'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'node_modules/.cache/curriculum-tests/runtime.mjs'})
const {canonicalTutorialFiles}=await import('../node_modules/.cache/curriculum-tests/runtime.mjs')
const {codeGeneratorService}=await import('../src/services/codeGenerator.service.js')
const curriculum=JSON.parse(await readFile('curriculum/release-curriculum.json','utf8'))
test('reusable JavaScript survives saving and reopening with the same browser and submission output',()=>{
 const definition={id:'immutable-version-1',version:1,language:'js',label:'Greeting',previousEnabled:true,nextEnabled:true,previousCheck:['JSStatement'],nextCheck:['JSStatement'],workspace:{blocks:{blocks:[{type:'js_comment',fields:{TEXT:'Reusable greeting'}}]}}}
 const saved=JSON.parse(JSON.stringify({blocks:{blocks:[{type:'webbed_reusable',extraState:definition,next:{block:{type:'js_comment',fields:{TEXT:'After composition'}}}}]}}))
 const files=canonicalTutorialFiles([{filename:'main.js',blocks_json:saved}], 'block',[{filename:'main.js'}])
 const browserCode=codeGeneratorService.generateCodeFromState(saved,'main.js')
 assert.equal(files[0].code,browserCode)
 assert.match(browserCode,/Reusable greeting/);assert.match(browserCode,/After composition/)
 assert.equal(files[0].blocks_json.blocks.blocks[0].extraState.version,1)
})
for(const topic of curriculum){
 test(`${topic.subject}/${topic.tier}: references regenerate and validate in the submission runtime`,()=>{
  assert.ok(topic.objective.length>30)
  assert.ok(topic.questions.length>=3)
  const definitions=topic.files.map(f=>({filename:f.filename}))
  const files=canonicalTutorialFiles(topic.files.map(f=>({filename:f.filename,blocks_json:f.solution})), 'block',definitions)
  for(const file of files)validateTutorialReference({filename:file.filename,expected_code:file.code,expected_blocks_json:file.blocks_json,test_cases:[]})
 })
}
test('generated JavaScript curriculum pages contain their required interactive elements',()=>{
 for(const topic of curriculum.filter(t=>t.subject==='javascript')){
  const definitions=topic.files.map(f=>({filename:f.filename}))
  const files=canonicalTutorialFiles(topic.files.map(f=>({filename:f.filename,blocks_json:f.solution})),'block',definitions)
  const html=codeGeneratorService.combineFilesForPreview(files.map(f=>({...f,generatedCode:f.code})),'index.html')
  const dom=new JSDOM(html,{runScripts:'dangerously'})
  const document=dom.window.document
  if(topic.tier==='beginner'){
   for(let i=0;i<5;i++)document.getElementById('increment').click()
   assert.equal(document.getElementById('count').textContent,'5')
  }else if(topic.tier==='intermediate'){
   const input=document.getElementById('email');input.value='invalid';document.getElementById('signup').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));assert.match(document.getElementById('feedback').textContent,/valid email/)
   input.value='learner@example.com';document.getElementById('signup').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));assert.equal(document.getElementById('feedback').textContent,'Saved')
  }else{
   assert.equal(document.getElementById('cards').children.length,3)
   const input=document.getElementById('search');input.value='CSS';input.dispatchEvent(new dom.window.Event('input'));assert.equal(document.getElementById('cards').children.length,1)
  }
  dom.window.close()
 }
})
