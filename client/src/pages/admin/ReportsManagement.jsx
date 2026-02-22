import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Flag, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsManagement() {
    const [reports, setReports] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await adminAPI.getReports();
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (reportId, newStatus) => {
        try {
            await adminAPI.updateReportStatus(reportId, newStatus);

            setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
            toast.success(`Report status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating report:', error);
            toast.error('Failed to update report');
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Moderation Center</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Investigate and resolve community security reports</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reports</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">{filteredReports.length}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="relative max-w-xs">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full appearance-none px-6 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-[10px] font-black uppercase tracking-widest cursor-pointer"
                    >
                        <option value="all">Comprehensive Analysis</option>
                        <option value="pending">Pending Investigation</option>
                        <option value="reviewed">Under Review</option>
                        <option value="resolved">Resolved Cases</option>
                        <option value="dismissed">Dismissed Claims</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
                {filteredReports.length > 0 ? filteredReports.map((report) => (
                    <div key={report.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 dark:border-gray-700 group hover:border-primary/50 transition duration-300">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
                            <div className="flex items-start gap-6 flex-1">
                                <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${report.priority === 'high'
                                    ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-950/30 dark:border-red-900/50 shadow-lg shadow-red-200 dark:shadow-none'
                                    : report.priority === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900/50'
                                        : 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900/50'
                                    }`}>
                                    <Flag className="h-8 w-8" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                            {report.type === 'post' ? 'Content Violation' : 'Behavioral Misconduct'}
                                        </h3>
                                        {report.priority && (
                                            <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-lg border uppercase tracking-[0.1em] ${report.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50' :
                                                report.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50' :
                                                    'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50'
                                                }`}>
                                                {report.priority}
                                            </span>
                                        )}
                                        <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-lg border uppercase tracking-[0.1em] ${report.status === 'pending' || !report.status ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50' :
                                            report.status === 'resolved' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-950/30 dark:border-green-900/50' :
                                                'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-900 dark:border-gray-700'
                                            }`}>
                                            {(report.status || 'pending')}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Informant</span>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">{report.reporterName || 'Anonymous User'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Reason</span>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">{report.reason}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Detailed Description</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                            {report.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <CheckCircle className="h-3 w-3" />
                                        Logged: {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleString() : new Date().toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {(report.status === 'pending' || !report.status) && (
                            <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                                    className="px-6 py-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition"
                                >
                                    Dismiss Report
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(report.id, 'resolved')}
                                    className="px-8 py-3.5 bg-green-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.05] active:scale-[0.95] transition shadow-lg shadow-green-200 dark:shadow-none flex items-center gap-3"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Mark as Resolved
                                </button>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl p-24 text-center border border-gray-100 dark:border-gray-700">
                        <Flag className="h-24 w-24 text-gray-100 dark:text-gray-900 mx-auto mb-8 shadow-inner" />
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Clear Skies</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">All outstanding reports have been successfully adjudicated.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
