import { DOMParser } from 'linkedom'
import { writeFile,mkdir } from 'node:fs/promises'
import { initializeTutorialRuntime } from '../src/blockly/tutorialRuntime.js'
import { Blockly } from '../src/blockly/core.js'
import { codeGeneratorService } from '../src/services/codeGenerator.service.js'
import { practiceProjects,block as b } from '../src/blockly/practiceProjects.js'
import { defineFileReferenceBlocks } from '../src/blockly/fileReferenceBlocks.js'
initializeTutorialRuntime()
const state=(...blocks)=>({blocks:{languageVersion:0,blocks}})
const empty=state()
const chain=(...blocks)=>blocks.reduceRight((next,current)=>({...current,...(next?{next:{block:next}}:{})}),null)
const heading=(text,level='1')=>b('heading',{TEXT:text,LEVEL:level})
const paragraph=text=>b('paragraph',{TEXT:text})
const page=(body,head=null)=>state(b('html_doctype',{}, {HTML:b('head',{}, {head_element:head??b('title',{NAME:'My learning page'})},b('body',{}, {body_element:body}))}))
const css=(selector,...properties)=>state(b('style_target',{TARGET:selector},{CONTENT:chain(...properties)}))
const tiers=['beginner','intermediate','advanced']
const specs=[
 {subject:'html',tier:'beginner',title:'Page structure and meaningful text',objective:'Build a valid document with a descriptive title, main heading and supporting paragraphs.',
  concepts:'HTML describes the meaning and structure of page content. The document contains a head for metadata and a body for visible elements. Heading levels organize sections; paragraphs hold related sentences. Correct nesting means an inner element closes before its container.',
  activity:'Build an introduction page about a hobby. Include one main heading and two paragraphs. Change the browser title and explain the difference between the title and visible heading.',
  solution:page(chain(heading('My learning page'),paragraph('I am learning to build websites.'),paragraph('This page describes my interests.'))),
  questions:[['Which element contains visible content?','body','head','title','style'],['Which element represents the main heading?','h1','p','title','br'],['What belongs in a paragraph?','Related text content','A CSS file path only','The whole browser application','A JavaScript variable declaration']]},
 {subject:'html',tier:'intermediate',title:'Semantic sections and navigation',objective:'Organize related content into semantic regions and provide descriptive links and a list.',
  concepts:'Semantic elements communicate a region’s purpose. A header introduces a page or section, main contains its primary content, and a footer provides closing information. Sections group related content under headings. Link text should explain its destination. Lists express a set or sequence of related items.',
  activity:'Create a club information page with header, main and footer. Put two titled sections inside main, include a list of activities, and add a descriptive link to another page.',
  solution:page(chain(b('header',{}, {CONTENT:heading('Our coding club')}),b('main',{}, {CONTENT:chain(b('section',{}, {CONTENT:chain(heading('Activities','2'),b('ul',{}, {CONTENT:chain(b('li',{}, {CONTENT:paragraph('Build pages')}),b('li',{}, {CONTENT:paragraph('Review projects')}))}))}),b('section',{}, {CONTENT:chain(heading('Learn more','2'),b('a_tag',{URL:'https://developer.mozilla.org/',TEXT:'Read web development documentation'}))}))}),b('footer',{}, {CONTENT:paragraph('Made by our class.')}))),
  questions:[['Which element identifies the primary content?','main','br','style','meta'],['Which link text is most descriptive?','View the club activity schedule','Click here','This','Go'],['Which element groups a related unordered set?','ul','h1','title','head']]},
 {subject:'html',tier:'advanced',title:'Accessible form structure and independent composition',objective:'Independently combine document structure and labeled form controls into an understandable contact page.',
  concepts:'A form groups controls for collecting information. A label identifies what a control asks for; its for attribute matches the control’s id. A placeholder is a hint rather than a replacement for a label. Form markup supplies structure; JavaScript or a server supplies submission behavior. Check the page with keyboard navigation and explain each field.',
  activity:'Build a contact page with a heading, explanation, labeled email control, message textarea and submit button. Use meaningful names and matching label/control identifiers. Explain what the page does before adding JavaScript; do not claim that HTML alone sends a message.',
  solution:page(chain(heading('Contact our club'),paragraph('Tell us what you would like to learn.'),b('form',{}, {CONTENT:chain(b('label',{FOR:'email',TEXT:'Email address'}),b('input',{TYPE:'email',NAME:'email'},{attributes:b('id',{NAME:'email'})}),b('label',{FOR:'message',TEXT:'Your message'}),b('textarea',{NAME:'message',TEXT:''},{attributes:b('id',{NAME:'message'})}),b('button',{TYPE:'submit',TEXT:'Send message'}))}))),
  questions:[['What connects a label to a control?','Matching for and id values','Matching colors','The file name','Their position alone'],['What does a placeholder replace?','Neither a persistent label nor instructions','Every label','Form submission behavior','Keyboard support'],['What should you test when reviewing a form?','Labels and keyboard access','Only background color','Only file size','Only heading font']]},
 {subject:'css',tier:'beginner',title:'Selectors, properties and readable styling',objective:'Apply a selector and declarations to improve text readability without changing HTML structure.',
  concepts:'A CSS rule combines a selector with declarations. The selector chooses elements; each declaration gives a property and value. Start with a small change, run the preview, and observe its effect. Use readable foreground/background combinations and consistent spacing.',
  activity:'Style a page heading with a readable dark color. Add a second rule for paragraphs. Explain which elements each selector matches and compare the before/after output.',
  solution:css('h1',b('external_text_color',{COLOR:'#17324d'}),b('external_font_weight',{VALUE:'bold'})),
  questions:[['What does a selector choose?','Elements to style','The project owner','A database table','A quiz answer'],['Which is a CSS property?','color','h1','body','index.html'],['What should you do after a small styling change?','Run the preview and inspect the effect','Delete HTML structure','Assume it worked','Change every rule at once']]},
 {subject:'css',tier:'intermediate',title:'Box model and flexible layouts',objective:'Use spacing and a flexible container to arrange related content and explain the box model.',
  concepts:'An element’s box consists of content, padding, border and margin. Padding creates space inside the border; margin separates boxes. Flexbox arranges children along a main axis and can wrap when space is limited. Inspect the container and children rather than fixing layout by adding repeated spaces to text.',
  activity:'Create a row of information cards with consistent gaps, inner spacing and wrapping. Resize the preview and explain the difference between margin and padding. Keep the HTML meaningful and place layout rules in the stylesheet.',
  solution:css('.cards',b('external_display',{DISPLAY:'flex'}),b('external_flex_wrap',{VALUE:'wrap'}),b('external_gap',{SIZE:'16',UNIT:'px'})),
  questions:[['Where is padding located?','Inside the border','Outside the browser','Inside JavaScript only','Between project files'],['Which rule enables a flex container?','display: flex','color: flex','title: flex','font: flex'],['Why allow cards to wrap?','To fit available space','To remove semantic HTML','To change the file type','To submit a quiz']]},
 {subject:'css',tier:'advanced',title:'Responsive layout and systematic debugging',objective:'Independently style a responsive layout and justify fixes using selector and box-model evidence.',
  concepts:'A responsive page adapts to its available space. Begin with a layout that works in a narrow preview, then improve wider layouts. Flexible sizing, wrapping and media queries can serve different purposes. When a rule seems ineffective, check its selector, competing declarations and the actual box dimensions before adding more rules.',
  activity:'Build a responsive club landing page. Use consistent spacing, readable text, a flexible card area and a clear action button. Test narrow and wide previews and submit a short explanation of one layout defect and how you fixed it. The teacher reviews the visual result and reasoning.',
  solution:css('.cards',b('external_display',{DISPLAY:'flex'}),b('external_flex_wrap',{VALUE:'wrap'}),b('external_gap',{SIZE:'24',UNIT:'px'})),
  questions:[['What is the first step when a rule appears ineffective?','Check matching selectors and competing declarations','Add random properties','Delete the stylesheet','Rename every file'],['What does responsive layout adapt to?','Available viewport or container space','The account password','Only the teacher’s device','The badge count'],['What is useful evidence of a layout fix?','Before/after observations and the relevant rule','XP alone','A file name alone','A copied screenshot without explanation']]},
 {subject:'javascript',tier:'beginner',title:'Events, variables and visible feedback',objective:'Connect a click event to a state change and update the page output.',
  concepts:'JavaScript adds behavior to a page. A variable can store changing state, an event listener reacts to an action, and a DOM update shows the result. A counter needs both a state change and an updated display. Predict the result before running, then compare your prediction with the output.',
  activity:'Create a counter whose Add button increases a visible count. Check one click, five clicks and another click. Explain the role of the variable, event and text update.',practice:'counter',
  questions:[['What makes an event listener run?','The event it listens for','A badge award','Saving a PDF','Changing a filename'],['What must a visible counter update?','Its state and displayed output','Only the title','Only a CSS color','Only its file order'],['What is useful before running a program?','Predict its behavior','Hide errors','Remove all variables','Add unrelated blocks']]},
 {subject:'javascript',tier:'intermediate',title:'Conditions, form validation and useful feedback',objective:'Use a condition and form event to show different feedback for valid and invalid input.',
  concepts:'A condition chooses which behavior runs. Form controls expose values and validity information. A submit listener can prevent the default navigation while validating input and showing feedback. Test both branches; a success message alone does not show that invalid input is handled.',
  activity:'Build a form that rejects an invalid email with helpful feedback and displays Saved for a valid email. Keep the form on the page while checking. Move focus to the invalid control and explain both branches.',practice:'form',
  questions:[['Why test valid and invalid input?','To exercise both conditional branches','To earn duplicate XP','To avoid reading feedback','To replace HTML labels'],['What does preventDefault affect?','The event’s default browser action','Every other event','All CSS selectors','The user’s account'],['Which response helps an invalid input user?','Specific feedback and focus on the relevant field','A blank page','A success message','Silently discarding input']]},
 {subject:'javascript',tier:'advanced',title:'Reusable functions, arrays and interactive filtering',objective:'Combine a reusable rendering function, a collection and input events into a working filter.',
  concepts:'An array stores a collection. A rendering function can create the visible list from that collection, while filtering chooses matching entries. Normalize both the query and item names for case-insensitive comparison. Clear previous output before rendering the new list, and test an empty query and a query with no matches.',
  activity:'Build a searchable list of HTML, CSS and JavaScript topic cards. Render all cards initially, filter as the user types, ignore letter case, show a useful empty state and restore all cards when cleared. Explain how data flows from the input to the rendering function.',practice:'search',
  questions:[['How do you compare text without case differences?','Normalize both values consistently','Normalize only the query sometimes','Remove the array','Change the event name'],['Why clear the list before re-rendering?','To avoid accumulating duplicate output','To erase the stored project','To disable filtering','To change HTML syntax'],['Which test checks an important edge case?','A query with no matches','Only the first matching letter','Only the initial view','Only a screenshot of code']]},
]
function htmlBlocks(html){
 const dom=new DOMParser().parseFromString(html,'text/html');
 const attr=node=>node.id?{attributes:b('id',{NAME:node.id})}:node.getAttribute('class')?{attributes:b('class',{NAME:node.getAttribute('class')})}:{};
 function convert(node){
  if(node.nodeType===3)return node.textContent.trim()?[paragraph(node.textContent.trim())]:[];
  if(node.nodeType!==1)return [];
  const tag=node.localName.toLowerCase();let block;
  if(/^h[1-6]$/.test(tag))block=b('heading',{LEVEL:tag[1],TEXT:node.textContent},attr(node));
  else if(['p','output'].includes(tag))block=b('paragraph',{TEXT:node.textContent},attr(node));
  else if(tag==='button')block=b('button',{TEXT:node.textContent,TYPE:node.getAttribute('type')||'button'},attr(node));
  else if(tag==='input')block=b('input',{TYPE:node.getAttribute('type')||'text',REQUIRED:node.hasAttribute('required')?'TRUE':'FALSE'},attr(node));
  else if(tag==='label'){
    const control=node.querySelector('input');
    block=b('label',{TEXT:node.textContent,FOR:node.getAttribute('for')||control?.id||''},attr(node));
    return [block,...(control?convert(control):[])];
  }else if(['form','div','article','section','header','footer','main'].includes(tag))block=b(tag,{...(tag==='form'?{NOVALIDATE:node.hasAttribute('novalidate')?'TRUE':'FALSE'}:{})},{...attr(node),CONTENT:chain(...[...node.childNodes].flatMap(convert))});
  else return [...node.childNodes].flatMap(convert);
  return [block];
 }
 return page(chain(...[...dom.body.childNodes].flatMap(convert),b('script_js_file',{FILENAME:'main.js'})));
}
const sources={html:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content',css:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics',javascript:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting'}
const esc=s=>`'${String(s).replaceAll("'","''")}'`
const json=x=>`${esc(JSON.stringify(x))}::jsonb`
const sql=[]
for(const spec of specs){
 const exercise=practiceProjects.find(x=>x.id===spec.practice)
 const filename=spec.subject==='css'?'styles.css':spec.subject==='javascript'?'main.js':'index.html'
 let solution=spec.solution??exercise.state
 // Load and reserialize to check every block and normalize default fields.
 const definitions=[{filename}]
 if(spec.subject!=='html')definitions.push({filename:'index.html'})
 defineFileReferenceBlocks(definitions)
 const ws=new Blockly.Workspace()
 try{Blockly.serialization.workspaces.load(solution,ws);solution=Blockly.serialization.workspaces.save(ws)}finally{ws.dispose()}
 const generated=codeGeneratorService.generateCodeFromState(solution,filename)
 const files=[{filename,initial:empty,solution,code:generated}]
 if(spec.subject==='javascript'){
  // The HTML file uses supported blocks with an inert starter page represented by the dedicated page builder below.
  const html=htmlBlocks(exercise.html)
  files.push({filename:'index.html',initial:html,solution:html,code:codeGeneratorService.generateCodeFromState(html,'index.html')})
 }
 if(spec.subject==='css')files.push({filename:'index.html',initial:page(chain(heading('My learning page'),b('div',{}, {attributes:b('class',{NAME:'cards'}),CONTENT:chain(b('article',{}, {CONTENT:paragraph('HTML')}),b('article',{}, {CONTENT:paragraph('CSS')}),b('article',{}, {CONTENT:paragraph('JavaScript')}))})),b('head_link',{TYPE:'stylesheet',URL:'styles.css'})),solution:page(chain(heading('My learning page'),b('div',{}, {attributes:b('class',{NAME:'cards'}),CONTENT:chain(b('article',{}, {CONTENT:paragraph('HTML')}),b('article',{}, {CONTENT:paragraph('CSS')}),b('article',{}, {CONTENT:paragraph('JavaScript')}))})),b('head_link',{TYPE:'stylesheet',URL:'styles.css'}))})
 // JS starter HTML will be generated as actual blocks by the follow-up normalization step.
 const slug=`release-${spec.subject}-${spec.tier}`
 const lecture=`<h2>${spec.title}</h2><p>${spec.concepts}</p><h3>Learning objective</h3><p>${spec.objective}</p><h3>Try and explain</h3><p>${spec.activity}</p><p>Use the generated source alongside the blocks. Save, run, inspect and explain your result.</p><p>Further reading: <a href="${sources[spec.subject]}">MDN learning module</a>.</p>`
 spec.files=files;spec.lecture=lecture;spec.slug=slug
}
await mkdir('curriculum',{recursive:true})
await writeFile('curriculum/release-curriculum.json',JSON.stringify(specs,null,2))
for (const spec of specs) {
 const types=['lecture','tutorial','quiz','laboratory']
 const subjectTitle={html:'HTML',css:'CSS',javascript:'JavaScript'}[spec.subject]
 const checks=spec.subject==='html'?[{type:'htmlExists',selector:'h1',message:'Add a main heading.'}]:[{type:'codeIncludes',value:spec.subject==='css'?(spec.tier==='beginner'?'color': 'display'):(spec.tier==='advanced'?'renderCards':spec.tier==='intermediate'?'preventDefault':'addEventListener'),message:'Include the concept demonstrated in this step.'}]
 const tutorialFiles=spec.files.map(f=>({...f,code:f.code??codeGeneratorService.generateCodeFromState(f.solution,f.filename)}))
 const payload={objective:spec.objective,concepts:spec.concepts,activity:spec.activity,lecture:spec.lecture,questions:spec.questions,files:tutorialFiles,checks}
 sql.push(`do $seed$
 declare author_id uuid; course_id uuid; topic_id uuid; lesson_id uuid; tutorial_id uuid; step_id uuid; file_id uuid; quiz_id uuid; question_id uuid; item jsonb; f jsonb; qu jsonb; criterion jsonb; step_number integer; option_number integer; kind text; data jsonb:=${json(payload)};
 begin
 select id into author_id from public.profiles where role='admin' order by created_at limit 1;
 if author_id is null then raise exception 'An administrator is required to own the curriculum.'; end if;
 select id into course_id from public.courses where slug=${esc(spec.subject)};
 if course_id is null then insert into public.courses(title,slug,description,color) values(${esc(subjectTitle)},${esc(spec.subject)},${esc(`Learn ${subjectTitle} through guided practice and independently reviewed projects.`)},'#4f46e5') returning id into course_id; end if;
 if exists(select 1 from public.topics t where t.course_id=course_id and classroom_id is null and title=${esc(spec.title)} and description like '[WebbedSite curriculum]%') then return; end if;
 insert into public.topics(course_id,title,description,"order",is_published,slug)
 values(course_id,${esc(spec.title)},${esc('[WebbedSite curriculum] '+spec.objective)},coalesce((select max("order")+1 from public.topics t where t.course_id=course_id and t.classroom_id is null),0),true,${esc(spec.slug)}) returning id into topic_id;
 foreach kind in array array['lecture','tutorial','quiz','laboratory'] loop
 insert into public.lessons(topics_id,author,title,type,is_published,slug,"order",base_xp,proficiency_tier,mastery_checkpoint,learning_objective,topic_track,required_for_topic)
 values(topic_id,author_id,initcap(kind)||': '||${esc(spec.title)},kind,false,${esc(spec.slug)}||'-'||kind,array_position(array['lecture','tutorial','quiz','laboratory'],kind),50,${esc(spec.tier)},kind in ('quiz','laboratory'),${esc(spec.objective)},'core',true) returning id into lesson_id;
 if kind='lecture' then insert into public.lectures(lesson_id,content) values(lesson_id,data->>'lecture');
 elsif kind='laboratory' then insert into public.laboratories(lesson_id,instruction) values(lesson_id,jsonb_build_object('description',data->>'activity','files',(select jsonb_agg(jsonb_build_object('filename',f1->>'filename','blocks_json',f1->'initial')) from jsonb_array_elements(data->'files') f1))::text);
 elsif kind='quiz' then
 insert into public.quizzes(lesson_id,time_limit,passing_score) values(lesson_id,300,ceil(jsonb_array_length(data->'questions')*0.75)::integer) returning id into quiz_id;
 for qu in select value from jsonb_array_elements(data->'questions') loop
 insert into public.questions(quiz_id,text,"order") values(quiz_id,qu->>0,coalesce((select max("order")+1 from public.questions qu1 where qu1.quiz_id=quiz_id),1)) returning id into question_id;
 for option_number in 1..jsonb_array_length(qu)-1 loop insert into public.options(question_id,text,is_correct) values(question_id,qu->>option_number,option_number=1); end loop;
 end loop;
 else
 insert into public.tutorials(lesson_id,type) values(lesson_id,'block') returning id into tutorial_id;
 for f in select value from jsonb_array_elements(data->'files') loop
 insert into public.block_tutorial_step_files(tutorial_id,filename,file_type,initial_content_json) values(tutorial_id,f->>'filename',split_part(f->>'filename','.',2),f->'initial');
 end loop;
 for step_number in 1..3 loop
 insert into public.block_tutorial_steps(tutorial_id,instruction,hint,"order",highlight_block_type)
 values(tutorial_id,case step_number when 1 then 'Read the objective: '|| (data->>'objective') || E'\nIdentify the page elements or selector that the activity will use. Start building the demonstrated concept in blocks.' when 2 then 'Build and connect the core behavior or styling. '||(data->>'concepts') else 'Run the complete project, inspect the generated source and check the stated cases. '||(data->>'activity') end,
 'Use the appropriate language palette. Inspect connections and run the preview after each small change.',step_number,case when ${esc(spec.subject)}='javascript' then 'js_listen' when ${esc(spec.subject)}='css' then 'style_target' else 'heading' end) returning id into step_id;
 for f in select value from jsonb_array_elements(data->'files') loop
 select id into file_id from public.block_tutorial_step_files f1 where f1.tutorial_id=tutorial_id and filename=f->>'filename';
 insert into public.block_tutorial_step_expected(step_id,file_id,expected_code,expected_blocks_json,test_cases,require_block_structure)
 values(step_id,file_id,f->>'code',f->'solution',case when f->>'filename'=${esc(spec.files[0].filename)} then data->'checks' else '[]'::jsonb end,false);
 end loop;
 end loop;
 end if;
 update public.lessons set is_published=true where id=lesson_id;
 end loop;
 end $seed$;`)
}
// Qualify PL/pgSQL variables to avoid ambiguity with column names.
const seedSQL=sql.join('\n\n').replaceAll('do $seed$\n declare','do $seed$\n <<curriculum>>\n declare')
 .replaceAll('where course_id=course_id','where course_id=curriculum.course_id')
 .replaceAll('t.course_id=course_id','t.course_id=curriculum.course_id')
 .replaceAll('qu1.quiz_id=quiz_id','qu1.quiz_id=curriculum.quiz_id')
 .replaceAll('f1.tutorial_id=tutorial_id','f1.tutorial_id=curriculum.tutorial_id')
await writeFile('supabase/release/curriculum-seed.sql',seedSQL)
console.log(`Prepared ${specs.length} topic sequences with generated block references for review.`)
