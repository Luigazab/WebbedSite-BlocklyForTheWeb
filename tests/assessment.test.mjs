import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_RUBRIC,rubricTotal,bestQuiz,lessonResult,csvCell } from '../src/lib/assessment.js'
test('rubric scoring validates all criterion limits and totals',()=>{
 assert.equal(rubricTotal(DEFAULT_RUBRIC,{content:25,structure:20,application:25,readability:15}),85)
 for(const value of [-1,31,1.5,''])assert.throws(()=>rubricTotal(DEFAULT_RUBRIC,{content:value,structure:25,application:30,readability:15}))
 assert.throws(()=>rubricTotal([{id:'a',label:'A',max:99}],{a:99}))
})
test('only completed quiz evidence contributes and raw counts become percentages',()=>{
 assert.equal(bestQuiz([{score:100,status:'in_progress'},{score:3,status:'completed',finished_at:'2026-10-18',score_total:4},{score:1,status:'completed',finished_at:'2026-10-18',score_total:4}],{question_count:4}),75)
 assert.equal(bestQuiz([],{question_count:4}),null)
 assert.equal(bestQuiz([{score:3,status:'failed',finished_at:'2026-10-18',percentage:30}],{question_count:10}),30)
 assert.equal(bestQuiz([{score:95,status:'failed',finished_at:'2026-10-18',percentage:95}],{question_count:10}),95)
})
test('pending labs are unscored and lecture completion is not a grade',()=>{
 assert.deepEqual(lessonResult({id:'l',type:'laboratory'},[{lesson_id:'l',is_final:true,score:null,review_status:'submitted'}]),{score:null,status:'Awaiting review'})
 assert.equal(lessonResult({type:'lecture',progress:{is_completed:true,best_score:100}}).score,null)
 assert.equal(lessonResult({id:'l',type:'laboratory'},[{lesson_id:'l',is_final:true,score:50,review_status:'needs_revision'}]).status,'Needs revision')
})
test('CSV export quotes values and neutralizes spreadsheet formula prefixes',()=>{
 assert.equal(csvCell('a,"b"'),'"a,""b"""')
 assert.equal(csvCell('=1+1'),'"\'=1+1"')
})
