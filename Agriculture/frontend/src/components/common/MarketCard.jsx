import React from 'react';
import Card from './Card';
import Button from './Button';
import StatusBadge from './StatusBadge';
import { MapPin, Truck, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

/**
 * MarketCard displays an individual mandi comparison or the featured "BEST OPPORTUNITY" card.
 */
export default function MarketCard({
  market,
  state,
  price,
  transportPerKg,
  netPrice,
  distanceKm,
  arrival,
  isBest = false,
  sampleQtyKg = 500,
  onViewDetails,
  className = '',
}) {
  const expectedRevenue = Math.round(netPrice * sampleQtyKg);

  if (isBest) {
    return (
      <div className={`relative bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-emerald-700/50 overflow-hidden ${className}`}>
        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold tracking-wide uppercase border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            BEST OPPORTUNITY
          </span>
          <span className="text-xs text-emerald-200/80 font-medium">
            {distanceKm} km away • {arrival} arrival
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-emerald-400" />
              {market} Mandi
            </h3>
            <p className="text-sm text-emerald-200/80 mt-0.5">{state}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">Mandi Gross Price</p>
            <p className="text-3xl font-extrabold text-amber-300">₹{price}<span className="text-base font-normal text-emerald-200">/kg</span></p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 mb-6 text-sm">
          <div>
            <p className="text-xs text-emerald-200">Est. Transport</p>
            <p className="text-base font-bold text-white mt-0.5">₹{transportPerKg}/kg</p>
          </div>
          <div>
            <p className="text-xs text-emerald-200">Estimated Net Price</p>
            <p className="text-base font-bold text-emerald-300 mt-0.5">₹{netPrice}/kg</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-emerald-200">Exp. Revenue ({sampleQtyKg} kg)</p>
            <p className="text-base font-extrabold text-white mt-0.5">₹{expectedRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-emerald-200/70 text-center sm:text-left">
            Net price calculated after factoring freight, mandi cess, and distance.
          </p>
          <Button
            variant="success"
            size="md"
            onClick={onViewDetails}
            icon={ArrowRight}
            iconPosition="right"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold border-none shadow-md"
          >
            View Market Details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={`hover:border-emerald-200 transition-all ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            {market}
          </h4>
          <p className="text-xs text-gray-500">{state} • {distanceKm} km</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-extrabold text-gray-900">₹{price}<span className="text-xs font-normal text-gray-500">/kg</span></p>
          <p className="text-[11px] text-gray-400">Gross Price</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-gray-100 mb-4 bg-gray-50/50 px-3 rounded-lg">
        <div>
          <span className="text-gray-500">Transport:</span>
          <span className="font-semibold text-gray-800 ml-1">₹{transportPerKg}/kg</span>
        </div>
        <div>
          <span className="text-gray-500">Est. Net:</span>
          <span className="font-bold text-emerald-700 ml-1">₹{netPrice}/kg</span>
        </div>
        <div>
          <span className="text-gray-500">Arrival:</span>
          <span className="font-medium text-gray-800 ml-1">{arrival}</span>
        </div>
        <div>
          <span className="text-gray-500">Net ({sampleQtyKg}kg):</span>
          <span className="font-bold text-gray-900 ml-1">₹{expectedRevenue.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        fullWidth
        onClick={onViewDetails}
        className="text-xs font-semibold"
      >
        View Market Details
      </Button>
    </Card>
  );
}
