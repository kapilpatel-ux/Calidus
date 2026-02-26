import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Building, ArrowRight } from "lucide-react";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    company_name: "",
    user_type: "buyer"
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const res = await axios.post(`${API}/auth/register`, form);
      login(res.data.token, res.data.user);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (e) {
      if (e.response?.data?.detail) {
        toast.error(e.response.data.detail);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-20 flex items-center" data-testid="register-page">
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Barlow Condensed' }} data-testid="page-title">
              CREATE YOUR <span className="text-[#00CED1]">ACCOUNT</span>
            </h1>
            <p className="text-gray-400">
              Join Defense Connect to discover verified suppliers and components.
            </p>
          </div>

          <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-gray-400">Full Name</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                    required
                    className="bg-[#050505] border-[#272A30] text-white pl-10"
                    placeholder="John Smith"
                    data-testid="register-name"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-400">Company Name</Label>
                <div className="relative mt-2">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    value={form.company_name}
                    onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))}
                    className="bg-[#050505] border-[#272A30] text-white pl-10"
                    placeholder="Defense Corp (optional)"
                    data-testid="register-company"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-400">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    className="bg-[#050505] border-[#272A30] text-white pl-10"
                    placeholder="email@company.com"
                    data-testid="register-email"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-400">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    className="bg-[#050505] border-[#272A30] text-white pl-10"
                    placeholder="••••••••"
                    data-testid="register-password"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">Minimum 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
                data-testid="register-submit"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    CREATING ACCOUNT...
                  </>
                ) : (
                  <>
                    CREATE ACCOUNT
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-[#00CED1] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
