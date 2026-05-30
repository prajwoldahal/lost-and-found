// File: Rewards.jsx
// Description: Rewards Page: Lists total points, badge tiers, and a global leaderboard ranking users by returned-items points.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Star, TrendingUp, ChevronUp } from 'lucide-react';
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

    const getRankBadgeColor = (rank) => {
        if (rank === 1) return 'bg-yellow-500 text-white';
        if (rank === 2) return 'bg-gray-400 text-white';
        if (rank === 3) return 'bg-amber-600 text-white';
        return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Trophy className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
                        <Trophy className="h-7 w-7 text-yellow-300" />
                        {t('rewardsAndLeaderboard')}
                    </h1>
                    <p className="text-blue-100 mt-2 text-sm">
                        {t('topCommunityMembers')}
                    </p>
                </div>
            </div>

            {/* User's Current Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('yourPoints')}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{userData?.points || 0}</p>
                        </div>
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <Star className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('yourRank')}</p>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">#{userData?.rank || '-'}</p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('itemsReturned')}</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{userData?.itemsReturned || 0}</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                            <Award className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* How Points Work */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    {t('howToEarnPoints')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                        <p className="font-bold text-primary text-xl mb-1">+50 PTS</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('reportFoundItemPoints')}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                        <p className="font-bold text-primary text-xl mb-1">+100 PTS</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('returnItemPoints')}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                        <p className="font-bold text-primary text-xl mb-1">+100 PTS</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('verifyIdentityPoints')}</p>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        {t('communityLeaderboard')}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('mostHelpfulMembers')}</p>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {leaderboard.map((user, index) => (
                        <div
                            key={user.id}
                            className={`p-5 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition ${user.rank <= 3 ? 'bg-yellow-50/30 dark:bg-yellow-900/5' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Rank Badge */}
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${getRankBadgeColor(user.rank)}`}>
                                    {user.rank}
                                </div>

                                {/* Avatar */}
                                <img
                                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'User'}`}
                                    alt={user.displayName || 'User'}
                                    className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-gray-700 object-cover"
                                />

                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{user.displayName || 'Unknown User'}</h3>
                                        {user.isVerified && <VerifiedBadge verified={true} size="h-4 w-4" />}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('returnedItems', { count: user.itemsReturned || 0 })}</p>
                                </div>

                                {/* Points */}
                                <div className="text-right">
                                    <p className="text-lg font-bold text-primary">{user.points}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('points')}</p>
                                </div>

                                {/* Rank Change */}
                                {index < 5 && (
                                    <div className="text-green-600 dark:text-green-400 flex flex-col items-center">
                                        <ChevronUp className="h-4 w-4" />
                                        <span className="text-xs font-bold">{Math.floor(Math.random() * 3) + 1}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8 text-center shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                    <Trophy className="h-12 w-12 mb-4 opacity-90 text-yellow-300" />
                    <h2 className="text-2xl font-bold mb-3">{t('climbLeaderboard')}</h2>
                    <p className="text-blue-100 mb-8 max-w-lg text-sm leading-relaxed">
                        {t('leaderboardDesc')}
                    </p>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-3 bg-white text-primary px-8 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                    >
                        {t('exploreMissingItems')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
