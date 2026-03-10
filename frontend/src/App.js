import { useEffect, useState, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

// Pages
import { HomePage } from "./pages/HomePage";
import { BrowseComponentsPage } from "./pages/BrowseComponentsPage";
import { CategoryPage } from "./pages/CategoryPage";
import { ProductPage } from "./pages/ProductPage";
import { SupplierPage } from "./pages/SupplierPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { SupplierRegistrationPage } from "./pages/SupplierRegistrationPage";
import { ProductListingPage } from "./pages/ProductListingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";

// Components
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { StickyAISearch } from "./components/StickyAISearch";
import { Toaster } from "./components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth
    const token = localStorage.getItem("dc_token");
    const storedUser = localStorage.getItem("dc_user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("dc_token");
        localStorage.removeItem("dc_user");
      }
    }
    setLoading(false);
    
    // Seed database on first load
    axios.post(`${API}/seed`).catch(() => {});
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("dc_token", token);
    localStorage.setItem("dc_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("dc_token");
    localStorage.removeItem("dc_user");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00CED1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="App min-h-screen bg-[#050505]">
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/components" element={<BrowseComponentsPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/supplier/:slug" element={<SupplierPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/supplier-registration" element={<SupplierRegistrationPage />} />
              <Route path="/list-product" element={<ProductListingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
            </Routes>
          </main>
          <Footer />
          <StickyAISearch />
          <Toaster position="top-right" />
        </BrowserRouter>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
