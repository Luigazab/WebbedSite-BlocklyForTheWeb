import { javascriptGenerator } from 'blockly/javascript';

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

  // =============================================================================
  // EXTERNAL STYLE BLOCKS (used inside <style>)
  // Each returns a CSS declaration followed by a newline.
  // =============================================================================

  javascriptGenerator.forBlock['external_text_color'] = function(block) {
    return `color: ${block.getFieldValue('COLOR')};\n`;
  };

  javascriptGenerator.forBlock['external_font_family'] = function(block) {
    return `font-family: ${block.getFieldValue('FONT')};\n`;
  };

  javascriptGenerator.forBlock['external_font_size'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `font-size: ${size}${unit};\n`;
  };

  javascriptGenerator.forBlock['external_font_size_descriptive'] = function(block) {
    return `font-size: ${block.getFieldValue('SIZE')};\n`;
  };

  javascriptGenerator.forBlock['external_text_align'] = function(block) {
    return `text-align: ${block.getFieldValue('ALIGN')};\n`;
  };

  javascriptGenerator.forBlock['external_text_transform'] = function(block) {
    return `text-transform: ${block.getFieldValue('TRANSFORM')};\n`;
  };

  javascriptGenerator.forBlock['external_text_decoration'] = function(block) {
    const dec = block.getFieldValue('DECORATION');
    const style = block.getFieldValue('DECORATION_STYLE');
    return `text-decoration: ${dec} ${style};\n`;
  };

  javascriptGenerator.forBlock['external_text_shadow'] = function(block) {
    const h = block.getFieldValue('H-SHADOW');
    const v = block.getFieldValue('V-SHADOW');
    const r = block.getFieldValue('RADIUS');
    const c = block.getFieldValue('COLOR');
    return `text-shadow: ${h} ${v} ${r} ${c};\n`;
  };

  javascriptGenerator.forBlock['external_display'] = function(block) {
    return `display: ${block.getFieldValue('DISPLAY')};\n`;
  };

  javascriptGenerator.forBlock['external_overflow'] = function(block) {
    const axis = block.getFieldValue('AXIS');
    const overflow = block.getFieldValue('OVERFLOW');
    return `overflow-${axis}: ${overflow};\n`;
  };

  javascriptGenerator.forBlock['external_float'] = function(block) {
    return `float: ${block.getFieldValue('FLOAT')};\n`;
  };

  javascriptGenerator.forBlock['external_height'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `height: ${size}${unit};\n`;
  };

  javascriptGenerator.forBlock['external_width'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `width: ${size}${unit};\n`;
  };

  javascriptGenerator.forBlock['external_margin'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `margin: ${size}${unit};\n`;
  };

  javascriptGenerator.forBlock['external_margin_specific'] = function(block) {
    const dir = block.getFieldValue('DIRECTION');
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `margin-${dir}: ${size}${unit};\n`;
  };

  javascriptGenerator.forBlock['external_padding'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `padding: ${size}${unit};\n`;
  };

  javascriptGenerator.forBlock['external_padding_specific'] = function(block) {
    const dir = block.getFieldValue('DIRECTION');
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `padding-${dir}: ${size}${unit};\n`;
  };

  javascriptGenerator.forBlock['external_background_color'] = function(block) {
    return `background-color: ${block.getFieldValue('COLOR')};\n`;
  };

  javascriptGenerator.forBlock['external_background_image'] = function(block) {
    return `background-image: url("${block.getFieldValue('URL')}");\n`;
  };

  javascriptGenerator.forBlock['external_background_repeat'] = function(block) {
    return `background-repeat: ${block.getFieldValue('REPEAT')};\n`;
  };

  javascriptGenerator.forBlock['external_background_position'] = function(block) {
    return `background-position: ${block.getFieldValue('POSITION')};\n`;
  };

  javascriptGenerator.forBlock['external_background_size'] = function(block) {
    return `background-size: ${block.getFieldValue('SIZE')};\n`;
  };

  javascriptGenerator.forBlock['external_background_clip'] = function(block) {
    return `background-clip: ${block.getFieldValue('CLIP')};\n`;
  };

  javascriptGenerator.forBlock['external_border'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const style = block.getFieldValue('BORDER_STYLE');
    const color = block.getFieldValue('COLOR');
    return `border: ${size}${unit} ${style} ${color};\n`;
  };

  javascriptGenerator.forBlock['external_border_specific'] = function(block) {
    const side = block.getFieldValue('SIDE');
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const style = block.getFieldValue('BORDER_STYLE');
    const color = block.getFieldValue('COLOR');
    return `border-${side}: ${size}${unit} ${style} ${color};\n`;
  };

  javascriptGenerator.forBlock['external_border_radius'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `border-radius: ${size}${unit};\n`;
  };

  javascriptGenerator.forBlock['external_border_radius_specific'] = function(block) {
    const side = block.getFieldValue('SIDE');
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `border-${side}-radius: ${size}${unit};\n`;
  };

  javascriptGenerator.forBlock['external_cursor'] = function(block) {
    return `cursor: ${block.getFieldValue('TYPE')};\n`;
  };

  javascriptGenerator.forBlock['external_box_shadow'] = function(block) {
    const h = block.getFieldValue('H-SHADOW');
    const v = block.getFieldValue('V-SHADOW');
    const r = block.getFieldValue('RADIUS');
    const c = block.getFieldValue('COLOR');
    return `box-shadow: ${h} ${v} ${r} ${c};\n`;
  };

  // =============================================================================
  // INTERNAL STYLE BLOCKS (used in inline style="...")
  // Each returns a CSS declaration without a newline (for concatenation).
  // =============================================================================

  javascriptGenerator.forBlock['internal_text_color'] = function(block) {
    const code = `color: ${block.getFieldValue('COLOR')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_font_family'] = function(block) {
    const code = `font-family: ${block.getFieldValue('FONT')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_font_size'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `font-size: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_font_size_descriptive'] = function(block) {
    const code = `font-size: ${block.getFieldValue('SIZE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_text_align'] = function(block) {
    const code = `text-align: ${block.getFieldValue('ALIGN')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_text_transform'] = function(block) {
    const code = `text-transform: ${block.getFieldValue('TRANSFORM')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_text_decoration'] = function(block) {
    const dec = block.getFieldValue('DECORATION');
    const style = block.getFieldValue('DECORATION_STYLE');
    const code = `text-decoration: ${dec} ${style};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_text_shadow'] = function(block) {
    const h = block.getFieldValue('H-SHADOW');
    const v = block.getFieldValue('V-SHADOW');
    const r = block.getFieldValue('RADIUS');
    const c = block.getFieldValue('COLOR');
    const code = `text-shadow: ${h} ${v} ${r} ${c};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_display'] = function(block) {
    const code = `display: ${block.getFieldValue('DISPLAY')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_overflow'] = function(block) {
    const axis = block.getFieldValue('AXIS');
    const overflow = block.getFieldValue('OVERFLOW');
    const code = `overflow-${axis}: ${overflow};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_float'] = function(block) {
    const code = `float: ${block.getFieldValue('FLOAT')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_height'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `height: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_width'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `width: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_margin'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `margin: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_margin_specific'] = function(block) {
    const dir = block.getFieldValue('DIRECTION');
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `margin-${dir}: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_padding'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `padding: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_padding_specific'] = function(block) {
    const dir = block.getFieldValue('DIRECTION');
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `padding-${dir}: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_background_color'] = function(block) {
    const code = `background-color: ${block.getFieldValue('COLOR')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_background_image'] = function(block) {
    const code = `background-image: url("${block.getFieldValue('URL')}");`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_background_repeat'] = function(block) {
    const code = `background-repeat: ${block.getFieldValue('REPEAT')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_background_position'] = function(block) {
    const code = `background-position: ${block.getFieldValue('POSITION')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_background_size'] = function(block) {
    const code = `background-size: ${block.getFieldValue('SIZE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_background_clip'] = function(block) {
    const code = `background-clip: ${block.getFieldValue('CLIP')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_border'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const style = block.getFieldValue('BORDER_STYLE');
    const color = block.getFieldValue('COLOR');
    const code = `border: ${size}${unit} ${style} ${color};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_border_specific'] = function(block) {
    const side = block.getFieldValue('SIDE');
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const style = block.getFieldValue('BORDER_STYLE');
    const color = block.getFieldValue('COLOR');
    const code = `border-${side}: ${size}${unit} ${style} ${color};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_border_radius'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `border-radius: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_border_radius_specific'] = function(block) {
    const side = block.getFieldValue('SIDE');
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `border-${side}-radius: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_cursor'] = function(block) {
    const code = `cursor: ${block.getFieldValue('TYPE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['internal_box_shadow'] = function(block) {
    const h = block.getFieldValue('H-SHADOW');
    const v = block.getFieldValue('V-SHADOW');
    const r = block.getFieldValue('RADIUS');
    const c = block.getFieldValue('COLOR');
    const code = `box-shadow: ${h} ${v} ${r} ${c};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };

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