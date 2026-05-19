import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle,
    Trash2,
    Filter,
    Search as SearchIcon,
    Loader2,
    AlertCircle,
    ExternalLink,
    MoreVertical,
    X,
    MessageSquare,
    Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminPosts() {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({ open: false, post: null });
    const [deleteReason, setDeleteReason] = useState('');
    const [deleting, setDeleting] = useState(false);

    // Reject modal state
    const [rejectModal, setRejectModal] = useState({ open: false, post: null });
    const [rejectReason, setRejectReason] = useState('');
    const [rejecting, setRejecting] = useState(false);

    // Post image preview modal
    const [previewPost, setPreviewPost] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getPosts();
            setPosts(response.data || []);
        } catch (error) {
            console.error('❌ Error fetching posts:', error);
            toast.error(`${t('error')} : ` + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await adminAPI.approvePost(id);
            setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
            toast.success(t('success'));
        } catch (error) {
            toast.error(t('error'));
        }
    };

    const openDeleteModal = (post) => {
        setDeleteModal({ open: true, post });
        setDeleteReason('');
    };

    const closeDeleteModal = () => {
        setDeleteModal({ open: false, post: null });
        setDeleteReason('');
    };

    const handleDelete = async () => {
        if (!deleteModal.post) return;
        if (!deleteReason.trim()) {
            toast.error(t('error'));
            return;
        }
        try {
            setDeleting(true);
            await adminAPI.deletePost(deleteModal.post.id, deleteReason.trim());
            setPosts(prev => prev.filter(p => p.id !== deleteModal.post.id));
            toast.success(t('success'));
            closeDeleteModal();
        } catch (error) {
            toast.error(t('error'));
        } finally {
            setDeleting(false);
        }
    };

    const openRejectModal = (post) => {
        setRejectModal({ open: true, post });
        setRejectReason('');
    };

    const closeRejectModal = () => {
        setRejectModal({ open: false, post: null });
        setRejectReason('');
    };

    const handleReject = async () => {
        if (!rejectModal.post) return;
        if (!rejectReason.trim()) {
            toast.error(t('error'));
            return;
        }
        try {
            setRejecting(true);
            await adminAPI.rejectPost(rejectModal.post.id, rejectReason.trim());
            setPosts(prev => prev.filter(p => p.id !== rejectModal.post.id));
            toast.success(t('success'));
            closeRejectModal();
        } catch (error) {
            toast.error(t('error'));
        } finally {
            setRejecting(false);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesFilter = filter === 'all' || post.status === filter || post.type === filter;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            post.title?.toLowerCase().includes(q) ||
            post.creatorName?.toLowerCase().includes(q) ||
            post.category?.toLowerCase().includes(q) ||
            post.description?.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    const getStatusBadge = (status) => {
        const map = {
            active: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50',
            approved: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-950/30 dark:border-green-900/50',
            pending_approval: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50',
            resolved: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/30 dark:border-purple-900/50',
            returned: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50',
        };
        return map[status] || 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-800 dark:border-gray-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('postArchive')}</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                        {t('postsShown', { shown: filteredPosts.length, total: posts.length })}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholderAdminPosts')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm font-bold transition-all"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none pl-12 pr-10 py-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-[10px] font-black uppercase tracking-widest cursor-pointer"
                        >
                            <option value="all">{t('allPosts')}</option>
                            <option value="pending_approval">{t('pendingApproval')}</option>
                            <option value="lost">{t('lost')}</option>
                            <option value="found">{t('found')}</option>
                            <option value="active">{t('active')}</option>
                            <option value="approved">{t('approved')}</option>
                            <option value="resolved">{t('resolved')}</option>
                        </select>
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <MoreVertical className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-5">{t('itemDetails')}</th>
                                <th className="px-6 py-5">{t('contributor')}</th>
                                <th className="px-6 py-5">{t('type')}</th>
                                <th className="px-6 py-5">{t('status')}</th>
                                <th className="px-6 py-5">{t('date')}</th>
                                <th className="px-6 py-5 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition duration-150 group">
                                    {/* Post info with image preview */}
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            {post.imageUrl ? (
                                                <button
                                                    onClick={() => setPreviewPost(post)}
                                                    className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex-shrink-0 hover:scale-110 transition"
                                                    title={t('previewImage')}
                                                >
                                                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                                                </button>
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                                                    <ImageIcon className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                                                </div>
                                            )}
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition truncate max-w-[200px]">{post.title}</span>
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 truncate max-w-[200px]">{post.category}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Creator */}
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            {post.creatorPhoto ? (
                                                <img src={post.creatorPhoto} alt={post.creatorName} className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-gray-700" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                                    {(post.creatorName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">{post.creatorName || t('anonymous')}</span>
                                        </div>
                                    </td>

                                    {/* Type */}
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border transition-all ${post.type === 'lost'
                                            ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50'
                                            : 'bg-green-50 text-green-600 border-green-100 dark:bg-green-950/30 dark:border-green-900/50'}`}>
                                            {post.type === 'lost' ? t('lost') : t('found')}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border ${getStatusBadge(post.status)}`}>
                                            {post.status ? t(post.status) : t('active')}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                to={`/post/${post.id}`}
                                                className="p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-primary rounded-xl transition shadow-sm"
                                                title={t('viewPost')}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                            {(post.status === 'pending_approval' || (post.status !== 'approved' && post.status !== 'resolved' && post.status !== 'returned')) && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(post.id)}
                                                        className="p-2.5 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-600 hover:text-white dark:hover:bg-green-600 transition shadow-sm"
                                                        title={t('approve')}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openRejectModal(post)}
                                                        className="p-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 transition shadow-sm"
                                                        title={t('reject')}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => openDeleteModal(post)}
                                                className="p-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition shadow-sm"
                                                title={t('deleteWithReason')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredPosts.length === 0 && (
                        <div className="p-20 text-center text-gray-400 dark:text-gray-600">
                            <AlertCircle className="h-16 w-16 mx-auto mb-6 opacity-10" />
                            <p className="font-black uppercase tracking-widest text-[10px]">{t('noPostsMatchFilters')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete with Reason Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-red-50 dark:bg-red-950/30 px-8 py-6 border-b border-red-100 dark:border-red-900/30 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-red-100 dark:bg-red-900/40 rounded-xl">
                                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('deletePost')}</h2>
                                    <p className="text-[11px] text-red-500 dark:text-red-400 font-bold uppercase tracking-widest mt-0.5">{t('actionUndoneWarning')}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeDeleteModal}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Post Info */}
                        <div className="px-8 pt-6 pb-2">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 mb-6">
                                {deleteModal.post?.imageUrl ? (
                                    <img src={deleteModal.post.imageUrl} alt={deleteModal.post.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-black text-gray-900 dark:text-white truncate">{deleteModal.post?.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest truncate">
                                        {t('by', 'by')} {deleteModal.post?.creatorName || t('anonymous')} · {deleteModal.post?.type === 'lost' ? t('lost') : t('found')} · {deleteModal.post?.category}
                                    </p>
                                </div>
                            </div>

                            {/* Reason Input */}
                            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {t('reasonForDeletion')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                autoFocus
                                rows={4}
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder={t('deletionReasonPlaceholder')}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-white text-sm font-medium resize-none transition-all mb-2"
                            />
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mb-6">
                                {t('adminLogAccountability')}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="px-8 pb-8 flex gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition font-black text-xs uppercase tracking-widest"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting || !deleteReason.trim()}
                                className="flex-1 px-6 py-3.5 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                            >
                                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                {deleting ? t('deleting') : t('confirmDeletePost')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Post Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-amber-50 dark:bg-amber-950/30 px-8 py-6 border-b border-amber-100 dark:border-amber-900/30 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                                    <X className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('rejectPost')}</h2>
                                    <p className="text-[11px] text-amber-500 dark:text-amber-400 font-bold uppercase tracking-widest mt-0.5">{t('postWillBeDeleted')}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeRejectModal}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Post Info */}
                        <div className="px-8 pt-6 pb-2">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 mb-6">
                                {rejectModal.post?.imageUrl ? (
                                    <img src={rejectModal.post.imageUrl} alt={rejectModal.post.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-black text-gray-900 dark:text-white truncate">{rejectModal.post?.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest truncate">
                                        {t('by', 'by')} {rejectModal.post?.creatorName || t('anonymous')}
                                    </p>
                                </div>
                            </div>

                            {/* Reason Input */}
                            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {t('reasonForRejection')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                autoFocus
                                rows={4}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={t('rejectionReasonPlaceholder')}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 dark:text-white text-sm font-medium resize-none transition-all mb-2"
                            />
                        </div>

                        {/* Actions */}
                        <div className="px-8 pb-8 flex gap-3">
                            <button
                                onClick={closeRejectModal}
                                disabled={rejecting}
                                className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition font-black text-xs uppercase tracking-widest"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={rejecting || !rejectReason.trim()}
                                className="flex-1 px-6 py-3.5 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                            >
                                {rejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                {rejecting ? t('rejecting') : t('confirmReject')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewPost && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
                    onClick={() => setPreviewPost(null)}
                >
                    <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewPost(null)}
                            className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300"
                        >
                            <X className="h-8 w-8" />
                        </button>
                        <img
                            src={previewPost.imageUrl}
                            alt={previewPost.title}
                            className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                        />
                        <p className="text-white text-center mt-4 font-bold uppercase tracking-widest text-sm">{previewPost.title}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
