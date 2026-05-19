// File: VerifyEmail.jsx
// Description: Verify Email Page: Simple screen asking new signups to verify their email address before accessing the feed.

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Mail, RefreshCw, LogOut, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// React Component: Renders the VerifyEmail user interface elements dynamically
export default function VerifyEmail() {
    const { t } = useTranslation();
    const { currentUser, logout, sendVerification } = useAuth();
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const navigate = useNavigate();

    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (currentUser.emailVerified) {
            navigate('/dashboard');
        }

        // Timer for resend cooldown
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [currentUser, cooldown, navigate]);

    const handleResend = async () => {
        if (cooldown > 0) return;
        try {
            setLoading(true);
            await sendVerification();
            toast.success("Verification email resent!");
            setCooldown(60); // 1 minute cooldown
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to resend verification email");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                        <Mail className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {t('verifyYourEmail')}
                    </h2>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        {t('verificationLinkSent')} <br />
                        <span className="font-bold text-gray-900 dark:text-white text-base">{currentUser.email}</span>
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            {t('checkSpamFolder')}
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={handleRefresh}
                                className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                            >
                                <RefreshCw className="h-5 w-5" />
                                {t('iveVerified')}
                            </button>

                            <button
                                onClick={handleResend}
                                disabled={loading || cooldown > 0}
                                className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-black uppercase tracking-widest rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        {cooldown > 0 ? t('resendIn', { seconds: cooldown }) : t('resendEmail')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-black text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            {t('signOutTryAnother')}
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 flex gap-3 items-start border border-blue-100/50 dark:border-blue-800/50">
                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        {t('verificationRequired')}
                    </p>
                </div>
            </div>
        </div>
    );
}
