import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, User, FileText, CheckCircle, ArrowRight, ArrowLeft, Upload, MapPin, Globe } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export const SupplierRegistrationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    // Step 1: Company Info
    company_name: "",
    contact_person: "",
    supplier_type: "",
    email: "",
    phone: "",
    license_number: "",
    vat_number: "",
    linkedin_profile: "",
    currency: "USD",
    // Step 2: Address
    address_line_1: "",
    address_line_2: "",
    zip_code: "",
    city_state: "",
    country: "",
    // Step 3: Documents & Certifications
    additional_certifications: [],
    trade_license_expiry: "",
    vat_certificate_expiry: ""
  });

  const supplierTypes = [
    "Manufacturer",
    "Distributor",
    "System Integrator",
    "Service Provider",
    "Research & Development",
    "Trading Company"
  ];

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "AED", name: "UAE Dirham" },
    { code: "SAR", name: "Saudi Riyal" },
    { code: "SGD", name: "Singapore Dollar" }
  ];

  const countries = [
    "United States", "United Kingdom", "Germany", "France", "UAE", 
    "Saudi Arabia", "Singapore", "Norway", "Sweden", "Australia",
    "Canada", "Israel", "South Korea", "Japan", "India", "Turkey"
  ];

  const certificationOptions = [
    "ISO 9001:2015",
    "ISO 14001",
    "AS9100D",
    "ITAR Compliant",
    "NATO Certified",
    "AQAP 2110",
    "IPC-A-610 Class 3",
    "NADCAP",
    "MIL-STD Compliant"
  ];

  const handleNext = () => {
    if (step === 1) {
      if (!form.company_name || !form.supplier_type || !form.contact_person || !form.email || !form.phone || !form.license_number) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (!form.email.includes('@')) {
        toast.error("Please enter a valid email address");
        return;
      }
    }
    if (step === 2) {
      if (!form.address_line_1 || !form.city_state || !form.country) {
        toast.error("Please fill in all required address fields");
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
      await axios.post(`${API}/supplier-registration`, form);
      toast.success("Registration submitted successfully! We'll review your application.");
      navigate("/");
    } catch (e) {
      if (e.response?.data?.detail) {
        toast.error(e.response.data.detail);
      } else {
        toast.error("Failed to submit registration. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCertification = (cert) => {
    setForm(f => ({
      ...f,
      additional_certifications: f.additional_certifications.includes(cert)
        ? f.additional_certifications.filter(c => c !== cert)
        : [...f.additional_certifications, cert]
    }));
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="supplier-registration-page">
      {/* Hero */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115] to-[#050505]" />
        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Barlow Condensed' }} data-testid="page-title">
              BECOME A VERIFIED<br />
              <span className="text-[#00CED1]">DEFENSE SUPPLIER</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Join our network of trusted suppliers and connect with defense buyers worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-6 bg-[#0F1115] border-y border-[#272A30]">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[
              { num: 1, label: "Company Info", icon: Building },
              { num: 2, label: "Address", icon: MapPin },
              { num: 3, label: "Documents", icon: FileText },
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
              
              {/* Step 1: Company Information */}
              {step === 1 && (
                <div data-testid="step-1">
                  <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                    SUPPLIER INFORMATION
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-400">Company Name *</Label>
                        <Input
                          value={form.company_name}
                          onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))}
                          required
                          className="bg-[#050505] border-[#272A30] text-white mt-2"
                          placeholder="Enter company name"
                          data-testid="company-name"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Contact Person *</Label>
                        <Input
                          value={form.contact_person}
                          onChange={(e) => setForm(f => ({ ...f, contact_person: e.target.value }))}
                          required
                          className="bg-[#050505] border-[#272A30] text-white mt-2"
                          placeholder="Full name"
                          data-testid="contact-person"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-400">Supplier Type *</Label>
                      <Select value={form.supplier_type} onValueChange={(val) => setForm(f => ({ ...f, supplier_type: val }))}>
                        <SelectTrigger className="bg-[#050505] border-[#272A30] text-white mt-2" data-testid="supplier-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0F1115] border-[#272A30]">
                          {supplierTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-400">Email *</Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                          required
                          className="bg-[#050505] border-[#272A30] text-white mt-2"
                          placeholder="email@company.com"
                          data-testid="email"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Phone *</Label>
                        <Input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                          required
                          className="bg-[#050505] border-[#272A30] text-white mt-2"
                          placeholder="+1 000 000 0000"
                          data-testid="phone"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-400">License Number *</Label>
                        <Input
                          value={form.license_number}
                          onChange={(e) => setForm(f => ({ ...f, license_number: e.target.value }))}
                          required
                          className="bg-[#050505] border-[#272A30] text-white mt-2"
                          placeholder="Enter license number"
                          data-testid="license-number"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">VAT Number</Label>
                        <Input
                          value={form.vat_number}
                          onChange={(e) => setForm(f => ({ ...f, vat_number: e.target.value }))}
                          className="bg-[#050505] border-[#272A30] text-white mt-2"
                          placeholder="Enter VAT number"
                          data-testid="vat-number"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-400">LinkedIn Profile (Optional)</Label>
                        <Input
                          value={form.linkedin_profile}
                          onChange={(e) => setForm(f => ({ ...f, linkedin_profile: e.target.value }))}
                          className="bg-[#050505] border-[#272A30] text-white mt-2"
                          placeholder="linkedin.com/company/..."
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Supplier Currency *</Label>
                        <Select value={form.currency} onValueChange={(val) => setForm(f => ({ ...f, currency: val }))}>
                          <SelectTrigger className="bg-[#050505] border-[#272A30] text-white mt-2">
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
                  </div>
                </div>
              )}

              {/* Step 2: Address */}
              {step === 2 && (
                <div data-testid="step-2">
                  <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                    SUPPLIER ADDRESS
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="text-gray-400">Address Line 1 *</Label>
                      <Input
                        value={form.address_line_1}
                        onChange={(e) => setForm(f => ({ ...f, address_line_1: e.target.value }))}
                        required
                        className="bg-[#050505] border-[#272A30] text-white mt-2"
                        placeholder="Street address, P.O. box"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-400">Address Line 2</Label>
                      <Input
                        value={form.address_line_2}
                        onChange={(e) => setForm(f => ({ ...f, address_line_2: e.target.value }))}
                        className="bg-[#050505] border-[#272A30] text-white mt-2"
                        placeholder="Building, floor, suite (optional)"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-400">ZIP / Postal Code</Label>
                        <Input
                          value={form.zip_code}
                          onChange={(e) => setForm(f => ({ ...f, zip_code: e.target.value }))}
                          className="bg-[#050505] border-[#272A30] text-white mt-2"
                          placeholder="00000"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">City / State *</Label>
                        <Input
                          value={form.city_state}
                          onChange={(e) => setForm(f => ({ ...f, city_state: e.target.value }))}
                          required
                          className="bg-[#050505] border-[#272A30] text-white mt-2"
                          placeholder="City, State"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-400">Country *</Label>
                      <Select value={form.country} onValueChange={(val) => setForm(f => ({ ...f, country: val }))}>
                        <SelectTrigger className="bg-[#050505] border-[#272A30] text-white mt-2">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0F1115] border-[#272A30]">
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {step === 3 && (
                <div data-testid="step-3">
                  <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                    DOCUMENT UPLOAD
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Trade License Upload */}
                    <div>
                      <Label className="text-gray-400">Trade License</Label>
                      <div className="mt-2 border-2 border-dashed border-[#272A30] rounded-sm p-6 text-center hover:border-[#00CED1] transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Click to upload or drag and drop</p>
                        <p className="text-gray-500 text-xs mt-1">PDF, PNG, JPG up to 10MB</p>
                      </div>
                      <div className="mt-2">
                        <Label className="text-gray-400 text-sm">Expiry Date</Label>
                        <Input
                          type="date"
                          value={form.trade_license_expiry}
                          onChange={(e) => setForm(f => ({ ...f, trade_license_expiry: e.target.value }))}
                          className="bg-[#050505] border-[#272A30] text-white mt-1"
                          data-testid="trade-license-expiry"
                        />
                      </div>
                    </div>

                    {/* VAT Certificate Upload */}
                    <div>
                      <Label className="text-gray-400">VAT Certificate</Label>
                      <div className="mt-2 border-2 border-dashed border-[#272A30] rounded-sm p-6 text-center hover:border-[#00CED1] transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Click to upload or drag and drop</p>
                        <p className="text-gray-500 text-xs mt-1">PDF, PNG, JPG up to 10MB</p>
                      </div>
                      <div className="mt-2">
                        <Label className="text-gray-400 text-sm">Expiry Date</Label>
                        <Input
                          type="date"
                          value={form.vat_certificate_expiry}
                          onChange={(e) => setForm(f => ({ ...f, vat_certificate_expiry: e.target.value }))}
                          className="bg-[#050505] border-[#272A30] text-white mt-1"
                          data-testid="vat-certificate-expiry"
                        />
                      </div>
                    </div>

                    {/* Additional Certifications Upload */}
                    <div>
                      <Label className="text-gray-400">Additional Certifications</Label>
                      <div className="mt-2 border-2 border-dashed border-[#272A30] rounded-sm p-6 text-center hover:border-[#00CED1] transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Upload additional certification documents</p>
                        <p className="text-gray-500 text-xs mt-1">PDF, PNG, JPG up to 10MB each</p>
                      </div>
                    </div>

                    {/* Certification Selection */}
                    <div>
                      <Label className="text-gray-400">Select Your Certifications</Label>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {certificationOptions.map((cert) => (
                          <button
                            key={cert}
                            type="button"
                            onClick={() => toggleCertification(cert)}
                            className={`px-4 py-2 rounded-sm text-sm transition-colors ${
                              form.additional_certifications.includes(cert)
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

              {/* Step 4: Review */}
              {step === 4 && (
                <div data-testid="step-4">
                  <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                    REVIEW & SUBMIT
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Company Info Review */}
                    <div className="bg-[#050505] border border-[#272A30] rounded-sm p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#00CED1]" />
                        Company Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Company Name</p>
                          <p className="text-white">{form.company_name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Supplier Type</p>
                          <p className="text-white">{form.supplier_type || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Contact Person</p>
                          <p className="text-white">{form.contact_person || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="text-white">{form.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="text-white">{form.phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Currency</p>
                          <p className="text-white">{form.currency || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address Review */}
                    <div className="bg-[#050505] border border-[#272A30] rounded-sm p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#00CED1]" />
                        Address
                      </h3>
                      <p className="text-white text-sm">
                        {form.address_line_1}{form.address_line_2 && `, ${form.address_line_2}`}<br />
                        {form.city_state}{form.zip_code && `, ${form.zip_code}`}<br />
                        {form.country}
                      </p>
                    </div>

                    {/* Certifications Review */}
                    <div className="bg-[#050505] border border-[#272A30] rounded-sm p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#00CED1]" />
                        Certifications
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {form.additional_certifications.length > 0 ? (
                          form.additional_certifications.map((cert) => (
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
                        <strong>Note:</strong> All submissions undergo compliance verification before activation. You will receive an email notification once your application is reviewed.
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
                        SUBMIT FOR VERIFICATION
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
