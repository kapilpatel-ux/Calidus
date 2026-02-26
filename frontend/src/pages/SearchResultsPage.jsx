import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Star, CheckCircle, Filter, ArrowRight } from "lucide-react";
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
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
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
            <div className="flex gap-2">
              {[
                { id: "all", label: `All (${totalResults})` },
                { id: "products", label: `Products (${results.products.length})` },
                { id: "suppliers", label: `Suppliers (${results.suppliers.length})` },
                { id: "categories", label: `Categories (${results.categories.length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#00CED1] text-black'
                      : 'bg-[#0F1115] text-gray-400 hover:text-white'
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
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
          ) : (
            <div className="space-y-12">
              {/* Products */}
              {(activeTab === "all" || activeTab === "products") && results.products.length > 0 && (
                <div>
                  {activeTab === "all" && (
                    <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                      PRODUCTS ({results.products.length})
                    </h2>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.products.map((product, idx) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        className="bg-[#0F1115] border border-[#272A30] rounded-sm overflow-hidden card-hover"
                        data-testid={`product-result-${idx}`}
                      >
                        <div className="aspect-video">
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-500 text-xs">{product.supplier_name}</span>
                            <CheckCircle className="w-3 h-3 text-green-500" />
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
                          <p className="text-gray-400 text-sm line-clamp-2">{product.short_description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Suppliers */}
              {(activeTab === "all" || activeTab === "suppliers") && results.suppliers.length > 0 && (
                <div>
                  {activeTab === "all" && (
                    <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                      SUPPLIERS ({results.suppliers.length})
                    </h2>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.suppliers.map((supplier, idx) => (
                      <Link
                        key={supplier.id}
                        to={`/supplier/${supplier.slug}`}
                        className="bg-[#0F1115] border border-[#272A30] rounded-sm p-6 card-hover"
                        data-testid={`supplier-result-${idx}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#1A1D24] rounded-sm overflow-hidden">
                              <img src={supplier.logo_url} alt={supplier.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{supplier.name}</h3>
                              <p className="text-gray-500 text-sm">{supplier.country}</p>
                            </div>
                          </div>
                          {supplier.verified && (
                            <span className="badge-verified flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-4">{supplier.tagline}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                            ))}
                          </div>
                          <span className="text-white text-sm font-medium">{supplier.rating}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {(activeTab === "all" || activeTab === "categories") && results.categories.length > 0 && (
                <div>
                  {activeTab === "all" && (
                    <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                      CATEGORIES ({results.categories.length})
                    </h2>
                  )}
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
                          <p className="text-gray-400 text-sm mb-3">{category.description}</p>
                          <span className="text-[#00CED1] text-sm font-medium flex items-center gap-1">
                            View Components <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {totalResults === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-400 mb-4">No results found for "{query}"</p>
                  <Link to="/components" className="text-[#00CED1] hover:underline">
                    Browse all components
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
