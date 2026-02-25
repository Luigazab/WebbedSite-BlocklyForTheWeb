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
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<div>\n${content}${INDENT}</div>\n`;
  };

  javascriptGenerator.forBlock['header'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<header>\n${content}${INDENT}</header>\n`;
  };

  javascriptGenerator.forBlock['footer'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<footer>\n${content}${INDENT}</footer>\n`;
  };

  javascriptGenerator.forBlock['section'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<section>\n${content}${INDENT}</section>\n`;
  };

  javascriptGenerator.forBlock['article'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<article>\n${content}${INDENT}</article>\n`;
  };

  javascriptGenerator.forBlock['nav'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<nav>\n${content}${INDENT}</nav>\n`;
  };

  javascriptGenerator.forBlock['main'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<main>\n${content}${INDENT}</main>\n`;
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
    const level = block.getFieldValue('LEVEL');
    const text = block.getFieldValue('TEXT');
    return `${INDENT}<h${level}>${text}</h${level}>\n`;
  };

  javascriptGenerator.forBlock['paragraph'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `${INDENT}<p>${text}</p>\n`;
  };

  javascriptGenerator.forBlock['span'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<span>${content}</span>\n`;
  };

  javascriptGenerator.forBlock['a_tag'] = function(block) {
    const url = block.getFieldValue('URL');
    const text = block.getFieldValue('TEXT');
    return `${INDENT}<a href="${url}">${text}</a>\n`;
  };

  javascriptGenerator.forBlock['strong'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `${INDENT}<strong>${text}</strong>\n`;
  };

  javascriptGenerator.forBlock['em'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `${INDENT}<em>${text}</em>\n`;
  };

  // =============================================================================
  // FORMS
  // =============================================================================

  javascriptGenerator.forBlock['form'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<form>\n${content}${INDENT}</form>\n`;
  };

  javascriptGenerator.forBlock['label'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `${INDENT}${INDENT}<label>${text}</label>\n`;
  };

  javascriptGenerator.forBlock['input'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const placeholder = block.getFieldValue('PLACEHOLDER');
    return `${INDENT}${INDENT}<input type="${type}" placeholder="${placeholder}">\n`;
  };

  javascriptGenerator.forBlock['textarea'] = function(block) {
    const rows = block.getFieldValue('ROWS');
    const cols = block.getFieldValue('COLS');
    const text = block.getFieldValue('TEXT');
    return `${INDENT}${INDENT}<textarea rows="${rows}" cols="${cols}">${text}</textarea>\n`;
  };

  javascriptGenerator.forBlock['button'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `${INDENT}${INDENT}<button>${text}</button>\n`;
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
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<ul>\n${content}${INDENT}</ul>\n`;
  };

  javascriptGenerator.forBlock['ol'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<ol>\n${content}${INDENT}</ol>\n`;
  };

  javascriptGenerator.forBlock['li'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `${INDENT}${INDENT}<li>${text}</li>\n`;
  };

  // =============================================================================
  // TABLES
  // =============================================================================

  javascriptGenerator.forBlock['table'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<table>\n${content}${INDENT}</table>\n`;
  };

  javascriptGenerator.forBlock['tr'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}${INDENT}<tr>\n${content}${INDENT}${INDENT}</tr>\n`;
  };

  javascriptGenerator.forBlock['th'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `${INDENT}${INDENT}${INDENT}<th>${text}</th>\n`;
  };

  javascriptGenerator.forBlock['td'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `${INDENT}${INDENT}${INDENT}<td>${text}</td>\n`;
  };

  // =============================================================================
  // CSS STYLES
  // =============================================================================

  javascriptGenerator.forBlock['style'] = function(block) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT');
    return `${INDENT}<style>\n${content}${INDENT}</style>\n`;
  };

  javascriptGenerator.forBlock['link_rel'] = function(block) {
    const rel = block.getFieldValue('REL');
    const href = block.getFieldValue('HREF');
    return `${INDENT}<link rel="${rel}" href="${href}">\n`;
  };

  javascriptGenerator.forBlock['css_rule'] = function(block) {
    const selector = block.getFieldValue('SELECTOR');
    const properties = javascriptGenerator.statementToCode(block, 'PROPERTIES');
    return `${INDENT}${INDENT}${selector} {\n${properties}${INDENT}${INDENT}}\n`;
  };

  // =============================================================================
  // CSS PROPERTIES
  // =============================================================================

  javascriptGenerator.forBlock['color'] = function(block) {
    const color = block.getFieldValue('COLOR');
    return `${INDENT}${INDENT}${INDENT}color: ${color};\n`;
  };

  javascriptGenerator.forBlock['background_color'] = function(block) {
    const color = block.getFieldValue('COLOR');
    return `${INDENT}${INDENT}${INDENT}background-color: ${color};\n`;
  };

  javascriptGenerator.forBlock['font_family'] = function(block) {
    const family = block.getFieldValue('FAMILY');
    return `${INDENT}${INDENT}${INDENT}font-family: ${family};\n`;
  };

  javascriptGenerator.forBlock['font_size'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `${INDENT}${INDENT}${INDENT}font-size: ${size}${unit};\n`;
  };

  javascriptGenerator.forBlock['text_align'] = function(block) {
    const align = block.getFieldValue('ALIGN');
    return `${INDENT}${INDENT}${INDENT}text-align: ${align};\n`;
  };

  javascriptGenerator.forBlock['margin'] = function(block) {
    const value = block.getFieldValue('VALUE');
    const unit = block.getFieldValue('UNIT');
    return `${INDENT}${INDENT}${INDENT}margin: ${value}${unit};\n`;
  };

  javascriptGenerator.forBlock['padding'] = function(block) {
    const value = block.getFieldValue('VALUE');
    const unit = block.getFieldValue('UNIT');
    return `${INDENT}${INDENT}${INDENT}padding: ${value}${unit};\n`;
  };

  javascriptGenerator.forBlock['width'] = function(block) {
    const value = block.getFieldValue('VALUE');
    const unit = block.getFieldValue('UNIT');
    if (unit === 'auto') {
      return `${INDENT}${INDENT}${INDENT}width: auto;\n`;
    }
    return `${INDENT}${INDENT}${INDENT}width: ${value}${unit};\n`;
  };

  javascriptGenerator.forBlock['height'] = function(block) {
    const value = block.getFieldValue('VALUE');
    const unit = block.getFieldValue('UNIT');
    if (unit === 'auto') {
      return `${INDENT}${INDENT}${INDENT}height: auto;\n`;
    }
    return `${INDENT}${INDENT}${INDENT}height: ${value}${unit};\n`;
  };

  javascriptGenerator.forBlock['border'] = function(block) {
    const width = block.getFieldValue('WIDTH');
    const style = block.getFieldValue('STYLE');
    const color = block.getFieldValue('COLOR');
    return `${INDENT}${INDENT}${INDENT}border: ${width}px ${style} ${color};\n`;
  };

  javascriptGenerator.forBlock['border_radius'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `${INDENT}${INDENT}${INDENT}border-radius: ${value}px;\n`;
  };

  javascriptGenerator.forBlock['display'] = function(block) {
    const display = block.getFieldValue('DISPLAY');
    return `${INDENT}${INDENT}${INDENT}display: ${display};\n`;
  };

  javascriptGenerator.forBlock['text_decoration'] = function(block) {
    const decoration = block.getFieldValue('DECORATION');
    return `${INDENT}${INDENT}${INDENT}text-decoration: ${decoration};\n`;
  };

  javascriptGenerator.forBlock['text_transform'] = function(block) {
    const transform = block.getFieldValue('TRANSFORM');
    return `${INDENT}${INDENT}${INDENT}text-transform: ${transform};\n`;
  };

  javascriptGenerator.forBlock['float'] = function(block) {
    const float = block.getFieldValue('FLOAT');
    return `${INDENT}${INDENT}${INDENT}float: ${float};\n`;
  };

  javascriptGenerator.forBlock['position'] = function(block) {
    const position = block.getFieldValue('POSITION');
    return `${INDENT}${INDENT}${INDENT}position: ${position};\n`;
  };

  // =============================================================================
  // ATTRIBUTES
  // =============================================================================

  javascriptGenerator.forBlock['class_attr'] = function(block) {
    const className = block.getFieldValue('CLASS');
    return ` class="${className}"`;
  };

  javascriptGenerator.forBlock['id_attr'] = function(block) {
    const id = block.getFieldValue('ID');
    return ` id="${id}"`;
  };
};