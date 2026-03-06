import { javascriptGenerator } from "blockly/javascript";

export const defineCSSGenerators = () => {
  // =============================================================================
  // POSITIONING (External)
  // =============================================================================
  javascriptGenerator.forBlock['external_position'] = function(block) {
    return `position: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_top'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `top: ${size}${unit};\n`;
  };
  javascriptGenerator.forBlock['external_right'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `right: ${size}${unit};\n`;
  };
  javascriptGenerator.forBlock['external_bottom'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `bottom: ${size}${unit};\n`;
  };
  javascriptGenerator.forBlock['external_left'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `left: ${size}${unit};\n`;
  };
  javascriptGenerator.forBlock['external_z_index'] = function(block) {
    return `z-index: ${block.getFieldValue('VALUE')};\n`;
  };

  // Internal
  javascriptGenerator.forBlock['internal_position'] = function(block) {
    const code = `position: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_top'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `top: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_right'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `right: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_bottom'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `bottom: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_left'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `left: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_z_index'] = function(block) {
    const code = `z-index: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  // External
  javascriptGenerator.forBlock['external_flex_direction'] = function(block) {
    return `flex-direction: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_flex_wrap'] = function(block) {
    return `flex-wrap: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_justify_content'] = function(block) {
    return `justify-content: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_align_items'] = function(block) {
    return `align-items: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_align_content'] = function(block) {
    return `align-content: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_order'] = function(block) {
    return `order: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_flex_grow'] = function(block) {
    return `flex-grow: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_flex_shrink'] = function(block) {
    return `flex-shrink: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_flex_basis'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `flex-basis: ${size}${unit};\n`;
  };
  javascriptGenerator.forBlock['external_align_self'] = function(block) {
    return `align-self: ${block.getFieldValue('VALUE')};\n`;
  };

  // Internal
  javascriptGenerator.forBlock['internal_flex_direction'] = function(block) {
    const code = `flex-direction: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_flex_wrap'] = function(block) {
    const code = `flex-wrap: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_justify_content'] = function(block) {
    const code = `justify-content: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_align_items'] = function(block) {
    const code = `align-items: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_align_content'] = function(block) {
    const code = `align-content: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_order'] = function(block) {
    const code = `order: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_flex_grow'] = function(block) {
    const code = `flex-grow: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_flex_shrink'] = function(block) {
    const code = `flex-shrink: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_flex_basis'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `flex-basis: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_align_self'] = function(block) {
    const code = `align-self: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  // External
  javascriptGenerator.forBlock['external_grid_template_columns'] = function(block) {
    return `grid-template-columns: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_grid_template_rows'] = function(block) {
    return `grid-template-rows: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_gap'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    return `gap: ${size}${unit};\n`;
  };
  javascriptGenerator.forBlock['external_grid_column'] = function(block) {
    const start = block.getFieldValue('START');
    const end = block.getFieldValue('END');
    return `grid-column: ${start} / ${end};\n`;
  };
  javascriptGenerator.forBlock['external_grid_row'] = function(block) {
    const start = block.getFieldValue('START');
    const end = block.getFieldValue('END');
    return `grid-row: ${start} / ${end};\n`;
  };

  // Internal
  javascriptGenerator.forBlock['internal_grid_template_columns'] = function(block) {
    const code = `grid-template-columns: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_grid_template_rows'] = function(block) {
    const code = `grid-template-rows: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_gap'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const code = `gap: ${size}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_grid_column'] = function(block) {
    const start = block.getFieldValue('START');
    const end = block.getFieldValue('END');
    const code = `grid-column: ${start} / ${end};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_grid_row'] = function(block) {
    const start = block.getFieldValue('START');
    const end = block.getFieldValue('END');
    const code = `grid-row: ${start} / ${end};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  // External
  javascriptGenerator.forBlock['external_box_sizing'] = function(block) {
    return `box-sizing: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_outline'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const style = block.getFieldValue('STYLE');
    const color = block.getFieldValue('COLOR');
    return `outline: ${size}${unit} ${style} ${color};\n`;
  };
  javascriptGenerator.forBlock['external_opacity'] = function(block) {
    return `opacity: ${block.getFieldValue('VALUE')};\n`;
  };

  // Internal
  javascriptGenerator.forBlock['internal_box_sizing'] = function(block) {
    const code = `box-sizing: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_outline'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const unit = block.getFieldValue('UNIT');
    const style = block.getFieldValue('STYLE');
    const color = block.getFieldValue('COLOR');
    const code = `outline: ${size}${unit} ${style} ${color};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_opacity'] = function(block) {
    const code = `opacity: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  // External
  javascriptGenerator.forBlock['external_transition_property'] = function(block) {
    return `transition-property: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_transition_duration'] = function(block) {
    const time = block.getFieldValue('TIME');
    const unit = block.getFieldValue('UNIT');
    return `transition-duration: ${time}${unit};\n`;
  };
  javascriptGenerator.forBlock['external_transition_timing'] = function(block) {
    return `transition-timing-function: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_transition_delay'] = function(block) {
    const time = block.getFieldValue('TIME');
    const unit = block.getFieldValue('UNIT');
    return `transition-delay: ${time}${unit};\n`;
  };
  javascriptGenerator.forBlock['external_transform'] = function(block) {
    return `transform: ${block.getFieldValue('VALUE')};\n`;
  };

  // Internal
  javascriptGenerator.forBlock['internal_transition_property'] = function(block) {
    const code = `transition-property: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_transition_duration'] = function(block) {
    const time = block.getFieldValue('TIME');
    const unit = block.getFieldValue('UNIT');
    const code = `transition-duration: ${time}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_transition_timing'] = function(block) {
    const code = `transition-timing-function: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_transition_delay'] = function(block) {
    const time = block.getFieldValue('TIME');
    const unit = block.getFieldValue('UNIT');
    const code = `transition-delay: ${time}${unit};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_transform'] = function(block) {
    const code = `transform: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  // External
  javascriptGenerator.forBlock['external_white_space'] = function(block) {
    return `white-space: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_word_break'] = function(block) {
    return `word-break: ${block.getFieldValue('VALUE')};\n`;
  };
  javascriptGenerator.forBlock['external_overflow_wrap'] = function(block) {
    return `overflow-wrap: ${block.getFieldValue('VALUE')};\n`;
  };

  // Internal
  javascriptGenerator.forBlock['internal_white_space'] = function(block) {
    const code = `white-space: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_word_break'] = function(block) {
    const code = `word-break: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
  javascriptGenerator.forBlock['internal_overflow_wrap'] = function(block) {
    const code = `overflow-wrap: ${block.getFieldValue('VALUE')};`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
  };
};