// components/PreviewPane.jsx
import { useState } from 'react';
import { Play } from 'lucide-react';
import DeviceSelector from './DeviceSelector';
import DevicePreviewModal from './DevicePreviewModal';
import { deviceSizes } from '../utils/deviceConstant';

const PreviewPane = ({ 
  generatedCode, 
  onRunCode, 
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

  return (
    <div className='w-full h-full relative'>
      <h4 className="absolute -top-6 left-2 font-bold z-1 text-5xl font-mono [text-shadow:1px_1px_0_white,-1px_-1px_0_white,1px_-1px_0_white,-1px_1px_0_white] px-2">
        Preview
      </h4>
      <div id="outputPanel" className="flex-1 my-6 md:h-[90%] flex flex-col border-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] bg-white relative">
        <button onClick={onRunCode} 
          className="absolute -top-6 left-45 px-2 py-2 bg-green-500 border-3 border-black text-black hover:bg-green-60 rounded-full hover:bg-green-600 hover:-translate-y-1 font-medium transition-all"
        >
          <Play className='hover:stroke-white hover:fill-black transition-all' fill='white' />
        </button>
        <div className="flex justify-around px-4 pt-8 bg-gray-900 border-b border-gray-200 group transition-all">
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
        </div>
        <div className="flex-1 overflow-auto">
          {activeTab === 'preview' ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <iframe srcDoc={generatedCode} className="w-full h-full border-0" title="preview" sandbox="allow-scripts"/>
            </div>
          ) : (
            <pre className="p-4 bg-gray-900 text-green-400 text-sm h-full overflow-auto font-mono">
              {generatedCode}
            </pre>
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