import { Clock, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RecentProjectCard = ({ id, title, description, updated_at, onClick }) => {
  const truncatedDescription = description && description.length > 50 
    ? description.substring(0, 50) + '...'
    : description || 'No description';

  const formattedDate = updated_at 
    ? `Edited ${formatDistanceToNow(new Date(updated_at), { addSuffix: true })}`
    : 'Recently edited';

  return (
    <div onClick={onClick} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer w-[280px] sm:w-[300px] flex-shrink-0">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
          <Globe className="w-6 h-6 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{truncatedDescription}</p>
          <div className="flex items-center space-x-1 mt-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span className='truncate'>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentProjectCard;