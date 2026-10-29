import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import DeliveryTrackingCard, { normalizeStage, getNextAllowedStages } from '../../components/logistics/DeliveryTrackingCard';
import {
  getLogistics,
  createLogistics,
  updateLogistics,
  getTransactions,
} from '../../services/api';
import {
  Truck,
  MapPin,
  Calendar,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  Navigation,
  Eye,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Package,
  Search,
  Filter
} from 'lucide-react';

export default function LogisticsPage() {
  const [searchParams] = useSearchParams();
  const initialTxnFilter = searchParams.get('txn');
  const arrangeTxnParam = searchParams.get('newTxn');

  // Core States
  const [logisticsList, setLogisticsList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedLogistics, setSelectedLogistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Active', 'Delivered'
  const [actionLoading, setActionLoading] = useState(false);

  // Arrange Transport Modal State (Part 3)
  const [isArrangeModalOpen, setIsArrangeModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [transportForm, setTransportForm] = useState({
    transactionId: '',
    pickupLocation: 'Madanapalle, AP (Farm Gate)',
    destination: 'Bengaluru APMC, KA',
    distanceKm: '180',
    transportCost: '3500',
    transporter: 'ABC Logistics',
    expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Fetch Logistics and Confirmed Transactions
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [logisticsRes, txnsRes] = await Promise.allSettled([
        getLogistics(),
        getTransactions(),
      ]);

      let logs = [];
      let txns = [];

      if (logisticsRes.status === 'fulfilled' && logisticsRes.value?.success && Array.isArray(logisticsRes.value.data)) {
        logs = logisticsRes.value.data;
      }

      if (txnsRes.status === 'fulfilled' && txnsRes.value?.success && Array.isArray(txnsRes.value.data)) {
        txns = txnsRes.value.data;
      }

      setLogisticsList(logs);
      setTransactions(txns);

      // Auto-select based on URL query or first active shipment
      if (initialTxnFilter) {
        const matched = logs.find((l) => l.transactionId === initialTxnFilter);
        if (matched) setSelectedLogistics(matched);
        else if (logs.length > 0) setSelectedLogistics(logs[0]);
      } else if (logs.length > 0 && !selectedLogistics) {
        setSelectedLogistics(logs[0]);
      }

      // Check if newTxn param was provided to open arrange modal
      if (arrangeTxnParam) {
        setTransportForm((prev) => ({
          ...prev,
          transactionId: arrangeTxnParam,
        }));
        setIsArrangeModalOpen(true);
      }
    } catch (err) {
      console.warn('Logistics page fetch error:', err.message);
      setError('Unable to load delivery information. Please make sure the AgriLink server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter confirmed transactions eligible for transport (Part 3 & Part 17)
  const eligibleTransactions = useMemo(() => {
    const activeLogisticsTxnIds = new Set(
      logisticsList
        .filter((l) => normalizeStage(l.status) !== 'Delivered' && normalizeStage(l.status) !== 'Cancelled')
        .map((l) => l.transactionId)
    );

    return transactions.filter((t) => {
      const isConfirmed = (t.status || '').toLowerCase() === 'confirmed' || (t.status || '').toLowerCase() === 'delivered';
      return isConfirmed && !activeLogisticsTxnIds.has(t.transactionId);
    });
  }, [transactions, logisticsList]);

  // Tab filtered logistics
  const filteredLogistics = useMemo(() => {
    if (activeTab === 'Active') {
      return logisticsList.filter((l) => {
        const st = normalizeStage(l.status);
        return st !== 'Delivered' && st !== 'Cancelled';
      });
    }
    if (activeTab === 'Delivered') {
      return logisticsList.filter((l) => normalizeStage(l.status) === 'Delivered');
    }
    return logisticsList;
  }, [logisticsList, activeTab]);

  // Handle Controlled Status Update (Part 5 & Part 6)
  const handleStatusUpdate = async (logisticsId, targetStatus) => {
    try {
      setActionLoading(true);
      setSuccessMessage(null);
      setError(null);

      const res = await updateLogistics(logisticsId, { status: targetStatus });
      if (res.success) {
        setSuccessMessage('Delivery status updated successfully.');
        // Update local state
        setLogisticsList((prev) =>
          prev.map((item) => (item._id === logisticsId || item.transactionId === logisticsId ? res.data : item))
        );
        if (selectedLogistics && (selectedLogistics._id === logisticsId || selectedLogistics.transactionId === logisticsId)) {
          setSelectedLogistics(res.data);
        }
      } else {
        setError(res.message || 'Failed to update status');
      }
    } catch (err) {
      console.warn('Status update error:', err.message);
      setError(err.message || 'Failed to update delivery status');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Arrange Transport Form Submit (Part 3 & Part 4)
  const handleArrangeSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!transportForm.transactionId || !transportForm.transactionId.trim()) {
      errors.transactionId = 'Please select or enter a Transaction ID.';
    }
    if (!transportForm.pickupLocation || !transportForm.pickupLocation.trim()) {
      errors.pickupLocation = 'Pickup location is required.';
    }
    if (!transportForm.destination || !transportForm.destination.trim()) {
      errors.destination = 'Destination is required.';
    }
    const numDist = parseFloat(transportForm.distanceKm);
    if (!transportForm.distanceKm || isNaN(numDist) || numDist <= 0) {
      errors.distanceKm = 'Distance must be greater than 0.';
    }
    const numCost = parseFloat(transportForm.transportCost);
    if (!transportForm.transportCost || isNaN(numCost) || numCost < 0) {
      errors.transportCost = 'Transport cost must be 0 or greater.';
    }
    if (!transportForm.transporter || !transportForm.transporter.trim()) {
      errors.transporter = 'Transporter is required.';
    }
    if (!transportForm.expectedDeliveryDate || !transportForm.expectedDeliveryDate.trim()) {
      errors.expectedDeliveryDate = 'Expected delivery date is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setActionLoading(true);

    try {
      const payload = {
        transactionId: transportForm.transactionId.trim(),
        pickupLocation: transportForm.pickupLocation.trim(),
        destination: transportForm.destination.trim(),
        distanceKm: numDist,
        transportCost: numCost,
        transporter: transportForm.transporter.trim(),
        expectedDeliveryDate: new Date(transportForm.expectedDeliveryDate),
        status: 'Pending',
      };

      const res = await createLogistics(payload);
      if (res.success) {
        setSuccessMessage('Logistics scheduled successfully.');
        setIsArrangeModalOpen(false);
        // Refresh list
        fetchAllData();
        setSelectedLogistics(res.data);
      } else {
        setError(res.message || 'Unable to schedule logistics.');
      }
    } catch (err) {
      console.warn('Arrange logistics error:', err.message);
      setError(err.message || 'Unable to create logistics.');
    } finally {
      setActionLoading(false);
    }
  };

  // Table Columns (Part 2)
  const tableColumns = [
    {
      title: 'Transaction ID',
      key: 'transactionId',
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded">
            {val || 'TXN1001'}
          </span>
          {row.crop && <span className="block text-xs text-gray-500 font-semibold mt-0.5">{row.crop}</span>}
        </div>
      ),
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
      title: 'Distance',
      key: 'distanceKm',
      render: (val) => <span className="font-bold text-gray-900 text-xs">{val} km</span>,
    },
    {
      title: 'Transport Cost',
      key: 'transportCost',
      render: (val) => (
        <div>
          <span className="font-black text-emerald-700 text-xs">
            {typeof val === 'number' ? `₹${val.toLocaleString('en-IN')}` : val}
          </span>
          <span className="block text-[10px] text-gray-400">Est.</span>
        </div>
      ),
    },
    {
      title: 'Transporter',
      key: 'transporter',
      render: (val) => <span className="text-xs font-semibold text-gray-800">{val || 'ABC Logistics'}</span>,
    },
    {
      title: 'Expected Delivery Date',
      key: 'expectedDeliveryDate',
      render: (val, row) => {
        const dt = val ? new Date(val) : null;
        const norm = normalizeStage(row.status);
        const isPast = dt && new Date() > dt && norm !== 'Delivered' && norm !== 'Cancelled';

        return (
          <div>
            <span className="text-xs text-gray-700 font-medium block">
              {dt ? dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '12 Sep 2026'}
            </span>
            {isPast && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 w-max mt-0.5">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Delayed
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={normalizeStage(val)} size="sm" />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedLogistics(row)}
            icon={Eye}
            className="text-xs font-semibold"
          >
            Track
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Farm-Gate Logistics & Delivery Tracking"
        subtitle="Schedule verified cold-chain dispatch, track shipment milestones, and manage delivery status."
        tag="Logistics Management"
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setTransportForm({
                  transactionId: eligibleTransactions[0]?.transactionId || 'TXN1001',
                  pickupLocation: 'Madanapalle, AP (Farm Gate)',
                  destination: 'Bengaluru APMC, KA',
                  distanceKm: '180',
                  transportCost: '3500',
                  transporter: 'ABC Logistics',
                  expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                });
                setIsArrangeModalOpen(true);
              }}
              icon={PlusCircle}
              className="font-bold shadow-md shadow-emerald-700/20"
            >
              Arrange Transport
            </Button>
          </div>
        }
      />

      {/* Global Alerts */}
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAllData} icon={RefreshCw} className="text-xs">
            Retry Connection
          </Button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-sm font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-bold underline text-emerald-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State (Part 15) */}
      {loading ? (
        <Card className="text-center py-16">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700">Loading delivery information...</p>
          <p className="text-xs text-gray-400 mt-1">Connecting to AgriLink Logistics API (`GET /api/logistics`)</p>
        </Card>
      ) : logisticsList.length === 0 ? (
        /* Empty State (Part 14) */
        <EmptyState
          title="No active deliveries."
          description="You do not have any active shipments or delivery tracking records at this moment."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsArrangeModalOpen(true)}
              icon={PlusCircle}
            >
              Arrange Transport
            </Button>
          }
        />
      ) : (
        <>
          {/* Selected Shipment Detailed Visual Tracking Card (Part 7, 11, 12, 13) */}
          {selectedLogistics && (
            <DeliveryTrackingCard
              logistics={selectedLogistics}
              transaction={transactions.find((t) => t.transactionId === selectedLogistics.transactionId)}
              onUpdateStatus={(targetStatus) =>
                handleStatusUpdate(selectedLogistics._id || selectedLogistics.transactionId, targetStatus)
              }
              actionLoading={actionLoading}
              showFullDetails={true}
            />
          )}

          {/* All Shipments Table Section */}
          <Card
            title="All Shipment Dispatches"
            subtitle="Real-time status of all confirmed transaction shipments connected to MongoDB (`GET /api/logistics`)"
            action={
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                {['All', 'Active', 'Delivered'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            }
          >
            <Table
              columns={tableColumns}
              data={filteredLogistics}
              keyField="_id"
              emptyMessage="No shipments found in this category."
            />
          </Card>
        </>
      )}

      {/* ARRANGE TRANSPORT MODAL (Part 3 & Part 4) */}
      {isArrangeModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  AgriLink Dispatch Service
                </span>
                <h3 className="text-2xl font-black text-gray-900">Arrange Transport</h3>
                <p className="text-xs text-gray-500">Create logistics for a confirmed transaction.</p>
              </div>
              <button
                onClick={() => setIsArrangeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleArrangeSubmit} className="space-y-4" noValidate>
              {/* Transaction Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Confirmed Transaction *
                </label>
                {eligibleTransactions.length > 0 ? (
                  <select
                    value={transportForm.transactionId}
                    onChange={(e) => {
                      const selTxn = eligibleTransactions.find((t) => t.transactionId === e.target.value);
                      setTransportForm({
                        ...transportForm,
                        transactionId: e.target.value,
                        destination: selTxn?.buyerName ? `${selTxn.buyerName} Hub` : transportForm.destination,
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Select Confirmed Transaction --</option>
                    {eligibleTransactions.map((txn) => (
                      <option key={txn.transactionId} value={txn.transactionId}>
                        {txn.transactionId} — {txn.crop} ({txn.quantity} kg) • {txn.buyerName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. TXN1001"
                    value={transportForm.transactionId}
                    onChange={(e) => setTransportForm({ ...transportForm, transactionId: e.target.value })}
                    className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 ${
                      formErrors.transactionId ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'
                    }`}
                  />
                )}
                {formErrors.transactionId && <p className="text-xs text-rose-600 mt-1">{formErrors.transactionId}</p>}
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madanapalle, AP"
                  value={transportForm.pickupLocation}
                  onChange={(e) => setTransportForm({ ...transportForm, pickupLocation: e.target.value })}
                  className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 ${
                    formErrors.pickupLocation ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'
                  }`}
                />
                {formErrors.pickupLocation && <p className="text-xs text-rose-600 mt-1">{formErrors.pickupLocation}</p>}
              </div>

              {/* Destination */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Destination Mandi / Hub *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru APMC, KA"
                  value={transportForm.destination}
                  onChange={(e) => setTransportForm({ ...transportForm, destination: e.target.value })}
                  className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 ${
                    formErrors.destination ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'
                  }`}
                />
                {formErrors.destination && <p className="text-xs text-rose-600 mt-1">{formErrors.destination}</p>}
              </div>

              {/* Distance (km) & Transport Cost (Part 4) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Distance (km) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="180"
                    value={transportForm.distanceKm}
                    onChange={(e) => setTransportForm({ ...transportForm, distanceKm: e.target.value })}
                    className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 ${
                      formErrors.distanceKm ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'
                    }`}
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">Distance is an estimated value for demonstration.</p>
                  {formErrors.distanceKm && <p className="text-xs text-rose-600 mt-1">{formErrors.distanceKm}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Estimated Transport Cost (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="3500"
                      value={transportForm.transportCost}
                      onChange={(e) => setTransportForm({ ...transportForm, transportCost: e.target.value })}
                      className={`w-full pl-7 pr-3 py-2 bg-gray-50 border rounded-xl text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 ${
                        formErrors.transportCost ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">Estimated Transport Cost</p>
                  {formErrors.transportCost && <p className="text-xs text-rose-600 mt-1">{formErrors.transportCost}</p>}
                </div>
              </div>

              {/* Transporter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Transporter *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Logistics"
                  value={transportForm.transporter}
                  onChange={(e) => setTransportForm({ ...transportForm, transporter: e.target.value })}
                  className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 ${
                    formErrors.transporter ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'
                  }`}
                />
                {formErrors.transporter && <p className="text-xs text-rose-600 mt-1">{formErrors.transporter}</p>}
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Expected Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  value={transportForm.expectedDeliveryDate}
                  onChange={(e) => setTransportForm({ ...transportForm, expectedDeliveryDate: e.target.value })}
                  className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 ${
                    formErrors.expectedDeliveryDate ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'
                  }`}
                />
                {formErrors.expectedDeliveryDate && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.expectedDeliveryDate}</p>
                )}
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => setIsArrangeModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={actionLoading}
                  className="font-bold"
                >
                  {actionLoading ? 'Scheduling...' : 'Confirm & Schedule Transport'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
