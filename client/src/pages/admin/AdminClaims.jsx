import { useState, useEffect } from 'react';
import { claimAPI } from '../../services/api';
import { Check, X, Shield, Eye, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AdminClaims() {
    const { t } = useTranslation();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState(null);

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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('verificationHub')}</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">{t('validateRecoveryClaims')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary px-6 py-3 rounded-2xl border border-primary/20 flex items-center gap-3">
                        <Shield className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{claims.filter(c => c.status === 'pending').length} {t('criticalValidations')}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-5">{t('recoveredItem')}</th>
                                <th className="px-8 py-5">{t('claimant')}</th>
                                <th className="px-8 py-5">{t('protocol')}</th>
                                <th className="px-8 py-5">{t('state')}</th>
                                <th className="px-8 py-5">{t('timestamp')}</th>
                                <th className="px-8 py-5 text-right">{t('verification')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {claims.map((claim) => (
                                <tr key={claim.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition duration-150 group">
                                    <td className="px-8 py-6 font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition">{claim.itemTitle}</td>
                                    <td className="px-8 py-6 font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">{claim.claimerName}</td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 rounded-lg text-[9px] font-black uppercase tracking-widest">{claim.idType}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border transition-all ${claim.status === 'approved'
                                            ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-950/30 dark:border-green-900/50'
                                            : claim.status === 'rejected'
                                                ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50'
                                                : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50'
                                            }`}>
                                            {t(claim.status)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{new Date(claim.createdAt).toLocaleDateString()}</td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => setSelectedClaim(claim)}
                                            className="px-6 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition shadow-sm flex items-center gap-2 ml-auto"
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
                            <p className="font-black uppercase tracking-widest text-[10px]">{t('noVerificationRequests')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Claim Review Modal */}
            {selectedClaim && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
                        <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('validationDossier')}</h2>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{t('crossReferencingEvidence')}</p>
                            </div>
                            <button onClick={() => setSelectedClaim(null)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition">
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-12 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{t('subjectItem')}</label>
                                            <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedClaim.itemTitle}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{t('claimantIdentity')}</label>
                                            <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedClaim.claimerName}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{t('authenticationProtocol')}</label>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                                                <span className="text-primary">{selectedClaim.idType}</span> : {selectedClaim.idNumber}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedClaim.message && (
                                        <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-3xl border border-primary/10">
                                            <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-3">{t('claimantStatement')}</label>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">"{selectedClaim.message}"</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">{t('digitalIdProof')}</label>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="relative group cursor-zoom-in rounded-[2rem] overflow-hidden border-4 border-gray-50 dark:border-gray-900 shadow-2xl bg-gray-100 dark:bg-gray-900 aspect-video flex items-center justify-center">
                                            {selectedClaim.idImageUrl || selectedClaim.idFrontUrl ? (
                                                <>
                                                    <img
                                                        src={selectedClaim.idFrontUrl || selectedClaim.idImageUrl}
                                                        alt="ID Front"
                                                        className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                                        onClick={() => window.open(selectedClaim.idFrontUrl || selectedClaim.idImageUrl, '_blank')}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <Eye className="h-8 w-8 text-white mx-auto mb-2" />
                                                            <span className="text-[10px] text-white font-black uppercase tracking-widest">{t('viewFront')}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-8">
                                                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">{t('noFrontImage')}</p>
                                                </div>
                                            )}
                                        </div>

                                        {selectedClaim.idBackUrl && (
                                            <div className="relative group cursor-zoom-in rounded-[2rem] overflow-hidden border-4 border-gray-50 dark:border-gray-900 shadow-2xl bg-gray-100 dark:bg-gray-900 aspect-video flex items-center justify-center animate-in fade-in slide-in-from-top-2 duration-500">
                                                <img
                                                    src={selectedClaim.idBackUrl}
                                                    alt="ID Back"
                                                    className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                                    onClick={() => window.open(selectedClaim.idBackUrl, '_blank')}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <Eye className="h-8 w-8 text-white mx-auto mb-2" />
                                                        <span className="text-[10px] text-white font-black uppercase tracking-widest">{t('viewBack')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedClaim.status === 'pending' && (
                            <div className="px-10 py-8 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-6">
                                <button
                                    onClick={() => handleUpdateStatus(selectedClaim.id, 'rejected')}
                                    className="flex-1 px-8 py-4 bg-white dark:bg-gray-800 text-red-600 border border-red-100 dark:border-red-900/50 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 dark:hover:bg-red-950/30 transition shadow-sm"
                                >
                                    {t('voidClaim')}
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedClaim.id, 'approved')}
                                    className="flex-1 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
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
