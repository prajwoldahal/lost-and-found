import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postAPI } from '../services/api';
import ItemsMap from '../components/ItemsMap';
import VerifiedBadge from '../components/VerifiedBadge';
import { Search as SearchIcon, Filter, MapPin, Calendar, Tag, SlidersHorizontal, X, Map as MapIcon, Grid3x3, Loader2 } from 'lucide-react';

export default function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

    // Filter states
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

    const [radiusFilter, setRadiusFilter] = useState('3');
    const [userLocation, setUserLocation] = useState(null);
    const categories = ['All', 'Electronics', 'Documents', 'Accessories', 'Pets', 'Clothing', 'Keys', 'Bags', 'Other'];
    const statuses = ['All', 'Active', 'Claimed', 'Returned'];

    // Haversine formula to calculate distance in km
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    // If location access denied, default to 'all' to avoid returning empty results unexpectedly
                    setRadiusFilter('all');
                }
            );
        } else {
            setRadiusFilter('all');
        }
    }, []);

    // Fetch items from Firestore
    useEffect(() => {
        setLoading(true);
        // Safety timeout
        const timer = setTimeout(() => {
            setLoading((l) => {
                if (l) return false;
                return l;
            });
        }, 10000);

        const fetchItems = async () => {
            setLoading(true);
            try {
                const response = await postAPI.getAll();
                setItems(response.data);
            } catch (error) {
                console.error("Search fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();

        return () => {
            clearTimeout(timer);
        };
    }, []);

    // Filter items
    useEffect(() => {
        let result = [...items];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.title?.toLowerCase().includes(term) ||
                item.description?.toLowerCase().includes(term) ||
                item.category?.toLowerCase().includes(term) ||
                item.locationName?.toLowerCase().includes(term)
            );
        }

        // Type filter
        if (typeFilter !== 'all') {
            result = result.filter(item => item.type === typeFilter);
        }

        // Category filter
        if (categoryFilter !== 'all') {
            result = result.filter(item => item.category?.toLowerCase() === categoryFilter.toLowerCase());
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(item => item.status?.toLowerCase() === statusFilter.toLowerCase());
        }

        // Radius Filter
        if (radiusFilter !== 'all' && userLocation) {
            const radius = parseInt(radiusFilter);
            result = result.filter(item => {
                // If item has no location, we can't filter by radius, so we exclude it (safe default)
                // or include it? Usually exclude if strict distance.
                if (!item.location || !item.location.lat || !item.location.lng) return false;

                const dist = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    item.location.lat,
                    item.location.lng
                );
                return dist <= radius;
            });
        }

        // Sorting
        switch (sortBy) {
            case 'recent':
                result.sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                    return dateB - dateA;
                });
                break;
            case 'oldest':
                result.sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                    return dateA - dateB;
                });
                break;
            case 'views':
                result.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            default:
                break;
        }

        setFilteredItems(result);
    }, [searchTerm, typeFilter, categoryFilter, statusFilter, sortBy, radiusFilter, userLocation, items]);

    const clearFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setCategoryFilter('all');
        setStatusFilter('all');
        setSortBy('recent');
        setRadiusFilter('all'); // Reset radius too
    };

    const formatDate = (dateStr, timestamp) => {
        if (dateStr) return dateStr;
        if (timestamp?.toDate) return timestamp.toDate().toLocaleDateString();
        return '';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Search Lost & Found Items</h1>
                <p className="text-gray-600 dark:text-gray-400">Find items that have been lost or found in your community</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, description, category, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 font-medium"
                    >
                        <Filter className="h-5 w-5" />
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <SlidersHorizontal className="h-5 w-5" />
                            Filters
                        </h3>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-primary hover:text-primary-dark font-medium"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                            >
                                <option value="all">All Items</option>
                                <option value="lost">Lost Only</option>
                                <option value="found">Found Only</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status.toLowerCase()}>{status}</option>
                                ))}
                            </select>
                        </div>

                        {/* Radius Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                                Distance
                                {!userLocation && <span className="text-[10px] text-orange-500">(Loc Required)</span>}
                            </label>
                            <select
                                value={radiusFilter}
                                onChange={(e) => setRadiusFilter(e.target.value)}
                                disabled={!userLocation}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-400 dark:text-white"
                                title={!userLocation ? "Location permission required" : "Filter by distance"}
                            >
                                <option value="3">Within 3 km (Default)</option>
                                <option value="10">Within 10 km</option>
                                <option value="25">Within 25 km</option>
                                <option value="all">Show All (Slow)</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                            >
                                <option value="recent">Most Recent</option>
                                <option value="oldest">Oldest First</option>
                                <option value="views">Most Viewed</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* View Toggle & Results Count */}
            <div className="flex items-center justify-between mb-6">
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                    <span className="font-semibold text-gray-900 dark:text-white">{filteredItems.length}</span> items found
                    {radiusFilter !== 'all' && userLocation && (
                        <span className="ml-2 text-sm text-primary bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/20">
                            Within {radiusFilter}km
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-bold ${viewMode === 'grid'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Grid3x3 className="h-4 w-4" />
                        Grid
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-bold ${viewMode === 'map'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <MapIcon className="h-4 w-4" />
                        Map
                    </button>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
            ) : viewMode === 'grid' ? (
                filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                            <Link
                                key={item.id}
                                to={`/post/${item.id}`}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 text-left border border-gray-100 dark:border-gray-700"
                            >
                                <div className="h-48 bg-gray-200 dark:bg-gray-900 relative">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                                            No Image
                                        </div>
                                    )}
                                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'
                                        }`}>
                                        {item.type.toUpperCase()}
                                    </span>
                                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border-2 ${item.status === 'active' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        item.status === 'claimed' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                            'bg-green-100 text-green-700 border-green-200'
                                        }`}>
                                        {item.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <img
                                            src={item.creatorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                            alt={item.creatorName || 'User'}
                                            className="h-6 w-6 rounded-full border border-gray-100 dark:border-gray-700"
                                        />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.creatorName || 'User'}</span>
                                        <VerifiedBadge verified={false} />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition">{item.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 h-10">{item.description}</p>
                                    <div className="space-y-2 text-xs pt-4 border-t border-gray-50 dark:border-gray-700">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Tag className="h-4 w-4" />
                                            <span>{item.category}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <MapPin className="h-4 w-4" />
                                            <span className="line-clamp-1">{item.locationName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDate(item.date, item.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-100 dark:border-gray-700">
                        <SearchIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No items found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
                        <button
                            onClick={clearFilters}
                            className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-bold shadow-lg shadow-primary/20"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700" style={{ height: '600px' }}>
                    <ItemsMap items={filteredItems} userLocation={userLocation} center={userLocation ? [userLocation.lat, userLocation.lng] : [27.7172, 85.3240]} />
                </div>
            )}
        </div>
    );
}
