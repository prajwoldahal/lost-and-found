import { useState, useEffect } from 'react';
import { adminAPI, postAPI } from '../../services/api';
import { Plus, Edit2, Trash2, MapPin, Tag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]); // Simplified for now
    const [loading, setLoading] = useState(true);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch categories via API
            const response = await adminAPI.getCategories();
            const fetchedCats = response.data;

            if (fetchedCats.length === 0) {
                // Seed default categories if empty
                const defaultCats = ['Electronics', 'Documents', 'Accessories', 'Clothing', 'Keys', 'Bags', 'Pets', 'Other'];
                // We won't auto-seed to avoid write spam, just show empty
            }

            setCategories(fetchedCats);

            // Locations would follow similar pattern
            // For now, we'll keep locations local or fetch if collection exists
            // To keep it simple for this session, I'll focus on Categories which are used in app
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error('Please enter a category name');
            return;
        }

        try {
            const newCat = {
                name: newCategoryName,
                icon: '📦', // Default icon
                itemCount: 0,
                active: true
            };

            const response = await adminAPI.addCategory(newCat);
            setCategories([...categories, response.data]);
            setNewCategoryName('');
            setShowAddCategory(false);
            toast.success('Category added successfully');
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error('Failed to add category');
        }
    };

    const handleDeleteCategory = async (catId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await adminAPI.deleteCategory(catId);
                setCategories(categories.filter(c => c.id !== catId));
                toast.success('Category deleted');
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.error('Failed to delete category');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Taxonomy Engine</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Classify and organize community lost & found assets</p>
                </div>
            </div>

            {/* Categories Section */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-10 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Tag className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Asset Classifications</h2>
                    </div>
                    <button
                        onClick={() => setShowAddCategory(!showAddCategory)}
                        className="px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.05] active:scale-[0.95] transition shadow-lg shadow-primary/30 flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New Classification
                    </button>
                </div>

                {showAddCategory && (
                    <div className="mb-10 p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-4 duration-300">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Define New Category</label>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Enter classification name (e.g., Cryptography)"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm font-bold transition-all"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddCategory}
                                    className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-green-700 transition"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setShowAddCategory(false)}
                                    className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    Abort
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <div key={category.id} className="group relative bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 hover:border-primary/50 hover:bg-white dark:hover:bg-gray-900 transition duration-300 shadow-sm hover:shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition duration-300">
                                        {category.icon || '📦'}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="p-2 text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">{category.name}</h3>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Scale</span>
                                    <span className="px-2 py-0.5 bg-primary/5 dark:bg-primary/10 text-primary text-[9px] font-black rounded-md">{category.itemCount || 0} Assets</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem]">
                        <Tag className="h-16 w-16 text-gray-100 dark:text-gray-900 mx-auto mb-6" />
                        <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">The taxonomy is currently vacant.</p>
                    </div>
                )}
            </div>

            <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-3xl border border-primary/10 flex items-center gap-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Geographic Framework</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight">Location management is offloaded to Google Maps Autocomplete for global precision.</p>
                </div>
            </div>
        </div>
    );
}
