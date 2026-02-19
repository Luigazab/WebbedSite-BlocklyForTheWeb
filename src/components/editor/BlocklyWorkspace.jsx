// components/BlocklyWorkspace.jsx
import { useRef, useEffect, useState, useCallback } from 'react';
import * as Blockly from 'blockly/core';
import Theme from '@blockly/theme-modern';
import { javascriptGenerator } from 'blockly/javascript';
import { defineBlocks } from '../../blockly/defineBlocks';
import { defineGenerators } from '../../blockly/defineGenerators';
import { registerToolboxLabel } from '../../blockly/ToolBoxLabel';
import { registerCustomCategory } from '../../blockly/CustomCategory';
import { FieldColour } from '@blockly/field-colour';
import { toolboxConfig } from '../../blockly/toolboxConfig';
import '../../blockly/custom';

const BlocklyWorkspace = ({ 
  onWorkspaceChange, 
  onWorkspaceLoad,
  initialWorkspaceState 
}) => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize blocks and generators
  const initializeBlockly = useCallback(() => {
    // Register colour field
    Blockly.fieldRegistry.register('field_colour', FieldColour);
    
    // Define blocks and generators from local files
    defineBlocks();
    defineGenerators();
    
    // Register custom components
    registerToolboxLabel();
    registerCustomCategory();
  }, []);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      // Initialize Blockly
      initializeBlockly();
      
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxConfig,
        theme: Theme,
        renderer: 'custom_renderer',
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
        },
        trashcan: true,
        move: {
          scrollbars: true,
          drag: true,
          wheel: true
        },
        grid: {
          spacing: 20,
          length: 1,
          colour: '#2f4f4f',
          snap: true
        }
      });

      // Add workspace change listener
      workspace.current.addChangeListener(() => {
        if (onWorkspaceChange) {
          onWorkspaceChange(workspace.current);
        }
      });

      // Load initial workspace state if provided
      if (initialWorkspaceState) {
        Blockly.serialization.workspaces.load(initialWorkspaceState, workspace.current);
      }

      // Notify parent that workspace is loaded
      if (onWorkspaceLoad) {
        onWorkspaceLoad(workspace.current);
      }

      setIsInitialized(true);

      return () => {
        if (workspace.current) {
          workspace.current.dispose();
          workspace.current = null;
        }
      };
    }
  }, [initializeBlockly, onWorkspaceChange, onWorkspaceLoad, initialWorkspaceState]);

  const toggleToolbox = useCallback((visible) => {
    if (!workspace.current) return;
    const toolbox = workspace.current.getToolbox();
    if (toolbox) {
      toolbox.setVisible(visible);
      if (!visible) {
        workspace.current.getFlyout()?.setVisible(false);
      }
    }
    setTimeout(() => {
      if (workspace.current) {
        Blockly.svgResize(workspace.current);
      }
    }, 100);
  }, []);

  const getWorkspace = useCallback(() => workspace.current, []);
  
  const getWorkspaceState = useCallback(() => workspace.current ? 
    Blockly.serialization.workspaces.save(workspace.current) : null, []);
  
  const loadWorkspaceState = useCallback((state) => {
    if (workspace.current && state) {
      Blockly.serialization.workspaces.load(state, workspace.current);
    }
  }, []);
  
  const clearWorkspace = useCallback(() => {
    if (workspace.current) {
      workspace.current.clear();
    }
  }, []);
  
  const getGeneratedCode = useCallback(() => {
    if (workspace.current) {
      return javascriptGenerator.workspaceToCode(workspace.current);
    }
    return '';
  }, []);

  return {
    blocklyDiv,
    getWorkspace,
    getWorkspaceState,
    loadWorkspaceState,
    clearWorkspace,
    getGeneratedCode,
    toggleToolbox,
    isInitialized
  };
};

export default BlocklyWorkspace;