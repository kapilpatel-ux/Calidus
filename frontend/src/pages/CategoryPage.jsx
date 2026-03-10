import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, CheckCircle, Filter, ChevronDown, ArrowRight, X, Package, Users, TrendingUp, Search, MapPin } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";

export const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [filters, setFilters] = useState({
    minRating: null,
    inStock: null,
    country: null,
    certification: null,
    subcategory: null,
    deliveryType: null,
    supplierName: null,
    sortBy: "rating"
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, filterRes] = await Promise.all([
          axios.get(`${API}/categories/${slug}`),
          axios.get(`${API}/filter-options`)
        ]);
        setCategory(catRes.data);
        setFilterOptions(filterRes.data);
        
        const prodRes = await axios.get(`${API}/products?category=${catRes.data.id}`);
        setProducts(prodRes.data || []);
      } catch (e) {
        console.error("Error fetching category data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const filteredProducts = products
    .filter(p => !keywordSearch || p.name.toLowerCase().includes(keywordSearch.toLowerCase()) || p.short_description.toLowerCase().includes(keywordSearch.toLowerCase()))
    .filter(p => !filters.minRating || p.rating >= filters.minRating)
    .filter(p => filters.inStock === null || p.in_stock === filters.inStock)
    .filter(p => !filters.country || p.country === filters.country)
    .filter(p => !filters.certification || p.certifications?.includes(filters.certification))
    .filter(p => !filters.subcategory || p.subcategory === filters.subcategory)
    .filter(p => !filters.deliveryType || p.delivery_type === filters.deliveryType)
    .filter(p => !filters.supplierName || p.supplier_name.toLowerCase().includes(filters.supplierName.toLowerCase()))
    .sort((a, b) => {
      if (filters.sortBy === "rating") return b.rating - a.rating;
      if (filters.sortBy === "name") return a.name.localeCompare(b.name);
      if (filters.sortBy === "newest") return -1;
      return 0;
    });

  const clearFilters = () => {
    setKeywordSearch("");
    setFilters({
      minRating: null,
      inStock: null,
      country: null,
      certification: null,
      subcategory: null,
      deliveryType: null,
      supplierName: null,
      sortBy: "rating"
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== null && v !== "rating").length + (keywordSearch ? 1 : 0);

  // Get unique suppliers from products
  const uniqueSuppliers = [...new Set(products.map(p => p.supplier_name))];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00CED1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#050505] pt-20 flex items-center justify-center">
        <p className="text-gray-400">Category not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="category-page">
      {/* Hero */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={category.image_url} alt={category.name} className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/90 to-[#050505]" />
        </div>
        <div className="container-custom relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Barlow Condensed' }} data-testid="category-title">
            {category.name.toUpperCase()} <span className="text-[#00CED1]">COMPONENTS</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-6">
            {category.description}
          </p>
          
          {/* Category Insights */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-[#0F1115]/90 border border-[#272A30] rounded-sm px-4 py-3">
              <Users className="w-5 h-5 text-[#00CED1]" />
              <div>
                <p className="text-white font-semibold">{category.active_suppliers}</p>
                <p className="text-gray-500 text-xs">Total Suppliers</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#0F1115]/90 border border-[#272A30] rounded-sm px-4 py-3">
              <Package className="w-5 h-5 text-[#00CED1]" />
              <div>
                <p className="text-white font-semibold">{category.product_count}</p>
                <p className="text-gray-500 text-xs">Total Components</p>
              </div>
            </div>
            {category.trending && (
              <div className="flex items-center gap-3 bg-[#00CED1]/10 border border-[#00CED1]/30 rounded-sm px-4 py-3">
                <TrendingUp className="w-5 h-5 text-[#00CED1]" />
                <p className="text-[#00CED1] text-sm font-medium">Trending Category</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-6 sticky top-24" data-testid="filters-sidebar">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#00CED1]" />
                    <h3 className="text-white font-semibold">Filters</h3>
                    {activeFilterCount > 0 && (
                      <span className="bg-[#00CED1] text-black text-xs font-bold px-2 py-0.5 rounded-sm">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-[#00CED1] text-sm hover:underline flex items-center gap-1"
                      data-testid="clear-filters-btn"
                    >
                      <X className="w-3 h-3" /> Clear All
                    </button>
                  )}
                </div>

                {/* Keyword Search */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm font-medium mb-3">Keyword Search</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      value={keywordSearch}
                      onChange={(e) => setKeywordSearch(e.target.value)}
                      placeholder="Search in category..."
                      className="pl-9 bg-[#050505] border-[#272A30] text-white"
                      data-testid="keyword-search"
                    />
                  </div>
                </div>

                {/* Subcategory Filter */}
                {category.subcategories?.length > 0 && (
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm font-medium mb-3">Subcategory</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {category.subcategories.map((sub) => (
                        <label key={sub} className="flex items-center gap-2 cursor-pointer group">
                          <Checkbox
                            checked={filters.subcategory === sub}
                            onCheckedChange={(checked) => setFilters(f => ({ ...f, subcategory: checked ? sub : null }))}
                          />
                          <span className="text-gray-400 text-sm group-hover:text-white transition-colors">{sub}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supplier Name */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm font-medium mb-3">Supplier Name</p>
                  <Select value={filters.supplierName || "all"} onValueChange={(val) => setFilters(f => ({ ...f, supplierName: val === "all" ? null : val }))}>
                    <SelectTrigger className="bg-[#050505] border-[#272A30] text-white">
                      <SelectValue placeholder="All Suppliers" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F1115] border-[#272A30] max-h-60">
                      <SelectItem value="all">All Suppliers</SelectItem>
                      {uniqueSuppliers.map((supplier) => (
                        <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm font-medium mb-3">Rating</p>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox
                          checked={filters.minRating === rating}
                          onCheckedChange={(checked) => setFilters(f => ({ ...f, minRating: checked ? rating : null }))}
                          data-testid={`filter-rating-${rating}`}
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                          ))}
                          <span className="text-gray-400 text-sm ml-1 group-hover:text-white transition-colors">& up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Country Filter */}
                {filterOptions.countries?.length > 0 && (
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm font-medium mb-3">Country of Origin</p>
                    <Select value={filters.country || "all"} onValueChange={(val) => setFilters(f => ({ ...f, country: val === "all" ? null : val }))}>
                      <SelectTrigger className="bg-[#050505] border-[#272A30] text-white">
                        <SelectValue placeholder="All Countries" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1115] border-[#272A30]">
                        <SelectItem value="all">All Countries</SelectItem>
                        {filterOptions.countries.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Certification Filter */}
                {filterOptions.certifications?.length > 0 && (
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm font-medium mb-3">Certification</p>
                    <Select value={filters.certification || "all"} onValueChange={(val) => setFilters(f => ({ ...f, certification: val === "all" ? null : val }))}>
                      <SelectTrigger className="bg-[#050505] border-[#272A30] text-white">
                        <SelectValue placeholder="All Certifications" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1115] border-[#272A30] max-h-60">
                        <SelectItem value="all">All Certifications</SelectItem>
                        {filterOptions.certifications.map((cert) => (
                          <SelectItem key={cert} value={cert}>{cert}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Availability Filter */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm font-medium mb-3">Availability</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={filters.inStock === true}
                        onCheckedChange={(checked) => setFilters(f => ({ ...f, inStock: checked ? true : null }))}
                        data-testid="filter-in-stock"
                      />
                      <span className="text-gray-400 text-sm group-hover:text-white transition-colors">In Stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={filters.inStock === false}
                        onCheckedChange={(checked) => setFilters(f => ({ ...f, inStock: checked ? false : null }))}
                      />
                      <span className="text-gray-400 text-sm group-hover:text-white transition-colors">Out of Stock</span>
                    </label>
                  </div>
                </div>

                {/* Delivery Type Filter */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm font-medium mb-3">Lead Time</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={filters.deliveryType === "In Stock"}
                        onCheckedChange={(checked) => setFilters(f => ({ ...f, deliveryType: checked ? "In Stock" : null }))}
                      />
                      <span className="text-gray-400 text-sm group-hover:text-white transition-colors">Ready to Ship</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={filters.deliveryType === "Made to Order"}
                        onCheckedChange={(checked) => setFilters(f => ({ ...f, deliveryType: checked ? "Made to Order" : null }))}
                      />
                      <span className="text-gray-400 text-sm group-hover:text-white transition-colors">Made to Order</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Sort Header */}
              <div className="flex items-center justify-between mb-6 bg-[#0F1115] border border-[#272A30] rounded-sm px-4 py-3">
                <p className="text-gray-400">
                  <span className="text-white font-medium">{filteredProducts.length}</span> products found
                </p>
                <Select value={filters.sortBy} onValueChange={(val) => setFilters(f => ({ ...f, sortBy: val }))}>
                  <SelectTrigger className="w-48 bg-[#050505] border-[#272A30]" data-testid="sort-select">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1115] border-[#272A30]">
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Products */}
              {filteredProducts.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredProducts.map((product, idx) => (
                    <div
                      key={product.id}
                      className="bg-[#0F1115] border border-[#272A30] rounded-sm overflow-hidden card-hover"
                      data-testid={`product-card-${idx}`}
                    >
                      <div className="aspect-video relative">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 flex gap-2">
                          {product.in_stock && (
                            <span className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-sm">
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Link 
                            to={`/supplier/${product.supplier_slug || product.supplier_id}`}
                            className="text-gray-400 text-sm hover:text-[#00CED1] transition-colors"
                          >
                            {product.supplier_name}
                          </Link>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        </div>
                        <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                            ))}
                            <span className="text-white text-sm ml-1">{product.rating}</span>
                          </div>
                          <span className="text-gray-500 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {product.country}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.short_description}</p>
                        
                        <Link
                          to={`/product/${product.slug}`}
                          className="btn-primary w-full text-center text-sm py-2"
                          data-testid={`view-details-${idx}`}
                        >
                          VIEW DETAILS
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-12 text-center" data-testid="empty-state">
                  <div className="w-16 h-16 bg-[#1A1D24] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Barlow Condensed' }}>
                    NO DIRECT MATCH FOUND
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Our experts can help you identify the right supplier or component for your requirements.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={clearFilters}
                      className="btn-secondary"
                    >
                      CLEAR FILTERS
                    </button>
                    <Link to="/contact" className="btn-primary flex items-center justify-center gap-2">
                      SPEAK TO OUR EXPERTS
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
