// components/BlocklyWorkspace.jsx
import { useRef, useEffect, useState, useCallback } from 'react';
import * as Blockly from 'blockly/core';
import Theme from '@blockly/theme-modern';
import { javascriptGenerator } from 'blockly/javascript';
import { legacyToolboxConfig } from '../../blockly/toolboxConfig';
import { createLearningToolbox } from '../../blockly/learningToolbox';
import { showWorkspaceDiagnostics } from '../../blockly/workspaceDiagnostics';
import { sourceDiagnostics } from '../../utils/javascriptSource';
import { codeGeneratorService } from '../../services/codeGenerator.service';
import { initBlockly } from '../../blockly/initBlockly';
import { propagateNameChange } from '../../blockly/jsSupport';
import '../../blockly/custom';

const BlocklyWorkspace = ({ 
  onWorkspaceChange, 
  onWorkspaceLoad,
  initialWorkspaceState,
  filename = 'index.html',
  lessonBlocks = [],
  initialPalette = 'beginner',
}) => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [palette, setPalette] = useState(initialPalette);
  const [issues, setIssues] = useState([]);
  const filenameRef = useRef(filename);
  filenameRef.current = filename;
  const initialStateLoaded = useRef(false);
  
  const onWorkspaceChangeRef = useRef(onWorkspaceChange);
  const onWorkspaceLoadRef = useRef(onWorkspaceLoad);
  
  useEffect(() => {
    onWorkspaceChangeRef.current = onWorkspaceChange;
  }, [onWorkspaceChange]);
  
  useEffect(() => {
    onWorkspaceLoadRef.current = onWorkspaceLoad;
  }, [onWorkspaceLoad]);


  useEffect(() => {
    if (workspace.current && initialWorkspaceState && !initialStateLoaded.current) {
      try {
        Blockly.serialization.workspaces.load(initialWorkspaceState, workspace.current);
        initialStateLoaded.current = true;
      } catch (error) {
        console.error('Error loading workspace state:', error);
      }
    }
  }, [initialWorkspaceState, isInitialized]);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      initBlockly();
      
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: createLearningToolbox(legacyToolboxConfig, { filename, level: palette, lessonBlocks }),
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
      const toolboxEl = blocklyDiv.current?.querySelector('.blocklyToolbox')
      if (toolboxEl) toolboxEl.setAttribute('data-tour', 'toolbox')

      let diagnosticTimer;
      workspace.current.addChangeListener(event => {
        if (event.isUiEvent) return;
        propagateNameChange(workspace.current, event);
        clearTimeout(diagnosticTimer);
        diagnosticTimer = setTimeout(() => {
          if (!workspace.current) return;
          const warnings = showWorkspaceDiagnostics(workspace.current, filenameRef.current);
          try {
            const code = codeGeneratorService.generateCode(workspace.current, filenameRef.current);
            setIssues([...warnings, ...sourceDiagnostics(code, filenameRef.current)]);
          } catch (error) { setIssues([...warnings, { message: error.message }]); }
        }, 120);
        if (onWorkspaceChangeRef.current && workspace.current) {
          onWorkspaceChangeRef.current(workspace.current);
        }
      });

      setIsInitialized(true);

      if (onWorkspaceLoadRef.current) {
        onWorkspaceLoadRef.current(workspace.current);
      }

      return () => {
        clearTimeout(diagnosticTimer);
        if (workspace.current) {
          workspace.current.dispose();
          workspace.current = null;
          setIsInitialized(false);
          initialStateLoaded.current = false;
        }
      };
    }
  },[]);

  useEffect(() => {
    if (!workspace.current) return;
    workspace.current.updateToolbox(createLearningToolbox(legacyToolboxConfig, { filename, level: palette, lessonBlocks }));
    const resizeFrame = requestAnimationFrame(() => {
      if (!workspace.current) return;
      workspace.current.getToolbox()?.position();
      Blockly.svgResize(workspace.current);
    });
    setIssues(showWorkspaceDiagnostics(workspace.current, filename));
    return () => cancelAnimationFrame(resizeFrame);
  }, [filename, palette, JSON.stringify(lessonBlocks), isInitialized]);

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
  const fitBlocks = useCallback(() => {
    if (!workspace.current) return;
    workspace.current.getToolbox()?.position();
    Blockly.svgResize(workspace.current);
    workspace.current.zoomToFit();
    const current = workspace.current;
    const frame = current.getParentSvg().getBoundingClientRect();
    const toolbox = current.getToolbox()?.getDiv().getBoundingClientRect();
    const left = (toolbox?.right ?? frame.left) + 20;
    const right = frame.right - 24;
    let bounds = current.getCanvas().getBoundingClientRect();
    if (!bounds.width || right <= left) return;
    current.setScale(current.scale * Math.min(1, (right - left) / bounds.width));
    bounds = current.getCanvas().getBoundingClientRect();
    current.scroll(current.scrollX + left - bounds.left, current.scrollY + frame.top + 24 - bounds.top);
  }, []);
  
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
    filename,
    blocklyDiv,
    getWorkspace,
    getWorkspaceState,
    loadWorkspaceState,
    clearWorkspace,
    getGeneratedCode,
    toggleToolbox,
    isInitialized,
    palette, setPalette, issues, fitBlocks, hasLessonPalette: lessonBlocks.length > 0,
  };
};

export default BlocklyWorkspace;
