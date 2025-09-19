"use client";
import { useTranslations } from 'next-intl';

interface TableRow {
  id: string | number;
  title: string;
  publishedAt: string;
  downloadUrl?: string;
  actionLabel?: string;
}

interface DataTableProps {
  data: TableRow[];
  className?: string;
  showDownloadAction?: boolean;
}

export default function DataTable({ 
  data, 
  className = "", 
  showDownloadAction = true
}: DataTableProps) {
  const t = useTranslations('table');

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
              {t('serialNumber')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
              {t('title')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
              {t('publishedAt')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
              {t('action')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                {t('noDataAvailable')}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  <div className="font-medium">{row.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {row.publishedAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {showDownloadAction && row.downloadUrl ? (
                    <a
                      href={row.downloadUrl}
                      download
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-6 8h8a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v11a2 2 0 002 2z" />
                      </svg>
                      {row.actionLabel || t('download')}
                    </a>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}