import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import {
    Save, Loader2, Trophy, Shield, AlertTriangle, Crown
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
    const { userData } = useAuth();
    const [settings, setSettings] = useState({
        foundItemPoints: 50,
        requireApproval: true,
        maintenanceMode: false,
        mandatoryVerification: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getSystemSettings();
            setSettings(response.data);
        } catch (error) {
            console.error("Failed to fetch admin settings:", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await adminAPI.updateSystemSettings(settings);
            toast.success('System configuration updated!');
        } catch (error) {
            toast.error('Failed to update system settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-10 w-10 text-primary animate-spin opacity-50" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2 flex items-center gap-3">
                    <Crown className="h-8 w-8 text-amber-500" />
                    System Configuration
                </h1>
                <p className="text-gray-500 font-medium text-sm">Manage global reward policies and system-wide moderation settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Reward Economy */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="font-extrabold text-lg mb-6 flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Trophy className="h-5 w-5 text-amber-600" />
                        </div>
                        Reward Economy
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Points per Found Item</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={settings.foundItemPoints}
                                    onChange={(e) => setSettings({ ...settings, foundItemPoints: parseInt(e.target.value) || 0 })}
                                    className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary font-bold transition-all text-gray-900"
                                />
                                <div className="bg-amber-100 px-4 py-3.5 rounded-2xl text-amber-600 font-black">PTS</div>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium ml-1">Reward granted to users when their found item post is approved.</p>
                        </div>
                    </div>
                </div>

                {/* Moderation Policy */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="font-extrabold text-lg mb-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        Moderation Policy
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex-1 pr-4">
                                <p className="font-bold text-gray-900">Require Approval</p>
                                <p className="text-xs text-gray-500">All new posts must be manually approved by an admin before going live.</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, requireApproval: !settings.requireApproval })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.requireApproval ? 'bg-primary shadow-inner shadow-primary-dark/40' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${settings.requireApproval ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="font-extrabold text-lg mb-6 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    System Status
                </h3>
                <div className="flex items-center justify-between py-2">
                    <div className="flex-1 pr-4">
                        <p className="font-bold text-gray-900">Maintenance Mode</p>
                        <p className="text-xs text-gray-500">Enable site-wide maintenance mode. Note: Administrators can still access all features.</p>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.maintenanceMode ? 'bg-red-500 shadow-inner' : 'bg-gray-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-12 py-4 bg-primary text-white rounded-2xl hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center gap-3 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Save System Config
                </button>
            </div>
        </div>
    );
}
