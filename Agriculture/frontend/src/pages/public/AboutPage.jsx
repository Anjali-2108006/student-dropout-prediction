import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import {
  Sprout,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Database,
  Layers,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Lock,
  Globe
} from 'lucide-react';

export default function AboutPage() {
  const navigate = useNavigate();

  const technologies = [
    {
      category: 'Frontend Architecture',
      name: 'React 18 + Vite',
      desc: 'High-performance Single Page Application bundled with Vite, styled with responsive Tailwind CSS utility classes.',
      icon: Layers,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      category: 'Backend Services',
      name: 'Node.js + Express REST API',
      desc: 'Modular RESTful API with structured controllers, route guards, error middleware, and CORS configuration.',
      icon: Cpu,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      category: 'Database & Storage',
      name: 'MongoDB + Mongoose ODM',
      desc: 'Document schema models for Users, Lots, Offers, Transactions, Logistics, Grievances, Demands, and Market Prices.',
      icon: Database,
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    {
      category: 'Data Visualizations',
      name: 'Recharts Responsive Charts',
      desc: 'Interactive SVG line charts, area charts, and bar charts for price trends and regional mandi comparisons.',
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      category: 'Market Intelligence Engine',
      name: 'Rule-Based & Statistical Trends',
      desc: 'Explainable weighted moving average price estimation, net realisable price deductions, and 5-factor buyer matching.',
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  ];

  const coreModules = [
    { title: 'Price Discovery & Net Realisation', desc: 'Deducts transportation (?0.02/km/kg) and storage from gross mandi prices to reveal true in-hand farmer returns.' },
    { title: 'Algorithmic Buyer Matching', desc: 'Multi-factor evaluation: Price 30%, Quality 25%, Quantity 20%, Distance 15%, and Buyer Reliability 10%.' },
    { title: 'Digital Lot & Offer Negotiation', desc: 'Direct farmer-to-buyer offer cycles eliminating predatory middleman commissions.' },
    { title: 'Logistics Coordination', desc: 'Integrated vehicle dispatching, driver assignment, dispatch tracking, and delivery confirmations.' },
    { title: 'Milestone Payment Tracking', desc: 'Real-time payment lifecycle tracking (Pending, Escrow Funded, Payment In Escrow, Disbursed).' },
    { title: 'Grievance Resolution Desk', desc: 'Structured dispute ticketing, audit trails, resolution logs, and administrative oversight.' },
    { title: 'Admin Governance & Analytics', desc: 'Platform-wide user KYC verification, volume aggregations, transaction monitoring, and dispute metrics.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-gray-900 tracking-tight">
                Agri<span className="text-emerald-700">Link</span>
              </span>
              <span className="text-[10px] text-gray-400 block -mt-1 font-medium">
                Smart Market Linkage & Price Discovery
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-xs font-semibold"
            >
              Home
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/select-role')}
              icon={ArrowRight}
              iconPosition="right"
              className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Enter Platform
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Platform Architecture & Technology</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Engineering Transparent Agricultural Market Linkage
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mt-4 leading-relaxed">
          AgriLink is a smart market linkage and price discovery platform engineered to help farmers answer three critical commercial questions:
          <strong className="text-gray-900 block mt-1">WHERE to sell, WHEN to sell, and WHO to sell to.</strong>
        </p>
      </section>

      {/* Technology Stack Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Implemented Technology Stack</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real technologies running in the AgriLink application repository.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {technologies.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border ${t.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    {t.category}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 mt-1">{t.name}</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Platform Modules */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-emerald-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                Full-Lifecycle Platform Architecture
              </span>
              <h2 className="text-2xl sm:text-4xl font-black">
                End-to-End Trade Lifecycle in AgriLink
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-2xl">
                From initial harvest price discovery to escrow status milestone tracking and dispute resolution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {coreModules.map((mod, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <h4 className="text-sm font-black text-white">{mod.title}</h4>
                  </div>
                  <p className="text-xs text-emerald-100/90 pl-6 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
              AL
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">AgriLink</span>
              <span className="text-xs text-gray-400 block -mt-1">Smart Market Linkage Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">
              Home
            </button>
            <button onClick={() => navigate('/about')} className="hover:text-white transition-colors text-emerald-400 font-bold">
              Technology
            </button>
            <button onClick={() => navigate('/select-role')} className="hover:text-white transition-colors">
              Portals
            </button>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">
              Sign In
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center sm:text-right">
            ? 2026 AgriLink. Engineered for Agricultural Transparency.
          </div>
        </div>
      </footer>
    </div>
  );
}
