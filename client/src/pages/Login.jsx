import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const { t } = useTranslation();
    const { login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(false); // Reset loading if it was set elsewhere
        setLoading(true);
        try {
            const result = await login(email, password);
            const user = result.user;

            // Allow time for onAuthStateChanged to sync userData
            // or perform a direct check if email is admin
            const isAppAdmin = user.email?.toLowerCase() === 'prajwaldahal3@gmail.com' || user.email?.toLowerCase() === 'prajwoldahal3@gmail.com';
            if (isAppAdmin) {
                toast.success('Admin login successful!');
                navigate('/admin');
            } else if (!user.emailVerified) {
                toast.success('Login successful! Please verify your email.');
                navigate('/verify-email');
            } else {
                toast.success('Login successful!');
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error('Failed to log in: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        setLoading(true);
        try {
            const result = await loginWithGoogle();
            const user = result.user;
            console.log("Login: Google User Email:", user.email);

            const isAppAdmin = user.email?.toLowerCase() === 'prajwaldahal3@gmail.com' || user.email?.toLowerCase() === 'prajwoldahal3@gmail.com';
            if (isAppAdmin) {
                console.log("Login: Redirecting to /admin");
                toast.success('Admin Google login successful!');
                navigate('/admin');
            } else if (!user.emailVerified) {
                console.log("Login: Redirecting to /verify-email");
                toast.success('Login successful! Please verify your email.');
                navigate('/verify-email');
            } else {
                console.log("Login: Redirecting to /dashboard");
                toast.success('Login successful!');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Login: Google Error:", error);
            toast.error('Failed to log in with Google: ' + error.message);
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-transparent dark:border-gray-800">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {t('login')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {t('dontHaveAccount')}{' '}
                        <Link to="/register" className="font-bold text-primary hover:text-primary-dark transition-colors">
                            {t('register')}
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 ml-1">{t('emailAddress')}</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium"
                                placeholder={t('emailAddress')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1 ml-1">
                                <label htmlFor="password" className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('password')}</label>
                                <Link to="/forgot-password" virtual="true" className="text-[10px] font-black text-primary hover:text-primary-dark uppercase tracking-widest">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder={t('password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {t('signIn')}
                        </button>
                    </div>
                </form>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                            <span className="px-3 bg-white dark:bg-gray-900 text-slate-400 dark:text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-slate-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-300 transform active:scale-[0.98]"
                        >
                            {t('signInWithGoogle')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
