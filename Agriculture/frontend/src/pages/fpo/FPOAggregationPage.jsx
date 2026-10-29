import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { fpoDashboardData } from '../../data/demoData';
import { PlusCircle, Boxes, CheckCircle2, Handshake } from 'lucide-react';

export default function FPOAggregationPage() {
  const [lots, setLots] = useState(fpoDashboardData.recentAggregatedLots);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    crop: 'Tomato Sahu',
    totalQty: '',
    farmersCount: '',
    targetPrice: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLot = {
      lotId: `FPO-LOT-${Math.floor(20 + Math.random() * 80)}`,
      crop: formData.crop,
      totalQty: `${formData.totalQty} MT`,
      farmersCount: Number(formData.farmersCount),
      targetPrice: `₹${formData.targetPrice}/kg`,
      offers: 1,
      status: 'Under Auction',
    };
    setLots([newLot, ...lots]);
    setModalOpen(false);
  };

  const columns = [
    {
      title: 'Lot ID',
      key: 'lotId',
      render: (val) => <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded">{val}</span>,
    },
    {
      title: 'Commodity',
      key: 'crop',
      render: (val) => <span className="font-bold text-gray-900">{val}</span>,
    },
    {
      title: 'Consolidated Quantity',
      key: 'totalQty',
      render: (val) => <span className="font-extrabold text-emerald-800">{val}</span>,
    },
    {
      title: 'Contributing Farmers',
      key: 'farmersCount',
      render: (val) => <span className="text-xs text-gray-700">{val} Farmers</span>,
    },
    {
      title: 'Target Price',
      key: 'targetPrice',
      render: (val) => <span className="font-black text-gray-900">{val}</span>,
    },
    {
      title: 'Buyer Bids',
      key: 'offers',
      render: (val) => (
        <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
          {val} Offers
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <PageHeader
        title="Produce Aggregation &amp; Bulk Auction"
        subtitle="Combine smallholder produce into standardized, graded truckload batches for institutional buyers."
        tag="Collective Bargaining"
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setModalOpen(true)}
            icon={PlusCircle}
            className="font-bold"
          >
            Aggregate New Batch
          </Button>
        }
      />

      <Card>
        <Table columns={columns} data={lots} keyField="lotId" />
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-gray-900">Create Aggregated Batch</h3>
                <p className="text-xs text-gray-500">Pooling member harvest into a unified trade lot.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-7 h-7 rounded-full bg-gray-100 text-xs font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Crop</label>
                <select
                  value={formData.crop}
                  onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm font-semibold"
                >
                  <option value="Tomato Sahu">Tomato (Sahu Hybrid)</option>
                  <option value="Red Guntur Chili">Red Guntur Chili</option>
                  <option value="Nashik Red Onion">Nashik Red Onion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Total Weight (MT)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15"
                  value={formData.totalQty}
                  onChange={(e) => setFormData({ ...formData, totalQty: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Contributing Farmers Count</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 18"
                  value={formData.farmersCount}
                  onChange={(e) => setFormData({ ...formData, farmersCount: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Target Price (₹/kg)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 34"
                  value={formData.targetPrice}
                  onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="md" fullWidth onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" fullWidth className="font-bold">
                  Publish Batch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
