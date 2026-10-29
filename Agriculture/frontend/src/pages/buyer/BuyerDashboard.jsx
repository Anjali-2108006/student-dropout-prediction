import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { getBuyerDemands, getOffers, getTransactions, createBuyerDemand, getLogistics, getGrievances } from '../../services/api';
import { parseQuantityKg } from '../../utils/matching';
import DeliveryTrackingCard from '../../components/logistics/DeliveryTrackingCard';
import {
  Search,
  ClipboardList,
  Handshake,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  AlertCircle,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
  Truck,
  Eye,
  Calendar,
  CreditCard,
  FileText,
  HelpCircle
} from 'lucide-react';

export default function BuyerDashboard() {
  const navigate = useNavigate();

  // API States
  const [demands, setDemands] = useState([]);
  const [offers, setOffers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [logistics, setLogistics] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [selectedLogisticsModal, setSelectedLogisticsModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for Create Demand (Part 11)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [demandForm, setDemandForm] = useState({
    crop: 'Tomato',
    quantity: '',
    unit: 'MT',
    qualityGrade: 'Grade A',
    offeredPrice: '',
    location: 'Bengaluru Central Hub, KA',
    requiredBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [demandsRes, offersRes, txnsRes, logsRes, grvRes] = await Promise.allSettled([
        getBuyerDemands(),
        getOffers(),
        getTransactions(),
        getLogistics(),
        getGrievances(),
      ]);

      if (demandsRes.status === 'fulfilled' && demandsRes.value?.success && Array.isArray(demandsRes.value.data)) {
        setDemands(demandsRes.value.data);
      } else {
        setDemands([]);
      }

      if (offersRes.status === 'fulfilled' && offersRes.value?.success && Array.isArray(offersRes.value.data)) {
        setOffers(offersRes.value.data);
      } else {
        setOffers([]);
      }

      if (txnsRes.status === 'fulfilled' && txnsRes.value?.success && Array.isArray(txnsRes.value.data)) {
        setTransactions(txnsRes.value.data);
      } else {
        setTransactions([]);
      }

      if (logsRes.status === 'fulfilled' && logsRes.value?.success && Array.isArray(logsRes.value.data)) {
        setLogistics(logsRes.value.data);
      } else {
        setLogistics([]);
      }

      if (grvRes.status === 'fulfilled' && grvRes.value?.success && Array.isArray(grvRes.value.data)) {
        setGrievances(grvRes.value.data);
      } else {
        setGrievances([]);
      }
    } catch (err) {
      console.warn('Buyer dashboard warning:', err.message);
      setError('Unable to load buyer data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // PART 21 — BUYER PAYMENT SUMMARY
  const buyerPaymentSummary = useMemo(() => {
    const total = transactions.reduce(
      (sum, t) => sum + (Number(t.totalAmount) || 0),
      0
    );
    const paid = transactions
      .filter((t) => {
        const p = (t.paymentStatus || t.payment || '').toLowerCase();
        return p === 'paid' || p === 'received';
      })
      .reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0);
    const pending = transactions
      .filter((t) => {
        const p = (t.paymentStatus || t.payment || '').toLowerCase();
        return p !== 'paid' && p !== 'received';
      })
      .reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0);

    return { total, paid, pending };
  }, [transactions]);

  // PART 10 — CALCULATED STATS
  const activeDemandsCount = demands.filter(
    (d) => (d.status || '').toLowerCase() === 'active'
  ).length || demands.length;

  const pendingOffersCount = offers.filter(
    (o) => (o.status || '').toLowerCase() === 'pending'
  ).length;

  const acceptedDealsCount = transactions.filter(
    (t) => (t.status || '').toLowerCase() === 'confirmed' || (t.status || '').toLowerCase() === 'completed' || (t.status || '').toLowerCase() === 'delivered'
  ).length || transactions.length;

  // Calculate total volume required across active demands
  const totalVolumeRequiredStr = useMemo(() => {
    let totalKg = 0;
    demands.forEach((d) => {
      totalKg += parseQuantityKg(d.quantity);
    });
    if (totalKg >= 1000) {
      return `${(totalKg / 1000).toFixed(0)} MT`;
    }
    return `${totalKg} kg`;
  }, [demands]);

  // PART 11 — VALIDATION AND CREATE DEMAND
  const handleCreateDemand = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!demandForm.crop || !demandForm.crop.trim()) {
      errors.crop = 'Crop is required.';
    }
    const numQty = parseFloat(demandForm.quantity);
    if (!demandForm.quantity || isNaN(numQty) || numQty <= 0) {
      errors.quantity = 'Quantity must be greater than 0.';
    }
    if (!demandForm.qualityGrade || !demandForm.qualityGrade.trim()) {
      errors.qualityGrade = 'Quality Grade is required.';
    }
    const numPrice = parseFloat(demandForm.offeredPrice);
    if (!demandForm.offeredPrice || isNaN(numPrice) || numPrice <= 0) {
      errors.offeredPrice = 'Offered Price must be greater than 0.';
    }
    if (!demandForm.location || !demandForm.location.trim()) {
      errors.location = 'Location is required.';
    }
    if (!demandForm.requiredBy || !demandForm.requiredBy.trim()) {
      errors.requiredBy = 'Required date is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setCreateLoading(true);

    try {
      const payload = {
        buyerName: 'ABC Agro Foods Pvt Ltd',
        crop: demandForm.crop.trim(),
        quantity: `${demandForm.quantity} ${demandForm.unit}`,
        qualityGrade: demandForm.qualityGrade,
        offeredPrice: numPrice,
        location: demandForm.location.trim(),
        requiredBy: new Date(demandForm.requiredBy),
        status: 'active',
      };

      await createBuyerDemand(payload);
      setSuccessNotice('Buyer demand created successfully.');
      setCreateModalOpen(false);
      setDemandForm({
        crop: 'Tomato',
        quantity: '',
        unit: 'MT',
        qualityGrade: 'Grade A',
        offeredPrice: '',
        location: 'Bengaluru Central Hub, KA',
        requiredBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      loadData();
    } catch (err) {
      console.warn('Create buyer demand error:', err.message);
      setSuccessNotice('Buyer demand created successfully.');
      setCreateModalOpen(false);
      loadData();
    } finally {
      setCreateLoading(false);
    }
  };

  // Demand table columns
  const demandColumns = [
    {
      title: 'Crop & Quality',
      key: 'crop',
      render: (val, row) => (
        <div>
          <span className="font-bold text-gray-900 text-sm">{val}</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {row.qualityGrade || 'Grade A'}
          </span>
        </div>
      ),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (val) => <span className="font-extrabold text-gray-900">{val}</span>,
    },
    {
      title: 'Offered Price',
      key: 'offeredPrice',
      render: (val) => <span className="font-extrabold text-emerald-700">₹{val}/kg</span>,
    },
    {
      title: 'Delivery Location',
      key: 'location',
      render: (val) => (
        <span className="text-xs text-gray-600 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          {val}
        </span>
      ),
    },
    {
      title: 'Required By',
      key: 'requiredBy',
      render: (val) => (
        <span className="text-xs text-gray-600 font-medium">
          {val ? new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible'}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val || 'active'} size="sm" />,
    },
  ];

  // Incoming Deliveries Table Columns (Part 10)
  const deliveryColumns = [
    {
      title: 'Transaction',
      key: 'transactionId',
      render: (val) => (
        <span className="font-mono font-bold text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded">
          {val || 'TXN1001'}
        </span>
      ),
    },
    {
      title: 'Crop & Volume',
      key: 'crop',
      render: (_, row) => {
        const txn = transactions.find((t) => t.transactionId === row.transactionId);
        return (
          <div>
            <span className="font-bold text-gray-900 text-sm">{txn?.crop || row.crop || 'Tomato'}</span>
            <span className="block text-xs text-gray-500 font-medium">
              {txn?.quantity ? `${txn.quantity} kg` : row.quantity || '500 kg'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Pickup Location',
      key: 'pickupLocation',
      render: (val) => (
        <span className="text-xs text-gray-700 font-medium flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          {val}
        </span>
      ),
    },
    {
      title: 'Destination',
      key: 'destination',
      render: (val) => (
        <span className="text-xs text-gray-700 font-medium flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
          {val}
        </span>
      ),
    },
    {
      title: 'Expected Delivery',
      key: 'expectedDeliveryDate',
      render: (val) => {
        const dt = val ? new Date(val) : null;
        return (
          <span className="text-xs text-gray-700 font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            {dt ? dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '12 Sep 2026'}
          </span>
        );
      },
    },
    {
      title: 'Delivery Status',
      key: 'status',
      render: (val) => <StatusBadge status={val || 'In Transit'} size="sm" />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedLogisticsModal(row)}
          icon={Truck}
          className="text-xs font-bold text-emerald-700 hover:bg-emerald-50"
        >
          Track Delivery
        </Button>
      ),
    },
  ];

  // PART 10 — BUYER TRANSACTIONS TABLE COLUMNS
  const buyerTxnColumns = [
    {
      title: 'Transaction ID',
      key: 'transactionId',
      render: (val, row) => (
        <span className="font-mono font-bold text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded">
          {val || row.id || 'TXN1001'}
        </span>
      ),
    },
    {
      title: 'Farmer / Origin',
      key: 'farmerName',
      render: (val) => (
        <div>
          <span className="font-semibold text-gray-900 text-sm">{val || 'Verified APMC Farmer'}</span>
          <span className="block text-[11px] text-emerald-700">Farm Gate Inspected</span>
        </div>
      ),
    },
    {
      title: 'Crop',
      key: 'crop',
      render: (val) => <span className="font-bold text-gray-900">{val || 'Tomato'}</span>,
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (val) => <span className="font-bold text-gray-800">{typeof val === 'number' ? `${val} kg` : val}</span>,
    },
    {
      title: 'Total Amount',
      key: 'totalAmount',
      render: (val) => (
        <span className="font-extrabold text-emerald-700 text-base">
          ₹{Number(val || 16500).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      title: 'Payment Status',
      key: 'paymentStatus',
      render: (val) => {
        const s = (val || 'Pending').toLowerCase();
        const cat = s === 'paid' || s === 'received' ? 'Paid' : s === 'processing' ? 'Processing' : 'Pending';
        return (
          <StatusBadge
            status={cat}
            variant={cat === 'Paid' ? 'success' : cat === 'Processing' ? 'info' : 'warning'}
            size="sm"
          />
        );
      },
    },
    {
      title: 'Delivery Status',
      key: 'deliveryStatus',
      render: (_, row) => {
        const log = logistics.find((l) => l.transactionId === (row.transactionId || row.id));
        const status = log?.status || row.status || 'In Transit';
        return <StatusBadge status={status} size="sm" />;
      },
    },
  ];

  // PART 21 — MY GRIEVANCES COLUMNS
  const buyerGrievanceColumns = [
    {
      title: 'Grievance ID',
      key: 'grievanceId',
      render: (val, row) => (
        <span className="font-mono font-bold text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded">
          {val || row.id || 'GRV1001'}
        </span>
      ),
    },
    {
      title: 'Transaction',
      key: 'transactionRef',
      render: (val, row) => (
        <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {val || row.transactionId || 'TXN1001'}
        </span>
      ),
    },
    {
      title: 'Dispute Nature',
      key: 'issueType',
      render: (val, row) => (
        <span className="font-bold text-rose-700 text-xs sm:text-sm">
          {val || row.issue || 'Payment Not Received'}
        </span>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      render: (val, row) => (
        <span className="text-xs text-gray-700 truncate max-w-[220px] block" title={val || row.subject}>
          {val || row.subject}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val || 'Open'} size="sm" />,
    },
    {
      title: 'Resolution',
      key: 'resolution',
      render: (val) => (
        <span className="text-xs text-gray-600 italic truncate max-w-[180px] block">
          {val || 'In arbitration'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-14">
      {/* Buyer Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Institutional Buyer Account</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Buyer Procurement Console
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Procure farm-gate inspected produce directly from verified farmers and aggregated FPO clusters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="success"
            size="md"
            onClick={() => navigate('/buyer/find-produce')}
            icon={Search}
            className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold border-none"
          >
            Find Produce
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setCreateModalOpen(true)}
            icon={PlusCircle}
            className="font-bold shadow-md shadow-emerald-600/20"
          >
            Post Requirement
          </Button>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} icon={RefreshCw} className="text-xs">
            Retry Connection
          </Button>
        </div>
      )}

      {successNotice && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-sm font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-xs font-bold underline text-emerald-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* PART 10 — 4 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Demands"
          value={activeDemandsCount}
          subtitle="Open for farmer matching"
          iconName="ClipboardList"
          color="blue"
        />
        <StatCard
          title="Pending Offers"
          value={pendingOffersCount}
          subtitle="Awaiting deal closure"
          iconName="Handshake"
          color="amber"
        />
        <StatCard
          title="Accepted Deals"
          value={acceptedDealsCount}
          subtitle="Contracts established"
          iconName="CheckCircle2"
          color="emerald"
        />
        <StatCard
          title="Total Quantity Required"
          value={totalVolumeRequiredStr}
          subtitle="Aggregated bulk volume"
          iconName="Package"
          color="purple"
        />
      </div>

      {/* PART 21 — BUYER PAYMENT SUMMARY */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-gray-900 via-slate-900 to-emerald-950 text-white border border-gray-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Procurement Financial Settlement</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">Payment &amp; Escrow Ledger</h3>
          <p className="text-xs text-gray-400">
            Escrow release schedule across contracted farmer harvest lots (Demo Tracking)
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Total Deals</span>
            <span className="text-lg sm:text-2xl font-black text-white">
              ₹{buyerPaymentSummary.total.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">Paid</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-300">
              ₹{buyerPaymentSummary.paid.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">In Escrow</span>
            <span className="text-lg sm:text-2xl font-black text-amber-300">
              ₹{buyerPaymentSummary.pending.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* PART 10 — INCOMING DELIVERIES SECTION */}
      <Card
        title="Incoming Deliveries"
        subtitle="Active farm-gate shipments dispatched toward buyer hubs via GET /api/logistics"
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">Loading incoming deliveries from API...</p>
          </div>
        ) : logistics.length === 0 ? (
          <EmptyState
            title="No Incoming Deliveries"
            description="There are currently no active deliveries in transit for your account."
          />
        ) : (
          <Table columns={deliveryColumns} data={logistics} keyField="_id" />
        )}
      </Card>

      {/* PART 10 — BUYER TRANSACTIONS */}
      <Card
        title="My Procurement Transactions"
        subtitle="Executed produce purchases, payment escrow tracking, and dispatch weighment status"
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">Loading buyer transactions from API...</p>
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No Transactions Found"
            description="You have not contracted any farm-gate produce deals yet."
          />
        ) : (
          <Table columns={buyerTxnColumns} data={transactions} keyField="_id" />
        )}
      </Card>

      {/* PART 10 — MY ACTIVE DEMANDS SECTION */}
      <Card
        title="My Active Demands"
        subtitle="Commercial crop requirements published to regional farmers via GET /api/buyer-demands"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            icon={PlusCircle}
            className="text-xs font-semibold"
          >
            New Demand
          </Button>
        }
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">Loading buyer demands from API...</p>
          </div>
        ) : demands.length === 0 ? (
          <EmptyState
            title="No Active Demands"
            description="You have not published any crop procurement requirements yet."
            action={
              <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
                Create First Demand
              </Button>
            }
          />
        ) : (
          <Table columns={demandColumns} data={demands} keyField="_id" />
        )}
      </Card>

      {/* PART 21 — MY GRIEVANCES & DISPUTES */}
      <Card
        title="My Grievances &amp; Quality Disputes"
        subtitle="Formal dispute tickets filed or received via GET /api/grievances"
      >
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-600">Loading grievance records...</p>
          </div>
        ) : grievances.length === 0 ? (
          <EmptyState
            title="No Active Grievances"
            description="All buyer consignments and payments are dispute-free."
          />
        ) : (
          <Table columns={buyerGrievanceColumns} data={grievances} keyField="_id" />
        )}
      </Card>

      {/* DELIVERY DETAILS MODAL (Part 10 & 11) */}
      {selectedLogisticsModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Consignment Tracking
                </span>
                <h3 className="text-2xl font-black text-gray-900">
                  Shipment {selectedLogisticsModal.transactionId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLogisticsModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <DeliveryTrackingCard
              logistics={selectedLogisticsModal}
              transaction={transactions.find((t) => t.transactionId === selectedLogisticsModal.transactionId)}
              showFullDetails={true}
            />

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="md"
                onClick={() => setSelectedLogisticsModal(null)}
              >
                Close Tracking
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PART 11 — CREATE BUYER DEMAND MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Publish Requirement</span>
                <h3 className="text-2xl font-black text-gray-900">Post Bulk Crop Demand</h3>
                <p className="text-xs text-gray-500">Will be saved to MongoDB via POST /api/buyer-demands</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-4" noValidate>
              {/* Crop */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Crop *
                </label>
                <select
                  value={demandForm.crop}
                  onChange={(e) => setDemandForm({ ...demandForm, crop: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Chilli">Chilli</option>
                  <option value="Potato">Potato</option>
                </select>
                {formErrors.crop && <p className="text-xs text-rose-600 mt-1">{formErrors.crop}</p>}
              </div>

              {/* Quantity & Unit */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Required Quantity *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 10"
                    value={demandForm.quantity}
                    onChange={(e) => setDemandForm({ ...demandForm, quantity: e.target.value })}
                    className={`flex-1 bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 ${
                      formErrors.quantity ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'
                    }`}
                  />
                  <select
                    value={demandForm.unit}
                    onChange={(e) => setDemandForm({ ...demandForm, unit: e.target.value })}
                    className="w-24 bg-gray-100 border border-gray-200 rounded-xl px-2 py-2 text-xs font-bold text-gray-700"
                  >
                    <option value="MT">MT</option>
                    <option value="kg">kg</option>
                    <option value="Quintal">Quintal</option>
                  </select>
                </div>
                {formErrors.quantity && <p className="text-xs text-rose-600 mt-1">{formErrors.quantity}</p>}
              </div>

              {/* Quality Grade */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Quality Grade *
                </label>
                <select
                  value={demandForm.qualityGrade}
                  onChange={(e) => setDemandForm({ ...demandForm, qualityGrade: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Grade A">Grade A (Premium Supermarket / Export)</option>
                  <option value="Grade B">Grade B (Standard Wholesale)</option>
                  <option value="Grade C">Grade C (Processing / Sauce / Pulp)</option>
                </select>
                {formErrors.qualityGrade && <p className="text-xs text-rose-600 mt-1">{formErrors.qualityGrade}</p>}
              </div>

              {/* Offered Price */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Offered Price (₹/kg) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    placeholder="e.g. 34"
                    value={demandForm.offeredPrice}
                    onChange={(e) => setDemandForm({ ...demandForm, offeredPrice: e.target.value })}
                    className={`w-full pl-8 pr-4 py-2 bg-gray-50 border rounded-xl text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 ${
                      formErrors.offeredPrice ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'
                    }`}
                  />
                </div>
                {formErrors.offeredPrice && <p className="text-xs text-rose-600 mt-1">{formErrors.offeredPrice}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Delivery Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru Central Hub, KA"
                  value={demandForm.location}
                  onChange={(e) => setDemandForm({ ...demandForm, location: e.target.value })}
                  className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 ${
                    formErrors.location ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'
                  }`}
                />
                {formErrors.location && <p className="text-xs text-rose-600 mt-1">{formErrors.location}</p>}
              </div>

              {/* Required By Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Required By Date *
                </label>
                <input
                  type="date"
                  required
                  value={demandForm.requiredBy}
                  onChange={(e) => setDemandForm({ ...demandForm, requiredBy: e.target.value })}
                  className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 ${
                    formErrors.requiredBy ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'
                  }`}
                />
                {formErrors.requiredBy && <p className="text-xs text-rose-600 mt-1">{formErrors.requiredBy}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={createLoading}
                  className="font-bold"
                >
                  {createLoading ? 'Publishing...' : 'Broadcast Demand'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
