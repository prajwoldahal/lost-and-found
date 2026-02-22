import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, userAPI } from '../services/api';
import ItemsMap from '../components/ItemsMap';
import VerifiedBadge from '../components/VerifiedBadge';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Tag, Search, Loader2, Trophy, Award, Crown, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const { t } = useTranslation();
    const { currentUser, userData } = useAuth();
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    // Auto-redirect admin to admin panel
    useEffect(() => {
        if (userData?.isAdmin) {
            navigate('/admin');
        }
    }, [userData, navigate]);

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error('Geolocation error:', error)
            );
        }
    }, []);

    // Fetch posts from backend
    useEffect(() => {
        if (!currentUser) return;

        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await postAPI.getAll(filter !== 'all' && filter !== 'near_me' ? { type: filter } : {});
                setPosts(response.data);
            } catch (error) {
                console.error("Failed to load posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [currentUser, filter]);

    // Fetch leaderboard
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await userAPI.getLeaderboard();
                setLeaderboard(response.data.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
            }
        };
        fetchLeaderboard();
    }, []);

    // Apply filters
    useEffect(() => {
        let result = posts;

        if (filter !== 'all' && filter !== 'near_me') {
            result = result.filter(post => post.type === filter);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(post =>
                post.title?.toLowerCase().includes(lowerTerm) ||
                post.description?.toLowerCase().includes(lowerTerm) ||
                post.category?.toLowerCase().includes(lowerTerm)
            );
        }

        if (filter === 'near_me' && userLocation) {
            result = [...result].sort((a, b) => {
                if (!a.location || !b.location) return 0;
                const distA = Math.sqrt(Math.pow(a.location.lat - userLocation.lat, 2) + Math.pow(a.location.lng - userLocation.lng, 2));
                const distB = Math.sqrt(Math.pow(b.location.lat - userLocation.lat, 2) + Math.pow(b.location.lng - userLocation.lng, 2));
                return distA - distB;
            });
        }

        setFilteredPosts(result);
    }, [filter, searchTerm, posts, userLocation]);

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section with Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    {/* Welcome Card */}
                    <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8 shadow-xl relative overflow-hidden h-full flex flex-col justify-center">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold mb-2 tracking-tight">
                                {t('welcomeBack', { name: userData?.displayName || 'Hero' })}
                            </h1>
                            <div className="mt-6 flex gap-6">
                                <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                                    <p className="text-xs uppercase font-bold text-blue-200">Your Points</p>
                                    <p className="text-2xl font-black">{userData?.points || 0}</p>
                                </div>
                                <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                                    <p className="text-xs uppercase font-bold text-blue-200">Items Returned</p>
                                    <p className="text-2xl font-black">{userData?.itemsReturned || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <TrendingUp className="h-32 w-32" />
                        </div>
                    </div>
                </div>

                {/* Sidebar - Leaderboard */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden h-full">
                        <div className="p-5 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Crown className="h-5 w-5 text-yellow-500" />
                                Community Heroes
                            </h3>
                            <Link to="/rewards" className="text-xs font-bold text-primary dark:text-blue-400 hover:underline">View All</Link>
                        </div>
                        <div className="p-4 space-y-4">
                            {leaderboard.length > 0 ? (
                                leaderboard.map((user, idx) => (
                                    <div key={user.id} className="flex items-center gap-3">
                                        <div className="relative">
                                            {(user.photoURL) ? (
                                                <img
                                                    src={user.photoURL}
                                                    alt={user.displayName}
                                                    className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-gray-700 object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-100 dark:border-gray-700">
                                                    <span className="text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                                                        {(user.displayName || 'U').charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                            <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-blue-400'
                                                }`}>
                                                {idx + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.displayName}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tighter">{user.points || 0} Points</p>
                                        </div>
                                        {idx === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-300 mx-auto" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/create-post?type=lost" className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl hover:shadow-lg transition border border-red-100 dark:border-red-900/20 group">
                    <div className="bg-red-500 text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <Search className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{t('postLostItem')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('reportLostItem')}</p>
                </Link>
                <Link to="/create-post?type=found" className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl hover:shadow-lg transition border border-green-100 dark:border-green-900/20 group">
                    <div className="bg-green-500 text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <Trophy className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{t('postFoundItem')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('helpFindItem')}</p>
                </Link>
                <Link to="/my-posts" className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl hover:shadow-lg transition border border-blue-100 dark:border-blue-900/20 group">
                    <div className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <Tag className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{t('myPosts')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('manageYourPosts')}</p>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('recentPosts')}</h2>
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="flex bg-white dark:bg-gray-800 rounded-xl shadow-sm p-1 border dark:border-gray-700">
                        {['all', 'lost', 'found', 'near_me'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filter === f
                                    ? (f === 'lost' ? 'bg-red-500 text-white' : f === 'found' ? 'bg-green-500 text-white' : 'bg-primary text-white')
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                {t(f === 'near_me' ? 'nearMe' : f)}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-1 lg:min-w-[300px]">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:text-white"
                        />
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    {t('yourLocation')}
                </h2>
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    {userLocation ? (
                        <ItemsMap items={filteredPosts} center={[userLocation.lat, userLocation.lng]} userLocation={userLocation} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-80 bg-gray-50 dark:bg-gray-900/50">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('requestingLocation')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <Loader2 className="animate-spin h-12 w-12 text-primary" />
                    </div>
                ) : filteredPosts.length > 0 ? (
                    filteredPosts.map(post => {
                        const postDate = post.date || (post.createdAt?.toDate ? post.createdAt.toDate().toISOString().split('T')[0] : '');

                        return (
                            <Link to={`/post/${post.id}`} key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group border border-gray-100 dark:border-gray-700">
                                <div className="relative h-56 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                                    {post.imageUrl ? (
                                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <Tag className="h-12 w-12 mb-2 opacity-20" />
                                            <span className="text-sm font-medium">{t('noImage')}</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${post.type === 'lost' ? 'bg-error' : 'bg-accent'}`}>
                                            {post.type}
                                        </span>
                                    </div>
                                    {post.status === 'resolved' && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs border-2 border-white">Returned</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <img
                                            src={post.creatorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                            alt={post.creatorName || 'User'}
                                            className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{post.creatorName || 'Member'}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Community Scout</p>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition">
                                        {post.title}
                                        {post.isEdited && <span className="text-[10px] font-medium text-gray-400 ml-2 italic normal-case">(Edited)</span>}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-6 h-10">{post.description}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {postDate}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <Tag className="h-3.5 w-3.5" />
                                            {post.category}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">{t('noResults')}</h3>
                        <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
                    </div>
                )}
            </div>
        </div>
    );
}
