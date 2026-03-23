import * as Blockly from 'blockly/core';
import "@blockly/block-plus-minus";

export const defineCSSBlocks = () => {
  //EXTERNAL
  // =============================================================================
  // EXTERNAL: CSS STYLES
  // =============================================================================
  //EXTERNAL TEXT STYLINGS
  Blockly.Blocks['external_text_color'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('color:')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Color for texts');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_font_family'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('font-family:')
        .appendField(new Blockly.FieldTextInput('serif'), 'FONT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Set a font style for texts');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };   
  Blockly.Blocks['external_font_size'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('font-size:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };   
  Blockly.Blocks['external_font_size_descriptive'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('font-size:')
        .appendField(new Blockly.FieldDropdown([
          ['initial', 'initial '],
          ['inherit', 'inherit'],
          ['xx-small', 'xx-small'],
          ['x-small', 'x-small'],
          ['small', 'small'],
          ['large', 'large'],
          ['x-large', 'x-large'],
          ['xx-large', 'xx-large'],
          ['smaller', 'smaller'],
          ['larger', 'larger'],
        ]), 'SIZE')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };   
  Blockly.Blocks['external_text_align'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('text-align:')
        .appendField(new Blockly.FieldDropdown([
          ['left', 'left '],
          ['right', 'right'],
          ['center', 'center'],
          ['justify', 'justify'],
        ]), 'ALIGN')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_text_transform'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('text-transform:')
        .appendField(new Blockly.FieldDropdown([
          ['none', 'none '],
          ['capitalize', 'capitalize'],
          ['uppercase', 'uppercase'],
          ['lowercase', 'lowercase'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
        ]), 'TRANSFORM')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };   
  Blockly.Blocks['external_text_decoration'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('text-decoration:')
        .appendField(new Blockly.FieldDropdown([
          ['underline', 'underline'],
          ['overline', 'overline'],
          ['line-through', 'line-through'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
          ['none', 'none '],
        ]), 'DECORATION')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['double', 'double'],
          ['dotted', 'dotted'],
          ['dashed', 'dashed'],
          ['wavy', 'wavy'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
        ]), 'DECORATION_STYLE')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_text_shadow'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('text-shadow:')
        .appendField(new Blockly.FieldTextInput('h-shadow'), 'H-SHADOW')
        .appendField(new Blockly.FieldTextInput('v-shadow'), 'V-SHADOW')
        .appendField(new Blockly.FieldTextInput('radius'), 'RADIUS')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Color for texts');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };

  //EXTERNAL DISPLAY STYLING
  Blockly.Blocks['external_display'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('display:')
        .appendField(new Blockly.FieldDropdown([
          ['block', 'block'],
          ['none', 'none'],
          ['flex', 'flex'],
          ['inline', 'inline'],
          ['inline-block', 'inline-block'],
          ['inline-flex', 'inline-flex'],
          ['inline-table', 'inline-table'],
          ['table', 'table'],
          ['inherit', 'inherit'],
          ['initial', 'initial'],
        ]), 'DISPLAY')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_overflow'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('overflow-')
        .appendField(new Blockly.FieldDropdown([
          ['x', 'x'],
          ['y', 'y'],
        ]), 'AXIS')
        .appendField(':')
        .appendField(new Blockly.FieldDropdown([
          ['scroll', 'scroll'],
          ['auto', 'auto'],
          ['hidden', 'hidden'],
          ['visible', 'visible'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
        ]), 'OVERFLOW')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_float'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('float:')
        .appendField(new Blockly.FieldDropdown([
          ['left', 'left'],
          ['right', 'right'],
        ]), 'FLOAT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_height'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('height:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };  
  Blockly.Blocks['external_width'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('width:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  //EXTERNAL SPACING STYLING
  Blockly.Blocks['external_margin'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('margin:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_margin_specific'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('margin:')
        .appendField(new Blockly.FieldDropdown([
          ['top', 'top'],
          ['bottom', 'bottom'],
          ['left', 'left'],
          ['right', 'right'],
        ]), 'DIRECTION')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_padding'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('padding:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_padding_specific'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('padding:')
        .appendField(new Blockly.FieldDropdown([
          ['top', 'top'],
          ['bottom', 'bottom'],
          ['left', 'left'],
          ['right', 'right'],
        ]), 'DIRECTION')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  //EXTERNAL BACKGROUND STYLING
  Blockly.Blocks['external_background_color'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('background-color:')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Colors the background of an element');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_background_image'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('background-image: url( " ')
        .appendField(new Blockly.FieldTextInput('/url'), 'URL')
        .appendField(' " );');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Makes an image the background of an element');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_background_repeat'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('background-repeat:')
        .appendField(new Blockly.FieldDropdown([
          ['repeat', 'repeat'],
          ['no-repeat', 'no-repeat'],
          ['repeat-x', 'repeat-x'],
          ['repeat-y', 'repeat--y'],
          ['round', 'round'],
          ['space', 'space'],
        ]), 'REPEAT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_background_position'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('background-position:')
        .appendField(new Blockly.FieldDropdown([
          ['bottom', 'bottom'],
          ['center', 'center'],
          ['left', 'left'],
          ['left bottom', 'left bottom'],
          ['left top', 'left top'],
          ['right', 'right'],
          ['right bottom', 'right bottom'],
          ['right top', 'right top'],
          ['top', 'top'],
        ]), 'POSITION')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_background_size'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('background-size:')
        .appendField(new Blockly.FieldDropdown([
          ['auto', 'auto'],
          ['cover', 'cover'],
          ['contain', 'contain'],
        ]), 'SIZE')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_background_clip'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('background-clip:')
        .appendField(new Blockly.FieldDropdown([
          ['border-box', 'border-box'],
          ['padding-box', 'padding-box'],
          ['content-box', 'content-box'],
          ['text', 'text'],
        ]), 'CLIP')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  // EXTERNAL BORDER STYLING
  Blockly.Blocks['external_border'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('border:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['dotted', 'dotted'],
          ['dashed', 'dashed'],
          ['double', 'double'],
          ['groove', 'groove'],
          ['ridge', 'ridge'],
          ['inset', 'inset'],
          ['outset', 'outset'],
          ['none', 'none'],
        ]), 'BORDER_STYLE')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_border_specific'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('border-')
        .appendField(new Blockly.FieldDropdown([
          ['top', 'top'],
          ['right', 'right'],
          ['bottom', 'bottom'],
          ['left', 'left'],
        ]), 'SIDE')
        .appendField(':')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['dotted', 'dotted'],
          ['dashed', 'dashed'],
          ['double', 'double'],
          ['groove', 'groove'],
          ['ridge', 'ridge'],
          ['inset', 'inset'],
          ['outset', 'outset'],
          ['none', 'none'],
        ]), 'BORDER_STYLE')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_border_radius'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('border-radius:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_border_radius_specific'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('border-')
        .appendField(new Blockly.FieldDropdown([
          ['top-left', 'top-left'],
          ['top-right', 'top-right'],
          ['bottom-left', 'bottom-left'],
          ['bottom-right', 'bottom-right'],
        ]), 'SIDE')
        .appendField(':')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  //EXTERNAL MORE STYLING
  Blockly.Blocks['external_cursor'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('cursor:')
        .appendField(new Blockly.FieldDropdown([
          ['auto', 'auto'],
          ['default', 'default'],
          ['pointer', 'pointer'],
          ['wait', 'wait'],
          ['text', 'text'],
          ['move', 'move'],
          ['help', 'help'],
          ['not-allowed', 'not-allowed'],
        ]), 'TYPE')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Sets the cursor style.');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_box_shadow'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('box-shadow:')
        .appendField(new Blockly.FieldTextInput('h-shadow'), 'H-SHADOW')
        .appendField(new Blockly.FieldTextInput('v-shadow'), 'V-SHADOW')
        .appendField(new Blockly.FieldTextInput('radius'), 'RADIUS')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Set a shadow to the element.');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  // =============================================================================
  // Inline: STYLING
  // =============================================================================
  
  Blockly.Blocks['internal_text_color'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('color:')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Color for texts');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_font_family'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('font-family:')
        .appendField(new Blockly.FieldTextInput('serif'), 'FONT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Set a font style for texts');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };   
  Blockly.Blocks['internal_font_size'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('font-size:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };   
  Blockly.Blocks['internal_font_size_descriptive'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('font-size:')
        .appendField(new Blockly.FieldDropdown([
          ['initial', 'initial '],
          ['inherit', 'inherit'],
          ['xx-small', 'xx-small'],
          ['x-small', 'x-small'],
          ['small', 'small'],
          ['large', 'large'],
          ['x-large', 'x-large'],
          ['xx-large', 'xx-large'],
          ['smaller', 'smaller'],
          ['larger', 'larger'],
        ]), 'SIZE')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };   
  Blockly.Blocks['internal_text_align'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('text-align:')
        .appendField(new Blockly.FieldDropdown([
          ['left', 'left '],
          ['right', 'right'],
          ['center', 'center'],
          ['justify', 'justify'],
        ]), 'ALIGN')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_text_transform'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('text-transform:')
        .appendField(new Blockly.FieldDropdown([
          ['none', 'none '],
          ['capitalize', 'capitalize'],
          ['uppercase', 'uppercase'],
          ['lowercase', 'lowercase'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
        ]), 'TRANSFORM')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };   
  Blockly.Blocks['internal_text_decoration'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('text-decoration:')
        .appendField(new Blockly.FieldDropdown([
          ['underline', 'underline'],
          ['overline', 'overline'],
          ['line-through', 'line-through'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
          ['none', 'none '],
        ]), 'DECORATION')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['double', 'double'],
          ['dotted', 'dotted'],
          ['dashed', 'dashed'],
          ['wavy', 'wavy'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
        ]), 'DECORATION_STYLE')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_text_shadow'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('text-shadow:')
        .appendField(new Blockly.FieldTextInput('h-shadow'), 'H-SHADOW')
        .appendField(new Blockly.FieldTextInput('v-shadow'), 'V-SHADOW')
        .appendField(new Blockly.FieldTextInput('radius'), 'RADIUS')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Color for texts');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };

  //internal DISPLAY STYLING
  Blockly.Blocks['internal_display'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('display:')
        .appendField(new Blockly.FieldDropdown([
          ['block', 'block'],
          ['none', 'none'],
          ['flex', 'flex'],
          ['inline', 'inline'],
          ['inline-block', 'inline-block'],
          ['inline-flex', 'inline-flex'],
          ['inline-table', 'inline-table'],
          ['table', 'table'],
          ['inherit', 'inherit'],
          ['initial', 'initial'],
        ]), 'DISPLAY')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_overflow'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('overflow-')
        .appendField(new Blockly.FieldDropdown([
          ['x', 'x'],
          ['y', 'y'],
        ]), 'AXIS')
        .appendField(':')
        .appendField(new Blockly.FieldDropdown([
          ['scroll', 'scroll'],
          ['auto', 'auto'],
          ['hidden', 'hidden'],
          ['visible', 'visible'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
        ]), 'OVERFLOW')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_float'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('float:')
        .appendField(new Blockly.FieldDropdown([
          ['left', 'left'],
          ['right', 'right'],
        ]), 'FLOAT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_height'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('height:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };  
  Blockly.Blocks['internal_width'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('width:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  //internal SPACING STYLING
  Blockly.Blocks['internal_margin'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('margin:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_margin_specific'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('margin:')
        .appendField(new Blockly.FieldDropdown([
          ['top', 'top'],
          ['bottom', 'bottom'],
          ['left', 'left'],
          ['right', 'right'],
        ]), 'DIRECTION')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_padding'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('padding:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_padding_specific'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('padding:')
        .appendField(new Blockly.FieldDropdown([
          ['top', 'top'],
          ['bottom', 'bottom'],
          ['left', 'left'],
          ['right', 'right'],
        ]), 'DIRECTION')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  //internal BACKGROUND STYLING
  Blockly.Blocks['internal_background_color'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('background-color:')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Colors the background of an element');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_background_image'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('background-image: url( " ')
        .appendField(new Blockly.FieldTextInput('/url'), 'URL')
        .appendField(' " );');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Makes an image the background of an element');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_background_repeat'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('background-repeat:')
        .appendField(new Blockly.FieldDropdown([
          ['repeat', 'repeat'],
          ['no-repeat', 'no-repeat'],
          ['repeat-x', 'repeat-x'],
          ['repeat-y', 'repeat--y'],
          ['round', 'round'],
          ['space', 'space'],
        ]), 'REPEAT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_background_position'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('background-position:')
        .appendField(new Blockly.FieldDropdown([
          ['bottom', 'bottom'],
          ['center', 'center'],
          ['left', 'left'],
          ['left bottom', 'left bottom'],
          ['left top', 'left top'],
          ['right', 'right'],
          ['right bottom', 'right bottom'],
          ['right top', 'right top'],
          ['top', 'top'],
        ]), 'POSITION')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_background_size'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('background-size:')
        .appendField(new Blockly.FieldDropdown([
          ['auto', 'auto'],
          ['cover', 'cover'],
          ['contain', 'contain'],
        ]), 'SIZE')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_background_clip'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('background-clip:')
        .appendField(new Blockly.FieldDropdown([
          ['border-box', 'border-box'],
          ['padding-box', 'padding-box'],
          ['content-box', 'content-box'],
          ['text', 'text'],
        ]), 'CLIP')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  // internal BORDER STYLING
  Blockly.Blocks['internal_border'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('border:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['dotted', 'dotted'],
          ['dashed', 'dashed'],
          ['double', 'double'],
          ['groove', 'groove'],
          ['ridge', 'ridge'],
          ['inset', 'inset'],
          ['outset', 'outset'],
          ['none', 'none'],
        ]), 'BORDER_STYLE')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_border_specific'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('border-')
        .appendField(new Blockly.FieldDropdown([
          ['top', 'top'],
          ['right', 'right'],
          ['bottom', 'bottom'],
          ['left', 'left'],
        ]), 'SIDE')
        .appendField(':')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['dotted', 'dotted'],
          ['dashed', 'dashed'],
          ['double', 'double'],
          ['groove', 'groove'],
          ['ridge', 'ridge'],
          ['inset', 'inset'],
          ['outset', 'outset'],
          ['none', 'none'],
        ]), 'BORDER_STYLE')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_border_radius'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('border-radius:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_border_radius_specific'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('border-')
        .appendField(new Blockly.FieldDropdown([
          ['top-left', 'top-left'],
          ['top-right', 'top-right'],
          ['bottom-left', 'bottom-left'],
          ['bottom-right', 'bottom-right'],
        ]), 'SIDE')
        .appendField(':')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  //internal MORE STYLING
  Blockly.Blocks['internal_cursor'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('cursor:')
        .appendField(new Blockly.FieldDropdown([
          ['auto', 'auto'],
          ['default', 'default'],
          ['pointer', 'pointer'],
          ['wait', 'wait'],
          ['text', 'text'],
          ['move', 'move'],
          ['help', 'help'],
          ['not-allowed', 'not-allowed'],
        ]), 'TYPE')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Sets the cursor style.');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_box_shadow'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('box-shadow:')
        .appendField(new Blockly.FieldTextInput('h-shadow'), 'H-SHADOW')
        .appendField(new Blockly.FieldTextInput('v-shadow'), 'V-SHADOW')
        .appendField(new Blockly.FieldTextInput('radius'), 'RADIUS')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Set a shadow to the element.');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  // =============================================================================
  // POSITIONING (External)
  // =============================================================================
  Blockly.Blocks['external_position'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('position:')
          .appendField(new Blockly.FieldDropdown([
            ['static', 'static'],
            ['relative', 'relative'],
            ['absolute', 'absolute'],
            ['fixed', 'fixed'],
            ['sticky', 'sticky']
          ]), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
      this.setTooltip('Sets the positioning method');
    }
  };

  Blockly.Blocks['external_top'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('top:')
          .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%'], ['auto', 'auto']
          ]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
      this.setTooltip('Top offset');
    }
  };

  Blockly.Blocks['external_right'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('right:')
          .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%'], ['auto', 'auto']
          ]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
      this.setTooltip('Right offset');
    }
  };

  Blockly.Blocks['external_bottom'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('bottom:')
          .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%'], ['auto', 'auto']
          ]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
      this.setTooltip('Bottom offset');
    }
  };

  Blockly.Blocks['external_left'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('left:')
          .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%'], ['auto', 'auto']
          ]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
      this.setTooltip('Left offset');
    }
  };

  Blockly.Blocks['external_z_index'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('z-index:')
          .appendField(new Blockly.FieldNumber(0, -9999, 9999), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
      this.setTooltip('Stack order');
    }
  };

  // =============================================================================
  // POSITIONING (Internal – output blocks)
  // =============================================================================
  Blockly.Blocks['internal_position'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('position:')
          .appendField(new Blockly.FieldDropdown([
            ['static', 'static'],
            ['relative', 'relative'],
            ['absolute', 'absolute'],
            ['fixed', 'fixed'],
            ['sticky', 'sticky']
          ]), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_top'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('top:')
          .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%'], ['auto', 'auto']
          ]), 'UNIT')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_right'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('right:')
          .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%'], ['auto', 'auto']
          ]), 'UNIT')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_bottom'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('bottom:')
          .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%'], ['auto', 'auto']
          ]), 'UNIT')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_left'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('left:')
          .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%'], ['auto', 'auto']
          ]), 'UNIT')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_z_index'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('z-index:')
          .appendField(new Blockly.FieldNumber(0, -9999, 9999), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  // =============================================================================
  // FLEXBOX (External)
  // =============================================================================
  Blockly.Blocks['external_flex_direction'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('flex-direction:')
          .appendField(new Blockly.FieldDropdown([
            ['row', 'row'],
            ['row-reverse', 'row-reverse'],
            ['column', 'column'],
            ['column-reverse', 'column-reverse']
          ]), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_flex_wrap'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('flex-wrap:')
          .appendField(new Blockly.FieldDropdown([
            ['nowrap', 'nowrap'],
            ['wrap', 'wrap'],
            ['wrap-reverse', 'wrap-reverse']
          ]), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_justify_content'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('justify-content:')
          .appendField(new Blockly.FieldDropdown([
            ['flex-start', 'flex-start'],
            ['flex-end', 'flex-end'],
            ['center', 'center'],
            ['space-between', 'space-between'],
            ['space-around', 'space-around'],
            ['space-evenly', 'space-evenly']
          ]), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_align_items'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('align-items:')
          .appendField(new Blockly.FieldDropdown([
            ['stretch', 'stretch'],
            ['flex-start', 'flex-start'],
            ['flex-end', 'flex-end'],
            ['center', 'center'],
            ['baseline', 'baseline']
          ]), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_align_content'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('align-content:')
          .appendField(new Blockly.FieldDropdown([
            ['stretch', 'stretch'],
            ['flex-start', 'flex-start'],
            ['flex-end', 'flex-end'],
            ['center', 'center'],
            ['space-between', 'space-between'],
            ['space-around', 'space-around']
          ]), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_order'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('order:')
          .appendField(new Blockly.FieldNumber(0, -999, 999), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_flex_grow'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('flex-grow:')
          .appendField(new Blockly.FieldNumber(0, 0, 999), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_flex_shrink'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('flex-shrink:')
          .appendField(new Blockly.FieldNumber(1, 0, 999), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_flex_basis'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('flex-basis:')
          .appendField(new Blockly.FieldTextInput('auto'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%'], ['auto', 'auto']
          ]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_align_self'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('align-self:')
          .appendField(new Blockly.FieldDropdown([
            ['auto', 'auto'],
            ['flex-start', 'flex-start'],
            ['flex-end', 'flex-end'],
            ['center', 'center'],
            ['baseline', 'baseline'],
            ['stretch', 'stretch']
          ]), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  // =============================================================================
  // FLEXBOX (Internal)
  // =============================================================================
  Blockly.Blocks['internal_flex_direction'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('flex-direction:')
          .appendField(new Blockly.FieldDropdown([
            ['row', 'row'],
            ['row-reverse', 'row-reverse'],
            ['column', 'column'],
            ['column-reverse', 'column-reverse']
          ]), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_flex_wrap'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('flex-wrap:')
          .appendField(new Blockly.FieldDropdown([
            ['nowrap', 'nowrap'],
            ['wrap', 'wrap'],
            ['wrap-reverse', 'wrap-reverse']
          ]), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_justify_content'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('justify-content:')
          .appendField(new Blockly.FieldDropdown([
            ['flex-start', 'flex-start'],
            ['flex-end', 'flex-end'],
            ['center', 'center'],
            ['space-between', 'space-between'],
            ['space-around', 'space-around'],
            ['space-evenly', 'space-evenly']
          ]), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_align_items'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('align-items:')
          .appendField(new Blockly.FieldDropdown([
            ['stretch', 'stretch'],
            ['flex-start', 'flex-start'],
            ['flex-end', 'flex-end'],
            ['center', 'center'],
            ['baseline', 'baseline']
          ]), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_align_content'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('align-content:')
          .appendField(new Blockly.FieldDropdown([
            ['stretch', 'stretch'],
            ['flex-start', 'flex-start'],
            ['flex-end', 'flex-end'],
            ['center', 'center'],
            ['space-between', 'space-between'],
            ['space-around', 'space-around']
          ]), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_order'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('order:')
          .appendField(new Blockly.FieldNumber(0, -999, 999), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_flex_grow'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('flex-grow:')
          .appendField(new Blockly.FieldNumber(0, 0, 999), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_flex_shrink'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('flex-shrink:')
          .appendField(new Blockly.FieldNumber(1, 0, 999), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_flex_basis'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('flex-basis:')
          .appendField(new Blockly.FieldTextInput('auto'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%'], ['auto', 'auto']
          ]), 'UNIT')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_align_self'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('align-self:')
          .appendField(new Blockly.FieldDropdown([
            ['auto', 'auto'],
            ['flex-start', 'flex-start'],
            ['flex-end', 'flex-end'],
            ['center', 'center'],
            ['baseline', 'baseline'],
            ['stretch', 'stretch']
          ]), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };
  // =============================================================================
  // GRID (External)
  // =============================================================================
  Blockly.Blocks['external_grid_template_columns'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('grid-template-columns:')
          .appendField(new Blockly.FieldTextInput('1fr 1fr'), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_grid_template_rows'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('grid-template-rows:')
          .appendField(new Blockly.FieldTextInput('auto'), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_gap'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('gap:')
          .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%']
          ]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_grid_column'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('grid-column:')
          .appendField(new Blockly.FieldTextInput('1'), 'START')
          .appendField('/')
          .appendField(new Blockly.FieldTextInput('3'), 'END')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_grid_row'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('grid-row:')
          .appendField(new Blockly.FieldTextInput('1'), 'START')
          .appendField('/')
          .appendField(new Blockly.FieldTextInput('3'), 'END')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  // =============================================================================
  // GRID (Internal)
  // =============================================================================
  Blockly.Blocks['internal_grid_template_columns'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('grid-template-columns:')
          .appendField(new Blockly.FieldTextInput('1fr 1fr'), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_grid_template_rows'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('grid-template-rows:')
          .appendField(new Blockly.FieldTextInput('auto'), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_gap'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('gap:')
          .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%']
          ]), 'UNIT')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_grid_column'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('grid-column:')
          .appendField(new Blockly.FieldTextInput('1'), 'START')
          .appendField('/')
          .appendField(new Blockly.FieldTextInput('3'), 'END')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_grid_row'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('grid-row:')
          .appendField(new Blockly.FieldTextInput('1'), 'START')
          .appendField('/')
          .appendField(new Blockly.FieldTextInput('3'), 'END')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };
  // =============================================================================
  // BOX MODEL (External)
  // =============================================================================
  Blockly.Blocks['external_box_sizing'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('box-sizing:')
          .appendField(new Blockly.FieldDropdown([
            ['content-box', 'content-box'],
            ['border-box', 'border-box']
          ]), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_outline'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('outline:')
          .appendField(new Blockly.FieldTextInput('1'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%']
          ]), 'UNIT')
          .appendField(new Blockly.FieldDropdown([
            ['solid', 'solid'],
            ['dotted', 'dotted'],
            ['dashed', 'dashed'],
            ['double', 'double'],
            ['groove', 'groove'],
            ['ridge', 'ridge'],
            ['inset', 'inset'],
            ['outset', 'outset'],
            ['none', 'none']
          ]), 'STYLE')
          .appendField(new Blockly.FieldTextInput('#000'), 'COLOR')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_opacity'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('opacity:')
          .appendField(new Blockly.FieldNumber(1, 0, 1, 0.1), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  // =============================================================================
  // BOX MODEL (Internal)
  // =============================================================================
  Blockly.Blocks['internal_box_sizing'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('box-sizing:')
          .appendField(new Blockly.FieldDropdown([
            ['content-box', 'content-box'],
            ['border-box', 'border-box']
          ]), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_outline'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('outline:')
          .appendField(new Blockly.FieldTextInput('1'), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
            ['px', 'px'], ['em', 'em'], ['rem', 'rem'], ['%', '%']
          ]), 'UNIT')
          .appendField(new Blockly.FieldDropdown([
            ['solid', 'solid'],
            ['dotted', 'dotted'],
            ['dashed', 'dashed'],
            ['double', 'double'],
            ['groove', 'groove'],
            ['ridge', 'ridge'],
            ['inset', 'inset'],
            ['outset', 'outset'],
            ['none', 'none']
          ]), 'STYLE')
          .appendField(new Blockly.FieldTextInput('#000'), 'COLOR')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_opacity'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('opacity:')
          .appendField(new Blockly.FieldNumber(1, 0, 1, 0.1), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };
  // =============================================================================
  // TRANSITIONS (External)
  // =============================================================================
  Blockly.Blocks['external_transition_property'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('transition-property:')
          .appendField(new Blockly.FieldTextInput('all'), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_transition_duration'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('transition-duration:')
          .appendField(new Blockly.FieldTextInput('0.3'), 'TIME')
          .appendField(new Blockly.FieldDropdown([['s', 's'], ['ms', 'ms']]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_transition_timing'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('transition-timing-function:')
          .appendField(new Blockly.FieldDropdown([
            ['ease', 'ease'],
            ['linear', 'linear'],
            ['ease-in', 'ease-in'],
            ['ease-out', 'ease-out'],
            ['ease-in-out', 'ease-in-out']
          ]), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_transition_delay'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('transition-delay:')
          .appendField(new Blockly.FieldTextInput('0'), 'TIME')
          .appendField(new Blockly.FieldDropdown([['s', 's'], ['ms', 'ms']]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_transform'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('transform:')
          .appendField(new Blockly.FieldTextInput('rotate(45deg)'), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  // =============================================================================
  // TRANSITIONS (Internal)
  // =============================================================================
  Blockly.Blocks['internal_transition_property'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('transition-property:')
          .appendField(new Blockly.FieldTextInput('all'), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_transition_duration'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('transition-duration:')
          .appendField(new Blockly.FieldTextInput('0.3'), 'TIME')
          .appendField(new Blockly.FieldDropdown([['s', 's'], ['ms', 'ms']]), 'UNIT')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_transition_timing'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('transition-timing-function:')
          .appendField(new Blockly.FieldDropdown([
            ['ease', 'ease'],
            ['linear', 'linear'],
            ['ease-in', 'ease-in'],
            ['ease-out', 'ease-out'],
            ['ease-in-out', 'ease-in-out']
          ]), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_transition_delay'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('transition-delay:')
          .appendField(new Blockly.FieldTextInput('0'), 'TIME')
          .appendField(new Blockly.FieldDropdown([['s', 's'], ['ms', 'ms']]), 'UNIT')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_transform'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('transform:')
          .appendField(new Blockly.FieldTextInput('rotate(45deg)'), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };
  // =============================================================================
  // TEXT & MISC (External)
  // =============================================================================
  Blockly.Blocks['external_white_space'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('white-space:')
          .appendField(new Blockly.FieldDropdown([
            ['normal', 'normal'],
            ['nowrap', 'nowrap'],
            ['pre', 'pre'],
            ['pre-wrap', 'pre-wrap'],
            ['pre-line', 'pre-line']
          ]), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_word_break'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('word-break:')
          .appendField(new Blockly.FieldDropdown([
            ['normal', 'normal'],
            ['break-all', 'break-all'],
            ['keep-all', 'keep-all']
          ]), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  Blockly.Blocks['external_overflow_wrap'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('overflow-wrap:')
          .appendField(new Blockly.FieldDropdown([
            ['normal', 'normal'],
            ['break-word', 'break-word']
          ]), 'VALUE')
          .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setColour('#4285F4');
    }
  };

  // =============================================================================
  // TEXT & MISC (Internal)
  // =============================================================================
  Blockly.Blocks['internal_white_space'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('white-space:')
          .appendField(new Blockly.FieldDropdown([
            ['normal', 'normal'],
            ['nowrap', 'nowrap'],
            ['pre', 'pre'],
            ['pre-wrap', 'pre-wrap'],
            ['pre-line', 'pre-line']
          ]), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_word_break'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('word-break:')
          .appendField(new Blockly.FieldDropdown([
            ['normal', 'normal'],
            ['break-all', 'break-all'],
            ['keep-all', 'keep-all']
          ]), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['internal_overflow_wrap'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('overflow-wrap:')
          .appendField(new Blockly.FieldDropdown([
            ['normal', 'normal'],
            ['break-word', 'break-word']
          ]), 'VALUE')
          .appendField(';');
      this.setOutput(true, 'internal_style');
      this.setColour('#34A853');
    }
  };
   // ══════════════════════════════════════════════════════════════════════════
  // HELPERS — generate identical external/internal block pairs
  // ══════════════════════════════════════════════════════════════════════════
 
  const makeExternal = (name, fields, tooltip) => {
    Blockly.Blocks[`external_${name}`] = {
      init: function () {
        const input = this.appendDummyInput()
        fields(input)
        this.setPreviousStatement(true, 'external_style')
        this.setNextStatement(true, 'external_style')
        this.setColour('#4285F4')
        this.setTooltip(tooltip)
      },
    }
  }
 
  const makeInternal = (name, fields, tooltip) => {
    Blockly.Blocks[`internal_${name}`] = {
      init: function () {
        const input = this.appendDummyInput()
        fields(input)
        this.setOutput(true, 'internal_style')
        this.setColour('#34A853')
        this.setTooltip(tooltip)
      },
    }
  }
 
  const makePair = (name, fields, tooltip) => {
    makeExternal(name, fields, tooltip)
    makeInternal(name, fields, tooltip)
  }
 
  // ══════════════════════════════════════════════════════════════════════════
  // FONT PROPERTIES
  // ══════════════════════════════════════════════════════════════════════════
 
  makePair('font_weight',
    (i) => i.appendField('font-weight:')
             .appendField(new Blockly.FieldDropdown([
               ['normal','normal'], ['bold','bold'], ['bolder','bolder'],
               ['lighter','lighter'], ['100','100'], ['200','200'], ['300','300'],
               ['400','400'], ['500','500'], ['600','600'], ['700','700'],
               ['800','800'], ['900','900'],
             ]), 'VALUE')
             .appendField(';'),
    'Thickness / boldness of font glyphs')
 
  makePair('font_style',
    (i) => i.appendField('font-style:')
             .appendField(new Blockly.FieldDropdown([
               ['normal','normal'], ['italic','italic'], ['oblique','oblique'],
             ]), 'VALUE')
             .appendField(';'),
    'Italic or oblique style for text')
 
  makePair('font_variant',
    (i) => i.appendField('font-variant:')
             .appendField(new Blockly.FieldDropdown([
               ['normal','normal'], ['small-caps','small-caps'],
               ['all-small-caps','all-small-caps'], ['petite-caps','petite-caps'],
               ['titling-caps','titling-caps'], ['unicase','unicase'],
             ]), 'VALUE')
             .appendField(';'),
    'Variant glyphs — e.g. small-caps')
 
  makePair('line_height',
    (i) => i.appendField('line-height:')
             .appendField(new Blockly.FieldTextInput('1.5'), 'VALUE')
             .appendField(new Blockly.FieldDropdown([
               ['(unitless)',''], ['px','px'], ['em','em'], ['rem','rem'], ['%','%'],
             ]), 'UNIT')
             .appendField(';'),
    'Vertical space between text lines (unitless multiplier recommended)')
 
  makePair('letter_spacing',
    (i) => i.appendField('letter-spacing:')
             .appendField(new Blockly.FieldTextInput('0'), 'VALUE')
             .appendField(new Blockly.FieldDropdown([
               ['px','px'], ['em','em'], ['rem','rem'],
             ]), 'UNIT')
             .appendField(';'),
    'Horizontal space between individual characters (tracking)')
 
  makePair('word_spacing',
    (i) => i.appendField('word-spacing:')
             .appendField(new Blockly.FieldTextInput('0'), 'VALUE')
             .appendField(new Blockly.FieldDropdown([
               ['px','px'], ['em','em'], ['rem','rem'],
             ]), 'UNIT')
             .appendField(';'),
    'Extra space between words')
 
  // ══════════════════════════════════════════════════════════════════════════
  // LIST STYLING
  // ══════════════════════════════════════════════════════════════════════════
 
  makePair('list_style_type',
    (i) => i.appendField('list-style-type:')
             .appendField(new Blockly.FieldDropdown([
               ['disc','disc'], ['circle','circle'], ['square','square'],
               ['decimal','decimal'], ['decimal-leading-zero','decimal-leading-zero'],
               ['lower-roman','lower-roman'], ['upper-roman','upper-roman'],
               ['lower-alpha','lower-alpha'], ['upper-alpha','upper-alpha'],
               ['lower-greek','lower-greek'], ['none','none'],
             ]), 'VALUE')
             .appendField(';'),
    'Type of list marker (bullet, number, letter, none)')
 
  makePair('list_style_position',
    (i) => i.appendField('list-style-position:')
             .appendField(new Blockly.FieldDropdown([
               ['outside','outside'], ['inside','inside'],
             ]), 'VALUE')
             .appendField(';'),
    'Whether marker sits outside or inside the list item content area')
 
  makePair('list_style_image',
    (i) => i.appendField('list-style-image: url("')
             .appendField(new Blockly.FieldTextInput('/bullet.png'), 'URL')
             .appendField('");'),
    'Custom image used as the list marker')
 
  // ══════════════════════════════════════════════════════════════════════════
  // TABLE STYLING
  // ══════════════════════════════════════════════════════════════════════════
 
  makePair('border_collapse',
    (i) => i.appendField('border-collapse:')
             .appendField(new Blockly.FieldDropdown([
               ['separate','separate'], ['collapse','collapse'],
             ]), 'VALUE')
             .appendField(';'),
    'Whether adjacent table cell borders merge into one border')
 
  makePair('border_spacing',
    (i) => i.appendField('border-spacing:')
             .appendField(new Blockly.FieldTextInput('2'), 'VALUE')
             .appendField(new Blockly.FieldDropdown([
               ['px','px'], ['em','em'], ['rem','rem'],
             ]), 'UNIT')
             .appendField(';'),
    'Gap between cell borders when border-collapse: separate')
 
  makePair('caption_side',
    (i) => i.appendField('caption-side:')
             .appendField(new Blockly.FieldDropdown([
               ['top','top'], ['bottom','bottom'],
             ]), 'VALUE')
             .appendField(';'),
    'Render the <caption> above or below the table')
 
  makePair('empty_cells',
    (i) => i.appendField('empty-cells:')
             .appendField(new Blockly.FieldDropdown([
               ['show','show'], ['hide','hide'],
             ]), 'VALUE')
             .appendField(';'),
    'Whether to draw borders on empty table cells')
 
  makePair('table_layout',
    (i) => i.appendField('table-layout:')
             .appendField(new Blockly.FieldDropdown([
               ['auto','auto'], ['fixed','fixed'],
             ]), 'VALUE')
             .appendField(';'),
    'auto = column width set by content; fixed = set by first row / col widths')
 
  // ══════════════════════════════════════════════════════════════════════════
  // MULTI-COLUMN LAYOUT
  // ══════════════════════════════════════════════════════════════════════════
 
  makePair('column_count',
    (i) => i.appendField('column-count:')
             .appendField(new Blockly.FieldNumber(2, 1, 20), 'VALUE')
             .appendField(';'),
    'Divide element content into N columns')
 
  makePair('column_gap',
    (i) => i.appendField('column-gap:')
             .appendField(new Blockly.FieldTextInput('20'), 'VALUE')
             .appendField(new Blockly.FieldDropdown([
               ['px','px'], ['em','em'], ['rem','rem'], ['%','%'],
             ]), 'UNIT')
             .appendField(';'),
    'Space between columns')
 
  makePair('column_rule',
    (i) => i.appendField('column-rule:')
             .appendField(new Blockly.FieldTextInput('1'), 'WIDTH')
             .appendField(new Blockly.FieldDropdown([['px','px'], ['em','em']]), 'UNIT')
             .appendField(new Blockly.FieldDropdown([
               ['solid','solid'], ['dashed','dashed'], ['dotted','dotted'], ['none','none'],
             ]), 'STYLE')
             .appendField(new Blockly.FieldTextInput('#ccc'), 'COLOR')
             .appendField(';'),
    'Dividing line drawn between columns (shorthand: width style color)')
 
  makePair('column_width',
    (i) => i.appendField('column-width:')
             .appendField(new Blockly.FieldTextInput('200'), 'VALUE')
             .appendField(new Blockly.FieldDropdown([
               ['px','px'], ['em','em'], ['rem','rem'], ['%','%'],
             ]), 'UNIT')
             .appendField(';'),
    'Optimal / minimum width per column (browser may adjust count)')
 
  makePair('column_span',
    (i) => i.appendField('column-span:')
             .appendField(new Blockly.FieldDropdown([
               ['none','none'], ['all','all'],
             ]), 'VALUE')
             .appendField(';'),
    'all = element spans across every column (e.g. a pull-quote heading)')
 
  // ══════════════════════════════════════════════════════════════════════════
  // ANIMATION
  // ══════════════════════════════════════════════════════════════════════════
 
  makePair('animation_name',
    (i) => i.appendField('animation-name:')
             .appendField(new Blockly.FieldTextInput('myAnimation'), 'VALUE')
             .appendField(';'),
    'Name of @keyframes animation to attach')
 
  makePair('animation_duration',
    (i) => i.appendField('animation-duration:')
             .appendField(new Blockly.FieldTextInput('1'), 'VALUE')
             .appendField(new Blockly.FieldDropdown([['s','s'], ['ms','ms']]), 'UNIT')
             .appendField(';'),
    'How long one full animation cycle takes')
 
  makePair('animation_timing',
    (i) => i.appendField('animation-timing-function:')
             .appendField(new Blockly.FieldDropdown([
               ['ease','ease'], ['ease-in','ease-in'], ['ease-out','ease-out'],
               ['ease-in-out','ease-in-out'], ['linear','linear'],
               ['step-start','step-start'], ['step-end','step-end'],
             ]), 'VALUE')
             .appendField(';'),
    'Speed curve of the animation')
 
  makePair('animation_delay',
    (i) => i.appendField('animation-delay:')
             .appendField(new Blockly.FieldTextInput('0'), 'VALUE')
             .appendField(new Blockly.FieldDropdown([['s','s'], ['ms','ms']]), 'UNIT')
             .appendField(';'),
    'Delay before the animation starts')
 
  makePair('animation_iteration',
    (i) => i.appendField('animation-iteration-count:')
             .appendField(new Blockly.FieldDropdown([
               ['1','1'], ['2','2'], ['3','3'], ['5','5'], ['10','10'], ['infinite','infinite'],
             ]), 'VALUE')
             .appendField(';'),
    'How many times the animation repeats')
 
  makePair('animation_direction',
    (i) => i.appendField('animation-direction:')
             .appendField(new Blockly.FieldDropdown([
               ['normal','normal'], ['reverse','reverse'],
               ['alternate','alternate'], ['alternate-reverse','alternate-reverse'],
             ]), 'VALUE')
             .appendField(';'),
    'Whether the animation plays forward, backward, or alternates')
 
  makePair('animation_fill_mode',
    (i) => i.appendField('animation-fill-mode:')
             .appendField(new Blockly.FieldDropdown([
               ['none','none'], ['forwards','forwards'],
               ['backwards','backwards'], ['both','both'],
             ]), 'VALUE')
             .appendField(';'),
    'What styles apply before / after animation plays')
 
  makePair('animation_play_state',
    (i) => i.appendField('animation-play-state:')
             .appendField(new Blockly.FieldDropdown([
               ['running','running'], ['paused','paused'],
             ]), 'VALUE')
             .appendField(';'),
    'Pause or resume the animation (toggle via JS)')
 
  // @keyframes block (external / style-container use only)
  Blockly.Blocks['css_keyframes'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('@keyframes')
          .appendField(new Blockly.FieldTextInput('myAnimation'), 'NAME')
      this.appendDummyInput()
          .appendField('from {')
          .appendField(new Blockly.FieldTextInput('opacity: 0; transform: scale(0.9)'), 'FROM')
          .appendField('}')
      this.appendDummyInput()
          .appendField('to   {')
          .appendField(new Blockly.FieldTextInput('opacity: 1; transform: scale(1)'), 'TO')
          .appendField('}')
      this.setPreviousStatement(true, 'style_for')
      this.setNextStatement(true, 'style_for')
      this.setColour('#4285F4')
      this.setTooltip('@keyframes rule — defines from/to states. Place inside a <style> block, not a selector.')
    },
  }
 
  // ══════════════════════════════════════════════════════════════════════════
  // TRANSFORMS — individual function blocks
  // ══════════════════════════════════════════════════════════════════════════
 
  makePair('transform_scale',
    (i) => i.appendField('transform: scale(')
             .appendField(new Blockly.FieldTextInput('1.2'), 'X')
             .appendField(',')
             .appendField(new Blockly.FieldTextInput('1.2'), 'Y')
             .appendField(');'),
    'Scale element. 1 = original, 2 = double size, 0.5 = half size')
 
  makePair('transform_translate',
    (i) => i.appendField('transform: translate(')
             .appendField(new Blockly.FieldTextInput('10'), 'X')
             .appendField(new Blockly.FieldDropdown([['px','px'],['%','%'],['em','em'],['rem','rem']]), 'XUNIT')
             .appendField(',')
             .appendField(new Blockly.FieldTextInput('10'), 'Y')
             .appendField(new Blockly.FieldDropdown([['px','px'],['%','%'],['em','em'],['rem','rem']]), 'YUNIT')
             .appendField(');'),
    'Move element by (X, Y) without affecting layout flow')
 
  makePair('transform_rotate',
    (i) => i.appendField('transform: rotate(')
             .appendField(new Blockly.FieldTextInput('45'), 'VALUE')
             .appendField(new Blockly.FieldDropdown([
               ['deg','deg'], ['rad','rad'], ['turn','turn'],
             ]), 'UNIT')
             .appendField(');'),
    'Rotate element clockwise by angle (negative = counter-clockwise)')
 
  makePair('transform_skew',
    (i) => i.appendField('transform: skew(')
             .appendField(new Blockly.FieldTextInput('10'), 'X')
             .appendField('deg,')
             .appendField(new Blockly.FieldTextInput('0'), 'Y')
             .appendField('deg);'),
    'Slant element along X and Y axes')
 
  // ══════════════════════════════════════════════════════════════════════════
  // FILTER
  // ══════════════════════════════════════════════════════════════════════════
 
  makePair('filter',
    (i) => i.appendField('filter:')
             .appendField(new Blockly.FieldDropdown([
               ['blur','blur'], ['brightness','brightness'], ['contrast','contrast'],
               ['grayscale','grayscale'], ['hue-rotate','hue-rotate'], ['invert','invert'],
               ['opacity','opacity'], ['saturate','saturate'], ['sepia','sepia'],
               ['drop-shadow','drop-shadow'],
             ]), 'FUNCTION')
             .appendField('(')
             .appendField(new Blockly.FieldTextInput('50'), 'VALUE')
             .appendField(new Blockly.FieldDropdown([
               ['%','%'], ['px','px'], ['deg','deg'], ['(none)',''],
             ]), 'UNIT')
             .appendField(');'),
    'Apply CSS filter effect. blur→px, brightness/contrast/grayscale→%, hue-rotate→deg')
 
  // ══════════════════════════════════════════════════════════════════════════
  // PSEUDO-CLASSES / PSEUDO-ELEMENTS
  // (output-value blocks that connect to the style_effect input on style_target)
  // ══════════════════════════════════════════════════════════════════════════
 
  Blockly.Blocks['css_pseudo_class'] = {
    init: function () {
      this.appendDummyInput()
          .appendField(':')
          .appendField(new Blockly.FieldDropdown([
            ['hover','hover'], ['focus','focus'], ['active','active'],
            ['visited','visited'], ['first-child','first-child'],
            ['last-child','last-child'], ['first-of-type','first-of-type'],
            ['last-of-type','last-of-type'], ['only-child','only-child'],
            ['empty','empty'], ['checked','checked'], ['disabled','disabled'],
            ['enabled','enabled'], ['required','required'], ['optional','optional'],
            ['valid','valid'], ['invalid','invalid'],
            ['placeholder-shown','placeholder-shown'],
            ['focus-within','focus-within'], ['focus-visible','focus-visible'],
            ['root','root'], ['target','target'],
          ]), 'VALUE')
      this.setOutput(true, null)
      this.setColour('#34A853')
      this.setTooltip('CSS pseudo-class — connect to the effect socket of a style target block')
    },
  }
 
  Blockly.Blocks['css_nth_child'] = {
    init: function () {
      this.appendDummyInput()
          .appendField(':')
          .appendField(new Blockly.FieldDropdown([
            ['nth-child','nth-child'], ['nth-of-type','nth-of-type'],
            ['nth-last-child','nth-last-child'], ['nth-last-of-type','nth-last-of-type'],
          ]), 'PSEUDO')
          .appendField('(')
          .appendField(new Blockly.FieldTextInput('2n+1'), 'FORMULA')
          .appendField(')')
      this.setOutput(true, null)
      this.setColour('#34A853')
      this.setTooltip('nth-child selector. Formulas: 2 (even index), odd, even, 3n, 2n+1')
    },
  }
 
  Blockly.Blocks['css_pseudo_element'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('::')
          .appendField(new Blockly.FieldDropdown([
            ['before','before'], ['after','after'],
            ['first-line','first-line'], ['first-letter','first-letter'],
            ['placeholder','placeholder'], ['selection','selection'],
            ['marker','marker'], ['backdrop','backdrop'],
          ]), 'VALUE')
      this.setOutput(true, null)
      this.setColour('#34A853')
      this.setTooltip('CSS pseudo-element — virtual element injected before/after content')
    },
  }
 
  Blockly.Blocks['css_not_pseudo'] = {
    init: function () {
      this.appendDummyInput()
          .appendField(':not(')
          .appendField(new Blockly.FieldTextInput('.disabled'), 'SELECTOR')
          .appendField(')')
      this.setOutput(true, null)
      this.setColour('#34A853')
      this.setTooltip(':not() excludes matching elements. E.g. :not(.active), :not([disabled])')
    },
  }
}