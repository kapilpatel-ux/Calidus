import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, CheckCircle, MapPin, Shield, Globe, Award, ChevronRight, Building, Users, Calendar, TrendingUp, Briefcase } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";

export const SupplierPage = () => {
  const { slug } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    full_name: "",
    email: "",
    company_name: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const supRes = await axios.get(`${API}/suppliers/${slug}`);
        setSupplier(supRes.data);
        
        const prodRes = await axios.get(`${API}/products?supplier=${supRes.data.id}`);
        setProducts(prodRes.data || []);
      } catch (e) {
        console.error("Error fetching supplier:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!supplier) return;
    
    setSubmitting(true);
    try {
      await axios.post(`${API}/inquiry`, {
        ...inquiryForm,
        supplier_id: supplier.id
      });
      toast.success("Inquiry submitted successfully!");
      setInquiryOpen(false);
      setInquiryForm({ full_name: "", email: "", company_name: "", message: "" });
    } catch (e) {
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00CED1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-[#050505] pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Supplier not found</p>
          <Link to="/suppliers" className="text-[#00CED1] hover:underline">Browse all suppliers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="supplier-page">
      {/* Hero */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={supplier.logo_url} alt="" className="w-full h-full object-cover opacity-10 blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 to-[#050505]" />
        </div>
        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="flex items-start gap-6">
              <div className="w-28 h-28 bg-[#0F1115] rounded-sm overflow-hidden border border-[#272A30] flex-shrink-0">
                <img src={supplier.logo_url} alt={supplier.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }} data-testid="supplier-title">
                    {supplier.name.toUpperCase()}
                  </h1>
                  {supplier.verified && (
                    <span className="badge-verified flex items-center gap-1 text-sm">
                      <CheckCircle className="w-4 h-4" /> Verified Supplier
                    </span>
                  )}
                </div>
                <p className="text-[#00CED1] text-lg mb-4">{supplier.tagline}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4 text-[#00CED1]" />
                    <span>{supplier.headquarters || supplier.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Building className="w-4 h-4 text-[#00CED1]" />
                    <span>{supplier.supplier_type}</span>
                  </div>
                  {supplier.years_in_operation > 0 && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4 text-[#00CED1]" />
                      <span>{supplier.years_in_operation}+ Years in Operation</span>
                    </div>
                  )}
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(supplier.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="text-white font-bold text-lg">{supplier.rating}</span>
                  <span className="text-gray-500">({supplier.review_count} reviews)</span>
                </div>
              </div>
            </div>
            
            <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
              <DialogTrigger asChild>
                <button className="btn-primary" data-testid="contact-supplier-btn">
                  CONTACT SUPPLIER
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#0F1115] border-[#272A30]">
                <DialogHeader>
                  <DialogTitle className="text-white">Contact {supplier.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInquirySubmit} className="space-y-4 mt-4">
                  <div>
                    <Label className="text-gray-400">Full Name</Label>
                    <Input
                      value={inquiryForm.full_name}
                      onChange={(e) => setInquiryForm(f => ({ ...f, full_name: e.target.value }))}
                      required
                      className="bg-[#050505] border-[#272A30] text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Email</Label>
                    <Input
                      type="email"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm(f => ({ ...f, email: e.target.value }))}
                      required
                      className="bg-[#050505] border-[#272A30] text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Company (Optional)</Label>
                    <Input
                      value={inquiryForm.company_name}
                      onChange={(e) => setInquiryForm(f => ({ ...f, company_name: e.target.value }))}
                      className="bg-[#050505] border-[#272A30] text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Message</Label>
                    <Textarea
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm(f => ({ ...f, message: e.target.value }))}
                      required
                      rows={4}
                      className="bg-[#050505] border-[#272A30] text-white mt-1"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full"
                  >
                    {submitting ? "Submitting..." : "SUBMIT INQUIRY"}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Trust Indicators Bar */}
      <section className="py-8 bg-[#0F1115] border-y border-[#272A30]">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{supplier.active_products}</p>
              <p className="text-gray-500 text-sm mt-1">Active Products</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{supplier.countries_served}</p>
              <p className="text-gray-500 text-sm mt-1">Countries Served</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{supplier.rating}</p>
              <p className="text-gray-500 text-sm mt-1">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{supplier.review_count}</p>
              <p className="text-gray-500 text-sm mt-1">Total Reviews</p>
            </div>
            <div className="text-center col-span-2 md:col-span-1">
              <p className="text-3xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{supplier.years_in_operation || '10'}+</p>
              <p className="text-gray-500 text-sm mt-1">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview & Profile Completeness */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Overview - Takes 2 columns */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                COMPANY OVERVIEW
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">{supplier.description}</p>
              
              {/* Additional Info Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {supplier.employees && (
                  <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-[#00CED1]" />
                      <div>
                        <p className="text-gray-500 text-sm">Employees</p>
                        <p className="text-white font-medium">{supplier.employees}</p>
                      </div>
                    </div>
                  </div>
                )}
                {supplier.annual_revenue && (
                  <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-[#00CED1]" />
                      <div>
                        <p className="text-gray-500 text-sm">Annual Revenue</p>
                        <p className="text-white font-medium">{supplier.annual_revenue}</p>
                      </div>
                    </div>
                  </div>
                )}
                {supplier.headquarters && (
                  <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-4">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-[#00CED1]" />
                      <div>
                        <p className="text-gray-500 text-sm">Headquarters</p>
                        <p className="text-white font-medium">{supplier.headquarters}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-[#00CED1]" />
                    <div>
                      <p className="text-gray-500 text-sm">Supplier Type</p>
                      <p className="text-white font-medium">{supplier.supplier_type}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Completeness Sidebar */}
            <div>
              <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-6 sticky top-24">
                <h3 className="text-white font-semibold mb-4">Profile Completeness</h3>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Profile Score</span>
                    <span className="text-[#00CED1] font-bold">{supplier.profile_completeness || 85}%</span>
                  </div>
                  <Progress value={supplier.profile_completeness || 85} className="h-2" />
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-400">Verified Account</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-400">Active Products Listed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-400">Certifications Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-400">Company Details Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 bg-[#0F1115]">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Capabilities */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                CAPABILITIES
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {supplier.capabilities?.map((cap, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#050505] border border-[#272A30] rounded-sm p-4">
                    <div className="w-10 h-10 bg-[#00CED1]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-[#00CED1]" />
                    </div>
                    <span className="text-white text-sm">{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Manufacturing Capability */}
            {supplier.manufacturing_capability?.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                  MANUFACTURING CAPABILITY
                </h2>
                <div className="space-y-3">
                  {supplier.manufacturing_capability.map((mfg, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#050505] border border-[#272A30] rounded-sm p-4">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-white">{mfg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Certifications & Compliance */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Certifications */}
            {supplier.certifications?.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                  CERTIFICATIONS
                </h2>
                <div className="flex flex-wrap gap-4">
                  {supplier.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#0F1115] border border-[#00CED1]/30 rounded-sm px-4 py-3">
                      <Award className="w-5 h-5 text-[#00CED1]" />
                      <span className="text-white">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Registrations */}
            {supplier.compliance_registrations?.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                  COMPLIANCE REGISTRATIONS
                </h2>
                <div className="flex flex-wrap gap-4">
                  {supplier.compliance_registrations.map((reg, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#0F1115] border border-[#272A30] rounded-sm px-4 py-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300">{reg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products */}
      {products.length > 0 && (
        <section className="py-16 bg-[#0F1115]">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }}>
                PRODUCTS BY {supplier.name.toUpperCase()}
              </h2>
              <span className="text-gray-500">{products.length} products</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, idx) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="bg-[#050505] border border-[#272A30] rounded-sm overflow-hidden card-hover"
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
                    <span className="text-[#00CED1] text-xs font-medium">{product.category_name}</span>
                    <h3 className="text-white font-semibold mt-1 mb-2">{product.name}</h3>
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
        </section>
      )}

      {/* Ratings & Reviews */}
      <section className="py-16 bg-[#050505]">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Barlow Condensed' }}>
            RATINGS & REVIEWS
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-6">
              <div className="text-center mb-6">
                <p className="text-5xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{supplier.rating}</p>
                <div className="flex justify-center gap-1 my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(supplier.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                  ))}
                </div>
                <p className="text-gray-500 text-sm">Based on {supplier.review_count} reviews</p>
              </div>
              
              {/* Rating Breakdown */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(rating => {
                  const percentage = rating === 5 ? 72 : rating === 4 ? 18 : rating === 3 ? 7 : rating === 2 ? 2 : 1;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm w-8">{rating}★</span>
                      <div className="flex-1 h-2 bg-[#272A30] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-gray-500 text-sm w-10">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sample Reviews */}
            <div className="lg:col-span-2 space-y-4">
              {[
                {
                  name: "Defense Procurement Officer",
                  company: "Ministry of Defense",
                  rating: 5,
                  date: "2 weeks ago",
                  comment: "Excellent quality and timely delivery. The technical specifications matched exactly what was promised. Would highly recommend for defense procurement."
                },
                {
                  name: "Systems Integration Lead",
                  company: "Aerospace Corp",
                  rating: 4,
                  date: "1 month ago",
                  comment: "Good product quality and responsive support team. Documentation was comprehensive. Minor delays in shipping but overall satisfied with the partnership."
                },
                {
                  name: "Quality Assurance Manager",
                  company: "Defense Systems Inc",
                  rating: 5,
                  date: "2 months ago",
                  comment: "Outstanding compliance with military specifications. All certifications were verified and accurate. Professional communication throughout the process."
                }
              ].map((review, idx) => (
                <div key={idx} className="bg-[#0F1115] border border-[#272A30] rounded-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white font-medium">{review.name}</p>
                      <p className="text-gray-500 text-sm">{review.company}</p>
                    </div>
                    <span className="text-gray-500 text-sm">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm">{review.comment}</p>
                </div>
              ))}
              
              <p className="text-center text-gray-500 text-sm pt-4">
                Showing 3 of {supplier.review_count} reviews
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
