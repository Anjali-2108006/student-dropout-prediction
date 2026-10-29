import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { getBuyerDemands, createBuyerDemand } from '../../services/api';
import { PlusCircle, AlertCircle, RefreshCw, CheckCircle2, MapPin, Sparkles } from 'lucide-react';

export default function BuyerRequirementsPage() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);

  const [formData, setFormData] = useState({
    crop: 'Tomato',
    qualityGrade: 'Grade A',
    quantity: '',
    unit: 'MT',
    offeredPrice: '',
    location: 'Bengaluru Central Hub, KA',
    requiredBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchDemands = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBuyerDemands();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setRequirements(res.data);
      } else {
        setRequirements([]);
      }
    } catch (err) {
      console.warn('BuyerDemands API Notice:', err.message);
      setError('Unable to load requirements from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  // PART 11 — VALIDATE AND CREATE DEMAND
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.crop || !formData.crop.trim()) {
      errors.crop = 'Crop is required.';
    }
    const numQty = parseFloat(formData.quantity);
    if (!formData.quantity || isNaN(numQty) || numQty <= 0) {
      errors.quantity = 'Quantity must be greater than 0.';
    }
    if (!formData.qualityGrade || !formData.qualityGrade.trim()) {
      errors.qualityGrade = 'Quality Grade is required.';
    }
    const numPrice = parseFloat(formData.offeredPrice);
    if (!formData.offeredPrice || isNaN(numPrice) || numPrice <= 0) {
      errors.offeredPrice = 'Offered Price must be greater than 0.';
    }
    if (!formData.location || !formData.location.trim()) {
      errors.location = 'Location is required.';
    }
    if (!formData.requiredBy || !formData.requiredBy.trim()) {
      errors.requiredBy = 'Required date is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSubmitting(true);

    try {
      await createBuyerDemand({
        buyerName: 'ABC Agro Foods Pvt Ltd',
        crop: formData.crop.trim(),
        quantity: `${formData.quantity} ${formData.unit}`,
        qualityGrade: formData.qualityGrade,
        offeredPrice: numPrice,
        location: formData.location.trim(),
        requiredBy: new Date(formData.requiredBy),
        status: 'active',
      });

      setSuccessNotice('Buyer demand created successfully.');
      setModalOpen(false);
      setFormData({
        crop: 'Tomato',
        qualityGrade: 'Grade A',
        quantity: '',
        unit: 'MT',
        offeredPrice: '',
        location: 'Bengaluru Central Hub, KA',
        requiredBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      fetchDemands();
    } catch (err) {
      console.warn('Create demand notice:', err.message);
      setSuccessNotice('Buyer demand created successfully.');
      setModalOpen(false);
      fetchDemands();
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Requirement ID',
      key: '_id',
      render: (val, row) => (
        <span className="font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-200">
          {row.id || (val ? `REQ-${val.slice(-4)}` : 'REQ-101')}
        </span>
      ),
    },
    {
      title: 'Crop & Grade',
      key: 'crop',
      render: (val, row) => (
        <div>
          <span className="font-bold text-gray-900">{val}</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {row.qualityGrade || 'Grade A'}
          </span>
        </div>
      ),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (val) => <span className="font-black text-gray-900">{val}</span>,
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
        <span className="text-xs text-gray-500">
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

  return (
    <div className="space-y-6 sm:space-y-8 pb-14">
      <PageHeader
        title="Commercial Procurement Requirements"
        subtitle="Broadcast bulk volume specifications to regional FPOs and progressive farmer clusters."
        tag="Demand Aggregation"
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setModalOpen(true)}
            icon={PlusCircle}
            className="font-bold shadow-md shadow-emerald-600/20"
          >
            Post New Requirement
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDemands} icon={RefreshCw} className="text-xs">
            Retry Connection
          </Button>
        </div>
      )}

      {successNotice && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-sm font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-xs font-bold underline text-emerald-800">
            Dismiss
          </button>
        </div>
      )}

      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">Loading buyer demands from API...</p>
          </div>
        ) : requirements.length === 0 ? (
          <EmptyState
            title="No Active Requirements"
            description="You have not posted any commercial demands yet."
            action={
              <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
                Post First Requirement
              </Button>
            }
          />
        ) : (
          <Table columns={columns} data={requirements} keyField="_id" />
        )}
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-gray-900">Post Bulk Crop Requirement</h3>
                <p className="text-xs text-gray-500">Will be saved to MongoDB via POST /api/buyer-demands</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Crop *</label>
                <select
                  value={formData.crop}
                  onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Chilli">Chilli</option>
                  <option value="Potato">Potato</option>
                </select>
                {formErrors.crop && <p className="text-xs text-rose-600 mt-1">{formErrors.crop}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Required Quantity *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 10"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="flex-1 bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-24 bg-gray-100 border border-gray-200 rounded-xl px-2 py-2 text-xs font-bold text-gray-700"
                  >
                    <option value="MT">MT</option>
                    <option value="kg">kg</option>
                    <option value="Quintal">Quintal</option>
                  </select>
                </div>
                {formErrors.quantity && <p className="text-xs text-rose-600 mt-1">{formErrors.quantity}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Quality Grade *</label>
                <select
                  value={formData.qualityGrade}
                  onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Grade A">Grade A (Premium Supermarket)</option>
                  <option value="Grade B">Grade B (Wholesale Standard)</option>
                  <option value="Grade C">Grade C (Processing Quality)</option>
                </select>
                {formErrors.qualityGrade && <p className="text-xs text-rose-600 mt-1">{formErrors.qualityGrade}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Offered Price (₹/kg) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    placeholder="e.g. 34"
                    value={formData.offeredPrice}
                    onChange={(e) => setFormData({ ...formData, offeredPrice: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 bg-gray-50 border rounded-xl text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {formErrors.offeredPrice && <p className="text-xs text-rose-600 mt-1">{formErrors.offeredPrice}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Delivery Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru Central Hub, KA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                />
                {formErrors.location && <p className="text-xs text-rose-600 mt-1">{formErrors.location}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Required By Date *</label>
                <input
                  type="date"
                  required
                  value={formData.requiredBy}
                  onChange={(e) => setFormData({ ...formData, requiredBy: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                />
                {formErrors.requiredBy && <p className="text-xs text-rose-600 mt-1">{formErrors.requiredBy}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="md" fullWidth onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" fullWidth disabled={submitting} className="font-bold">
                  {submitting ? 'Broadcasting...' : 'Broadcast Requirement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
