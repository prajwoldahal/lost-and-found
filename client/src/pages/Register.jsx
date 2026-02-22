import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Upload, CheckCircle, Info, Eye, EyeOff, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
    const { t } = useTranslation();
    const { signup, loginWithGoogle } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    // Verification states
    const [showVerification, setShowVerification] = useState(false);
    const [idType, setIdType] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [idFile, setIdFile] = useState(null);

    const navigate = useNavigate();

    const idTypes = [
        { value: 'passport', label: 'Passport' },
        { value: 'citizenship', label: 'Citizenship Certificate' },
        { value: 'nationalId', label: 'National ID Card' },
        { value: 'drivingLicense', label: 'Driving License' }
    ];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setIdFile(file);
        }
    };

    // Password complexity validation
    const validatePassword = (pwd) => {
        return {
            minLength: pwd.length >= 8,
            hasUppercase: /[A-Z]/.test(pwd),
            hasLowercase: /[a-z]/.test(pwd),
            hasNumber: /[0-9]/.test(pwd),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
        };
    };

    const passwordValidation = validatePassword(password);
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!isPasswordValid) {
            return toast.error('Please meet all password requirements');
        }

        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        try {
            setLoading(true);

            // Sync with backend handles both Auth and Firestore
            await signup(email, password, name);

            toast.success('Account created successfully! Please check your email for verification.');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to create account: ' + error.message);
        }
        setLoading(false);
    }

    async function handleGoogleSignup() {
        try {
            setLoading(true);
            await loginWithGoogle();
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to sign up with Google: ' + error.message);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
            <div className={`w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-transparent dark:border-gray-800 transition-all duration-300 ${showVerification ? 'max-w-2xl' : 'max-w-md'}`}>
                <div>
                    <h2 className="mt-6 text-center text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {t('register')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {t('alreadyHaveAccount')}{' '}
                        <Link to="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">
                            {t('login')}
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight border-b dark:border-gray-800 pb-2">Basic Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="full-name" className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                                    <input
                                        id="full-name"
                                        name="name"
                                        type="text"
                                        required
                                        className="appearance-none relative block w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
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
                                    <label htmlFor="password" className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 ml-1">{t('password')}</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            className="appearance-none relative block w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium"
                                            placeholder={t('password')}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setPasswordTouched(true)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    {/* Password Requirements */}
                                    {passwordTouched && password && (
                                        <div className="mt-3 p-3 bg-slate-50 dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700">
                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Password must contain:</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    {passwordValidation.minLength ?
                                                        <Check className="h-4 w-4 text-green-500" /> :
                                                        <X className="h-4 w-4 text-red-500" />
                                                    }
                                                    <span className={`text-xs font-medium ${passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        At least 8 characters
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {passwordValidation.hasUppercase ?
                                                        <Check className="h-4 w-4 text-green-500" /> :
                                                        <X className="h-4 w-4 text-red-500" />
                                                    }
                                                    <span className={`text-xs font-medium ${passwordValidation.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        One uppercase letter (A-Z)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {passwordValidation.hasLowercase ?
                                                        <Check className="h-4 w-4 text-green-500" /> :
                                                        <X className="h-4 w-4 text-red-500" />
                                                    }
                                                    <span className={`text-xs font-medium ${passwordValidation.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        One lowercase letter (a-z)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {passwordValidation.hasNumber ?
                                                        <Check className="h-4 w-4 text-green-500" /> :
                                                        <X className="h-4 w-4 text-red-500" />
                                                    }
                                                    <span className={`text-xs font-medium ${passwordValidation.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        One number (0-9)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {passwordValidation.hasSpecial ?
                                                        <Check className="h-4 w-4 text-green-500" /> :
                                                        <X className="h-4 w-4 text-red-500" />
                                                    }
                                                    <span className={`text-xs font-medium ${passwordValidation.hasSpecial ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        One special character (!@#$%^&*)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 ml-1">{t('confirmPassword')}</label>
                                    <div className="relative">
                                        <input
                                            id="confirm-password"
                                            name="confirm-password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            className="appearance-none relative block w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium"
                                            placeholder={t('confirmPassword')}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Optional Verification Section */}
                        <div className="space-y-4 pt-4 border-t dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className={`h-5 w-5 ${showVerification ? 'text-primary' : 'text-slate-400'}`} />
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Verify Identity (Optional)</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowVerification(!showVerification)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${showVerification ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-700'}`}
                                >
                                    {showVerification ? 'Remove Verification' : 'Add Verification'}
                                </button>
                            </div>

                            {!showVerification && (
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex items-start gap-3 border border-blue-100 dark:border-blue-900/20">
                                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                                        Verification is optional but required if you want to <strong>claim items</strong>. Verified users receive a badge and higher community trust.
                                    </p>
                                </div>
                            )}

                            {showVerification && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 ml-1">ID Type</label>
                                        <select
                                            value={idType}
                                            onChange={(e) => setIdType(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all sm:text-sm font-medium text-slate-900 dark:text-white"
                                            required={showVerification}
                                        >
                                            <option value="">Select ID type...</option>
                                            {idTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 ml-1">ID Number</label>
                                        <input
                                            type="text"
                                            value={idNumber}
                                            onChange={(e) => setIdNumber(e.target.value)}
                                            placeholder="Enter your ID number"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all sm:text-sm font-medium text-slate-900 dark:text-white"
                                            required={showVerification}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 ml-1">ID Photo Upload</label>
                                        <div className="border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-primary dark:hover:border-primary transition-all cursor-pointer bg-slate-50 dark:bg-gray-800">
                                            <input
                                                type="file"
                                                id="id-upload"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                required={showVerification}
                                            />
                                            <label htmlFor="id-upload" className="cursor-pointer">
                                                <Upload className="h-10 w-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                                                {idFile ? (
                                                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-500 font-bold">
                                                        <CheckCircle className="h-5 w-5" />
                                                        <span className="text-sm truncate max-w-[200px]">{idFile.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        <p className="font-bold mb-1">Click to upload ID photo</p>
                                                        <p className="text-[10px] uppercase font-black tracking-tighter opacity-70">JPG, PNG or WebP (max 5MB)</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Processing...' : t('signUp')}
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
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-slate-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50"
                        >
                            {t('signInWithGoogle')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

