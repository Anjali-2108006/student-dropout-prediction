import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function MarketComparisonChart({ markets = [] }) {
  if (!markets || markets.length === 0) return null;

  const chartData = markets.map((m) => ({
    market: m.market,
    grossPrice: Number(m.rawPrice || 0),
    netPrice: Number(m.netPrice || 0),
    transportCost: Number(m.transportCost || 0),
  }));

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Net Realisable Price Comparison
          </span>
          <h3 className="text-base font-black text-gray-900 mt-0.5">
            Mandi Price vs Your True In-Hand Return
          </h3>
        </div>
        <span className="text-xs text-gray-400">
          Deducts transport & storage per kg
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="market"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              formatter={(val, name) => [
                `₹${val}/kg`,
                name === 'grossPrice' ? 'Mandi Gross Price' : 'Net In-Hand Price',
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(val) => (
                <span className="text-xs font-semibold text-gray-600">
                  {val === 'grossPrice' ? 'Mandi Gross Price (₹/kg)' : 'Net Realisable Price (₹/kg)'}
                </span>
              )}
            />
            <Bar dataKey="grossPrice" name="grossPrice" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={28} />
            <Bar dataKey="netPrice" name="netPrice" fill="#059669" radius={[6, 6, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
