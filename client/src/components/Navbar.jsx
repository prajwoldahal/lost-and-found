import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import VerifiedBadge from './VerifiedBadge';
import NotificationCenter from './NotificationCenter';
import { LogOut, User, Globe, PlusCircle, Shield, MessageCircle, Trophy, AlertTriangle, Settings, Package, Moon, Sun, Search, Users, Flag, ChevronDown, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const { currentUser, userData, logout, loading } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Helper function to check if link is active
    const isActive = (path) => location.pathname === path;

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => setShowLogoutModal(true);

    const confirmLogout = async () => {
        setShowLogoutModal(false);
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const handleLogoClick = (e) => {
        if (currentUser) {
            e.preventDefault();
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'np' : 'en';
        i18n.changeLanguage(newLang);
    };

    const userLinks = [
        { path: '/dashboard', label: t('dashboard'), icon: Package },
        { path: '/create-post', label: t('createPost'), icon: PlusCircle, mobileOnly: true },
        { path: '/search', label: t('search'), icon: Search },
        { path: '/messages', label: t('messages'), icon: MessageCircle },
        { path: '/rewards', label: t('rewards'), icon: Trophy },
    ];

    const adminLinks = [
        { path: '/admin', label: t('dashboard'), icon: Shield },
        { path: '/admin/users', label: t('users'), icon: Users },
        { path: '/admin/posts', label: t('posts'), icon: Package },
        { path: '/admin/reports', label: t('reports'), icon: Flag },
    ];

    const links = userData?.isAdmin ? adminLinks : userLinks;

    return (
        <>
            <nav className="bg-white dark:bg-gray-900 sticky top-0 z-50 border-b border-slate-100 dark:border-gray-800 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        {/* Left Side: Logo & Primary Nav */}
                        <div className="flex items-center gap-8">
                            <Link to="/" onClick={handleLogoClick} className="flex-shrink-0 flex items-center group">
                                <div className="bg-primary p-2 rounded-xl mr-3 group-hover:rotate-12 transition-transform duration-300">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                                    Lost<span className="text-primary-light">Found</span>
                                </span>
                            </Link>

                            {/* Desktop Navigation */}
                            {currentUser && (
                                <div className="hidden md:flex items-center space-x-1">
                                    {links.filter(l => !l.mobileOnly).map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${isActive(link.path)
                                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800/50 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <link.icon className="h-4 w-4" />
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Actions & Profile */}
                        <div className="flex items-center gap-3">
                            {!loading && currentUser ? (
                                <>
                                    {/* Create Post CTA (User Only) */}
                                    {!userData?.isAdmin && (
                                        <Link
                                            to="/create-post"
                                            className="hidden sm:flex items-center gap-2 bg-primary dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary px-5 py-2.5 rounded-xl transition-all duration-300 font-bold shadow-lg shadow-primary/20 active:scale-95"
                                        >
                                            <PlusCircle className="h-4 w-4" />
                                            <span>{t('createPost')}</span>
                                        </Link>
                                    )}

                                    <div className="w-px h-6 bg-slate-100 dark:bg-gray-800 mx-2 hidden sm:block" />

                                    {/* Notifications */}
                                    <NotificationCenter />

                                    {/* Quick Toggles for Authenticated */}
                                    <div className="hidden sm:flex items-center gap-1 bg-slate-50 dark:bg-gray-800/50 p-1 rounded-xl border border-slate-100 dark:border-gray-700 mx-1">
                                        <button
                                            onClick={toggleTheme}
                                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-slate-500 dark:text-slate-400 transition-colors"
                                            title={isDarkMode ? t('lightMode') : t('darkMode')}
                                        >
                                            {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                                        </button>
                                        <button
                                            onClick={toggleLanguage}
                                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-slate-500 dark:text-slate-400 transition-colors flex items-center gap-1"
                                            title={t('language')}
                                        >
                                            <Globe className="h-3.5 w-3.5" />
                                            <span className="text-[9px] font-black uppercase">{i18n.language}</span>
                                        </button>
                                    </div>

                                    {/* Profile Dropdown */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                            className="flex items-center gap-2 p-1 pl-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-300 border border-transparent hover:border-slate-100 dark:hover:border-gray-700"
                                        >
                                            <div className="hidden sm:block text-right">
                                                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate max-w-[100px] flex items-center gap-1 justify-end">
                                                    {userData?.displayName || 'User'}
                                                    <VerifiedBadge verified={userData?.isVerified} size="h-3 w-3" />
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                                                    {userData?.isAdmin ? t('admin') : t('member')}
                                                </p>
                                            </div>
                                            <div className="relative">
                                                {(() => {
                                                    const photoUrl = currentUser?.photoURL || userData?.photoURL;
                                                    console.log('Navbar Photo Debug:', {
                                                        currentUserPhoto: currentUser?.photoURL,
                                                        userDataPhoto: userData?.photoURL,
                                                        finalPhoto: photoUrl
                                                    });

                                                    return photoUrl ? (
                                                        <img
                                                            src={photoUrl}
                                                            alt="Profile"
                                                            referrerPolicy="no-referrer"
                                                            className="h-9 w-9 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-primary transition-all"
                                                            onError={(e) => {
                                                                console.error('Image failed to load:', photoUrl);
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-500">
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                    );
                                                })()}
                                                <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-gray-800 items-center justify-center text-slate-500 hidden">
                                                    <User className="h-5 w-5" />
                                                </div>
                                            </div>
                                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showProfileDropdown && (
                                            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 py-3">
                                                <div className="px-4 py-3 border-b border-slate-50 dark:border-gray-700/50 mb-2 flex items-center gap-3">
                                                    {(() => {
                                                        const photoUrl = currentUser?.photoURL || userData?.photoURL;
                                                        return photoUrl ? (
                                                            <img
                                                                src={photoUrl}
                                                                alt="Profile"
                                                                referrerPolicy="no-referrer"
                                                                className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-gray-700"
                                                                onError={(e) => {
                                                                    console.error('Dropdown image failed to load:', photoUrl);
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-slate-500">
                                                                <User className="h-5 w-5" />
                                                            </div>
                                                        );
                                                    })()}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="text-sm font-black text-slate-900 dark:text-white truncate">{userData?.displayName}</p>
                                                            <VerifiedBadge verified={userData?.isVerified} size="h-3.5 w-3.5" />
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{userData?.email}</p>
                                                    </div>
                                                </div>

                                                {!userData?.isAdmin && (
                                                    <Link to="/my-posts" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-primary transition-colors">
                                                        <Package className="h-4 w-4" />
                                                        {t('myPosts')}
                                                    </Link>
                                                )}

                                                <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-primary transition-colors">
                                                    <Settings className="h-4 w-4" />
                                                    {t('settings')}
                                                </Link>

                                                <div className="h-px bg-slate-50 dark:bg-gray-700/50 my-2" />

                                                {/* Theme Toggle */}
                                                <button
                                                    onClick={toggleTheme}
                                                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                                        <span>{isDarkMode ? t('lightMode') : t('darkMode')}</span>
                                                    </div>
                                                    <div className={`w-10 h-5 rounded-full transition-colors flex items-center px-1 ${isDarkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-gray-600'}`}>
                                                        <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                                    </div>
                                                </button>

                                                {/* Language Switcher */}
                                                <button
                                                    onClick={toggleLanguage}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <Globe className="h-4 w-4" />
                                                    <div className="flex justify-between flex-1 items-center">
                                                        <span>{t('language')}</span>
                                                        <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-slate-500">{i18n.language}</span>
                                                    </div>
                                                </button>

                                                <div className="h-px bg-slate-50 dark:bg-gray-700/50 my-2" />

                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    {t('logout')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : !loading ? (
                                <div className="flex items-center gap-2">
                                    {/* Quick Toggles for Guest */}
                                    <div className="hidden sm:flex items-center gap-2 mr-2 bg-slate-50 dark:bg-gray-800/50 p-1 rounded-xl border border-slate-100 dark:border-gray-700">
                                        <button
                                            onClick={toggleTheme}
                                            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-slate-500 dark:text-slate-400 transition-colors"
                                            title={isDarkMode ? t('lightMode') : t('darkMode')}
                                        >
                                            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={toggleLanguage}
                                            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-slate-500 dark:text-slate-400 transition-colors flex items-center gap-1.5"
                                            title={t('language')}
                                        >
                                            <Globe className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase">{i18n.language}</span>
                                        </button>
                                    </div>
                                    <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors">
                                        {t('login')}
                                    </Link>
                                    <Link to="/register" className="bg-primary text-white hover:bg-primary-dark px-6 py-2.5 rounded-xl transition-all duration-300 font-bold shadow-lg shadow-primary/20 active:scale-95">
                                        {t('register')}
                                    </Link>
                                </div>
                            ) : null}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-gray-800"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && currentUser && (
                    <div className="md:hidden border-t border-slate-100 dark:border-gray-800 px-4 py-4 space-y-2 bg-white dark:bg-gray-900 animate-in slide-in-from-top-2 duration-300">
                        {links.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive(link.path)
                                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <link.icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 text-textPrimary dark:text-white">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 p-2 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">{t('confirmLogout')}</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium">
                            {t('logoutConfirmMessage')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-bold"
                            >
                                {t('stayLoggedIn')}
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 dark:shadow-none"
                            >
                                <LogOut className="h-4 w-4" />
                                {t('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
