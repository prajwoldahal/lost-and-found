// File: VerifyEmail.jsx
// Description: Verify Email Page: Displays email verification instructions, polls the Firebase Auth server to automatically detect when the user clicks the link, and renders gorgeous animated success transitions.

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Mail, RefreshCw, LogOut, Loader2, CheckCircle2, ShieldAlert, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { auth as firebaseAuth } from '../services/firebase';

// React Component: Renders the VerifyEmail user interface with background link polling
export default function VerifyEmail() {
    const { t } = useTranslation();
    const { currentUser, logout, sendVerification } = useAuth();
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [isVerified, setIsVerified] = useState(false);
    const navigate = useNavigate();

    // Side Effect: Polls the Firebase Auth server every 3 seconds to auto-detect verification link clicks
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (currentUser.emailVerified) {
            setIsVerified(true);
            const redirectTimer = setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2500);
            return () => clearTimeout(redirectTimer);
        }

        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }

        // Set up the dynamic background interval check
        const checkInterval = setInterval(async () => {
            if (firebaseAuth.currentUser) {
                try {
                    await firebaseAuth.currentUser.reload();
                    if (firebaseAuth.currentUser.emailVerified) {
                        clearInterval(checkInterval);
                        setIsVerified(true);
                        toast.success("Email verified! Welcome to Lost & Found.");
                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 2500);
                    }
                } catch (err) {
                    console.error("Error auto-checking verification state:", err);
                }
            }
        }, 3000);

        return () => clearInterval(checkInterval);
    }, [currentUser, cooldown, navigate]);

    // Handle manual refresh / verification check
    const handleManualRefresh = async () => {
        try {
            setLoading(true);
            if (firebaseAuth.currentUser) {
                await firebaseAuth.currentUser.reload();
                if (firebaseAuth.currentUser.emailVerified) {
                    setIsVerified(true);
                    toast.success("Email verified! Welcome to Lost & Found.");
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 2000);
                } else {
                    toast.error("Verification link has not been clicked yet. Please check your email!");
                }
            }
        } catch (error) {
            console.error("Error refreshing auth:", error);
            toast.error("Failed to check status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle resending verification email
    const handleResendEmail = async () => {
        if (cooldown > 0) return;
        try {
            setResending(true);
            await sendVerification();
            toast.success("A new verification link has been sent to your email!");
            setCooldown(60); // 1 minute cooldown
        } catch (error) {
            console.error("Resend Link Error:", error);
            toast.error(error.message || "Failed to resend verification email");
        } finally {
            setResending(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
            <div className="max-w-md w-full space-y-8">
                {isVerified ? (
                    // --- SUCCESS VERIFICATION SCREEN (DYNAMIC REDIRECT) ---
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl border border-green-100 dark:border-green-950/30 text-center space-y-6 transform scale-100 transition-all duration-500 animate-in fade-in zoom-in-95">
                        <div className="mx-auto h-24 w-24 bg-green-50 dark:bg-green-950/30 rounded-[2rem] flex items-center justify-center mb-6 relative">
                            <CheckCircle2 className="h-14 w-14 text-green-500 animate-bounce" />
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-lg">
                                <Sparkles className="h-4 w-4 animate-spin-slow" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-green-600 dark:text-green-400 uppercase tracking-tight">
                            Email Verified!
                        </h2>
                        
                        <div className="space-y-2">
                            <p className="text-gray-900 dark:text-white font-extrabold text-lg">
                                Welcome to Lost & Found
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
                                Your account is fully active. We are redirecting you to your community dashboard now...
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-4">
                            <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                            <span className="text-xs font-black text-green-600 dark:text-green-400 uppercase tracking-widest">
                                Redirecting...
                            </span>
                        </div>
                    </div>
                ) : (
                    // --- PENDING VERIFICATION FLOW (WAITING / POLLING STATE) ---
                    <div className="space-y-8">
                        <div className="text-center">
                            <div className="mx-auto h-20 w-20 bg-primary/10 dark:bg-primary/20 rounded-[2rem] flex items-center justify-center mb-6 relative animate-pulse">
                                <Mail className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                {t('verifyYourEmail', 'Verify Your Email')}
                            </h2>
                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-semibold leading-relaxed">
                                We have sent a verification link to <br />
                                <span className="font-extrabold text-primary text-base break-all">{currentUser.email}</span>
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 space-y-6">
                            
                            {/* Dynamically Pulsing Pending Verification Status Indicator */}
                            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/20 rounded-2xl animate-pulse">
                                <div className="h-3.5 w-3.5 rounded-full bg-amber-500 relative flex items-center justify-center">
                                    <div className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-75"></div>
                                </div>
                                <div className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                                    Waiting for verification link click...
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold leading-relaxed text-center">
                                Click the link in your verification email to automatically unlock and sync your account in this window.
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleManualRefresh}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 disabled:opacity-50 transform hover:scale-[1.02] duration-250 active:scale-95"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-5 w-5" />
                                    )}
                                    Check Verification Status
                                </button>

                                <button
                                    onClick={handleResendEmail}
                                    disabled={resending || cooldown > 0}
                                    className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 font-black uppercase tracking-widest rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all disabled:opacity-50"
                                >
                                    {resending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : cooldown > 0 ? (
                                        `Resend Link in ${cooldown}s`
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4" />
                                            Resend Verification Email
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-center gap-2 py-3 text-xs font-black text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out & Try Another Account
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4 flex gap-3 items-start border border-blue-100/50 dark:border-blue-800/50 transition-all">
                            <ShieldAlert className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-semibold">
                                A verified email is required to access your dashboard. If the email doesn't appear within 5 minutes, please make sure to check your spam/junk folder.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
