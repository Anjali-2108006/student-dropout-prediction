import React from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

export default function BestMarketTable({
  markets = [],
  quantity = 500,
  onSelectMarket = null
}) {
  if (!markets || markets.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 text-xs">
        No regional mandi comparison data available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-gray-50/80 text-gray-600 font-bold border-b border-gray-100 uppercase tracking-wider text-[10px]">
          <tr>
            <th className="py-3.5 px-4">Market / Mandi</th>
            <th className="py-3.5 px-3">Current Price</th>
            <th className="py-3.5 px-3">Distance</th>
            <th className="py-3.5 px-3">Transport Cost</th>
            <th className="py-3.5 px-3">Storage Cost</th>
            <th className="py-3.5 px-3 text-emerald-800 font-black">Net Price</th>
            <th className="py-3.5 px-3">Expected Return ({quantity} kg)</th>
            <th className="py-3.5 px-3 text-center">Trend</th>
            <th className="py-3.5 px-3 text-center">Opportunity Score</th>
            <th className="py-3.5 px-4 text-right">Recommendation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {markets.map((m, idx) => {
            const isBest = m.recommendation === 'BEST' || idx === 0;
            const trendVal = Number(m.trend || 0);

            return (
              <tr
                key={m.market || idx}
                className={`transition-colors ${
                  isBest ? 'bg-emerald-50/30 hover:bg-emerald-50/60 font-medium' : 'hover:bg-gray-50/60'
                }`}
              >
                {/* Market Name & Badges */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isBest ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-gray-900 text-sm">{m.market}</span>
                        {isBest && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ★ Recommended
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 block">{m.location || `${m.market} Mandi`}</span>
                    </div>
                  </div>
                </td>

                {/* Current Price */}
                <td className="py-3.5 px-3">
                  <span className="font-bold text-gray-900 text-sm">
                    ₹{m.rawPrice}
                    <span className="text-[10px] font-normal text-gray-500">/kg</span>
                  </span>
                </td>

                {/* Distance */}
                <td className="py-3.5 px-3 text-gray-600">
                  <span>{m.distance} km</span>
                </td>

                {/* Transport Cost */}
                <td className="py-3.5 px-3 text-rose-600 font-semibold">
                  -₹{Number(m.transportCost).toFixed(2)}/kg
                </td>

                {/* Storage Cost */}
                <td className="py-3.5 px-3 text-amber-700 font-medium">
                  -₹{Number(m.storageCost || 1).toFixed(2)}/kg
                </td>

                {/* Net Price */}
                <td className="py-3.5 px-3">
                  <span className="font-black text-sm text-emerald-700">
                    ₹{Number(m.netPrice).toFixed(2)}/kg
                  </span>
                </td>

                {/* Expected Return */}
                <td className="py-3.5 px-3 font-extrabold text-gray-900">
                  ₹{Number(m.expectedReturn).toLocaleString('en-IN')}
                </td>

                {/* Trend */}
                <td className="py-3.5 px-3 text-center">
                  <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                    trendVal > 0 ? 'text-emerald-600' : trendVal < 0 ? 'text-rose-600' : 'text-gray-500'
                  }`}>
                    {trendVal > 0 ? `+${trendVal}%` : `${trendVal}%`}
                  </span>
                </td>

                {/* Opportunity Score */}
                <td className="py-3.5 px-3 text-center">
                  <span className={`inline-block font-black px-2.5 py-1 rounded-lg text-xs ${
                    (m.opportunityScore || 0) >= 80
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      : (m.opportunityScore || 0) >= 65
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {m.opportunityScore || 70}/100
                  </span>
                </td>

                {/* Recommendation Badge */}
                <td className="py-3.5 px-4 text-right">
                  <span className={`inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    m.recommendation === 'BEST'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : m.recommendation === 'GOOD'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {m.recommendation || 'GOOD'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
