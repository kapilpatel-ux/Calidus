import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, CheckCircle, Filter, ChevronDown, ArrowRight } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minRating: null,
    inStock: null,
    sortBy: "rating"
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await axios.get(`${API}/categories/${slug}`);
        setCategory(catRes.data);
        
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
    .filter(p => !filters.minRating || p.rating >= filters.minRating)
    .filter(p => filters.inStock === null || p.in_stock === filters.inStock)
    .sort((a, b) => {
      if (filters.sortBy === "rating") return b.rating - a.rating;
      if (filters.sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

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
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={category.image_url} alt={category.name} className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/90 to-[#050505]" />
        </div>
        <div className="container-custom relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Barlow Condensed' }} data-testid="category-title">
            {category.name.toUpperCase()} <span className="text-[#00CED1]">COMPONENTS</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            {category.description}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-6 sticky top-24" data-testid="filters-sidebar">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="w-5 h-5 text-[#00CED1]" />
                  <h3 className="text-white font-semibold">Filters</h3>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-3">Minimum Rating</p>
                  <div className="space-y-2">
                    {[4, 3, 2].map(rating => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filters.minRating === rating}
                          onCheckedChange={(checked) => setFilters(f => ({ ...f, minRating: checked ? rating : null }))}
                          data-testid={`filter-rating-${rating}`}
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                          ))}
                          <span className="text-gray-400 text-sm ml-1">& up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stock Filter */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-3">Availability</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.inStock === true}
                      onCheckedChange={(checked) => setFilters(f => ({ ...f, inStock: checked ? true : null }))}
                      data-testid="filter-in-stock"
                    />
                    <span className="text-gray-400 text-sm">In Stock Only</span>
                  </label>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setFilters({ minRating: null, inStock: null, sortBy: "rating" })}
                  className="text-[#00CED1] text-sm hover:underline"
                  data-testid="clear-filters-btn"
                >
                  Clear all filters
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Sort Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-400">
                  <span className="text-white font-medium">{filteredProducts.length}</span> products found
                </p>
                <Select value={filters.sortBy} onValueChange={(val) => setFilters(f => ({ ...f, sortBy: val }))}>
                  <SelectTrigger className="w-48 bg-[#0F1115] border-[#272A30]" data-testid="sort-select">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1115] border-[#272A30]">
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Products */}
              <div className="grid md:grid-cols-2 gap-6">
                {filteredProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className="bg-[#0F1115] border border-[#272A30] rounded-sm overflow-hidden card-hover"
                    data-testid={`product-card-${idx}`}
                  >
                    <div className="aspect-video relative">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      {product.in_stock && (
                        <span className="absolute top-3 right-3 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-sm">
                          In Stock
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-500 text-xs">{product.supplier_name}</span>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-gray-500 text-xs">• {product.country}</span>
                      </div>
                      <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                          ))}
                        </div>
                        <span className="text-white text-sm">{product.rating}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.short_description}</p>
                      <div className="flex gap-3">
                        <Link
                          to={`/product/${product.slug}`}
                          className="btn-secondary flex-1 text-center text-sm py-2"
                          data-testid={`view-details-${idx}`}
                        >
                          VIEW DETAILS
                        </Link>
                        <Link
                          to={`/supplier/${product.supplier_id}`}
                          className="btn-primary flex-1 text-center text-sm py-2"
                          data-testid={`contact-supplier-${idx}`}
                        >
                          CONTACT SUPPLIER
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-400 mb-4">No products found matching your filters.</p>
                  <button
                    onClick={() => setFilters({ minRating: null, inStock: null, sortBy: "rating" })}
                    className="text-[#00CED1] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
