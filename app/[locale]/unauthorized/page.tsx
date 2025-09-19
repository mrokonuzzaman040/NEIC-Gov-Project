import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto">
        {/* Government Header */}
        <div className="bg-white dark:bg-slate-800 shadow-lg border-l-4 border-red-600 mb-8">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Official Seal/Logo */}
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Bangladesh National Elections Inquiry Commission
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    National Elections (2014, 2018, 2024) Inquiry Commission
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Error Code: 403</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Access Denied</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-600 p-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 mb-6">
              <svg className="w-12 h-12 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m-6.75 0h13.5m-13.5 0a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5h13.5a1.5 1.5 0 011.5 1.5v3.75a1.5 1.5 0 01-1.5 1.5H6.75z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">403</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              You do not have permission to access this resource.
            </p>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              This area is restricted to authorized personnel only. Please contact your administrator if you believe this is an error.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/en"
              className="inline-flex items-center justify-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium border border-green-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Go to Homepage
            </Link>
            
            <Link
              href="/en/login"
              className="inline-flex items-center justify-center px-8 py-3 bg-white dark:bg-slate-800 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              Login Again
            </Link>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5 mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Need Access?
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                  If you need access to this area, please contact your system administrator or 
                  <Link href="/en/contact" className="text-green-600 dark:text-green-400 hover:underline font-medium ml-1">
                    submit a request
                  </Link> through our official channels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
