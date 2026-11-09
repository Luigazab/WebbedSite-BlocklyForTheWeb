import * as Blockly from 'blockly/core';
import "@blockly/block-plus-minus";

class CustomConstantProvider extends Blockly.zelos.ConstantProvider {
  constructor() {
    super();

    // Enable hats on start blocks
    this.ADD_START_HATS = true;

    this.NOTCH_WIDTH = 25;
    this.NOTCH_HEIGHT = 5
    this.CORNER_RADIUS = 5;
    this.TAB_HEIGHT = 50;
    this.CURSOR_STACK_PADDING = 2;
    this.FIELD_BORDER_RECT_RADIUS=5;
  }

  init() {
    super.init();
  }
}

class CustomRenderer extends Blockly.zelos.Renderer {
  constructor() {
    super();
  }
  makeConstants_() {
    return new CustomConstantProvider();
  }
}

Blockly.blockRendering.register('custom_renderer', CustomRenderer);
