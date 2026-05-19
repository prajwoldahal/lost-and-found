// File: Suspended.jsx
// Description: Suspension screen: Displayed if an administrator suspends or bans a user account for policy violations.

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { ShieldAlert, LogOut, Mail, Clock } from 'lucide-react';

// React Component: Renders the Suspended user interface elements dynamically
export default function Suspended() {
    const { t } = useTranslation();
    const { userData, logout } = useAuth();
    const [timeLeft, setTimeLeft] = useState('');

    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        if (!userData?.suspendedUntil) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(userData.suspendedUntil).getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft('EXPIRED');
                window.location.reload();
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            let timeString = '';
            if (days > 0) timeString += `${days}d `;
            timeString += `${hours}h ${minutes}m ${seconds}s`;
            setTimeLeft(timeString);
        }, 1000);

        return () => clearInterval(timer);
    }, [userData]);

    if (!userData) {
        return <Navigate to="/login" replace />;
    }

    if (userData.status !== 'suspended') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full">
                    <ShieldAlert className="h-12 w-12 text-red-600" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">{t('accountSuspended')}</h1>
                    <p className="text-gray-600 font-medium">
                        {t('accountRestricted')}
                    </p>
                </div>

                {userData.suspendedUntil && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-amber-700 text-sm font-bold uppercase tracking-wider">
                            <Clock className="h-4 w-4" />
                            {t('accessRestoredIn')}
                        </div>
                        <div className="text-2xl font-mono font-bold text-amber-800 tabular-nums">
                            {timeLeft || t('calculating')}
                        </div>
                    </div>
                )}

                <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-left">
                    <h3 className="text-sm font-semibold text-red-800 uppercase tracking-wider mb-2">{t('reasonForSuspension')}</h3>
                    <p className="text-red-700 italic">
                        "{userData.suspensionReason || t('noReasonProvided')}"
                    </p>
                </div>

                <div className="pt-4 space-y-3">
                    <button
                        onClick={() => window.location.href = 'mailto:support@lostandfound.com'}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                        <Mail className="h-4 w-4" />
                        {t('contactSupport')}
                    </button>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                        <LogOut className="h-4 w-4" />
                        {t('logOut')}
                    </button>
                </div>

                <p className="text-xs text-gray-400">
                    {t('suspensionMistake')}
                </p>
            </div>
        </div>
    );
}
