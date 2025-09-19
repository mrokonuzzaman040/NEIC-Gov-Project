"use client";
import { useState } from 'react';
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon, 
  CalendarIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

interface ReportData {
  id: string;
  title: string;
  description: string;
  type: 'submission' | 'user' | 'audit' | 'system';
  lastGenerated: string;
  recordCount: number;
}

export default function ReportsDashboard() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Mock report data
  const reports: ReportData[] = [
    {
      id: '1',
      title: 'Submission Summary Report',
      description: 'Overview of all submissions received with status breakdown',
      type: 'submission',
      lastGenerated: new Date().toISOString(),
      recordCount: 1250,
    },
    {
      id: '2',
      title: 'User Activity Report',
      description: 'Detailed user login and activity logs',
      type: 'user',
      lastGenerated: new Date(Date.now() - 86400000).toISOString(),
      recordCount: 89,
    },
    {
      id: '3',
      title: 'Audit Trail Report',
      description: 'Complete audit log of all system activities',
      type: 'audit',
      lastGenerated: new Date(Date.now() - 172800000).toISOString(),
      recordCount: 2156,
    },
    {
      id: '4',
      title: 'System Performance Report',
      description: 'System metrics and performance indicators',
      type: 'system',
      lastGenerated: new Date(Date.now() - 259200000).toISOString(),
      recordCount: 45,
    },
  ];

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'submission':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'user':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'audit':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'system':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleGenerateReport = (reportId: string) => {
    setSelectedReport(reportId);
    // Simulate report generation
    setTimeout(() => {
      setSelectedReport(null);
    }, 2000);
  };

  const handleDownloadReport = (reportId: string) => {
    // Simulate download
    console.log(`Downloading report ${reportId}`);
  };

  const handleViewReport = (reportId: string) => {
    // Simulate viewing report
    console.log(`Viewing report ${reportId}`);
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Reports</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{reports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <DocumentArrowDownIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Generated Today</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This Month</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <PrinterIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Records</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {reports.reduce((sum, report) => sum + report.recordCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Available Reports
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Generate and download system reports
          </p>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {reports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                      {report.title}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportTypeColor(report.type)}`}>
                      {report.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {report.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                    </span>
                    <span>
                      {report.recordCount.toLocaleString()} records
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-6">
                  <button
                    onClick={() => handleViewReport(report.id)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 p-2 rounded-lg transition-colors"
                    title="View Report"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadReport(report.id)}
                    className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-2 rounded-lg transition-colors"
                    title="Download Report"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={selectedReport === report.id}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white p-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                    title="Generate Report"
                  >
                    {selectedReport === report.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <ChartBarIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Generation Status */}
      {selectedReport && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              Generating report... This may take a few moments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
