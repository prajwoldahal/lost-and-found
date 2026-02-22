import { useState, useEffect } from 'react';
import { adminAPI, userAPI } from '../../services/api';
import { Search, UserCheck, UserX, Eye, Mail, Loader2, RefreshCw, ShieldCheck, X, ShieldAlert, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagement() {
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
                toast.error('Access denied - Admin privileges required');
                console.error('🚫 User does not have admin privileges');
            } else if (error.response?.status === 401) {
                toast.error('Authentication failed - Please login again');
                console.error('🔐 Authentication token invalid or expired');
            } else {
                toast.error('Failed to load users: ' + (error.response?.data?.error || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSyncUsers = async () => {
        setSyncing(true);
        try {
            const response = await adminAPI.syncUsers();
            toast.success(response.data.message);
            fetchUsers();
        } catch (error) {
            console.error('Error syncing users:', error);
            toast.error('Failed to sync users');
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
            toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
            setSuspensionModalOpen(false);
            setSuspensionReason('');
            setSuspensionDuration('1');
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user status');
        }
    };

    const handleVerify = async (userId) => {
        setIsProcessing(true);
        try {
            await adminAPI.verifyUser(userId);
            setUsers(users.map(u => u.id === userId ? { ...u, isVerified: true, verificationPending: false } : u));
            toast.success('User identity verified!');
            setVerificationModalOpen(false);
        } catch (error) {
            console.error('Error verifying user:', error);
            toast.error('Failed to verify user');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async (userId) => {
        if (!rejectionReason.trim()) return toast.error('Please provide a rejection reason');
        setIsProcessing(true);
        try {
            await adminAPI.rejectUser(userId, rejectionReason);
            setUsers(users.map(u => u.id === userId ? { ...u, verificationPending: false } : u));
            toast.success('Verification rejected');
            setVerificationModalOpen(false);
            setRejectionReason('');
        } catch (error) {
            console.error('Error rejecting verification:', error);
            toast.error('Failed to reject verification');
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">User Directory</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Manage community access and privileges</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSyncUsers}
                        disabled={syncing}
                        className="flex items-center gap-3 px-6 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing Base...' : 'Synchronize Users'}
                    </button>
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">{filteredUsers.length}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm font-bold transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full appearance-none px-6 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm font-black uppercase tracking-widest cursor-pointer"
                        >
                            <option value="all">All Access Levels</option>
                            <option value="active">Active Members</option>
                            <option value="suspended">Suspended Records</option>
                            <option value="pending_verification">Pending Review</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Member Identity</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Communications</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Onboarding</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Access State</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Authority</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition duration-150 group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                                    alt={user.displayName}
                                                    className="w-12 h-12 rounded-2xl border-2 border-white dark:border-gray-700 shadow-lg object-cover"
                                                />
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${(user.status || 'active') === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition">{user.displayName || user.name || 'Anonymous'}</span>
                                                    {user.isAdmin && (
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 text-[9px] font-black rounded-lg border border-amber-100 dark:border-amber-900/50 uppercase tracking-widest">
                                                            <ShieldCheck className="h-3 w-3" />
                                                            Supreme
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Community Member</span>
                                                {user.verificationPending && (
                                                    <span className="mt-1 flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase tracking-tight">
                                                        <Clock className="h-2.5 w-2.5 animate-pulse" />
                                                        Pending Identity Review
                                                    </span>
                                                )}
                                                {user.isVerified && (
                                                    <span className="mt-1 flex items-center gap-1 text-[9px] font-black text-green-500 uppercase tracking-tight">
                                                        <ShieldCheck className="h-2.5 w-2.5" />
                                                        Identity Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight">{formatDate(user.createdAt)}</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Account Created</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border transition-all ${(user.status || 'active') === 'active'
                                            ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-950/30 dark:border-green-900/50'
                                            : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50'
                                            }`}>
                                            {(user.status || 'active')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition duration-200">
                                            {(user.status || 'active') === 'active' ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setSuspensionModalOpen(true);
                                                    }}
                                                    className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition shadow-sm"
                                                    title="Suspend User"
                                                >
                                                    <UserX className="h-5 w-5" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpdateStatus(user.id, 'active')}
                                                    className="p-3 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-600 hover:text-white dark:hover:bg-green-600 transition shadow-sm"
                                                    title="Activate User"
                                                >
                                                    <UserCheck className="h-5 w-5" />
                                                </button>
                                            )}
                                            {user.verificationPending && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setVerificationModalOpen(true);
                                                    }}
                                                    className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm"
                                                    title="Review Verification"
                                                >
                                                    <ShieldAlert className="h-5 w-5" />
                                                </button>
                                            )}
                                            <button className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition shadow-sm">
                                                <Eye className="h-5 w-5" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
                        <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-red-50/50 dark:bg-red-950/20">
                            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                                <ShieldAlert className="h-6 w-6" />
                                <h3 className="text-xl font-black uppercase tracking-tight">Access Control</h3>
                            </div>
                            <button
                                onClick={() => setSuspensionModalOpen(false)}
                                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 text-red-400 transition"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <img
                                    src={selectedUser?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    className="h-14 w-14 rounded-xl border-2 border-white dark:border-gray-800 shadow-sm object-cover"
                                    alt=""
                                />
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedUser?.displayName || selectedUser?.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{selectedUser?.email}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Suspension Duration
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={suspensionDuration}
                                            onChange={(e) => setSuspensionDuration(e.target.value)}
                                            className="w-full appearance-none px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm font-black uppercase tracking-widest transition cursor-pointer"
                                        >
                                            <option value="0.0416">1 Hour (Warning)</option>
                                            <option value="0.5">12 Hours (Short)</option>
                                            <option value="1">1 Day (Standard)</option>
                                            <option value="3">3 Days (Extended)</option>
                                            <option value="7">1 Week (Severe)</option>
                                            <option value="30">1 Month (Critical)</option>
                                            <option value="permanent">Permanent Purge</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Enforcement Rationale
                                    </label>
                                    <textarea
                                        value={suspensionReason}
                                        onChange={(e) => setSuspensionReason(e.target.value)}
                                        placeholder="Articulate the exact reason for this enforcement action..."
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:text-white text-sm font-medium transition h-32 resize-none"
                                    />
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight italic">
                                        * User will receive an immediate notification with this rationale.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-10 py-8 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-end gap-5">
                            <button
                                onClick={() => setSuspensionModalOpen(false)}
                                className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition"
                            >
                                Reconsider
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedUser.id, 'suspended', suspensionReason, suspensionDuration)}
                                disabled={!suspensionReason.trim()}
                                className="px-8 py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-red-500/30"
                            >
                                Enforce Suspension
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Review Modal */}
            {verificationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
                        <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                                <ShieldCheck className="h-6 w-6" />
                                <h3 className="text-xl font-black uppercase tracking-tight">Identity Review</h3>
                            </div>
                            <button
                                onClick={() => setVerificationModalOpen(false)}
                                className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-400 transition"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
                            {/* User Header */}
                            <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <img
                                    src={selectedUser?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    className="h-16 w-16 rounded-2xl border-2 border-white dark:border-gray-800 shadow-sm object-cover"
                                    alt=""
                                />
                                <div>
                                    <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedUser?.displayName || selectedUser?.name}</p>
                                    <div className="flex gap-4 mt-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type: <span className="text-gray-900 dark:text-white">{selectedUser?.idType}</span></p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Number: <span className="text-gray-900 dark:text-white">{selectedUser?.idNumber}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* ID Photos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Front Side Photo</p>
                                    <div className="relative group rounded-3xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 aspect-[4/3] bg-gray-50 dark:bg-gray-900">
                                        <img
                                            src={selectedUser?.idFrontUrl || selectedUser?.idImageUrl}
                                            className="w-full h-full object-contain"
                                            alt="ID Front"
                                        />
                                        <a
                                            href={selectedUser?.idFrontUrl || selectedUser?.idImageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-black uppercase text-[10px] tracking-widest"
                                        >
                                            View Full Size
                                        </a>
                                    </div>
                                </div>

                                {selectedUser?.idBackUrl && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Back Side Photo</p>
                                        <div className="relative group rounded-3xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 aspect-[4/3] bg-gray-50 dark:bg-gray-900">
                                            <img
                                                src={selectedUser?.idBackUrl}
                                                className="w-full h-full object-contain"
                                                alt="ID Back"
                                            />
                                            <a
                                                href={selectedUser?.idBackUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-black uppercase text-[10px] tracking-widest"
                                            >
                                                View Full Size
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rejection Rationale */}
                            <div className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-8">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rejection Rationale (Optional)</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this identity verification is being rejected..."
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-medium transition h-24 resize-none"
                                />
                            </div>
                        </div>

                        <div className="px-10 py-8 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between gap-5">
                            <button
                                onClick={() => setVerificationModalOpen(false)}
                                className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition"
                            >
                                Close Portfolio
                            </button>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleReject(selectedUser.id)}
                                    disabled={isProcessing}
                                    className="px-8 py-4 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                                >
                                    Reject Identity
                                </button>
                                <button
                                    onClick={() => handleVerify(selectedUser.id)}
                                    disabled={isProcessing}
                                    className="px-8 py-4 bg-green-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-green-700 transition disabled:opacity-50 shadow-xl shadow-green-500/20"
                                >
                                    {isProcessing ? 'Processing...' : 'Verify Identity'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
