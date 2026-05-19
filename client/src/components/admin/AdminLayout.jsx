// File: AdminLayout.jsx
// Description: Admin Panel Sidebar Layout: Navigation sidebar for moderators to jump between logs, claims, and reports.

import AdminSidebar from './AdminSidebar';
import { useTranslation } from 'react-i18next';

// React Component: Renders the AdminLayout user interface elements dynamically
export default function AdminLayout({ children }) {
    const { t, i18n } = useTranslation();

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-primary">{t('adminDashboardTitle')}</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-textSecondary dark:text-gray-400 font-medium">
                                {new Date().toLocaleDateString(i18n.language === 'np' ? 'ne-NP' : 'en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-950 transition-colors">
                    {children}
                </main>
            </div>
        </div>
    );
}
