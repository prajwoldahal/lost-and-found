import { useState, useEffect } from 'react';
import { logAPI } from '../../services/api';
import {
    Search,
    Filter,
    Download,
    Trash2,
    RefreshCw,
    AlertCircle,
    Info,
    AlertTriangle,
    XCircle,
    Loader2,
    Clock,
    User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [levelFilter, setLevelFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, [levelFilter]);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(fetchLogs, 5000); // Refresh every 5 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh, levelFilter]);

    const fetchLogs = async () => {
        try {
            console.log('🔄 Fetching logs...');
            const params = {};
            if (levelFilter !== 'all') params.level = levelFilter;

            const response = await logAPI.getLogs(params);
            console.log('✅ Logs received:', response.data.length);
            setLogs(response.data);
        } catch (error) {
            console.error('❌ Error fetching logs:', error);
            toast.error('Failed to load logs: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleClearOldLogs = async () => {
        if (!window.confirm('Are you sure you want to delete logs older than 30 days?')) return;

        try {
            const response = await logAPI.clearOldLogs(30);
            toast.success(response.data.message);
            fetchLogs();
        } catch (error) {
            toast.error('Failed to clear logs');
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(filteredLogs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `logs-${new Date().toISOString()}.json`;
        link.click();
        toast.success('Logs exported successfully');
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = searchQuery === '' ||
            log.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const getLevelIcon = (level) => {
        switch (level) {
            case 'error': return <XCircle className="h-5 w-5" />;
            case 'warning': return <AlertTriangle className="h-5 w-5" />;
            case 'info': return <Info className="h-5 w-5" />;
            default: return <AlertCircle className="h-5 w-5" />;
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'error': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50';
            case 'warning': return 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-950/30 dark:border-yellow-900/50';
            case 'info': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50';
            default: return 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-950/30 dark:border-gray-900/50';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">System Logs</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Monitor system activities and events</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${autoRefresh
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                        Auto-Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                    <button
                        onClick={handleClearOldLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear Old
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs by message, action, or user..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm font-bold transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="w-full appearance-none pl-12 pr-10 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-[10px] font-black uppercase tracking-widest cursor-pointer"
                        >
                            <option value="all">All Levels</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Level</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Message</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">User</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Action</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Time</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition duration-150">
                                        <td className="px-8 py-6">
                                            <span className={`flex items-center gap-2 px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border ${getLevelColor(log.level)}`}>
                                                {getLevelIcon(log.level)}
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{log.message}</p>
                                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-mono">{JSON.stringify(log.metadata)}</p>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{log.userEmail || 'System'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight">{log.action || 'N/A'}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                <Clock className="h-3 w-3" />
                                                {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : 'N/A'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest opacity-50 italic">
                                        No logs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
