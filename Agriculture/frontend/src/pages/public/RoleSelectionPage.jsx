import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import { Sprout, Users, Store, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'farmer',
      title: 'Farmer',
      subtitle: 'Individual Cultivators & Growers',
      desc: 'Find better markets and buyers for your produce.',
      badge: 'Zero Commission',
      icon: Sprout,
      color: 'emerald',
      targetPath: '/farmer/dashboard',
      features: [
        'Compare mandi prices with transport deduction',
        'Direct bids from verified wholesale buyers',
        'Smart selling timing recommendations',
      ],
    },
    {
      id: 'fpo',
      title: 'FPO',
      subtitle: 'Farmer Producer Organizations',
      desc: 'Aggregate produce and connect with reliable buyers.',
      badge: 'Bulk Aggregation',
      icon: Users,
      color: 'blue',
      targetPath: '/fpo/dashboard',
      features: [
        'Combine member lots for higher bargaining power',
        'Institutional buyer auction linkages',
        'Member settlement & volume tracking',
      ],
    },
    {
      id: 'buyer',
      title: 'Buyer',
      subtitle: 'Retail Chains, Exporters & Processors',
      desc: 'Find consistent quality produce from farmers and FPOs.',
      badge: 'Verified Procurement',
      icon: Store,
      color: 'purple',
      targetPath: '/buyer/dashboard',
      features: [
        'Direct farm-gate quality-inspected lots',
        'Transparent escrow-backed fulfillment',
        'Contract farming & demand postings',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Step 1 of 2 • Identity & Workspace
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
            Choose Your Role on AgriLink
          </h1>
          <p className="text-base text-gray-600 mt-2">
            Select how you would like to participate in the marketplace. Each dashboard is tailored to your workflow.
          </p>
        </div>

        {/* 3 Main Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-12">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200/50">
                    {r.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {r.title}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">{r.subtitle}</p>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed font-medium">
                    "{r.desc}"
                  </p>

                  <ul className="mt-6 pt-6 border-t border-gray-100 space-y-2.5 text-xs text-gray-600">
                    {r.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => navigate(r.targetPath)}
                    icon={ArrowRight}
                    iconPosition="right"
                    className="font-bold py-3 text-sm group-hover:bg-emerald-700"
                  >
                    Continue as {r.title}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin portal option for evaluators */}
        <div className="text-center bg-white rounded-2xl border border-gray-200/80 p-6 max-w-xl mx-auto shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">SIH Evaluation Mode</p>
          <p className="text-sm text-gray-700 mb-4">
            Are you judging or reviewing system analytics? View the nationwide mandi health and grievance console.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/dashboard')}
            icon={ShieldCheck}
          >
            Access Admin &amp; Oversight Console
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
