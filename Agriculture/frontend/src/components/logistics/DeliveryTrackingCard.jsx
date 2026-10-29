import React from 'react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Navigation,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Package
} from 'lucide-react';

// Ordered delivery milestones
export const DELIVERY_STAGES = [
  { key: 'Pickup Scheduled', label: 'Pickup Scheduled', desc: 'Driver & vehicle assigned for farm pickup' },
  { key: 'Picked Up', label: 'Picked Up', desc: 'Dispatched from farm gate after weighment' },
  { key: 'In Transit', label: 'In Transit', desc: 'On route via state logistics corridor' },
  { key: 'Delivered', label: 'Delivered', desc: 'Safely arrived & received at destination hub' },
];

export const normalizeStage = (status) => {
  if (!status) return 'Pending';
  const lower = status.toLowerCase().replace(/_/g, ' ');
  if (lower === 'pickup scheduled' || lower === 'assigned') return 'Pickup Scheduled';
  if (lower === 'picked up') return 'Picked Up';
  if (lower === 'in transit') return 'In Transit';
  if (lower === 'delivered') return 'Delivered';
  if (lower === 'cancelled') return 'Cancelled';
  return 'Pending';
};

export const getNextAllowedStages = (currentStatus) => {
  const norm = normalizeStage(currentStatus);
  switch (norm) {
    case 'Pending':
      return ['Pickup Scheduled', 'Cancelled'];
    case 'Pickup Scheduled':
      return ['Picked Up', 'Cancelled'];
    case 'Picked Up':
      return ['In Transit', 'Cancelled'];
    case 'In Transit':
      return ['Delivered', 'Cancelled'];
    case 'Delivered':
    case 'Cancelled':
    default:
      return [];
  }
};

export default function DeliveryTrackingCard({
  logistics,
  transaction,
  onUpdateStatus,
  actionLoading = false,
  showFullDetails = true,
}) {
  if (!logistics) return null;

  const statusNorm = normalizeStage(logistics.status);
  const nextStages = getNextAllowedStages(statusNorm);

  // Compute stage index (0 to 3)
  let activeIndex = -1;
  if (statusNorm === 'Pending') activeIndex = -1;
  else if (statusNorm === 'Pickup Scheduled') activeIndex = 0;
  else if (statusNorm === 'Picked Up') activeIndex = 1;
  else if (statusNorm === 'In Transit') activeIndex = 2;
  else if (statusNorm === 'Delivered') activeIndex = 3;

  // Cost per km calculation (Part 12)
  const distance = Number(logistics.distanceKm) || 0;
  const cost = Number(logistics.transportCost) || 0;
  const costPerKm = distance > 0 ? (cost / distance).toFixed(2) : null;

  // Date delayed check (Part 13)
  const deliveryDate = logistics.expectedDeliveryDate ? new Date(logistics.expectedDeliveryDate) : null;
  const isDelayed =
    deliveryDate &&
    new Date() > deliveryDate &&
    statusNorm !== 'Delivered' &&
    statusNorm !== 'Cancelled';

  // Produce info from transaction or defaults
  const crop = transaction?.crop || logistics.crop || 'Tomato';
  const quantity = transaction?.quantity ? `${transaction.quantity} kg` : logistics.quantity || '500 kg';
  const txnId = logistics.transactionId || transaction?.transactionId || 'TXN1001';

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800">
              {txnId}
            </span>
            <StatusBadge status={statusNorm} size="sm" />
            <span className="text-[11px] text-gray-400 font-medium">Logistics Tracking</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            {crop} • {quantity}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Transporter: <strong className="text-gray-800">{logistics.transporter || 'ABC Logistics'}</strong>
          </p>
        </div>

        {/* Delay Warning Badge if delayed */}
        {isDelayed && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Delivery may be delayed.</span>
          </div>
        )}
      </div>

      {/* Origin & Destination Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-100 text-xs sm:text-sm">
        <div>
          <span className="text-gray-400 text-xs block font-medium">Pickup Location</span>
          <p className="font-bold text-gray-900 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            {logistics.pickupLocation}
          </p>
        </div>

        <div>
          <span className="text-gray-400 text-xs block font-medium">Destination Mandi / Hub</span>
          <p className="font-bold text-gray-900 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
            {logistics.destination}
          </p>
        </div>

        <div>
          <span className="text-gray-400 text-xs block font-medium">Estimated Distance</span>
          <p className="font-black text-gray-900 mt-1">
            {distance} km
          </p>
          <span className="text-[10px] text-gray-400 block">Estimated for demo</span>
        </div>

        <div>
          <span className="text-gray-400 text-xs block font-medium">Expected Delivery</span>
          <p className="font-bold text-gray-900 flex items-center gap-1.5 mt-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            {deliveryDate
              ? deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '12 September 2026'}
          </p>
        </div>
      </div>

      {/* Visual Stepper / Progress Tracking (Part 7) */}
      <div className="pt-2 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Delivery Milestone Progress
          </h4>
          <span className="text-xs font-bold text-emerald-700">
            Stage {activeIndex >= 0 ? activeIndex + 1 : 0} of {DELIVERY_STAGES.length}
          </span>
        </div>

        {statusNorm === 'Cancelled' ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>This shipment was cancelled. No further transitions allowed.</span>
          </div>
        ) : (
          <div className="relative">
            {/* Desktop / Tablet Connector Bar */}
            <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-gray-200 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              {DELIVERY_STAGES.map((stage, idx) => {
                const isCompleted = activeIndex > idx;
                const isCurrent = activeIndex === idx;
                const isUpcoming = activeIndex < idx;

                return (
                  <div key={stage.key} className="flex md:flex-col items-center md:items-center text-left md:text-center gap-3.5">
                    {/* Circle Node */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all flex-shrink-0 shadow-sm ${
                        isCompleted
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : isCurrent
                          ? 'bg-emerald-700 text-white ring-4 ring-emerald-200 animate-pulse'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isCurrent ? (
                        <Navigation className="w-4 h-4" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    {/* Stage Details */}
                    <div>
                      <h5
                        className={`text-sm font-bold ${
                          isCurrent
                            ? 'text-emerald-800'
                            : isCompleted
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }`}
                      >
                        {stage.label}
                      </h5>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Part 12: Transport Cost Summary */}
      {showFullDetails && (
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Estimated Freight &amp; Cost Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/70 text-xs sm:text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Estimated Transport Cost</span>
              <span className="text-lg font-black text-emerald-800 mt-0.5 block">
                ₹{cost.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-gray-400">Fixed demonstration rate</span>
            </div>

            <div>
              <span className="text-gray-500 block text-xs">Estimated Transit Distance</span>
              <span className="text-base font-bold text-gray-900 mt-0.5 block">
                {distance} km
              </span>
              <span className="text-[10px] text-gray-400">Highway route calculation</span>
            </div>

            <div>
              <span className="text-gray-500 block text-xs">Estimated Cost per km</span>
              <span className="text-base font-bold text-gray-900 mt-0.5 block">
                {costPerKm ? `₹${costPerKm}/km` : 'N/A'}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">(Estimated rate)</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 italic mt-2">
            * Distance is an estimated value for demonstration. Rates are calculated without live toll or fuel surcharge.
          </p>
        </div>
      )}

      {/* Controlled Status Update Section (Part 5 & Part 6) */}
      {onUpdateStatus && nextStages.length > 0 && (
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/80 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 sm:p-6 rounded-b-3xl">
          <div>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Shipment Status Management
            </span>
            <p className="text-xs text-gray-500">
              Current: <strong className="text-gray-800">{statusNorm}</strong>. Proceed through controlled dispatch order.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {nextStages
              .filter((st) => st !== 'Cancelled')
              .map((nextSt) => (
                <Button
                  key={nextSt}
                  variant="primary"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => onUpdateStatus(nextSt)}
                  icon={ArrowRight}
                  iconPosition="right"
                  className="font-bold text-xs"
                >
                  {actionLoading ? 'Updating...' : `Mark as ${nextSt}`}
                </Button>
              ))}

            {nextStages.includes('Cancelled') && statusNorm !== 'In Transit' && (
              <Button
                variant="ghost"
                size="sm"
                disabled={actionLoading}
                onClick={() => onUpdateStatus('Cancelled')}
                className="text-xs text-rose-600 hover:bg-rose-50"
              >
                Cancel Shipment
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
