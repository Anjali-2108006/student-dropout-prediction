import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import ChartCard from '../../components/common/ChartCard';
import EmptyState from '../../components/common/EmptyState';
import { getMarketPrices, getMarketIntelligence, getMarketForecast } from '../../services/api';
import BestMarketTable from '../../components/marketIntelligence/BestMarketTable';
import PriceForecastChart from '../../components/marketIntelligence/PriceForecastChart';
import MarketComparisonChart from '../../components/marketIntelligence/MarketComparisonChart';
import { marketComparisonData } from '../../data/demoData';
import {
  TrendingUp,
  MapPin,
  Sparkles,
  Info,
  Clock,
  AlertCircle,
  RefreshCw,
  Truck,
  Building2,
  CheckCircle2,
  Sliders,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

// Demo distance values for known markets from Madanapalle origin
const DEMO_DISTANCES = {
  Madanapalle: 0,
  Chittoor: 70,
  Tirupati: 120,
  Bengaluru: 180,
};

export default function MarketPricesPage() {
  // Inputs
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [lotQuantity, setLotQuantity] = useState(500);
  const [storageCostPerKg, setStorageCostPerKg] = useState(0);
  const [transportRate, setTransportRate] = useState(0.02); // ₹0.02 per km per kg
  const [selectedTrendMarket, setSelectedTrendMarket] = useState('Bengaluru');
  const [selectedMarketModal, setSelectedMarketModal] = useState(null);

  // API State
  const [marketPrices, setMarketPrices] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch market prices from GET /api/market-prices
  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMarketPrices({ crop: selectedCrop });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setMarketPrices(res.data);
      } else {
        // Fallback to demo structure if no records returned
        const fallback = marketComparisonData[selectedCrop] || marketComparisonData.Tomato || [];
        setMarketPrices(fallback);
      }
    } catch (err) {
      console.warn('Market prices API connection error:', err.message);
      setError('Unable to load market prices from MongoDB API. Displaying offline snapshot.');
      const fallback = marketComparisonData[selectedCrop] || marketComparisonData.Tomato || [];
      setMarketPrices(fallback);
    } finally {
      setLoading(false);
    }
  };

  const fetchIntelligenceAndForecast = async () => {
    try {
      const [intelRes, forecastRes] = await Promise.all([
        getMarketIntelligence({
          crop: selectedCrop,
          quantity: lotQuantity,
          storageCost: storageCostPerKg,
          transportRate: transportRate,
          location: 'Madanapalle'
        }),
        getMarketForecast({
          crop: selectedCrop,
          market: selectedTrendMarket
        })
      ]);
      if (intelRes && intelRes.success) {
        setIntelligence(intelRes.data);
      }
      if (forecastRes && forecastRes.success) {
        setForecastData(forecastRes.data);
      }
    } catch (err) {
      console.warn('Market intelligence fetch warning:', err.message);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedCrop]);

  useEffect(() => {
    fetchIntelligenceAndForecast();
  }, [selectedCrop, lotQuantity, storageCostPerKg, transportRate, selectedTrendMarket]);

  // Group latest records by market for market comparison
  const uniqueMarkets = useMemo(() => {
    const map = {};
    marketPrices.forEach((record) => {
      const marketName = record.market;
      if (!map[marketName]) {
        map[marketName] = record;
      } else {
        // Keep the record with the latest date
        const existingDate = new Date(map[marketName].date || 0);
        const recordDate = new Date(record.date || 0);
        if (recordDate >= existingDate) {
          map[marketName] = record;
        }
      }
    });
    return Object.values(map);
  }, [marketPrices]);

  // Ensure default trend market is valid for the current crop
  useEffect(() => {
    if (uniqueMarkets.length > 0) {
      const hasBengaluru = uniqueMarkets.some((m) => m.market === 'Bengaluru');
      if (hasBengaluru) {
        setSelectedTrendMarket('Bengaluru');
      } else {
        setSelectedTrendMarket(uniqueMarkets[0].market);
      }
    }
  }, [selectedCrop, uniqueMarkets]);

  // Key AgriLink Calculation for each market
  // Net Realisable Price per kg = Market Price - Transport Cost per kg - Storage Cost per kg
  // Total Net Value = Quantity × Net Realisable Price per kg
  const processedMarkets = useMemo(() => {
    const qty = Number(lotQuantity) > 0 ? Number(lotQuantity) : 0;
    const storagePerKg = Math.max(0, Number(storageCostPerKg) || 0);
    const rate = Math.max(0, Number(transportRate) || 0);

    const calculated = uniqueMarkets.map((p, idx) => {
      const rawPrice = Number(p.pricePerKg || p.price || 0);
      const distanceKm = DEMO_DISTANCES[p.market] !== undefined ? DEMO_DISTANCES[p.market] : (p.distanceKm || 50);

      // Transport Cost per kg = Estimated distance * transport rate
      const transportPerKg = Number((distanceKm * rate).toFixed(2));
      const netPrice = Number((rawPrice - transportPerKg - storagePerKg).toFixed(2));
      const grossValue = Math.round(qty * rawPrice);
      const totalTransport = Math.round(qty * transportPerKg);
      const totalStorage = Math.round(qty * storagePerKg);
      const totalNetValue = Math.round(qty * netPrice);

      return {
        id: p._id || p.id || `m-${idx}`,
        market: p.market,
        location: p.location || p.state || 'APMC Mandi',
        rawPrice,
        arrival: p.arrivalVolume ? `${p.arrivalVolume} ${p.unit || 'kg'}` : (p.arrival || '150 MT'),
        distanceKm,
        transportPerKg,
        storagePerKg,
        netPrice,
        grossValue,
        totalTransport,
        totalStorage,
        totalNetValue,
        rawRecord: p,
      };
    });

    // Determine the highest Net Realisable Price
    let highestNet = -Infinity;
    calculated.forEach((m) => {
      if (m.netPrice > highestNet) {
        highestNet = m.netPrice;
      }
    });

    return calculated.map((m) => ({
      ...m,
      isRecommended: m.netPrice === highestNet && calculated.length > 0,
    }));
  }, [uniqueMarkets, lotQuantity, storageCostPerKg, transportRate]);

  // Best Market Recommendation
  const recommendedMarket = useMemo(() => {
    return processedMarkets.find((m) => m.isRecommended) || processedMarkets[0] || null;
  }, [processedMarkets]);

  // Prepare price trend data for Recharts using market-price data
  const trendChartData = useMemo(() => {
    if (!selectedTrendMarket) return [];
    const filtered = marketPrices.filter(
      (p) => p.market && p.market.toLowerCase() === selectedTrendMarket.toLowerCase()
    );

    // Sort chronologically ascending
    const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

    return sorted.map((item, idx) => {
      const dateObj = new Date(item.date);
      const formattedDate = isNaN(dateObj.getTime())
        ? `Day ${idx + 1}`
        : dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

      return {
        date: formattedDate,
        price: Number(item.pricePerKg || item.price || 0),
        arrivalVolume: item.arrivalVolume,
      };
    });
  }, [marketPrices, selectedTrendMarket]);

  // Insight & Rule-based sale window calculation (No Machine Learning)
  const trendInsight = useMemo(() => {
    if (trendChartData.length < 2) {
      return {
        trendDescription: 'Price is relatively stable.',
        trendBadge: 'Prices are relatively stable',
        trendPositive: true,
        saleWindow: 'Prices are relatively stable.',
        ruleSuggestion: 'Consider standard dispatch if market demand is steady.',
      };
    }

    const firstPrice = trendChartData[0].price;
    const lastPrice = trendChartData[trendChartData.length - 1].price;
    const diff = lastPrice - firstPrice;

    if (diff > 0) {
      return {
        trendDescription: 'Price is showing an upward trend.',
        trendBadge: `Upward Trend (+₹${diff}/kg)`,
        trendPositive: true,
        saleWindow: 'Consider waiting if storage is available.',
        ruleSuggestion: 'Recent mandi prices are increasing. Storing for a short window may fetch higher net realisations if storage quality allows.',
      };
    } else if (diff < 0) {
      return {
        trendDescription: 'Price is showing a downward trend.',
        trendBadge: `Downward Trend (-₹${Math.abs(diff)}/kg)`,
        trendPositive: false,
        saleWindow: 'Consider selling sooner.',
        ruleSuggestion: 'Recent prices are decreasing. Selling promptly reduces potential exposure to further price reductions.',
      };
    } else {
      return {
        trendDescription: 'Price is relatively stable.',
        trendBadge: 'Prices are relatively stable',
        trendPositive: true,
        saleWindow: 'Prices are relatively stable.',
        ruleSuggestion: 'Prices have stayed consistent across recent records. Dispatch according to harvest readiness.',
      };
    }
  }, [trendChartData]);

  // Table Columns
  const columns = [
    {
      title: 'Market',
      key: 'market',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-gray-900">{val}</span>
              {row.isRecommended && (
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                  Best Net Return
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">{row.location}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (val, row) => (
        <div className="text-xs text-gray-600">
          <span>{val}</span>
          <span className="block text-[10px] text-gray-400 font-medium">
            {row.distanceKm} km (Estimated distance)
          </span>
        </div>
      ),
    },
    {
      title: 'Current Price/kg',
      key: 'rawPrice',
      render: (val) => (
        <span className="font-extrabold text-base text-gray-900">
          ₹{val}
          <span className="text-xs font-normal text-gray-500">/kg</span>
        </span>
      ),
    },
    {
      title: 'Arrival Volume',
      key: 'arrival',
      render: (val) => <span className="font-medium text-gray-700 text-xs">{val}</span>,
    },
    {
      title: 'Transport Cost',
      key: 'transportPerKg',
      render: (val, row) => (
        <div>
          <span className="text-rose-600 font-bold text-sm">
            -₹{val.toFixed(2)}/kg
          </span>
          <span className="block text-[10px] text-gray-400">
            Total: -₹{row.totalTransport.toLocaleString('en-IN')}
          </span>
        </div>
      ),
    },
    {
      title: 'Storage Cost',
      key: 'storagePerKg',
      render: (val, row) => (
        <div>
          <span className="text-amber-700 font-semibold text-sm">
            -₹{val.toFixed(2)}/kg
          </span>
          <span className="block text-[10px] text-gray-400">
            Total: -₹{row.totalStorage.toLocaleString('en-IN')}
          </span>
        </div>
      ),
    },
    {
      title: 'Net Realisable Price',
      key: 'netPrice',
      render: (val, row) => (
        <div className="font-black text-base text-emerald-700">
          ₹{val.toFixed(2)}/kg
          <span className="block text-xs font-semibold text-gray-600">
            Total Net: ₹{row.totalNetValue.toLocaleString('en-IN')}
          </span>
        </div>
      ),
    },
    {
      title: 'Recommendation',
      key: 'recommendation',
      align: 'right',
      render: (_, row) => (
        <Button
          variant={row.isRecommended ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedMarketModal(row)}
          className="text-xs font-semibold"
        >
          {row.isRecommended ? 'Recommended' : 'Breakdown'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <PageHeader
        title="Market Price Comparison"
        subtitle="Compare mandi prices, transport deductions, and storage costs to find your true Net Realisable Price."
        tag="Market Intelligence"
        action={
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Connected to GET /api/market-prices</span>
          </div>
        }
      />

      {/* Error state alert */}
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPrices} icon={RefreshCw} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* Parameter Inputs Bar (Part 1, 2, 3) */}
      <Card bodyClassName="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            {/* Crop Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Select Crop
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tomato">Tomato</option>
                <option value="Onion">Onion</option>
                <option value="Chilli">Chilli</option>
                <option value="Potato">Potato</option>
              </select>
            </div>

            {/* Quantity Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Quantity (kg)
              </label>
              <input
                type="number"
                min="1"
                value={lotQuantity}
                onChange={(e) => setLotQuantity(Number(e.target.value) || 0)}
                placeholder="500"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Storage Cost Input (Part 3) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                <span>Storage Cost</span>
                <span className="text-gray-400 font-normal">Default: ₹0/kg</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={storageCostPerKg}
                  onChange={(e) => setStorageCostPerKg(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-7 pr-12 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">/kg</span>
              </div>
            </div>

            {/* Transport Rate (Part 2) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                <span>Transport Rate</span>
                <span className="text-gray-400 font-normal">₹/km/kg</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.005"
                  value={transportRate}
                  onChange={(e) => setTransportRate(Number(e.target.value) || 0)}
                  placeholder="0.02"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-7 pr-14 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">/km/kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transparent calculation explainer banner */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Formula:</strong> Net Realisable Price per kg = Market Price - Transport Cost per kg - Storage Cost per kg
            </span>
          </div>
          <span className="text-[11px] text-gray-400 italic">
            * Estimated costs and demo distances for demonstration purposes.
          </span>
        </div>
      </Card>

      {/* Loading State */}
      {loading ? (
        <Card className="text-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700">Loading market prices from MongoDB...</p>
        </Card>
      ) : processedMarkets.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No market prices available."
          description={`There are currently no market records for ${selectedCrop}.`}
        />
      ) : (
        <>
          {/* PART 4 — BEST MARKET RECOMMENDATION CARD */}
          {recommendedMarket && (
            <div className="relative bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/50 overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold tracking-wide uppercase border border-emerald-400/40">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Recommended Market
                </span>
                <span className="text-xs text-emerald-200/90 font-medium">
                  {selectedCrop} • Sample {lotQuantity} kg
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2.5">
                    <MapPin className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                    {recommendedMarket.market}
                  </h2>
                  <p className="text-sm text-emerald-200/80 mt-1">
                    {recommendedMarket.location} • {recommendedMarket.distanceKm} km (Estimated distance)
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">Estimated Net Price</p>
                    <p className="text-3xl sm:text-4xl font-black text-amber-300">
                      ₹{recommendedMarket.netPrice.toFixed(2)}
                      <span className="text-sm font-normal text-emerald-200">/kg</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">Estimated Total Return</p>
                    <p className="text-3xl sm:text-4xl font-black text-white">
                      ₹{recommendedMarket.totalNetValue.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Why this market? explanation */}
              <div className="p-4 sm:p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Why this market?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <span className="text-emerald-300 block font-semibold">Highest estimated net price</span>
                    <span className="font-bold text-white text-sm">₹{recommendedMarket.netPrice.toFixed(2)}/kg</span>
                  </div>
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <span className="text-emerald-300 block font-semibold">Current market price considered</span>
                    <span className="font-bold text-white text-sm">₹{recommendedMarket.rawPrice}/kg</span>
                  </div>
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <span className="text-emerald-300 block font-semibold">Transport cost considered</span>
                    <span className="font-bold text-rose-300 text-sm">-₹{recommendedMarket.transportPerKg.toFixed(2)}/kg ({recommendedMarket.distanceKm} km)</span>
                  </div>
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <span className="text-emerald-300 block font-semibold">Storage cost considered</span>
                    <span className="font-bold text-amber-300 text-sm">-₹{recommendedMarket.storagePerKg.toFixed(2)}/kg</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-200/80">
                <p>
                  <strong>Disclaimer:</strong> Recommended based on current demo data. Not a guaranteed price.
                </p>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setSelectedMarketModal(recommendedMarket)}
                  className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold border-none"
                >
                  View Cost Breakdown
                </Button>
              </div>
            </div>
          )}

          {/* PART 1 — MARKET COMPARISON TABLE */}
          <Card
            title={`${selectedCrop} Market Price Comparison`}
            subtitle="Real-time multi-market price calculation from GET /api/market-prices"
          >
            <Table columns={columns} data={processedMarkets} keyField="id" />
          </Card>

          {/* STEP 10 PART 5 — BEST REGIONAL MARKET COMPARISON TABLE */}
          {intelligence?.marketComparison && intelligence.marketComparison.length > 0 && (
            <Card
              title="Regional Mandi Intelligence & Opportunity Ranking"
              subtitle="Algorithmically ranked comparison factoring mandi prices, transit distance, freight deductions, and buyer activity"
            >
              <BestMarketTable
                markets={intelligence.marketComparison}
                quantity={lotQuantity}
              />
            </Card>
          )}
        </>
      )}

      {/* STEP 10 PART 3 & 12 — VISUAL MARKET INTELLIGENCE & DEMO PRICE FORECAST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <PriceForecastChart
          forecastData={forecastData}
          crop={selectedCrop}
          market={selectedTrendMarket}
        />
        <MarketComparisonChart
          markets={intelligence?.marketComparison || []}
        />
      </div>

      {/* PART 5 & 6 — PRICE TREND CHART & SALE WINDOW INDICATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recharts Price Trend Chart */}
        <ChartCard
          title="Price Trend"
          subtitle={`${selectedCrop} price trend in ${selectedTrendMarket} Mandi`}
          trendBadge={trendInsight.trendBadge}
          trendPositive={trendInsight.trendPositive}
          action={
            <div className="flex items-center gap-2">
              <select
                value={selectedTrendMarket}
                onChange={(e) => setSelectedTrendMarket(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {uniqueMarkets.map((m) => (
                  <option key={m.market} value={m.market}>
                    {m.market}
                  </option>
                ))}
              </select>
            </div>
          }
        >
          {trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis unit="₹" domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`₹${val}/kg`, 'Market Price']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ fill: '#059669', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No trend records available for this selection.
            </div>
          )}
        </ChartCard>

        {/* Insight & Rule-Based Sale Window Indicator */}
        <div className="bg-white rounded-2xl border-2 border-emerald-500/80 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Sale Window Indicator
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Rule-based suggestion
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Market Intelligence Insight
            </h3>

            {/* Simple insight card (Part 5) */}
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Trend Observation
              </span>
              <p className="text-sm font-bold text-gray-800">
                {trendInsight.trendDescription}
              </p>
            </div>

            {/* Rule-based recommendation (Part 6) */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">
                Recommendation
              </span>
              <p className="text-base font-extrabold text-amber-950">
                "{trendInsight.saleWindow}"
              </p>
              <p className="text-xs text-amber-900/80 mt-1 font-medium">
                {trendInsight.ruleSuggestion}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Important Notice:</strong> This is a simple rule-based suggestion calculated from recent price comparisons. This is not an AI prediction or a guaranteed price forecast.
            </p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Details Modal */}
      {selectedMarketModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Cost & Return Breakdown</span>
                <h3 className="text-2xl font-black text-gray-900">{selectedMarketModal.market} Mandi</h3>
                <p className="text-sm text-gray-500">
                  {selectedMarketModal.location} • {selectedMarketModal.distanceKm} km (Estimated distance)
                </p>
              </div>
              <button
                onClick={() => setSelectedMarketModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 bg-gray-50 p-4 sm:p-5 rounded-2xl text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Selected Crop & Quantity:</span>
                <span className="font-bold text-gray-900">{selectedCrop} ({lotQuantity} kg)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Mandi Arrival Volume:</span>
                <span className="font-bold text-gray-900">{selectedMarketModal.arrival}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Current Market Price:</span>
                <span className="font-bold text-gray-900">₹{selectedMarketModal.rawPrice}/kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Gross Value (Qty × Price):</span>
                <span className="font-bold text-gray-900">₹{selectedMarketModal.grossValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-rose-600">Estimated Transport Cost ({selectedMarketModal.distanceKm} km × ₹{transportRate}/km/kg):</span>
                <span className="font-bold text-rose-600">-₹{selectedMarketModal.transportPerKg.toFixed(2)}/kg (-₹{selectedMarketModal.totalTransport.toLocaleString('en-IN')})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-amber-700">Estimated Storage Cost:</span>
                <span className="font-bold text-amber-700">-₹{selectedMarketModal.storagePerKg.toFixed(2)}/kg (-₹{selectedMarketModal.totalStorage.toLocaleString('en-IN')})</span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-100/60 -mx-2 px-2 rounded-xl text-emerald-900">
                <span className="font-bold">Net Realisable Price per kg:</span>
                <span className="font-black text-base">₹{selectedMarketModal.netPrice.toFixed(2)}/kg</span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-600 -mx-2 px-2 rounded-xl text-white">
                <span className="font-bold">Total Expected Net Return:</span>
                <span className="font-black text-lg">₹{selectedMarketModal.totalNetValue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 italic">
              Estimated costs for demonstration purposes. Net Realisable Price = Market Price - Transport Cost per kg - Storage Cost per kg.
            </p>

            <Button variant="primary" size="md" fullWidth onClick={() => setSelectedMarketModal(null)}>
              Close Breakdown
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
