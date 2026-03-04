import * as Blockly from "blockly/core";
import "@blockly/block-plus-minus";

export const blocksJson = () => {
  Blockly.Blocks["html_heading"] = {
    init: function () {
      this.jsonInit({
        "message0": "Heading %1 %2",
        "args0":[
          {
            "type": "field_dropdown",
            "name": "LEVEL",
            "options": [
              ["H1", "H1"],
              ["H2", "H2"],
              ["H3", "H3"],
              ["H4", "H4"],
              ["H5", "H5"],
              ["H6", "H6"]
            ]
          },
          {
            "type": "input_statement",
            "name": "CONTENT"
          }
        ],
        "colour": "#4A90E2",
        "extensions": ["block_plus_minus"],
        "inputsInline": false, 
        "mutator": "block_plus_minus"
      });
    },
  };

  Blockly.Blocks['html_attribute'] = {
  init: function() {
    this.jsonInit({
      "message0": "%1 = %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "ATTR_NAME",
          "options": [
            ["class", "class"],
            ["id", "id"],
            ["style", "style"]
          ]
        },
        {
          "type": "field_input",
          "name": "ATTR_VALUE",
          "text": ""
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230
    });
  }
};

};
