import { useState, useEffect, useCallback, useMemo } from "react";

import { useCart } from "../context/cartContext";

import {
    Car, Filter, Search, ShoppingCart,
    ChevronRight, X, SliderHorizontal,
    SortAsc, SortDesc, DollarSign, Calender,
    Fuel, Settings
} from 'lucide-react';

import {debounce} from 'lodash';

export default function inventoryPage() {
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState({
        
    })

}