import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Info, ShieldAlert, Sparkles } from 'lucide-react';

export default function PriceForecastChart({
  forecastData = null,
  crop = 'Tomato',
  market = 'Bengaluru'
}) {
  const isAvailable = forecastData?.forecastAvailable !== false;

  const currentPrice = forecastData?.currentPrice || 35;
  const avgPrice = forecastData?.averagePrice || 32;
  const trendPct = forecastData?.trendPercentage !== undefined ? forecastData.trendPercentage : 5.8;
  const forecastPrice = forecastData?.forecastPrice || 36.5;
  const outlook = forecastData?.outlook || 'Increasing';
  const confidence = forecastData?.confidence || 'Medium';

  // Demo fallback chart data if history not supplied
  const chartData = (forecastData?.priceHistory && forecastData.priceHistory.length > 0)
    ? forecastData.priceHistory.map((item) => ({
        date: item.date.slice(5), // MM-DD
        actualPrice: item.price,
      }))
    : [
        { date: '09-01', actualPrice: 25 },
        { date: '09-02', actualPrice: 26 },
        { date: '09-03', actualPrice: 27 },
        { date: '09-04', actualPrice: 29 },
        { date: '09-05', actualPrice: 35 },
      ];

  // Add projected next point to chart
  const extendedData = [
    ...chartData,
    {
      date: 'Next Mandi',
      actualPrice: null,
      estimatedPrice: forecastPrice,
    },
  ];

  // Link the last actual price to the estimated point for visual continuity
  if (extendedData.length >= 2) {
    extendedData[extendedData.length - 2].estimatedPrice =
      extendedData[extendedData.length - 2].actualPrice;
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5">
      {/* Header with Demo Forecast disclaimer tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Demo Forecast
            </span>
            <span className="text-xs text-gray-400 font-medium">Statistical Trend</span>
          </div>
          <h3 className="text-lg font-black text-gray-900 mt-1">
            {crop} Price Outlook — {market} Mandi
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
            outlook === 'Increasing'
              ? 'bg-emerald-100 text-emerald-800'
              : outlook === 'Decreasing'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            <TrendingUp className="w-3.5 h-3.5" />
            Price Outlook: {outlook}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
            Confidence: <strong className="text-gray-800">{confidence}</strong>
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Latest Mandi Price
          </span>
          <span className="text-xl font-black text-gray-900 mt-0.5 block">
            ₹{currentPrice}/kg
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Recent Average
          </span>
          <span className="text-xl font-bold text-gray-700 mt-0.5 block">
            ₹{avgPrice}/kg
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Recent Trend
          </span>
          <span className={`text-xl font-black mt-0.5 block ${trendPct >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {trendPct >= 0 ? `+${trendPct}%` : `${trendPct}%`}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider block">
            Estimated Next Price
          </span>
          <span className="text-xl font-black text-emerald-800 mt-0.5 block">
            ₹{forecastPrice}/kg
          </span>
        </div>
      </div>

      {/* Recharts Price Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={extendedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip
              formatter={(value, name) => [
                `₹${value}/kg`,
                name === 'actualPrice' ? 'Recorded Mandi Price' : 'Estimated Demo Forecast',
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
                  {val === 'actualPrice' ? 'Historical Mandi Price' : 'Estimated Next-Period Price (Demo)'}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="actualPrice"
              name="actualPrice"
              stroke="#059669"
              strokeWidth={3}
              dot={{ r: 4, fill: '#059669' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="estimatedPrice"
              name="estimatedPrice"
              stroke="#f59e0b"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 4, fill: '#f59e0b' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Prominent Farmer-Friendly Disclaimer per Part 3 */}
      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Important Notice for Farmers:</span>
          <span>
            This estimate is calculated from recent mandi price trends as a demo guide. It is not an official government forecast. Always verify local mandi arrivals before transportation.
          </span>
        </div>
      </div>
    </div>
  );
}
