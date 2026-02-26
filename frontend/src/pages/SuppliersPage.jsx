import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, CheckCircle, Search, Filter } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(`${API}/suppliers`);
        setSuppliers(res.data || []);
      } catch (e) {
        console.error("Error fetching suppliers:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers
    .filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "products") return b.active_products - a.active_products;
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="suppliers-page">
      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115] to-[#050505]" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }} data-testid="page-title">
              VERIFIED DEFENSE<br />
              <span className="text-[#00CED1]">SUPPLIERS</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Trusted manufacturers and distributors evaluated through performance, compliance, and buyer feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-[#0F1115] border-y border-[#272A30]">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search suppliers..."
                className="w-full pl-10 pr-4 py-3 bg-[#050505] border border-[#272A30] rounded-sm text-white placeholder-gray-500 focus:border-[#00CED1] focus:outline-none"
                data-testid="search-suppliers"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">{filteredSuppliers.length} suppliers</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-[#050505] border-[#272A30]" data-testid="sort-select">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1115] border-[#272A30]">
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="products">Most Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Suppliers Grid */}
      <section className="py-16">
        <div className="container-custom">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#0F1115] rounded-sm h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuppliers.map((supplier, idx) => (
                <div
                  key={supplier.id}
                  className="bg-[#0F1115] border border-[#272A30] rounded-sm p-6 card-hover"
                  data-testid={`supplier-card-${idx}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-[#1A1D24] rounded-sm overflow-hidden">
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

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    <span className="text-white text-sm font-medium">{supplier.rating}</span>
                    <span className="text-gray-500 text-sm">({supplier.review_count})</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span>{supplier.active_products} Products</span>
                    <span>•</span>
                    <span>{supplier.countries_served} Countries</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {supplier.capabilities?.slice(0, 2).map((cap, i) => (
                      <span key={i} className="text-xs bg-[#1A1D24] text-gray-400 px-2 py-1 rounded-sm">
                        {cap}
                      </span>
                    ))}
                    {supplier.capabilities?.length > 2 && (
                      <span className="text-xs bg-[#1A1D24] text-gray-400 px-2 py-1 rounded-sm">
                        +{supplier.capabilities.length - 2}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/supplier/${supplier.slug}`}
                    className="btn-secondary w-full text-center text-sm py-2"
                    data-testid={`view-supplier-${idx}`}
                  >
                    VIEW PROFILE
                  </Link>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredSuppliers.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400">No suppliers found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
