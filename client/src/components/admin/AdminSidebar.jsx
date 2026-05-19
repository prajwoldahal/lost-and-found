// File: AdminSidebar.jsx
// Description: Module: Handles AdminSidebar logical operations.

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Users,
    Flag,
    Tags,
    Settings,
    LogOut,
    Shield,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    ScrollText
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// React Component: Renders the AdminSidebar user interface elements dynamically
export default function AdminSidebar() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { userData, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutPress = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        setShowLogoutModal(false);
        await logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: t('dashboard') },
        { path: '/admin/posts', icon: FileText, label: t('adminPosts') },
        { path: '/admin/users', icon: Users, label: t('adminUsers') },
        { path: '/admin/reports', icon: Flag, label: t('adminReports') },
        { path: '/admin/claims', icon: Shield, label: t('adminClaims') },
        { path: '/admin/categories', icon: Tags, label: t('adminCategories') },
        { path: '/admin/settings', icon: Settings, label: t('settings') },
        { path: '/admin/logs', icon: ScrollText, label: t('adminLogs') },
    ];

    return (
        <>
            <div className={`bg-primary text-white h-screen flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
                {/* Header */}
                <div className="p-4 border-b border-blue-800">
                    <div className="flex items-center justify-between">
                        {!collapsed && (
                            <div className="flex items-center gap-2">
                                <Shield className="h-6 w-6" />
                                <span className="font-bold text-lg">{t('adminPanel')}</span>
                            </div>
                        )}
                        {collapsed && <Shield className="h-6 w-6 mx-auto" />}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-1 hover:bg-primary-dark rounded transition"
                        >
                            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* User Info */}
                {!collapsed && (
                    <div className="p-4 border-b border-blue-800">
                        <div className="flex items-center gap-3">
                            <img
                                src={userData?.photoURL || 'https://ui-avatars.com/api/?name=Admin&background=10B981&color=fff'}
                                alt="Admin"
                                className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{userData?.displayName || t('admin')}</p>
                                <p className="text-xs text-blue-200 truncate">{userData?.role || t('administrator', { defaultValue: 'Administrator' })}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${active
                                    ? 'bg-white text-primary font-medium'
                                    : 'text-blue-100 hover:bg-primary-dark'
                                    } ${collapsed ? 'justify-center' : ''}`}
                                title={collapsed ? item.label : ''}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-blue-800 space-y-2">
                    <button
                        onClick={handleLogoutPress}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-blue-100 hover:bg-red-600 hover:text-white w-full ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? t('logout') : ''}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span>{t('logout')}</span>}
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 text-textPrimary">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 p-2 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{t('confirmLogoutAdmin')}</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            {t('logoutAdminMessage')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
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
