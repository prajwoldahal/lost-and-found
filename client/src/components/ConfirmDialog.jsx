import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ConfirmDialog({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText, 
    cancelText, 
    isLoading 
}) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100 dark:border-gray-700 transform scale-100 animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <button 
                            onClick={onClose}
                            disabled={isLoading}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title || t('confirmAction', 'Confirm Action')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                        {message || t('areYouSure', 'Are you sure you want to proceed?')}
                    </p>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            {cancelText || t('cancel', 'Cancel')}
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />}
                            {confirmText || t('confirm', 'Confirm')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
