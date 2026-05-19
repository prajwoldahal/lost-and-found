// File: Rewards.jsx
// Description: Rewards Page: Lists total points, badge tiers, and a global leaderboard ranking users by returned-items points.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Star, TrendingUp, Medal, Crown, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VerifiedBadge from '../components/VerifiedBadge';
import { useTranslation } from 'react-i18next';
import { userAPI } from '../services/api';

// React Component: Renders the Rewards user interface elements dynamically
export default function Rewards() {
    const { t } = useTranslation();
    const { userData } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch real leaderboard data
    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await userAPI.getLeaderboard();
                setLeaderboard(response.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Crown className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Medal className="h-6 w-6 text-orange-600" />;
            default:
                return <span className="text-gray-500 font-bold">#{rank}</span>;
        }
    };

    const getRankBadgeColor = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
        if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
        return 'bg-gray-100';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
            {/* Header */}
            <div className="bg-primary text-white rounded-[2.5rem] p-12 shadow-2xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy className="h-64 w-64" />
                </div>
                <div className="relative z-10 space-y-2">
                    <h1 className="text-3xl font-black flex items-center gap-4 uppercase tracking-tighter">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Trophy className="h-8 w-8 text-yellow-300" />
                        </div>
                        {t('rewardsAndLeaderboard')}
                    </h1>
                    <p className="text-blue-100 mt-2 text-xs font-bold uppercase tracking-widest opacity-80">
                        {t('topCommunityMembers')}
                    </p>
                </div>
            </div>

            {/* User's Current Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-8 border border-gray-100 dark:border-gray-800 transition-all hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">{t('yourPoints')}</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{userData?.points || 0}</p>
                        </div>
                        <div className="bg-primary/10 p-5 rounded-[1.5rem] shadow-sm">
                            <Star className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-8 border border-gray-100 dark:border-gray-800 transition-all hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">{t('yourRank')}</p>
                            <p className="text-4xl font-black text-purple-600 dark:text-purple-400 tracking-tighter">#{userData?.rank || '-'}</p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-5 rounded-[1.5rem] shadow-sm">
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl p-8 border border-gray-100 dark:border-gray-800 transition-all hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">{t('itemsReturned')}</p>
                            <p className="text-4xl font-black text-green-600 dark:text-green-400 tracking-tighter">{userData?.itemsReturned || 0}</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-5 rounded-[1.5rem] shadow-sm">
                            <Award className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* How Points Work */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-10 shadow-inner">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                    <Award className="h-6 w-6 text-primary" />
                    {t('howToEarnPoints')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl">
                        <p className="font-black text-primary text-2xl mb-1 tracking-tighter">+50 PTS</p>
                        <p className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest text-[10px]">{t('reportFoundItemPoints')}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl">
                        <p className="font-black text-primary text-2xl mb-1 tracking-tighter">+100 PTS</p>
                        <p className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest text-[10px]">{t('returnItemPoints')}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl">
                        <p className="font-black text-primary text-2xl mb-1 tracking-tighter">+100 PTS</p>
                        <p className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest text-[10px]">{t('verifyIdentityPoints')}</p>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white dark:bg-gray-950 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="bg-gray-900 dark:bg-gray-900/50 text-white p-8 md:p-10 border-b border-gray-800">
                    <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
                        <Crown className="h-8 w-8 text-yellow-400" />
                        {t('communityLeaderboard')}
                    </h2>
                    <p className="text-gray-400 text-[10px] mt-2 font-black uppercase tracking-[0.2em] opacity-80">{t('mostHelpfulMembers')}</p>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {leaderboard.map((user, index) => (
                        <div
                            key={user.id}
                            className={`p-6 md:p-8 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition ${user.rank <= 3 ? 'bg-gradient-to-r from-white to-yellow-50/10 dark:from-gray-800 dark:to-yellow-900/5' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Rank Badge */}
                                <div className={`flex items-center justify-center w-14 h-14 rounded-full ${getRankBadgeColor(user.rank)} shadow-md border-4 border-white dark:border-gray-700`}>
                                    {getRankIcon(user.rank)}
                                </div>

                                {/* Avatar */}
                                <img
                                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'User'}`}
                                    alt={user.displayName || 'User'}
                                    className="w-14 h-14 rounded-full border-2 border-primary/20 shadow-sm object-cover"
                                />

                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight">{user.displayName || 'Unknown User'}</h3>
                                        {user.isVerified && <VerifiedBadge verified={true} size="h-4 w-4" />}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('returnedItems', { count: user.itemsReturned || 0 })}</p>
                                </div>

                                {/* Points */}
                                <div className="text-right flex flex-col items-end mr-4">
                                    <p className="text-2xl font-black text-primary leading-none">{user.points}</p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mt-1">{t('points')}</p>
                                </div>

                                {/* Rank Change */}
                                {index < 5 && (
                                    <div className="text-green-600 dark:text-green-400 flex flex-col items-center">
                                        <ChevronUp className="h-5 w-5" />
                                        <span className="text-[10px] font-black">{Math.floor(Math.random() * 3) + 1}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-primary text-white rounded-[2.5rem] p-12 text-center shadow-2xl shadow-primary/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-dark opacity-50" />
                <div className="relative z-10 flex flex-col items-center">
                    <Trophy className="h-16 w-16 mb-6 opacity-90 text-yellow-300" />
                    <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">{t('climbLeaderboard')}</h2>
                    <p className="text-blue-100 mb-10 max-w-lg font-medium opacity-90 leading-relaxed">
                        {t('leaderboardDesc')}
                    </p>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-4 bg-white text-primary px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl active:scale-95"
                    >
                        {t('exploreMissingItems')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
