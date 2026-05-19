// File: ReportPostModal.jsx
// Description: Flag Post Dialog: Allows users to report offensive, fraudulent, or rule-breaking listings directly to admins.

import { useState } from 'react';
import { X, AlertTriangle, Send, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { postAPI } from '../services/api';

const REASONS = [
    { id: 'fake', label: 'Fake or misleading information' },
    { id: 'spam', label: 'Spam or advertisement' },
    { id: 'inappropriate', label: 'Inappropriate content' },
    { id: 'wrong_category', label: 'Wrong category (Lost/Found)' },
    { id: 'scam', label: 'Possible scam or fraud' }
];

// React Component: Renders the ReportPostModal user interface elements dynamically
export default function ReportPostModal({ isOpen, onClose, postId, postTitle }) {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) {
            toast.error('Please select a reason for reporting');
            return;
        }

        setIsSubmitting(true);
        try {
            await postAPI.report(postId, { reason, details });
            toast.success('Report submitted successfully.');
            onClose();
            // Reset form
            setReason('');
            setDetails('');
        } catch (error) {
            console.error("Report error:", error);
            toast.error("Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Safety Report</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Vulnerability Type</label>
                            <div className="grid grid-cols-1 gap-2">
                                {REASONS.map((r) => (
                                    <label
                                        key={r.id}
                                        className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${reason === r.id
                                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
                                            : 'bg-gray-50 dark:bg-gray-950/50 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={r.id}
                                            checked={reason === r.id}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700"
                                        />
                                        <span className="font-bold text-sm uppercase tracking-tight">{r.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Tactical Details</label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Describe the violation or security concern..."
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:text-white font-medium text-sm transition-all resize-none h-28"
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !reason}
                                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                                Submit Intel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
