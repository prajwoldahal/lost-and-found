import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, MapPin, Shield, MessageCircle, QrCode, Globe, ArrowRight, CheckCircle, Moon, Sun } from 'lucide-react';

export default function LandingPage() {
    const { t, i18n } = useTranslation();
    const { currentUser, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser]);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'np' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="min-h-screen">

            {/* Hero Section */}
            <div className={`relative ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-slate-50 text-slate-900'} py-32 transition-colors duration-500 overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 opacity-50"></div>
                <div className={`absolute inset-0 ${isDarkMode ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]" : "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"} opacity-20`}></div>


                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-6xl md:text-8xl font-outfit font-black mb-8 leading-[0.9] tracking-tighter animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            {t('welcome')}
                        </h1>
                        <p className={`text-xl md:text-2xl mb-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in`} style={{ animationDelay: '0.2s' }}>
                            {t('heroSubtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <Link to="/register" className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-primary/40 flex items-center justify-center gap-2">
                                {t('getStartedFree')}
                                <ArrowRight className="h-6 w-6 text-accent" />
                            </Link>
                            <Link to="/login" className="glass text-slate-900 dark:text-white px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-2">
                                {t('signIn')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-32 bg-white dark:bg-gray-950 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-outfit font-black text-slate-900 dark:text-white mb-6 tracking-tighter">{t('powerfulFeatures')}</h2>
                        <div className="h-1.5 w-24 bg-accent mx-auto rounded-full mb-8"></div>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">{t('everythingYouNeed')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-slate-900 p-8 rounded-2xl hover:shadow-xl transition transform hover:-translate-y-1 border border-transparent dark:border-gray-800">
                            <div className="bg-primary text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                                <Search className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{t('advancedSearch')}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('advancedSearchDesc')}</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-slate-900 p-8 rounded-2xl hover:shadow-xl transition transform hover:-translate-y-1 border border-transparent dark:border-gray-800">
                            <div className="bg-green-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-green-600/20">
                                <MapPin className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{t('mapTracking')}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('mapTrackingDesc')}</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-slate-900 p-8 rounded-2xl hover:shadow-xl transition transform hover:-translate-y-1 border border-transparent dark:border-gray-800">
                            <div className="bg-purple-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-600/20">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{t('secureChat')}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('secureChatDesc')}</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-slate-900 p-8 rounded-2xl hover:shadow-xl transition transform hover:-translate-y-1 border border-transparent dark:border-gray-800">
                            <div className="bg-orange-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-orange-600/20">
                                <QrCode className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{t('qrCodeSharing')}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('qrCodeSharingDesc')}</p>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 p-8 rounded-2xl hover:shadow-xl transition transform hover:-translate-y-1 border border-transparent dark:border-gray-800">
                            <div className="bg-cyan-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-600/20">
                                <MessageCircle className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{t('realTimeUpdates')}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('realTimeUpdatesDesc')}</p>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-slate-900 p-8 rounded-2xl hover:shadow-xl transition transform hover:-translate-y-1 border border-transparent dark:border-gray-800">
                            <div className="bg-yellow-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-600/20">
                                <Globe className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{t('bilingualSupport')}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('bilingualSupportDesc')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="py-20 bg-slate-50 dark:bg-gray-900 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('howItWorks')}</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">{t('simpleSteps')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="bg-primary text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-primary/20">
                                1
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{t('postYourItem')}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('postYourItemDesc')}</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-primary/20">
                                2
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{t('connectChat')}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('connectChatDesc')}</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-primary/20">
                                3
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{t('reunite')}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('reuniteDesc')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-4xl font-bold mb-6">{t('readyToGetStarted')}</h2>
                    <p className="text-xl mb-8 text-blue-100">{t('joinCommunity')}</p>
                    <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-2xl font-black text-lg hover:bg-slate-50 transition transform hover:scale-105 shadow-2xl">
                        {t('createFreeAccount')}
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>

            {/* About Section */}
            <div className="py-20 bg-white dark:bg-gray-950 transition-colors duration-500">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('aboutCommunity')}</h2>
                        <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-6"></div>
                    </div>
                    <div className="prose prose-lg max-w-none text-slate-600 dark:text-slate-400">
                        <p className="text-lg leading-relaxed mb-6">
                            {t('aboutPara1')}
                        </p>
                        <p className="text-lg leading-relaxed mb-6">
                            {t('aboutPara2')}
                        </p>
                        <p className="text-lg leading-relaxed">
                            {t('aboutPara3')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-16 bg-slate-50 dark:bg-gray-900 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-transparent dark:border-gray-700">
                            <div className="text-4xl font-black text-primary dark:text-blue-400 mb-2">10,000+</div>
                            <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{t('itemsPosted')}</div>
                        </div>
                        <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-transparent dark:border-gray-700">
                            <div className="text-4xl font-black text-primary dark:text-blue-400 mb-2">8,500+</div>
                            <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{t('itemsReunited')}</div>
                        </div>
                        <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-transparent dark:border-gray-700">
                            <div className="text-4xl font-black text-primary dark:text-blue-400 mb-2">5,000+</div>
                            <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{t('activeUsers')}</div>
                        </div>
                        <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-transparent dark:border-gray-700">
                            <div className="text-4xl font-black text-primary dark:text-blue-400 mb-2">98%</div>
                            <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{t('successRate')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">{t('appName')}</h3>
                            <p className="text-gray-400">
                                {t('heroSubtitle')}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">{t('quickLinks')}</h4>
                            <ul className="space-y-2">
                                <li><Link to="/login" className="text-gray-400 hover:text-white transition">{t('login')}</Link></li>
                                <li><Link to="/register" className="text-gray-400 hover:text-white transition">{t('register')}</Link></li>
                                <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition">{t('dashboard')}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">{t('contactHelp')}</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>{t('email')}: support@lostandfound.com</li>
                                <li>{t('phone')}: +1 (555) 123-4567</li>
                                <li><a href="#" className="hover:text-white transition">{t('helpCenter')}</a></li>
                                <li><a href="#" className="hover:text-white transition">{t('reportIssue')}</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>{t('copyright')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
