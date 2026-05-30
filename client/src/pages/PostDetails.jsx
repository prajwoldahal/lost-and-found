// File: PostDetails.jsx
// Description: Post Details Page: Displays full description, photos, scannable QRs, Leaflet maps, and claim buttons for one specific post.

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postAPI, chatAPI, userAPI, claimAPI, blockAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    Calendar, MapPin, Tag, User, MessageCircle, Share2,
    AlertCircle, ChevronLeft, Loader2, Map as MapIcon,
    CheckCircle2, Clock, MapIcon as MapMarker, Shield,
    QrCode, X, AlertTriangle, Send, Download, FileCheck, Package, Info, Camera, Trash2
} from 'lucide-react';
import { generateReturnReceipt } from '../utils/pdfGenerator';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';
import VerifiedBadge from '../components/VerifiedBadge';
import IDVerificationModal from '../components/IDVerificationModal';
import QRGenerator from '../components/QRGenerator';
import ReportPostModal from '../components/ReportPostModal';
import ReportUserModal from '../components/ReportUserModal';
import ConfirmDialog from '../components/ConfirmDialog';

// Fix for default Leaflet markers not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// React Component: Renders the PostDetails user interface elements dynamically
export default function PostDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const { t } = useTranslation();

    const [post, setPost] = useState(null);
    const [creator, setCreator] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimEvidence, setClaimEvidence] = useState('');
    const [claimImages, setClaimImages] = useState([]);
    const [claimImagePreviews, setClaimImagePreviews] = useState([]);
    const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [hasChat, setHasChat] = useState(false);
    const [chatStatus, setChatStatus] = useState(null); // 'pending' or 'active'
    const [showMessageRequestModal, setShowMessageRequestModal] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [sendingRequest, setSendingRequest] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showReportUserModal, setShowReportUserModal] = useState(false);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [isBlockedByMe, setIsBlockedByMe] = useState(false);
    const [isBlockedByOther, setIsBlockedByOther] = useState(false);
    const [isBlocking, setIsBlocking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        const fetchPostAndCreator = async () => {
            try {
                setLoading(true);
                const postResponse = await postAPI.getOne(id);
                const postData = postResponse.data;
                setPost(postData);

                // Fetch creator details
                if (postData.createdBy) {
                    try {
                        const creatorResponse = await userAPI.get(postData.createdBy);
                        setCreator(creatorResponse.data);
                    } catch (err) {
                        console.error("Failed to fetch creator:", err);
                    }
                }
            } catch (err) {
                console.error("Post details error:", err);
                setError(err.response?.data?.error || "Post not found");
                toast.error("Failed to load post details");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPostAndCreator();
    }, [id]);

    // Update creator if it's the current user and userData changes (e.g. photo sync)
    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        if (currentUser && creator && currentUser.uid === creator.uid && userData) {
            setCreator(prev => ({ ...prev, ...userData }));
        }
    }, [userData, currentUser, creator?.uid]);

    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        // Check for existing chat
        const checkExistingChat = async () => {
            if (!currentUser || !id) return;
            try {
                const response = await chatAPI.getChats();
                const existingChat = response.data.find(c => c.postId === id);
                if (existingChat) {
                    setHasChat(true);
                    setChatStatus(existingChat.status);
                }
            } catch (err) {
                console.error("Failed to check existing chats", err);
            }
        };

        if (id && currentUser) checkExistingChat();
    }, [id, currentUser]);

    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        const checkBlock = async () => {
            if (!currentUser || !post?.createdBy) return;
            try {
                const response = await blockAPI.checkStatus(post.createdBy);
                setIsBlockedByMe(response.data.blockedByMe);
                setIsBlockedByOther(response.data.blockedByOther);
            } catch (err) {
                console.error("Failed to check block status:", err);
            }
        };
        if (post?.createdBy && currentUser) checkBlock();
    }, [post?.createdBy, currentUser]);

    const handleShare = async () => {
        try {
            await navigator.share({
                title: post.title,
                text: post.description,
                url: window.location.href,
            });
        } catch (err) {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            toast.success(t('linkCopied', 'Link copied to clipboard!'));
        }
    };

    const [isContacting, setIsContacting] = useState(false);

    // ... (keep existing state)

    const handleContact = async () => {
        if (!currentUser) {
            toast.error(t('loginToContact', 'Please login to contact the owner'));
            navigate('/login');
            return;
        }

        if (currentUser.uid === post.createdBy) {
            toast.error(t('ownPostError', 'This is your own post!'));
            return;
        }

        if (hasChat) {
            try {
                setIsContacting(true);
                const response = await chatAPI.getChats();
                const chat = response.data.find(c => c.postId === id);
                if (chat) {
                    navigate(`/messages?chatId=${chat.id}`);
                } else {
                    navigate('/messages');
                }
            } catch (error) {
                console.error("Failed to get chats:", error);
                navigate('/messages');
            } finally {
                setIsContacting(false);
            }
            return;
        }

        setShowMessageRequestModal(true);
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        if (!requestMessage.trim()) return;

        try {
            setSendingRequest(true);
            const response = await chatAPI.createChat({
                recipientId: post.createdBy,
                postId: post.id,
                postTitle: post.title,
                message: requestMessage
            });

            if (response.data.message === 'Chat already exists') {
                navigate(`/messages?chatId=${response.data.id}`);
            } else {
                toast.success(t('messageRequestSent', 'Message request sent!'));
                setShowMessageRequestModal(false);
                navigate(`/messages`);
            }
        } catch (error) {
            console.error("Failed to send request:", error);
            toast.error(error.response?.data?.error || t('messageRequestError', 'Failed to send message request'));
        } finally {
            setSendingRequest(false);
        }
    };

    const handleBlockUser = async () => {
        if (!currentUser) {
            toast.error(t('loginToBlock', 'Please login to block users'));
            return;
        }

        if (!window.confirm(t('confirmBlock', 'Are you sure you want to block this user? You will no longer see their posts or be able to chat with them.'))) {
            return;
        }

        try {
            setIsBlocking(true);
            await blockAPI.block(post.createdBy);
            setIsBlockedByMe(true);
            toast.success(t('userBlocked', 'User blocked successfully'));
            // Optionally redirect to dashboard since the post should be hidden now
            navigate('/dashboard');
        } catch (error) {
            console.error("Block Error:", error);
            toast.error(t('blockError', 'Failed to block user'));
        } finally {
            setIsBlocking(false);
        }
    };

    const handleDeletePost = async () => {
        try {
            setIsDeleting(true);
            await postAPI.delete(post.id);
            toast.success(t('postDeleted', 'Post deleted successfully'));
            setShowDeleteConfirm(false);
            navigate('/dashboard');
        } catch (error) {
            console.error('Delete post error:', error);
            toast.error(t('deletePostError', 'Failed to delete post'));
            setIsDeleting(false);
        }
    };

    const handleClaim = async () => {
        if (isClaiming) return;

        if (!currentUser) {
            toast.error(t('loginToClaim', 'Please login to claim an item'));
            navigate('/login');
            return;
        }

        if (!userData?.isVerified) {
            toast.error(t('verificationRequiredToClaim', 'Account verification required to claim items'));
            navigate('/settings?section=verification');
            return;
        }

        setIsClaiming(true);
        setTimeout(() => {
            setShowClaimModal(true);
            setIsClaiming(false);
        }, 100);
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (claimImages.length + files.length > 5) {
            return toast.error(t('maxImagesError', 'Maximum 5 evidence images allowed'));
        }

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setClaimImages(prev => [...prev, ...files]);
        setClaimImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setClaimImages(prev => prev.filter((_, i) => i !== index));
        setClaimImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const submitClaim = async () => {
        if (!claimEvidence.trim()) {
            return toast.error(t('provideEvidenceError', 'Please provide ownership evidence'));
        }

        try {
            setIsSubmittingClaim(true);
            const formData = new FormData();
            formData.append('postId', id);
            formData.append('itemTitle', post.title);
            formData.append('message', claimEvidence);

            claimImages.forEach(image => {
                formData.append('evidence', image);
            });

            await claimAPI.create(formData);
            toast.success(t('claimSubmitted', 'Claim submitted successfully!'));
            setShowClaimModal(false);
            setClaimEvidence('');
            setClaimImages([]);
            setClaimImagePreviews([]);
        } catch (error) {
            console.error("Claim Error:", error);
            toast.error(t('claimError', 'Failed to submit claim'));
        } finally {
            setIsSubmittingClaim(false);
        }
    };


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-gray-500 font-medium tracking-wide">{t('fetchingItemDetails', 'Fetching item details...')}</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('postNotFound', 'Oops! Post Not Found')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">{error || t('postNotFoundDesc', 'The post you are looking for might have been deleted.')}</p>
                <Link to="/dashboard" className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2">
                    <ChevronLeft className="h-5 w-5" />
                    {t('backToFeed', 'Back to Feed')}
                </Link>
            </div>
        );
    }

    const postDate = new Date(post.createdAt).toLocaleDateString();

    return (
        <div className="min-h-screen bg-background dark:bg-gray-950 transition-colors duration-500 py-6 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-3 text-textSecondary dark:text-gray-400 hover:text-primary transition-all font-bold group"
                    >
                        <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:-translate-x-1">
                            <ChevronLeft className="h-5 w-5" />
                        </div>
                        <span className="uppercase tracking-widest text-xs">{t('returnToFeed', 'Return to Feed')}</span>
                    </button>
                    <div className="flex gap-3">
                        {post.status === 'resolved' && (
                            <button
                                onClick={() => generateReturnReceipt(post, userData)}
                                className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl shadow-sm hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 transition hover:shadow-md flex items-center gap-2"
                                title={t('downloadReceipt', 'Download Return Receipt')}
                            >
                                <FileCheck className="h-5 w-5" />
                                <span className="text-sm font-bold hidden sm:inline">{t('receipt', 'Receipt')}</span>
                            </button>
                        )}
                        <button
                            onClick={() => setShowQRModal(true)}
                            className="p-3 bg-surface dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:border-primary hover:text-primary transition hover:shadow-md dark:text-gray-300"
                            title={t('downloadQR', 'Generate QR Code')}
                        >
                            <QrCode className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-3 bg-surface dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:border-primary hover:text-primary transition hover:shadow-md dark:text-gray-300"
                            title={t('sharePost', 'Share Post')}
                        >
                            <Share2 className="h-5 w-5" />
                        </button>

                        {currentUser && currentUser.uid === post.createdBy && (
                            <Link
                                to={`/edit-post/${post.id}`}
                                className="p-3 bg-blue-50 dark:bg-blue-900/10 text-primary dark:text-blue-400 border border-primary/20 rounded-xl shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/20 transition hover:shadow-md flex items-center gap-2"
                                title="Edit Post"
                            >
                                <Camera className="h-5 w-5" />
                                <span className="text-sm font-bold hidden sm:inline">Edit</span>
                            </Link>
                        )}
                        {currentUser && currentUser.uid === post.createdBy && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isDeleting}
                                className="p-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100/50 rounded-xl shadow-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition hover:shadow-md flex items-center gap-2 disabled:opacity-50"
                                title="Delete Post"
                            >
                                {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                                <span className="text-sm font-bold hidden sm:inline">Delete</span>
                            </button>
                        )}

                        {currentUser && currentUser.uid !== post.createdBy && (
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:border-red-500 hover:text-red-500 transition hover:shadow-md dark:text-gray-400"
                                title="Report Post"
                            >
                                <AlertTriangle className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {showQRModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                                <button
                                    onClick={() => setShowQRModal(false)}
                                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Scan to View Item</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Share this posted item with others</p>
                                </div>

                                <div className="flex justify-center mb-4">
                                    <QRGenerator value={
                                        window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')
                                            ? window.location.href.replace('localhost', import.meta.env.VITE_LOCAL_IP || 'localhost').replace('127.0.0.1', import.meta.env.VITE_LOCAL_IP || '127.0.0.1')
                                            : window.location.href
                                    } />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700">
                            {/* Main Media Display */}
                            <div className="relative aspect-video bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center overflow-hidden">
                                {post.imageUrls?.length > 0 || post.videoUrls?.length > 0 ? (
                                    <>
                                        {/* Determine what to show based on selectedMediaIndex */}
                                        {(() => {
                                            const allMedia = [
                                                ...(post.imageUrls || []).map(url => ({ url, type: 'image' })),
                                                ...(post.videoUrls || []).map(url => ({ url, type: 'video' }))
                                            ];
                                            const current = allMedia[selectedMediaIndex] || allMedia[0];

                                            if (!current) return null;

                                            if (current.type === 'video') {
                                                return (
                                                    <video
                                                        src={current.url}
                                                        controls
                                                        className="w-full h-full object-contain"
                                                    />
                                                );
                                            }
                                            return (
                                                <img
                                                    src={current.url}
                                                    alt={post.title}
                                                    className="w-full h-full object-contain"
                                                />
                                            );
                                        })()}
                                    </>
                                ) : post.imageUrl ? (
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-700">
                                        <Package className="h-20 w-20 mb-4 opacity-20" />
                                        <p className="font-black uppercase tracking-widest text-xs">{t('noMediaAttached', 'No media attached')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Media Thumbnails */}
                            {((post.imageUrls?.length || 0) + (post.videoUrls?.length || 0)) > 1 && (
                                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2 overflow-x-auto">
                                    {[
                                        ...(post.imageUrls || []).map(url => ({ url, type: 'image' })),
                                        ...(post.videoUrls || []).map(url => ({ url, type: 'video' }))
                                    ].map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedMediaIndex(index)}
                                            className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${selectedMediaIndex === index ? 'border-primary scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            {item.type === 'video' ? (
                                                <div className="w-full h-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                                    <Camera className="h-6 w-6 text-gray-400" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-6 h-6 bg-primary/80 rounded-full flex items-center justify-center">
                                                            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img src={item.url} className="w-full h-full object-cover" alt={`Thumb ${index}`} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl ${post.type === 'lost' ? 'bg-error shadow-error/20' : 'bg-primary shadow-primary/20'}`}>
                                    {post.type}
                                </span>
                                <span className="bg-gray-100 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-gray-200 dark:border-gray-700">
                                    {post.category}
                                </span>
                                <div className="ml-auto flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                    <Clock className="h-4 w-4" />
                                    <p>{t('reported', 'Reported')} {postDate}</p>
                                </div>
                            </div>

                            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight uppercase leading-tight">
                                {post.title}
                                {post.isEdited && <span className="text-xs font-bold text-gray-400 ml-3 italic normal-case low tracking-tight">{t('edited', '(Edited)')}</span>}
                            </h1>

                            <div className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                <p className="text-base font-medium whitespace-pre-wrap">{post.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-950/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl shadow-md text-primary ring-4 ring-primary/5">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em]">{t('discoveryDate', 'Discovery Date')}</p>
                                        <p className="font-black text-gray-900 dark:text-white text-lg tracking-tight">{post.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl shadow-md text-primary ring-4 ring-primary/5">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em]">{t('lastKnownLocation', 'Last Known Location')}</p>
                                        <p className="font-black text-gray-900 dark:text-white text-lg tracking-tight truncate max-w-[200px]">{post.locationName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {post.location && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <MapMarker className="h-4 w-4 text-primary" />
                                    </div>
                                    {t('itemLocation', 'Item Location')}
                                </h3>
                                <div className="h-[300px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                                    <MapContainer center={[post.location.lat, post.location.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={[post.location.lat, post.location.lng]}>
                                            <Popup>
                                                <div className="font-black text-primary uppercase tracking-tight">{post.title}</div>
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 sticky top-4">
                            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{t('originalPoster', 'Original Poster')}</h3>

                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50 dark:border-gray-700/50">
                                <img
                                    src={creator?.photoURL || post.creatorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    alt={creator?.displayName || post.creatorName}
                                    className="w-16 h-16 rounded-[1.25rem] object-cover ring-4 ring-gray-50 dark:ring-gray-900 shadow-xl"
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{creator?.displayName || post.creatorName || t('anonymous', 'Anonymous')}</h4>
                                        {(creator?.isVerified || post.createdBy === 'mock-admin') && <VerifiedBadge verified={true} size="h-4 w-4" />}
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('divisionMember', 'Division Member')}</p>
                                </div>
                                {currentUser?.uid !== post.createdBy && (
                                    <button
                                        onClick={() => setShowReportUserModal(true)}
                                        className="ml-auto p-2 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                        title="Report User"
                                    >
                                        <AlertTriangle className="h-4 w-4" />
                                    </button>
                                )}
                                {currentUser?.uid !== post.createdBy && !isBlockedByMe && (
                                    <button
                                        onClick={handleBlockUser}
                                        disabled={isBlocking}
                                        className="p-2 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                        title={t('blockUser', 'Block User')}
                                    >
                                        {isBlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                                    </button>
                                )}
                            </div>

                            {
                                currentUser?.uid !== post.createdBy ? (
                                    <div className="space-y-5">
                                        {hasChat && chatStatus === 'pending' ? (
                                            <button
                                                disabled
                                                className="w-full bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 cursor-not-allowed border border-gray-200 dark:border-gray-800"
                                            >
                                                <Clock className="h-5 w-5" />
                                                {t('transmissionPending', 'Transmission Pending')}
                                            </button>
                                        ) : hasChat && chatStatus === 'active' ? (
                                            <button
                                                onClick={handleContact}
                                                disabled={isContacting}
                                                className="w-full bg-primary text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isContacting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
                                                {t('messageOwner', 'Message Owner')}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleContact}
                                                disabled={isContacting}
                                                className="w-full bg-primary text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isContacting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
                                                {t('sendMessageRequest', 'Send Message Request')}
                                            </button>
                                        )}
                                        <button
                                            onClick={handleClaim}
                                            disabled={isClaiming}
                                            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-950 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition shadow-2xl disabled:opacity-50"
                                        >
                                            {isClaiming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                                            {post?.type === 'found' ? t('claimItem', 'Claim Item') : t('reportFoundItem', 'Report Found Item')}
                                        </button>
                                        <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl text-center border border-primary/10">
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-relaxed">
                                                {t('encryptedCoordination', 'Encrypted coordination via Internal Messaging')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[1.5rem] border border-blue-100 dark:border-blue-800 text-center">
                                        <Shield className="h-6 w-6 text-primary mx-auto mb-3" />
                                        <p className="text-primary text-[10px] font-black uppercase tracking-widest leading-relaxed">{t('youAreAuthor', 'You are the author of this record')}</p>
                                    </div>
                                )
                            }
                        </div>

                        {/* Safety Tips */}
                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20">
                            <h4 className="font-black text-red-600 dark:text-red-400 text-[10px] mb-3 flex items-center gap-2 uppercase tracking-wider">
                                <AlertCircle className="h-4 w-4" />
                                {t('safetyTips', 'Safety Tips')}
                            </h4>
                            <ul className="text-[10px] font-bold uppercase tracking-wide text-red-900/60 dark:text-red-400/60 space-y-2 leading-relaxed">
                                <li className="flex gap-2"><span>•</span> {t('safetyTip1', 'Meet in designated public safety zones')}</li>
                                <li className="flex gap-2"><span>•</span> {t('safetyTip2', 'Verify identity through independent witnesses')}</li>
                                <li className="flex gap-2"><span>•</span> {t('safetyTip3', 'Maintain all records within the system')}</li>
                                <li className="flex gap-2"><span>•</span> {t('safetyTip4', 'Report suspicious activities immediately')}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <IDVerificationModal
                    isOpen={showVerificationModal}
                    onClose={() => setShowVerificationModal(false)}
                    onConfirm={() => {
                        setShowVerificationModal(false);
                        // Optionally refresh post data or show a more specific message
                    }}
                    item={post}
                />

                <ReportPostModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    postId={post.id}
                    postTitle={post.title}
                />

                {/* Message Request Modal */}
                {
                    showMessageRequestModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">{t('sendMessageRequest', 'Send Message Request')}</h3>
                                    <button onClick={() => setShowMessageRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleSendRequest}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('message', 'Message')}</label>
                                        <textarea
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
                                            placeholder={`${t('messagePlaceholder', 'Hi I found your')} ${post.title}...`}
                                            value={requestMessage}
                                            onChange={(e) => setRequestMessage(e.target.value)}
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('recipientMustAccept', 'The recipient will need to accept your request before you can chat freely.')}
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={sendingRequest || !requestMessage.trim()}
                                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {sendingRequest ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                {t('sending', 'Sending...')}
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                {t('sendRequest', 'Send Request')}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                }
            </div>

            <ConfirmDialog 
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeletePost}
                title={t('deletePostTitle', 'Delete Post')}
                message={t('deletePostMessage', 'Are you sure you want to delete this post? This action cannot be undone.')}
                confirmText={t('delete', 'Delete')}
                isLoading={isDeleting}
            />

            {/* Claim Submission Modal */}
            {showClaimModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
                        <div className="p-10">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('claimItemTitle', 'Claim Item')}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{t('provideOwnershipDetails', 'Provide details to verify ownership')}</p>
                                </div>
                                <button
                                    onClick={() => setShowClaimModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    <X className="h-6 w-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/10">
                                    <div className="flex items-center gap-3 text-primary mb-2">
                                        <Info className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t('ownershipTip', 'Ownership Tip')}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                        {t('ownershipTipDesc', 'Provide specific details that only the owner would know, such as unique marks, contents of a bag, or serial numbers not shown in photos.')}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('ownershipEvidence', 'Ownership Evidence')}</label>
                                    <textarea
                                        value={claimEvidence}
                                        onChange={(e) => setClaimEvidence(e.target.value)}
                                        placeholder={t('describeYourItem', 'Describe your item in detail...')}
                                        className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white font-bold transition-all text-sm h-32 resize-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('photoEvidence', 'Photo Evidence (Optional, Max 5)')}</label>
                                    <div className="grid grid-cols-5 gap-3">
                                        {claimImagePreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 dark:border-gray-800">
                                                <img src={preview} className="w-full h-full object-cover" alt={`Evidence ${index + 1}`} />
                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {claimImages.length < 5 && (
                                            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition group">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    className="hidden"
                                                />
                                                <Camera className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowClaimModal(false)}
                                        className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        {t('cancel', 'Cancel')}
                                    </button>
                                    <button
                                        onClick={submitClaim}
                                        disabled={isSubmittingClaim}
                                        className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingClaim ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        {t('submitClaim', 'Submit Claim')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ReportPostModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                postId={id}
                postTitle={post?.title}
            />

            <ReportUserModal
                isOpen={showReportUserModal}
                onClose={() => setShowReportUserModal(false)}
                userId={post.createdBy}
                userName={creator?.displayName || post.creatorName}
            />
        </div>
    );
}

