// File: AdminDashboard.jsx
// Description: Simplified admin dashboard UI matching streamlined design.

import { useState, useEffect } from 'react';
import { Users, FileText, Flag, TrendingUp, Shield, Activity, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const { t } = useTranslation();
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
    weeklyStats: [],
  });
  const [recentPosts, setRecentPosts] = useState([]);

  // Fetch admin statistics on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminAPI.getStats();
        setStats(data);
        setRecentPosts(data.recentPosts || []);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const dashboardStats = [
    { label: t('totalUsers'), value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: t('totalPosts'), value: stats.totalPosts, icon: FileText, color: 'bg-green-500' },
    { label: t('pendingReports'), value: stats.flaggedPosts, icon: Flag, color: 'bg-red-500' },
    { label: t('activeUsers'), value: stats.activeUsers, icon: TrendingUp, color: 'bg-purple-500' },
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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">{t('adminCommandCenter')}</h1>
        <p className="text-blue-100 font-medium">{t('helpingReconnect')}</p>
        <div className="absolute -bottom-8 -right-8 opacity-10">
          <Shield className="h-48 w-48" />
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-xl`}> <Icon className="h-5 w-5 text-white" /> </div>
                <span className="bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">{t('global')}</span>
              </div>
              <h3 className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-1">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('weeklyActivity')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('itemFlowAnalytics')}</p>
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
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
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

        {/* Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('distribution')}</h3>
          <div className="flex flex-col h-full justify-center space-y-6 pb-4">
            {/* Lost */}
            <div>
              <div className="flex justify-between mb-2 text-xs font-bold uppercase">
                <span className="text-gray-500">{t('lostItems')}</span>
                <span className="bg-red-500/20 text-red-600 px-2 py-0.5 rounded-md border border-red-500/20">{stats.lostItems}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-3 overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="bg-red-500 h-full rounded-full" style={{ width: stats.totalPosts ? `${(stats.lostItems / stats.totalPosts) * 100}%` : '0%' }} />
              </div>
            </div>
            {/* Found */}
            <div>
              <div className="flex justify-between mb-2 text-xs font-bold uppercase">
                <span className="text-gray-500">{t('foundItems')}</span>
                <span className="bg-green-500/20 text-green-600 px-2 py-0.5 rounded-md border border-green-500/20">{stats.foundItems}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-3 overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="bg-green-500 h-full rounded-full" style={{ width: stats.totalPosts ? `${(stats.foundItems / stats.totalPosts) * 100}%` : '0%' }} />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t('successResolution')}</p>
              <p className="text-3xl font-bold text-primary dark:text-blue-400 tracking-tight">
                {stats.totalPosts ? Math.round((stats.foundItems / stats.totalPosts) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Sidebar */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('tools')}</h3>
          <div className="grid gap-4">
            {[{ to: '/admin/posts', icon: FileText, label: t('managePosts'), bg: 'bg-blue-100 dark:bg-blue-900/30' },
              { to: '/admin/users', icon: Users, label: t('userDirectory'), bg: 'bg-purple-100 dark:bg-purple-900/30' },
              { to: '/admin/claims', icon: Shield, label: t('claimsApproval'), bg: 'bg-green-100 dark:bg-green-900/30' },
              { to: '/admin/reports', icon: Flag, label: t('Reports'), bg: 'bg-red-100 dark:bg-red-900/30', count: stats.flaggedPosts },
              { to: '/admin/logs', icon: Activity, label: t('adminLogs'), bg: 'bg-amber-100 dark:bg-amber-900/30' }].map((action, idx) => (
              <Link key={idx} to={action.to} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                <div className={`${action.bg} p-3 rounded-xl`}> <action.icon className="h-5 w-5" /> </div>
                <div className="flex-1">
                  <span className="font-bold text-gray-700 dark:text-gray-200 uppercase text-xs">{action.label}</span>
                  {action.count > 0 && (
                    <p className="text-[10px] text-red-500 font-bold uppercase">{action.count} {t('pendingReview')}</p>
                  )}
                </div>
                <Activity className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Items Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('recentActivity')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('liveFeedContributions')}</p>
            </div>
            <Link to="/admin/posts" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition shadow-sm">
              {t('viewAll')}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">{t('itemDetails')}</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">{t('classification')}</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">{t('verification')}</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">{t('timeline')}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition duration-150 group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-white uppercase group-hover:text-primary transition">{post.title}</div>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mt-0.5">{t('by')} {post.creatorName || t('anonymous')}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border ${post.type === 'lost' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                          {post.type === 'lost' ? t('lost') : t('found')}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${post.status === 'resolved' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                          <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">{t(post.status || 'Active')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-[10px] font-black text-gray-400 dark:text-gray-500 text-right uppercase tracking-widest">
                        {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-16 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest opacity-50 italic">{t('noRecentActivity')}</td>
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
