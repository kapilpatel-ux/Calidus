import { useState } from "react";
import { MapPin, Mail, Phone, Send } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export const ContactPage = () => {
  const [form, setForm] = useState({
    full_name: "",
    company_name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await axios.post(`${API}/contact`, form);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm({
        full_name: "",
        company_name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (e) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const subjects = [
    "General Inquiry",
    "Partnership Opportunity",
    "Supplier Registration",
    "Technical Support",
    "Procurement Request",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="contact-page">
      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115] to-[#050505]" />
        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }} data-testid="page-title">
              CONNECT WITH <span className="text-[#00CED1]">OUR TEAM</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Have a question or want to learn more? Our team is ready to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Barlow Condensed' }}>
                CONTACT DETAILS
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#00CED1]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#00CED1]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Head Office</h3>
                    <p className="text-gray-400 text-sm">
                      Defense Connect HQ<br />
                      Abu Dhabi, UAE
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#00CED1]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#00CED1]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <a href="mailto:info@defenseconnect.com" className="text-gray-400 text-sm hover:text-[#00CED1] transition-colors">
                      info@defenseconnect.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#00CED1]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#00CED1]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Phone</h3>
                    <a href="tel:+971000000000" className="text-gray-400 text-sm hover:text-[#00CED1] transition-colors">
                      +971 00 000 0000
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-8">
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                  SEND US A MESSAGE
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-400">Full Name *</Label>
                      <Input
                        value={form.full_name}
                        onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                        required
                        className="bg-[#050505] border-[#272A30] text-white mt-2"
                        placeholder="John Smith"
                        data-testid="contact-name"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400">Company Name *</Label>
                      <Input
                        value={form.company_name}
                        onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))}
                        required
                        className="bg-[#050505] border-[#272A30] text-white mt-2"
                        placeholder="Defense Corp"
                        data-testid="contact-company"
                      />
                    </div>
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
                        placeholder="john@company.com"
                        data-testid="contact-email"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400">Phone</Label>
                      <Input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="bg-[#050505] border-[#272A30] text-white mt-2"
                        placeholder="+971 00 000 0000"
                        data-testid="contact-phone"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-400">Subject *</Label>
                    <Select value={form.subject} onValueChange={(val) => setForm(f => ({ ...f, subject: val }))}>
                      <SelectTrigger className="bg-[#050505] border-[#272A30] text-white mt-2" data-testid="contact-subject">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1115] border-[#272A30]">
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-400">Message *</Label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                      required
                      rows={6}
                      className="bg-[#050505] border-[#272A30] text-white mt-2"
                      placeholder="Tell us about your inquiry..."
                      data-testid="contact-message"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex items-center gap-2"
                    data-testid="submit-contact-btn"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        SENDING...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        SUBMIT INQUIRY
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
