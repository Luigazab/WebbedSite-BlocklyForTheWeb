import { useState, useEffect } from 'react';
import { Play, Eye } from 'lucide-react';
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

  const handleDeviceSelect = (device) => {
    onSelectDevice(device);
    setShowDeviceModal(device !== 'desktop');
  };

  // Listen for navigation from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'NAVIGATE_TO_FILE') {
        onNavigateToFile?.(event.data.filename);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigateToFile]);

  // Inject navigation handler for links
  const previewCode = generatedCode + `
    <script>
      (function() {
        document.addEventListener('click', function(e) {
          let target = e.target;
          
          while (target && target.tagName !== 'A') {
            target = target.parentElement;
          }
          
          if (target && target.tagName === 'A') {
            // Check for data-page attribute
            const dataPage = target.getAttribute('data-page');
            if (dataPage) {
              e.preventDefault();
              window.parent.postMessage({ type: 'NAVIGATE_TO_FILE', filename: dataPage }, '*');
              return;
            }
            
            // Check for regular href to .html files
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

  return (
    <div className='w-full h-full relative'>
      <h4 className="absolute -top-6 left-2 font-bold z-1 text-5xl font-mono [text-shadow:1px_1px_0_white,-1px_-1px_0_white,1px_-1px_0_white,-1px_1px_0_white] px-2">
        Preview
      </h4>
      <div id="outputPanel" className="flex-1 my-6 h-[96%] flex flex-col border-2 border-slate-500 rounded-lg bg-white relative">
        <button onClick={onRunCode} data-tour="run-btn"
          className="z-10 absolute -top-6 left-50 px-2 py-2 bg-green-500 border-3 border-black text-black hover:bg-green-60 rounded-full hover:bg-green-600 hover:-translate-y-1 font-medium transition-all"
        >
          <Play className='hover:stroke-white hover:fill-black transition-all' fill='white' />
        </button>
        
        <div data-tour="preview-tabs" className="flex justify-around px-4 pt-8 bg-gray-900 border-b border-gray-200 group transition-all relative">
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
                sandbox="allow-scripts"
              />
            </div>
          )}
          
          {activeTab === 'code' && (
            <pre className="p-4 bg-gray-900 text-green-400 text-sm h-full overflow-auto font-mono">
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

        <DeviceSelector 
          deviceSizes={deviceSizes} 
          responsive={responsive} 
          selectedDevice={selectedDevice} 
          onToggleResponsive={onToggleResponsive} 
          onSelectDevice={handleDeviceSelect}
        />
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