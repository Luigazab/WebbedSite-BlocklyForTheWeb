import { X } from 'lucide-react';

const DevicePreviewModal = ({ isOpen, device, deviceSizes, generatedCode, onClose }) => {
  if (!isOpen || !device) return null;
  const deviceConfig = deviceSizes[device];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-99 flex items-center justify-center p-4" 
      onClick={onClose}>
        <div className="relative max-w-full max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex w-full justify-between gap-4">
            <h3 className="text-white rounded bg-black/50 w-full px-2 text-2xl font-bold shadow">
              {deviceConfig.label} Preview <span className='text-slate-200 font-normal text-sm'> ( {deviceConfig.width} x {deviceConfig.height}px )</span>
            </h3>
            <button onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors!">
              Close
            </button>
          </div>
          
          <div className="bg-white shadow-2xl overflow-hidden rounded"
            style={{
              width: `${deviceConfig.width * deviceConfig.scale}px`,
              height: `${deviceConfig.height * deviceConfig.scale}px`,
              maxWidth: '90vw',
              maxHeight: '80vh'
            }}
          >
            <div className="flex w-full items-center justify-end gap-2 px-3 py-1.5 bg-slate-400">
              <span className="w-3 h-3 rounded-full bg-blockly-red"></span>
              <span className="w-3 h-3 rounded-full bg-blockly-yellow"></span>
              <span className="w-3 h-3 rounded-full bg-blockly-green"></span>
            </div>
            <iframe 
              srcDoc={generatedCode}
              className="border-0"
              title="device-preview"
              sandbox="allow-scripts allow-same-origin"
              style={{
                transform: `scale(${deviceConfig.scale})`,
                transformOrigin: 'top left',
                width: `${deviceConfig.width}px`,
                height: `${deviceConfig.height}px`
              }}
            />
          </div>
          
          <div className="mt-4 text-white text-sm">
            <p className="text-center">Click anywhere outside to close</p>
          </div>
        </div>
    </div>
  );
}
export default DevicePreviewModal;