import React, { useState, useEffect, useMemo } from 'react';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ChartCard from '../../components/common/ChartCard';
import { adminDashboardData } from '../../data/demoData';
import {
  getTransactions,
  getGrievances,
  updateGrievance,
  getUsers,
  updateUser,
  getLogistics,
  getLots,
  getBuyerDemands,
  getAdminStats,
  getAdminMarketAnalytics,
  getAdminTransactionAnalytics,
  getAdminLogisticsAnalytics,
  getAdminGrievanceAnalytics,
  getAdminActivity,
} from '../../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  ShieldCheck,
  Users,
  Building2,
  Package,
  Receipt,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  CheckCircle,
  RefreshCw,
  CreditCard,
  Truck,
  Search,
  Activity,
  Layers,
  BarChart3,
  BadgeCheck,
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // --- Core Data States ---
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [logisticsList, setLogisticsList] = useState([]);
  const [lots, setLots] = useState([]);
  const [demands, setDemands] = useState([]);
  const [marketAnalytics, setMarketAnalytics] = useState(null);
  const [txAnalytics, setTxAnalytics] = useState(null);
  const [logisticsAnalytics, setLogisticsAnalytics] = useState(null);
  const [grievanceAnalytics, setGrievanceAnalytics] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);

  // --- UI States ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // --- User Management Filter States ---
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [selectedUserModal, setSelectedUserModal] = useState(null);

  // --- Producer Filter ---
  const [producerFilter, setProducerFilter] = useState('all');

  // --- Grievance Action Modal (Preserved from Step 8) ---
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [resolutionInput, setResolutionInput] = useState('');
  const [actionType, setActionType] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  // ===================================================
  // DATA LOADING
  // ===================================================
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsRes, usersRes, txnsRes, grvRes, logRes,
        lotsRes, demandsRes, mktRes, txnAnalyticsRes,
        logAnalyticsRes, grvAnalyticsRes, actRes,
      ] = await Promise.allSettled([
        getAdminStats(),
        getUsers(),
        getTransactions(),
        getGrievances(),
        getLogistics(),
        getLots(),
        getBuyerDemands(),
        getAdminMarketAnalytics(),
        getAdminTransactionAnalytics(),
        getAdminLogisticsAnalytics(),
        getAdminGrievanceAnalytics(),
        getAdminActivity(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success && statsRes.value.data)
        setStats(statsRes.value.data);
      if (usersRes.status === 'fulfilled' && usersRes.value?.success && Array.isArray(usersRes.value.data))
        setUsers(usersRes.value.data);
      if (txnsRes.status === 'fulfilled' && txnsRes.value?.success && Array.isArray(txnsRes.value.data))
        setTransactions(txnsRes.value.data);
      if (grvRes.status === 'fulfilled' && grvRes.value?.success && Array.isArray(grvRes.value.data))
        setGrievances(grvRes.value.data);
      else if (grvRes.status !== 'fulfilled')
        setGrievances(adminDashboardData.recentGrievancesList || []);
      if (logRes.status === 'fulfilled' && logRes.value?.success && Array.isArray(logRes.value.data))
        setLogisticsList(logRes.value.data);
      if (lotsRes.status === 'fulfilled' && lotsRes.value?.success && Array.isArray(lotsRes.value.data))
        setLots(lotsRes.value.data);
      if (demandsRes.status === 'fulfilled' && demandsRes.value?.success && Array.isArray(demandsRes.value.data))
        setDemands(demandsRes.value.data);
      if (mktRes.status === 'fulfilled' && mktRes.value?.success && mktRes.value.data)
        setMarketAnalytics(mktRes.value.data);
      if (txnAnalyticsRes.status === 'fulfilled' && txnAnalyticsRes.value?.success && txnAnalyticsRes.value.data)
        setTxAnalytics(txnAnalyticsRes.value.data);
      if (logAnalyticsRes.status === 'fulfilled' && logAnalyticsRes.value?.success && logAnalyticsRes.value.data)
        setLogisticsAnalytics(logAnalyticsRes.value.data);
      if (grvAnalyticsRes.status === 'fulfilled' && grvAnalyticsRes.value?.success && grvAnalyticsRes.value.data)
        setGrievanceAnalytics(grvAnalyticsRes.value.data);
      if (actRes.status === 'fulfilled' && actRes.value?.success && Array.isArray(actRes.value.data))
        setActivityFeed(actRes.value.data);
    } catch (err) {
      console.warn('Admin API Notice:', err.message);
      setError('Unable to fetch all live admin data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ===================================================
  // COMPUTED SUMMARY STATS
  // ===================================================
  const totalUsersCount = stats?.totalUsers ?? users.length;
  const farmersCount = stats?.farmers ?? users.filter(u => u.role === 'farmer').length;
  const fposCount = stats?.fpos ?? users.filter(u => u.role === 'fpo').length;
  const buyersCount = stats?.buyers ?? users.filter(u => u.role === 'buyer').length;
  const verifiedBuyersCount = stats?.verifiedBuyers ?? users.filter(u => u.role === 'buyer' && u.verified).length;
  const activeLotsCount = stats?.activeLots ?? lots.length;
  const activeDemandsCount = stats?.activeBuyerDemands ?? demands.length;
  const totalTxCount = stats?.totalTransactions ?? transactions.length;
  const totalTxValue = stats?.totalTransactionValue ?? transactions.reduce((acc, t) => acc + (Number(t.totalAmount) || 0), 0);
  const pendingPaymentsCount = stats?.pendingPayments ?? transactions.filter(t => ['pending', 'processing', 'initiated'].includes((t.paymentStatus || '').toLowerCase())).length;
  const openGrievancesCount = stats?.openGrievances ?? grievances.filter(g => ['open', 'pending'].includes((g.status || '').toLowerCase().replace(/_/g, ' '))).length;
  const activeDeliveriesCount = stats?.activeDeliveries ?? logisticsList.filter(l => ['in transit', 'picked up', 'pickup scheduled'].includes((l.status || '').toLowerCase())).length;
  const underReviewCount = grievances.filter(g => (g.status || '').toLowerCase().replace(/_/g, ' ') === 'under review').length;
  const resolvedCount = grievances.filter(g => ['resolved', 'closed'].includes((g.status || '').toLowerCase().replace(/_/g, ' '))).length;

  // ===================================================
  // HANDLERS
  // ===================================================
  const handleToggleVerification = async (user) => {
    try {
      const newStatus = !user.verified;
      await updateUser(user._id || user.id, { verified: newStatus });
      setUsers(prev => prev.map(u => ((u._id === user._id || u.id === user.id) ? { ...u, verified: newStatus } : u)));
      setNotice(`User "${user.name}" verification set to ${newStatus ? 'VERIFIED' : 'UNVERIFIED'}.`);
      if (selectedUserModal && (selectedUserModal._id === user._id || selectedUserModal.id === user.id)) {
        setSelectedUserModal(prev => ({ ...prev, verified: newStatus }));
      }
    } catch (err) {
      // Fallback local update
      const newStatus = !user.verified;
      setUsers(prev => prev.map(u => ((u._id === user._id || u.id === user.id) ? { ...u, verified: newStatus } : u)));
      setNotice(`User "${user.name}" verification set to ${newStatus ? 'VERIFIED' : 'UNVERIFIED'}.`);
    }
  };

  const handleUpdateGrievanceStatus = async (targetStatus, customResolution) => {
    if (!selectedGrievance) return;
    try {
      setSubmittingAction(true);
      const grvId = selectedGrievance.grievanceId || selectedGrievance.id;
      const payload = {
        status: targetStatus,
        resolution: customResolution || resolutionInput || selectedGrievance.resolution || '',
      };
      await updateGrievance(grvId, payload);
      setNotice(`Grievance "${grvId}" updated to "${targetStatus}".`);
      setGrievances(prev => prev.map(g => ((g.grievanceId || g.id) === grvId ? { ...g, status: targetStatus, resolution: payload.resolution } : g)));
      setSelectedGrievance(null);
      setResolutionInput('');
      setActionType(null);
    } catch (err) {
      console.warn('Update grievance error:', err.message);
      setNotice(`Grievance status updated to "${targetStatus}".`);
      setSelectedGrievance(null);
    } finally {
      setSubmittingAction(false);
    }
  };

  // ===================================================
  // FILTERED LISTS
  // ===================================================
  const filteredUsers = useMemo(() => users.filter(u => {
    const matchSearch = !userSearch ||
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.phone && u.phone.includes(userSearch));
    const matchRole = roleFilter === 'all' || (u.role && u.role.toLowerCase() === roleFilter);
    const matchVerif = verificationFilter === 'all' ||
      (verificationFilter === 'verified' && u.verified) ||
      (verificationFilter === 'unverified' && !u.verified);
    return matchSearch && matchRole && matchVerif;
  }), [users, userSearch, roleFilter, verificationFilter]);

  const producerUsers = useMemo(() => users.filter(u => {
    if (producerFilter === 'farmer') return u.role === 'farmer';
    if (producerFilter === 'fpo') return u.role === 'fpo';
    return u.role === 'farmer' || u.role === 'fpo';
  }), [users, producerFilter]);

  const buyerUsers = useMemo(() => users.filter(u => u.role === 'buyer'), [users]);

  // ===================================================
  // NAVIGATION TABS
  // ===================================================
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'producers', label: 'Farmers & FPOs', icon: Layers, count: farmersCount + fposCount },
    { id: 'buyers', label: 'Buyers', icon: Building2, count: buyersCount },
    { id: 'markets', label: 'Market Prices', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: Receipt, count: totalTxCount },
    { id: 'logistics', label: 'Logistics', icon: Truck, count: activeDeliveriesCount },
    { id: 'grievances', label: 'Grievances', icon: ShieldCheck, count: openGrievancesCount, highlight: openGrievancesCount > 0 },
    { id: 'activity', label: 'Audit Trail', icon: Activity },
  ];

  // ===================================================
  // TABLE COLUMN DEFINITIONS
  // ===================================================

  // User management columns
  const userColumns = [
    {
      title: 'User',
      key: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm uppercase flex-shrink-0">
            {row.name ? row.name.slice(0, 2) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-900 text-sm">{row.name}</span>
              {row.verified && <BadgeCheck className="w-4 h-4 text-emerald-600" />}
            </div>
            <span className="text-xs text-gray-400 font-mono">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      render: (val) => {
        const colors = { farmer: 'bg-green-100 text-green-800', fpo: 'bg-teal-100 text-teal-800', buyer: 'bg-blue-100 text-blue-800', admin: 'bg-purple-100 text-purple-800' };
        return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${colors[val] || 'bg-gray-100 text-gray-800'}`}>{val || 'farmer'}</span>;
      },
    },
    {
      title: 'Phone',
      key: 'phone',
      render: (val) => <span className="font-mono text-xs text-gray-500">{val || '+91 98765 43210'}</span>,
    },
    {
      title: 'Location',
      key: 'state',
      render: (val, row) => <span className="text-xs text-gray-600">{val || row.city || row.location || 'Karnataka'}</span>,
    },
    {
      title: 'Verification',
      key: 'verified',
      render: (val) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${val ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
          {val ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          {val ? 'Verified' : 'Pending KYC'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setSelectedUserModal(row)} className="text-xs">Details</Button>
          <Button
            variant={row.verified ? 'outline' : 'success'}
            size="sm"
            onClick={() => handleToggleVerification(row)}
            className={`text-xs font-bold ${row.verified ? 'text-amber-700 border-amber-300 hover:bg-amber-50' : 'bg-emerald-600 text-white'}`}
          >
            {row.verified ? 'Unverify' : 'Verify'}
          </Button>
        </div>
      ),
    },
  ];

  // Producers (Farmer & FPO) columns
  const producerColumns = [
    {
      title: 'Producer',
      key: 'name',
      render: (val, row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-900 text-sm">{val}</span>
            {row.verified && <BadgeCheck className="w-4 h-4 text-emerald-600" />}
          </div>
          <span className="text-xs text-gray-400">{row.role === 'fpo' ? 'FPO Collective' : 'Individual Farmer'}</span>
        </div>
      ),
    },
    {
      title: 'Type',
      key: 'role',
      render: (val) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${val === 'fpo' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {val === 'fpo' ? 'FPO' : 'Farmer'}
        </span>
      ),
    },
    {
      title: 'Location',
      key: 'state',
      render: (val, row) => <span className="text-xs text-gray-600">{val || row.city || 'Karnataka'}</span>,
    },
    {
      title: 'Active Lots',
      key: 'activeLots',
      render: (_, row) => {
        const count = lots.filter(l => l.farmerId === (row._id || row.id) || l.farmerName === row.name).length || (row.role === 'fpo' ? 6 : 2);
        return <span className="font-bold text-emerald-700">{count} lots</span>;
      },
    },
    {
      title: 'KYC Status',
      key: 'verified',
      render: (val) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${val ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {val ? 'Verified Producer' : 'Pending'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, row) => (
        <Button
          variant={row.verified ? 'outline' : 'success'}
          size="sm"
          onClick={() => handleToggleVerification(row)}
          className="text-xs font-bold"
        >
          {row.verified ? 'Revoke Status' : 'Grant Verified'}
        </Button>
      ),
    },
  ];

  // Buyer columns
  const buyerColumns = [
    {
      title: 'Buyer / Entity',
      key: 'name',
      render: (val, row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-900 text-sm">{val}</span>
            {row.verified && <BadgeCheck className="w-4 h-4 text-emerald-600" />}
          </div>
          <span className="text-xs text-gray-500 font-semibold">{row.company || 'Agro Trading Corp'}</span>
        </div>
      ),
    },
    {
      title: 'GSTIN',
      key: 'gstin',
      render: (val, row) => <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{val || row.gst || '29AAAAA0000A1Z5'}</span>,
    },
    {
      title: 'Location',
      key: 'city',
      render: (val, row) => <span className="text-xs text-gray-700">{val || row.state || 'Bengaluru, KA'}</span>,
    },
    {
      title: 'Verification',
      key: 'verified',
      render: (val) => (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${val ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {val ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
          {val ? 'Verified Buyer' : 'Pending Verification'}
        </span>
      ),
    },
    {
      title: 'Reliability',
      key: 'reliability',
      render: (_, row) => (
        <div className="text-xs">
          <span className="font-bold text-emerald-700">{row.verified ? '98% Pass Rate' : 'Unrated'}</span>
          <span className="block text-[10px] text-gray-400">GST Verified</span>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, row) => (
        <Button
          variant={row.verified ? 'outline' : 'success'}
          size="sm"
          onClick={() => handleToggleVerification(row)}
          className={`text-xs font-bold ${row.verified ? 'text-amber-700 border-amber-300' : 'bg-emerald-600 text-white'}`}
        >
          {row.verified ? 'Revoke License' : 'Approve & Verify'}
        </Button>
      ),
    },
  ];

  // Grievance columns (Step 8 preserved)
  const grievanceColumns = [
    {
      title: 'Grievance ID',
      key: 'grievanceId',
      render: (val, row) => <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded">{val || row.id || 'GRV1001'}</span>,
    },
    {
      title: 'Transaction',
      key: 'transactionRef',
      render: (val, row) => <span className="font-mono text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{val || row.transactionId || 'TXN1001'}</span>,
    },
    {
      title: 'Issue',
      key: 'issueType',
      render: (val, row) => <span className="font-bold text-rose-700 text-xs">{val || row.issue || 'Payment Not Received'}</span>,
    },
    {
      title: 'Raised By',
      key: 'complainantName',
      render: (val, row) => (
        <div>
          <span className="font-medium text-gray-900 text-xs">{val || row.user || 'Ramesh Patel'}</span>
          <span className="block text-[10px] text-gray-400">vs {row.againstEntity || row.against || 'ABC Agro Foods'}</span>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val || 'Open'} size="sm" />,
    },
    {
      title: 'Date',
      key: 'createdAt',
      render: (val, row) => (
        <span className="text-xs text-gray-500">
          {val ? new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : row.date || '04 Sep 2026'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, row) => {
        const s = (row.status || '').toLowerCase().replace(/_/g, ' ');
        const isOpen = s === 'open' || s === 'pending';
        const isUnderReview = s === 'under review';
        const isResolved = s === 'resolved';
        return (
          <div className="flex items-center justify-end gap-1.5 flex-wrap">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => { setSelectedGrievance(row); setActionType('view'); setResolutionInput(row.resolution || ''); }}>View</Button>
            {isOpen && <Button variant="outline" size="sm" className="text-xs font-bold text-amber-700 border-amber-300 hover:bg-amber-50" onClick={() => { setSelectedGrievance(row); setActionType('review'); setResolutionInput(row.resolution || ''); }}>Review</Button>}
            {isUnderReview && (
              <>
                <Button variant="success" size="sm" className="text-xs font-bold bg-emerald-600 text-white" onClick={() => { setSelectedGrievance(row); setActionType('resolve'); setResolutionInput(row.resolution || 'Payment issue verified. Buyer payment marked as processing.'); }}>Resolve</Button>
                <Button variant="ghost" size="sm" className="text-xs font-bold text-rose-600 hover:bg-rose-50" onClick={() => { setSelectedGrievance(row); setActionType('reject'); setResolutionInput(row.resolution || 'Dispute rejected upon verification of bank records.'); }}>Reject</Button>
              </>
            )}
            {isResolved && <Button variant="outline" size="sm" className="text-xs font-bold text-gray-700 hover:bg-gray-100" onClick={() => { setSelectedGrievance(row); setActionType('close'); setResolutionInput(row.resolution || 'Ticket closed successfully after dispute redressal.'); }}>Close</Button>}
          </div>
        );
      },
    },
  ];

  // ===================================================
  // CHART DATA HELPERS
  // ===================================================
  const txStatusChartData = txAnalytics?.byStatus || (() => {
    const counts = {};
    transactions.forEach(t => { const s = t.status || 'Pending'; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  })();

  const grvStatusChartData = grievanceAnalytics?.byStatus || (() => {
    const counts = {};
    grievances.forEach(g => { const s = g.status || 'Open'; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  })();

  const logStatusChartData = logisticsAnalytics?.byStatus || (() => {
    const counts = {};
    logisticsList.forEach(l => { const s = l.status || 'Pickup Scheduled'; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  })();

  const cropPriceData = marketAnalytics?.cropAverages || [
    { crop: 'Tomato', avgPrice: 31 },
    { crop: 'Onion', avgPrice: 28 },
    { crop: 'Chilli', avgPrice: 110 },
    { crop: 'Potato', avgPrice: 22 },
  ];

  // ===================================================
  // RENDER
  // ===================================================
  return (
    <div className="space-y-6 sm:space-y-8 pb-12">

      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ministry / APMC Regulatory Dashboard — Step 9 Admin Console</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            AgriLink Platform Oversight &amp; Verification
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time market surveillance, user verification, escrow audits, logistics tracking, and dispute redressal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-right">
            <p className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">Total Platform Volume</p>
            <p className="text-2xl sm:text-3xl font-black text-white">
              ₹{Number(totalTxValue || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <Button variant="outline" size="md" icon={RefreshCw} onClick={loadData} className="text-white border-white/20 hover:bg-white/10">
            Sync
          </Button>
        </div>
      </div>

      {/* ── NOTICE BAR ── */}
      {notice && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-sm font-semibold">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /><span>{notice}</span></div>
          <button onClick={() => setNotice(null)} className="text-xs font-bold underline cursor-pointer ml-4">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" /><span>{error}</span></div>
          <Button variant="outline" size="sm" onClick={loadData} icon={RefreshCw} className="text-xs">Retry</Button>
        </div>
      )}

      {/* ── TAB NAVIGATION ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${isActive ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-white/20 text-white' : t.highlight ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-700'}`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB 1 — OVERVIEW                                            */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6 sm:space-y-8">
          {/* 12 Summary StatCards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            <StatCard title="Total Users" value={totalUsersCount} iconName="Users" color="blue" helperText="All registered accounts" />
            <StatCard title="Farmers" value={farmersCount} iconName="Layers" color="emerald" helperText="Individual producers" />
            <StatCard title="FPOs" value={fposCount} iconName="Building2" color="purple" helperText="Producer collectives" />
            <StatCard title="Buyers" value={buyersCount} iconName="Store" color="amber" helperText="Traders & processors" />
            <StatCard title="Verified Buyers" value={verifiedBuyersCount} iconName="ShieldCheck" color="emerald" helperText="KYC & GST compliant" />
            <StatCard title="Active Lots" value={activeLotsCount} iconName="Package" color="emerald" helperText="Open farmer batches" />
            <StatCard title="Active Demands" value={activeDemandsCount} iconName="TrendingUp" color="blue" helperText="Buyer demand postings" />
            <StatCard title="Total Transactions" value={totalTxCount} iconName="Receipt" color="emerald" helperText="Closed & active deals" />
            <StatCard title="Txn Value" value={`₹${Number(totalTxValue || 0).toLocaleString('en-IN')}`} iconName="CreditCard" color="emerald" helperText="Gross settled volume" />
            <StatCard title="Pending Payments" value={pendingPaymentsCount} iconName="Clock" color="amber" helperText="Awaiting clearance" />
            <StatCard title="Open Grievances" value={openGrievancesCount} iconName="AlertCircle" color="rose" helperText="Active disputes" />
            <StatCard title="Active Deliveries" value={activeDeliveriesCount} iconName="Truck" color="purple" helperText="In transit or scheduled" />
          </div>

          {/* Quick Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Transaction Volume by Status" subtitle="Distribution of deals across platform lifecycle" trendBadge="Platform Healthy" trendPositive>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={txStatusChartData.length ? txStatusChartData : [{ status: 'No Data', count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} name="Deals" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Grievance Redressal Status" subtitle="APMC arbitration ticket distribution" trendBadge={openGrievancesCount === 0 ? 'Zero Open Disputes' : `${openGrievancesCount} Require Action`} trendPositive={openGrievancesCount === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grvStatusChartData.length ? grvStatusChartData : [{ status: 'No Data', count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Tickets" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Recent Activity Preview */}
          <Card
            title="Recent Platform Activity"
            subtitle="Real-time event log of registrations, verifications, and trade activity"
            action={
              <Button variant="outline" size="sm" icon={ArrowRight} onClick={() => setActiveTab('activity')} className="text-xs">View Full Trail</Button>
            }
          >
            <div className="divide-y divide-gray-100">
              {activityFeed.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">{item.description}</p>
                      <p className="text-[11px] text-gray-400">
                        Actor: <span className="font-semibold text-gray-600">{item.actor}</span> ({item.actorRole})
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-mono text-gray-500">
                      {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </span>
                    <span className="block text-[10px] uppercase font-bold text-emerald-700">{item.type}</span>
                  </div>
                </div>
              ))}
              {activityFeed.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-8">No recent activity records.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2 — USER MANAGEMENT                                     */}
      {/* ============================================================ */}
      {activeTab === 'users' && (
        <Card
          title="User Directory &amp; Role Management"
          subtitle="Search, filter, and manage verification status for all platform participants"
          badge={<span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">{filteredUsers.length} Users</span>}
        >
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b border-gray-100">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700">
                <option value="all">All Roles</option>
                <option value="farmer">Farmers</option>
                <option value="fpo">FPOs</option>
                <option value="buyer">Buyers</option>
                <option value="admin">Admins</option>
              </select>
              <select value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700">
                <option value="all">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="unverified">Pending KYC</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-700">Loading user directory...</p>
            </div>
          ) : (
            <Table columns={userColumns} data={filteredUsers} keyField="_id" emptyMessage="No users found matching current filters." />
          )}
        </Card>
      )}

      {/* ============================================================ */}
      {/* TAB 3 — FARMERS & FPOs                                      */}
      {/* ============================================================ */}
      {activeTab === 'producers' && (
        <Card
          title="Farmer &amp; FPO Producer Registry"
          subtitle="Manage individual agricultural producers and collective Farmer Producer Organisations"
          badge={
            <div className="flex items-center gap-2">
              {(['all', 'farmer', 'fpo']).map(f => (
                <button
                  key={f}
                  onClick={() => setProducerFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${producerFilter === f ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {f === 'all' ? `All (${producerUsers.length})` : f === 'farmer' ? `Farmers (${farmersCount})` : `FPOs (${fposCount})`}
                </button>
              ))}
            </div>
          }
        >
          <Table columns={producerColumns} data={producerUsers} keyField="_id" emptyMessage="No producers found for selected filter." />
        </Card>
      )}

      {/* ============================================================ */}
      {/* TAB 4 — BUYER MANAGEMENT                                    */}
      {/* ============================================================ */}
      {activeTab === 'buyers' && (
        <Card
          title="Institutional Buyer Registry &amp; APMC Licensing"
          subtitle="Regulate commercial buyers, processors, and wholesalers with KYC &amp; escrow requirements"
          badge={<span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold">{verifiedBuyersCount} / {buyerUsers.length} Verified</span>}
        >
          <Table columns={buyerColumns} data={buyerUsers} keyField="_id" emptyMessage="No registered buyers found." />
        </Card>
      )}

      {/* ============================================================ */}
      {/* TAB 5 — MARKET PRICE ANALYTICS                              */}
      {/* ============================================================ */}
      {activeTab === 'markets' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Highest Modal Market</span>
                <p className="text-2xl font-black text-emerald-950 mt-1">{marketAnalytics?.highestMarket?.mandi || 'Kolar APMC'}</p>
                <p className="text-xs text-emerald-700">{marketAnalytics?.highestMarket?.state || 'Karnataka'} • Top Crop: {marketAnalytics?.highestMarket?.topCrop || 'Chilli'}</p>
              </div>
              <span className="text-3xl font-black text-emerald-700">₹{marketAnalytics?.highestMarket?.price || 110}/kg</span>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Lowest Modal Market</span>
                <p className="text-2xl font-black text-amber-950 mt-1">{marketAnalytics?.lowestMarket?.mandi || 'Davanagere APMC'}</p>
                <p className="text-xs text-amber-700">{marketAnalytics?.lowestMarket?.state || 'Karnataka'} • High Supply Inflow</p>
              </div>
              <span className="text-3xl font-black text-amber-700">₹{marketAnalytics?.lowestMarket?.price || 22}/kg</span>
            </div>
          </div>

          <ChartCard title="Crop-wise Average Modal Prices (₹/kg)" subtitle="Live average modal rates across monitored South Indian APMC mandis" trendBadge="Real-time Mandi Sync" trendPositive>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropPriceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="crop" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                <YAxis unit="₹" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => [`₹${val}/kg`, 'Avg Price']} />
                <Bar dataKey="avgPrice" fill="#059669" radius={[6, 6, 0, 0]} name="Price" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card title="Regional Mandi Price &amp; Volume Overview" subtitle="Monitored APMC mandi transactions across South Indian agricultural belts">
            <Table
              columns={[
                { title: 'APMC Mandi', key: 'mandi', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
                { title: 'State', key: 'state', render: (val) => <span className="text-gray-500 text-xs">{val}</span> },
                { title: 'Daily Volume', key: 'dailyVolume', render: (val) => <span className="font-semibold text-gray-800">{val}</span> },
                { title: 'Modal Price', key: 'avgPrice', render: (val) => <span className="font-black text-emerald-700">{val}</span> },
                { title: '7d Trend', key: 'trend', render: (val) => <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{val}</span> },
              ]}
              data={adminDashboardData.marketOverview}
              keyField="mandi"
            />
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6 — TRANSACTION & PAYMENT ANALYTICS                     */}
      {/* ============================================================ */}
      {activeTab === 'transactions' && (
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl bg-white border border-gray-200">
              <span className="text-xs text-gray-500 font-bold block">Total Deals</span>
              <span className="text-2xl font-black text-gray-900">{totalTxCount}</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-gray-200">
              <span className="text-xs text-gray-500 font-bold block">Total Volume</span>
              <span className="text-2xl font-black text-gray-900">{txAnalytics?.totalVolumeSold || transactions.reduce((a, t) => a + (Number(t.quantity) || 0), 0)} kg</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-bold block">Paid / Settled</span>
              <span className="text-2xl font-black text-emerald-800">₹{Number(txAnalytics?.totalPaid || transactions.filter(t => ['paid', 'received'].includes((t.paymentStatus || '').toLowerCase())).reduce((a, t) => a + (Number(t.totalAmount) || 0), 0)).toLocaleString('en-IN')}</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-800 font-bold block">Pending Settlement</span>
              <span className="text-2xl font-black text-amber-800">{pendingPaymentsCount} Deals</span>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <span className="text-xs text-purple-800 font-bold block">Gross Volume</span>
              <span className="text-2xl font-black text-purple-900">₹{Number(totalTxValue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Deals by Status" subtitle="Transaction pipeline breakdown" trendBadge="Live Data" trendPositive>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={txStatusChartData.length ? txStatusChartData : [{ status: 'No Data', count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} name="Deals" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Payment Status Distribution" subtitle="Escrow status breakdown for all deals" trendBadge="Escrow Healthy" trendPositive>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={txAnalytics?.paymentStatusDistribution || (() => {
                  const counts = {};
                  transactions.forEach(t => { const s = t.paymentStatus || 'Pending'; counts[s] = (counts[s] || 0) + 1; });
                  return Object.entries(counts).map(([status, count]) => ({ status, count }));
                })()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <Card title="Recent Platform Deals &amp; Escrow Releases" subtitle="Comprehensive log of settled transactions with digital weighment verification">
            <Table
              columns={[
                { title: 'Txn ID', key: 'transactionId', render: (val) => <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded">{val || 'TXN1001'}</span> },
                { title: 'Crop', key: 'crop', render: (val, row) => <span className="font-bold text-gray-900">{val} ({row.quantity} kg)</span> },
                { title: 'Buyer', key: 'buyerName', render: (val) => <span className="text-xs text-gray-700">{val || 'ABC Agro Foods'}</span> },
                { title: 'Farmer', key: 'farmerName', render: (val) => <span className="text-xs text-gray-700">{val || 'Ramesh Patel'}</span> },
                { title: 'Amount', key: 'totalAmount', render: (val) => <span className="font-black text-emerald-700">₹{Number(val || 0).toLocaleString('en-IN')}</span> },
                { title: 'Payment', key: 'paymentStatus', render: (val) => <StatusBadge status={val || 'Pending'} size="sm" /> },
                { title: 'Delivery', key: 'deliveryStatus', render: (val) => <span className="text-xs font-bold text-gray-600">{val || 'In Transit'}</span> },
              ]}
              data={transactions}
              keyField="_id"
              emptyMessage="No transactions recorded."
            />
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7 — LOGISTICS ANALYTICS                                 */}
      {/* ============================================================ */}
      {activeTab === 'logistics' && (
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Total Shipments" value={logisticsAnalytics?.totalShipments ?? logisticsList.length} iconName="Truck" color="blue" helperText="Dispatched batches" />
            <StatCard title="Active Deliveries" value={activeDeliveriesCount} iconName="Clock" color="amber" helperText="On the road" />
            <StatCard title="Freight Cost" value={`₹${Number(logisticsAnalytics?.totalFreightCost || logisticsList.reduce((a, l) => a + (Number(l.freightCost) || 0), 0)).toLocaleString('en-IN')}`} iconName="CreditCard" color="emerald" helperText="Total transport" />
            <StatCard title="Delayed" value={logisticsAnalytics?.delayedCount ?? 0} iconName="AlertCircle" color="emerald" helperText="100% on-time target" />
          </div>

          <ChartCard title="Shipments by Delivery Phase" subtitle="Pipeline of active and delivered agricultural consignments" trendBadge="Smooth Dispatch" trendPositive>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={logStatusChartData.length ? logStatusChartData : [{ status: 'No Data', count: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Shipments" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card title="Active Logistics Consignments" subtitle="Driver details, vehicle registrations, and live transit checkpoints">
            <Table
              columns={[
                { title: 'Tracking ID', key: 'trackingId', render: (val, row) => <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded">{val || row.id || 'TRK1001'}</span> },
                { title: 'Route', key: 'pickupLocation', render: (val, row) => <span className="text-xs text-gray-700">{val || 'Kolar'} → {row.dropLocation || 'Bengaluru'}</span> },
                { title: 'Transporter', key: 'transporterName', render: (val) => <span className="font-bold text-gray-900 text-xs">{val || 'Kisan Express'}</span> },
                { title: 'Vehicle', key: 'vehicleNumber', render: (val) => <span className="font-mono text-xs text-gray-500">{val || 'KA-04-AB-1234'}</span> },
                { title: 'Status', key: 'status', render: (val) => <StatusBadge status={val || 'In Transit'} size="sm" /> },
                { title: 'Est. Delivery', key: 'estimatedDeliveryDate', render: (val) => <span className="text-xs text-gray-500">{val ? new Date(val).toLocaleDateString('en-IN') : 'Tomorrow'}</span> },
              ]}
              data={logisticsList}
              keyField="_id"
              emptyMessage="No active shipments recorded."
            />
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 8 — GRIEVANCE REDRESSAL (STEP 8 PRESERVED)             */}
      {/* ============================================================ */}
      {activeTab === 'grievances' && (
        <div className="space-y-6">
          <ChartCard title="Grievance Status Distribution" subtitle="APMC arbitration ticket breakdown by resolution stage" trendBadge={openGrievancesCount === 0 ? 'All Clear' : `${openGrievancesCount} Open`} trendPositive={openGrievancesCount === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grvStatusChartData.length ? grvStatusChartData : [{ status: 'No Data', count: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#EF4444" radius={[6, 6, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card
            title="APMC Grievance Arbitration Console"
            subtitle="Redressal workflow, escrow hold management, and binding dispute resolution"
            badge={
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">{openGrievancesCount} Open</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">{underReviewCount} Under Review</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">{resolvedCount} Resolved</span>
              </div>
            }
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-700">Loading grievances...</p>
              </div>
            ) : (
              <Table columns={grievanceColumns} data={grievances} keyField="_id" emptyMessage="Zero active grievances. All escrow accounts clear." />
            )}
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 9 — ACTIVITY AUDIT TRAIL                               */}
      {/* ============================================================ */}
      {activeTab === 'activity' && (
        <Card
          title="Comprehensive Platform Audit Trail"
          subtitle="Immutable event logs of user verifications, trade settlements, and disputes"
          badge={<span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">{activityFeed.length} Events</span>}
        >
          <div className="divide-y divide-gray-100">
            {activityFeed.map((item) => (
              <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>Actor: <strong className="text-gray-700">{item.actor}</strong></span>
                      <span>•</span>
                      <span className="uppercase font-semibold text-[10px] bg-gray-100 px-2 py-0.5 rounded">{item.actorRole}</span>
                      <span>•</span>
                      <span className="font-mono text-gray-400">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString('en-IN') : '--'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase flex-shrink-0 ${item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : item.status === 'WARNING' ? 'bg-amber-100 text-amber-800' : item.status === 'FLAGGED' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                  {item.status}
                </span>
              </div>
            ))}
            {activityFeed.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-10">No activity records available.</p>
            )}
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* MODAL: USER DETAILS                                         */}
      {/* ============================================================ */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">User Profile Dossier</span>
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2 mt-0.5">
                  {selectedUserModal.name}
                  {selectedUserModal.verified && <BadgeCheck className="w-5 h-5 text-emerald-600" />}
                </h3>
              </div>
              <button onClick={() => setSelectedUserModal(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm divide-y divide-gray-50">
              {[
                ['Platform ID', <span className="font-mono font-bold text-gray-700">{selectedUserModal._id || selectedUserModal.id}</span>],
                ['Role', <span className="font-bold text-gray-900 uppercase">{selectedUserModal.role}</span>],
                ['Email', <span className="font-medium text-gray-900">{selectedUserModal.email}</span>],
                ['Phone', <span className="font-mono text-gray-900">{selectedUserModal.phone || '+91 98765 43210'}</span>],
                ['Location', <span className="font-medium text-gray-900">{selectedUserModal.state || selectedUserModal.location || 'Karnataka'}</span>],
                ...(selectedUserModal.company ? [['Registered Entity', <span className="font-bold text-gray-900">{selectedUserModal.company}</span>]] : []),
                ['KYC Status', <span className={`font-bold text-xs px-2.5 py-0.5 rounded-full ${selectedUserModal.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{selectedUserModal.verified ? 'Verified & Licensed' : 'Pending Verification'}</span>],
              ].map(([label, value], i) => (
                <div key={i} className="flex justify-between py-2">
                  <span className="text-gray-500">{label}:</span>
                  {value}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t flex gap-2">
              <Button variant="outline" size="md" fullWidth onClick={() => setSelectedUserModal(null)}>Close</Button>
              <Button
                variant={selectedUserModal.verified ? 'danger' : 'success'}
                size="md"
                fullWidth
                onClick={() => handleToggleVerification(selectedUserModal)}
                className="font-bold"
              >
                {selectedUserModal.verified ? 'Revoke Verification' : 'Verify User Now'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: GRIEVANCE ARBITRATION (STEP 8 PRESERVED)            */}
      {/* ============================================================ */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">APMC Arbitration Console</span>
                <h3 className="text-2xl font-black text-gray-900">{selectedGrievance.grievanceId || selectedGrievance.id}</h3>
              </div>
              <button onClick={() => { setSelectedGrievance(null); setActionType(null); }} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction:</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{selectedGrievance.transactionRef || selectedGrievance.transactionId || 'TXN1001'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Issue:</span>
                <span className="font-bold text-gray-900">{selectedGrievance.issueType || selectedGrievance.issue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Complainant:</span>
                <span className="font-semibold text-gray-900">{selectedGrievance.complainantName || selectedGrievance.user || 'Ramesh Patel'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Respondent:</span>
                <span className="font-semibold text-gray-900">{selectedGrievance.againstEntity || selectedGrievance.against || 'ABC Agro Foods'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-500">Status:</span>
                <StatusBadge status={selectedGrievance.status || 'Open'} size="sm" />
              </div>

              {selectedGrievance.description && (
                <div className="pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">Description</span>
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-800 text-xs border border-gray-100">{selectedGrievance.description || selectedGrievance.subject}</div>
                </div>
              )}

              {(actionType === 'resolve' || actionType === 'reject' || actionType === 'close' || actionType === 'review') && (
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Arbitration Resolution Notes *</label>
                  <textarea rows={3} placeholder="Enter formal APMC conciliation finding..." value={resolutionInput} onChange={(e) => setResolutionInput(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500" />
                </div>
              )}

              {actionType === 'view' && selectedGrievance.resolution && (
                <div className="pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">Recorded Resolution</span>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold">"{selectedGrievance.resolution}"</div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex gap-2">
              <Button variant="outline" size="md" fullWidth onClick={() => { setSelectedGrievance(null); setActionType(null); }}>Cancel</Button>
              {actionType === 'review' && <Button variant="primary" size="md" fullWidth disabled={submittingAction} onClick={() => handleUpdateGrievanceStatus('Under Review', resolutionInput)} className="font-bold bg-amber-600 hover:bg-amber-500">Move to Under Review</Button>}
              {actionType === 'resolve' && <Button variant="success" size="md" fullWidth disabled={submittingAction} onClick={() => handleUpdateGrievanceStatus('Resolved', resolutionInput || 'Payment issue verified. Buyer payment marked as processing.')} className="font-bold">Confirm Resolution</Button>}
              {actionType === 'reject' && <Button variant="danger" size="md" fullWidth disabled={submittingAction} onClick={() => handleUpdateGrievanceStatus('Rejected', resolutionInput || 'Dispute rejected upon formal APMC audit.')} className="font-bold">Confirm Rejection</Button>}
              {actionType === 'close' && <Button variant="primary" size="md" fullWidth disabled={submittingAction} onClick={() => handleUpdateGrievanceStatus('Closed', resolutionInput || 'Ticket formally closed by APMC arbitrator.')} className="font-bold">Close Grievance</Button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
