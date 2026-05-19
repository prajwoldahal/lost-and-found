// File: AdminLogin.jsx
// Description: Module: Handles AdminLogin logical operations.

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// React Component: Renders the AdminLogin user interface elements dynamically
export default function AdminLogin() {
    const { t } = useTranslation();
    const { adminLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setLoading(true);
            await adminLogin(email, password);
            toast.success(t('adminLoginSuccessful'));
            navigate('/admin');
        } catch (error) {
            toast.error(error.message || t('failedToLoginAsAdmin'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">

            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

            <div className="relative max-w-md w-full">
                {/* Admin Badge */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-28 h-28 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl mb-10 border-4 border-gray-50 dark:border-gray-800 transform hover:scale-110 transition-transform duration-500">
                        <Shield className="h-14 w-14 text-primary" />
                    </div>
                    <h2 className="text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase leading-none">
                        {t('secure')}<br /><span className="text-primary">{t('terminal')}</span>
                    </h2>
                    <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                        {t('authorizedPersonnelOnly')}
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-10 border border-transparent dark:border-gray-800">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                {t('adminEmail')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                    <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder={t('adminEmailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" self="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                {t('adminPassword')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                    <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder={t('adminPasswordPlaceholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-3 py-5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Shield className="h-5 w-5" />
                                {loading ? t('authenticating') : t('establishConnection')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs font-black uppercase tracking-widest">
                            <span className="px-3 bg-white dark:bg-gray-900 text-slate-400 dark:text-slate-500">{t('notAnAdmin')}</span>
                        </div>
                    </div>

                    {/* Regular User Login Link */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-secondary hover:text-primary transition"
                        >
                            {t('signInAsRegularUser')}
                        </Link>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 opacity-60">
                    {t('proprietaryAdminSystem')}
                </p>
            </div>
        </div>
    );
}
