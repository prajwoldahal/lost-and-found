import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import {
    Calendar, Tag, Trash2, MapPin, Loader2, PlusCircle,
    AlertCircle, Search, Filter, SlidersHorizontal,
    ChevronRight, Eye, MoreVertical, CheckCircle2,
    Clock, Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../context/ThemeContext';

export default function MyPosts() {
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();
    const { currentUser } = useAuth();

    // Data states
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    // ui states
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        if (!currentUser) return;
        fetchMyPosts();
    }, [currentUser]);

    const fetchMyPosts = async () => {
        setLoading(true);
        try {
            const response = await postAPI.getMyPosts();
            setPosts(response.data);
        } catch (error) {
            console.error("Failed to fetch my posts:", error);
            toast.error("Failed to load your posts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            return;
        }

        setDeletingId(postId);
        try {
            await postAPI.delete(postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
            toast.success("Post deleted successfully");
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post");
        } finally {
            setDeletingId(null);
        }
    };

    // Filter and Sort Logic
    const filteredPosts = useMemo(() => {
        let result = [...posts];

        // Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.title?.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term) ||
                p.category?.toLowerCase().includes(term)
            );
        }

        // Type Filter
        if (typeFilter !== 'all') {
            result = result.filter(p => p.type === typeFilter);
        }

        // Sorting
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [posts, searchTerm, typeFilter, sortBy]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <Package className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                </div>
                <p className="mt-6 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading your items...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Page Header */}
            <div className="relative overflow-hidden bg-primary text-white rounded-[2.5rem] p-10 shadow-2xl shadow-primary/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Your Posted Items</h1>
                        <p className="text-primary-light font-bold uppercase tracking-widest text-[10px] opacity-90">
                            Manage {posts.length} {posts.length === 1 ? 'item' : 'items'} reported by you
                        </p>
                    </div>
                    <Link
                        to="/create-post"
                        className="group bg-white text-primary hover:bg-gray-50 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 w-fit"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Post New Item
                    </Link>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
                    {/* Search Input */}
                    <div className="relative w-full lg:max-w-md group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search your items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white font-bold transition-all text-xs"
                        />
                    </div>

                    {/* Filter Tabs & Sort Selection */}
                    <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
                        <div className="flex bg-gray-50 dark:bg-gray-950/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                            {['all', 'lost', 'found'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === type
                                        ? 'bg-white dark:bg-gray-800 text-primary shadow-lg ring-1 ring-black/5'
                                        : 'text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-950/50 px-5 py-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 cursor-pointer appearance-none"
                            >
                                <option value="newest" className="dark:bg-gray-900 border-none">Newest First</option>
                                <option value="oldest" className="dark:bg-gray-900 border-none">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map(post => {
                        const postDate = new Date(post.createdAt || post.date).toLocaleDateString();

                        return (
                            <div key={post.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all flex flex-col h-full border border-gray-50 dark:border-gray-800 group relative">
                                {/* Image Container */}
                                <div className="relative h-64 bg-gray-100 dark:bg-gray-950 overflow-hidden">
                                    {post.imageUrl ? (
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700 blur-0"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-700">
                                            <Package className="h-12 w-12 opacity-20" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest mt-2">No Image Available</span>
                                        </div>
                                    )}

                                    <div className="absolute top-4 left-4 z-10">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-2xl backdrop-blur-md ${post.type === 'lost' ? 'bg-red-600/80' : 'bg-primary/80'
                                            }`}>
                                            {post.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-8 flex-1 flex flex-col bg-white dark:bg-gray-900">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 truncate group-hover:text-primary transition-colors">
                                            {post.title}
                                            {post.isEdited && <span className="text-[10px] font-bold text-gray-400 ml-2 italic lowercase tracking-normal">(Edited)</span>}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-[11px] font-medium leading-relaxed line-clamp-2">
                                            {post.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-50 dark:border-gray-800 mb-8">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date Reported</label>
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                                                <Clock className="h-3.5 w-3.5 text-primary" />
                                                {postDate}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Location</label>
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                                <span className="truncate">{post.locationName || 'Unspecified'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex items-center gap-3 mt-auto">
                                        <Link
                                            to={`/post/${post.id}`}
                                            className="flex-1 py-4 bg-gray-950 text-white dark:bg-primary dark:hover:bg-primary-dark rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-gray-800 hover:-translate-y-1 active:translate-y-0 transition-all text-center"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            to={`/edit-post/${post.id}`}
                                            className="flex-1 py-4 bg-blue-50 dark:bg-blue-900/10 text-primary dark:text-blue-400 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:-translate-y-1 active:translate-y-0 transition-all text-center border border-primary/10"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            disabled={deletingId === post.id}
                                            className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all shadow-sm flex items-center justify-center disabled:opacity-50"
                                            title="Delete Post"
                                        >
                                            {deletingId === post.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-24 text-center shadow-2xl border border-gray-100 dark:border-gray-800">
                    <div className="bg-gray-50 dark:bg-gray-950 p-10 rounded-full inline-block mb-8">
                        <Search className="h-16 w-16 text-gray-200 dark:text-gray-800" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 italic">No Items Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-sm mx-auto font-bold uppercase tracking-widest text-[10px] leading-relaxed">
                        {searchTerm
                            ? `No items matching "${searchTerm}" were found in your post history.`
                            : "You haven't posted any items yet. Start by reporting something you found or lost."
                        }
                    </p>

                    <button
                        onClick={() => { setSearchTerm(''); setTypeFilter('all'); }}
                        className="px-10 py-5 border-2 border-primary/20 hover:border-primary text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
}
