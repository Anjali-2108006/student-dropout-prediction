import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowRight,
  Handshake,
  TrendingUp,
  Package
} from 'lucide-react';

export default function SmartBuyerMatch({
  bestBuyer = null,
  buyerMatches = [],
  primaryLot = null
}) {
  const navigate = useNavigate();

  const buyer = bestBuyer || (buyerMatches.length > 0 ? buyerMatches[0] : {
    buyerName: 'ABC Fresh Foods',
    matchScore: 91,
    offeredPrice: 34,
    quantity: '1,000 kg',
    qualityGrade: 'Grade A',
    location: 'Bengaluru',
    verified: true,
    reasons: [
      'Offers competitive price above mandi average',
      'Accepts required quality (Grade A)',
      'Requires available quantity lot',
      'Located nearby with verified logistics',
      'Verified buyer with on-time payment track record',
    ],
  });

  const reasons = buyer.reasons || [
    'Offers competitive price',
    'Accepts required quality',
    'Requires available quantity',
    'Located nearby',
    'Verified buyer',
  ];

  return (
    <div className="space-y-4">
      {/* Top Best Match Highlight Card */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                BEST BUYER MATCH
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Multi-Factor Algorithmic Match
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-gray-900">{buyer.buyerName}</h3>
                {buyer.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Buyer
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Demand: <strong className="text-gray-800">{buyer.quantity}</strong> • Grade: <strong className="text-gray-800">{buyer.qualityGrade}</strong> • Location: <strong className="text-gray-800">{buyer.location}</strong>
              </p>
            </div>

            {/* Reasons checklist per Part 6 */}
            <div className="pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                Match Justification:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score & Action */}
          <div className="flex flex-col items-center md:items-end justify-between gap-4 p-4 rounded-2xl bg-white/90 border border-emerald-100 shadow-2xs">
            <div className="text-center md:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Match Score
              </span>
              <span className="text-3xl sm:text-4xl font-black text-emerald-700 block mt-0.5">
                {buyer.matchScore || 91}
                <span className="text-lg font-bold text-gray-400">/100</span>
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                Price 30% • Quality 25% • Qty 20% • Dist 15% • Rel 10%
              </span>
            </div>

            <div className="text-center md:text-right">
              <span className="text-xs text-gray-500 block">Offer Price:</span>
              <span className="text-xl font-extrabold text-emerald-800">
                ₹{buyer.offeredPrice}/kg
              </span>
            </div>

            <Button
              variant="success"
              size="md"
              onClick={() => navigate('/farmer/offers')}
              icon={Handshake}
              className="w-full text-xs font-bold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Respond to Offer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
