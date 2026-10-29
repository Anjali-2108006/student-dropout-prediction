import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { getLots, getOffers, getMarketPrices, getTransactions, getBuyerDemands, getLogistics, getGrievances, getMarketIntelligence } from '../../services/api';
import SmartAlerts from '../../components/marketIntelligence/SmartAlerts';
import MarketIntelligenceCard from '../../components/marketIntelligence/MarketIntelligenceCard';
import SmartBuyerMatch from '../../components/marketIntelligence/SmartBuyerMatch';
import { rankBuyerMatchesForLot } from '../../utils/matching';
import {
  farmerProfile,
  initialFarmerLots,
  initialBuyerOffers,
  initialTransactions,
  initialGrievances,
  marketComparisonData
} from '../../data/demoData';
import {
  PlusCircle,
  TrendingUp,
  MapPin,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Package,
  Handshake,
  Receipt,
  CheckCircle2,
  RefreshCw,
  Truck,
  Calendar,
  CreditCard,
  HelpCircle,
  FileText
} from 'lucide-react';

const DEMO_DISTANCES = {
  Madanapalle: 0,
  Chittoor: 70,
  Tirupati: 120,
  Bengaluru: 180,
};

export default function FarmerDashboard() {
  const navigate = useNavigate();

  // API states
  const [lots, setLots] = useState([]);
  const [offers, setOffers] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [demands, setDemands] = useState([]);
  const [logistics, setLogistics] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [marketIntelligence, setMarketIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [lotsRes, offersRes, pricesRes, txnsRes, demandsRes, logsRes, grvRes, miRes] = await Promise.allSettled([
        getLots(),
        getOffers(),
        getMarketPrices({ crop: 'Tomato' }),
        getTransactions(),
        getBuyerDemands(),
        getLogistics(),
        getGrievances(),
        getMarketIntelligence({ crop: 'Tomato', quantity: 500, location: 'Madanapalle' }),
      ]);

      // Demands
      if (demandsRes.status === 'fulfilled' && demandsRes.value?.success && Array.isArray(demandsRes.value.data)) {
        setDemands(demandsRes.value.data);
      } else {
        setDemands([]);
      }

      // Lots
      if (lotsRes.status === 'fulfilled' && lotsRes.value?.success && Array.isArray(lotsRes.value.data)) {
        setLots(lotsRes.value.data);
      } else {
        setLots(initialFarmerLots);
      }

      // Offers
      if (offersRes.status === 'fulfilled' && offersRes.value?.success && Array.isArray(offersRes.value.data)) {
        setOffers(offersRes.value.data);
      } else {
        setOffers(initialBuyerOffers);
      }

      // Market Prices
      if (pricesRes.status === 'fulfilled' && pricesRes.value?.success && Array.isArray(pricesRes.value.data)) {
        setMarketPrices(pricesRes.value.data);
      } else {
        setMarketPrices(marketComparisonData.Tomato || []);
      }

      // Transactions
      if (txnsRes.status === 'fulfilled' && txnsRes.value?.success && Array.isArray(txnsRes.value.data)) {
        setTransactions(txnsRes.value.data);
      } else {
        setTransactions(initialTransactions);
      }

      // Logistics (Part 9)
      if (logsRes.status === 'fulfilled' && logsRes.value?.success && Array.isArray(logsRes.value.data)) {
        setLogistics(logsRes.value.data);
      } else {
        setLogistics([]);
      }

      // Grievances (Part 20)
      if (grvRes.status === 'fulfilled' && grvRes.value?.success && Array.isArray(grvRes.value.data)) {
        setGrievances(grvRes.value.data);
      } else {
        setGrievances(initialGrievances);
      }

      // Market Intelligence (Step 10)
      if (miRes.status === 'fulfilled' && miRes.value?.success && miRes.value?.data) {
        setMarketIntelligence(miRes.value.data);
      }
    } catch (err) {
      console.warn('Farmer dashboard fetch error:', err.message);
      setError('Unable to fetch live data from server. Displaying cached dashboard state.');
      setLots(initialFarmerLots);
      setOffers(initialBuyerOffers);
      setTransactions(initialTransactions);
      setMarketPrices(marketComparisonData.Tomato || []);
      setGrievances(initialGrievances);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Primary Metrics
  const totalLotsCount = lots.length;
  const availableLotsCount = lots.filter(
    (l) => (l.status || '').toLowerCase() === 'available'
  ).length;
  const activeOffersCount = offers.filter(
    (o) => (o.status || '').toLowerCase() === 'pending' || (o.status || '').toLowerCase() === 'active'
  ).length || offers.length;
  const completedTransactionsCount = transactions.filter(
    (t) => (t.status || '').toLowerCase() === 'completed' || (t.status || '').toLowerCase() === 'delivered'
  ).length || transactions.length;
  const activeDeliveriesCount = logistics.filter((l) => {
    const s = (l.status || '').toLowerCase().replace(/_/g, ' ');
    return s !== 'delivered' && s !== 'cancelled';
  }).length;

  // PART 8 & 20 — Payment Summary Metrics Calculated from Real Transaction Data
  const paymentSummary = useMemo(() => {
    const totalSales = transactions.reduce(
      (sum, t) => sum + (Number(t.totalAmount) || Number(t.rawTotal) || 0),
      0
    );
    const paidSales = transactions
      .filter((t) => {
        const p = (t.paymentStatus || t.payment || '').toLowerCase();
        return p === 'paid' || p === 'received';
      })
      .reduce((sum, t) => sum + (Number(t.totalAmount) || Number(t.rawTotal) || 0), 0);
    const pendingSales = transactions
      .filter((t) => {
        const p = (t.paymentStatus || t.payment || '').toLowerCase();
        return p !== 'paid' && p !== 'received';
      })
      .reduce((sum, t) => sum + (Number(t.totalAmount) || Number(t.rawTotal) || 0), 0);

    return { totalSales, paidSales, pendingSales };
  }, [transactions]);

  // Best Market Opportunity calculation using Market Comparison logic (Part 11)
  const bestOpportunity = useMemo(() => {
    if (!marketPrices || marketPrices.length === 0) {
      return {
        crop: 'Tomato',
        market: 'Madanapalle',
        location: 'Madanapalle Mandi, AP',
        rawPrice: 28,
        netPrice: 28,
        transportCost: 0,
      };
    }

    // Group latest price per market
    const latestPerMarket = {};
    marketPrices.forEach((p) => {
      const m = p.market || 'Madanapalle';
      if (!latestPerMarket[m] || new Date(p.date) > new Date(latestPerMarket[m].date)) {
        latestPerMarket[m] = p;
      }
    });

    // Calculate Net Realisable Price for each market
    // transport = distance * 0.02
    let best = null;
    let highestNet = -Infinity;

    Object.values(latestPerMarket).forEach((item) => {
      const rawPrice = Number(item.pricePerKg || item.price || 0);
      const distance = DEMO_DISTANCES[item.market] !== undefined ? DEMO_DISTANCES[item.market] : (item.distanceKm || 50);
      const transportCost = Number((distance * 0.02).toFixed(2));
      const storageCost = 0;
      const netPrice = Number((rawPrice - transportCost - storageCost).toFixed(2));

      if (netPrice > highestNet) {
        highestNet = netPrice;
        best = {
          crop: item.crop || 'Tomato',
          market: item.market,
          location: item.location || 'APMC Mandi',
          rawPrice,
          netPrice,
          transportCost,
          distance,
        };
      }
    });

    return best || {
      crop: 'Tomato',
      market: 'Madanapalle',
      location: 'Madanapalle Mandi, AP',
      rawPrice: 28,
      netPrice: 28,
      transportCost: 0,
    };
  }, [marketPrices]);

  // PART 14 — Top Buyer Matches for Farmer Dashboard
  const topBuyerMatches = useMemo(() => {
    const primaryLot = lots[0] || initialFarmerLots[0];
    if (!demands || demands.length === 0) {
      return [
        { buyerName: 'FreshMart Foods', matchScore: 92, crop: 'Tomato', quantity: '500 kg', offeredPrice: 34, qualityGrade: 'Grade A', distanceKm: 45 },
        { buyerName: 'GreenBasket Retail', matchScore: 87, crop: 'Tomato', quantity: '10 MT', offeredPrice: 33, qualityGrade: 'Grade A', distanceKm: 85 },
        { buyerName: 'City Foods Ltd', matchScore: 81, crop: 'Tomato', quantity: '5 MT', offeredPrice: 32, qualityGrade: 'Grade B', distanceKm: 110 },
      ];
    }
    const ranked = rankBuyerMatchesForLot(primaryLot, demands);
    return ranked.slice(0, 3);
  }, [lots, demands]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/60 text-emerald-100 text-xs font-semibold border border-emerald-500/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AgriLink Farmer Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, Farmer 👋
            </h1>
            <div className="flex items-center gap-4 text-emerald-100 text-xs sm:text-sm font-medium flex-wrap">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-300" />
                {farmerProfile.location}
              </span>
              <span>•</span>
              <span>Farm: {farmerProfile.farmSize}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                {farmerProfile.kycStatus} Farmer
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="success"
              size="md"
              onClick={() => navigate('/farmer/lots/create')}
              icon={PlusCircle}
              className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold border-none shadow-md"
            >
              Create New Lot
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/farmer/market-prices')}
              icon={TrendingUp}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold"
            >
              Compare Markets
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadDashboardData} icon={RefreshCw} className="text-xs">
            Retry Connection
          </Button>
        </div>
      )}

      {/* STEP 10 — Smart Alerts */}
      <SmartAlerts alerts={marketIntelligence?.alerts} />

      {/* PART 9 & 11 — Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <StatCard
          title="Total Lots"
          value={totalLotsCount}
          subtitle="All registered harvest lots"
          iconName="Package"
          color="emerald"
        />
        <StatCard
          title="Available Lots"
          value={availableLotsCount}
          subtitle="Ready for buyer purchase"
          iconName="CheckCircle"
          color="blue"
        />
        <StatCard
          title="Active Offers"
          value={activeOffersCount}
          subtitle="Direct buyer bids"
          iconName="Handshake"
          color="amber"
        />
        <StatCard
          title="Active Deliveries"
          value={activeDeliveriesCount}
          subtitle="En route / scheduled dispatches"
          iconName="Truck"
          color="teal"
        />
        <StatCard
          title="Completed Deals"
          value={completedTransactionsCount}
          subtitle="Delivered & verified deals"
          iconName="Receipt"
          color="purple"
        />
      </div>

      {/* PART 8 & 20 — Payment Summary */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-gray-900 to-slate-900 text-white border border-emerald-900/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Financial Settlement Summary</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">Payment &amp; Escrow Tracking</h3>
          <p className="text-xs text-gray-400">
            Real-time ledger computed from confirmed trades (Demo Payment Tracking)
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Total Sales</span>
            <span className="text-lg sm:text-2xl font-black text-white">
              ₹{paymentSummary.totalSales.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">Paid</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-300">
              ₹{paymentSummary.paidSales.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">Pending</span>
            <span className="text-lg sm:text-2xl font-black text-amber-300">
              ₹{paymentSummary.pendingSales.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/farmer/transactions')}
            icon={Receipt}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
          >
            View Full Ledger
          </Button>
        </div>
      </div>

      {/* STEP 10 (Part 1, 2, 4, 7) — Market Intelligence & Smart Selling Recommendation */}
      <MarketIntelligenceCard
        intelligence={marketIntelligence}
        crop="Tomato"
        quantity={500}
        storageCost={1}
      />

      {/* STEP 10 (Part 6) — Smart Buyer Matching */}
      <SmartBuyerMatch
        bestBuyer={marketIntelligence?.bestBuyer}
        buyerMatches={topBuyerMatches}
        primaryLot={lots[0]}
      />


      {/* Active Lots & Recent Incoming Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Active Lots */}
        <Card
          title="Recent Produce Lots"
          subtitle="Fetched from GET /api/lots"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/farmer/lots')}
              icon={ArrowRight}
              iconPosition="right"
              className="text-xs text-emerald-700 font-semibold"
            >
              View All Lots
            </Button>
          }
        >
          <div className="space-y-3">
            {lots.slice(0, 3).map((lot, idx) => (
              <div
                key={lot._id || lot.id || idx}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 flex items-center justify-between gap-4 hover:border-emerald-200 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {lot.lotId || lot.id || `AGRI${1000 + idx}`}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">{lot.crop}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      {lot.qualityGrade || lot.quality || 'Grade A'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Qty: <strong className="text-gray-800">{lot.quantity}</strong> • Expected:{' '}
                    <strong className="text-emerald-700">
                      {typeof lot.expectedPrice === 'number' ? `₹${lot.expectedPrice}/kg` : lot.expectedPrice}
                    </strong>
                  </p>
                </div>

                <StatusBadge status={lot.status || 'Available'} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        {/* Latest Buyer Offers */}
        <Card
          title="Recent Buyer Offers"
          subtitle="Fetched from GET /api/offers"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/farmer/offers')}
              icon={ArrowRight}
              iconPosition="right"
              className="text-xs text-emerald-700 font-semibold"
            >
              View All Offers
            </Button>
          }
        >
          <div className="space-y-3">
            {offers.slice(0, 3).map((offer, idx) => (
              <div
                key={offer._id || offer.id || idx}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 flex items-center justify-between gap-4 hover:border-emerald-200 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">{offer.buyerName || offer.buyer}</h4>
                    <StatusBadge status="Verified" size="sm" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Offered: <strong className="text-emerald-700 font-bold text-sm">₹{offer.offeredPrice || offer.offerPrice}/kg</strong> for {offer.quantity}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/farmer/offers')}
                  className="text-xs font-bold"
                >
                  Review
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* PART 9 — RECENT DELIVERIES */}
      <Card
        title="Recent Deliveries"
        subtitle="Active cold chain and farm-gate dispatch milestones via GET /api/logistics"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/farmer/logistics')}
            icon={ArrowRight}
            iconPosition="right"
            className="text-xs text-emerald-700 font-semibold"
          >
            View All Deliveries
          </Button>
        }
      >
        {logistics.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-xs sm:text-sm">
            <Truck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-bold">No active deliveries.</p>
            <p className="text-gray-400 mt-0.5">Dispatched shipments will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logistics.slice(0, 3).map((item, idx) => {
              const dt = item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate) : null;
              const isPast = dt && new Date() > dt && (item.status || '').toLowerCase() !== 'delivered';

              return (
                <div
                  key={item._id || item.transactionId || idx}
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between hover:border-emerald-200 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs bg-white border border-gray-200 text-gray-800 px-2 py-0.5 rounded">
                        {item.transactionId || 'TXN1001'}
                      </span>
                      <StatusBadge status={item.status || 'In Transit'} size="sm" />
                    </div>

                    <div>
                      <span className="text-[11px] text-gray-400 block font-medium">Destination Hub</span>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                        {item.destination}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        {dt ? dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '12 Sep 2026'}
                      </span>
                      <span className="font-bold text-emerald-700">₹{item.transportCost} ({item.distanceKm} km)</span>
                    </div>

                    {isPast && (
                      <p className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Delivery may be delayed.
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-200/60 flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Truck}
                      onClick={() => navigate(`/farmer/logistics?txn=${item.transactionId}`)}
                      className="text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                    >
                      Track Delivery
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* PART 20 — RECENT GRIEVANCES */}
      <Card
        title="Recent Grievances"
        subtitle="Disputes and escrow review requests filed via GET /api/grievances"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/farmer/grievances')}
            icon={ArrowRight}
            iconPosition="right"
            className="text-xs text-rose-700 font-semibold"
          >
            View Grievances
          </Button>
        }
      >
        {grievances.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-xs sm:text-sm">
            <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-bold">No active grievances.</p>
            <p className="text-gray-400 mt-0.5">All transactions and dispatches are dispute-free.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {grievances.slice(0, 3).map((grv, idx) => (
              <div
                key={grv._id || grv.grievanceId || idx}
                className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between hover:border-rose-200 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-white border border-gray-200 text-gray-800 px-2 py-0.5 rounded">
                      {grv.grievanceId || 'GRV1001'}
                    </span>
                    <StatusBadge status={grv.status || 'Open'} size="sm" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{grv.issueType || grv.type}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 truncate" title={grv.description || grv.subject}>
                      {grv.description || grv.subject}
                    </p>
                  </div>

                  <span className="text-[11px] text-gray-400 block font-mono">
                    Ref: {grv.transactionRef || grv.transactionId || 'TXN1001'}
                  </span>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-200/60 flex items-center justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/farmer/grievances')}
                    className="text-xs font-semibold text-rose-700 hover:bg-rose-50 border-rose-200"
                  >
                    View Status
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
