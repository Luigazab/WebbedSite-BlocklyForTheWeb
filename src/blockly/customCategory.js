import * as Blockly from 'blockly';
import React from 'react'; 
import { FileText, Type, Image, File, Blocks, Plus, Table2, Form, List, Table2Icon } from 'lucide-react'; 
import { createRoot } from 'react-dom/client';


class CustomCategory extends Blockly.ToolboxCategory {
  constructor(categoryDef, toolbox, opt_parent) {
    super(categoryDef, toolbox, opt_parent);
  }
  
  /** @override */
  createRowContents_() {
    // Call parent implementation first
    super.createRowContents_();
    
    // Apply custom styling immediately after creation
    this.addColourBorder_(this.colour_);
    // Apply cssconfig if it exists
    const cssConfig = this.toolboxItemDef_['cssconfig'];
    if (cssConfig) {
      // Add custom classes
      if (cssConfig['container']) {
        this.rowDiv_.classList.add(cssConfig['row']);
      }
      
      // Apply custom styles directly
      if (cssConfig['backgroundColor']) {
        this.rowDiv_.classList.backgroundColor = cssConfig['backgroundColor'];
      }
      if (cssConfig['border']) {
        this.rowDiv_.classList.border = cssConfig['border'];
      }
    }
  }
  
  /** @override */
  addColourBorder_(colour) {
    // Apply background color to the row
    // this.rowDiv_.style.backgroundColor = colour;
    this.rowDiv_.style.setProperty('--cat-color', colour);
    // Style the label
    const labelDom = this.rowDiv_.getElementsByClassName('blocklyToolboxCategoryLabel')[0];
    if (labelDom) {
      labelDom.style.color = 'white';
      labelDom.style.fontWeight = '600';
    }
    
    // Style the icon if it exists
    if (this.iconDom_) {
      this.iconDom_.style.color = 'white';
    }
  }
  
  /** @override */
  // setSelected(isSelected) {
  //   const labelDom = this.rowDiv_.getElementsByClassName('blocklyToolboxCategoryLabel')[0];
    
  //   if (isSelected) {
  //     // Selected state: white background, colored text
  //     this.rowDiv_.style.backgroundColor = 'white';
  //     this.rowDiv_.style.borderBottom = `4px solid ${this.colour_}`;
      
  //     if (labelDom) {
  //       labelDom.style.color = this.colour_;
  //     }
  //     if (this.iconDom_) {
  //       this.iconDom_.style.color = this.colour_;
  //     }
  //   } else {
  //     // Unselected state: colored background, white text
  //     this.rowDiv_.style.backgroundColor = this.colour_;
  //     this.rowDiv_.style.borderBottom = `4px solid ${this.colour_}`;
      
  //     if (labelDom) {
  //       labelDom.style.color = 'white';
  //     }
  //     if (this.iconDom_) {
  //       this.iconDom_.style.color = 'white';
  //     }
  //   }
    
  //   // Update ARIA state
  //   Blockly.utils.aria.setState(
  //     this.htmlDiv_,
  //     Blockly.utils.aria.State.SELECTED,
  //     isSelected
  //   );
  // }
  setSelected(isSelected) {
    this.rowDiv_.classList.toggle('blocklyToolboxCategorySelected', isSelected);

    // expose colour to CSS
    this.rowDiv_.style.setProperty('--cat-color', this.colour_);

    Blockly.utils.aria.setState(
      this.htmlDiv_,
      Blockly.utils.aria.State.SELECTED,
      isSelected
    );
  }
  

  
  /** @override */
  createIconDom_() {
    const iconContainer = document.createElement('span');

    let IconComponent;
    switch (this.toolboxItemDef_.name) {
      case 'Page':
        IconComponent = File;
        break;
      case 'Structure':
        IconComponent = Blocks;
        break;
      case 'Text':
        IconComponent = Type;
        break;
      case 'Attributes':
        IconComponent = Plus;
        break;
      case 'Media':
        IconComponent = Image;
        break;
      case 'Forms':
        IconComponent = Form;
        break;
      case 'Tables':
        IconComponent = Table2Icon;
        break;
      case 'Lists':
        IconComponent = List;
        break;
      default:
        IconComponent = FileText;
    }

    const root = createRoot(iconContainer);
    root.render(
      React.createElement(IconComponent, { className: 'text-white w-4 h-4' })
    );

    return iconContainer;
  }
}

export const registerCustomCategory = () => {
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    CustomCategory,
    true
  );
};