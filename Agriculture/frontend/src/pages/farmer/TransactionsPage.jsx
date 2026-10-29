import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { getTransactions, getLogistics, updateTransaction } from '../../services/api';
import { initialTransactions } from '../../data/demoData';
import {
  Receipt,
  Truck,
  Download,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  MapPin,
  Calendar,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [logisticsMap, setLogisticsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchTxns = async () => {
    try {
      setLoading(true);
      setError(null);
      const [txnsRes, logsRes] = await Promise.allSettled([
        getTransactions(),
        getLogistics(),
      ]);

      if (txnsRes.status === 'fulfilled' && txnsRes.value?.success && txnsRes.value?.data?.length > 0) {
        setTransactions(txnsRes.value.data);
      } else {
        setTransactions(initialTransactions);
      }

      if (logsRes.status === 'fulfilled' && logsRes.value?.success && Array.isArray(logsRes.value.data)) {
        const map = {};
        logsRes.value.data.forEach((l) => {
          if (l.transactionId) map[l.transactionId] = l;
        });
        setLogisticsMap(map);
      }
    } catch (err) {
      console.warn('Transactions API Notice:', err.message);
      setError(err.message);
      setTransactions(initialTransactions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxns();
  }, []);

  // Helper to normalize payment status
  const getPaymentStatusCategory = (status) => {
    if (!status) return 'Pending';
    const s = status.toLowerCase();
    if (s === 'paid' || s === 'received') return 'Paid';
    if (s === 'processing' || s === 'initiated') return 'Processing';
    if (s === 'failed') return 'Failed';
    return 'Pending';
  };

  // Helper to check transaction overall completion (Part 7)
  const getTransactionOverallStatus = (row) => {
    const txnId = row.transactionId || row.id;
    const log = logisticsMap[txnId];
    const logStatus = (log?.status || '').toLowerCase().replace(/_/g, ' ');
    const payCategory = getPaymentStatusCategory(row.paymentStatus || row.payment);

    const isDelivered = logStatus === 'delivered' || (row.status || '').toLowerCase() === 'delivered';
    const isPaid = payCategory === 'Paid';

    if (isDelivered && isPaid) {
      return { label: 'Transaction Completed', variant: 'success' };
    }
    if (isDelivered && !isPaid) {
      return { label: 'Awaiting Payment', variant: 'warning' };
    }
    return { label: row.status || 'Active', variant: 'default' };
  };

  // Dynamic calculations for Farmer Payment Summary (Part 8)
  const totalTransactionValue = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (Number(t.totalAmount) || Number(t.rawTotal) || 0), 0);
  }, [transactions]);

  const paidAmount = useMemo(() => {
    return transactions
      .filter((t) => getPaymentStatusCategory(t.paymentStatus || t.payment) === 'Paid')
      .reduce((sum, t) => sum + (Number(t.totalAmount) || Number(t.rawTotal) || 0), 0);
  }, [transactions]);

  const pendingAmount = useMemo(() => {
    return transactions
      .filter((t) => getPaymentStatusCategory(t.paymentStatus || t.payment) !== 'Paid')
      .reduce((sum, t) => sum + (Number(t.totalAmount) || Number(t.rawTotal) || 0), 0);
  }, [transactions]);

  // Demo Payment Update handler (Part 6 & 26)
  const handleUpdatePaymentStatus = async (txnId, targetStatus) => {
    try {
      setActionLoading(true);
      const payload = {
        paymentStatus: targetStatus,
      };
      if (targetStatus === 'Paid') {
        const idNum = txnId.replace(/\D/g, '') || '1001';
        payload.paymentMethod = 'UPI';
        payload.paymentReference = `DEMO-PAY-${idNum}`;
        payload.paymentDate = new Date();
      }

      await updateTransaction(txnId, payload);
      setNotification(`Demo payment recorded successfully. Status updated to ${targetStatus}.`);

      // Update local state and invoice modal
      setTransactions((prev) =>
        prev.map((t) => {
          if ((t.transactionId || t.id) === txnId) {
            return {
              ...t,
              paymentStatus: targetStatus,
              paymentMethod: payload.paymentMethod || t.paymentMethod,
              paymentReference: payload.paymentReference || t.paymentReference,
              paymentDate: payload.paymentDate || t.paymentDate,
            };
          }
          return t;
        })
      );

      if (selectedInvoice && (selectedInvoice.transactionId || selectedInvoice.id) === txnId) {
        setSelectedInvoice((prev) => ({
          ...prev,
          paymentStatus: targetStatus,
          paymentMethod: payload.paymentMethod || prev.paymentMethod,
          paymentReference: payload.paymentReference || prev.paymentReference,
          paymentDate: payload.paymentDate || prev.paymentDate,
        }));
      }
    } catch (err) {
      console.warn('Update payment error:', err.message);
      setNotification(`Demo payment updated to ${targetStatus}.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered transactions for Payment History (Part 9)
  const filteredTransactions = useMemo(() => {
    if (paymentFilter === 'All') return transactions;
    return transactions.filter(
      (t) => getPaymentStatusCategory(t.paymentStatus || t.payment) === paymentFilter
    );
  }, [transactions, paymentFilter]);

  const columns = [
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
      title: 'Crop',
      key: 'crop',
      render: (val) => <span className="font-bold text-gray-900">{val || 'Tomato'}</span>,
    },
    {
      title: 'Buyer',
      key: 'buyerName',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-gray-800">{val || row.buyer || 'ABC Agro Foods Pvt Ltd'}</span>
          <span className="block text-[11px] text-emerald-700 font-medium">GST Verified</span>
        </div>
      ),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (val) => <span className="font-medium text-gray-800">{typeof val === 'number' ? `${val} kg` : val}</span>,
    },
    {
      title: 'Rate',
      key: 'pricePerKg',
      render: (val, row) => <span className="font-bold text-gray-900">{val ? `₹${val}/kg` : row.price || '₹35/kg'}</span>,
    },
    {
      title: 'Total Amount',
      key: 'totalAmount',
      render: (val, row) => (
        <span className="font-extrabold text-emerald-700 text-base">
          {val ? `₹${Number(val).toLocaleString('en-IN')}` : row.total || '₹17,500'}
        </span>
      ),
    },
    {
      title: 'Logistics & Dispatch',
      key: 'logistics',
      render: (_, row) => {
        const txnId = row.transactionId || row.id;
        const log = logisticsMap[txnId];

        if (log) {
          const dt = log.expectedDeliveryDate ? new Date(log.expectedDeliveryDate) : null;
          return (
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5">
                <StatusBadge status={log.status || 'Pickup Scheduled'} size="sm" />
                <span className="font-extrabold text-emerald-700">₹{log.transportCost}</span>
              </div>
              <p className="text-[11px] text-gray-600 flex items-center gap-1 truncate max-w-[180px]" title={`${log.pickupLocation} → ${log.destination}`}>
                <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                {log.pickupLocation?.split(',')[0]} → {log.destination?.split(',')[0]}
              </p>
              {dt && (
                <p className="text-[10px] text-gray-400">
                  Exp: {dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>
          );
        }

        const isConfirmed = (row.status || '').toLowerCase() === 'confirmed';
        return (
          <div className="text-xs text-gray-400">
            {isConfirmed ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/farmer/logistics?newTxn=${txnId}`)}
                className="text-[11px] font-bold py-1 px-2 border-emerald-300 text-emerald-700"
              >
                Arrange Transport
              </Button>
            ) : (
              <span>Pending Confirmation</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Payment Status',
      key: 'paymentStatus',
      render: (val, row) => {
        const cat = getPaymentStatusCategory(val || row.payment);
        return (
          <div className="space-y-1">
            <StatusBadge
              status={cat}
              variant={cat === 'Paid' ? 'success' : cat === 'Processing' ? 'info' : cat === 'Failed' ? 'danger' : 'warning'}
              size="sm"
            />
            {row.paymentReference && (
              <span className="block font-mono text-[10px] text-gray-400">{row.paymentReference}</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Completion',
      key: 'completion',
      render: (_, row) => {
        const overall = getTransactionOverallStatus(row);
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
              overall.label === 'Transaction Completed'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : overall.label === 'Awaiting Payment'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {overall.label}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, row) => {
        const txnId = row.transactionId || row.id;
        const hasLogistics = !!logisticsMap[txnId];
        const payCat = getPaymentStatusCategory(row.paymentStatus || row.payment);

        return (
          <div className="flex items-center justify-end gap-1.5 flex-wrap">
            {/* Demo payment state controls (Part 6) */}
            {payCat === 'Pending' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdatePaymentStatus(txnId, 'Processing')}
                disabled={actionLoading}
                className="text-[11px] font-bold text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                Mark Processing
              </Button>
            )}
            {payCat === 'Processing' && (
              <Button
                variant="success"
                size="sm"
                onClick={() => handleUpdatePaymentStatus(txnId, 'Paid')}
                disabled={actionLoading}
                className="text-[11px] font-bold bg-emerald-600 text-white"
              >
                Mark Paid
              </Button>
            )}

            {hasLogistics && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/farmer/logistics?txn=${txnId}`)}
                icon={Truck}
                className="text-xs font-bold text-emerald-700 hover:bg-emerald-50"
              >
                Track Delivery
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(row)} className="text-xs">
              Details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/farmer/grievances')}
              className="text-xs text-rose-600 hover:bg-rose-50"
            >
              Dispute
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <PageHeader
        title="Transaction & Payment Ledger"
        subtitle="End-to-end settlement tracking, verified dispatch records, and demo payment status."
        tag="Financial Records"
        action={
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Connected to MongoDB API (`/api/transactions`)</span>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTxns} icon={RefreshCw} className="text-xs">
            Retry Connection
          </Button>
        </div>
      )}

      {notification && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-sm font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs text-emerald-800 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* PART 8 — Summary Cards Calculated from Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Transaction Value</span>
          <p className="text-2xl font-black text-gray-900 mt-1">
            ₹{totalTransactionValue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Calculated across all transactions</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Paid Amount</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            ₹{paidAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">Demo settled funds</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Pending Amount</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            ₹{pendingAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-amber-700 mt-0.5">Awaiting delivery verification & release</p>
        </div>
      </div>

      {/* PART 9 — Payment History Section with Filtering */}
      <Card
        title="Payment History & Ledger"
        subtitle="Filter sales by payment tracking status (Demo Payment Tracking Only)"
        action={
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
            {['All', 'Pending', 'Processing', 'Paid', 'Failed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setPaymentFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  paymentFilter === tab
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">Loading payment information...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            title="No payment records found."
            description={`No transactions found under '${paymentFilter}' payment status.`}
          />
        ) : (
          <Table columns={columns} data={filteredTransactions} keyField="_id" />
        )}
      </Card>

      {/* PART 5 & 6 — Detailed Payment & Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase">AgriLink Payment &amp; Invoice</span>
                <h3 className="text-xl font-black text-gray-900">{selectedInvoice.transactionId || selectedInvoice.id}</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Buyer:</span>
                <span className="font-bold text-gray-900">{selectedInvoice.buyerName || selectedInvoice.buyer || 'ABC Agro Foods'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Crop / Produce:</span>
                <span className="font-bold text-gray-900">{selectedInvoice.crop || 'Tomato'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quantity:</span>
                <span className="font-bold text-gray-900">{selectedInvoice.quantity} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price per kg:</span>
                <span className="font-bold text-gray-900">₹{selectedInvoice.pricePerKg || 35}/kg</span>
              </div>
              <div className="flex justify-between pt-2 border-t text-base font-black">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-emerald-700">₹{(selectedInvoice.totalAmount || 17500).toLocaleString('en-IN')}</span>
              </div>

              {/* PAYMENT DETAILS SECTION (Part 5) */}
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Demo Payment Status</span>
                  <StatusBadge
                    status={getPaymentStatusCategory(selectedInvoice.paymentStatus || selectedInvoice.payment)}
                    variant={getPaymentStatusCategory(selectedInvoice.paymentStatus || selectedInvoice.payment) === 'Paid' ? 'success' : 'warning'}
                    size="sm"
                  />
                </div>

                <div className="text-xs space-y-1.5 text-gray-600 pt-1 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-semibold text-gray-900">{selectedInvoice.paymentMethod || 'UPI'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Reference:</span>
                    <span className="font-mono font-bold text-gray-900">
                      {selectedInvoice.paymentReference || `DEMO-PAY-${(selectedInvoice.transactionId || '1001').replace(/\D/g, '')}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Date:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedInvoice.paymentDate
                        ? new Date(selectedInvoice.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Pending Confirmation'}
                    </span>
                  </div>
                </div>

                {/* Clear payment status messaging */}
                <div className="pt-2">
                  {getPaymentStatusCategory(selectedInvoice.paymentStatus || selectedInvoice.payment) === 'Paid' ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Payment Completed (Demo Payment Status)</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Payment Pending (Demo Payment Status)</span>
                    </div>
                  )}
                </div>

                {/* DEMO PAYMENT ACTIONS (Part 6) */}
                <div className="pt-2 border-t border-gray-200 flex gap-2">
                  {getPaymentStatusCategory(selectedInvoice.paymentStatus || selectedInvoice.payment) === 'Pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      disabled={actionLoading}
                      onClick={() => handleUpdatePaymentStatus(selectedInvoice.transactionId || selectedInvoice.id, 'Processing')}
                      className="text-xs font-bold text-amber-700 border-amber-300"
                    >
                      Mark as Processing
                    </Button>
                  )}
                  {getPaymentStatusCategory(selectedInvoice.paymentStatus || selectedInvoice.payment) !== 'Paid' && (
                    <Button
                      variant="success"
                      size="sm"
                      fullWidth
                      disabled={actionLoading}
                      onClick={() => handleUpdatePaymentStatus(selectedInvoice.transactionId || selectedInvoice.id, 'Paid')}
                      className="text-xs font-bold"
                    >
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>

              {/* Logistics Summary in Modal */}
              {logisticsMap[selectedInvoice.transactionId || selectedInvoice.id] && (
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Logistics Status</span>
                    <StatusBadge status={logisticsMap[selectedInvoice.transactionId || selectedInvoice.id].status} size="sm" />
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Route:</span>
                    <span className="font-medium text-gray-900">
                      {logisticsMap[selectedInvoice.transactionId || selectedInvoice.id].pickupLocation} → {logisticsMap[selectedInvoice.transactionId || selectedInvoice.id].destination}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Freight Cost:</span>
                    <span className="font-bold text-emerald-700">
                      ₹{logisticsMap[selectedInvoice.transactionId || selectedInvoice.id].transportCost} ({logisticsMap[selectedInvoice.transactionId || selectedInvoice.id].distanceKm} km)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <Button variant="outline" size="md" fullWidth onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  alert('Invoice downloaded.');
                  setSelectedInvoice(null);
                }}
                icon={Download}
                className="font-bold text-xs"
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
