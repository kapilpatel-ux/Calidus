import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      login(res.data.token, res.data.user);
      toast.success("Login successful!");
      navigate("/");
    } catch (e) {
      if (e.response?.data?.detail) {
        toast.error(e.response.data.detail);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-20 flex items-center" data-testid="login-page">
      <div className="container-custom">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Barlow Condensed' }} data-testid="page-title">
              SIGN IN TO <span className="text-[#00CED1]">DEFENSE CONNECT</span>
            </h1>
            <p className="text-gray-400">
              Access your account to manage inquiries and connect with suppliers.
            </p>
          </div>

          <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    data-testid="login-email"
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
                    data-testid="login-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
                data-testid="login-submit"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    SIGNING IN...
                  </>
                ) : (
                  <>
                    SIGN IN
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-[#00CED1] hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
