import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

export function defineFileReferenceBlocks(projectFiles = []) {
  // Link CSS File Block
  Blockly.Blocks['link_css_file'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('link CSS file')
        .appendField(new Blockly.FieldDropdown(
          () => {
            const cssFiles = projectFiles.filter(f => f.filename.endsWith('.css'));
            return cssFiles.length > 0 
              ? cssFiles.map(f => [f.filename, f.filename])
              : [['No CSS files', 'none']];
          }
        ), 'FILENAME');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Link a CSS file');
      this.setHelpUrl('');
    }
  };

  javascriptGenerator.forBlock['link_css_file'] = function(block) {
    const filename = block.getFieldValue('FILENAME');
    if (filename === 'none') return '';
    return `<link rel="stylesheet" href="${filename}">\n`;
  };

  // Script JS File Block
  Blockly.Blocks['script_js_file'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('script JS file')
        .appendField(new Blockly.FieldDropdown(
          () => {
            const jsFiles = projectFiles.filter(f => f.filename.endsWith('.js'));
            return jsFiles.length > 0
              ? jsFiles.map(f => [f.filename, f.filename])
              : [['No JS files', 'none']];
          }
        ), 'FILENAME');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('Link a JavaScript file');
      this.setHelpUrl('');
    }
  };

  javascriptGenerator.forBlock['script_js_file'] = function(block) {
    const filename = block.getFieldValue('FILENAME');
    if (filename === 'none') return '';
    return `<script src="${filename}"></script>\n`;
  };

  // Link to HTML Page Block - FIXED: Now connectable
  Blockly.Blocks['link_to_page'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('link to page')
        .appendField(new Blockly.FieldDropdown(
          () => {
            const htmlFiles = projectFiles.filter(f => f.filename.endsWith('.html'));
            return htmlFiles.length > 0
              ? htmlFiles.map(f => [f.filename, f.filename])
              : [['No HTML files', 'none']];
          }
        ), 'FILENAME')
        .appendField('text')
        .appendField(new Blockly.FieldTextInput('Click here'), 'TEXT');
      this.setPreviousStatement(true, null);  // ✅ Now connectable
      this.setNextStatement(true, null);      // ✅ Now connectable
      this.setColour(160);
      this.setTooltip('Create a link to another HTML page');
      this.setHelpUrl('');
    }
  };

  javascriptGenerator.forBlock['link_to_page'] = function(block) {
    const filename = block.getFieldValue('FILENAME');
    const text = block.getFieldValue('TEXT');
    if (filename === 'none') return '';
    // Use data-page attribute for navigation in preview
    return `<a href="#" data-page="${filename}">${text}</a>\n`;
  };
}

export const fileReferenceToolboxCategory = {
  kind: 'category',
  name: 'File Links',
  colour: 160,
  contents: [
    {
      kind: 'block',
      type: 'link_css_file'
    },
    {
      kind: 'block',
      type: 'script_js_file'
    },
    {
      kind: 'block',
      type: 'link_to_page'
    }
  ]
};