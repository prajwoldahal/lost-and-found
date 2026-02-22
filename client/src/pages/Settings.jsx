import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    User, Lock, Mail, Bell, Map as MapIcon, Trophy, Share2,
    Accessibility, Globe, Shield, HelpCircle, AlertTriangle,
    ChevronRight, LogOut, Trash2, Camera, Eye, EyeOff,
    Smartphone, QrCode, Sliders, Info, Loader2, Crown, Moon, Sun,
    CheckCircle, CheckCircle2, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { userAPI, notificationAPI } from '../services/api';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';
import VerifiedBadge from '../components/VerifiedBadge';

export default function Settings() {
    const { currentUser, userData, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeSection, setActiveSection] = useState('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false); // Can be removed later
    const [isVerifying, setIsVerifying] = useState(false);

    // Admin Specific States
    const [adminPasswords, setAdminPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);

    // Verification Form States
    const [verifForm, setVerifForm] = useState({
        idType: '',
        idNumber: '',
        idFile: null,
        idFileBack: null,
        previewUrl: null,
        previewUrlBack: null
    });

    // Profile states
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedProfile, setEditedProfile] = useState({
        displayName: '',
        bio: '',
        phone: '',
        dob: ''
    });
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const fileInputRef = useRef(null);

    // Mock settings state - in a real app these would be in user document
    const [settings, setSettings] = useState({
        notifications: {
            foundItems: true,
            claimAlerts: true,
            rewards: true
        },
        privacy: {
            allowMessaging: 'everyone',
            locationVisibility: true,
            qrPrivacy: 'private',
            twoFactor: false,
            showOnLeaderboard: true
        },
        map: {
            mapView: true,
            searchRadius: 10,
            autoLocation: true,
            alertsEnabled: true
        },
        accessibility: {
            fontSize: 'medium',
            highContrast: false
        }
    });

    const handleToggle = (category, setting) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [setting]: !prev[category][setting]
            }
        }));
        toast.success('Preference updated');
    };

    const handleSelectChange = (category, setting, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [setting]: value
            }
        }));
        toast.success('Setting saved');
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    const { updateProfileData } = useAuth();
    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            return toast.error('Please upload an image file');
        }
        if (file.size > 5 * 1024 * 1024) {
            return toast.error('File size must be less than 5MB');
        }

        try {
            setUploadingPhoto(true);
            const formData = new FormData();
            formData.append('photo', file);
            const result = await userAPI.uploadAvatar(currentUser.uid, formData);
            const photoURL = result.data.photoURL;
            await updateProfileData({ photoURL });
            toast.success('Profile photo updated!');
        } catch (error) {
            console.error('Photo Upload Error:', error);
            toast.error('Failed to upload photo: ' + (error.response?.data?.error || error.message));
        } finally {
            setUploadingPhoto(false);
        }
    };
    useEffect(() => {
        if (currentUser) {
            fetchUserData();
        }
    }, [currentUser]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sectionParam = params.get('section');
        if (sectionParam) {
            setActiveSection(sectionParam);
        }
    }, [location.search]);

    const fetchUserData = async () => {
        try {
            const response = await userAPI.get('me');
            setEditedProfile({
                displayName: response.data.displayName || '',
                bio: response.data.bio || '',
                phone: response.data.phone || '',
                dob: response.data.dob || ''
            });
        } catch (error) {
            console.error("Failed to fetch user settings:", error);
        }
    };

    const handleSaveProfile = async () => {
        // Validation
        if (editedProfile.phone) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(editedProfile.phone)) {
                return toast.error('Phone number must be exactly 10 digits');
            }
        }

        if (editedProfile.dob) {
            const dobDate = new Date(editedProfile.dob);
            if (dobDate > new Date()) {
                return toast.error('Date of birth cannot be in the future');
            }
        }

        try {
            await updateProfileData(editedProfile);
            toast.success('Profile updated successfully!');
            setIsEditingProfile(false);
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleAdminProfileUpdate = async (e) => {
        e && e.preventDefault();
        try {
            setIsUpdatingAdmin(true);

            // 1. Update Display Name
            if (editedProfile.displayName !== userData?.displayName) {
                await updateProfileData({ displayName: editedProfile.displayName });
            }

            // 2. Handle Password Change if requested
            if (adminPasswords.new) {
                if (adminPasswords.new !== adminPasswords.confirm) {
                    throw new Error("New passwords do not match");
                }
                if (adminPasswords.new.length < 6) {
                    throw new Error("Password must be at least 6 characters");
                }
                if (!adminPasswords.current) {
                    throw new Error("Current password required to change password");
                }

                // Re-authenticate
                const credential = EmailAuthProvider.credential(currentUser.email, adminPasswords.current);
                await reauthenticateWithCredential(currentUser, credential);

                // Update Password
                await updatePassword(currentUser, adminPasswords.new);
                setAdminPasswords({ current: '', new: '', confirm: '' });
                toast.success("Password changed successfully!");
            }

            toast.success('Admin profile updated!');
        } catch (error) {
            console.error("Admin Update Error:", error);
            const message = error.code === 'auth/wrong-password' ? "Incorrect current password" : error.message;
            toast.error(message);
        } finally {
            setIsUpdatingAdmin(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        try {
            await userAPI.delete(currentUser.uid);
            toast.success('Account deleted successfully');
            logout();
            navigate('/');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.error || 'Failed to delete account');
        } finally {
            setIsDeletingAccount(false);
            setShowDeleteModal(false);
        }
    };

    const handleVerifFileChange = (e, side = 'front') => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                return toast.error('File size must be less than 5MB');
            }

            if (side === 'back') {
                setVerifForm({
                    ...verifForm,
                    idFileBack: file,
                    previewUrlBack: URL.createObjectURL(file)
                });
            } else {
                setVerifForm({
                    ...verifForm,
                    idFile: file,
                    previewUrl: URL.createObjectURL(file)
                });
            }
        }
    };

    const handleSubmitVerification = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!verifForm.idType || !verifForm.idNumber || !verifForm.idFile) {
            return toast.error("Please complete all verification fields");
        }

        // Special validation for citizenship
        if (verifForm.idType === 'citizenship' && !verifForm.idFileBack) {
            return toast.error("Please upload both front and back sides of your citizenship certificate");
        }

        try {
            setIsVerifying(true);

            const formData = new FormData();
            formData.append('verificationPending', 'true');
            formData.append('idType', verifForm.idType);
            formData.append('idNumber', verifForm.idNumber);
            formData.append('idFront', verifForm.idFile);

            if (verifForm.idType === 'citizenship' && verifForm.idFileBack) {
                formData.append('idBack', verifForm.idFileBack);
            }

            // Update User Profile via backend (which handles Cloudinary)
            await userAPI.update(currentUser.uid, formData);

            // Sync global state using updateProfileData (triggers context update)
            // We pass the verificationPending flag to ensure UI updates immediately
            await updateProfileData({ verificationPending: true });

            toast.success("Verification submitted for review!");
            setShowVerificationModal(false); // Close modal if open

            // No need to manually setIsVerifying(false) here if we navigated or unmounted, 
            // but we are in Settings, so we might stay. 
            // If we stay, we should reset.
        } catch (error) {
            console.error("Verification Error:", error);
            const message = error.response?.data?.error || error.message || "Failed to submit verification";
            toast.error(message);
        } finally {
            setIsVerifying(false);
        }
    };

    const sections = [
        { id: 'profile', label: 'My Profile', icon: User, color: 'text-blue-600' },
        { id: 'security', label: 'Security', icon: Shield, color: 'text-red-600' },
        ...(!userData?.isAdmin ? [{ id: 'verification', label: 'Verification', icon: CheckCircle, color: 'text-primary' }] : []),
        { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-purple-600' },
        { id: 'location', label: 'Map & Alerts', icon: MapIcon },
        { id: 'rewards', label: 'Rewards', icon: Trophy },
        { id: 'accessibility', label: 'Appearance', icon: Accessibility },
        { id: 'support', label: 'Support', icon: HelpCircle },
        { id: 'danger', label: 'Danger Zone', icon: Trash2, color: 'text-red-600' }
    ];

    const renderHeader = (title, description) => (
        <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">{description}</p>
        </div>
    );

    const renderToggle = (label, description, category, setting) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className="flex-1 pr-4">
                <p className="font-bold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
            </div>
            <button
                onClick={() => handleToggle(category, setting)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings[category]?.[setting] ? 'bg-primary shadow-inner shadow-primary-dark/40' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${settings[category]?.[setting] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {renderHeader('My Profile', 'Manage your public identity')}
                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                                <div className="relative group">
                                    <div className="relative w-32 h-32">
                                        {(userData?.photoURL || currentUser?.photoURL) ? (
                                            <img
                                                src={userData?.photoURL || currentUser?.photoURL}
                                                alt={userData?.displayName}
                                                className={`w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-xl object-cover bg-white ${uploadingPhoto ? 'opacity-50' : ''}`}
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-4 border-white dark:border-gray-700">
                                                <User className="h-10 w-10 text-gray-400" />
                                            </div>
                                        )}
                                        {uploadingPhoto && <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingPhoto}
                                        className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-20"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex-1 space-y-6 w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Display Name</label>
                                            <input
                                                type="text"
                                                value={editedProfile.displayName}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                                placeholder="Your Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={editedProfile.phone}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                                placeholder="Phone"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={editedProfile.dob}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, dob: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Profile Bio</label>
                                        <textarea
                                            value={editedProfile.bio}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all resize-none"
                                            rows="3"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="px-10 py-3.5 bg-primary text-white rounded-2xl hover:bg-primary-dark transition font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group ${userData?.isAdmin ? 'md:col-span-2' : ''}`}>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Total Points</p>
                                <p className="text-4xl font-black text-primary mt-2">{userData?.points || 0}</p>
                                <Trophy className="absolute top-6 right-6 h-12 w-12 text-primary/10 group-hover:scale-110 transition duration-300" />
                            </div>
                            {!userData?.isAdmin && (
                                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Verification Status</p>
                                    <div className="mt-2 flex items-center gap-3">
                                        {userData?.isVerified ? (
                                            <>
                                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                                <span className="text-lg font-black text-green-600 uppercase tracking-tight">Verified</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="h-6 w-6 text-amber-500" />
                                                <span className="text-lg font-black text-amber-600 uppercase tracking-tight">Unverified</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {renderHeader('Security Settings', 'Manage your account security and password')}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            <h3 className="font-extrabold text-lg mb-6 flex items-center gap-3 dark:text-white">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <Lock className="h-5 w-5 text-red-600" />
                                </div>
                                Account Security
                            </h3>
                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                                            <Mail className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900 dark:text-white">Change Email Address</p>
                                            <p className="text-xs text-gray-400">Current: {userData?.email}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </button>
                                <button className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                                            <Lock className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900 dark:text-white">Update Password</p>
                                            <p className="text-xs text-gray-400">Change your login credentials</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            <h3 className="font-extrabold mb-6 text-gray-900 dark:text-white">Advanced Security</h3>
                            {renderToggle('Two-Factor Auth', 'Require code on every sign-in attempt', 'privacy', 'twoFactor')}
                            {renderToggle('Login Alerts', 'Get notified about new login sessions', 'notifications', 'loginAlerts')}
                        </div>
                    </div>
                );

            case 'verification':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {renderHeader('Account Verification', 'Verify your ID to unlock all community features')}

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-10 text-center shadow-xl">
                            {userData?.isVerified ? (
                                <div className="py-10 space-y-6">
                                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/40 rounded-[2rem] flex items-center justify-center mx-auto text-green-600">
                                        <CheckCircle2 className="h-12 w-12" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase">Your ID is Verified</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm font-medium">
                                        Thank you for verifying your identity. You now have full access to claim items and participate in our rewards system.
                                    </p>
                                </div>
                            ) : userData?.verificationPending ? (
                                <div className="py-10 space-y-6">
                                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/40 rounded-[2rem] flex items-center justify-center mx-auto text-blue-600">
                                        <Loader2 className="h-12 w-12 animate-spin" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase block">Verification Pending</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm font-medium">
                                        We are currently reviewing your documents. You'll be notified as soon as your account is verified.
                                    </p>
                                </div>
                            ) : (
                                <div className="py-6 space-y-6">
                                    <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary shadow-2xl">
                                        <Shield className="h-12 w-12" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase">Verify Your Identity</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm font-medium leading-relaxed">
                                        To protect our users and prevent fraud, we require ID verification to claim items.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto text-left py-8 border-t border-gray-100 dark:border-gray-700 mt-8">
                                        <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                                            <div className="h-8 w-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-primary font-black">1</div>
                                            <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-tight">Upload ID Photo</p>
                                        </div>
                                        <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                                            <div className="h-8 w-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-primary font-black">2</div>
                                            <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-tight">Wait for Review</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmitVerification} className="space-y-8 text-left max-w-2xl mx-auto border-t border-gray-100 dark:border-gray-700 pt-10 mt-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">ID Type</label>
                                                <select
                                                    value={verifForm.idType}
                                                    onChange={(e) => setVerifForm({ ...verifForm, idType: e.target.value })}
                                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all text-sm"
                                                    required
                                                >
                                                    <option value="">Select ID Type...</option>
                                                    <option value="passport">Passport</option>
                                                    <option value="citizenship">Citizenship Certificate</option>
                                                    <option value="nationalId">National ID Card</option>
                                                    <option value="drivingLicense">Driving License</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">ID Number</label>
                                                <input
                                                    type="text"
                                                    value={verifForm.idNumber}
                                                    onChange={(e) => setVerifForm({ ...verifForm, idNumber: e.target.value })}
                                                    placeholder="Enter ID Number"
                                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
                                                    {verifForm.idType === 'citizenship' ? 'Front Side ID Photo' : 'Upload ID Photo'}
                                                </label>
                                                <div
                                                    className={`relative border-2 border-dashed rounded-[2rem] p-8 transition-all text-center group ${verifForm.previewUrl
                                                        ? 'border-primary/50 bg-primary/5'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary bg-gray-50 dark:bg-gray-900'
                                                        }`}
                                                >
                                                    <input
                                                        type="file"
                                                        id="settings-id-upload-front"
                                                        accept="image/*"
                                                        onChange={(e) => handleVerifFileChange(e, 'front')}
                                                        className="hidden"
                                                        required={!verifForm.previewUrl}
                                                    />
                                                    <label htmlFor="settings-id-upload-front" className="cursor-pointer">
                                                        {verifForm.previewUrl ? (
                                                            <div className="space-y-4">
                                                                <img src={verifForm.previewUrl} className="h-40 w-auto object-cover rounded-xl shadow-lg mx-auto" alt="Preview Front" />
                                                                <p className="text-primary font-black uppercase tracking-widest text-[10px]">Click to Replace</p>
                                                            </div>
                                                        ) : (
                                                            <div className="py-4">
                                                                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                                                <p className="font-bold text-gray-900 dark:text-white text-xs mb-1">Click to Upload Front Photo</p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">JPG, PNG (max 5MB)</p>
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>

                                            {verifForm.idType === 'citizenship' && (
                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Back Side ID Photo</label>
                                                    <div
                                                        className={`relative border-2 border-dashed rounded-[2rem] p-8 transition-all text-center group ${verifForm.previewUrlBack
                                                            ? 'border-primary/50 bg-primary/5'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary bg-gray-50 dark:bg-gray-900'
                                                            }`}
                                                    >
                                                        <input
                                                            type="file"
                                                            id="settings-id-upload-back"
                                                            accept="image/*"
                                                            onChange={(e) => handleVerifFileChange(e, 'back')}
                                                            className="hidden"
                                                            required={verifForm.idType === 'citizenship' && !verifForm.previewUrlBack}
                                                        />
                                                        <label htmlFor="settings-id-upload-back" className="cursor-pointer">
                                                            {verifForm.previewUrlBack ? (
                                                                <div className="space-y-4">
                                                                    <img src={verifForm.previewUrlBack} className="h-40 w-auto object-cover rounded-xl shadow-lg mx-auto" alt="Preview Back" />
                                                                    <p className="text-primary font-black uppercase tracking-widest text-[10px]">Click to Replace</p>
                                                                </div>
                                                            ) : (
                                                                <div className="py-4">
                                                                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                                                    <p className="font-bold text-gray-900 dark:text-white text-xs mb-1">Click to Upload Back Photo</p>
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">JPG, PNG (max 5MB)</p>
                                                                </div>
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isVerifying}
                                            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {isVerifying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                                            Submit for Verification
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {renderHeader('Notification Settings', 'Control how and when you receive alerts')}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            <h3 className="font-extrabold mb-6 text-gray-900 dark:text-white">Item Activity</h3>
                            {renderToggle('Found Items', 'Someone finds an item matching your search', 'notifications', 'foundItems')}
                            {renderToggle('Claim Updates', 'Status changes on your item claims', 'notifications', 'claimAlerts')}
                            {renderToggle('Direct Messages', 'When someone sends you a property inquiry', 'privacy', 'allowMessaging')}
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            <h3 className="font-extrabold mb-6 text-gray-900 dark:text-white">Community & Rewards</h3>
                            {renderToggle('Reward Alerts', 'Getting points or climbing leaderboard', 'notifications', 'rewards')}
                            {renderToggle('Security Alerts', 'Unusual activity detected on your account', 'notifications', 'securityAlerts')}
                        </div>
                    </div>
                );

            case 'privacy':
                return (
                    <div className="space-y-8">
                        {renderHeader('Privacy & Controls', 'Choose who sees your activity and location')}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            <h3 className="font-black mb-6 text-gray-900 dark:text-white">Direct Messaging</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Who can message you?</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {['everyone', 'verified', 'none'].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => handleSelectChange('privacy', 'allowMessaging', opt)}
                                                className={`py-3 rounded-xl text-xs font-bold capitalize border transition-all ${settings.privacy.allowMessaging === opt
                                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                    : 'bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            <h3 className="font-black mb-6 text-gray-900 dark:text-white">Visibility</h3>
                            {renderToggle('Location Visibility', 'Show approximate item location on map', 'privacy', 'locationVisibility')}
                            {renderToggle('Show Points', 'Display your total points on profile', 'privacy', 'showPoints')}
                        </div>
                    </div>
                );

            case 'location':
                return (
                    <div className="space-y-6">
                        {renderHeader('Area Alerts', 'Get notified about items found near you')}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            <h3 className="font-black mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <Bell className="h-5 w-5 text-primary" />
                                Smart Neighborhood Alerts
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl mb-8 border border-blue-100 dark:border-blue-900/20">
                                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                                    Enable this to get real-time alerts when someone reports a lost/found item within your custom watch area.
                                </p>
                            </div>

                            {renderToggle('Enable Watch Zone', 'Push notifications for items in your area', 'map', 'alertsEnabled')}

                            <div className="py-8 border-t border-gray-100 dark:border-gray-700 mt-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Watch Radius</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Distance around your alert location</p>
                                    </div>
                                    <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                                        <span className="text-primary font-black text-2xl">{settings.map.searchRadius}</span>
                                        <span className="text-primary text-xs font-bold ml-1 uppercase">km</span>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={settings.map.searchRadius}
                                    onChange={(e) => handleSelectChange('map', 'searchRadius', parseInt(e.target.value))}
                                    className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[10px] font-black text-gray-400 mt-3 uppercase tracking-widest">
                                    <span>Precise (1km)</span>
                                    <span>Wide (50km)</span>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={() => {
                                        if (navigator.geolocation) {
                                            toast.loading("detecting area...");
                                            navigator.geolocation.getCurrentPosition(
                                                (pos) => {
                                                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                                    handleSelectChange('map', 'watchLocation', loc);
                                                    userAPI.update('me', { alertLocation: loc, alertRadius: settings.map.searchRadius });
                                                    toast.dismiss();
                                                    toast.success("Alert zone updated Successfully!");
                                                },
                                                () => {
                                                    toast.dismiss();
                                                    toast.error("Location access required");
                                                }
                                            );
                                        }
                                    }}
                                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-950 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition shadow-xl"
                                >
                                    <MapIcon className="h-5 w-5" />
                                    SET CURRENT LOCATION AS WATCH ZONE
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            <h3 className="font-black mb-6 text-gray-900 dark:text-white uppercase tracking-widest text-xs">Map Experience</h3>
                            {renderToggle('Default to Map', 'Open map by default in dashboard', 'map', 'mapView')}
                            {renderToggle('GPS Auto-follow', 'Follow my movements in real-time', 'map', 'autoLocation')}
                        </div>
                    </div>
                );

            case 'rewards':
                return (
                    <div className="space-y-8">
                        {renderHeader('Community Rewards', 'View your progress and community impact')}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-primary text-white rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                                <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-2 opacity-80">Accumulated Points</p>
                                <h3 className="text-6xl font-black tracking-tighter">{userData?.points || 0}</h3>
                                <div className="mt-10 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-xl inline-flex items-center gap-3 border border-white/20">
                                    <Trophy className="h-6 w-6 text-yellow-300" />
                                    <span className="text-sm font-black uppercase tracking-tight">Master Finder</span>
                                </div>
                                <div className="absolute -bottom-8 -right-8 opacity-10">
                                    <Crown className="h-48 w-48" />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-10 flex flex-col justify-center shadow-xl">
                                <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Returns</p>
                                <h3 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{userData?.itemsReturned || 0}</h3>
                                <p className="text-gray-400 text-sm mt-2">Successful item recoveries</p>
                                <Link to="/rewards" className="mt-10 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl text-primary dark:text-blue-400 text-sm font-black hover:bg-primary hover:text-white transition text-center uppercase tracking-widest">
                                    Open Leaderboard
                                </Link>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            {renderToggle('Global Leaderboard', 'Compete with others publicly', 'privacy', 'showOnLeaderboard')}
                        </div>
                    </div>
                );

            case 'accessibility':
                return (
                    <div className="space-y-8">
                        {renderHeader('Personalization', 'Fine-tune the interface for your comfort')}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            <h3 className="font-black mb-6 text-gray-900 dark:text-white uppercase tracking-widest text-xs">Language</h3>
                            <button
                                onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'np' : 'en')}
                                className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <Globe className="h-6 w-6 text-primary" />
                                    <span className="font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight">System Language</span>
                                </div>
                                <span className="bg-primary text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg shadow-primary/30 uppercase">{i18n.language === 'en' ? 'English' : 'Nepali'}</span>
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            <h3 className="font-black mb-8 text-gray-900 dark:text-white uppercase tracking-widest text-xs">Visual Accessibility</h3>
                            <div className="space-y-8">
                                <div className="py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <p className="font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Interface Scale</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['small', 'medium', 'large'].map(size => (
                                            <button
                                                key={size}
                                                onClick={() => handleSelectChange('accessibility', 'fontSize', size)}
                                                className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${settings.accessibility.fontSize === size
                                                    ? 'bg-primary text-white border-primary shadow-xl shadow-primary/30'
                                                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {renderToggle('High Contrast', 'Maximized color distinction', 'accessibility', 'highContrast')}
                                <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 font-outfit">
                                    <div className="flex-1 pr-4">
                                        <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">Dark Mode</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Switch between light and dark visual themes</p>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`relative inline-flex h-9 w-16 items-center rounded-2xl transition-all duration-300 focus:outline-none ${isDarkMode ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    >
                                        <div
                                            className={`flex items-center justify-center h-7 w-7 transform rounded-xl bg-white shadow-md transition-all duration-500 ${isDarkMode ? 'translate-x-8 rotate-[360deg]' : 'translate-x-1'}`}
                                        >
                                            {isDarkMode ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-yellow-500" />}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'support':
                return (
                    <div className="space-y-4">
                        {renderHeader('Community Support', 'Resources and legal documentation')}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
                            {[
                                { label: 'Help Center & FAQs', icon: Info },
                                { label: 'Report a Problem', icon: AlertTriangle },
                                { label: 'Terms and Conditions', icon: Shield },
                                { label: 'Privacy Policy', icon: Lock }
                            ].map((item, idx) => (
                                <button
                                    key={idx}
                                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                                            <item.icon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.label}</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 transition" />
                                </button>
                            ))}
                        </div>
                        <div className="text-center py-12">
                            <p className="text-[10px] font-black tracking-[0.4em] text-gray-400 uppercase opacity-50">Lost & Found Global v2.0</p>
                        </div>
                    </div>
                );

            case 'danger':
                return (
                    <div className="space-y-8">
                        {renderHeader('Critical Actions', 'Manage your account permanence')}
                        <div className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/20 rounded-[2.5rem] p-10 shadow-2xl shadow-red-100 dark:shadow-none">
                            <div className="flex items-start gap-5 p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20 mb-10">
                                <div className="p-3 bg-red-600 rounded-2xl text-white">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-black text-red-800 dark:text-red-400 mb-1">DATA PURGE WARNING</p>
                                    <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                                        Terminating your account is permanent. All your contributions, history, and records will be deleted from our community database instantly.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full flex items-center justify-between p-6 border-2 border-red-100 dark:border-red-900/50 rounded-3xl hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition duration-300 group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl group-hover:bg-white/20 transition">
                                        <Trash2 className="h-7 w-7 text-red-600 group-hover:text-white" />
                                    </div>
                                    <span className="font-black uppercase tracking-wider">Terminate My Membership</span>
                                </div>
                                <ChevronRight className="h-6 w-6 text-red-400 group-hover:text-white transition group-hover:translate-x-1" />
                            </button>
                        </div>

                        {/* Delete Confirmation Modal */}
                        {showDeleteModal && (
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 text-left">
                                <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl max-w-md w-full p-10 border border-gray-100 dark:border-gray-700 scale-in-center">
                                    <div className="text-center mb-10">
                                        <div className="bg-red-100 dark:bg-red-900/30 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-12">
                                            <Trash2 className="h-12 w-12 text-red-600" />
                                        </div>
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Final Step</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            Confirm you want to erase all your data from the community.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isDeletingAccount}
                                            className="w-full bg-red-600 text-white py-5 rounded-2xl font-black hover:bg-red-700 transition flex items-center justify-center gap-3 shadow-2xl shadow-red-500/30"
                                        >
                                            {isDeletingAccount ? <Loader2 className="h-6 w-6 animate-spin" /> : "YES, DELETE PERMANENTLY"}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="w-full py-5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-black hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                        >
                                            CANCEL ACTION
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    if (userData?.isAdmin) {
        return (
            <div className="max-w-4xl mx-auto pb-24 px-4">
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Admin Profile Settings</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your administrative identity and security</p>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[3rem] shadow-2xl overflow-hidden p-10 md:p-16">
                    <form onSubmit={handleAdminProfileUpdate} className="space-y-10">
                        {/* Name Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                <User className="h-6 w-6 text-primary" />
                                Admin Identity
                            </h2>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Admin Name</label>
                                <input
                                    type="text"
                                    value={editedProfile.displayName}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                    placeholder="Enter Admin Name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                <Lock className="h-6 w-6 text-red-500" />
                                Security Credentials
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={adminPasswords.current}
                                            onChange={(e) => setAdminPasswords({ ...adminPasswords, current: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                                        <input
                                            type="password"
                                            value={adminPasswords.new}
                                            onChange={(e) => setAdminPasswords({ ...adminPasswords, new: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                            placeholder="Enter New Password"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={adminPasswords.confirm}
                                            onChange={(e) => setAdminPasswords({ ...adminPasswords, confirm: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                            placeholder="Confirm New Password"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isUpdatingAdmin}
                                className="w-full py-5 bg-primary text-white rounded-2xl hover:bg-primary-dark transition font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isUpdatingAdmin ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Update Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-24 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Settings</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Personalize your community experience</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-80 shrink-0">
                    <nav className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-none sticky top-24">
                        <div className="p-4 space-y-2">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all duration-500 text-sm font-black uppercase tracking-tight ${activeSection === section.id
                                        ? 'bg-primary text-white shadow-2xl shadow-primary/40 scale-[1.02]'
                                        : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <section.icon className={`h-6 w-6 ${activeSection === section.id ? 'text-white' : section.color || 'inherit'}`} />
                                    {section.label}
                                    {activeSection === section.id && <div className="w-2 h-2 bg-white rounded-full ml-auto animate-pulse" />}
                                </button>
                            ))}
                        </div>
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1 min-w-0">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-3xl rounded-[4rem] border border-white dark:border-gray-700 shadow-2xl flex flex-col min-h-[800px] transition-all duration-700">
                        <div className="p-12 flex-1">
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
