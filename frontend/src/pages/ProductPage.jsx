import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, CheckCircle, Download, Shield, ChevronRight, Clock, MapPin, Package, Truck, Wrench, Globe, ArrowRight } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
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
        
        // Fetch supplier
        if (prodRes.data.supplier_id) {
          try {
            const supRes = await axios.get(`${API}/suppliers/${prodRes.data.supplier_slug || prodRes.data.supplier_id}`);
            setSupplier(supRes.data);
          } catch (e) {
            console.error("Error fetching supplier:", e);
          }
        }
        
        // Fetch related products
        try {
          const relRes = await axios.get(`${API}/products/${slug}/related`);
          setRelatedProducts(relRes.data || []);
        } catch (e) {
          console.error("Error fetching related products:", e);
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
        <div className="text-center">
          <p className="text-gray-400 mb-4">Product not found</p>
          <Link to="/components" className="text-[#00CED1] hover:underline">Browse all components</Link>
        </div>
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
          <span className="text-gray-400 truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Product Hero */}
      <section className="py-8">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/3] bg-[#0F1115] rounded-sm overflow-hidden border border-[#272A30]">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-4 left-4 flex gap-2">
                {product.in_stock && (
                  <span className="bg-green-500/90 text-white text-sm px-3 py-1 rounded-sm font-medium">
                    In Stock
                  </span>
                )}
                {product.delivery_type === "Made to Order" && (
                  <span className="bg-blue-500/90 text-white text-sm px-3 py-1 rounded-sm font-medium">
                    Made to Order
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#00CED1] text-sm font-medium tracking-wider">{product.category_name}</span>
                {product.subcategory && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500 text-sm">{product.subcategory}</span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Barlow Condensed' }} data-testid="product-title">
                {product.name.toUpperCase()}
              </h1>
              <p className="text-gray-400 text-lg mb-6">{product.short_description}</p>

              {/* Supplier Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-[#0F1115] border border-[#272A30] rounded-sm">
                <div className="flex-1">
                  <p className="text-gray-500 text-sm mb-1">Supplier</p>
                  <Link 
                    to={`/supplier/${product.supplier_slug || product.supplier_id}`} 
                    className="flex items-center gap-2 text-white hover:text-[#00CED1] transition-colors font-medium"
                  >
                    {product.supplier_name}
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </Link>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm mb-1">Origin</p>
                  <p className="text-white flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {product.country}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                  ))}
                  <span className="text-white font-medium text-lg ml-2">{product.rating}</span>
                </div>
                <span className="text-gray-500">({product.review_count} reviews)</span>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {product.lead_time && (
                  <div className="flex items-center gap-3 bg-[#0F1115] border border-[#272A30] rounded-sm p-3">
                    <Clock className="w-5 h-5 text-[#00CED1]" />
                    <div>
                      <p className="text-gray-500 text-xs">Lead Time</p>
                      <p className="text-white text-sm font-medium">{product.lead_time}</p>
                    </div>
                  </div>
                )}
                {product.compliance_standard && (
                  <div className="flex items-center gap-3 bg-[#0F1115] border border-[#272A30] rounded-sm p-3">
                    <Shield className="w-5 h-5 text-[#00CED1]" />
                    <div>
                      <p className="text-gray-500 text-xs">Compliance</p>
                      <p className="text-white text-sm font-medium">{product.compliance_standard}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="flex gap-4 mb-6">
                <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
                  <DialogTrigger asChild>
                    <button className="btn-primary flex-1 flex items-center justify-center gap-2" data-testid="contact-supplier-btn">
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
                          placeholder={`I'm interested in the ${product.name}. Please provide pricing and availability information.`}
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
                <button className="btn-secondary flex items-center justify-center gap-2" data-testid="download-datasheet-btn">
                  <Download className="w-4 h-4" />
                  DATASHEET
                </button>
              </div>

              {/* Certifications */}
              {product.certifications?.length > 0 && (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {product.certifications.map((cert, i) => (
                      <span key={i} className="bg-[#00CED1]/10 text-[#00CED1] text-xs px-3 py-1.5 rounded-sm flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="py-12 bg-[#0F1115]">
        <div className="container-custom">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-[#050505] border border-[#272A30] p-1 mb-8">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black">
                Overview
              </TabsTrigger>
              <TabsTrigger value="specifications" className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black">
                Technical Specs
              </TabsTrigger>
              <TabsTrigger value="applications" className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black">
                Applications
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-0">
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                    PRODUCT OVERVIEW
                  </h2>
                  <p className="text-gray-400 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                    KEY FEATURES
                  </h2>
                  <div className="space-y-4">
                    {product.dimensions && (
                      <div className="flex items-start gap-4 bg-[#050505] border border-[#272A30] rounded-sm p-4">
                        <Package className="w-5 h-5 text-[#00CED1] mt-0.5" />
                        <div>
                          <p className="text-gray-500 text-sm">Dimensions</p>
                          <p className="text-white font-medium">{product.dimensions}</p>
                        </div>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex items-start gap-4 bg-[#050505] border border-[#272A30] rounded-sm p-4">
                        <Truck className="w-5 h-5 text-[#00CED1] mt-0.5" />
                        <div>
                          <p className="text-gray-500 text-sm">Weight</p>
                          <p className="text-white font-medium">{product.weight}</p>
                        </div>
                      </div>
                    )}
                    {product.operating_temp && (
                      <div className="flex items-start gap-4 bg-[#050505] border border-[#272A30] rounded-sm p-4">
                        <Wrench className="w-5 h-5 text-[#00CED1] mt-0.5" />
                        <div>
                          <p className="text-gray-500 text-sm">Operating Temperature</p>
                          <p className="text-white font-medium">{product.operating_temp}</p>
                        </div>
                      </div>
                    )}
                    {product.integration_compatibility && (
                      <div className="flex items-start gap-4 bg-[#050505] border border-[#272A30] rounded-sm p-4">
                        <Globe className="w-5 h-5 text-[#00CED1] mt-0.5" />
                        <div>
                          <p className="text-gray-500 text-sm">Integration Compatibility</p>
                          <p className="text-white font-medium">{product.integration_compatibility}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-0">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }} data-testid="product-specs">
                TECHNICAL SPECIFICATIONS
              </h2>
              <div className="bg-[#050505] border border-[#272A30] rounded-sm overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specifications || {}).map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-[#050505]' : 'bg-[#0A0A0C]'}>
                        <td className="px-6 py-4 text-gray-400 font-medium border-r border-[#272A30] w-1/3">{key}</td>
                        <td className="px-6 py-4 text-white" style={{ fontFamily: 'JetBrains Mono' }}>{value}</td>
                      </tr>
                    ))}
                    {product.dimensions && (
                      <tr className="bg-[#050505]">
                        <td className="px-6 py-4 text-gray-400 font-medium border-r border-[#272A30]">Dimensions</td>
                        <td className="px-6 py-4 text-white" style={{ fontFamily: 'JetBrains Mono' }}>{product.dimensions}</td>
                      </tr>
                    )}
                    {product.weight && (
                      <tr className="bg-[#0A0A0C]">
                        <td className="px-6 py-4 text-gray-400 font-medium border-r border-[#272A30]">Weight</td>
                        <td className="px-6 py-4 text-white" style={{ fontFamily: 'JetBrains Mono' }}>{product.weight}</td>
                      </tr>
                    )}
                    {product.operating_temp && (
                      <tr className="bg-[#050505]">
                        <td className="px-6 py-4 text-gray-400 font-medium border-r border-[#272A30]">Operating Temperature</td>
                        <td className="px-6 py-4 text-white" style={{ fontFamily: 'JetBrains Mono' }}>{product.operating_temp}</td>
                      </tr>
                    )}
                    {product.operational_range && (
                      <tr className="bg-[#0A0A0C]">
                        <td className="px-6 py-4 text-gray-400 font-medium border-r border-[#272A30]">Operational Range</td>
                        <td className="px-6 py-4 text-white" style={{ fontFamily: 'JetBrains Mono' }}>{product.operational_range}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="applications" className="mt-0">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                APPLICATION AREAS
              </h2>
              {product.application_areas?.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {product.application_areas.map((area, idx) => (
                    <div key={idx} className="bg-[#050505] border border-[#272A30] rounded-sm p-6 text-center">
                      <div className="w-12 h-12 bg-[#00CED1]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-6 h-6 text-[#00CED1]" />
                      </div>
                      <p className="text-white font-medium">{area}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Contact supplier for detailed application information.</p>
              )}
            </TabsContent>
          </Tabs>
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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-[#1A1D24] rounded-sm overflow-hidden flex-shrink-0">
                    <img src={supplier.logo_url} alt={supplier.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                      {supplier.name}
                      {supplier.verified && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </h3>
                    <p className="text-gray-400 mb-2">{supplier.tagline}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {supplier.country}
                      </span>
                      <span className="text-gray-500">{supplier.supplier_type}</span>
                      {supplier.years_in_operation > 0 && (
                        <span className="text-gray-500">{supplier.years_in_operation}+ years</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{supplier.active_products}</p>
                    <p className="text-gray-500 text-sm">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{supplier.countries_served}</p>
                    <p className="text-gray-500 text-sm">Countries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#00CED1]" style={{ fontFamily: 'Barlow Condensed' }}>{supplier.rating}</p>
                    <p className="text-gray-500 text-sm">Rating</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[#272A30] flex flex-wrap gap-4">
                <Link
                  to={`/supplier/${supplier.slug}`}
                  className="btn-secondary flex items-center gap-2"
                  data-testid="view-supplier-profile-btn"
                >
                  VIEW FULL PROFILE
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {supplier.certifications?.slice(0, 3).map((cert, i) => (
                  <span key={i} className="bg-[#050505] text-gray-400 text-sm px-3 py-2 rounded-sm border border-[#272A30]">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-[#0F1115]">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Barlow Condensed' }}>
              RELATED COMPONENTS
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProd, idx) => (
                <Link
                  key={relProd.id}
                  to={`/product/${relProd.slug}`}
                  className="bg-[#050505] border border-[#272A30] rounded-sm overflow-hidden card-hover"
                  data-testid={`related-product-${idx}`}
                >
                  <div className="aspect-video">
                    <img src={relProd.image_url} alt={relProd.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">{relProd.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(relProd.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                        ))}
                      </div>
                      <span className="text-white text-xs">{relProd.rating}</span>
                    </div>
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
