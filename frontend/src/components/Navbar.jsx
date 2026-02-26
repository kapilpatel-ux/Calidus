import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, User, LogOut, Star, Building, Layers, ArrowRight, HelpCircle } from "lucide-react";
import axios from "axios";
import { API, useAuth } from "../App";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`${API}/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        setSuggestions(res.data.suggestions || []);
      } catch (e) {
        console.error("Search suggestions error:", e);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    setSearchQuery("");
    if (suggestion.type === "product") {
      navigate(`/product/${suggestion.id}`);
    } else if (suggestion.type === "supplier") {
      navigate(`/supplier/${suggestion.id}`);
    } else if (suggestion.type === "category") {
      navigate(`/category/${suggestion.id}`);
    }
  };

  // Group suggestions by type
  const groupedSuggestions = {
    product: suggestions.filter(s => s.type === "product"),
    supplier: suggestions.filter(s => s.type === "supplier"),
    category: suggestions.filter(s => s.type === "category")
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Components", path: "/components" },
    { label: "Suppliers", path: "/suppliers" },
    { label: "How It Works", path: "/how-it-works" },
    { label: "Contact Us", path: "/contact" },
  ];

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isSearchFocused ? "glass border-b border-[#272A30]" : "bg-transparent"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#00CED1] rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-xl">DC</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight hidden sm:block" style={{ fontFamily: 'Barlow Condensed' }}>
                DEFENSE CONNECT
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-300 hover:text-white text-sm font-medium tracking-wide transition-colors duration-200"
                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search + Auth */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div ref={searchRef} className="relative hidden md:block">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      setShowSuggestions(true);
                      setIsSearchFocused(true);
                    }}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search components, suppliers..."
                    className={`pl-10 pr-4 py-2 bg-[#0F1115] border rounded-sm text-sm text-white placeholder-gray-500 transition-all duration-300 focus:outline-none ${
                      isSearchFocused || searchQuery 
                        ? 'w-80 border-[#00CED1]' 
                        : 'w-64 border-[#272A30]'
                    }`}
                    data-testid="search-input"
                  />
                </div>
              </form>

              {/* Enhanced Suggestions Dropdown */}
              {showSuggestions && (searchQuery.length >= 2 || isSearchFocused) && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 bg-[#0F1115] border border-[#272A30] rounded-sm shadow-2xl overflow-hidden z-50 min-w-[400px]" 
                  data-testid="search-suggestions"
                >
                  {suggestions.length > 0 ? (
                    <div className="max-h-[70vh] overflow-y-auto">
                      {/* Products Section */}
                      {groupedSuggestions.product.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-[#1A1D24] border-b border-[#272A30]">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                              <Layers className="w-3 h-3" /> Products
                            </span>
                          </div>
                          {groupedSuggestions.product.map((suggestion, idx) => (
                            <button
                              key={`product-${suggestion.id}`}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full px-4 py-3 text-left hover:bg-[#1A1D24] transition-colors border-b border-[#272A30]/50 last:border-0"
                              data-testid={`suggestion-product-${idx}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{suggestion.name}</p>
                                  <p className="text-gray-500 text-xs truncate">{suggestion.description}</p>
                                </div>
                                <div className="flex items-center gap-1 ml-3">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-white text-xs">{(suggestion.score * 5).toFixed(1)}</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Suppliers Section */}
                      {groupedSuggestions.supplier.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-[#1A1D24] border-b border-[#272A30]">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                              <Building className="w-3 h-3" /> Suppliers
                            </span>
                          </div>
                          {groupedSuggestions.supplier.map((suggestion, idx) => (
                            <button
                              key={`supplier-${suggestion.id}`}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full px-4 py-3 text-left hover:bg-[#1A1D24] transition-colors border-b border-[#272A30]/50 last:border-0"
                              data-testid={`suggestion-supplier-${idx}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate flex items-center gap-2">
                                    {suggestion.name}
                                    <span className="text-green-500 text-xs">Verified</span>
                                  </p>
                                  <p className="text-gray-500 text-xs truncate">{suggestion.description}</p>
                                </div>
                                <div className="flex items-center gap-1 ml-3">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-white text-xs">{(suggestion.score * 5).toFixed(1)}</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Categories Section */}
                      {groupedSuggestions.category.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-[#1A1D24] border-b border-[#272A30]">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                              <Layers className="w-3 h-3" /> Categories
                            </span>
                          </div>
                          {groupedSuggestions.category.map((suggestion, idx) => (
                            <button
                              key={`category-${suggestion.id}`}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full px-4 py-3 text-left hover:bg-[#1A1D24] transition-colors border-b border-[#272A30]/50 last:border-0"
                              data-testid={`suggestion-category-${idx}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{suggestion.name}</p>
                                  <p className="text-gray-500 text-xs truncate">{suggestion.description}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-500" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* View All Results */}
                      {searchQuery.length >= 2 && (
                        <button
                          onClick={handleSearch}
                          className="w-full px-4 py-3 text-center bg-[#00CED1]/10 hover:bg-[#00CED1]/20 transition-colors text-[#00CED1] text-sm font-medium"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      )}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    /* No Results State */
                    <div className="p-6 text-center">
                      <HelpCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-white font-medium mb-1">No Direct Match Found</p>
                      <p className="text-gray-500 text-sm mb-4">
                        Our ecosystem is continuously expanding.
                      </p>
                      <Link 
                        to="/contact" 
                        className="text-[#00CED1] text-sm hover:underline inline-flex items-center gap-1"
                        onClick={() => setShowSuggestions(false)}
                      >
                        Speak to Our Experts <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-gray-400 text-sm">{user.full_name}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/supplier-registration"
                  className="btn-secondary text-xs py-2 px-4"
                  data-testid="register-supplier-btn"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="btn-primary text-xs py-2 px-4"
                  data-testid="login-btn"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white p-2"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0F1115] border-t border-[#272A30] py-4" data-testid="mobile-menu">
            {/* Mobile Search */}
            <div className="px-4 mb-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-3 bg-[#050505] border border-[#272A30] rounded-sm text-white placeholder-gray-500"
                  />
                </div>
              </form>
            </div>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-gray-300 hover:text-white hover:bg-[#1A1D24] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-4 pt-4 border-t border-[#272A30] flex gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-primary flex-1 text-center text-sm py-2">
                  Login
                </Link>
                <Link to="/supplier-registration" onClick={() => setMobileMenuOpen(false)} className="btn-secondary flex-1 text-center text-sm py-2">
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
