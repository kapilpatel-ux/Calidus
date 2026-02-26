import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, CheckCircle, Download, ArrowLeft, Shield, ChevronRight } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

export const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [supplier, setSupplier] = useState(null);
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
        const prodRes = await axios.get(`${API}/products/${slug}`);
        setProduct(prodRes.data);
        
        if (prodRes.data.supplier_id) {
          try {
            const supRes = await axios.get(`${API}/suppliers/${prodRes.data.supplier_id}`);
            setSupplier(supRes.data);
          } catch (e) {
            console.error("Error fetching supplier:", e);
          }
        }
      } catch (e) {
        console.error("Error fetching product:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!product) return;
    
    setSubmitting(true);
    try {
      await axios.post(`${API}/inquiry`, {
        ...inquiryForm,
        product_id: product.id,
        supplier_id: product.supplier_id
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

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] pt-20 flex items-center justify-center">
        <p className="text-gray-400">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="product-page">
      {/* Breadcrumb */}
      <div className="container-custom py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/components" className="text-gray-500 hover:text-white transition-colors">Components</Link>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <Link to={`/category/${product.category_id}`} className="text-gray-500 hover:text-white transition-colors">
            {product.category_name}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <span className="text-gray-400">{product.name}</span>
        </div>
      </div>

      {/* Product Hero */}
      <section className="py-8">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/3] bg-[#0F1115] rounded-sm overflow-hidden">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {product.in_stock && (
                <span className="absolute top-4 left-4 bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-sm">
                  In Stock
                </span>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Barlow Condensed' }} data-testid="product-title">
                {product.name.toUpperCase()}
              </h1>
              <p className="text-gray-400 text-lg mb-6">{product.short_description}</p>

              {/* Supplier Info */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-500">Supplier:</span>
                <Link to={`/supplier/${product.supplier_id}`} className="flex items-center gap-2 text-white hover:text-[#00CED1] transition-colors">
                  {product.supplier_name}
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </Link>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                  ))}
                  <span className="text-white font-medium ml-2">{product.rating}</span>
                </div>
                <span className="text-gray-500">({product.review_count} reviews)</span>
                <span className="text-gray-500">• {product.country}</span>
              </div>

              {/* CTAs */}
              <div className="flex gap-4 mb-8">
                <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
                  <DialogTrigger asChild>
                    <button className="btn-primary flex items-center gap-2" data-testid="contact-supplier-btn">
                      CONTACT SUPPLIER
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0F1115] border-[#272A30]">
                    <DialogHeader>
                      <DialogTitle className="text-white">Contact Supplier</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleInquirySubmit} className="space-y-4 mt-4">
                      <div>
                        <Label className="text-gray-400">Full Name</Label>
                        <Input
                          value={inquiryForm.full_name}
                          onChange={(e) => setInquiryForm(f => ({ ...f, full_name: e.target.value }))}
                          required
                          className="bg-[#050505] border-[#272A30] text-white mt-1"
                          data-testid="inquiry-name"
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
                          data-testid="inquiry-email"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Company (Optional)</Label>
                        <Input
                          value={inquiryForm.company_name}
                          onChange={(e) => setInquiryForm(f => ({ ...f, company_name: e.target.value }))}
                          className="bg-[#050505] border-[#272A30] text-white mt-1"
                          data-testid="inquiry-company"
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
                          data-testid="inquiry-message"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full"
                        data-testid="submit-inquiry-btn"
                      >
                        {submitting ? "Submitting..." : "SUBMIT INQUIRY"}
                      </button>
                    </form>
                  </DialogContent>
                </Dialog>
                <button className="btn-secondary flex items-center gap-2" data-testid="download-datasheet-btn">
                  <Download className="w-4 h-4" />
                  DOWNLOAD DATASHEET
                </button>
              </div>

              {/* Certifications */}
              {product.certifications?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert, i) => (
                    <span key={i} className="bg-[#00CED1]/10 text-[#00CED1] text-xs px-3 py-1 rounded-sm flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Overview & Specs */}
      <section className="py-16 bg-[#0F1115]">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Overview */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                PRODUCT OVERVIEW
              </h2>
              <p className="text-gray-400 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                TECHNICAL SPECIFICATIONS
              </h2>
              <div className="space-y-4">
                {Object.entries(product.specifications || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-[#272A30]">
                    <span className="text-gray-400">{key}</span>
                    <span className="text-white font-medium" style={{ fontFamily: 'JetBrains Mono' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Snapshot */}
      {supplier && (
        <section className="py-16 bg-[#050505]">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Barlow Condensed' }}>
              SUPPLIER SNAPSHOT
            </h2>
            <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#1A1D24] rounded-sm overflow-hidden">
                    <img src={supplier.logo_url} alt={supplier.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {supplier.name}
                      {supplier.verified && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </h3>
                    <p className="text-gray-400">{supplier.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#00CED1]">{supplier.active_products}</p>
                    <p className="text-gray-500 text-sm">Active Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#00CED1]">{supplier.countries_served}</p>
                    <p className="text-gray-500 text-sm">Countries Served</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#00CED1]">{supplier.rating}</p>
                    <p className="text-gray-500 text-sm">Rating</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[#272A30]">
                <Link
                  to={`/supplier/${supplier.slug}`}
                  className="btn-secondary inline-flex items-center gap-2"
                  data-testid="view-supplier-profile-btn"
                >
                  VIEW SUPPLIER PROFILE
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
