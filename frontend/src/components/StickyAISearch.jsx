import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Zap, Layers, Building, ArrowRight, Star, Sparkles } from "lucide-react";
import axios from "axios";
import { API } from "../App";

export const StickyAISearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await axios.get(`${API}/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        setSuggestions(res.data.suggestions || []);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setIsOpen(false);
    setSearchQuery("");
    if (suggestion.type === "product") {
      navigate(`/product/${suggestion.id}`);
    } else if (suggestion.type === "supplier") {
      navigate(`/supplier/${suggestion.id}`);
    } else if (suggestion.type === "category") {
      navigate(`/category/${suggestion.id}`);
    }
  };

  // Group suggestions
  const groupedSuggestions = {
    product: suggestions.filter(s => s.type === "product"),
    supplier: suggestions.filter(s => s.type === "supplier"),
    category: suggestions.filter(s => s.type === "category")
  };

  const quickSearches = [
    "UAV Propulsion",
    "Thermal Imaging",
    "Tactical Radio",
    "Armored Systems",
    "Electronics"
  ];

  return (
    <>
      {/* Floating AI Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-6 z-50 w-14 h-14 bg-[#00CED1] hover:bg-[#00E5E8] rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        data-testid="ai-search-button"
        aria-label="Open AI Search"
      >
        <div className="relative">
          <Search className="w-6 h-6 text-black" />
          <Sparkles className="w-3 h-3 text-black absolute -top-1 -right-1 animate-pulse" />
        </div>
        
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-[#0F1115] text-white text-sm rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-[#272A30]">
          AI Search
        </span>
      </button>

      {/* Pulse ring animation */}
      <div className={`fixed bottom-20 right-6 z-40 w-14 h-14 rounded-full pointer-events-none ${isOpen ? 'hidden' : ''}`}>
        <div className="absolute inset-0 bg-[#00CED1]/30 rounded-full animate-ping" />
      </div>

      {/* Search Panel Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div 
            className="w-full max-w-2xl bg-[#0F1115] border border-[#272A30] rounded-sm shadow-2xl animate-fade-in-up overflow-hidden"
            data-testid="ai-search-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#272A30] bg-[#0A0A0C]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00CED1]/10 rounded-sm flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#00CED1]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold" style={{ fontFamily: 'Barlow Condensed' }}>AI-POWERED SEARCH</h3>
                  <p className="text-gray-500 text-xs">Find products, suppliers, and categories</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white transition-colors p-2"
                data-testid="close-search-panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00CED1]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for defense components, suppliers, certifications..."
                    className="w-full pl-12 pr-24 py-4 bg-[#050505] border border-[#272A30] rounded-sm text-white text-lg placeholder-gray-500 focus:border-[#00CED1] focus:outline-none transition-colors"
                    data-testid="ai-search-input"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Quick Search Tags */}
              {searchQuery.length < 2 && (
                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-3">Quick search:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickSearches.map((tag, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(tag)}
                        className="text-sm px-3 py-1.5 bg-[#1A1D24] border border-[#272A30] rounded-sm text-gray-300 hover:text-[#00CED1] hover:border-[#00CED1]/50 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            {searchQuery.length >= 2 && (
              <div className="border-t border-[#272A30] max-h-[50vh] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-[#00CED1] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Searching...</p>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div>
                    {/* Products */}
                    {groupedSuggestions.product.length > 0 && (
                      <div>
                        <div className="px-6 py-3 bg-[#0A0A0C] border-b border-[#272A30] sticky top-0">
                          <span className="text-xs font-medium text-[#00CED1] uppercase tracking-wider flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Products ({groupedSuggestions.product.length})
                          </span>
                        </div>
                        {groupedSuggestions.product.map((item, idx) => (
                          <button
                            key={`p-${idx}`}
                            onClick={() => handleSuggestionClick(item)}
                            className="w-full px-6 py-4 text-left hover:bg-[#1A1D24] transition-colors border-b border-[#272A30]/50 flex items-center justify-between group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate group-hover:text-[#00CED1] transition-colors">{item.name}</p>
                              <p className="text-gray-500 text-sm truncate">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-white text-sm">{(item.score * 5).toFixed(1)}</span>
                              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#00CED1] transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Suppliers */}
                    {groupedSuggestions.supplier.length > 0 && (
                      <div>
                        <div className="px-6 py-3 bg-[#0A0A0C] border-b border-[#272A30] sticky top-0">
                          <span className="text-xs font-medium text-[#00CED1] uppercase tracking-wider flex items-center gap-2">
                            <Building className="w-4 h-4" /> Suppliers ({groupedSuggestions.supplier.length})
                          </span>
                        </div>
                        {groupedSuggestions.supplier.map((item, idx) => (
                          <button
                            key={`s-${idx}`}
                            onClick={() => handleSuggestionClick(item)}
                            className="w-full px-6 py-4 text-left hover:bg-[#1A1D24] transition-colors border-b border-[#272A30]/50 flex items-center justify-between group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate group-hover:text-[#00CED1] transition-colors flex items-center gap-2">
                                {item.name}
                                <span className="text-green-500 text-xs font-normal">Verified</span>
                              </p>
                              <p className="text-gray-500 text-sm truncate">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-white text-sm">{(item.score * 5).toFixed(1)}</span>
                              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#00CED1] transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Categories */}
                    {groupedSuggestions.category.length > 0 && (
                      <div>
                        <div className="px-6 py-3 bg-[#0A0A0C] border-b border-[#272A30] sticky top-0">
                          <span className="text-xs font-medium text-[#00CED1] uppercase tracking-wider flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Categories ({groupedSuggestions.category.length})
                          </span>
                        </div>
                        {groupedSuggestions.category.map((item, idx) => (
                          <button
                            key={`c-${idx}`}
                            onClick={() => handleSuggestionClick(item)}
                            className="w-full px-6 py-4 text-left hover:bg-[#1A1D24] transition-colors border-b border-[#272A30]/50 flex items-center justify-between group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate group-hover:text-[#00CED1] transition-colors">{item.name}</p>
                              <p className="text-gray-500 text-sm truncate">{item.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#00CED1] transition-colors ml-4" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* View All */}
                    <button
                      onClick={handleSearch}
                      className="w-full px-6 py-4 text-center bg-[#00CED1]/10 hover:bg-[#00CED1]/20 transition-colors text-[#00CED1] font-medium"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                ) : (
                  /* No Results */
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-[#1A1D24] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="text-white font-semibold mb-2" style={{ fontFamily: 'Barlow Condensed' }}>NO DIRECT MATCH FOUND</h4>
                    <p className="text-gray-500 text-sm mb-4">
                      Our experts can help you identify the right supplier or component.
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/contact');
                      }}
                      className="btn-primary text-sm"
                    >
                      SPEAK TO OUR EXPERTS
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-3 bg-[#0A0A0C] border-t border-[#272A30] flex items-center justify-between">
              <p className="text-gray-500 text-xs">
                Press <kbd className="px-1.5 py-0.5 bg-[#272A30] rounded text-gray-400 text-xs">ESC</kbd> to close
              </p>
              <p className="text-gray-500 text-xs flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#00CED1]" /> Powered by AI
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
