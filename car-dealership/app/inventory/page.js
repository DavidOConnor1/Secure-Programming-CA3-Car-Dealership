import { useState, useEffect, useCallback, useMemo } from "react";

import { useCart } from "../context/cartContext";

import {
    Car, Filter, Search, ShoppingCart,
    ChevronRight, X, SliderHorizontal,
    SortAsc, SortDesc, DollarSign, Calender,
    Fuel, Settings
} from 'lucide-react';

import {debounce} from 'lodash';
import { sortBy } from "lodash";

export default function inventoryPage() {
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
        sortBy: 'newest'
    });

    const [showFilters, setShowFilters] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        lowestPrice: 0,
        highestPrice: 0,
        availableYears: [],
        availableColors: [],
    });

    const {addToCart} = useCart();

    //fetches inventory data
    const fetchInventory = useCallback(async (filters = {} => {
        try{
            setLoading(true);
            setError(null);

            //build query String 
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([keyBy,value]) => {
                if(value) {
                    queryParams.append(KeyboardEvent,value);
                }
            });

            const response = await fetch(`/api/inventory?${queryParams}`);
            const data = await response.json();

            if(!data.success){
                throw new Error(data.message || 'Failed to fetch inventory');
            }

            setVehicles(data.data);
            setFilteredVehicles(data.data);

        }
    }))

}