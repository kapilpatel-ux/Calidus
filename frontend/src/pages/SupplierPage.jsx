import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, CheckCircle, MapPin, Shield, Globe, Award, ChevronRight } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

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
        <p className="text-gray-400">Supplier not found</p>
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
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-[#0F1115] rounded-sm overflow-hidden border border-[#272A30]">
                <img src={supplier.logo_url} alt={supplier.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }} data-testid="supplier-title">
                    {supplier.name.toUpperCase()}
                  </h1>
                  {supplier.verified && (
                    <span className="badge-verified flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-lg mb-4">{supplier.tagline}</p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#00CED1]" />
                    <span className="text-gray-400">{supplier.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                    ))}
                    <span className="text-white font-medium">{supplier.rating}</span>
                    <span className="text-gray-500">({supplier.review_count} reviews)</span>
                  </div>
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

      {/* Stats */}
      <section className="py-8 bg-[#0F1115] border-y border-[#272A30]">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
              <p className="text-gray-500 text-sm mt-1">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{supplier.review_count}</p>
              <p className="text-gray-500 text-sm mt-1">Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                COMPANY OVERVIEW
              </h2>
              <p className="text-gray-400 leading-relaxed">{supplier.description}</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                CAPABILITIES
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {supplier.capabilities?.map((cap, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#0F1115] border border-[#272A30] rounded-sm p-4">
                    <div className="w-8 h-8 bg-[#00CED1]/10 rounded-sm flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[#00CED1]" />
                    </div>
                    <span className="text-white text-sm">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      {supplier.certifications?.length > 0 && (
        <section className="py-16 bg-[#0F1115]">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Barlow Condensed' }}>
              CERTIFICATIONS
            </h2>
            <div className="flex flex-wrap gap-4">
              {supplier.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#050505] border border-[#272A30] rounded-sm px-4 py-3">
                  <Award className="w-5 h-5 text-[#00CED1]" />
                  <span className="text-white">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      {products.length > 0 && (
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Barlow Condensed' }}>
              PRODUCTS BY {supplier.name.toUpperCase()}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, idx) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="bg-[#0F1115] border border-[#272A30] rounded-sm overflow-hidden card-hover"
                  data-testid={`product-card-${idx}`}
                >
                  <div className="aspect-video">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
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
        </section>
      )}
    </div>
  );
};
