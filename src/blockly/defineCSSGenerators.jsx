import { javascriptGenerator } from "blockly/javascript";

export const defineCSSGenerators = () => {
  const ORDER = javascriptGenerator.ORDER_ATOMIC
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
  // ── FONT ─────────────────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['external_font_weight']  = (b) => `font-weight: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_font_style']   = (b) => `font-style: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_font_variant'] = (b) => `font-variant: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_line_height']  = (b) => `line-height: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};\n`
  javascriptGenerator.forBlock['external_letter_spacing'] = (b) => `letter-spacing: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};\n`
  javascriptGenerator.forBlock['external_word_spacing']   = (b) => `word-spacing: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};\n`
 
  javascriptGenerator.forBlock['internal_font_weight']  = (b) => [`font-weight: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_font_style']   = (b) => [`font-style: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_font_variant'] = (b) => [`font-variant: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_line_height']  = (b) => [`line-height: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};`, ORDER]
  javascriptGenerator.forBlock['internal_letter_spacing'] = (b) => [`letter-spacing: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};`, ORDER]
  javascriptGenerator.forBlock['internal_word_spacing']   = (b) => [`word-spacing: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};`, ORDER]
 
  // ── LIST STYLING ──────────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['external_list_style_type']     = (b) => `list-style-type: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_list_style_position'] = (b) => `list-style-position: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_list_style_image']    = (b) => `list-style-image: url("${b.getFieldValue('URL')}");\n`
 
  javascriptGenerator.forBlock['internal_list_style_type']     = (b) => [`list-style-type: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_list_style_position'] = (b) => [`list-style-position: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_list_style_image']    = (b) => [`list-style-image: url("${b.getFieldValue('URL')}");`, ORDER]
 
  // ── TABLE STYLING ─────────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['external_border_collapse'] = (b) => `border-collapse: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_border_spacing']  = (b) => `border-spacing: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};\n`
  javascriptGenerator.forBlock['external_caption_side']    = (b) => `caption-side: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_empty_cells']     = (b) => `empty-cells: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_table_layout']    = (b) => `table-layout: ${b.getFieldValue('VALUE')};\n`
 
  javascriptGenerator.forBlock['internal_border_collapse'] = (b) => [`border-collapse: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_border_spacing']  = (b) => [`border-spacing: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};`, ORDER]
  javascriptGenerator.forBlock['internal_caption_side']    = (b) => [`caption-side: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_empty_cells']     = (b) => [`empty-cells: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_table_layout']    = (b) => [`table-layout: ${b.getFieldValue('VALUE')};`, ORDER]
 
  // ── COLUMNS ───────────────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['external_column_count'] = (b) => `column-count: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_column_gap']   = (b) => `column-gap: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};\n`
  javascriptGenerator.forBlock['external_column_rule']  = (b) =>
    `column-rule: ${b.getFieldValue('WIDTH')}${b.getFieldValue('UNIT')} ${b.getFieldValue('STYLE')} ${b.getFieldValue('COLOR')};\n`
  javascriptGenerator.forBlock['external_column_width'] = (b) => {
    const u = b.getFieldValue('UNIT')
    const v = b.getFieldValue('VALUE')
    return `column-width: ${v}${u};\n`
  }
  javascriptGenerator.forBlock['external_column_span']  = (b) => `column-span: ${b.getFieldValue('VALUE')};\n`
 
  javascriptGenerator.forBlock['internal_column_count'] = (b) => [`column-count: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_column_gap']   = (b) => [`column-gap: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};`, ORDER]
  javascriptGenerator.forBlock['internal_column_rule']  = (b) =>
    [`column-rule: ${b.getFieldValue('WIDTH')}${b.getFieldValue('UNIT')} ${b.getFieldValue('STYLE')} ${b.getFieldValue('COLOR')};`, ORDER]
  javascriptGenerator.forBlock['internal_column_span']  = (b) => [`column-span: ${b.getFieldValue('VALUE')};`, ORDER]
 
  // ── ANIMATION ─────────────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['external_animation_name']       = (b) => `animation-name: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_animation_duration']   = (b) => `animation-duration: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};\n`
  javascriptGenerator.forBlock['external_animation_timing']     = (b) => `animation-timing-function: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_animation_delay']      = (b) => `animation-delay: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};\n`
  javascriptGenerator.forBlock['external_animation_iteration']  = (b) => `animation-iteration-count: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_animation_direction']  = (b) => `animation-direction: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_animation_fill_mode']  = (b) => `animation-fill-mode: ${b.getFieldValue('VALUE')};\n`
  javascriptGenerator.forBlock['external_animation_play_state'] = (b) => `animation-play-state: ${b.getFieldValue('VALUE')};\n`
 
  javascriptGenerator.forBlock['css_keyframes'] = (b) => {
    const name = b.getFieldValue('NAME')
    const from = b.getFieldValue('FROM')
    const to   = b.getFieldValue('TO')
    return `@keyframes ${name} {\n  from { ${from} }\n  to   { ${to} }\n}\n`
  }
 
  javascriptGenerator.forBlock['internal_animation_name']      = (b) => [`animation-name: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_animation_duration']  = (b) => [`animation-duration: ${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')};`, ORDER]
  javascriptGenerator.forBlock['internal_animation_timing']    = (b) => [`animation-timing-function: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_animation_iteration'] = (b) => [`animation-iteration-count: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_animation_direction'] = (b) => [`animation-direction: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_animation_fill_mode'] = (b) => [`animation-fill-mode: ${b.getFieldValue('VALUE')};`, ORDER]
  javascriptGenerator.forBlock['internal_animation_play_state']= (b) => [`animation-play-state: ${b.getFieldValue('VALUE')};`, ORDER]
 
  // ── TRANSFORMS (individual functions) ────────────────────────────────────
 
  javascriptGenerator.forBlock['external_transform_scale'] = (b) =>
    `transform: scale(${b.getFieldValue('X')}, ${b.getFieldValue('Y')});\n`
 
  javascriptGenerator.forBlock['external_transform_translate'] = (b) =>
    `transform: translate(${b.getFieldValue('X')}${b.getFieldValue('XUNIT')}, ${b.getFieldValue('Y')}${b.getFieldValue('YUNIT')});\n`
 
  javascriptGenerator.forBlock['external_transform_rotate'] = (b) =>
    `transform: rotate(${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')});\n`
 
  javascriptGenerator.forBlock['external_transform_skew'] = (b) =>
    `transform: skew(${b.getFieldValue('X')}deg, ${b.getFieldValue('Y')}deg);\n`
 
  javascriptGenerator.forBlock['internal_transform_scale'] = (b) =>
    [`transform: scale(${b.getFieldValue('X')}, ${b.getFieldValue('Y')});`, ORDER]
 
  javascriptGenerator.forBlock['internal_transform_translate'] = (b) =>
    [`transform: translate(${b.getFieldValue('X')}${b.getFieldValue('XUNIT')}, ${b.getFieldValue('Y')}${b.getFieldValue('YUNIT')});`, ORDER]
 
  javascriptGenerator.forBlock['internal_transform_rotate'] = (b) =>
    [`transform: rotate(${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')});`, ORDER]
 
  javascriptGenerator.forBlock['internal_transform_skew'] = (b) =>
    [`transform: skew(${b.getFieldValue('X')}deg, ${b.getFieldValue('Y')}deg);`, ORDER]
 
  // ── FILTER ────────────────────────────────────────────────────────────────
 
  javascriptGenerator.forBlock['external_filter'] = (b) =>
    `filter: ${b.getFieldValue('FUNCTION')}(${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')});\n`
 
  javascriptGenerator.forBlock['internal_filter'] = (b) =>
    [`filter: ${b.getFieldValue('FUNCTION')}(${b.getFieldValue('VALUE')}${b.getFieldValue('UNIT')});`, ORDER]
 
  // ── PSEUDO-CLASSES / PSEUDO-ELEMENTS ─────────────────────────────────────
 
  javascriptGenerator.forBlock['css_pseudo_class'] = (b) =>
    [`:${b.getFieldValue('VALUE')}`, ORDER]
 
  javascriptGenerator.forBlock['css_nth_child'] = (b) =>
    [`:${b.getFieldValue('PSEUDO')}(${b.getFieldValue('FORMULA')})`, ORDER]
 
  javascriptGenerator.forBlock['css_pseudo_element'] = (b) =>
    [`::${b.getFieldValue('VALUE')}`, ORDER]
 
  javascriptGenerator.forBlock['css_not_pseudo'] = (b) =>
    [`:not(${b.getFieldValue('SELECTOR')})`, ORDER]
};