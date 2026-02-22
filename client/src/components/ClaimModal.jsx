import { useState } from 'react';
import { X, CheckCircle, AlertCircle, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ClaimModal({ isOpen, onClose, onConfirm, item }) {
    const { userData } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !item) return null;

    const isVerified = userData?.isVerified;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        onConfirm();
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Claim Item</h2>
                        <p className="text-sm text-gray-600 truncate max-w-[250px]">{item.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {isVerified ? (
                        /* Verified User Flow */
                        <div className="space-y-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="bg-green-50 p-4 rounded-full mb-4">
                                    <CheckCircle className="h-12 w-12 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Confirm Your Claim</h3>
                                <p className="text-gray-600 mt-2 text-sm">
                                    Your identity is verified. Are you sure you want to claim this item?
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold">Verified User Protection</p>
                                        <p className="mt-1">As a verified user, your claim will be processed with higher priority.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? 'Processing...' : 'Yes, Confirm Claim'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Unverified User Flow */
                        <div className="space-y-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="bg-red-50 p-4 rounded-full mb-4">
                                    <AlertCircle className="h-12 w-12 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Verification Required</h3>
                                <p className="text-gray-600 mt-2 text-sm">
                                    You must verify your identity to claim an item in this community.
                                </p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                                    <p className="text-xs text-yellow-800">
                                        Identity verification helps prevent fraud and ensures items are returned to their rightful owners.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={() => navigate('/settings?section=verification')}
                                    className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-bold shadow-lg flex items-center justify-center gap-2"
                                >
                                    Verify Now
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
