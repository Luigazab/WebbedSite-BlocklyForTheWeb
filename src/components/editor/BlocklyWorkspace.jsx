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
  const initialStateLoaded = useRef(false);
  
  // Store callbacks in refs so they don't cause re-initialization
  const onWorkspaceChangeRef = useRef(onWorkspaceChange);
  const onWorkspaceLoadRef = useRef(onWorkspaceLoad);
  
  // Update refs when callbacks change
  useEffect(() => {
    onWorkspaceChangeRef.current = onWorkspaceChange;
  }, [onWorkspaceChange]);
  
  useEffect(() => {
    onWorkspaceLoadRef.current = onWorkspaceLoad;
  }, [onWorkspaceLoad]);

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

  // Separate effect for loading initial workspace state
  useEffect(() => {
    if (workspace.current && initialWorkspaceState && !initialStateLoaded.current) {
      try {
        Blockly.serialization.workspaces.load(initialWorkspaceState, workspace.current);
        initialStateLoaded.current = true;
      } catch (error) {
        console.error('Error loading workspace state:', error);
      }
    }
  }, [initialWorkspaceState]);

  // Main workspace initialization - runs ONCE
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

      // Add workspace change listener using ref
      workspace.current.addChangeListener(() => {
        if (onWorkspaceChangeRef.current && workspace.current) {
          onWorkspaceChangeRef.current(workspace.current);
        }
      });

      setIsInitialized(true);

      // Call load callback using ref
      if (onWorkspaceLoadRef.current) {
        onWorkspaceLoadRef.current(workspace.current);
      }

      return () => {
        if (workspace.current) {
          workspace.current.dispose();
          workspace.current = null;
          setIsInitialized(false);
          initialStateLoaded.current = false;
        }
      };
    }
  }, [initializeBlockly]); // ONLY initializeBlockly in dependencies!

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
      try {
        // Validate state structure before loading
        if (state && typeof state === 'object') {
          workspace.current.clear();
          Blockly.serialization.workspaces.load(state, workspace.current);
          initialStateLoaded.current = true;
        } else {
          console.warn('Invalid workspace state:', state);
          workspace.current.clear();
        }
      } catch (error) {
        console.error('Error loading workspace state:', error);
        workspace.current.clear();
      }
    }
  }, []);
  
  const clearWorkspace = useCallback(() => {
    if (workspace.current) {
      workspace.current.clear();
      initialStateLoaded.current = false;
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