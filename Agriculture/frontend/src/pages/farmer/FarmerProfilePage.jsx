import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { farmerProfile } from '../../data/demoData';
import { User, MapPin, Phone, Mail, ShieldCheck, CheckCircle2, Building, CreditCard, Sprout } from 'lucide-react';

export default function FarmerProfilePage() {
  const p = farmerProfile;

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-10">
      <PageHeader
        title="Kisan Profile &amp; KYC Verification"
        subtitle="Manage personal details, land records, linked bank account for escrow payouts, and FPO affiliation."
        tag="Kisan Identity"
      />

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-gray-100 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-emerald-600/20">
            RP
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-gray-900">{p.name}</h2>
              <StatusBadge status="KYC Verified" size="sm" />
            </div>
            <p className="text-sm font-semibold text-emerald-700">{p.fpoMembership}</p>
            <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {p.location}
            </p>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Land &amp; Cultivation Particulars
            </h3>
            <div className="p-4 bg-gray-50 rounded-2xl space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Registered Farm Size:</span>
                <span className="font-bold text-gray-900">{p.farmSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Primary Commercial Crops:</span>
                <span className="font-bold text-emerald-700">{p.primaryCrops.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">FPO Cluster:</span>
                <span className="font-bold text-gray-900">{p.fpoMembership}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Soil Health Card:</span>
                <span className="font-bold text-emerald-700">Verified (2026 Batch)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Settlement &amp; Bank Escrow Linkage
            </h3>
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Bank Name:</span>
                <span className="font-bold text-gray-900">State Bank of India (Madanapalle)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Number:</span>
                <span className="font-mono font-bold text-gray-900">•••• •••• 8842</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">IFSC Code:</span>
                <span className="font-mono font-bold text-gray-900">SBIN0001234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Direct Escrow Credit:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active &amp; Instant
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
