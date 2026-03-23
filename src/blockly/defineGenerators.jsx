import { javascriptGenerator } from 'blockly/javascript';

const I  = '  '   // one level of indent
const II = '    ' // two levels
 

export const defineGenerators = () => {
  const INDENT = '  ';

  // =============================================================================
  // PAGE STRUCTURE
  // =============================================================================

  javascriptGenerator.forBlock['html_doctype'] = function(block) {
    const htmlContent = javascriptGenerator.statementToCode(block, 'HTML');
    return `<!DOCTYPE html>\n<html>\n${htmlContent}</html>\n`;
  };

  javascriptGenerator.forBlock['head'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'head_element');
    return `<head>\n${content}</head>\n`;
  };

  javascriptGenerator.forBlock['body'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'body_element');
    return `<body>\n${content}</body>\n`;
  };

  javascriptGenerator.forBlock['title'] = function(block) {
    const titleText = block.getFieldValue('NAME');
    return `${INDENT}<title>${titleText}</title>\n`;
  };

  // =============================================================================
  // STRUCTURE ELEMENTS
  // =============================================================================

  javascriptGenerator.forBlock['div'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<div${attributes}>\n${content}${INDENT}</div>\n`;
  };

  javascriptGenerator.forBlock['header'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<header${attributes}>\n${content}${INDENT}</header>\n`;
  };

  javascriptGenerator.forBlock['footer'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<footer${attributes}>\n${content}${INDENT}</footer>\n`;
  };

  javascriptGenerator.forBlock['section'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<section${attributes}>\n${content}${INDENT}</section>\n`;
  };

  javascriptGenerator.forBlock['article'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<article${attributes}>\n${content}${INDENT}</article>\n`;
  };

  javascriptGenerator.forBlock['nav'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<nav${attributes}>\n${content}${INDENT}</nav>\n`;
  };

  javascriptGenerator.forBlock['main'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<main${attributes}>\n${content}${INDENT}</main>\n`;
  };

  javascriptGenerator.forBlock['br'] = function(block) {
    return `${INDENT}<br>\n`;
  };

  javascriptGenerator.forBlock['hr'] = function(block) {
    return `${INDENT}<hr>\n`;
  };

  // =============================================================================
  // TEXT ELEMENTS
  // =============================================================================

  javascriptGenerator.forBlock['heading'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const level = block.getFieldValue('LEVEL');
    const text = block.getFieldValue('TEXT');
    return `${INDENT}<h${level}${attributes}>${text}</h${level}>\n`;
  };

  javascriptGenerator.forBlock['paragraph'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const text = block.getFieldValue('TEXT');
    return `${INDENT}<p${attributes}>${text}</p>\n`;
  };

  javascriptGenerator.forBlock['span'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<span${attributes}>${content}</span>\n`;
  };

  javascriptGenerator.forBlock['a_tag'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const url = block.getFieldValue('URL');
    const text = block.getFieldValue('TEXT');
    return `${INDENT}<a href="${url}"${attributes}>${text}</a>\n`;
  };

  javascriptGenerator.forBlock['strong'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const text = block.getFieldValue('TEXT');
    return `${INDENT}<strong${attributes}>${text}</strong>\n`;
  };

  javascriptGenerator.forBlock['em'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const text = block.getFieldValue('TEXT');
    return `${INDENT}<em${attributes}>${text}</em>\n`;
  };

  // =============================================================================
  // FORMS
  // =============================================================================

  javascriptGenerator.forBlock['form'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<form${attributes}>\n${content}${INDENT}</form>\n`;
  };

  javascriptGenerator.forBlock['label'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const text = block.getFieldValue('TEXT');
    return `${INDENT}${INDENT}<label${attributes}>${text}</label>\n`;
  };

  javascriptGenerator.forBlock['input'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const type = block.getFieldValue('TYPE');
    const placeholder = block.getFieldValue('PLACEHOLDER');
    return `${INDENT}${INDENT}<input type="${type}" placeholder="${placeholder}"${attributes}>\n`;
  };

  javascriptGenerator.forBlock['textarea'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const rows = block.getFieldValue('ROWS');
    const cols = block.getFieldValue('COLS');
    const text = block.getFieldValue('TEXT');
    return `${INDENT}${INDENT}<textarea rows="${rows}" cols="${cols}"${attributes}>${text}</textarea>\n`;
  };

  javascriptGenerator.forBlock['button'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const text = block.getFieldValue('TEXT');
    return `${INDENT}${INDENT}<button${attributes}>${text}</button>\n`;
  };

  // =============================================================================
  // MEDIA
  // =============================================================================

  javascriptGenerator.forBlock['img'] = function(block) {
    const src = block.getFieldValue('SRC');
    const alt = block.getFieldValue('ALT');
    const width = block.getFieldValue('WIDTH');
    const height = block.getFieldValue('HEIGHT');
    return `${INDENT}<img src="${src}" alt="${alt}" width="${width}" height="${height}">\n`;
  };

  javascriptGenerator.forBlock['audio'] = function(block) {
    const file = block.getFieldValue('FILE');
    const type = block.getFieldValue('TYPE');
    return `${INDENT}<audio controls>\n${INDENT}${INDENT}<source src="${file}" type="${type}">\n${INDENT}</audio>\n`;
  };

  javascriptGenerator.forBlock['video'] = function(block) {
    const width = block.getFieldValue('WIDTH');
    const file = block.getFieldValue('FILE');
    const type = block.getFieldValue('TYPE');
    return `${INDENT}<video width="${width}" controls>\n${INDENT}${INDENT}<source src="${file}" type="${type}">\n${INDENT}</video>\n`;
  };

  // =============================================================================
  // LISTS
  // =============================================================================

  javascriptGenerator.forBlock['ul'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<ul${attributes}>\n${content}${INDENT}</ul>\n`;
  };

  javascriptGenerator.forBlock['ol'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<ol${attributes}>\n${content}${INDENT}</ol>\n`;
  };

  javascriptGenerator.forBlock['li'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}${INDENT}<li${attributes}>${content}</li>\n`;
  };

  // =============================================================================
  // TABLES
  // =============================================================================

  javascriptGenerator.forBlock['table'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<table${attributes}>\n${content}${INDENT}</table>\n`;
  };

  javascriptGenerator.forBlock['tr'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}${INDENT}<tr${attributes}>\n${content}${INDENT}${INDENT}</tr>\n`;
  };

  javascriptGenerator.forBlock['th'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}${INDENT}${INDENT}<th${attributes}>\n${content}${INDENT}${INDENT}${INDENT}</th>\n`;
  };

  javascriptGenerator.forBlock['td'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}${INDENT}${INDENT}<td${attributes}>\n${content}${INDENT}${INDENT}${INDENT}</td>\n`;
  };
  // =============================================================================
  // LISTS (additional)
  // =============================================================================

  javascriptGenerator.forBlock['select'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<select${attributes}>\n${content}${INDENT}</select>\n`;
  };

  javascriptGenerator.forBlock['option'] = function(block) {
    const attributes = javascriptGenerator.valueToCode(block, 'attributes', 0) || '';
    const text = block.getFieldValue('TEXT');
    return `${INDENT}${INDENT}<option${attributes}>${text}</option>\n`;
  };

  // =============================================================================
  // CSS STYLES (head & internal)
  // =============================================================================

  javascriptGenerator.forBlock['head_style'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `<style>\n${content}</style>\n`;
  };

  javascriptGenerator.forBlock['head_link'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const url = block.getFieldValue('URL');
    const extra = javascriptGenerator.valueToCode(block, 'NAME', 0) || '';
    return `<link rel="${type}" href="${url}"${extra}>\n`;
  };

  javascriptGenerator.forBlock['style_target'] = function(block) {
    const target = block.getFieldValue('TARGET');
    const effect = javascriptGenerator.valueToCode(block, 'STYLE_FOR', 0) || '';
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}${target}${effect} {\n${content}${INDENT}}\n`;
  };

  javascriptGenerator.forBlock['style_effect'] = function(block) {
    return block.getFieldValue('effect');
  };

  javascriptGenerator.forBlock['html_meta_charset'] = (block) =>
    `${I}<meta charset="${block.getFieldValue('CHARSET')}">\n`
 
  javascriptGenerator.forBlock['html_meta_viewport'] = (block) =>
    `${I}<meta name="viewport" content="${block.getFieldValue('CONTENT')}">\n`
 
  javascriptGenerator.forBlock['html_meta_named'] = (block) =>
    `${I}<meta name="${block.getFieldValue('NAME')}" content="${block.getFieldValue('CONTENT')}">\n`
 
  javascriptGenerator.forBlock['html_meta_http_equiv'] = (block) =>
    `${I}<meta http-equiv="${block.getFieldValue('HTTP_EQUIV')}" content="${block.getFieldValue('CONTENT')}">\n`
 
  // ── SCRIPT ───────────────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['html_script_inline'] = (block) => {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${I}<script>\n${content}${I}</script>\n`
  }
 
  // ── INLINE TEXT ──────────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['html_b'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${I}<b${attrs}>${block.getFieldValue('TEXT')}</b>\n`
  }
 
  javascriptGenerator.forBlock['html_i'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${I}<i${attrs}>${block.getFieldValue('TEXT')}</i>\n`
  }
 
  javascriptGenerator.forBlock['html_mark'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${I}<mark${attrs}>${block.getFieldValue('TEXT')}</mark>\n`
  }
 
  javascriptGenerator.forBlock['html_small'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${I}<small${attrs}>${block.getFieldValue('TEXT')}</small>\n`
  }
 
  javascriptGenerator.forBlock['html_del'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${I}<del${attrs}>${block.getFieldValue('TEXT')}</del>\n`
  }
 
  javascriptGenerator.forBlock['html_ins'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${I}<ins${attrs}>${block.getFieldValue('TEXT')}</ins>\n`
  }
 
  javascriptGenerator.forBlock['html_sub'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${I}<sub${attrs}>${block.getFieldValue('TEXT')}</sub>\n`
  }
 
  javascriptGenerator.forBlock['html_sup'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${I}<sup${attrs}>${block.getFieldValue('TEXT')}</sup>\n`
  }
 
  // ── SECTIONING ───────────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['html_aside'] = (block) => {
    const attrs    = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    const content  = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${I}<aside${attrs}>\n${content}${I}</aside>\n`
  }
 
  javascriptGenerator.forBlock['html_address'] = (block) => {
    const attrs   = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${I}<address${attrs}>\n${content}${I}</address>\n`
  }
 
  // ── DESCRIPTION LISTS ─────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['html_dl'] = (block) => {
    const attrs   = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${I}<dl${attrs}>\n${content}${I}</dl>\n`
  }
 
  javascriptGenerator.forBlock['html_dt'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${II}<dt${attrs}>${block.getFieldValue('TEXT')}</dt>\n`
  }
 
  javascriptGenerator.forBlock['html_dd'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${II}<dd${attrs}>${block.getFieldValue('TEXT')}</dd>\n`
  }
 
  // ── TABLE ADDITIONS ──────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['html_caption'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${II}<caption${attrs}>${block.getFieldValue('TEXT')}</caption>\n`
  }
 
  javascriptGenerator.forBlock['html_colgroup'] = (block) => {
    const attrs   = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${II}<colgroup${attrs}>\n${content}${II}</colgroup>\n`
  }
 
  javascriptGenerator.forBlock['html_col'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    const span  = block.getFieldValue('SPAN')
    return `${II}${I}<col span="${span}"${attrs}>\n`
  }
 
  javascriptGenerator.forBlock['html_thead'] = (block) => {
    const attrs   = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${II}<thead${attrs}>\n${content}${II}</thead>\n`
  }
 
  javascriptGenerator.forBlock['html_tbody'] = (block) => {
    const attrs   = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${II}<tbody${attrs}>\n${content}${II}</tbody>\n`
  }
 
  javascriptGenerator.forBlock['html_tfoot'] = (block) => {
    const attrs   = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${II}<tfoot${attrs}>\n${content}${II}</tfoot>\n`
  }
 
  // ── FORM ADDITIONS ───────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['html_fieldset'] = (block) => {
    const attrs   = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${I}<fieldset${attrs}>\n${content}${I}</fieldset>\n`
  }
 
  javascriptGenerator.forBlock['html_legend'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${II}<legend${attrs}>${block.getFieldValue('TEXT')}</legend>\n`
  }
 
  javascriptGenerator.forBlock['html_datalist'] = (block) => {
    const id      = block.getFieldValue('ID')
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${I}<datalist id="${id}">\n${content}${I}</datalist>\n`
  }
 
  javascriptGenerator.forBlock['html_optgroup'] = (block) => {
    const label   = block.getFieldValue('LABEL')
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${II}<optgroup label="${label}">\n${content}${II}</optgroup>\n`
  }
 
  javascriptGenerator.forBlock['html_progress'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    const value = block.getFieldValue('VALUE')
    const max   = block.getFieldValue('MAX')
    return `${I}<progress value="${value}" max="${max}"${attrs}></progress>\n`
  }
 
  javascriptGenerator.forBlock['html_meter'] = (block) => {
    const value = block.getFieldValue('VALUE')
    const min   = block.getFieldValue('MIN')
    const max   = block.getFieldValue('MAX')
    const low   = block.getFieldValue('LOW')
    const high  = block.getFieldValue('HIGH')
    return `${I}<meter value="${value}" min="${min}" max="${max}" low="${low}" high="${high}"></meter>\n`
  }
 
  // ── INTERACTIVE ──────────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['html_details'] = (block) => {
    const attrs   = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${I}<details${attrs}>\n${content}${I}</details>\n`
  }
 
  javascriptGenerator.forBlock['html_summary'] = (block) => {
    const attrs = javascriptGenerator.valueToCode(block, 'attributes', 0) || ''
    return `${II}<summary${attrs}>${block.getFieldValue('TEXT')}</summary>\n`
  }
 
  javascriptGenerator.forBlock['html_dialog'] = (block) => {
    const id      = block.getFieldValue('ID')
    const open    = block.getFieldValue('OPEN') === 'TRUE' ? ' open' : ''
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${I}<dialog id="${id}"${open}>\n${content}${I}</dialog>\n`
  }
 
  // ── EMBEDDED CONTENT ─────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['html_iframe'] = (block) => {
    const src    = block.getFieldValue('SRC')
    const width  = block.getFieldValue('WIDTH')
    const height = block.getFieldValue('HEIGHT')
    const title  = block.getFieldValue('TITLE')
    return `${I}<iframe src="${src}" width="${width}" height="${height}" title="${title}"></iframe>\n`
  }
 
  javascriptGenerator.forBlock['html_embed'] = (block) => {
    const src    = block.getFieldValue('SRC')
    const type   = block.getFieldValue('TYPE')
    const width  = block.getFieldValue('WIDTH')
    const height = block.getFieldValue('HEIGHT')
    return `${I}<embed src="${src}" type="${type}" width="${width}" height="${height}">\n`
  }
 
  javascriptGenerator.forBlock['html_object'] = (block) => {
    const data    = block.getFieldValue('DATA')
    const type    = block.getFieldValue('TYPE')
    const width   = block.getFieldValue('WIDTH')
    const height  = block.getFieldValue('HEIGHT')
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${I}<object data="${data}" type="${type}" width="${width}" height="${height}">\n${content}${I}</object>\n`
  }
 
  javascriptGenerator.forBlock['html_picture'] = (block) => {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${I}<picture>\n${content}${I}</picture>\n`
  }
 
  javascriptGenerator.forBlock['html_source'] = (block) => {
    const attrType = block.getFieldValue('ATTR_TYPE')
    const src      = block.getFieldValue('SRC')
    const mime     = block.getFieldValue('MIME')
    const media    = block.getFieldValue('MEDIA')
    return `${II}<source ${attrType}="${src}" type="${mime}" media="${media}">\n`
  }
 
  javascriptGenerator.forBlock['html_track'] = (block) => {
    const src     = block.getFieldValue('SRC')
    const kind    = block.getFieldValue('KIND')
    const srclang = block.getFieldValue('SRCLANG')
    const label   = block.getFieldValue('LABEL')
    return `${II}<track src="${src}" kind="${kind}" srclang="${srclang}" label="${label}">\n`
  }
 
  // ── GRAPHICS ─────────────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['html_svg'] = (block) => {
    const width   = block.getFieldValue('WIDTH')
    const height  = block.getFieldValue('HEIGHT')
    const viewBox = block.getFieldValue('VIEWBOX')
    const content = javascriptGenerator.statementToCode(block, 'CONTENT')
    return `${I}<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">\n${content}${I}</svg>\n`
  }
 
  javascriptGenerator.forBlock['html_canvas'] = (block) => {
    const id     = block.getFieldValue('ID')
    const width  = block.getFieldValue('WIDTH')
    const height = block.getFieldValue('HEIGHT')
    return `${I}<canvas id="${id}" width="${width}" height="${height}"></canvas>\n`
  }
  // =============================================================================
  // ATTRIBUTE BLOCKS (value blocks – return tuple)
  // =============================================================================

  javascriptGenerator.forBlock['class'] = function(block) {
    const code = ` class="${block.getFieldValue('NAME')}"`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['id'] = function(block) {
    const code = ` id="${block.getFieldValue('NAME')}"`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['body_style'] = function(block) {
    const inner = javascriptGenerator.valueToCode(block, 'body_style', javascriptGenerator.ORDER_ATOMIC) || '';
    const code = ` style="${inner}"`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['extra_attributes'] = function(block) {
    const code = javascriptGenerator.valueToCode(block, 'body_style', javascriptGenerator.ORDER_ATOMIC) || '';
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
};