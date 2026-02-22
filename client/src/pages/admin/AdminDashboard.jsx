import { useState, useEffect } from 'react';
import { Users, FileText, Flag, TrendingUp, Clock, Activity, Loader2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        flaggedPosts: 0,
        activeUsers: 0,
        lostItems: 0,
        foundItems: 0,
        newUsersToday: 0,
        newPostsToday: 0,
        weeklyStats: []
    });
    const [recentPosts, setRecentPosts] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                console.log('🔄 Fetching admin stats...');
                const response = await adminAPI.getStats();
                const data = response.data;
                console.log('✅ Admin stats received:', data);
                setStats(data);
                setRecentPosts(data.recentPosts || []);
            } catch (error) {
                console.error('❌ Error fetching admin stats:', error);
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });

                // Show user-friendly error message
                if (error.response?.status === 403) {
                    console.error('🚫 Access denied - User does not have admin privileges');
                } else if (error.response?.status === 401) {
                    console.error('🔐 Authentication failed - Please login again');
                } else {
                    console.error('⚠️ Failed to load admin data');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const dashboardStats = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', change: `+${stats.newUsersToday} today` },
        { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'bg-green-500', change: `+${stats.newPostsToday} today` },
        { label: 'Pending Reports', value: stats.flaggedPosts, icon: Flag, color: 'bg-red-500', change: 'Needs review' },
        { label: 'Active Users', value: stats.activeUsers, icon: TrendingUp, color: 'bg-purple-500', change: 'Live now' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
                <h1 className="text-5xl font-black mb-2 uppercase tracking-tighter">Admin Command Center</h1>
                <p className="text-blue-100 italic font-medium">"Helping communities reconnect, one item at a time."</p>
                <div className="absolute -bottom-8 -right-8 opacity-10">
                    <Shield className="h-48 w-48" />
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 hover:scale-[1.02] transition-all duration-300 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`${stat.color} p-4 rounded-2xl shadow-lg shadow-black/10`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Global</span>
                            </div>
                            <h3 className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                            <p className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{stat.value}</p>
                            <p className="text-[10px] text-primary dark:text-blue-400 font-black uppercase tracking-widest">
                                {stat.change}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Weekly Activity</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">Item flow analytics</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-xl border border-red-100 dark:border-red-900/20">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Lost</span>
                            </div>
                            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/10 px-3 py-1.5 rounded-xl border border-green-100 dark:border-green-900/20">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Found</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.weeklyStats}>
                                <defs>
                                    <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700/50" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 800 }} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 800 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        backdropFilter: 'blur(8px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#FFF' }}
                                    labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="lost" stroke="#EF4444" fillOpacity={1} fill="url(#colorLost)" strokeWidth={4} />
                                <Area type="monotone" dataKey="found" stroke="#10B981" fillOpacity={1} fill="url(#colorFound)" strokeWidth={4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Chart (Simplified) */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tight">Distribution</h3>
                    <div className="flex flex-col h-full justify-center space-y-10 pb-8">
                        <div>
                            <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-400">Lost Items</span>
                                <span className="text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md border border-red-100 dark:border-red-900/20">{stats.lostItems}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-4 overflow-hidden border border-gray-200 dark:border-gray-700">
                                <div
                                    className="bg-red-500 h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                                    style={{ width: stats.totalPosts ? `${(stats.lostItems / stats.totalPosts) * 100}%` : '0%' }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-400">Found Items</span>
                                <span className="text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md border border-green-100 dark:border-green-900/20">{stats.foundItems}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-4 overflow-hidden border border-gray-200 dark:border-gray-700">
                                <div
                                    className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                                    style={{ width: stats.totalPosts ? `${(stats.foundItems / stats.totalPosts) * 100}%` : '0%' }}
                                ></div>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Success Resolution</p>
                            <p className="text-5xl font-black text-primary dark:text-blue-400 tracking-tighter">
                                {stats.totalPosts ? Math.round((stats.foundItems / stats.totalPosts) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Posts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions (Sidebar) */}
                <div className="space-y-4">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Tools</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { to: '/admin/posts', icon: FileText, label: 'Manage Posts', iconColor: 'text-primary', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
                            { to: '/admin/users', icon: Users, label: 'User Directory', iconColor: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
                            { to: '/admin/claims', icon: Shield, label: 'Claims Approval', iconColor: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
                            { to: '/admin/reports', icon: Flag, label: 'Infraction Reports', iconColor: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', count: stats.flaggedPosts }
                        ].map((action, idx) => (
                            <Link
                                key={idx}
                                to={action.to}
                                className="p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300 flex items-center gap-5 group shadow-sm hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className={`${action.bgColor} p-3 rounded-2xl group-hover:scale-110 transition shadow-inner`}>
                                    <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                                </div>
                                <div className="flex-1">
                                    <span className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight text-sm">{action.label}</span>
                                    {action.count > 0 && (
                                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{action.count} pending review</p>
                                    )}
                                </div>
                                <Activity className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Items Table */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Recent Activity</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Live feed of community contributions</p>
                        </div>
                        <Link to="/admin/posts" className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/20">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Item Details</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Classification</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Verification</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Timeline</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                {recentPosts.length > 0 ? (
                                    recentPosts.map((post) => (
                                        <tr key={post.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition duration-150 group">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition">{post.title}</div>
                                                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">by {post.creatorName || 'Anonymous'}</div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border transition-all ${post.type === 'lost'
                                                    ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50'
                                                    : 'bg-green-50 text-green-600 border-green-100 dark:bg-green-950/30 dark:border-green-900/50'
                                                    }`}>
                                                    {post.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${post.status === 'resolved' ? 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse'}`}></div>
                                                    <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">{(post.status || 'Active')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-[10px] font-black text-gray-400 dark:text-gray-500 text-right uppercase tracking-widest">
                                                {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-16 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest opacity-50 italic">No recent activity detected</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
