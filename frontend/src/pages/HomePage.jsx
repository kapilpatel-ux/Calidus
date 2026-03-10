import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Shield, BarChart3, MessageSquare, ChevronRight, Star, CheckCircle, TrendingUp, Zap } from "lucide-react";
import axios from "axios";
import { API } from "../App";

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [stats, setStats] = useState({ categories: 40, components: 400, suppliers: 50 });
  const [searchQuery, setSearchQuery] = useState("");

  const quickSearchTags = [
    "UAV Propulsion Systems",
    "Ballistic Armor Plates",
    "Radar Electronics",
    "Tactical Communication Systems",
    "Thermal Imaging",
    "Encrypted Radios"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, supRes, prodRes, statsRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/suppliers?verified=true&limit=3`),
          axios.get(`${API}/products?featured=true&limit=1`),
          axios.get(`${API}/stats`)
        ]);
        setCategories(catRes.data || []);
        setSuppliers(supRes.data || []);
        if (prodRes.data && prodRes.data.length > 0) {
          setFeaturedProduct(prodRes.data[0]);
        }
        setStats(statsRes.data);
      } catch (e) {
        console.error("Error fetching homepage data:", e);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleTagClick = (tag) => {
    window.location.href = `/search?q=${encodeURIComponent(tag)}`;
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1771889928359-175bfe7f5ec7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxtaWxpdGFyeSUyMHJvY2tldCUyMGxhdW5jaGVyfGVufDB8fHx8MTc3MjA3OTU4NXww&ixlib=rb-4.1.0&q=85"
            alt="Defense Systems"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/50" />
        </div>

        <div className="container-custom relative z-10 pt-32 pb-20">
          <div className="max-w-3xl">
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up"
              style={{ fontFamily: 'Barlow Condensed' }}
              data-testid="hero-headline"
            >
              WHERE TRUSTED DEFENSE<br />
              <span className="text-[#00CED1]">SUPPLY CHAINS</span> BEGIN
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl animate-fade-in-up stagger-1" data-testid="hero-subheadline">
              A centralized marketplace connecting verified suppliers with defense buyers through structured transparency and intelligent discovery.
            </p>

            {/* Main AI Search Bar */}
            <div className="mb-6 animate-fade-in-up stagger-2">
              <form onSubmit={handleSearch}>
                <div className="relative max-w-2xl">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#00CED1]" />
                    <Zap className="w-4 h-4 text-[#00CED1] animate-pulse" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for defense components, suppliers, or certifications..."
                    className="w-full pl-16 pr-32 py-5 bg-[#0F1115]/95 border border-[#272A30] rounded-sm text-white text-lg placeholder-gray-500 focus:border-[#00CED1] focus:outline-none transition-all duration-300 focus:shadow-[0_0_30px_rgba(0,206,209,0.2)]"
                    data-testid="hero-search-input"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-3 px-6"
                    data-testid="hero-search-btn"
                  >
                    Search
                  </button>
                </div>
              </form>
              
              {/* Quick Search Tags */}
              <div className="mt-4 flex flex-wrap gap-2" data-testid="quick-search-tags">
                <span className="text-gray-500 text-sm mr-2">Quick search:</span>
                {quickSearchTags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTagClick(tag)}
                    className="text-sm px-3 py-1.5 bg-[#1A1D24]/80 border border-[#272A30] rounded-sm text-gray-300 hover:text-[#00CED1] hover:border-[#00CED1]/50 transition-all duration-200"
                    data-testid={`quick-tag-${idx}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
              <Link to="/components" className="btn-primary flex items-center gap-2" data-testid="browse-components-btn">
                BROWSE COMPONENTS
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/supplier-registration" className="btn-secondary flex items-center gap-2" data-testid="become-supplier-btn">
                BECOME A SUPPLIER
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Empowering Defense Section */}
      <section className="py-24 bg-[#050505] relative overflow-hidden" data-testid="empowering-section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-sm">
                <img
                  src="https://images.pexels.com/photos/12112278/pexels-photo-12112278.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                  alt="Armored Vehicle"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-[#00CED1]/30 rounded-sm" />
            </div>

            {/* Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                EMPOWERING DEFENSE THROUGH<br />
                <span className="text-[#00CED1]">A TRUSTED SUPPLY ECOSYSTEM</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Defense Connect establishes a structured, compliance-driven environment for sourcing mission-critical components. Our platform simplifies supplier discovery, enhances transparency, and strengthens procurement decisions across the defense industry.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{stats.categories}+</p>
                  <p className="text-gray-500 text-sm mt-1">Defense Categories</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{stats.components}+</p>
                  <p className="text-gray-500 text-sm mt-1">Components</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{stats.suppliers}+</p>
                  <p className="text-gray-500 text-sm mt-1">Verified Suppliers</p>
                </div>
              </div>

              <Link to="/components" className="btn-primary inline-flex items-center gap-2" data-testid="explore-components-btn">
                EXPLORE DEFENSE COMPONENTS
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Defense Components */}
      <section className="py-24 bg-[#0F1115]" data-testid="categories-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
              BROWSE DEFENSE COMPONENTS
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Navigate structured categories designed to accelerate sourcing.
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((category, idx) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group relative aspect-[16/10] overflow-hidden rounded-sm card-hover"
                data-testid={`category-card-${idx}`}
              >
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Barlow Condensed' }}>
                    {category.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{category.product_count} Items</p>
                  <span className="inline-flex items-center text-[#00CED1] text-sm font-medium group-hover:gap-2 transition-all">
                    View Components <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/components" className="btn-secondary inline-flex items-center gap-2">
              VIEW ALL CATEGORIES
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Top Verified Suppliers */}
      <section className="py-24 bg-[#050505]" data-testid="suppliers-section">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
                TOP VERIFIED DEFENSE<br />
                <span className="text-[#00CED1]">SUPPLIERS YOU CAN RELY ON</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-xl">
                Verified manufacturers and distributors evaluated through performance, compliance, and buyer feedback.
              </p>
            </div>
            <Link to="/suppliers" className="btn-secondary mt-6 md:mt-0 inline-flex items-center gap-2" data-testid="view-all-suppliers-btn">
              VIEW ALL SUPPLIERS
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Supplier Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier, idx) => (
              <div
                key={supplier.id}
                className="bg-[#0F1115] border border-[#272A30] rounded-sm p-6 card-hover"
                data-testid={`supplier-card-${idx}`}
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

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="text-white text-sm font-medium">{supplier.rating}</span>
                  <span className="text-gray-500 text-sm">({supplier.review_count} reviews)</span>
                </div>

                <p className="text-gray-400 text-sm mb-4">{supplier.tagline}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {supplier.capabilities?.slice(0, 3).map((cap, i) => (
                    <span key={i} className="text-xs bg-[#1A1D24] text-gray-400 px-2 py-1 rounded-sm">
                      {cap}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/supplier/${supplier.slug}`}
                  className="btn-secondary w-full text-center text-sm py-2"
                  data-testid={`contact-supplier-${idx}`}
                >
                  VIEW PROFILE
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Product */}
      {featuredProduct && (
        <section className="py-24 relative overflow-hidden" data-testid="featured-product-section">
          <div className="absolute inset-0">
            <img
              src={featuredProduct.image_url}
              alt={featuredProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent" />
          </div>

          <div className="container-custom relative z-10">
            <div className="max-w-2xl">
              <p className="text-[#00CED1] text-sm font-medium tracking-wider mb-4">FEATURED PRODUCT</p>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                {featuredProduct.name.toUpperCase()}
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                {featuredProduct.short_description}
              </p>
              <Link 
                to={`/product/${featuredProduct.slug}`}
                className="btn-primary inline-flex items-center gap-2"
                data-testid="view-product-btn"
              >
                VIEW DETAILS
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Three Steps Section */}
      <section className="py-24 bg-[#0F1115] relative overflow-hidden" data-testid="steps-section">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/33748032/pexels-photo-33748032.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#00CED1] text-sm font-medium tracking-wider mb-4">HOW IT WORKS</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }}>
              THREE SIMPLE STEPS TO CONNECT WITH<br />
              <span className="text-[#00CED1]">VERIFIED DEFENSE SUPPLIERS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Search & Discover",
                description: "Use AI-assisted search to identify relevant components and suppliers."
              },
              {
                step: "02",
                title: "Evaluate & Compare",
                description: "Review certifications, performance metrics, and ratings."
              },
              {
                step: "03",
                title: "Connect Directly",
                description: "Submit secure enquiries or RFQs."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#050505]/80 border border-[#272A30] rounded-sm p-8 card-hover" data-testid={`step-${idx + 1}`}>
                <span className="text-[#00CED1] text-5xl font-bold opacity-30" style={{ fontFamily: 'Barlow Condensed' }}>
                  {item.step}
                </span>
                <h3 className="text-xl font-bold text-white mt-4 mb-3" style={{ fontFamily: 'Barlow Condensed' }}>
                  {item.title}
                </h3>
                <p className="text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/how-it-works" className="btn-primary inline-flex items-center gap-2" data-testid="get-started-btn">
              GET STARTED
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Defense Connect */}
      <section className="py-24 bg-[#050505]" data-testid="why-choose-section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                WHY CHOOSE<br />
                <span className="text-[#00CED1]">DEFENSE CONNECT</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                The most trusted platform for defense procurement and supplier discovery.
              </p>
              <Link to="/supplier-registration" className="btn-primary inline-flex items-center gap-2" data-testid="join-network-btn">
                JOIN THE NETWORK
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-6">
              {[
                {
                  icon: Shield,
                  title: "Compliance & Transparency",
                  description: "All suppliers undergo verification review."
                },
                {
                  icon: BarChart3,
                  title: "Real-Time Insights",
                  description: "Ratings and structured specifications for informed decisions."
                },
                {
                  icon: MessageSquare,
                  title: "Secure Communication",
                  description: "Direct, protected enquiry channels."
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 bg-[#0F1115] border border-[#272A30] rounded-sm p-6 card-hover" data-testid={`why-choose-${idx}`}>
                  <div className="w-12 h-12 bg-[#00CED1]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[#00CED1]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Connect CTA */}
      <section className="py-24 bg-[#0F1115] relative overflow-hidden" data-testid="connect-cta-section">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.pexels.com/photos/17854251/pexels-photo-17854251.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
              CONNECT WITH TOP SUPPLIERS
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Fill out the form below and we'll match you with the right suppliers.
            </p>
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2" data-testid="contact-us-btn">
              CONTACT US
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
