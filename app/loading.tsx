export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto">
        {/* Government Header */}
        <div className="bg-white dark:bg-slate-800 shadow-lg border-l-4 border-green-600 mb-8">
          <div className="px-8 py-6">
            <div className="flex items-center justify-center space-x-4">
              {/* Official Seal/Logo */}
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Bangladesh National Elections Inquiry Commission
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  National Elections (2014, 2018, 2024) Inquiry Commission
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 text-center">
          {/* Loading Spinner */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-full mb-6">
              <svg 
                className="w-10 h-10 text-green-600 dark:text-green-400 animate-spin" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>

          {/* Loading Text */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Loading Portal
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              Please wait while we prepare the page for you
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Initializing government portal services...
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="mb-6">
            <div className="flex justify-center space-x-3">
              <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>

          {/* Status Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 dark:text-green-300 font-medium text-sm">
                Securing connection to government servers...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}