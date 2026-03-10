import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, FileText, CheckCircle, ArrowRight, ArrowLeft, Upload, Layers, AlertCircle, Plus, X } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export const ProductListingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  const [form, setForm] = useState({
    // Step 1: Basic Info
    name: "",
    category_id: "",
    category_name: "",
    subcategory: "",
    short_description: "",
    description: "",
    // Step 2: Technical Specs
    specifications: {},
    dimensions: "",
    weight: "",
    operating_temp: "",
    // Step 3: Pricing & Delivery
    price_range: "",
    currency: "USD",
    lead_time: "",
    delivery_type: "In Stock",
    certifications: [],
    // Step 4: Media
    image_url: ""
  });

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "AED", name: "UAE Dirham" }
  ];

  const deliveryTypes = [
    "In Stock",
    "Made to Order",
    "Pre-Order",
    "Custom Build"
  ];

  const certificationOptions = [
    "ISO 9001:2015",
    "NATO STANAG",
    "MIL-STD-810G",
    "MIL-STD-810H",
    "ITAR Compliant",
    "AS9100D",
    "AQAP 2110",
    "IPC-A-610 Class 3",
    "IP67",
    "IP68",
    "TEMPEST"
  ];

  const leadTimeOptions = [
    "1-2 weeks",
    "2-4 weeks",
    "4-6 weeks",
    "6-8 weeks",
    "8-12 weeks",
    "3-6 months",
    "6-12 months",
    "12+ months"
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data);
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  };

  const handleCategoryChange = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    setForm(f => ({
      ...f,
      category_id: categoryId,
      category_name: category?.name || "",
      subcategory: ""
    }));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setForm(f => ({
        ...f,
        specifications: {
          ...f.specifications,
          [specKey.trim()]: specValue.trim()
        }
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpecification = (key) => {
    const newSpecs = { ...form.specifications };
    delete newSpecs[key];
    setForm(f => ({ ...f, specifications: newSpecs }));
  };

  const toggleCertification = (cert) => {
    setForm(f => ({
      ...f,
      certifications: f.certifications.includes(cert)
        ? f.certifications.filter(c => c !== cert)
        : [...f.certifications, cert]
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.name || !form.category_id || !form.short_description || !form.description) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("dc_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post(`${API}/product-submission`, form, { headers });
      toast.success("Product submitted successfully! It will be reviewed shortly.");
      navigate("/");
    } catch (e) {
      if (e.response?.data?.detail) {
        toast.error(e.response.data.detail);
      } else {
        toast.error("Failed to submit product. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === form.category_id);

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="product-listing-page">
      {/* Hero */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115] to-[#050505]" />
        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Barlow Condensed' }} data-testid="page-title">
              LIST A NEW<br />
              <span className="text-[#00CED1]">DEFENSE PRODUCT</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Submit your product for review and reach verified defense buyers worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-6 bg-[#0F1115] border-y border-[#272A30]">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[
              { num: 1, label: "Basic Info", icon: Package },
              { num: 2, label: "Specifications", icon: Layers },
              { num: 3, label: "Pricing", icon: FileText },
              { num: 4, label: "Review", icon: CheckCircle }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 md:gap-4">
                <div className={`flex items-center gap-2 ${step >= item.num ? 'text-white' : 'text-gray-500'}`}>
                  <div className={`w-10 h-10 rounded-sm flex items-center justify-center transition-colors ${
                    step > item.num ? 'bg-green-500' : 
                    step === item.num ? 'bg-[#00CED1]' : 'bg-[#272A30]'
                  }`}>
                    {step > item.num ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <item.icon className={`w-5 h-5 ${step === item.num ? 'text-black' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{item.label}</span>
                </div>
                {idx < 3 && (
                  <div className={`w-8 md:w-16 h-0.5 ${step > item.num ? 'bg-green-500' : 'bg-[#272A30]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-8">
              
              {/* Step 1: Basic Product Info */}
              {step === 1 && (
                <div data-testid="step-1">
                  <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                    PRODUCT INFORMATION
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="text-gray-400">Product Name *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                        className="bg-[#050505] border-[#272A30] text-white mt-2"
                        placeholder="e.g., Tactical Radio System X200"
                        data-testid="product-name"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-400">Category *</Label>
                        <Select value={form.category_id} onValueChange={handleCategoryChange}>
                          <SelectTrigger className="bg-[#050505] border-[#272A30] text-white mt-2" data-testid="category-select">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0F1115] border-[#272A30]">
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-400">Subcategory</Label>
                        <Select 
                          value={form.subcategory} 
                          onValueChange={(val) => setForm(f => ({ ...f, subcategory: val }))}
                          disabled={!selectedCategory}
                        >
                          <SelectTrigger className="bg-[#050505] border-[#272A30] text-white mt-2" data-testid="subcategory-select">
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0F1115] border-[#272A30]">
                            {selectedCategory?.subcategories?.map((sub) => (
                              <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-400">Short Description *</Label>
                      <Input
                        value={form.short_description}
                        onChange={(e) => setForm(f => ({ ...f, short_description: e.target.value }))}
                        required
                        className="bg-[#050505] border-[#272A30] text-white mt-2"
                        placeholder="Brief one-line description (max 150 chars)"
                        maxLength={150}
                        data-testid="short-description"
                      />
                      <p className="text-gray-500 text-xs mt-1">{form.short_description.length}/150 characters</p>
                    </div>

                    <div>
                      <Label className="text-gray-400">Full Description *</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                        required
                        className="bg-[#050505] border-[#272A30] text-white mt-2 min-h-[150px]"
                        placeholder="Detailed product description including features, applications, and key benefits..."
                        data-testid="description"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Technical Specifications */}
              {step === 2 && (
                <div data-testid="step-2">
                  <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                    TECHNICAL SPECIFICATIONS
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Custom Specifications */}
                    <div>
                      <Label className="text-gray-400">Add Specifications</Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          value={specKey}
                          onChange={(e) => setSpecKey(e.target.value)}
                          className="bg-[#050505] border-[#272A30] text-white flex-1"
                          placeholder="Spec name (e.g., Range)"
                          data-testid="spec-key"
                        />
                        <Input
                          value={specValue}
                          onChange={(e) => setSpecValue(e.target.value)}
                          className="bg-[#050505] border-[#272A30] text-white flex-1"
                          placeholder="Value (e.g., 300km)"
                          data-testid="spec-value"
                        />
                        <button
                          type="button"
                          onClick={addSpecification}
                          className="btn-primary px-4"
                          data-testid="add-spec-btn"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Added Specifications List */}
                      {Object.keys(form.specifications).length > 0 && (
                        <div className="mt-4 space-y-2">
                          {Object.entries(form.specifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between bg-[#050505] border border-[#272A30] rounded-sm px-4 py-2">
                              <span className="text-gray-400">{key}:</span>
                              <span className="text-white">{value}</span>
                              <button
                                type="button"
                                onClick={() => removeSpecification(key)}
                                className="text-red-500 hover:text-red-400 ml-2"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-400">Dimensions</Label>
                        <Input
                          value={form.dimensions}
                          onChange={(e) => setForm(f => ({ ...f, dimensions: e.target.value }))}
                          className="bg-[#050505] border-[#272A30] text-white mt-2"
                          placeholder="e.g., 220mm x 85mm x 45mm"
                          data-testid="dimensions"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Weight</Label>
                        <Input
                          value={form.weight}
                          onChange={(e) => setForm(f => ({ ...f, weight: e.target.value }))}
                          className="bg-[#050505] border-[#272A30] text-white mt-2"
                          placeholder="e.g., 1.2 kg"
                          data-testid="weight"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-400">Operating Temperature Range</Label>
                      <Input
                        value={form.operating_temp}
                        onChange={(e) => setForm(f => ({ ...f, operating_temp: e.target.value }))}
                        className="bg-[#050505] border-[#272A30] text-white mt-2"
                        placeholder="e.g., -40°C to +70°C"
                        data-testid="operating-temp"
                      />
                    </div>

                    {/* Certifications */}
                    <div>
                      <Label className="text-gray-400">Certifications & Standards</Label>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {certificationOptions.map((cert) => (
                          <button
                            key={cert}
                            type="button"
                            onClick={() => toggleCertification(cert)}
                            className={`px-4 py-2 rounded-sm text-sm transition-colors ${
                              form.certifications.includes(cert)
                                ? 'bg-[#00CED1] text-black'
                                : 'bg-[#272A30] text-gray-400 hover:bg-[#1A1D24]'
                            }`}
                            data-testid={`cert-${cert.replace(/\s+/g, '-').toLowerCase()}`}
                          >
                            {cert}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & Delivery */}
              {step === 3 && (
                <div data-testid="step-3">
                  <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                    PRICING & DELIVERY
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-400">Price Range</Label>
                        <Input
                          value={form.price_range}
                          onChange={(e) => setForm(f => ({ ...f, price_range: e.target.value }))}
                          className="bg-[#050505] border-[#272A30] text-white mt-2"
                          placeholder="e.g., $10,000 - $50,000"
                          data-testid="price-range"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Currency</Label>
                        <Select value={form.currency} onValueChange={(val) => setForm(f => ({ ...f, currency: val }))}>
                          <SelectTrigger className="bg-[#050505] border-[#272A30] text-white mt-2" data-testid="currency-select">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0F1115] border-[#272A30]">
                            {currencies.map((curr) => (
                              <SelectItem key={curr.code} value={curr.code}>{curr.code} - {curr.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-400">Lead Time</Label>
                        <Select value={form.lead_time} onValueChange={(val) => setForm(f => ({ ...f, lead_time: val }))}>
                          <SelectTrigger className="bg-[#050505] border-[#272A30] text-white mt-2" data-testid="lead-time-select">
                            <SelectValue placeholder="Select lead time" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0F1115] border-[#272A30]">
                            {leadTimeOptions.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-400">Delivery Type</Label>
                        <Select value={form.delivery_type} onValueChange={(val) => setForm(f => ({ ...f, delivery_type: val }))}>
                          <SelectTrigger className="bg-[#050505] border-[#272A30] text-white mt-2" data-testid="delivery-type-select">
                            <SelectValue placeholder="Select delivery type" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0F1115] border-[#272A30]">
                            {deliveryTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Product Image */}
                    <div>
                      <Label className="text-gray-400">Product Image URL</Label>
                      <Input
                        value={form.image_url}
                        onChange={(e) => setForm(f => ({ ...f, image_url: e.target.value }))}
                        className="bg-[#050505] border-[#272A30] text-white mt-2"
                        placeholder="https://example.com/product-image.jpg"
                        data-testid="image-url"
                      />
                      <p className="text-gray-500 text-xs mt-1">Enter a direct URL to your product image</p>
                      
                      {/* Image Preview */}
                      {form.image_url && (
                        <div className="mt-4 border border-[#272A30] rounded-sm overflow-hidden">
                          <img 
                            src={form.image_url} 
                            alt="Product preview" 
                            className="w-full h-48 object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}

                      {/* Upload Placeholder */}
                      <div className="mt-4 border-2 border-dashed border-[#272A30] rounded-sm p-6 text-center hover:border-[#00CED1] transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">File upload coming soon</p>
                        <p className="text-gray-500 text-xs mt-1">For now, please provide an image URL above</p>
                      </div>
                    </div>

                    {/* Notice */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-sm p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-blue-400 text-sm">
                            <strong>Pricing Note:</strong> Exact pricing is typically discussed during buyer inquiries. 
                            You can provide a range or leave this field empty for "Contact for Pricing".
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div data-testid="step-4">
                  <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                    REVIEW & SUBMIT
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Basic Info Review */}
                    <div className="bg-[#050505] border border-[#272A30] rounded-sm p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#00CED1]" />
                        Product Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-500">Product Name</p>
                            <p className="text-white">{form.name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Category</p>
                            <p className="text-white">{form.category_name || '-'} {form.subcategory && `/ ${form.subcategory}`}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500">Short Description</p>
                          <p className="text-white">{form.short_description || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Full Description</p>
                          <p className="text-white text-sm line-clamp-3">{form.description || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Specifications Review */}
                    <div className="bg-[#050505] border border-[#272A30] rounded-sm p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#00CED1]" />
                        Technical Specifications
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {form.dimensions && (
                          <div>
                            <p className="text-gray-500">Dimensions</p>
                            <p className="text-white">{form.dimensions}</p>
                          </div>
                        )}
                        {form.weight && (
                          <div>
                            <p className="text-gray-500">Weight</p>
                            <p className="text-white">{form.weight}</p>
                          </div>
                        )}
                        {form.operating_temp && (
                          <div>
                            <p className="text-gray-500">Operating Temp</p>
                            <p className="text-white">{form.operating_temp}</p>
                          </div>
                        )}
                        {Object.entries(form.specifications).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-gray-500">{key}</p>
                            <p className="text-white">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Review */}
                    <div className="bg-[#050505] border border-[#272A30] rounded-sm p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#00CED1]" />
                        Pricing & Delivery
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Price Range</p>
                          <p className="text-white">{form.price_range || 'Contact for Pricing'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Currency</p>
                          <p className="text-white">{form.currency}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Lead Time</p>
                          <p className="text-white">{form.lead_time || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Delivery Type</p>
                          <p className="text-white">{form.delivery_type}</p>
                        </div>
                      </div>
                    </div>

                    {/* Certifications Review */}
                    <div className="bg-[#050505] border border-[#272A30] rounded-sm p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#00CED1]" />
                        Certifications
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {form.certifications.length > 0 ? (
                          form.certifications.map((cert) => (
                            <span key={cert} className="bg-[#00CED1]/10 text-[#00CED1] text-sm px-3 py-1 rounded-sm">
                              {cert}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No certifications selected</p>
                        )}
                      </div>
                    </div>

                    {/* Notice */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-sm p-4">
                      <p className="text-yellow-500 text-sm">
                        <strong>Note:</strong> All product submissions are reviewed before being published to ensure quality and compliance. You will receive a notification once your product is approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-[#272A30]">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-secondary flex items-center gap-2"
                    data-testid="back-btn"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    BACK
                  </button>
                ) : (
                  <div />
                )}
                
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary flex items-center gap-2"
                    data-testid="next-btn"
                  >
                    NEXT
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary flex items-center gap-2"
                    data-testid="submit-btn"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        SUBMITTING...
                      </>
                    ) : (
                      <>
                        SUBMIT FOR REVIEW
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
