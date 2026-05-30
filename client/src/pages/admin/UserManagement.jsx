// File: UserManagement.jsx
// Description: Module: Handles UserManagement logical operations.

import { useState, useEffect } from 'react';
import { adminAPI, userAPI } from '../../services/api';
import { Search, UserCheck, UserX, Eye, Mail, Loader2, RefreshCw, ShieldCheck, X, ShieldAlert, Clock, ImageIcon, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// React Component: Renders the UserManagement user interface elements dynamically
export default function UserManagement() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [suspensionReason, setSuspensionReason] = useState('');
    const [suspensionDuration, setSuspensionDuration] = useState('1'); // Days by default
    const [verificationModalOpen, setVerificationModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            console.log('🔄 Fetching users from admin API...');
            const response = await adminAPI.getUsers();
            console.log('✅ Users received:', response.data.length, 'users');
            console.log('User data sample:', response.data[0]);
            setUsers(response.data);
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });

            // Show specific error messages
            if (error.response?.status === 403) {
                toast.error(t('error'));
                console.error('🚫 User does not have admin privileges');
            } else if (error.response?.status === 401) {
                toast.error(t('error'));
                console.error('🔐 Authentication token invalid or expired');
            } else {
                toast.error(`${t('error')} : ` + (error.response?.data?.error || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSyncUsers = async () => {
        setSyncing(true);
        try {
            const response = await adminAPI.syncUsers();
            toast.success(t('success'));
            fetchUsers();
        } catch (error) {
            console.error('Error syncing users:', error);
            toast.error(t('error'));
        } finally {
            setSyncing(false);
        }
    };

    const handleUpdateStatus = async (userId, newStatus, reason = '', durationDays = '0') => {
        try {
            const updates = { status: newStatus };
            if (newStatus === 'suspended') {
                updates.suspensionReason = reason;
                if (durationDays !== 'permanent') {
                    const until = new Date();
                    until.setHours(until.getHours() + (parseFloat(durationDays) * 24));
                    updates.suspendedUntil = until.toISOString();
                } else {
                    updates.suspendedUntil = null; // Permanent
                }
            } else {
                updates.suspensionReason = null;
                updates.suspendedUntil = null;
            }

            await userAPI.update(userId, updates);
            setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
            toast.success(t('success'));
            setSuspensionModalOpen(false);
            setSuspensionReason('');
            setSuspensionDuration('1');
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error(t('error'));
        }
    };

    const handleVerify = async (userId) => {
        setIsProcessing(true);
        try {
            await adminAPI.verifyUser(userId);
            setUsers(users.map(u => u.id === userId ? { ...u, isVerified: true, verificationPending: false } : u));
            toast.success(t('success'));
            setVerificationModalOpen(false);
        } catch (error) {
            console.error('Error verifying user:', error);
            toast.error(t('error'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async (userId) => {
        setIsProcessing(true);
        try {
            await adminAPI.rejectId(userId, { reason: rejectionReason });
            setUsers(users.map(u => u.id === userId ? { ...u, verificationPending: false } : u));
            toast.success(t('success'));
            setVerificationModalOpen(false);
            setRejectionReason('');
        } catch (error) {
            console.error('Error rejecting verification:', error);
            toast.error(t('error'));
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.displayName || user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'pending_verification'
                ? user.verificationPending
                : (user.status || 'active') === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('User Directory')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">{t('manageCommunityAccess')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSyncUsers}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-xs hover:bg-indigo-200 transition disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? t('syncingBase') : t('synchronizeUsers')}
                    </button>
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[48px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{t('active')}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{filteredUsers.length}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholderUserManagement')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm font-medium transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full appearance-none px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm font-medium cursor-pointer"
                        >
                            <option value="all">{t('allAccessLevels')}</option>
                            <option value="active">{t('activeMembers')}</option>
                            <option value="suspended">{t('suspendedRecords')}</option>
                            <option value="pending_verification">{t('pendingReview')}</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('memberIdentity')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('communications')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('onboarding')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('accessState')}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('authority')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition duration-150 group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                                    alt={user.displayName}
                                                    className="w-10 h-10 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm object-cover"
                                                />
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${(user.status || 'active') === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition">{user.displayName || user.name || 'Anonymous'}</span>
                                                    {user.isAdmin && (
                                                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 text-[10px] font-bold rounded border border-amber-100 dark:border-amber-900/50 uppercase">
                                                            <ShieldCheck className="h-3 w-3" />
                                                            {t('supreme')}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('communityMember')}</span>
                                                {user.verificationPending && (
                                                    <span className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-blue-500">
                                                        <Clock className="h-2.5 w-2.5 animate-pulse" />
                                                        {t('pendingIdentityReview')}
                                                    </span>
                                                )}
                                                {user.isVerified && (
                                                    <span className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-green-500">
                                                        <ShieldCheck className="h-2.5 w-2.5" />
                                                        {t('identityVerified')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{formatDate(user.createdAt)}</span>
                                            <span className="text-[10px] text-gray-400 uppercase">{t('accountCreated')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${(user.status || 'active') === 'active'
                                            ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-400'
                                            : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400'
                                            }`}>
                                            {(user.status ? t(user.status) : t('active'))}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
                                            {(user.status || 'active') === 'active' ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setSuspensionModalOpen(true);
                                                    }}
                                                    className="p-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition"
                                                    title={t('suspendUser')}
                                                >
                                                    <UserX className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpdateStatus(user.id, 'active')}
                                                    className="p-2 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-600 hover:text-white dark:hover:bg-green-600 transition"
                                                    title={t('activateUser')}
                                                >
                                                    <UserCheck className="h-4 w-4" />
                                                </button>
                                            )}
                                            {user.verificationPending && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setVerificationModalOpen(true);
                                                    }}
                                                    className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition"
                                                    title={t('reviewVerification')}
                                                >
                                                    <ShieldAlert className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Suspension Modal */}
            {suspensionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-red-50/50 dark:bg-red-950/20">
                            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                                <ShieldAlert className="h-5 w-5" />
                                <h3 className="text-base font-bold">{t('accessControl')}</h3>
                            </div>
                            <button
                                onClick={() => setSuspensionModalOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-400 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                                <img
                                    src={selectedUser?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    className="h-11 w-11 rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
                                    alt=""
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedUser?.displayName || selectedUser?.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUser?.email}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        {t('suspensionDuration')}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={suspensionDuration}
                                            onChange={(e) => setSuspensionDuration(e.target.value)}
                                            className="w-full appearance-none px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm font-medium transition cursor-pointer"
                                        >
                                            <option value="0.0416">{t('oneHourWarning')}</option>
                                            <option value="0.5">{t('twelveHoursShort')}</option>
                                            <option value="1">{t('oneDayStandard')}</option>
                                            <option value="3">{t('threeDaysExtended')}</option>
                                            <option value="7">{t('oneWeekSevere')}</option>
                                            <option value="30">{t('oneMonthCritical')}</option>
                                            <option value="permanent">{t('permanentPurge')}</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500">
                                        {t('enforcementRationale')}
                                    </label>
                                    <textarea
                                        value={suspensionReason}
                                        onChange={(e) => setSuspensionReason(e.target.value)}
                                        placeholder={t('articulateEnforcementReason')}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm transition h-28 resize-none"
                                    />
                                    <p className="text-[10px] text-gray-400 italic">
                                        {t('userWillReceiveNotification')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setSuspensionModalOpen(false)}
                                className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                            >
                                {t('reconsider')}
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedUser.id, 'suspended', suspensionReason, suspensionDuration)}
                                disabled={!suspensionReason.trim()}
                                className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('enforceSuspension')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Review Modal */}
            {verificationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                                <ShieldCheck className="h-5 w-5" />
                                <h3 className="text-base font-bold">{t('identityReview')}</h3>
                            </div>
                            <button
                                onClick={() => setVerificationModalOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-400 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                            {/* User Header */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                                <img
                                    src={selectedUser?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    className="h-14 w-14 rounded-xl border border-gray-200 dark:border-gray-700 object-cover shadow-sm"
                                    alt=""
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedUser?.displayName || selectedUser?.name}</p>
                                    <div className="flex gap-4 mt-1">
                                        <p className="text-xs text-gray-500">{t('idType')}: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedUser?.idType}</span></p>
                                        <p className="text-xs text-gray-500">{t('idNumber')}: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedUser?.idNumber}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* ID Photos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase">{t('frontSidePhoto')}</p>
                                    <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-[4/3] bg-gray-50 dark:bg-gray-900">
                                        <img
                                            src={selectedUser?.idFrontUrl || selectedUser?.idImageUrl}
                                            className="w-full h-full object-contain"
                                            alt="ID Front"
                                        />
                                        <a
                                            href={selectedUser?.idFrontUrl || selectedUser?.idImageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs"
                                        >
                                            {t('viewFullSize')}
                                        </a>
                                    </div>
                                </div>

                                {selectedUser?.idType === 'citizenship' && selectedUser?.idBackUrl && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase">{t('backSidePhoto')}</p>
                                        <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-[4/3] bg-gray-50 dark:bg-gray-900">
                                            <img
                                                src={selectedUser?.idBackUrl}
                                                className="w-full h-full object-contain"
                                                alt="ID Back"
                                            />
                                            <a
                                                href={selectedUser?.idBackUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs"
                                            >
                                                {t('viewFullSize')}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rejection Rationale */}
                            <div className="space-y-1.5 border-t border-gray-100 dark:border-gray-700 pt-5">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t('rejectionRationaleOptional')}</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder={t('explainRejectionReason')}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm transition h-20 resize-none"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                            <button
                                onClick={() => setVerificationModalOpen(false)}
                                className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                            >
                                {t('closePortfolio')}
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleReject(selectedUser.id)}
                                    disabled={isProcessing}
                                    className="px-5 py-2.5 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                                >
                                    {t('rejectIdentity')}
                                </button>
                                <button
                                    onClick={() => handleVerify(selectedUser.id)}
                                    disabled={isProcessing}
                                    className="px-5 py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {isProcessing ? t('processing') : t('verifyIdentity')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
