'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { 
  Car, Filter, Search, ShoppingCart, 
  ChevronRight, X, SlidersHorizontal,
  SortAsc, SortDesc, DollarSign, Calendar,
  Fuel, Settings
} from 'lucide-react';
import { debounce } from 'lodash';

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    minPrice: '',
    maxPrice: '',
    year: '',
    transmission: '',
    color: '',
    sortBy: 'newest',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    lowestPrice: 0,
    highestPrice: 0,
    availableYears: [],
    availableColors: [],
  });

  const { addToCart } = useCart();

  // Fetch inventory data
  const fetchInventory = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      
      const response = await fetch(`/api/inventory?${queryParams}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch inventory');
      }
      
      setVehicles(data.data);
      setFilteredVehicles(data.data);
      
      // Calculate stats if we have data
      if (data.data.length > 0) {
        const prices = data.data.map(v => v.price);
        const years = [...new Set(data.data.map(v => v.year))].sort((a, b) => b - a);
        const colors = [...new Set(data.data.map(v => v.color))];
        
        setStats({
          total: data.data.length,
          lowestPrice: Math.min(...prices),
          highestPrice: Math.max(...prices),
          availableYears: years,
          availableColors: colors,
        });
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query) => {
      fetchInventory({ ...activeFilters, search: query });
    }, 300),
    [fetchInventory, activeFilters]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    const newFilters = { 
      ...activeFilters, 
      [filterName]: value 
    };
    setActiveFilters(newFilters);
    fetchInventory({ ...newFilters, search: searchQuery });
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      minPrice: '',
      maxPrice: '',
      year: '',
      transmission: '',
      color: '',
      sortBy: 'newest',
    };
    setActiveFilters(clearedFilters);
    setSearchQuery('');
    fetchInventory(clearedFilters);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: <SortDesc size={16} /> },
    { value: 'oldest', label: 'Oldest First', icon: <SortAsc size={16} /> },
    { value: 'price_low', label: 'Price: Low to High', icon: <DollarSign size={16} /> },
    { value: 'price_high', label: 'Price: High to Low', icon: <DollarSign size={16} /> },
    { value: 'year_high', label: 'Year: High to Low', icon: <Calendar size={16} /> },
    { value: 'year_low', label: 'Year: Low to High', icon: <Calendar size={16} /> },
  ];

  // Get active filter count
  const activeFilterCount = Object.values(activeFilters).filter(
    (value, key) => key !== 'sortBy' && value
  ).length;

  return(
    <div className='min-h-screen bg-gray-50 dark:bg-black'>
        {/* Hero Headerr */}

        <div className='bg-gradient-to-r from-blue-900 to-gray-900 text-white py-16'>
            <div className='container mx-auto px-4'>
                <div className='max-w-3xl mx-auto text-center'>
                    <h1 className='text-4xl md:text-5xl font-bold mb-6'>
                        Find Your Dream Car
                    </h1>
                    <p className='text-xl text-blue-100 mb-8'>
                        Browse our Premium selection of cars
                    </p>

                    {/* Search Bar */}
                    
                    <div className='relative max-w-2xl mx-auto'>
                        <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' size={24} />
                        <input 
                        type='text'
                        placeholder='Search via model, feature or colour...'
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className='w-full pl-12 pr-4 py-4 rounded-lg bg-white/10 backdrop:blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    fetchInventory({...activeFilters, search: ''});
                                }}
                                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white' >

                                <X size={20} />
                                </button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className='container mx-auto px-4 py-8'>
            {/* stats bar*/}

            <div className='bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                    <div className='text-center md:text-left'>
                        <div className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
                            {stats.total}
                        </div>
                        <div className='text-gray-600 dark:text-gray-400'>
                            vehicles available
                        </div>
                    </div>
                    <div className='text-center md:text-left'>
                        <div className='text-3xl font-bold text-green-600 dark:text-green-400'>
                            {formatCurrency(stats.lowestPrice)}
                        </div>
                        <div className='text-gray-600 dark:text-gray-400'>
                            Starting from
                        </div>
                    </div>

                        <div className='text-center md:text-left'>
                            <div className='text-3xl font-bold text-purple-600 dark:text-purple-400'>
                                {stats.availableYears.length}
                            </div>
                            <div className='text-gray-600 dark:text-gray-400'>
                                Model Years
                            </div>
                        </div>
                        <div className='text-center md:text-left'>
                            <div className='text-3xl font-bold text-orange-600 dark:text-orange-400'>
                                {stats.availableColors.length}
                            </div>
                            <div className='text-gray-600 dark:text-gray-400'>
                                Color Options
                            </div>
                        </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='flex flex-col lg:flex-row gap-8'>
                {/*filters sidebar*/}
                <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className='bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sticky top-24'>
                            <div className='flex items-center justify-between mb-6'>
                                <div className='flex items-center gap-2'>
                                    <SlidersHorizontal className='text-blue-600' size={24} />
                                    <h2 className='text-2xl font-bold text-black dark:text-white'>filters</h2>
                                </div>
                                <div className='flex items-center gap-2'>
                                    {activeFilterCount > 0 && (
                                        <span className='bg-blue-600 text-white text-sm px-2 py-1 rounded-full'>
                                            {activeFilterCount}
                                        </span>
                                    )}
                                    <button
                                    onClick={clearFilters}
                                    className='text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'>
                                        Clear all
                                    </button>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className='lg:hidden text-gray-500 hover:text-gray-700' >
                                            <X size={20} />
                                        </button>
                                </div>
                            </div>

                            {/*SORT BY*/}

                            <div className='mb-6'>
                                <label className='block text-sm font-semibold mb-3 text-black dark:text-white'>
                                    Sort By
                                </label>

                                <div className='space-y-2'>
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleFilterChange('sortBy', option.value)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                                activeFilters.sortBy === option.value
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                            }`}
                                            >
                                                {option.icon}
                                            </button>
                                    ))}
                                    </div>    
                            </div>

                            {/* Price Range */}

                            <div className='mb-6'>
                                <label className='block text-sm font-semibold mb-3 text-black dark:text-white'>
                                    Price Range
                                </label>
                                <div className='grid grid-cols-2 gap-3'>
                                    
                                </div>
                            </div>
                        </div>
                </div>
            </div>

        </div>

    </div>
  )