// File: ReportsManagement.jsx
// Description: Module: Handles ReportsManagement logical operations.

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Flag, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// React Component: Renders the ReportsManagement user interface elements dynamically
export default function ReportsManagement() {
    const { t } = useTranslation();
    const [reports, setReports] = useState([]);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [loading, setLoading] = useState(true);

    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await adminAPI.getReports();
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error(t('failedToLoadReports'));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (reportId, newStatus) => {
        try {
            await adminAPI.updateReportStatus(reportId, newStatus);

            setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
            toast.success(t('reportStatusUpdated', { status: t(newStatus) }));
        } catch (error) {
            console.error('Error updating report:', error);
            toast.error(t('failedToUpdateReport'));
        }
    };

    const filteredReports = reports.filter(report => {
        return statusFilter === 'all' || (report.status || 'pending') === statusFilter;
    });

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
                     <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">All reports</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[48px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{t('reportsCount')}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{filteredReports.length}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
                <div className="relative max-w-xs">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full appearance-none px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm font-medium cursor-pointer"
                    >
                        <option value="pending">{t('pendingInvestigation')}</option>
                        <option value="resolved">{t('resolvedCases')}</option>
                        <option value="dismissed">{t('dismissedClaims')}</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {filteredReports.length > 0 ? filteredReports.map((report) => (
                    <div key={report.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition duration-200">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`p-3 rounded-xl border transition-all ${report.priority === 'high'
                                    ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-950/30 dark:border-red-900/50'
                                    : report.priority === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900/50'
                                        : 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900/50'
                                    }`}>
                                    <Flag className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                            {report.type === 'post' ? t('contentViolation') : t('behavioralMisconduct')}
                                        </h3>
                                        {report.priority && (
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg border ${report.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50' :
                                                report.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50' :
                                                    'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50'
                                                }`}>
                                                {t(report.priority)}
                                            </span>
                                        )}
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg border ${report.status === 'pending' || !report.status ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50' :
                                            report.status === 'resolved' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-950/30 dark:border-green-900/50' :
                                                'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-900 dark:border-gray-700'
                                            }`}>
                                            {t(report.status || 'pending')}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-400 uppercase mb-0.5">{t('informant')}</span>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{report.reporterName || t('anonymous')}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-400 uppercase mb-0.5">{t('primaryReason')}</span>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{report.reason}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1.5">{t('detailedDescription')}</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {report.description || report.details || 'No description provided.'}
                                        </p>
                                    </div>

                                    {report.photoUrls && report.photoUrls.length > 0 && (
                                        <div className="mt-4">
                                            <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Evidence</span>
                                            <div className="flex gap-2 items-center flex-wrap">
                                                {report.photoUrls.map((url, idx) => (
                                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="relative w-20 h-20 rounded-xl overflow-hidden group block hover:ring-2 hover:ring-primary transition-all">
                                                        <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[10px] text-white font-bold uppercase tracking-widest">View</span>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        {t('logged')}: {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleString() : new Date().toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {(report.status === 'pending' || !report.status) && (
                            <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                                    className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                                >
                                    {t('dismissReport')}
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(report.id, 'resolved')}
                                    className="px-5 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition shadow-sm flex items-center gap-2"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    {t('markAsResolved')}
                                </button>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-16 text-center border border-gray-100 dark:border-gray-700">
                        <Flag className="h-16 w-16 text-gray-100 dark:text-gray-700 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('Nothing left')}</h3>
                        <p className="text-gray-400 text-sm">{t('All reports have been cleared')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
