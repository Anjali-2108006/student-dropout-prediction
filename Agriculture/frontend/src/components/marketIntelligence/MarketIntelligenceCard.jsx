import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

export default function MarketIntelligenceCard({
  intelligence,
  loading = false,
  crop = 'Tomato',
  quantity = 500,
  storageCost = 1
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-emerald-100 rounded mb-4" />
        <div className="h-10 w-3/4 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const bestMarket = intelligence?.bestMarket || {
    market: 'Madanapalle',
    rawPrice: 28,
    distance: 0,
    transportCost: 0,
    storageCost: storageCost,
    netPrice: 28 - storageCost,
    expectedReturn: (28 - storageCost) * quantity,
    trend: 4.5,
    opportunityScore: 87,
    scoreBreakdown: [
      { factor: 'Price', score: 30, max: 30 },
      { factor: 'Demand', score: 22, max: 25 },
      { factor: 'Distance', score: 14, max: 15 },
      { factor: 'Trend', score: 12, max: 15 },
      { factor: 'Reliability', score: 9, max: 15 },
    ],
    recommendation: 'BEST',
  };

  const saleWindow = intelligence?.saleWindow || {
    action: 'WAIT 1-2 DAYS',
    reason: 'Prices are showing an upward trend and expected gain is higher than estimated storage cost.',
  };

  const explanationFactors = intelligence?.explanationFactors || [
    'Higher net realisable price after transport and storage deductions',
    'Strong buyer demand in regional aggregation network',
    'Lower transportation cost due to regional proximity',
    'Good historical price trend in recent market arrivals',
    'Verified APMC / mandi trade regulation',
  ];

  const bestBuyer = intelligence?.bestBuyer || {
    buyerName: 'FreshMart Foods',
    offeredPrice: 34,
    matchScore: 91,
    location: 'Bengaluru',
    verified: true,
  };

  const isUpward = bestMarket.trend > 0;
  const isDownward = bestMarket.trend < 0;

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/60 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Header Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              AI-Powered Market Intelligence
            </span>
            <span className="text-xs text-emerald-200/80 font-medium">
              Demo Intelligence • {crop} ({quantity} kg)
            </span>
          </div>

          {/* Sale Window Badge */}
          <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
            <Clock className="w-4 h-4 text-amber-300" />
            <span className="text-xs text-emerald-100 font-medium">When to sell:</span>
            <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
              saleWindow.action.includes('WAIT') ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400 text-emerald-950'
            }`}>
              {saleWindow.action}
            </span>
          </div>
        </div>

        {/* Primary Q&A Section: Where & When to sell */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Answer: WHERE TO SELL */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                Recommended Mandi / Market
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-amber-300 flex-shrink-0" />
                {bestMarket.market} Mandi
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 shadow-xs">
                  {bestMarket.recommendation || 'BEST'}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
                {saleWindow.reason}
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Net Realisable Price
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 block mt-0.5">
                  ₹{Number(bestMarket.netPrice).toFixed(2)}
                  <span className="text-xs font-normal text-emerald-200">/kg</span>
                </span>
                <span className="text-[10px] text-emerald-200/80 block mt-0.5">
                  Gross: ₹{bestMarket.rawPrice}/kg
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Expected Return
                </span>
                <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">
                  ₹{Number(bestMarket.expectedReturn).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-200/80 block mt-0.5">
                  For {quantity} kg lot
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Recent Price Trend
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <TrendingUp className={`w-5 h-5 ${isUpward ? 'text-emerald-300' : isDownward ? 'text-rose-300 rotate-180' : 'text-gray-300'}`} />
                  <span className="text-base sm:text-lg font-bold text-white">
                    {isUpward ? `+${bestMarket.trend}%` : `${bestMarket.trend}%`}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-200/80 block mt-0.5">
                  {isUpward ? '▲ Increasing' : isDownward ? '▼ Decreasing' : 'Stable'}
                </span>
              </div>
            </div>

            {/* Why We Recommend This: Explainable Factors */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
                Why we recommend this:
              </span>
              <ul className="space-y-1.5">
                {explanationFactors.slice(0, 4).map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Opportunity Score & Best Buyer Match */}
          <div className="lg:col-span-5 space-y-4">
            {/* Opportunity Score Breakdown */}
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                    Market Opportunity Score
                  </span>
                  <span className="text-2xl font-black text-amber-300">
                    {bestMarket.opportunityScore || 87}
                    <span className="text-sm font-normal text-emerald-200">/100</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-200 block">Multi-Factor Analysis</span>
                  <span className="text-xs font-bold text-emerald-300">High Confidence</span>
                </div>
              </div>

              {/* Progress Bar Breakdown */}
              <div className="space-y-1.5 pt-1">
                {(bestMarket.scoreBreakdown || [
                  { factor: 'Price', score: 30, max: 30 },
                  { factor: 'Demand', score: 22, max: 25 },
                  { factor: 'Distance', score: 14, max: 15 },
                  { factor: 'Trend', score: 12, max: 15 },
                  { factor: 'Reliability', score: 9, max: 15 }
                ]).map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between text-[11px] text-emerald-100">
                      <span>{item.factor}</span>
                      <span className="font-bold text-amber-200">{item.score}/{item.max}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full"
                        style={{ width: `${Math.min(100, (item.score / item.max) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Buyer Match Snapshot */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Top Matched Buyer
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">{bestBuyer.buyerName}</span>
                  {bestBuyer.verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  )}
                </div>
                <span className="text-xs text-emerald-200 block">
                  Offers ₹{bestBuyer.offeredPrice}/kg • {bestBuyer.matchScore || 91}% Match
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/farmer/offers')}
                icon={ArrowRight}
                iconPosition="right"
                className="bg-white/15 hover:bg-white/25 text-white border-white/20 text-xs font-bold whitespace-nowrap"
              >
                View Offers
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="success"
                size="md"
                onClick={() => navigate('/farmer/market-prices')}
                icon={TrendingUp}
                className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold border-none shadow-md text-xs py-2.5"
              >
                Compare All Markets
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/farmer/lots/create')}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs py-2.5"
              >
                Create Produce Lot
              </Button>
            </div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-200/70 flex-wrap gap-2">
          <span>* Estimated from recent market trend data. Not an official government forecast.</span>
          <span>Transport deduction computed at ₹0.02/km/kg</span>
        </div>
      </div>
    </div>
  );
}
