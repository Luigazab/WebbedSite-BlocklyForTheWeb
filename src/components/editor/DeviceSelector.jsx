import { Eye, EyeOff } from 'lucide-react';

const DeviceSelector = ({ 
  deviceSizes, 
  responsive, 
  selectedDevice, 
  onToggleResponsive, 
  onSelectDevice 
}) => {
  return (
    <div data-tour='device-selector' className='flex flex-col justify-around h-full p-4'>
      <div className='flex justify-between items-center mb-2'>
        <h5 className='font-bold text-slate-600'>Screen Sizes:</h5>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-1'>
        {Object.entries(deviceSizes).map(([key, device]) => {
          const IconComponent = device.icon;
          const isSelected = responsive && selectedDevice === key;
          return (
            <button 
              key={key} 
              onClick={() => onSelectDevice(key)}
              className={`flex gap-2 items-center rounded-sm btn py-2 px-2 md:py-3 ${
                isSelected 
                  ? 'btn-secondary' 
                  : 'btn-lead'
              }`}
            >
              <IconComponent size={20} />
              <span className="text-xs mt-1">{device.label}</span>
            </button>
          );
        })}
      </div>
      <p className='text-slate-400 text-xs'>Click any button to view your work in different screen sizes.</p>
    </div>
  );
};

export default DeviceSelector;