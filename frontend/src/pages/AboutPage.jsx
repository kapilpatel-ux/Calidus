import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Target, Globe, ArrowRight } from "lucide-react";
import axios from "axios";
import { API } from "../App";

export const AboutPage = () => {
  const [stats, setStats] = useState({ categories: 40, components: 400, suppliers: 50 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/stats`);
        setStats(res.data);
      } catch (e) {
        console.error("Error fetching stats:", e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="about-page">
      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115] to-[#050505]" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }} data-testid="page-title">
              STRENGTHENING DEFENSE SUPPLY<br />
              CHAINS THROUGH <span className="text-[#00CED1]">STRUCTURED TRANSPARENCY</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#00CED1]" />
                <span className="text-[#00CED1] text-sm font-medium tracking-wider">OUR MISSION</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                CENTRALIZED SUPPLIER DISCOVERY
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Defense Connect was built to centralize supplier discovery, enhance compliance visibility, and enable informed procurement decisions within the defense ecosystem.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Our platform bridges the gap between verified defense suppliers and procurement professionals, creating a trusted marketplace where mission-critical partnerships are formed.
              </p>
            </div>
            <div className="relative">
              <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-8">
                <img
                  src="https://images.pexels.com/photos/12112278/pexels-photo-12112278.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                  alt="Defense Operations"
                  className="w-full h-64 object-cover rounded-sm"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-[#00CED1]/30 rounded-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Alignment */}
      <section className="py-24 bg-[#0F1115]">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="bg-[#050505] border border-[#272A30] rounded-sm p-8">
                <img
                  src="https://images.pexels.com/photos/17854251/pexels-photo-17854251.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                  alt="Aerospace Technology"
                  className="w-full h-64 object-cover rounded-sm"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 border-2 border-[#00CED1]/30 rounded-sm" />
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-[#00CED1]" />
                <span className="text-[#00CED1] text-sm font-medium tracking-wider">STRATEGIC ALIGNMENT</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
                SUPPORTING SOVEREIGN DEFENSE
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Aligned with sovereign defense initiatives and regional industrial advancement strategies.
              </p>
              <p className="text-gray-400 leading-relaxed">
                We support governments and defense organizations in building resilient, localized supply chains that strengthen national security capabilities while fostering industrial growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#00CED1]" />
              <span className="text-[#00CED1] text-sm font-medium tracking-wider">OUR IMPACT</span>
            </div>
            <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed' }}>
              BUILDING THE DEFENSE ECOSYSTEM
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-8 text-center card-hover">
              <p className="text-6xl font-bold text-[#00CED1] mb-2" style={{ fontFamily: 'Barlow Condensed' }}>{stats.categories}+</p>
              <p className="text-gray-400">Defense Categories</p>
            </div>
            <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-8 text-center card-hover">
              <p className="text-6xl font-bold text-[#00CED1] mb-2" style={{ fontFamily: 'Barlow Condensed' }}>{stats.components}+</p>
              <p className="text-gray-400">Components Listed</p>
            </div>
            <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-8 text-center card-hover">
              <p className="text-6xl font-bold text-[#00CED1] mb-2" style={{ fontFamily: 'Barlow Condensed' }}>{stats.suppliers}+</p>
              <p className="text-gray-400">Verified Suppliers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0F1115]">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
              JOIN OUR NETWORK
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Whether you're a supplier or a buyer, Defense Connect provides the platform for secure, transparent defense partnerships.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/components" className="btn-primary flex items-center justify-center gap-2" data-testid="explore-btn">
                EXPLORE COMPONENTS
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="btn-secondary flex items-center justify-center gap-2" data-testid="contact-btn">
                CONTACT US
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
