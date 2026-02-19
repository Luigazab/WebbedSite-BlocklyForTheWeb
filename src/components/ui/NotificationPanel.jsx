import { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

const typeStyles = {
  comment:  'bg-blue-100 text-blue-600',
  like:     'bg-pink-100 text-pink-600',
  follow:   'bg-green-100 text-green-600',
  system:   'bg-gray-100 text-gray-600',
  lesson:   'bg-purple-100 text-purple-600',
  achievement: 'bg-yellow-100 text-yellow-600',
}

function NotificationItem({ notification, onRead }) {
  return (
    <button
      onClick={() => !notification.is_read && onRead(notification.id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50
        ${notification.is_read ? 'opacity-60' : 'bg-blue-50/40'}`}
    >
      {/* Avatar or type icon */}
      <div className="shrink-0 mt-0.5">
        {notification.from_user?.avatar_url ? (
          <img
            src={notification.from_user.avatar_url}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
            ${typeStyles[notification.type] ?? typeStyles.system}`}>
            {notification.type?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">{notification.content}</p>
        {notification.from_user && (
          <p className="text-xs text-gray-400 mt-0.5">from {notification.from_user.username}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-blockly-purple" />
      )}
    </button>
  )
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className={`w-5 h-5 transition-colors ${open ? 'text-blockly-purple' : 'text-gray-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4.5 h-4.5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-blockly-purple/10 text-blockly-purple font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-blockly-purple hover:underline font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-90 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell className="w-8 h-8 text-gray-200" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5">
              <button className="text-xs text-blockly-purple hover:underline font-medium w-full text-center">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}