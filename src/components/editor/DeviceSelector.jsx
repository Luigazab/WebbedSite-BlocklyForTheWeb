import { Eye, EyeOff } from 'lucide-react';

const DeviceSelector = ({ 
  deviceSizes, 
  responsive, 
  selectedDevice, 
  onToggleResponsive, 
  onSelectDevice 
}) => {
  return (
    <div data-tour='device-selector' className='flex flex-col justify-center p-1 border-t-2 bg-slate-300 h-full'>
      <div className='flex justify-between items-center mb-2'>
        <h5 className='font-semibold'>Screen Sizes:</h5>
      </div>
      <div className='grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-1 m-1'>
        {Object.entries(deviceSizes).map(([key, device]) => {
          const IconComponent = device.icon;
          const isSelected = responsive && selectedDevice === key;
          return (
            <button 
              key={key} 
              onClick={() => onSelectDevice(key)}
              className={`flex flex-col items-center rounded-sm btn py-2 px-2 md:py-3 ${
                isSelected 
                  ? 'btn-secondary' 
                  : 'btn-lead'
              }`}
            >
              <IconComponent size={24} />
              <span className="text-xs mt-1">{device.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DeviceSelector;