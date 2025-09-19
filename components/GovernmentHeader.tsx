interface GovernmentHeaderProps {
  title: string;
  subtitle?: string;
  portal?: string;
  tagline?: string;
  borderColor?: 'green' | 'blue' | 'indigo' | 'purple' | 'red' | 'yellow' | 'orange';
  iconColor?: 'green' | 'blue' | 'indigo' | 'purple' | 'red' | 'yellow' | 'orange';
}

export default function GovernmentHeader({
  title,
  subtitle,
  portal,
  tagline,
  borderColor = 'green',
  iconColor = 'green'
}: GovernmentHeaderProps) {
  const borderColorClasses = {
    green: 'border-green-600',
    blue: 'border-blue-600',
    indigo: 'border-indigo-600',
    purple: 'border-purple-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    orange: 'border-orange-600'
  };

  const iconColorClasses = {
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    orange: 'bg-orange-600'
  };

  return (
    <div className={`bg-white dark:bg-slate-800 shadow-lg border-l-4 ${borderColorClasses[borderColor]} mb-8`}>
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Official Seal/Logo */}
            <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${iconColorClasses[iconColor]} rounded-full flex items-center justify-center flex-shrink-0`}>
              <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 leading-tight">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {(portal || tagline) && (
            <div className="text-left sm:text-right flex-shrink-0">
              {portal && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {portal}
                </p>
              )}
              {tagline && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {tagline}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
