import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { buildPreviewDocument, readPracticeStorage, savePracticeStorage } from '../../utils/previewRuntime';
import { PREVIEW_SANDBOX, validPreviewMessage } from '../../utils/previewSecurity';
import { Play, Eye, Terminal, MonitorSmartphone, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import DeviceSelector from './DeviceSelector';
import DevicePreviewModal from './DevicePreviewModal';
import { deviceSizes } from '../utils/deviceConstant';

const PreviewPane = ({ 
  generatedCode,
  currentFileCode,
  currentFileName,
  previewFileName,
  htmlFiles,
  onRunCode, 
  onNavigateToFile,
  responsive, 
  selectedDevice, 
  onToggleResponsive, 
  onSelectDevice,
  storageScope = 'scratch',
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  // Default to collapsed bottom panel on small screens to prioritize preview area
  const [hidePanel, setHidePanel] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  
  const [activeBottomPanel, setActiveBottomPanel] = useState('devices');
  const [logState, setLogState] = useState({ revision: null, entries: [] });
  const previewRevision = useMemo(() => ({ code: generatedCode, file: previewFileName }), [generatedCode, previewFileName]);
  const logs = logState.revision === previewRevision ? logState.entries : [];
  
  const setLogs = useCallback(update => setLogState(previous => ({
    revision: previewRevision,
    entries: typeof update === 'function' ? update(previous.revision === previewRevision ? previous.entries : []) : update,
  })), [previewRevision]);

  const previewRef = useRef(null);
  const practiceRef = useRef({ scope: storageScope, ...readPracticeStorage(storageScope) });
  if (practiceRef.current.scope !== storageScope) practiceRef.current = { scope: storageScope, ...readPracticeStorage(storageScope) };
  const [runRevision, setRunRevision] = useState(0);
  const [stopped, setStopped] = useState(false);

  const handleDeviceSelect = (device) => {
    onSelectDevice(device);
    setShowDeviceModal(true);
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (!validPreviewMessage(event, previewRef.current?.contentWindow)) return;
      if (event.data?.type === 'NAVIGATE_TO_FILE') {
        onNavigateToFile?.(event.data.filename);
      }
      if (event.data?.type === 'PREVIEW_STORAGE') {
        practiceRef.current = { scope: storageScope, local: event.data.local, session: event.data.session };
        savePracticeStorage(storageScope, practiceRef.current);
      }
      if (event.data?.type === 'CONSOLE_MESSAGE') {
        setLogs(prev => [...prev.slice(-199), {
          type: event.data.logType, 
          message: event.data.message, 
          time: new Date().toLocaleTimeString([], { hour12: false }) 
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigateToFile, setLogs, storageScope]);

  const handleToggle = () => {
    if (activeTab === "preview") {
      setActiveTab("code");
      onRunCode && onRunCode();
    } else {
      setActiveTab("preview");
    }
  };

  const previewCode = useMemo(() => buildPreviewDocument(generatedCode, practiceRef.current), [generatedCode, storageScope, runRevision]);

  return (
    <div className='w-full h-full relative flex flex-col border border-border rounded shadow min-h-0 bg-card'>
      <div data-tour="preview-tabs" id="outputPanel" className="flex-1 flex flex-col bg-muted relative overflow-hidden rounded min-h-0">
        {/* Header Controls */}
        <div className='flex items-center justify-between p-2 gap-2 border-b border-border/40 shrink-0'>
          <div className="flex items-center gap-1.5">
            <button
              className="rounded bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white transition-colors"
              onClick={() => { onRunCode?.(); setStopped(false); setRunRevision(v => v + 1); }}
            >
              Run
            </button>
            <button
              className="rounded bg-slate-700 hover:bg-slate-800 px-2 py-1 text-xs text-white transition-colors"
              onClick={() => setStopped(true)}
            >
              Stop
            </button>
          </div>

          <h4 className="font-bold text-sm tracking-wider shrink-0 hidden sm:block">
            Preview
          </h4>

          <div className="flex items-center border-l border-border pl-2">
            <button
              onClick={handleToggle}
              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                activeTab === "code" ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                  activeTab === "code" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="ml-2 font-bold text-xs text-foreground">
              {activeTab === "preview" ? "Output" : "Code"}
            </span>
          </div>
        </div>
        
        {/* Multi-page Navigation */}
        <div className="flex justify-between items-center px-2 py-1 bg-muted relative shrink-0">
          {previewFileName && previewFileName !== currentFileName && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded truncate max-w-[60%]">
              <Eye size={12} className="shrink-0" />
              <span className="truncate">{previewFileName}</span>
            </div>
          )}
          
          {htmlFiles && htmlFiles.length > 1 && (
            <button 
              onClick={() => setActiveTab('pages')}
              className={`ml-auto px-3 py-1 text-xs font-bold border-b-2 ${
                activeTab === 'pages'
                  ? 'border-green-500 text-green-600 dark:text-green-300'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              Pages ({htmlFiles.length})
            </button>
          )}
        </div>

        {/* Main Preview / Code Area */}
        <div className="flex-1 min-h-0 overflow-auto bg-card border rounded border-border shadow">
          {activeTab === 'preview' && (
            <div className="flex-col w-full h-full flex items-center justify-center bg-card">
              <div className="flex w-full items-center justify-end gap-1.5 px-3 py-1 bg-muted/60 border-b border-border/40 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </div>
              <iframe 
                ref={previewRef}
                key={runRevision}
                srcDoc={stopped ? '<p style="font-family:sans-serif;padding:1rem;">Preview stopped. Tap Run to restart.</p>' : previewCode}
                className="w-full flex-1 border-0" 
                title="preview" 
                sandbox={PREVIEW_SANDBOX}
              />
            </div>
          )}
          
          {activeTab === 'code' && (
            <pre className="p-3 bg-muted text-foreground text-xs md:text-sm h-full overflow-auto font-mono whitespace-pre-wrap">
              {currentFileCode || generatedCode}
            </pre>
          )}
          
          {activeTab === 'pages' && htmlFiles && (
            <div className="p-4 bg-muted h-full overflow-auto">
              <h3 className="text-sm font-bold text-foreground mb-2">HTML Pages</h3>
              <div className="flex flex-col gap-2">
                {htmlFiles.map(file => (
                  <button
                    key={file.id}
                    onClick={() => {
                      onNavigateToFile(file.filename);
                      setActiveTab('preview');
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      file.filename === previewFileName
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 font-semibold'
                        : 'border-border bg-card hover:border-gray-400 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📄</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{file.filename}</span>
                        {file.filename === previewFileName && (
                          <span className="text-[10px] text-green-600 dark:text-green-300">Active preview</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Panel (Devices / Console) */}
        <div className="shrink-0 bg-muted mt-1 rounded border border-border">
          <div className="flex justify-between items-center bg-muted rounded-t">
            <div className='flex'>
              <button 
                onClick={() => { setActiveBottomPanel('devices'); setHidePanel(false); }}
                className={`px-3 py-1.5 text-xs flex items-center justify-center rounded-t gap-1.5 transition-colors ${
                  activeBottomPanel === 'devices' && !hidePanel ? 'bg-slate-700 text-white font-semibold' : 'text-muted-foreground hover:bg-slate-600 hover:text-white'
                }`}
              >
                <MonitorSmartphone size={14} />
                Devices
              </button>
              <button 
                onClick={() => { setActiveBottomPanel('console'); setHidePanel(false); }}
                className={`px-3 py-1.5 text-xs flex items-center justify-center rounded-t gap-1.5 transition-colors ${
                  activeBottomPanel === 'console' && !hidePanel ? 'bg-slate-700 text-white font-semibold' : 'text-muted-foreground hover:bg-slate-600 hover:text-white'
                }`}
              >
                <Terminal size={14} />
                Console 
                {logs.length > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    {logs.length}
                  </span>
                )}
              </button>
            </div>
            <button 
              onClick={() => setHidePanel(!hidePanel)}
              className="px-3 py-1.5 text-xs text-muted-foreground flex items-center justify-center gap-1 hover:text-foreground"
              title='Toggle panel visibility'
            >
              {hidePanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {!hidePanel && (
            <div className="flex flex-col overflow-hidden h-48 border-t border-border">
              {activeBottomPanel === 'devices' && (
                <DeviceSelector 
                  deviceSizes={deviceSizes} 
                  responsive={responsive} 
                  selectedDevice={selectedDevice} 
                  onToggleResponsive={onToggleResponsive} 
                  onSelectDevice={handleDeviceSelect}
                />
              )}

              {activeBottomPanel === 'console' && (
                <div className="flex flex-col bg-muted text-foreground font-mono text-xs h-full w-full">
                  <div className="flex justify-between items-center bg-slate-300 dark:bg-slate-800 px-3 py-1 border-b border-border shrink-0">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Console Output</span>
                    <button 
                      onClick={() => setLogs([])}
                      className="text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  </div>
                  
                  <div className="p-2 overflow-y-auto flex-1">
                    {logs.length === 0 ? (
                      <div className="text-muted-foreground italic text-center mt-3 text-xs">Waiting for logs...</div>
                    ) : (
                      logs.map((log, i) => (
                        <div key={i} className={`mb-1 pb-1 border-b border-border/40 break-words ${
                          log.type === 'error' ? 'text-red-400' : 
                          log.type === 'warn' ? 'text-yellow-400' : 
                          log.type === 'info' ? 'text-blue-400' : 
                          'text-emerald-400'
                        }`}>
                          <span className="text-muted-foreground text-[10px] mr-2 select-none">[{log.time}]</span>
                          <span className="whitespace-pre-wrap">{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-slate-300 dark:bg-slate-800 border-t border-border p-1.5 flex justify-end shrink-0">
                    <button 
                      onClick={onRunCode}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow transition-all active:scale-95"
                    >
                      <Play size={12} fill="currentColor" /> Run Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DevicePreviewModal 
        isOpen={showDeviceModal}
        device={selectedDevice}
        deviceSizes={deviceSizes}
        generatedCode={previewCode}
        onClose={() => setShowDeviceModal(false)}
      />
    </div>
  );
};

export default PreviewPane;