import { Link } from "react-router-dom";
import { Search, BarChart3, MessageSquare, ArrowRight, CheckCircle } from "lucide-react";

export const HowItWorksPage = () => {
  const steps = [
    {
      step: "01",
      icon: Search,
      title: "Search with Intelligence",
      description: "Leverage AI-powered search to identify mission-ready components. Our intelligent system analyzes your requirements and suggests the most relevant products, suppliers, and categories based on your specific needs.",
      features: [
        "AI-assisted search suggestions",
        "Weighted relevance scoring",
        "Cross-category discovery"
      ]
    },
    {
      step: "02",
      icon: BarChart3,
      title: "Evaluate with Confidence",
      description: "Review supplier ratings, certifications, and detailed technical specifications. Compare multiple options side-by-side to make informed procurement decisions backed by real data.",
      features: [
        "Verified supplier badges",
        "Technical spec comparison",
        "Performance metrics & ratings"
      ]
    },
    {
      step: "03",
      icon: MessageSquare,
      title: "Connect Directly",
      description: "Submit secure enquiries or RFQs directly to verified suppliers. Our platform ensures your communications are protected and your requirements are clearly communicated.",
      features: [
        "Secure messaging channels",
        "RFQ submission system",
        "Direct supplier access"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="how-it-works-page">
      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115] to-[#050505]" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }} data-testid="page-title">
              THREE STEPS TO CONNECT WITH<br />
              <span className="text-[#00CED1]">VERIFIED DEFENSE SUPPLIERS</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Defense Connect simplifies the procurement process, connecting you with trusted suppliers through a structured, transparent platform.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24">
        <div className="container-custom">
          <div className="space-y-24">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`grid lg:grid-cols-2 gap-12 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                data-testid={`step-${idx + 1}`}
              >
                <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-6xl font-bold text-[#00CED1]/20" style={{ fontFamily: 'Barlow Condensed' }}>
                      {step.step}
                    </span>
                    <div className="w-14 h-14 bg-[#00CED1]/10 rounded-sm flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-[#00CED1]" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
                    {step.title.toUpperCase()}
                  </h2>
                  <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-[#00CED1]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`relative ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="bg-[#0F1115] border border-[#272A30] rounded-sm p-8 aspect-square flex items-center justify-center">
                    <step.icon className="w-32 h-32 text-[#00CED1]/20" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-[#00CED1]/30 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0F1115]">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Barlow Condensed' }}>
              READY TO GET STARTED?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Begin exploring our network of verified defense suppliers and mission-critical components.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/components" className="btn-primary flex items-center justify-center gap-2" data-testid="start-exploring-btn">
                START EXPLORING
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/supplier-registration" className="btn-secondary flex items-center justify-center gap-2">
                BECOME A SUPPLIER
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
