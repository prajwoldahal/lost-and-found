// File: AdminClaims.jsx
// Description: Module: Handles AdminClaims logical operations.

import { useState, useEffect } from 'react';
import { claimAPI } from '../../services/api';
import { Check, X, Shield, Eye, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

// React Component: Renders the AdminClaims user interface elements dynamically
export default function AdminClaims() {
    const { t } = useTranslation();
    const { currentUser, userData } = useAuth();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState(null);

    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        const fetchClaims = async () => {
            try {
                const response = await claimAPI.getAllAdmin();
                setClaims(response.data);
            } catch (error) {
                console.error('Error fetching claims:', error);
                toast.error(t('failedToLoadClaims'));
            } finally {
                setLoading(false);
            }
        };

        fetchClaims();
    }, [t]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await claimAPI.updateStatusAdmin(id, status);
            setClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c));
            toast.success(t('claimStatusUpdated'));
            setSelectedClaim(null);
        } catch (error) {
            console.error('Error updating claim:', error);
            toast.error(t('failedToUpdateClaim'));
        }
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('verificationHub')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">{t('validateRecoveryClaims')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary px-4 py-2 rounded-xl border border-primary/20 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs font-bold">{claims.filter(c => c.status === 'pending').length} {t('criticalValidations')}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">
                            <tr>
                                <th className="px-8 py-4">{t('recoveredItem')}</th>
                                <th className="px-8 py-4">{t('claimant')}</th>
                                <th className="px-8 py-4">{t('protocol')}</th>
                                <th className="px-8 py-4">{t('state')}</th>
                                <th className="px-8 py-4">{t('timestamp')}</th>
                                <th className="px-8 py-4 text-right">{t('verification')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {claims.map((claim) => (
                                <tr key={claim.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition duration-150 group">
                                    <td className="px-8 py-4 font-bold text-gray-900 dark:text-white group-hover:text-primary transition">{claim.itemTitle}</td>
                                    <td className="px-8 py-4 text-gray-600 dark:text-gray-300">{claim.claimerName}</td>
                                    <td className="px-8 py-4">
                                        <span className="px-3 py-1 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-bold">{claim.idType}</span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border transition-all ${claim.status === 'approved'
                                            ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-950/30 dark:border-green-900/50'
                                            : claim.status === 'rejected'
                                                ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50'
                                                : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50'
                                            }`}>
                                            {t(claim.status)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-xs text-gray-500 dark:text-gray-400">{new Date(claim.createdAt).toLocaleDateString()}</td>
                                    <td className="px-8 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedClaim(claim)}
                                            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-bold text-xs hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition shadow-sm flex items-center gap-2 ml-auto"
                                        >
                                            <Eye className="h-4 w-4" />
                                            {t('inspect')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {claims.length === 0 && (
                        <div className="p-24 text-center text-gray-400 dark:text-gray-600">
                            <Shield className="h-16 w-16 mx-auto mb-6 opacity-10" />
                            <p className="font-bold text-xs uppercase">{t('noVerificationRequests')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Claim Review Modal */}
            {selectedClaim && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 text-left">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full flex flex-col max-h-full border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{t('Item Approval')}</h2>
                                <p className="text-xs text-primary font-bold mt-1">{t('crossReferencingEvidence')}</p>
                            </div>
                            <button onClick={() => setSelectedClaim(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <label className="text-xs font-bold text-gray-400 block mb-1">{t('subjectItem')}</label>
                                            <p className="text-md font-bold text-gray-900 dark:text-white">{selectedClaim.itemTitle}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <label className="text-xs font-bold text-gray-400 block mb-1">{t('claimantIdentity')}</label>
                                            <p className="text-md font-bold text-gray-900 dark:text-white">{selectedClaim.claimerId && currentUser && selectedClaim.claimerId === currentUser.uid ? (userData?.displayName || selectedClaim.claimerName) : selectedClaim.claimerName}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <label className="text-xs font-bold text-gray-400 block mb-1">{t('authenticationProtocol')}</label>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                                <span className="text-primary">{selectedClaim.idType}</span> : {selectedClaim.idNumber}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedClaim.message && (
                                        <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10">
                                            <label className="text-xs font-bold text-primary block mb-2">{t('claimantStatement')}</label>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">"{selectedClaim.message}"</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 block ml-1">{t('digitalIdProof')}</label>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="relative group cursor-zoom-in rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 aspect-video flex items-center justify-center">
                                            {selectedClaim.idImageUrl || selectedClaim.idFrontUrl ? (
                                                <>
                                                    <img
                                                        src={selectedClaim.idFrontUrl || selectedClaim.idImageUrl}
                                                        alt="ID Front"
                                                        className="w-full h-full object-cover"
                                                        onClick={() => window.open(selectedClaim.idFrontUrl || selectedClaim.idImageUrl, '_blank')}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <Eye className="h-6 w-6 text-white mx-auto mb-1" />
                                                            <span className="text-xs text-white font-bold">{t('viewFront')}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-6">
                                                    <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-gray-400 font-bold text-xs">{t('noFrontImage')}</p>
                                                </div>
                                            )}
                                        </div>


                                    </div>
                                </div>
                            </div>

                            {selectedClaim.evidenceUrls && selectedClaim.evidenceUrls.length > 0 && (
                                <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
                                    <label className="text-xs font-bold text-gray-400 block mb-3 uppercase tracking-wider">{t('recoveryEvidence', 'Recovery Evidence')}</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedClaim.evidenceUrls.map((url, idx) => (
                                            <div key={idx} className="relative group cursor-zoom-in rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 aspect-square flex items-center justify-center">
                                                <img
                                                    src={url}
                                                    alt={`Evidence ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onClick={() => window.open(url, '_blank')}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center pointer-events-none">
                                                    <div className="text-center">
                                                        <Eye className="h-6 w-6 text-white mx-auto mb-1" />
                                                        <span className="text-xs text-white font-bold">{t('viewFull', 'View')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedClaim.status === 'pending' && (
                            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-4 shrink-0">
                                <button
                                    onClick={() => handleUpdateStatus(selectedClaim.id, 'rejected')}
                                    className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 text-red-600 border border-red-100 dark:border-red-900/50 rounded-xl font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/30 transition shadow-sm"
                                >
                                    {t('voidClaim')}
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedClaim.id, 'approved')}
                                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition shadow-sm flex items-center justify-center gap-2"
                                >
                                    <Check className="h-5 w-5" />
                                    {t('authorizeAndClose')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
