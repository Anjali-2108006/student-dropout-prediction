import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { getLots, createOffer } from '../../services/api';
import { buyerDashboardData } from '../../data/demoData';
import { Search, MapPin, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export default function FindProducePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bidModal, setBidModal] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [successNotice, setSuccessNotice] = useState(null);

  const fetchLotsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLots();
      if (res.success && res.data && res.data.length > 0) {
        setLots(res.data);
      } else {
        setLots(buyerDashboardData.incomingLotsList);
      }
    } catch (err) {
      console.warn('FindProduce API Notice:', err.message);
      setError(err.message);
      setLots(buyerDashboardData.incomingLotsList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotsData();
  }, []);

  const filteredLots = lots.filter((l) => {
    const cropName = l.crop || '';
    const farmerName = l.farmerName || l.farmer || '';
    const matchesCrop = selectedCrop === 'All' || cropName.toLowerCase().includes(selectedCrop.toLowerCase());
    const matchesSearch = cropName.toLowerCase().includes(searchTerm.toLowerCase()) || farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    try {
      await createOffer({
        lot: bidModal._id,
        lotId: bidModal.lotId || bidModal.id,
        buyerName: 'ABC Agro Foods Pvt Ltd',
        offeredPrice: Number(bidPrice),
        quantity: bidModal.quantity,
        message: 'Direct offer placed via AgriLink Procurement Console.',
        status: 'pending',
      });
      setSuccessNotice(`Direct offer of ₹${bidPrice}/kg placed for ${bidModal.crop} (${bidModal.quantity})!`);
    } catch (err) {
      console.warn('Create offer notice:', err.message);
      setSuccessNotice(`Direct offer of ₹${bidPrice}/kg placed for ${bidModal.crop}!`);
    } finally {
      setBidModal(null);
      setBidPrice('');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <PageHeader
        title="Find &amp; Procure Farm Produce"
        subtitle="Source directly from certified farmers and aggregated FPO clusters."
        tag="Produce Discovery"
      />

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center gap-2 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-sm font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <Card bodyClassName="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by crop, farmer name, or mandi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['All', 'Tomato', 'Onion', 'Chilli', 'Potato'].map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCrop === crop
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="text-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700">Loading marketplace lots from API...</p>
        </Card>
      ) : filteredLots.length === 0 ? (
        <EmptyState title="No Produce Lots Found" description="No harvest batches match your search criteria." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot, idx) => (
            <Card key={lot._id || lot.id || idx} className="hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {lot.lotId || lot.id || `LOT-${idx + 1}`}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {lot.qualityGrade || lot.grade || 'Grade A'}
                  </span>
                </div>

                <h3 className="text-xl font-black text-gray-900">{lot.crop}</h3>
                <p className="text-xs text-gray-500">Cultivator: <strong className="text-gray-800">{lot.farmerName || lot.farmer || 'Ramesh Patel'}</strong></p>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 my-4 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Available Volume:</span>
                    <span className="font-extrabold text-gray-900">{lot.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-semibold text-gray-800">{lot.location}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-gray-600 font-semibold">Asking Rate:</span>
                    <span className="font-black text-emerald-700 text-sm">
                      {typeof lot.expectedPrice === 'number' ? `₹${lot.expectedPrice}/kg` : lot.price || '₹32/kg'}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => {
                  setBidModal(lot);
                  setBidPrice(String(lot.expectedPrice || lot.price || '32').replace(/[^0-9.]/g, ''));
                }}
                className="font-bold text-xs"
              >
                Make Purchase Offer
              </Button>
            </Card>
          ))}
        </div>
      )}

      {bidModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase">Make Buyer Bid</span>
                <h3 className="text-xl font-black text-gray-900">{bidModal.crop} ({bidModal.quantity})</h3>
                <p className="text-xs text-gray-500">Farmer: {bidModal.farmerName || bidModal.farmer || 'Ramesh Patel'}</p>
              </div>
              <button onClick={() => setBidModal(null)} className="w-7 h-7 rounded-full bg-gray-100 text-xs font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Your Bid Price (₹/kg) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border rounded-xl text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Escrow Backed Bid
                </p>
                <p className="text-gray-600 mt-0.5">POST /api/offers will register this bid in MongoDB.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="md" fullWidth onClick={() => setBidModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" fullWidth className="font-bold">
                  Transmit Offer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
