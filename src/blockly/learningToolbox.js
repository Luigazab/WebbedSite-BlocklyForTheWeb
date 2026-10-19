export const deprecatedJSTypes = new Set(['variables_get', 'variables_set', 'controls_if', 'procedures_defnoreturn', 'procedures_defreturn', 'procedures_callnoreturn', 'procedures_callreturn', 'js_if', 'js_if_else', 'js_if_else_if', 'js_empty_array', 'js_array_create', 'js_object_literal', 'js_function_call_stmt', 'js_function_call_expr', 'js_script_head', 'js_script_body', 'js_array_pop', 'js_array_shift', 'js_fetch_get', 'js_fetch_post'])
import { learningColour } from './learningColours.js'
const groups = [
  ['Values & Variables', '#E6A817', ['js_string_val', 'js_number_val', 'js_boolean_val', 'js_let', 'js_const', 'js_get_var', 'js_set_var', 'js_increment'], ['js_null', 'js_undefined', 'js_compound_assign', 'js_parse_number', 'js_to_string']],
  ['Conditions', '#4285F4', ['js_compare', 'js_logic_op', 'js_not', 'js_if_expandable'], ['js_ternary', 'js_coalesce', 'js_typeof']],
  ['Loops', '#C0392B', ['js_for_count', 'js_for_of'], ['js_for_range', 'js_while', 'js_do_while', 'js_for_in', 'js_break', 'js_continue']],
  ['Functions', '#8E44AD', ['js_function_def', 'js_call', 'js_call_value', 'js_return'], ['js_return_void', 'js_callback', 'js_arrow_function', 'js_async_function', 'js_await', 'js_expression_statement']],
  ['Text & Numbers', '#E67E22', ['js_arithmetic', 'js_string_concat', 'js_template_literal', 'js_string_length', 'js_string_case', 'js_string_includes'], ['js_string_starts_ends', 'js_string_index_of', 'js_string_slice', 'js_string_replace', 'js_string_split', 'js_string_repeat', 'js_string_char_at', 'js_math_random', 'js_math_random_int', 'js_math_method', 'js_math_pow', 'js_math_min_max']],
  ['Lists & Objects', '#9B59B6', ['js_array_new', 'js_object_new', 'js_array_get', 'js_array_length', 'js_array_push', 'js_property_get'], ['js_array_set', 'js_array_take', 'js_array_unshift', 'js_array_includes', 'js_array_index_of', 'js_array_join', 'js_array_mutate', 'js_array_sort_numeric', 'js_array_slice', 'js_array_splice_value', 'js_array_concat', 'js_array_transform', 'js_for_each', 'js_property_set', 'js_bracket_get', 'js_bracket_set', 'js_optional_property']],
  ['Page Elements', '#2471A3', ['js_get_by_id', 'js_query_selector', 'js_set_text_content', 'js_get_text_content', 'js_class_list', 'js_create_element', 'js_append_child', 'js_remove_element'], ['js_query_selector_all', 'js_document_body', 'js_set_inner_html', 'js_get_inner_html', 'js_set_attribute_value', 'js_get_attribute', 'js_class_value', 'js_class_list_contains', 'js_set_style_value', 'js_get_style', 'js_get_computed_style', 'js_document_title', 'js_window_location', 'js_window_location_get']],
  ['Events & Forms', '#E74C3C', ['js_listen', 'js_dom_content_loaded', 'js_event_target', 'js_event_value', 'js_get_value', 'js_set_value', 'js_prevent_default'], ['js_window_event', 'js_event_key', 'js_event_current_target', 'js_stop_propagation', 'js_listener_ref', 'js_remove_listener', 'js_form_property', 'js_set_checked', 'js_form_valid', 'js_focus']],
  ['Debugging', '#27AE60', ['js_console_log', 'js_comment'], ['js_console_error', 'js_console_warn', 'js_block_comment', 'js_try_catch', 'js_try_catch_finally', 'js_throw', 'js_debugger']],
  ['Timers & Animation', '#1ABC9C', [], ['js_timer_value', 'js_cancel_timer', 'js_request_frame', 'js_cancel_frame']],
  ['Data & APIs', '#607D8B', [], ['js_fetch_request', 'js_fetch_value', 'js_json_parse', 'js_json_stringify', 'js_local_storage_set', 'js_local_storage_get', 'js_local_storage_remove', 'js_local_storage_clear', 'js_session_storage_set', 'js_session_storage_get', 'js_date_now', 'js_new_date']],
  ['Advanced', '#78909C', [], ['js_var_decl', 'js_global_var', 'js_new_instance', 'js_instanceof', 'js_spread', 'js_switch', 'js_use_strict', 'js_show_dialog', 'js_ask_text']],
]

export function createLearningToolbox(base, { filename = 'index.html', level = 'beginner', lessonBlocks = [] } = {}) {
  const extension = filename.split('.').pop().toLowerCase()
  const contents = []
  let section = 'HTML'
  for (const item of base.contents) {
    if (item.kind === 'toolboxlabel') section = item.name
    if (section === 'JavaScript' || item.kind !== 'category') continue
    if (extension === 'html' || (extension === 'css' && section === 'CSS' && item.name !== 'Internal' && item.name !== 'Inline')) contents.push(structuredClone(item))
  }
  if (extension !== 'css') {
    let categories = groups.map(([name, colour, basic, extra]) => ({ kind: 'category', name, colour: learningColour(colour),
      contents: [...basic, ...(level === 'full' ? extra : [])].map(type => ({ kind: 'block', type })) })).filter(c => c.contents.length)
    const javascriptLessons = lessonBlocks.filter(type => /^(js_|variables_|procedures_|controls_|math_|logic_|text$)/.test(type) || type === 'html_script_inline')
    if (javascriptLessons.length) {
      const lesson = { kind: 'category', name: 'This Lesson', colour: '#7C3AED', contents: [...new Set([...javascriptLessons, 'js_string_val', 'js_number_val', 'js_boolean_val', 'js_get_var'])].map(type => ({ kind: 'block', type })) }
      categories = level === 'lesson' ? [lesson] : [lesson, ...categories]
    }
    contents.push({ kind: 'category', name: 'JavaScript', colour: '#996600', expanded: true, contents: categories })
    if (extension === 'html') contents.push({ kind: 'category', name: 'File Links', colour: 160, contents: ['link_css_file', 'script_js_file', 'link_to_page'].map(type => ({ kind: 'block', type })) })
  }
  return { kind: 'categoryToolbox', contents }
}

export function lessonBlockTypes(step) {
  const types = new Set(step?.allowed_block_types ?? [])
  if (step?.highlight_block_type) types.add(step.highlight_block_type)
  const visit = value => {
    if (!value || typeof value !== 'object') return
    if (typeof value.type === 'string') types.add(value.type)
    Object.values(value).forEach(child => Array.isArray(child) ? child.forEach(visit) : visit(child))
  }
  for (const file of step?.tutorial_step_files ?? []) visit(file.blocks_json)
  for (const expected of step?.expected ?? []) visit(expected.expected_blocks_json)
  return [...types]
}
