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
  const [hidePanel, setHidePanel] = useState(false);
  
  // --- New State for Console and Bottom Panel ---
  const [activeBottomPanel, setActiveBottomPanel] = useState('devices'); // 'devices' or 'console'
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

  // Listen for messages from the iframe (Navigation & Console Logs)
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
    <div className='w-full h-full relative flex flex-col border border-border rounded shadow gap-2'>
      <div id="outputPanel" className="flex-1 flex flex-col bg-slate-200 relative overflow-hidden rounded">
        <div className='flex items-center justify-between p-1'>
          <div className="flex items-center gap-2"><button className="rounded bg-emerald-700 px-2 py-1 text-xs text-white" onClick={() => { onRunCode?.(); setStopped(false); setRunRevision(value => value + 1); }}>Run</button><button className="rounded bg-slate-700 px-2 py-1 text-xs text-white" onClick={() => setStopped(true)}>Stop</button></div>
          <h4 className="font-bold tracking-wider shrink-0">
            Preview
          </h4>
          <div className="flex items-center border-l border-black pl-2">
            <button
              onClick={handleToggle}
              className={`relative inline-flex items-center h-6 w-13 rounded-full transition-colors 
                ${activeTab === "code" ? "bg-emerald-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute left-1 inline-block w-5 h-4 transform bg-white rounded-full transition-transform!
                  ${activeTab === "code" ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
            <span className="ml-3 font-bold text-gray-700">
              {activeTab === "preview" ? "Output" : "Code"}
            </span>
          </div>
        </div>
        
        <div data-tour="preview-tabs" className="flex justify-around px-4 bg-gray-800 group transition-all relative shrink-0">
          {previewFileName && previewFileName !== currentFileName && (
            <div className="absolute left-2 top-2 flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded">
              <Eye size={12} />
              <span>Previewing: {previewFileName}</span>
            </div>
          )}
          
          
          {htmlFiles && htmlFiles.length > 1 && (
            <button 
              onClick={() => setActiveTab('pages')}
              className={`px-5 py-2 font-bold border-b-4 ${
                activeTab === 'pages'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Pages
            </button>
          )}
        </div>

        {/* Main Preview/Code Area */}
        <div className="flex-1 overflow-auto bg-white border rounded border-border shadow">
          {activeTab === 'preview' && (
            <div className="flex-col w-full h-full flex items-center justify-center bg-white">
              <div className="flex w-full items-center justify-end gap-2 px-3 py-1.5 bg-slate-400">
                  <span className="w-3 h-3 rounded-full bg-blockly-red"></span>
                  <span className="w-3 h-3 rounded-full bg-blockly-yellow"></span>
                  <span className="w-3 h-3 rounded-full bg-blockly-green"></span>
              </div>
              <iframe 
                ref={previewRef}
                key={runRevision}
                srcDoc={stopped ? '<p>Preview stopped. Press Run to restart.</p>' : previewCode}
                className="w-full h-full border-0" 
                title="preview" 
                sandbox={PREVIEW_SANDBOX}
              />
            </div>
          )}
          
          {activeTab === 'code' && (
            <pre className="p-4 bg-gray-700 text-green-500 text-sm h-full overflow-auto font-mono whitespace-pre-wrap">
              {currentFileCode || generatedCode}
            </pre>
          )}
          
          {activeTab === 'pages' && htmlFiles && (
            <div className="p-6 bg-gray-50 h-full overflow-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-4">HTML Pages</h3>
              <p className="text-sm text-gray-600 mb-4">
                Click to preview a page (workspace stays on current file)
              </p>
              <div className="flex flex-col gap-2">
                {htmlFiles.map(file => (
                  <button
                    key={file.id}
                    onClick={() => {
                      onNavigateToFile(file.filename);
                      setActiveTab('preview');
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      file.filename === previewFileName
                        ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                        : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📄</span>
                      <div className="flex flex-col">
                        <span>{file.filename}</span>
                        {file.filename === currentFileName && (
                          <span className="text-xs text-blue-600">Currently editing</span>
                        )}
                        {file.filename === previewFileName && (
                          <span className="text-xs text-green-600">Currently previewing</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- Bottom Swappable Panel --- */}
        <div className=" shrink-0 bg-slate-200 max-h-[40%] mt-1.5 rounded border border-slate-300">
          
          {/* Panel Toggle Tabs */}
          <div className="flex justify-between bg-slate-400 rounded-t">
            <div className='flex'>
              <button 
                onClick={() => {setActiveBottomPanel('devices'); setHidePanel(false)}}
                className={`px-4 py-2 text-sm flex items-center justify-center rounded-t gap-2 transition-colors! ${activeBottomPanel === 'devices' ? 'bg-slate-600 text-white font-semibold' : 'text-slate-600 hover:text-gray-200 hover:bg-slate-500'}`}
              >
                <MonitorSmartphone size={16} />
                Devices
              </button>
              <button 
                onClick={() => {setActiveBottomPanel('console'); setHidePanel(false)}}
                className={`px-4 py-2 text-sm flex items-center justify-center rounded-t gap-2 transition-colors! ${activeBottomPanel === 'console' ? 'bg-slate-600 text-white font-semibold' : 'text-slate-600 hover:text-gray-200 hover:bg-slate-500'}`}
              >
                <Terminal size={16} />
                Console 
                {logs.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {logs.length}
                  </span>
                )}
              </button>
            </div>
            <button 
              onClick={() => setHidePanel(!hidePanel) }
              className={`px-4 py-2 text-sm text-gray-600 flex items-center justify-center gap-2 transition-colors! hover:bg-slate-500 hover:text-gray-200`}
              title='Toggle panel visibility'
            >
              {hidePanel ? <ChevronDown size={16} /> : <ChevronUp size={16} /> }
            </button>
          </div>

          {/* Render Active Bottom Panel */}
          {!hidePanel && (
            <div className="flex flex-col overflow-hidden h-48">
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
                <div className="flex flex-col bg-slate-200 text-gray-300 font-mono text-sm h-full w-full">
                  <div className="flex justify-between items-center bg-slate-300 px-3 py-1 border-b border-slate-400 shrink-0">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Developer Console</span>
                    <button 
                      onClick={() => setLogs([])}
                      className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1 text-xs"
                      title="Clear console"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  </div>
                  
                  <div className="p-2 overflow-y-auto flex-1">
                    {logs.length === 0 ? (
                      <div className="text-gray-300 italic text-center mt-4">Waiting for logs...</div>
                    ) : (
                      logs.map((log, i) => (
                        <div key={i} className={`mb-1.5 pb-1.5 border-b border-slate-700/50 break-words ${
                          log.type === 'error' ? 'text-red-400' : 
                          log.type === 'warn' ? 'text-yellow-400' : 
                          log.type === 'info' ? 'text-blue-300' : 
                          'text-green-400'
                        }`}>
                          <span className="text-gray-600 text-xs mr-3 select-none">[{log.time}]</span>
                          <span className="whitespace-pre-wrap">{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Console Footer / Run Button */}
                  <div className="bg-slate-300 border-t border-slate-400 p-2 flex justify-end shrink-0">
                    <button 
                      onClick={onRunCode}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded shadow transition-all active:scale-95"
                    >
                      <Play size={14} fill="currentColor" /> Run Code
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
