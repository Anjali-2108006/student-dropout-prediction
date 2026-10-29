import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import { landingStats } from '../../data/demoData';
import {
  TrendingUp,
  ShieldCheck,
  Brain,
  Truck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Store,
  MapPin,
  ChevronRight,
  BadgePercent,
  Layers,
  Sprout,
  Handshake,
  DollarSign,
  Receipt
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const whyFeatures = [
    {
      title: 'Transparent Price Discovery',
      description: 'Real-time prices across multi-state mandis factoring distance and estimated freight to reveal true net farmer realization.',
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      title: 'Verified Commercial Buyers',
      description: 'Strict KYC & GST-verified retail chains, exporters, and food processors with guaranteed escrow protection.',
      icon: ShieldCheck,
      color: 'blue',
    },
    {
      title: 'Smart Market Recommendations',
      description: 'Rule-driven predictive intelligence highlighting optimal harvest dispatch dates and best opportunity mandis.',
      icon: Brain,
      color: 'purple',
    },
    {
      title: 'Lower Transaction Costs',
      description: 'Eliminates 3 to 4 layers of unregulated middleman commissions, returning up to 25% higher margins directly to farmers.',
      icon: BadgePercent,
      color: 'amber',
    },
  ];

  // Exactly matching Part 14: 6-step How AgriLink Works workflow
  const howItWorksSteps = [
    {
      step: '01',
      title: 'Enter Crop & Quantity',
      desc: 'Input your harvest volume, crop type (Tomato, Onion, Chilli), and quality grade in seconds.',
      icon: Layers,
    },
    {
      step: '02',
      title: 'Compare Nearby Markets',
      desc: 'Instantly view mandi rates across Madanapalle, Chittoor, Tirupati, and Bengaluru.',
      icon: MapPin,
    },
    {
      step: '03',
      title: 'See Net Realisable Price',
      desc: 'Our engine computes true in-hand return by subtracting freight (?0.02/km/kg) and storage.',
      icon: DollarSign,
    },
    {
      step: '04',
      title: 'Find Verified Buyers',
      desc: 'Get matched with KYC-verified commercial buyers ranked by price, volume, and reliability.',
      icon: ShieldCheck,
    },
    {
      step: '05',
      title: 'Create Lot & Receive Offers',
      desc: 'List your produce lot directly to receive and accept competitive digital purchase offers.',
      icon: Handshake,
    },
    {
      step: '06',
      title: 'Track Delivery & Payment',
      desc: 'Coordinate farm-gate dispatch, track logistics in real-time, and monitor escrow payment release.',
      icon: Truck,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col antialiased">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-white pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Smart Market Linkage & Price Discovery</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.15]">
              Agri<span className="text-emerald-600">Link</span>
              <span className="block text-2xl sm:text-4xl font-extrabold text-emerald-800 mt-3">
                From Farm to the Right Market
              </span>
            </h1>

            {/* Clearer Value Proposition per Part 14 */}
            <p className="text-lg sm:text-xl font-bold text-gray-800 leading-snug max-w-2xl mx-auto">
              Compare prices. Find verified buyers. Calculate real returns. Sell smarter.
            </p>

            <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto">
              AgriLink gives farmers and FPOs explainable market intelligence, answering <strong>WHERE</strong> to sell, <strong>WHEN</strong> to sell, and <strong>WHO</strong> to sell to.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/farmer/market-prices')}
                icon={TrendingUp}
                className="w-full sm:w-auto shadow-lg shadow-emerald-600/25 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Find Best Market
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/select-role')}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full sm:w-auto hover:border-emerald-300 font-bold"
              >
                Join AgriLink
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/about')}
                className="w-full sm:w-auto text-emerald-700 hover:bg-emerald-50 font-semibold"
              >
                Platform Technology
              </Button>
            </div>

            {/* Micro proof badges */}
            <div className="pt-6 flex items-center justify-center gap-6 text-xs text-gray-500 font-medium flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero Middleman Commissions
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Commercial Buyers
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> True Net Realisable Price
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Statistics Section */}
      <section className="bg-white py-12 sm:py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {landingStats.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-gray-50/60 border border-gray-100 text-center hover:border-emerald-200 transition-colors shadow-2xs"
              >
                <p className="text-3xl sm:text-5xl font-black text-emerald-700 tracking-tight">{item.value}</p>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500 mt-2">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AgriLink Section */}
      <section id="why-agrilink" className="py-16 sm:py-24 bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
              Solving Real Agri-Supply Chain Bottlenecks
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
              Why AgriLink?
            </h2>
            <p className="text-base text-gray-600 mt-2">
              Transforming traditional mandi uncertainty into transparent, higher-yield market linkages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {whyFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-7 sm:p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW AGRILINK WORKS Section (Part 14) */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
              Direct &amp; Transparent Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
              HOW AGRILINK WORKS
            </h2>
            <p className="text-base text-gray-600 mt-2">
              From harvest discovery to delivery and digital payment in 6 straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {howItWorksSteps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="relative p-6 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col justify-between hover:border-emerald-200 hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-emerald-700/40">{s.step}</span>
                      <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-gray-100 flex items-center justify-center text-emerald-700">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                      Step {idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Market Teaser */}
      <section className="py-16 bg-emerald-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                Interactive Mandi Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Discover your highest net price today
              </h2>
              <p className="text-emerald-200/90 text-sm sm:text-base leading-relaxed">
                Compare net returns across Madanapalle, Bengaluru, Chittoor, and Tirupati with real-time freight deductions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button
                variant="success"
                size="lg"
                onClick={() => navigate('/farmer/market-prices')}
                icon={TrendingUp}
                className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold border-none"
              >
                View Live Market Engine
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/about')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                About Technology
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
