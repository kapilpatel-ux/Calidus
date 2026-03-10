import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Star, CheckCircle, ArrowRight, Package, Building, Layers, HelpCircle, MapPin, ChevronRight } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState({ products: [], suppliers: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const [searchRes, aiRes] = await Promise.all([
          axios.post(`${API}/search`, { query }),
          axios.post(`${API}/search/ai-suggestions`, { query }).catch(() => ({ data: {} }))
        ]);
        setResults(searchRes.data);
        setAiSummary(aiRes.data?.ai_summary || "");
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  const totalResults = results.products.length + results.suppliers.length + results.categories.length;

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="search-results-page">
      {/* Hero */}
      <section className="py-12 bg-[#0F1115] border-b border-[#272A30]">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
            SEARCH RESULTS FOR "<span className="text-[#00CED1]">{query}</span>"
          </h1>
          <p className="text-gray-400">
            {loading ? "Searching..." : `${totalResults} results found`}
          </p>
          
          {aiSummary && (
            <div className="mt-6 bg-[#00CED1]/10 border border-[#00CED1]/30 rounded-sm p-4">
              <p className="text-[#00CED1] text-sm font-medium mb-1">AI Insight</p>
              <p className="text-gray-300 text-sm">{aiSummary}</p>
            </div>
          )}
        </div>
      </section>

      {/* Tabs & Filters */}
      <section className="py-6 border-b border-[#272A30]">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "all", label: `All Results (${totalResults})` },
                { id: "products", label: `Products (${results.products.length})`, icon: Package },
                { id: "suppliers", label: `Suppliers (${results.suppliers.length})`, icon: Building },
                { id: "categories", label: `Categories (${results.categories.length})`, icon: Layers }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-[#00CED1] text-black'
                      : 'bg-[#0F1115] text-gray-400 hover:text-white border border-[#272A30]'
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.icon && <tab.icon className="w-4 h-4" />}
                  {tab.label}
                </button>
              ))}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-[#0F1115] border-[#272A30]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F1115] border-[#272A30]">
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container-custom">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#0F1115] rounded-sm h-64 animate-pulse" />
              ))}
            </div>
          ) : totalResults > 0 ? (
            <div className="space-y-16">
              {/* PRODUCTS SECTION */}
              {(activeTab === "all" || activeTab === "products") && results.products.length > 0 && (
                <div data-testid="products-section">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#00CED1]/10 rounded-sm flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#00CED1]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }}>
                        PRODUCTS
                      </h2>
                      <p className="text-gray-500 text-sm">{results.products.length} products found</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.products.map((product, idx) => (
                      <div
                        key={product.id}
                        className="bg-[#0F1115] border border-[#272A30] rounded-sm overflow-hidden card-hover"
                        data-testid={`product-result-${idx}`}
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
                            <span className="text-[#00CED1] text-xs font-medium">{product.category_name}</span>
                          </div>
                          <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-500 text-sm">{product.supplier_name}</span>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                              ))}
                            </div>
                            <span className="text-white text-sm">{product.rating}</span>
                          </div>
                          <Link
                            to={`/product/${product.slug}`}
                            className="btn-secondary w-full text-center text-sm py-2 mt-2"
                          >
                            VIEW DETAILS
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUPPLIERS SECTION */}
              {(activeTab === "all" || activeTab === "suppliers") && results.suppliers.length > 0 && (
                <div data-testid="suppliers-section">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#00CED1]/10 rounded-sm flex items-center justify-center">
                      <Building className="w-5 h-5 text-[#00CED1]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }}>
                        SUPPLIERS
                      </h2>
                      <p className="text-gray-500 text-sm">{results.suppliers.length} suppliers found</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.suppliers.map((supplier, idx) => (
                      <div
                        key={supplier.id}
                        className="bg-[#0F1115] border border-[#272A30] rounded-sm p-6 card-hover"
                        data-testid={`supplier-result-${idx}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-[#1A1D24] rounded-sm overflow-hidden">
                              <img src={supplier.logo_url} alt={supplier.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{supplier.name}</h3>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-500">{supplier.country}</span>
                              </div>
                            </div>
                          </div>
                          {supplier.verified && (
                            <span className="badge-verified flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                            ))}
                          </div>
                          <span className="text-white text-sm font-medium">{supplier.rating}</span>
                          <span className="text-gray-500 text-sm">({supplier.review_count})</span>
                        </div>

                        <p className="text-gray-500 text-sm mb-3">{supplier.supplier_type || 'Manufacturer'}</p>

                        <Link
                          to={`/supplier/${supplier.slug}`}
                          className="btn-primary w-full text-center text-sm py-2"
                        >
                          VIEW PROFILE
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CATEGORIES SECTION */}
              {(activeTab === "all" || activeTab === "categories") && results.categories.length > 0 && (
                <div data-testid="categories-section">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#00CED1]/10 rounded-sm flex items-center justify-center">
                      <Layers className="w-5 h-5 text-[#00CED1]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }}>
                        CATEGORIES
                      </h2>
                      <p className="text-gray-500 text-sm">{results.categories.length} categories found</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.categories.map((category, idx) => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        className="group bg-[#0F1115] border border-[#272A30] rounded-sm overflow-hidden card-hover"
                        data-testid={`category-result-${idx}`}
                      >
                        <div className="aspect-video relative">
                          <img src={category.image_url} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] to-transparent" />
                        </div>
                        <div className="p-5">
                          <h3 className="text-white font-semibold mb-2">{category.name}</h3>
                          <p className="text-gray-400 text-sm mb-3">{category.product_count} Products</p>
                          <span className="text-[#00CED1] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            EXPLORE CATEGORY <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="max-w-md mx-auto text-center py-16" data-testid="empty-state">
              <div className="w-20 h-20 bg-[#0F1115] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#272A30]">
                <HelpCircle className="w-10 h-10 text-gray-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
                NO DIRECT MATCH FOUND
              </h2>
              <p className="text-gray-400 mb-8">
                Our experts can help you identify the right supplier or component for your specific requirements.
              </p>
              <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                SPEAK TO OUR EXPERTS
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              {/* Suggested Actions */}
              <div className="mt-12 pt-8 border-t border-[#272A30]">
                <p className="text-gray-500 text-sm mb-4">Or try exploring:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/components" className="text-[#00CED1] text-sm hover:underline">Browse Components</Link>
                  <span className="text-gray-600">•</span>
                  <Link to="/suppliers" className="text-[#00CED1] text-sm hover:underline">View Suppliers</Link>
                  <span className="text-gray-600">•</span>
                  <Link to="/how-it-works" className="text-[#00CED1] text-sm hover:underline">How It Works</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
