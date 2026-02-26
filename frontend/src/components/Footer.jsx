import { Link } from "react-router-dom";
import { Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F1115] border-t border-[#272A30]" data-testid="footer">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#00CED1] rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-xl">DC</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
                DEFENSE CONNECT
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The centralized marketplace connecting verified suppliers with defense buyers through structured transparency and intelligent discovery.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 hover:text-[#00CED1] transition-colors" data-testid="social-linkedin">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#00CED1] transition-colors" data-testid="social-twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: "About Us", path: "/about" },
                { label: "Components", path: "/components" },
                { label: "Suppliers", path: "/suppliers" },
                { label: "Contact Us", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Defense Domains */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Defense Domains</h4>
            <ul className="space-y-3">
              {[
                { label: "Electronics", slug: "electronics" },
                { label: "Armored Systems", slug: "armored-systems" },
                { label: "UAV & Aerospace", slug: "uav-aerospace" },
                { label: "Communications", slug: "communications" },
                { label: "Surveillance & Optics", slug: "surveillance-optics" },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#00CED1] mt-1 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Defense Connect HQ<br />
                  Abu Dhabi, UAE
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#00CED1] flex-shrink-0" />
                <a href="mailto:info@defenseconnect.com" className="text-gray-400 hover:text-white text-sm transition-colors">
                  info@defenseconnect.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#00CED1] flex-shrink-0" />
                <a href="tel:+971000000000" className="text-gray-400 hover:text-white text-sm transition-colors">
                  +971 00 000 0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#272A30] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            Copyright {currentYear} Defense Connect. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-gray-500 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-gray-500 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
