import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router'
import { AlertTriangle, Home, RefreshCw, ChevronRight } from 'lucide-react'

export default function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  // Determine what kind of error we're dealing with
  const is404 = isRouteErrorResponse(error) && error.status === 404
  const is403 = isRouteErrorResponse(error) && error.status === 403
  const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch'

  const config = {
    title:    is404          ? 'Page Not Found'
            : is403          ? 'Access Denied'
            : isNetworkError ? 'No Connection'
            :                  'Something Went Wrong',

    subtitle: is404          ? "We couldn't find what you were looking for."
            : is403          ? "You don't have permission to view this page."
            : isNetworkError ? 'Check your internet connection and try again.'
            :                  'An unexpected error occurred. Our team has been notified.',

    code:     isRouteErrorResponse(error) ? error.status : 500,
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center flex flex-col items-center gap-6">

        {/* Big error code */}
        <div className="relative">
          <p className="text-[120px] font-black text-gray-100 leading-none select-none">
            {config.code}
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black text-gray-800">{config.title}</h1>
          <p className="text-gray-400 text-sm leading-relaxed">{config.subtitle}</p>
        </div>

        {/* Error details — collapsed in prod, shown in dev */}
        {import.meta.env.DEV && error?.message && (
          <details className="w-full text-left bg-gray-900 rounded-xl overflow-hidden">
            <summary className="px-4 py-3 text-xs font-mono text-gray-400 cursor-pointer hover:text-gray-300 select-none">
              Error details (dev only)
            </summary>
            <div className="px-4 pb-4">
              <p className="text-xs font-mono text-red-400 break-all">{error.message}</p>
              {error.stack && (
                <pre className="text-xs font-mono text-gray-500 mt-2 overflow-x-auto whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        {/* Helpful links */}
        {is404 && (
          <div className="flex flex-col gap-1.5 w-full border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Maybe you were looking for
            </p>
            {[
              { label: 'Login',    to: '/login'    },
              { label: 'Register', to: '/register' },
            ].map(({ label, to }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-600 font-medium"
              >
                {label}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}