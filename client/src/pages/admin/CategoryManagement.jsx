// File: CategoryManagement.jsx
// Description: Simplified admin category management UI to match dashboard style.

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Plus, Trash2, Tag, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function CategoryManagement() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await adminAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(t('failedToLoadData'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error(t('enterCategoryName'));
      return;
    }
    try {
      const newCat = { name: newCategoryName, icon: '📦', itemCount: 0, active: true };
      const response = await adminAPI.addCategory(newCat);
      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setShowAddCategory(false);
      toast.success(t('categoryAddedSuccessfully'));
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(t('failedToAddCategory'));
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (window.confirm(t('deleteCategoryConfirm'))) {
      try {
        await adminAPI.deleteCategory(catId);
        setCategories(categories.filter(c => c.id !== catId));
        toast.success(t('categoryDeleted'));
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(t('failedToDeleteCategory'));
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
          <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            {t('taxonomyEngine')}
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">
            {t('classifyOrganizeAssets')}
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              {t('assetClassifications')}
            </h2>
          </div>
          <button
            onClick={() => setShowAddCategory(true)}
            className="px-6 py-2 bg-primary text-white rounded-2xl font-semibold uppercase tracking-widest text-[10px] hover:bg-primary/80 transition"
          >
            {t('addNewCategory')}
          </button>
        </div>

        {showAddCategory && (
          <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
              {t('defineNewCategory')}
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder={t('enterClassificationName')}
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-green-600 text-white rounded-2xl font-semibold uppercase tracking-widest text-[10px] hover:bg-green-700 transition"
                >
                  {t('confirm')}
                </button>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-semibold uppercase tracking-widest text-[10px] hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <div
                key={category.id}
                className="relative bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:border-primary/50 hover:bg-white dark:hover:bg-gray-900 transition shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    {category.icon || '📦'}
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                  {t(category.name.toLowerCase(), { defaultValue: category.name })}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {t('assetsCount')}
                  </span>
                  <span className="px-2 py-0.5 bg-primary/5 dark:bg-primary/10 text-primary text-[9px] font-black rounded-md">
                    {category.itemCount || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
            <Tag className="h-16 w-16 text-gray-100 dark:text-gray-900 mx-auto mb-6" />
            <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">
              {t('taxonomyVacant')}
            </p>
          </div>
        )}
      </div>

      {/* Geographic Framework Info */}
      <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/10 flex items-center gap-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">
            {t('geographicFramework')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight">
            {t('locationManagementInfo')}
          </p>
        </div>
      </div>
    </div>
  );
}
