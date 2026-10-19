// These public practice examples are also the fixtures for behavioral tests.
// Tutorial reference solutions are never included here.
export const block = (type, fields = {}, inputs = {}, next, extraState) => ({ type, fields,
  ...(Object.keys(inputs).length ? { inputs: Object.fromEntries(Object.entries(inputs).map(([name, child]) => [name, { block: child }])) } : {}),
  ...(next ? { next: { block: next } } : {}), ...(extraState ? { extraState } : {}) })
const text = VALUE => block('js_string_val', { VALUE })
const number = VALUE => block('js_number_val', { VALUE })
const variable = NAME => block('js_get_var', { NAME })
const element = ID => block('js_get_by_id', { ID })
const body = () => block('js_document_body')
const setText = (id, TEXT, next) => block('js_set_text_content', {}, { ELEM: element(id), TEXT }, next)
const call = (NAME, args = [], next) => block('js_call', { NAME }, Object.fromEntries(args.map((arg, i) => [`ARG${i}`, arg])), next, { itemCount: args.length })
const listen = (id, event, handler) => block('js_listen', { EVENT: event, OPTION: 'NORMAL' }, { ELEM: element(id), HANDLER: handler })
const createList = items => block('js_array_new', {}, Object.fromEntries(items.map((item, i) => [`ITEM${i}`, item])), null, { itemCount: items.length })
const classes = (METHOD, CLASS, next) => block('js_class_list', { METHOD, CLASS }, { ELEM: body() }, next)
const conditional = (condition, yes, no, next) => block('js_if_expandable', {}, { COND0: condition, BODY0: yes, ELSE: no }, next, { itemCount: 1 })
const callback = (PARAMS, BODY) => block('js_callback', { PARAMS }, { BODY })
const renderCard = callback('name', block('js_const', { NAME: 'card' }, { VALUE: block('js_create_element', { TAG: 'article' }) },
  block('js_set_text_content', {}, { ELEM: variable('card'), TEXT: variable('name') }, block('js_append_child', {}, { PARENT: element('cards'), CHILD: variable('card') }))))
const page = content => `<!doctype html><html><head><meta charset="utf-8"><style>body{font:16px system-ui;padding:24px;background:#fff;color:#182235}button,input{font:inherit;padding:8px;margin:6px}article{padding:12px;border:1px solid #bbb;margin:8px}.dark{background:#182235;color:#fff}</style></head><body>${content}<script src="main.js" defer></script></body></html>`
const workspace = top => ({ blocks: { languageVersion: 0, blocks: [top] } })

export const practiceProjects = [
  { id: 'counter', title: 'Counter', task: 'Make the Add 1 button increase the number. Five clicks should display 5.',
    html: page('<h1>Counter</h1><button id="increment">Add 1</button><output id="count">0</output>'),
    state: workspace(block('js_let', { NAME: 'count' }, { VALUE: number(0) }, listen('increment', 'click',
      block('js_increment', { NAME: 'count', OP: '++' }, {}, setText('count', variable('count')))))) },
  { id: 'theme', title: 'Theme toggle', task: 'Make the Theme button toggle the dark class on the page. A second click should restore the light theme.',
    html: page('<h1>Theme toggle</h1><button id="theme">Theme</button>'),
    state: workspace(listen('theme', 'click', classes('toggle', 'dark'))) },
  { id: 'form', title: 'Form validator', task: 'Check the email when the form is submitted. Show helpful feedback for an invalid email, and Saved for a valid email.',
    html: page('<h1>Join the class</h1><form id="signup" novalidate><label>Email <input id="email" type="email" required></label><button>Submit</button></form><p id="feedback" role="status"></p>'),
    state: workspace(listen('signup', 'submit', block('js_prevent_default', {}, {}, conditional(
      block('js_form_valid', {}, { ELEM: element('email') }), setText('feedback', text('Saved')),
      setText('feedback', text('Enter a valid email.'), block('js_focus', {}, { ELEM: element('email') })))))) },
  { id: 'search', title: 'Searchable card list', task: 'Display HTML, CSS, and JavaScript cards. Filter the cards as someone types, ignoring letter case.',
    html: page('<h1>Find a topic</h1><label>Search <input id="search"></label><div id="cards"></div>'),
    state: workspace(block('js_const', { NAME: 'topics' }, { VALUE: createList(['HTML', 'CSS', 'JavaScript'].map(text)) },
      block('js_function_def', { NAME: 'renderCards', PARAMS: 'query' }, { BODY: block('js_set_inner_html', {}, { ELEM: element('cards'), HTML: text('') },
        block('js_for_each', {}, { ARR: block('js_array_transform', { METHOD: 'filter' }, { ARR: variable('topics'), CALLBACK: callback('name', block('js_return', {}, { VALUE: block('js_string_includes', {}, {
          STR: block('js_string_case', { METHOD: 'toLowerCase' }, { STR: variable('name') }), SEARCH: block('js_string_case', { METHOD: 'toLowerCase' }, { STR: variable('query') }),
        }) })) }), CALLBACK: renderCard })) }, call('renderCards', [text('')], listen('search', 'input', call('renderCards', [block('js_event_value')])))))) },
  { id: 'preference', title: 'Persistent preference', task: 'Save the selected theme in localStorage. Run the preview again and check that it restores the theme.',
    html: page('<h1>Remember my theme</h1><button id="theme">Theme</button>'),
    state: workspace(block('js_const', { NAME: 'savedTheme' }, { VALUE: block('js_coalesce', {}, { VALUE: block('js_local_storage_get', { KEY: 'theme' }), FALLBACK: text('light') }) },
      conditional(block('js_compare', { OP: '===' }, { A: variable('savedTheme'), B: text('dark') }), classes('add', 'dark'), block('js_comment', { TEXT: 'The default theme is light.' }),
        listen('theme', 'click', classes('toggle', 'dark', block('js_local_storage_set', { KEY: 'theme' }, { VALUE: block('js_ternary', {}, { COND: block('js_class_list_contains', { CLASS: 'dark' }, { ELEM: body() }), THEN: text('dark'), ELSE: text('light') }) })))))) },
  { id: 'api', title: 'API-driven page', task: 'Load topic cards from practice://cards. Show an error for practice://error, and let the Retry button load the cards again.',
    html: page('<h1>Topics from an API</h1><button id="retry">Retry</button><p id="feedback" role="status"></p><div id="cards"></div>'),
    state: workspace(block('js_function_def', { NAME: 'loadTopics', PARAMS: '' }, { BODY: block('js_fetch_request', { METHOD: 'GET', FORMAT: 'json', RESULT: 'data', ERR: 'error' }, {
      URL: text('practice://cards'), SUCCESS: setText('feedback', text('Loaded'), block('js_set_inner_html', {}, { ELEM: element('cards'), HTML: text('') }, block('js_for_each', {}, {
        ARR: block('js_array_transform', { METHOD: 'map' }, { ARR: variable('data'), CALLBACK: callback('topic', block('js_return', {}, { VALUE: block('js_property_get', { PROP: 'title' }, { OBJ: variable('topic') }) })) }), CALLBACK: renderCard,
      }))), ERROR: setText('feedback', text('Could not load topics. Try again.')),
    }) }, call('loadTopics', [], listen('retry', 'click', call('loadTopics'))))) },
]
