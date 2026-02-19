import { Clock } from 'lucide-react';

const RecentProjectCard = ({ title, type, tags, editedTime, icon: Icon }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
          {Icon && <Icon className="w-6 h-6 text-orange-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{title}</h3>
          <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
            <span>{type}</span>
            {tags && tags.length > 0 && (
              <>
                <span>•</span>
                <span>{tags.join(' • ')}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-1 mt-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{editedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentProjectCard;