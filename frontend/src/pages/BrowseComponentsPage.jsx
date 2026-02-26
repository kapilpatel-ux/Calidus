import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, ChevronRight } from "lucide-react";
import axios from "axios";
import { API } from "../App";

export const BrowseComponentsPage = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API}/categories`);
        setCategories(res.data || []);
      } catch (e) {
        console.error("Error fetching categories:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="browse-components-page">
      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115] to-[#050505]" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }} data-testid="page-title">
              BROWSE VERIFIED<br />
              <span className="text-[#00CED1]">DEFENSE COMPONENTS</span>
            </h1>
            <p className="text-gray-400 text-lg mb-10">
              Structured across specialized defense domains for efficient discovery.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search components, categories, suppliers..."
                  className="w-full pl-12 pr-32 py-4 bg-[#0F1115] border border-[#272A30] rounded-sm text-white placeholder-gray-500 focus:border-[#00CED1] focus:outline-none"
                  data-testid="search-input"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-6 text-sm"
                  data-testid="search-btn"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16">
        <div className="container-custom">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
              EXPLORE BY DEFENSE DOMAIN
            </h2>
            <p className="text-gray-500">
              Select a category to view available components
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[16/10] bg-[#0F1115] rounded-sm animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, idx) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group bg-[#0F1115] border border-[#272A30] rounded-sm overflow-hidden card-hover"
                  data-testid={`category-card-${idx}`}
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
                      {category.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">
                        {category.active_suppliers} Active Suppliers
                      </span>
                      <span className="inline-flex items-center text-[#00CED1] text-sm font-medium group-hover:gap-2 transition-all">
                        View Components <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-16 bg-[#0F1115] border-t border-[#272A30]">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
                Looking to Showcase Your Capabilities?
              </h3>
              <p className="text-gray-400">
                Join our network of verified defense suppliers.
              </p>
            </div>
            <Link to="/supplier-registration" className="btn-primary flex items-center gap-2" data-testid="register-supplier-btn">
              REGISTER AS SUPPLIER
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
