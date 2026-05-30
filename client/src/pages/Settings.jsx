// File: Settings.jsx
// Description: Settings Page: Secure dashboard to edit display names, upload profile avatars, request email modifications, and delete accounts.

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    User, Lock, Mail, Bell, Map as MapIcon, MapPin, Trophy, Share2,
    Accessibility, Globe, Shield, HelpCircle, AlertTriangle,
    ChevronRight, LogOut, Trash2, Camera, Eye, EyeOff,
    Smartphone, QrCode, Sliders, Info, Loader2, Crown, Moon, Sun,
    CheckCircle, CheckCircle2, Save, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { userAPI, notificationAPI, blockAPI } from '../services/api';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';
import VerifiedBadge from '../components/VerifiedBadge';

// React Component: Renders the Settings user interface elements dynamically
export default function Settings() {
    const { currentUser, userData, logout, updateProfileData, updateUserEmail } = useAuth();
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
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loadingBlocked, setLoadingBlocked] = useState(false);

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
        dob: '',
        email: ''
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
    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        if (currentUser) {
            fetchUserData();
            fetchBlockedUsers();
        }
    }, [currentUser]);

    const fetchBlockedUsers = async () => {
        if (userData?.isAdmin) return;
        try {
            setLoadingBlocked(true);
            const response = await blockAPI.getList();
            setBlockedUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch blocked users:", error);
        } finally {
            setLoadingBlocked(false);
        }
    };

    const handleUnblock = async (userId) => {
        try {
            await blockAPI.unblock(userId);
            setBlockedUsers(prev => prev.filter(u => u.uid !== userId));
            toast.success(t('userUnblocked', 'User unblocked successfully'));
        } catch (error) {
            console.error("Unblock Error:", error);
            toast.error(t('unblockError', 'Failed to unblock user'));
        }
    };

    // Side Effect: This code block executes automatically when this page mounts on the user screen
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
                dob: response.data.dob || '',
                email: response.data.email || ''
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
            // Check if email has changed
            if (editedProfile.email && editedProfile.email !== userData?.email) {
                await updateUserEmail(editedProfile.email);
                toast.success('Verification email sent to ' + editedProfile.email + '. Please verify to complete the change.');
            }

            // Update other profile data (excluding email which is handled by Firebase Auth)
            const { email, ...otherData } = editedProfile;
            await updateProfileData(otherData);
            
            toast.success('Profile updated successfully!');
            setIsEditingProfile(false);
        } catch (error) {
            console.error('Profile Update Error:', error);
            const message = error.code === 'auth/requires-recent-login' 
                ? 'Please log out and log back in to change your email address for security reasons.'
                : error.message || 'Failed to update profile';
            toast.error(message);
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
            setShowVerificationForm(false);

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
        { id: 'profile', label: t('myProfile'), icon: User, color: 'text-blue-600' },
        { id: 'security', label: t('security'), icon: Shield, color: 'text-red-600' },
        ...(!userData?.isAdmin ? [{ id: 'verification', label: t('verification'), icon: CheckCircle, color: 'text-primary' }] : []),
        { id: 'notifications', label: t('notifications'), icon: Bell, color: 'text-purple-600' },
        { id: 'location', label: t('mapAndAlerts'), icon: MapIcon },
        { id: 'rewards', label: t('rewards'), icon: Trophy },
        ...(!userData?.isAdmin ? [{ id: 'blocked', label: t('blockedUsers', 'Blocked Users'), icon: Shield, color: 'text-gray-600' }] : []),
        { id: 'support', label: t('support'), icon: HelpCircle },
        { id: 'danger', label: t('dangerZone'), icon: Trash2, color: 'text-red-600' }
    ];

    const renderHeader = (title, description) => (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{title}</h2>
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
                    <div className="space-y-12">
                        {renderHeader(t('myProfile'), t('managePublicIdentity'))}

                        <div className="flex flex-col md:flex-row gap-12 items-start">
                            <div className="relative group mx-auto md:mx-0">
                                <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-md relative">
                                    {userData?.photoURL ? (
                                        <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-20 w-20 text-primary opacity-20" />
                                        </div>
                                    )}
                                    {isEditingProfile && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingPhoto}
                                            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <Camera className="h-8 w-8 mb-2" />
                                            <span className="text-xs font-bold">{uploadingPhoto ? t('processing') : t('uploadImage')}</span>
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                                {userData?.isVerified && (
                                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <VerifiedBadge />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-8 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{t('displayName')}</label>
                                        <input
                                            type="text"
                                            value={editedProfile.displayName}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                                            disabled={!isEditingProfile}
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all disabled:opacity-50"
                                            placeholder={t('enterName')}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{t('phoneNumber')}</label>
                                        <input
                                            type="tel"
                                            value={editedProfile.phone}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                            disabled={!isEditingProfile}
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all disabled:opacity-50"
                                            placeholder="98XXXXXXXX"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{t('dateOfBirth')}</label>
                                        <input
                                            type="date"
                                            value={editedProfile.dob}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, dob: e.target.value })}
                                            disabled={!isEditingProfile}
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{t('emailAddress')}</label>
                                        {isEditingProfile ? (
                                            <div className="relative group">
                                                <input
                                                    type="email"
                                                    value={editedProfile.email}
                                                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                                    placeholder={t('emailAddress')}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-500 font-bold flex items-center gap-3 overflow-hidden">
                                                <Mail className="h-4 w-4 flex-shrink-0" />
                                                <span className="break-all">{userData?.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{t('profileBio')}</label>
                                    <textarea
                                        rows="4"
                                        value={editedProfile.bio}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                        disabled={!isEditingProfile}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all disabled:opacity-50 resize-none"
                                        placeholder={t('tellUsAboutYourself')}
                                    />
                                </div>

                                <div className="pt-6">
                                    {isEditingProfile ? (
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleSaveProfile}
                                                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-xs hover:bg-primary-dark transition shadow-sm"
                                            >
                                                {t('saveChanges')}
                                            </button>
                                            <button
                                                onClick={() => setIsEditingProfile(false)}
                                                className="px-10 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                            >
                                                {t('cancel')}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditingProfile(true)}
                                            className="w-full md:w-auto px-12 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-xs transition"
                                        >
                                            {t('editProfile')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-gray-100 dark:border-gray-700">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('totalPoints')}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{userData?.points || 0}</p>
                                </div>
                                <div className="bg-primary/10 p-3 rounded-xl">
                                    <Trophy className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('verificationStatus')}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${userData?.isVerified ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            {userData?.isVerified ? t('verified') : t('unverified')}
                                        </p>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl ${userData?.isVerified ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                                    <Shield className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-12">
                        {renderHeader(t('securitySettings'), t('manageAccountSecurity'))}

                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 shadow-sm space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight flex items-center gap-3">
                                    <Lock className="h-5 w-5 text-red-500" />
                                    {t('accountSecurity')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition group border border-gray-100 dark:border-gray-800">
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900 dark:text-white text-xs tracking-wider mb-1">{t('changeEmailAddress')}</p>
                                            <p className="text-xs text-gray-500 font-bold">{t('currentEmail')} {userData?.email}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const section = document.getElementById('update-password-section');
                                            section?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition group border border-gray-100 dark:border-gray-800"
                                    >
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900 dark:text-white text-xs tracking-wider mb-1">{t('updatePassword')}</p>
                                            <p className="text-xs text-gray-500 font-bold">{t('changeLoginCredentials')}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition" />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight flex items-center gap-3">
                                    <Smartphone className="h-5 w-5 text-blue-500" />
                                    {t('advancedSecurity')}
                                </h3>
                                <div className="space-y-2">
                                    {renderToggle(t('twoFactorAuth'), t('twoFactorAuthDesc'), 'privacy', 'twoFactor')}
                                    {renderToggle(t('loginAlerts'), t('loginAlertsDesc'), 'privacy', 'loginAlerts')}
                                </div>
                            </div>
                        </div>

                        <div id="update-password-section" className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-8">
                            <h3 className="text-lg font-bold text-red-900 dark:text-red-400 mb-8 tracking-tight">{t('updatePassword')}</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-red-800 dark:text-red-400 ml-1">{t('currentPassword')}</label>
                                        <input
                                            type="password"
                                            className="w-full px-6 py-4 bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white font-bold"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-red-800 dark:text-red-400 ml-1">{t('newPassword')}</label>
                                        <input
                                            type="password"
                                            className="w-full px-6 py-4 bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white font-bold"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition shadow-sm">
                                    {t('updatePassword')}
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'verification':
                return (
                    <div className="space-y-8">
                        {renderHeader(t('accountVerification'), t('Verify ID To Unlock Features'))}

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center shadow-sm">
                            {userData?.isVerified ? (
                                <div className="space-y-6">
                                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center mx-auto text-green-600">
                                        <CheckCircle2 className="h-12 w-12" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('yourIdVerified')}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm font-medium">
                                        {t('verifiedThankYou')}
                                    </p>
                                </div>
                            ) : userData?.verificationPending ? (
                                <div className="space-y-6">
                                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mx-auto text-blue-600">
                                        <Loader2 className="h-12 w-12 animate-spin" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white block">{t('verificationPending')}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm font-medium">
                                        {t('verificationReview')}
                                    </p>
                                </div>
                            ) : !showVerificationForm ? (
                                <div className="space-y-10">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                            <Shield className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('verifyYourIdentity')}</h3>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm font-medium">
                                                {t('verifyIdProtection')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowVerificationForm(true)}
                                        className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition shadow-sm"
                                    >
                                        {t('clickToVerify')}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                            <Shield className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('verifyYourIdentity')}</h3>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm font-medium">
                                                {t('verifyIdProtection')}
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmitVerification} className="max-w-xl mx-auto space-y-8 text-left">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{t('idType')}</label>
                                                <select
                                                    value={verifForm.idType}
                                                    onChange={(e) => setVerifForm({ ...verifForm, idType: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all appearance-none"
                                                >
                                                    <option value="">{t('selectIdTypeLabel')}</option>
                                                    <option value="passport">{t('passport')}</option>
                                                    <option value="citizenship">{t('citizenshipCertificate')}</option>
                                                    <option value="national_id">{t('nationalIdCard')}</option>
                                                    <option value="license">{t('drivingLicense')}</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{t('idNumber')}</label>
                                                <input
                                                    type="text"
                                                    value={verifForm.idNumber}
                                                    onChange={(e) => setVerifForm({ ...verifForm, idNumber: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                                    placeholder={t('enterIdNumberLabel')}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">
                                                    {verifForm.idType === 'citizenship' ? t('frontSideIdPhoto') : t('uploadIdPhotoLabel')}
                                                </label>
                                                <div
                                                    onClick={() => !isVerifying && document.getElementById('id-front').click()}
                                                    className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${verifForm.previewUrl ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}
                                                >
                                                    {verifForm.previewUrl ? (
                                                        <>
                                                            <img src={verifForm.previewUrl} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                                                <span className="text-white font-bold text-xs">{t('clickToReplace')}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Camera className="h-10 w-10 text-gray-300 mb-2" />
                                                            <span className="text-xs font-bold text-gray-400">{t('clickToUploadFrontPhoto')}</span>
                                                            <span className="text-xs text-gray-400 mt-1">{t('jpgPngMax')}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    id="id-front"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleVerifFileChange(e, 'front')}
                                                />
                                            </div>

                                            {verifForm.idType === 'citizenship' && (
                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{t('backSideIdPhoto')}</label>
                                                    <div
                                                        onClick={() => !isVerifying && document.getElementById('id-back').click()}
                                                        className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${verifForm.previewUrlBack ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}
                                                    >
                                                        {verifForm.previewUrlBack ? (
                                                            <>
                                                                <img src={verifForm.previewUrlBack} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                                                    <span className="text-white font-bold text-xs">{t('clickToReplace')}</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Camera className="h-10 w-10 text-gray-300 mb-2" />
                                                                <span className="text-xs font-bold text-gray-400">{t('clickToUploadBackPhoto')}</span>
                                                                <span className="text-xs text-gray-400 mt-1">{t('jpgPngMax')}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input
                                                        id="id-back"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleVerifFileChange(e, 'back')}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                disabled={isVerifying}
                                                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {isVerifying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                                                {t('submitForVerification')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowVerificationForm(false)}
                                                className="px-10 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                            >
                                                {t('cancel')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-12">
                        {renderHeader(t('notificationSettings'), t('controlAlerts'))}

                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
                            <div className="p-8 space-y-8">
                                <section>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight flex items-center gap-3">
                                        <Bell className="h-5 w-5 text-purple-500" />
                                        {t('itemActivity')}
                                    </h3>
                                    <div className="space-y-2">
                                        {renderToggle(t('foundItemsNotif'), t('foundItemsNotifDesc'), 'notifications', 'foundItems')}
                                        {renderToggle(t('claimUpdates'), t('claimUpdatesDesc'), 'notifications', 'claimAlerts')}
                                        {renderToggle(t('directMessages'), t('directMessagesDesc'), 'notifications', 'messages')}
                                    </div>
                                </section>

                                <section className="pt-10 border-t border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                        {t('communityAndRewards')}
                                    </h3>
                                    <div className="space-y-2">
                                        {renderToggle(t('rewardAlerts'), t('rewardAlertsDesc'), 'notifications', 'rewards')}
                                        {renderToggle(t('securityAlerts'), t('securityAlertsDesc'), 'notifications', 'security')}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                );

            case 'privacy':
                return (
                    <div className="space-y-8">
                        {renderHeader(t('privacyAndControls'), t('choosePrivacy'))}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
                            <h3 className="font-bold mb-6 text-gray-900 dark:text-white tracking-tight">{t('directMessaging')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-3">{t('whoCanMessage')}</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {['everyone', 'verifiedOnly', 'none'].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => handleSelectChange('privacy', 'allowMessaging', opt)}
                                                className={`py-3 rounded-xl text-xs font-bold border transition-all ${settings.privacy.allowMessaging === opt
                                                    ? 'bg-primary text-white border-primary shadow-sm'
                                                    : 'bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700'
                                                    }`}
                                            >
                                                {t(opt)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
                            <h3 className="font-bold mb-6 text-gray-900 dark:text-white tracking-tight">{t('visibility')}</h3>
                            {renderToggle(t('locationVisibility'), t('locationVisibilityDesc'), 'privacy', 'locationVisibility')}
                            {renderToggle(t('showPoints'), t('showPointsDesc'), 'privacy', 'showPoints')}
                        </div>
                    </div>
                );

            case 'location':
                return (
                    <div className="space-y-12">
                        {renderHeader(t('mapAndAlerts'), t('manageExperience'))}

                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 shadow-sm space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-emerald-500" />
                                    {t('mapExperience')}
                                </h3>
                                <div className="space-y-2">
                                    {renderToggle(t('gpsPrecision'), t('gpsPrecisionDesc'), 'location', 'highPrecision')}
                                    {renderToggle(t('areaAlerts'), t('areaAlertsDesc'), 'location', 'areaAlerts')}
                                    {renderToggle(t('privacyZone'), t('privacyZoneDesc'), 'location', 'privacyZone')}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'rewards':
                return (
                    <div className="space-y-12">
                        {renderHeader(t('rewards'), t('accumulatedPoints'))}

                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                        {t('contributionStats')}
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                            <span className="font-bold text-gray-500 dark:text-gray-400 text-xs">{t('itemsReturned')}</span>
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{userData?.itemsReturned || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'blocked':
                return (
                    <div className="space-y-8">
                        {renderHeader(t('blockedUsers', 'Blocked Users'), t('manageBlockedUsersDesc', 'Users you have blocked will not be able to message you or see your posts.'))}

                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                            {loadingBlocked ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                    <p className="text-gray-500 text-xs font-bold">{t('loading', 'Loading...')}</p>
                                </div>
                            ) : blockedUsers.length === 0 ? (
                                <div className="text-center py-16">
                                    <Shield className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{t('noBlockedUsers', 'No Blocked Users')}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium max-w-xs mx-auto">{t('noBlockedUsersDesc', 'When you block someone, they will appear here.')}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {blockedUsers.map((user) => (
                                        <div key={user.uid} className="flex items-center justify-between py-6 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                                    alt={user.displayName}
                                                    className="w-12 h-12 rounded-2xl object-cover shadow-sm"
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white tracking-tight">{user.displayName || 'User'}</p>
                                                    <p className="text-xs text-gray-500 font-bold">{t('blockedOn', 'Blocked')}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUnblock(user.uid)}
                                                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
                                            >
                                                {t('unblock', 'Unblock')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );



            case 'support':
                return (
                    <div className="space-y-8">
                        {renderHeader(t('support'), t('communitySupport'))}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                            {[
                                { label: t('helpAndFaq'), icon: HelpCircle, desc: t('commonQuestions') },
                                { label: t('reportAProblem'), icon: AlertTriangle, desc: t('reportProblemDesc') },
                                { label: t('legalAndPolicies'), icon: Shield, desc: t('privacyAndTerms') },
                                { label: t('legalDisclaimer'), icon: Lock, desc: t('reviewLegal') }
                            ].map((item, idx) => (
                                <button
                                    key={idx}
                                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                                            <item.icon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <div className="text-left">
                                            <span className="font-bold text-gray-900 dark:text-white tracking-tight block">{item.label}</span>
                                            <span className="text-xs text-gray-400 font-bold">{item.desc}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 transition" />
                                </button>
                            ))}
                        </div>
                        <div className="text-center py-12">
                            <p className="text-xs font-bold text-gray-400 opacity-50">{t('appName')} Global v2.0</p>
                        </div>
                    </div>
                );

            case 'danger':
                return (
                    <div className="space-y-8">
                        {renderHeader(t('criticalActions'), t('dangerZoneDesc'))}
                        <div className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/20 rounded-2xl p-8 shadow-sm">
                            <div className="flex items-start gap-5 p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 mb-6">
                                <div className="p-3 bg-red-600 rounded-2xl text-white">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-red-800 dark:text-red-400 mb-1">{t('dataPurgeWarning')}</p>
                                    <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                                        {t('deleteAccountWarning')}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full flex items-center justify-between p-6 border-2 border-red-100 dark:border-red-900/50 rounded-2xl hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition duration-300 group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl group-hover:bg-white/20 transition">
                                        <Trash2 className="h-7 w-7 text-red-600 group-hover:text-white" />
                                    </div>
                                    <span className="font-bold tracking-wider">{t('Delete My Account')}</span>
                                </div>
                                <ChevronRight className="h-6 w-6 text-red-400 group-hover:text-white transition group-hover:translate-x-1" />
                            </button>
                        </div>

                        {/* Delete Confirmation Modal */}
                        {showDeleteModal && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-left">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm max-w-md w-full p-8 border border-gray-100 dark:border-gray-700">
                                    <div className="text-center mb-6">
                                        <div className="bg-red-100 dark:bg-red-900/30 w-24 h-24 rounded-xl flex items-center justify-center mx-auto mb-6">
                                            <Trash2 className="h-12 w-12 text-red-600" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{t('finalStep')}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            {t('deleteAccountConfirm')}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isDeletingAccount}
                                            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition flex items-center justify-center gap-3 shadow-sm"
                                        >
                                            {isDeletingAccount ? <Loader2 className="h-6 w-6 animate-spin" /> : t('yesDeletePermanently')}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                        >
                                            {t('cancelAction')}
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminProfileSettings')}</h1>
                    <p className="text-gray-400 font-bold text-xs mt-2">{t('adminIdentityDesc')}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden p-8 md:p-16">
                    <form onSubmit={handleAdminProfileUpdate} className="space-y-10">
                        {/* Name Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                                <User className="h-6 w-6 text-primary" />
                                {t('adminIdentity')}
                            </h2>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{t('adminName')}</label>
                                <input
                                    type="text"
                                    value={editedProfile.displayName}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                    placeholder={t('enterAdminName')}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                                <Lock className="h-6 w-6 text-red-500" />
                                {t('securityCredentials')}
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{t('currentPassword')}</label>
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
                                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{t('newPassword')}</label>
                                        <input
                                            type="password"
                                            value={adminPasswords.new}
                                            onChange={(e) => setAdminPasswords({ ...adminPasswords, new: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                            placeholder={t('enterNewPassword')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{t('confirmNewPassword')}</label>
                                        <input
                                            type="password"
                                            value={adminPasswords.confirm}
                                            onChange={(e) => setAdminPasswords({ ...adminPasswords, confirm: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                            placeholder={t('confirmNewPassword')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isUpdatingAdmin}
                                className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-bold text-xs shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isUpdatingAdmin ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                {t('updateProfile')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-24 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
                    <p className="text-gray-400 font-bold text-xs mt-2">{t('personalizeExperience')}</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-80 shrink-0">
                    <nav className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm sticky top-24">
                        <div className="p-4 space-y-2">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        setActiveSection(section.id);
                                        setShowVerificationForm(false);
                                    }}
                                    className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl transition-colors text-sm font-bold tracking-tight ${activeSection === section.id
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <section.icon className={`h-6 w-6 ${activeSection === section.id ? 'text-white' : section.color || 'inherit'}`} />
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col min-h-[800px]">
                        <div className="p-8 flex-1">
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
