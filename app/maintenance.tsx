import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function MaintenancePage() {
  const locale = await getLocale();
  // Use fallback text since the app might be down
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        {/* Government Header */}
        <div className="bg-white dark:bg-slate-800 shadow-lg border-l-4 border-amber-600 mb-8">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Official Seal/Logo */}
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center">
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  System Status: Maintenance
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Scheduled Update
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Content */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 text-center">
          {/* Maintenance Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-full mb-6">
              <svg 
                className="w-12 h-12 text-amber-600 dark:text-amber-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Under Maintenance
            </h1>
          </div>

          {/* Content */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              System Maintenance in Progress
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              We&apos;re temporarily offline for system improvements
            </p>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              The Bangladesh National Elections Inquiry Commission portal is currently undergoing scheduled maintenance to improve your experience. We&apos;ll be back online shortly.
            </p>
          </div>

          {/* Status Updates */}
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <svg 
                className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span className="text-blue-800 dark:text-blue-300 font-semibold text-lg">
                Maintenance Status
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Database optimization</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Security updates</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">⏳ In Progress</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">System testing</span>
                <span className="text-slate-400 font-medium">⏸ Pending</span>
              </div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-green-800 dark:text-green-300 font-semibold text-lg mb-3 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Estimated Completion
            </h3>
            <p className="text-green-700 dark:text-green-400 text-2xl font-bold mb-2">
              2-4 hours from now
            </p>
            <p className="text-sm text-green-600 dark:text-green-500">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>

          {/* Alternative Actions */}
          <div className="mb-8">
            <h4 className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-4">
              Need immediate assistance?
            </h4>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@ec.gov.bd"
                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
                Email Support
              </a>
              
              <a 
                href="tel:+880-2-8391397"
                className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-slate-800 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold rounded-lg transition-colors"
              >
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                  />
                </svg>
                Call Support
              </a>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5 mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Important Notice
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                  Thank you for your patience while we improve our services. All data is secure and will be available once maintenance is complete.
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  Bangladesh National Elections Inquiry Commission • System Maintenance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}