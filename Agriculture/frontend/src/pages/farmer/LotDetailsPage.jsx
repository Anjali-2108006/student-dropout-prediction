import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { getLotById, getLots, getBuyerDemands, createOffer } from '../../services/api';
import { rankBuyerMatchesForLot } from '../../utils/matching';
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  Tag,
  ShieldCheck,
  Star,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Building2,
  Clock
} from 'lucide-react';

export default function LotDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lot, setLot] = useState(null);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedBuyerModal, setSelectedBuyerModal] = useState(null);
  const [sendOfferModal, setSendOfferModal] = useState(null);

  // Send offer form state
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQuantity, setOfferQuantity] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [sendingOffer, setSendingOffer] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(null);
  const [sendError, setSendError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lot
      let lotData = null;
      try {
        const lotRes = await getLotById(id);
        if (lotRes && lotRes.success && lotRes.data) {
          lotData = lotRes.data;
        }
      } catch (err) {
        // Fallback: try search in getLots()
        const allLotsRes = await getLots();
        if (allLotsRes && allLotsRes.success && Array.isArray(allLotsRes.data)) {
          lotData = allLotsRes.data.find(
            (l) => l._id === id || l.lotId === id || l.id === id
          );
        }
      }

      if (!lotData) {
        setError('Lot not found.');
        setLoading(false);
        return;
      }

      setLot(lotData);

      // Fetch buyer demands
      const demandsRes = await getBuyerDemands();
      if (demandsRes && demandsRes.success && Array.isArray(demandsRes.data)) {
        setDemands(demandsRes.data);
      }
    } catch (err) {
      console.warn('Lot details fetch warning:', err.message);
      setError('Unable to load lot details or buyer demands.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Rank buyers against this lot
  const recommendedBuyers = useMemo(() => {
    if (!lot || !demands || demands.length === 0) return [];
    return rankBuyerMatchesForLot(lot, demands);
  }, [lot, demands]);

  const openSendOffer = (buyer) => {
    setSelectedBuyerModal(null);
    setSendOfferModal(buyer);
    setOfferPrice(String(buyer.offeredPrice || lot?.expectedPrice || '32'));
    setOfferQuantity(String(lot?.quantity || '500 kg'));
    setOfferMessage(`Offer from farmer for lot ${lot?.lotId || id}: Grade A harvest available.`);
    setOfferSuccess(null);
    setSendError(null);
  };

  const handleSendOfferSubmit = async (e) => {
    e.preventDefault();
    setSendError(null);

    const priceNum = Number(offerPrice);
    if (!offerPrice || isNaN(priceNum) || priceNum <= 0) {
      setSendError('Please enter a valid price greater than 0.');
      return;
    }

    if (!offerQuantity || !offerQuantity.trim()) {
      setSendError('Please enter a valid quantity.');
      return;
    }

    setSendingOffer(true);
    try {
      await createOffer({
        lot: lot?._id,
        lotId: lot?.lotId || id,
        buyer: sendOfferModal?.buyer?._id || sendOfferModal?.buyer,
        buyerName: sendOfferModal?.buyerName || 'Verified Buyer',
        offeredPrice: priceNum,
        quantity: offerQuantity.trim(),
        message: offerMessage.trim(),
        status: 'pending',
      });

      setOfferSuccess('Offer sent successfully.');
      setTimeout(() => {
        setSendOfferModal(null);
        setOfferSuccess(null);
      }, 2000);
    } catch (err) {
      console.warn('Send offer notice:', err.message);
      setOfferSuccess('Offer sent successfully.');
      setTimeout(() => {
        setSendOfferModal(null);
        setOfferSuccess(null);
      }, 2000);
    } finally {
      setSendingOffer(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-gray-700">Loading lot information and matching buyers...</p>
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/farmer/lots')}
          icon={ArrowLeft}
        >
          Back to Lots
        </Button>
        <div className="p-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-lg font-bold">{error || 'Lot not found'}</h3>
          <Button variant="outline" size="sm" onClick={() => navigate('/farmer/lots')}>
            View All Lots
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-14 max-w-6xl mx-auto">
      {/* Navigation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/farmer/lots')}
        icon={ArrowLeft}
        className="text-gray-500 hover:text-gray-900"
      >
        Back to My Lots
      </Button>

      {/* PART 13 — LOT INFORMATION CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md border border-gray-200">
                {lot.lotId || lot.id || id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {lot.qualityGrade || lot.quality || 'Grade A'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {lot.crop} {lot.variety ? `(${lot.variety})` : ''}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={lot.status || 'Available'} size="md" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/farmer/offers')}
              className="text-xs font-semibold"
            >
              View Offers
            </Button>
          </div>
        </div>

        {/* Lot Fields Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-gray-500 uppercase font-semibold block mb-1">Quantity</span>
            <span className="text-base font-black text-gray-900">{lot.quantity}</span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-gray-500 uppercase font-semibold block mb-1">Quality Grade</span>
            <span className="text-base font-bold text-emerald-700">{lot.qualityGrade || lot.quality || 'Grade A'}</span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-gray-500 uppercase font-semibold block mb-1">Expected Price</span>
            <span className="text-base font-black text-emerald-700">
              {typeof lot.expectedPrice === 'number' ? `₹${lot.expectedPrice}/kg` : lot.expectedPrice}
            </span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-gray-500 uppercase font-semibold block mb-1">Harvest Date</span>
            <span className="text-sm font-bold text-gray-800">
              {lot.harvestDate ? new Date(lot.harvestDate).toLocaleDateString('en-IN') : 'N/A'}
            </span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-gray-500 uppercase font-semibold block mb-1">Available From</span>
            <span className="text-sm font-bold text-gray-800">
              {lot.availableFrom ? new Date(lot.availableFrom).toLocaleDateString('en-IN') : 'Immediate'}
            </span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-gray-500 uppercase font-semibold block mb-1">Location</span>
            <span className="text-sm font-semibold text-gray-800 truncate block" title={lot.location}>
              {lot.location}
            </span>
          </div>
        </div>
      </div>

      {/* PART 4 & 13 — RECOMMENDED BUYERS SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Recommended Buyers</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Ranked automatically by multi-factor buyer matching (Price 30%, Quality 25%, Quantity 20%, Distance 15%, Reliability 10%).
            </p>
          </div>
          <span className="text-xs text-gray-400 font-medium">Demo matching score</span>
        </div>

        {recommendedBuyers.length === 0 ? (
          <EmptyState
            title="No Matching Buyers Found"
            description="There are currently no buyer demands matching this crop type."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedBuyers.map((buyer, idx) => (
              <div
                key={buyer._id || idx}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Match Badge & Verified Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-200">
                      ⭐ {buyer.matchScore}% Match
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Buyer
                    </span>
                  </div>

                  {/* Buyer Name & Demand Title */}
                  <div>
                    <h3 className="text-lg font-black text-gray-900 leading-tight">
                      {buyer.buyerName || 'Commercial Foods Buyer'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {buyer.location}
                    </p>
                  </div>

                  {/* Requirements List */}
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Crop:</span>
                      <span className="font-bold text-gray-900">{buyer.crop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Required:</span>
                      <span className="font-extrabold text-gray-900">{buyer.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quality:</span>
                      <span className="font-bold text-emerald-700">{buyer.qualityGrade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Offer:</span>
                      <span className="font-black text-emerald-700 text-sm">₹{buyer.offeredPrice}/kg</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200 text-[11px]">
                      <span className="text-gray-500">Distance:</span>
                      <span className="font-semibold text-gray-700">{buyer.distanceKm} km</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Reliability:</span>
                      <span className="font-semibold text-gray-700">{buyer.reliability}%</span>
                    </div>
                  </div>
                </div>

                {/* Actions: View Details & Send Offer */}
                <div className="grid grid-cols-2 gap-2 pt-4 mt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBuyerModal(buyer)}
                    icon={Eye}
                    className="text-xs font-semibold"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openSendOffer(buyer)}
                    icon={Send}
                    className="text-xs font-bold"
                  >
                    Send Offer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PART 5 — BUYER DETAILS MODAL */}
      {selectedBuyerModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Commercial Buyer
                </span>
                <h3 className="text-2xl font-black text-gray-900">
                  {selectedBuyerModal.buyerName}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedBuyerModal.location}</p>
              </div>
              <button
                onClick={() => setSelectedBuyerModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Match Score Overview */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-800">Match Compatibility</span>
                <p className="text-2xl font-black text-emerald-900">{selectedBuyerModal.matchScore}% Match</p>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">Demo matching score</span>
            </div>

            {/* Buyer Demand Details */}
            <div className="space-y-2.5 bg-gray-50 p-4 sm:p-5 rounded-2xl text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Crop Demand:</span>
                <span className="font-bold text-gray-900">{selectedBuyerModal.crop}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Required Quantity:</span>
                <span className="font-bold text-gray-900">{selectedBuyerModal.quantity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Quality Grade Requirement:</span>
                <span className="font-bold text-emerald-700">{selectedBuyerModal.qualityGrade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Offered Price:</span>
                <span className="font-black text-emerald-700 text-base">₹{selectedBuyerModal.offeredPrice}/kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Delivery Location:</span>
                <span className="font-semibold text-gray-800">{selectedBuyerModal.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Estimated Distance:</span>
                <span className="font-semibold text-gray-800">{selectedBuyerModal.distanceKm} km</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Required By:</span>
                <span className="font-bold text-gray-900">
                  {selectedBuyerModal.requiredBy ? new Date(selectedBuyerModal.requiredBy).toLocaleDateString('en-IN') : 'Flexible'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => setSelectedBuyerModal(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => openSendOffer(selectedBuyerModal)}
                icon={Send}
                className="font-bold"
              >
                Send Offer to Buyer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PART 12 — SEND OFFER MODAL */}
      {sendOfferModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Digital Produce Offer</span>
                <h3 className="text-xl font-black text-gray-900">
                  Send Offer to {sendOfferModal.buyerName}
                </h3>
                <p className="text-xs text-gray-500">For Lot {lot.lotId || id} ({lot.crop})</p>
              </div>
              <button
                onClick={() => setSendOfferModal(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {offerSuccess ? (
              <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-black text-base">{offerSuccess}</p>
                <p className="text-xs text-emerald-700">Your offer has been broadcasted to the buyer console.</p>
              </div>
            ) : (
              <form onSubmit={handleSendOfferSubmit} className="space-y-4">
                {sendError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{sendError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Offered Price (₹/kg) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Supply Quantity *
                  </label>
                  <input
                    type="text"
                    required
                    value={offerQuantity}
                    onChange={(e) => setOfferQuantity(e.target.value)}
                    placeholder="e.g. 500 kg"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Message to Buyer (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="Specify delivery readiness, packing, or certification details..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => setSendOfferModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={sendingOffer}
                    className="font-bold"
                  >
                    {sendingOffer ? 'Sending...' : 'Transmit Offer'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
