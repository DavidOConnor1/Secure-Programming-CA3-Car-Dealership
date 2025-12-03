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