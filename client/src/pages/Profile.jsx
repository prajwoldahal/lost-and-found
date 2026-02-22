import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, userAPI } from '../services/api';
import VerifiedBadge from '../components/VerifiedBadge';
import IDVerificationModal from '../components/IDVerificationModal';
import { User, Mail, Phone, Edit2, Save, X, Award, Package, CheckCircle, Calendar, MapPin, Camera, Loader2, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Profile() {
    return <Navigate to="/settings?section=profile" replace />;
    const { currentUser, userData, loading: authLoading, updateProfileData, logout } = useAuth();
    const currentUserId = currentUser?.uid;
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Deletion states
    const [deletingPostId, setDeletingPostId] = useState(null);

    const [userPosts, setUserPosts] = useState([]);
    const [claimHistory, setClaimHistory] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        displayName: '',
        bio: '',
        phone: '',
        dob: ''
    });

    // Check for verify query parameter
    useEffect(() => {
        if (searchParams.get('verify') === 'true') {
            setShowVerificationModal(true);
            searchParams.delete('verify');
            setSearchParams(searchParams);
        }
    }, [searchParams, setSearchParams]);

    // Update editedData when userData is loaded
    useEffect(() => {
        if (userData) {
            setEditedData({
                displayName: userData.displayName || userData.name || '',
                bio: userData.bio || '',
                phone: userData.phone || '',
                dob: userData.dob || ''
            });
        }
    }, [userData]);

    // Fetch user posts and claims
    useEffect(() => {
        const fetchData = async () => {
            if (!currentUserId) return;

            try {
                // Fetch posts created by user
                const postsResponse = await postAPI.getOne(`user/${currentUserId}`); // Assuming this exists or using a filter
                // Actually postAPI has getMyPosts and getAll
                const myPostsResponse = await postAPI.getMyPosts();
                setUserPosts(myPostsResponse.data);

                // Fetch claims (posts claimed by user)
                const claimsResponse = await postAPI.getAll({ claimedBy: currentUserId });
                const claims = claimsResponse.data.map(doc => ({
                    ...doc,
                    status: 'returned'
                }));
                setClaimHistory(claims);

            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [currentUserId]);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            return toast.error('Please upload an image file');
        }
        if (file.size > 2 * 1024 * 1024) {
            return toast.error('File size must be less than 2MB');
        }

        try {
            setUploading(true);
            const storageRef = ref(storage, `profile_photos/${currentUserId}`);
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);
            await updateProfileData({ photoURL });
            toast.success('Profile photo updated!');
        } catch (error) {
            console.error('Photo Upload Error:', error);
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            await updateProfileData(editedData);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleCancel = () => {
        setEditedData({
            displayName: userData?.displayName || userData?.name || '',
            bio: userData?.bio || '',
            phone: userData?.phone || '',
            dob: userData?.dob || ''
        });
        setIsEditing(false);
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) return;

        setDeletingPostId(postId);
        try {
            await postAPI.delete(postId);
            setUserPosts(prev => prev.filter(p => p.id !== postId));
            toast.success("Post deleted successfully");
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post");
        } finally {
            setDeletingPostId(null);
        }
    };

    const formatDate = (dateStr, timestamp) => {
        if (dateStr) return dateStr;
        if (timestamp?.toDate) return timestamp.toDate().toLocaleDateString();
        return '';
    };

    const calculateAge = (dobString) => {
        if (!dobString) return null;
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = calculateAge(userData?.dob);

    if (authLoading || (currentUserId && loadingData)) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="text-center py-20 text-gray-800 dark:text-gray-200">
                <h2 className="text-2xl font-black uppercase tracking-tight">Profile Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">We couldn't load your profile data. Please try logging in again.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-10 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />

            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-[2rem] p-10 shadow-2xl relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <User className="h-64 w-64" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black flex items-center gap-4 uppercase tracking-tighter">
                        <User className="h-10 w-10 text-blue-200" />
                        My Profile
                    </h1>
                    <p className="text-blue-100 mt-2 font-bold opacity-80 uppercase tracking-widest text-xs">Manage your identity and community presence</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl dark:shadow-none overflow-hidden relative border border-gray-100 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-900/50 h-40 border-b border-gray-100 dark:border-gray-700"></div>
                <div className="px-8 md:px-12 pb-12">
                    <div className="flex flex-col md:flex-row gap-8 -mt-20">
                        {/* Avatar */}
                        <div className="relative group self-center md:self-start">
                            <div className="relative w-40 h-40">
                                <img
                                    src={userData?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    alt={userData?.displayName}
                                    className={`w-40 h-40 rounded-full border-8 border-white dark:border-gray-800 shadow-2xl object-cover bg-white ${uploading ? 'opacity-50' : ''}`}
                                />
                                {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="absolute bottom-2 right-2 bg-primary text-white p-3 rounded-full shadow-2xl hover:bg-primary-dark transition disabled:opacity-50 transform hover:scale-110 active:scale-95 z-20"
                                    title="Change Photo"
                                >
                                    <Camera className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 mt-6 md:mt-24">
                            {isEditing ? (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Display Name</label>
                                            <input
                                                type="text"
                                                value={editedData.displayName}
                                                onChange={(e) => setEditedData({ ...editedData, displayName: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                                placeholder="Your Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={editedData.phone}
                                                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                                placeholder="Phone"
                                            />
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    value={editedData.dob}
                                                    onChange={(e) => setEditedData({ ...editedData, dob: e.target.value })}
                                                    disabled={userData?.isVerified}
                                                    className={`w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all ${userData?.isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                />
                                                {userData?.isVerified && <p className="text-[10px] text-primary font-black uppercase tracking-widest ml-1 mt-1">Locked (Verified Identity)</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Profile Bio</label>
                                        <textarea
                                            value={editedData.bio}
                                            onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all resize-none"
                                            rows="4"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                                        <button onClick={handleSave} className="flex-1 md:flex-none px-10 py-3.5 bg-primary text-white rounded-2xl hover:bg-primary-dark transition flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"><Save className="h-4 w-4" />Save Profile</button>
                                        <button onClick={handleCancel} className="flex-1 md:flex-none px-10 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs"><X className="h-4 w-4" />Discard</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                        <div className="space-y-2">
                                            <div className="flex items-center flex-wrap gap-4">
                                                <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                                    {userData?.displayName} {age && <span className="text-primary-light">({age})</span>}
                                                </h2>
                                                {userData?.isVerified && (
                                                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/40 text-primary dark:text-blue-300 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800 shadow-sm ring-4 ring-blue-500/5">
                                                        <VerifiedBadge verified={true} size="h-4 w-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Verified Identity</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed max-w-2xl">{userData?.bio || "Community member since " + formatDate(null, userData?.createdAt)}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-sm"><Edit2 className="h-4 w-4" />Edit Profile</button>
                                            {!userData?.isVerified && <button onClick={() => setShowVerificationModal(true)} className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition flex items-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"><Shield className="h-4 w-4" />Verify Identity</button>}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 font-bold text-xs uppercase tracking-tight shadow-sm"><Mail className="h-4 w-4 text-primary" />{currentUser?.email || userData?.email}</div>
                                        {userData?.phone && <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 font-bold text-xs uppercase tracking-tight shadow-sm"><Phone className="h-4 w-4 text-primary" />{userData.phone}</div>}
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 font-bold text-xs uppercase tracking-tight shadow-sm"><Calendar className="h-4 w-4 text-primary" />Joined {formatDate(null, userData?.createdAt)}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl dark:shadow-none border border-gray-100 dark:border-gray-700 border-l-8 border-l-primary relative overflow-hidden group">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest leading-none">Total Points</p>
                            <p className="text-4xl font-black text-primary mt-2">{userData?.points || 0}</p>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-2xl transform group-hover:scale-110 transition duration-300"><Award className="h-8 w-8 text-primary" /></div>
                    </div>
                    <Link to="/rewards" className="text-[10px] text-primary hover:text-primary-dark font-black uppercase tracking-widest mt-4 inline-block translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300">View Leaderboard →</Link>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl dark:shadow-none border border-gray-100 dark:border-gray-700 border-l-8 border-l-purple-500 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest leading-none">Posts Created</p>
                            <p className="text-4xl font-black text-purple-600 mt-2">{userPosts.length}</p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-2xl transform group-hover:scale-110 transition duration-300"><Package className="h-8 w-8 text-purple-600" /></div>
                    </div>
                    <div className="h-4"></div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl dark:shadow-none border border-gray-100 dark:border-gray-700 border-l-8 border-l-green-500 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest leading-none">Items Claimed</p>
                            <p className="text-4xl font-black text-green-600 mt-2">{claimHistory.length}</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-2xl transform group-hover:scale-110 transition duration-300"><CheckCircle className="h-8 w-8 text-green-600" /></div>
                    </div>
                    <div className="h-4"></div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl dark:shadow-none p-8 md:p-10 border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-10 flex items-center gap-4 uppercase tracking-tight">
                    <Package className="h-8 w-8 text-primary" />
                    My Recent Posts
                </h2>
                {userPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userPosts.map(post => (
                            <div key={post.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition group bg-white">
                                <Link to={`/post/${post.id}`} className="block">
                                    <div className="h-40 bg-gray-200 relative">
                                        {post.imageUrl ? <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>}
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <span className={`px-2 py-1 rounded text-xs font-bold text-white shadow-sm ${post.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>{post.type.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{post.title}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.description}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3 w-3" />{post.locationName || "Unknown Location"}</div>
                                    </div>
                                </Link>
                                <div className="px-4 pb-4 pt-2 border-t flex justify-end">
                                    <button
                                        onClick={() => handleDeletePost(post.id)}
                                        disabled={deletingPostId === post.id}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                                    >
                                        {deletingPostId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl"><Package className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>No posts yet</p><Link to="/create-post" className="text-primary hover:underline mt-2 inline-block font-medium">Create your first post →</Link></div>}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl dark:shadow-none p-8 md:p-10 border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-4 uppercase tracking-tight">
                    <CheckCircle className="h-8 w-8 text-primary" />
                    Claim History
                </h2>
                {claimHistory.length > 0 ? (
                    <div className="space-y-4">
                        {claimHistory.map(claim => (
                            <div key={claim.id} className="border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg transition flex flex-col sm:flex-row justify-between items-start sm:items-center group bg-gray-50/50 dark:bg-gray-900/40">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-primary transition uppercase tracking-tight">{claim.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">
                                        Claimed on • <span className="text-gray-900 dark:text-gray-200">{formatDate(null, claim.updatedAt)}</span>
                                    </p>
                                </div>
                                <span className="px-4 py-1.5 rounded-full text-[10px] font-black bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 uppercase tracking-[0.2em] border border-green-200 dark:border-green-900/30 mt-4 sm:mt-0">{claim.status}</span>
                            </div>
                        ))}
                    </div>
                ) : <div className="text-center py-16 text-gray-500 dark:text-gray-600 border-4 border-dashed border-gray-50 dark:border-gray-900 rounded-[2rem]"><CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-20" /><p className="font-black uppercase tracking-widest text-sm">No claim history yet</p></div>}
            </div>

            <IDVerificationModal
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                onConfirm={() => {
                    setShowVerificationModal(false);
                }}
                isAccountVerification={true}
                item={{ title: 'Account Verification', category: 'Identity Verification', locationName: 'Profile' }}
            />
        </div>
    );
}
