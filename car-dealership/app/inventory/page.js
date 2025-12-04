"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useCart } from "../context/CartContext";
import {
  Car,
  Filter,
  Search,
  ShoppingCart,
  ChevronRight,
  X,
  SlidersHorizontal,
  SortAsc,
  SortDesc,
  DollarSign,
  Calendar,
  Fuel,
  Settings,
} from "lucide-react";
import { debounce, filter } from "lodash";

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    minPrice: "",
    maxPrice: "",
    year: "",
    transmission: "",
    color: "",
    sortBy: "newest",
  });

  const [urlFragmentData, setUrlFragmentData] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    lowestPrice: 0,
    highestPrice: 0,
    availableYears: [],
    availableColors: [],
  });

  const { addToCart } = useCart();

  useEffect(() => {
    const parseUrlFragment = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        try {
          //eval like behaviour for url fragments
          const fragmentData = JSON.parse(decodeURIComponent(hash));
          setUrlFragmentData(fragmentData);

          //if fragment has search data apply it
          if (fragmentData.search) {
            setSearchQuery(fragmentData.search);
            setTimeout(() => {
              fetchInventory({ ...activeFilters, search: fragmentData.search });
            }, 100);
          }

          //apply filters from URL
          if (fragmentData.filters) {
            setActiveFilters((prev) => ({
              ...prev,
              ...fragmentData.filters,
            }));
          }

          //dom based xss. it updates the ui based on url fragment
          if (fragmentData.highlight) {
            //appears normal but is vulnerable
            const highlightEl = document.createElement("div");
            highlightEl.id = "url-highlight";
            highlightEl.innerHTML = `Currently viewing: ${fragmentData.highlight}`;
            highlightEl.className =
              "p-2 bg-yellow-100 mb-4 rounded text-gray-800";

            const container = document.querySelector(".container.mx-auto");
            if (container) {
              //checks if the highlight already exists
              const existingHighlight =
                document.getElementById("url-highlight");
              if (existingHighlight) {
                existingHighlight.remove();
              }
              container.prepend(highlightEl);
            }
          }
          console.log("URL fragment has parsed: ", fragmentData);
        } catch (error) {
          console.log("Could not parse URL fragment: ", error.message);
        }
      }
    };

    //parses on intial load
    parseUrlFragment();

    //listen for hash changes
    window.addEventListener("hashchange", parseUrlFragment);

    return () => {
      window.removeEventListener("hashchange", parseUrlFragment);
      //cleans up any injected elements
      const highlightEl = document.getElementById("url-highlight");
      if (highlightEl) {
        highlightEl.remove();
      }
    };
  }, []);

  //saves current search to the url fragment

  const saveSearchToUrl = () => {
    const searchState = {
      search: searchQuery,
      filters: activeFilters,
      //users input in url fragment
      highlight: `Results for: ${searchQuery || "All vehicles"}`,
      timestamp: new Date().toISOString(),
      source: "inventory_page",
    };

    window.location.hash = encodeURIComponent(JSON.stringify(searchState));

    //notification
    const notification = document.createElement("div");
    notification.textContent = "Search state saved to url";
    notification.className =
      "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  //function for autocompletion

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (query) => {
        if (query.length < 2) {
          setSuggestions([]);
          return;
        }

        try {
          const response = await fetch(
            `/api/search-suggestions?q=${encodeURIComponent(query)}`
          );

          const data = await response.json();

          if (data.success) {
            setSuggestions(data.suggestions);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.log("Suggestion error: ", error);
        }
      }, 200),
    []
  );

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
        throw new Error(data.message || "Failed to fetch inventory");
      }

      setVehicles(data.data);
      setFilteredVehicles(data.data);

      // Calculate stats if we have data
      if (data.data.length > 0) {
        const prices = data.data.map((v) => v.price);
        const years = [...new Set(data.data.map((v) => v.year))].sort(
          (a, b) => b - a
        );
        const colors = [...new Set(data.data.map((v) => v.color))];

        setStats({
          total: data.data.length,
          lowestPrice: Math.min(...prices),
          highestPrice: Math.max(...prices),
          availableYears: years,
          availableColors: colors,
        });
      }

      if (data.isInjected && filters.search) {
        // Small console warning (not visible to user)
        console.warn(`SQL Injection detected: "${filters.search}"`);

        // Quiet alert that doesn't interrupt flow
        setTimeout(() => {
          alert(
            `Search query processed: "${filters.search}"\nReturned ${data.data.length} vehicles\n\nNote: This search uses string concatenation which may have security implications.`
          );
        }, 100);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching inventory:", err);
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
    () =>
      debounce((query) => {
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
      [filterName]: value,
    };
    setActiveFilters(newFilters);
    fetchInventory({ ...newFilters, search: searchQuery });
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      minPrice: "",
      maxPrice: "",
      year: "",
      transmission: "",
      color: "",
      sortBy: "newest",
    };
    setActiveFilters(clearedFilters);
    setSearchQuery("");
    fetchInventory(clearedFilters);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Sort options
  const sortOptions = [
    { value: "newest", label: "Newest First", icon: <SortDesc size={16} /> },
    { value: "oldest", label: "Oldest First", icon: <SortAsc size={16} /> },
    {
      value: "price_low",
      label: "Price: Low to High",
      icon: <DollarSign size={16} />,
    },
    {
      value: "price_high",
      label: "Price: High to Low",
      icon: <DollarSign size={16} />,
    },
    {
      value: "year_high",
      label: "Year: High to Low",
      icon: <Calendar size={16} />,
    },
    {
      value: "year_low",
      label: "Year: Low to High",
      icon: <Calendar size={16} />,
    },
  ];

  // Get active filter count
  const activeFilterCount = Object.values(activeFilters).filter(
    (value, key) => key !== "sortBy" && value
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Hero Headerr */}

      <div className="bg-gradient-to-r from-blue-900 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Dream Car
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Browse our Premium selection of cars
            </p>

            {/* Search Bar */}

            <div className="relative max-w-2xl mx-auto">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={24}
              />
              <input
                type="text"
                placeholder="Search via model, feature or colour..."
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value;
                  setSearchQuery(query);
                  fetchSuggestions(query);
                  debouncedSearch(query);
                }}
                onFocus={() =>
                  searchQuery.length >= 2 && setShowSuggestions(true)
                }
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/10 backdrop:blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/*drops down the suggestions */}

             {showSuggestions && suggestions.length > 0 && (
  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
    {suggestions.map((suggestion, index) => {
      // Extract clean text from the HTML suggestion
      const cleanText = suggestion
        .replace(/<[^>]*>/g, '') 
        .replace(/&[^;]+;/g, '') 
        .trim();
      
      return (
        <div
          key={index}
          onClick={() => {
            // Set the CLEAN text, not the HTML
            setSearchQuery(cleanText);
            fetchInventory({ ...activeFilters, search: cleanText });
            setShowSuggestions(false);
          }}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700 last:border-b-0"
           This renders the HTML with potential XSS
          dangerouslySetInnerHTML={{ __html: suggestion }}
        />
      );
    })}
  </div>
)}

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    fetchInventory({ ...activeFilters, search: "" });
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* stats bar*/}

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center md:text-left">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                vehicles available
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.lowestPrice)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Starting from
              </div>
            </div>

            <div className="text-center md:text-left">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.availableYears.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Model Years
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.availableColors.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Color Options
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/*filters sidebar*/}
          <div
            className={`lg:w-1/4 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="text-blue-600" size={24} />
                  <h2 className="text-2xl font-bold text-black dark:text-white">
                    filters
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/*SORT BY*/}

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-black dark:text-white">
                  Sort By
                </label>

                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange("sortBy", option.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeFilters.sortBy === option.value
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {option.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-black dark:text-white">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Min $"
                      value={activeFilters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max $"
                      value={activeFilters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Range : {formatCurrency(stats.lowestPrice)} -{" "}
                  {formatCurrency(stats.highestPrice)}
                </div>
              </div>

              {/*Year*/}

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-black dark:text-white">
                  Year
                </label>
                <select
                  value={activeFilters.year}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                >
                  <option value="">All Years</option>
                  {stats.availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/*Transmission*/}

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-black dark:text-white">
                  Transmission
                </label>
                <div className="space-y-2">
                  {["Manual", "Automatic", "CVT", "Dual-Clutch"].map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        handleFilterChange(
                          "transmission",
                          activeFilters.transmission === type ? "" : type
                        )
                      }
                      className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                        activeFilters.transmission === type
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <Settings className="inline mr-2" size={16} />
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colour */}
              {stats.availableColors.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-black dark:text-white">
                    Color
                  </label>
                  <select
                    value={activeFilters.color}
                    onChange={(e) =>
                      handleFilterChange("color", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                  >
                    <option value="">All Colors</option>
                    {stats.availableColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Page Content*/}

          <div className="flex-1">
            {/*results count*/}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                available vehicles ({vehicles.length})
              </h2>

              <button
                onClick={saveSearchToUrl}
                className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                title="Save current search to URL"
              >
                Save Search
              </button>
            </div>

            {urlFragmentData && (
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Loaded from saved search
                  </span>
                  <button
                    onClick={() => {
                      window.location.hash = "";
                      setUrlFragmentData(null);
                      const highlightEl =
                        document.getElementById("url-highlight");
                      if (highlightEl) highlightEl.remove();
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                {process.env.NODE_ENV === "development" && (
                  <div className="mt-1 text-xs font-mono text-gray-500 overflow-x-auto">
                    {JSON.stringify(urlFragmentData).substring(0, 100)}...
                  </div>
                )}
              </div>
            )}

            {/*Loading States*/}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading Vehicles...
                </p>
              </div>
            )}
            {/*Error State*/}
            {error && !loading && (
              <div className="text-center py-12">
                <div className="text-red-600 dark:text-red-400 mb-4">
                  Error Loading Inventory
                </div>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            )}

            {/*Empty State*/}
            {!loading && !error && vehicles.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                  No Vehicles Found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Try Adjusting your search or filters
                </p>
              </div>
            )}

            {/*Vehicle Grid*/}
            {!loading && !error && vehicles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {/*Vehicle Image*/}
                    <div className="h-56 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
                      <img
                        src={vehicle.image_url}
                        alt={vehicle.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    {/*Vehicle Info*/}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-black dark:text-white">
                            {vehicle.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                              {vehicle.year}
                            </span>
                            <span className="text-gray-400">.</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {vehicle.mileage?.toLocaleString()} km
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-black dark:text-white">
                            {formatCurrency(vehicle.price)}
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      {vehicle.features && vehicle.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {vehicle.features.slice(0, 3).map((feature, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}

                      {/*add to cart Button*/}

                      <button
                        onClick={() => addToCart(vehicle)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={20} />
                        Add to Cart
                      </button>

                      {/*Share Button*/}
                      <div className="mt-3 pt-3 border-t dark:border-gray-700">
                        <button
                          onClick={() => {
                            const shareText = `Check out this ${
                              vehicle.name
                            } for ${formatCurrency(vehicle.price)}!`;

                            const shareUrl = `${
                              window.location.origin
                            }/inventory#${encodeURIComponent(
                              JSON.stringify({
                                vehicleId: vehicle.id,
                                //user controlled data within the message
                                message:
                                  shareText +
                                  `<img src="/api/track/share/${vehicle.id}" style="display:none">`,
                                source: "share",
                              })
                            )}`;
                            navigator.clipboard.writeText(shareUrl);
                            alert("Link copied to clipboard!");
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 w-full text-center"
                        >
                          Share Vehicle
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
