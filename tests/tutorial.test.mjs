import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { validateTutorialCode, validateTestCases } from '../src/utils/validation/tutorialCodeValidation.js'
import { buildStudentSteps } from '../src/utils/tutorialSteps.js'
const Parser = new JSDOM('').window.DOMParser
test('HTML requirements allow extra elements and reject wrong content', () => {
 const checks = [{type:'htmlText',selector:'h1',value:'Welcome'}]
 assert.equal(validateTutorialCode('<p>Extra</p><h1>Welcome</h1>', '', checks, Parser).passed, true)
 assert.equal(validateTutorialCode('<h1>Wrong</h1>', '', checks, Parser).passed, false)
 assert.equal(validateTutorialCode('<!-- <h1>Welcome</h1> -->', '', checks, Parser).passed, false)
})
test('attribute checks and invalid selectors fail correctly', () => {
 assert.equal(validateTutorialCode('<img alt="Remi">','',[{type:'htmlAttribute',selector:'img',attribute:'alt',value:'Remi'}],Parser).passed,true)
 assert.equal(validateTutorialCode('', '', [{type:'htmlExists',selector:'['}],Parser).passed,false)
 assert.throws(() => validateTestCases([{type:'execute'}]))
})
test('code equality preserves meaningful string whitespace', () => {
 assert.equal(validateTutorialCode(' x = "a b"; ', 'x = "a b";').passed,true)
 assert.equal(validateTutorialCode('x = "ab";', 'x = "a b";').passed,false)
 assert.equal(validateTutorialCode('before; required(); after;', '', [{type:'codeIncludes',value:'required()'}]).passed,true)
})
test('steps are ordered and start from prior expected per file', () => {
 const first={blocks:{blocks:[{type:'first'}]}}, second={blocks:{blocks:[{type:'second'}]}}
 const steps=buildStudentSteps([{id:'b',order:1},{id:'a',order:0,block_tutorial_step_expected:[{file_id:'f',expected_blocks_json:second}]}],[{id:'f',initial_content_json:first}])
 assert.equal(steps[0].id,'a')
 assert.deepEqual(steps[0].tutorial_step_files[0].blocks_json,first)
 assert.deepEqual(steps[1].tutorial_step_files[0].blocks_json,second)
})
