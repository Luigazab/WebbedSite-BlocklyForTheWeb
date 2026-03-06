import * as Blockly from 'blockly/core';
import "@blockly/block-plus-minus";

export const defineCSSBlocks = () => {
  //EXTERNAL
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
}