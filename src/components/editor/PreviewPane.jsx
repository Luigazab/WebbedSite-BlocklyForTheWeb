import { useState, useEffect } from 'react';
import { Play, Eye, Terminal, MonitorSmartphone, Trash2 } from 'lucide-react';
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
  onSelectDevice 
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  
  // --- New State for Console and Bottom Panel ---
  const [activeBottomPanel, setActiveBottomPanel] = useState('devices'); // 'devices' or 'console'
  const [logs, setLogs] = useState([]);

  const handleDeviceSelect = (device) => {
    onSelectDevice(device);
    setShowDeviceModal(device !== 'desktop');
  };

  // Listen for messages from the iframe (Navigation & Console Logs)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'NAVIGATE_TO_FILE') {
        onNavigateToFile?.(event.data.filename);
      }
      
      if (event.data?.type === 'CONSOLE_MESSAGE') {
        setLogs(prev => [...prev, { 
          type: event.data.logType, 
          message: event.data.message, 
          time: new Date().toLocaleTimeString([], { hour12: false }) 
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigateToFile]);

  // Clear logs automatically when the preview code completely changes
  useEffect(() => {
    setLogs([]);
  }, [generatedCode, previewFileName]);

  // Inject console interceptor AND navigation handler BEFORE the generated code
  // This ensures the console is hijacked before the user's code executes
  const interceptorScript = `
    <script>
      (function() {
        // --- 1. Console Intercept Logic ---
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        const originalInfo = console.info;

        function postLog(type, args) {
          const message = Array.from(args).map(arg => {
            if (arg === null) return 'null';
            if (arg === undefined) return 'undefined';
            if (typeof arg === 'object') {
              try { return JSON.stringify(arg, null, 2); } catch(e) { return '[Object]'; }
            }
            return String(arg);
          }).join(' ');
          
          window.parent.postMessage({ type: 'CONSOLE_MESSAGE', logType: type, message: message }, '*');
        }

        console.log = function(...args) { postLog('log', args); originalLog.apply(console, args); };
        console.warn = function(...args) { postLog('warn', args); originalWarn.apply(console, args); };
        console.error = function(...args) { postLog('error', args); originalError.apply(console, args); };
        console.info = function(...args) { postLog('info', args); originalInfo.apply(console, args); };
        
        window.onerror = function(message, source, lineno, colno, error) {
          window.parent.postMessage({ type: 'CONSOLE_MESSAGE', logType: 'error', message: message + ' (Line: ' + lineno + ')' }, '*');
        };

        // --- 2. Navigation Logic ---
        document.addEventListener('click', function(e) {
          let target = e.target;
          
          while (target && target.tagName !== 'A') {
            target = target.parentElement;
          }
          
          if (target && target.tagName === 'A') {
            const dataPage = target.getAttribute('data-page');
            if (dataPage) {
              e.preventDefault();
              window.parent.postMessage({ type: 'NAVIGATE_TO_FILE', filename: dataPage }, '*');
              return;
            }
            
            const href = target.getAttribute('href');
            if (href && href.endsWith('.html')) {
              e.preventDefault();
              window.parent.postMessage({ type: 'NAVIGATE_TO_FILE', filename: href }, '*');
              return;
            }
          }
        });
      })();
    </script>
  `;

  // Prepend the script instead of appending it
  const previewCode = interceptorScript + generatedCode;

  return (
    <div className='w-full h-full relative flex flex-col'>
      <div id="outputPanel" className="flex-1 flex flex-col border-2 bg-gray-800 relative overflow-hidden">
        <h4 className="font-bold z-1 text-4xl text-white px-2 tracking-widest shrink-0">
          Preview
        </h4>
        
        <div data-tour="preview-tabs" className="flex justify-around px-4 border-t bg-gray-800 border-b border-gray-600 group transition-all relative shrink-0">
          {previewFileName && previewFileName !== currentFileName && (
            <div className="absolute left-2 top-2 flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded">
              <Eye size={12} />
              <span>Previewing: {previewFileName}</span>
            </div>
          )}
          
          <button 
            onClick={() => setActiveTab('preview')}
            className={`px-5 py-2 font-bold border-b-4 ${
              activeTab === 'preview'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            Output
          </button>
          <button 
            onClick={() => {setActiveTab('code'); onRunCode && onRunCode();}}
            className={`px-5 py-2 font-bold border-b-4 ${
              activeTab === 'code'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            Code
          </button>
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
        <div className="flex-1 overflow-auto">
          {activeTab === 'preview' && (
            <div className="flex-col w-full h-full flex items-center justify-center bg-gray-100">
              <div className="flex w-full items-center justify-end gap-2 px-3 py-1.5 border-b border-slate-600 bg-slate-300">
                  <span className="w-3 h-3 rounded-full bg-blockly-red"></span>
                  <span className="w-3 h-3 rounded-full bg-blockly-yellow"></span>
                  <span className="w-3 h-3 rounded-full bg-blockly-green"></span>
              </div>
              <iframe 
                srcDoc={previewCode} 
                className="w-full h-full border-0" 
                title="preview" 
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          )}
          
          {activeTab === 'code' && (
            <pre className="p-4 bg-gray-900 text-green-400 text-sm h-full overflow-auto font-mono whitespace-pre-wrap">
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
        <div className="flex flex-col border-t-2 border-gray-700 shrink-0 bg-gray-900 max-h-[40%]">
          
          {/* Panel Toggle Tabs */}
          <div className="flex w-full bg-gray-800 border-b border-gray-700">
            <button 
              onClick={() => setActiveBottomPanel('devices')}
              className={`flex-1 py-2 text-sm flex items-center justify-center gap-2 transition-colors ${activeBottomPanel === 'devices' ? 'bg-gray-700 text-white font-semibold' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'}`}
            >
              <MonitorSmartphone size={16} />
              Devices
            </button>
            <button 
              onClick={() => setActiveBottomPanel('console')}
              className={`flex-1 py-2 text-sm flex items-center justify-center gap-2 transition-colors ${activeBottomPanel === 'console' ? 'bg-gray-700 text-white font-semibold' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'}`}
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

          {/* Render Active Bottom Panel */}
          <div className="flex flex-col overflow-hidden h-48">
            {activeBottomPanel === 'devices' && (
              <div className="p-2 overflow-y-auto h-full">
                <DeviceSelector 
                  deviceSizes={deviceSizes} 
                  responsive={responsive} 
                  selectedDevice={selectedDevice} 
                  onToggleResponsive={onToggleResponsive} 
                  onSelectDevice={handleDeviceSelect}
                />
              </div>
            )}

            {activeBottomPanel === 'console' && (
              <div className="flex flex-col bg-black text-gray-300 font-mono text-sm h-full w-full">
                <div className="flex justify-between items-center bg-gray-900 px-3 py-1 border-b border-gray-800 shrink-0">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Developer Console</span>
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
                    <div className="text-gray-600 italic text-center mt-4 text-xs">Waiting for logs...</div>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className={`mb-1.5 pb-1.5 border-b border-gray-800/50 break-words ${
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
                <div className="bg-gray-900 border-t border-gray-800 p-2 flex justify-end shrink-0">
                  <button 
                    onClick={onRunCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded shadow transition-all active:scale-95"
                  >
                    <Play size={14} fill="currentColor" /> Run Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <DevicePreviewModal 
        isOpen={showDeviceModal}
        device={selectedDevice}
        deviceSizes={deviceSizes}
        generatedCode={generatedCode}
        onClose={() => setShowDeviceModal(false)}
      />
    </div>
  );
};

export default PreviewPane;