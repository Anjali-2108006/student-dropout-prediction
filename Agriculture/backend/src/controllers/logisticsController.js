const Logistics = require('../models/Logistics');
const mongoose = require('mongoose');

const fallbackLogistics = [
  {
    _id: '64g000000000000000000001',
    transactionId: 'TXN1001',
    pickupLocation: 'Madanapalle, AP',
    destination: 'Bengaluru APMC, KA',
    distanceKm: 180,
    transportCost: 3500,
    transporter: 'ABC Logistics',
    expectedDeliveryDate: new Date('2026-09-12T10:00:00.000Z'),
    status: 'Pickup Scheduled',
    createdAt: new Date('2026-09-06T10:00:00.000Z'),
  },
  {
    _id: '64g000000000000000000002',
    transactionId: 'TXN1025',
    pickupLocation: 'Madanapalle, AP (Farm Gate)',
    destination: 'Bengaluru, KA (ABC Agro Hub)',
    distanceKm: 85,
    transportCost: 1500,
    transporter: 'AgriExpress Cold Logistics (KA-04-E-4921)',
    expectedDeliveryDate: new Date('2026-09-05T16:30:00.000Z'),
    status: 'In Transit',
    createdAt: new Date('2026-09-04T12:00:00.000Z'),
  },
];

// Helper to normalize status strings
const normalizeStatus = (s) => {
  if (!s) return 'Pending';
  const lower = s.toLowerCase().replace(/_/g, ' ');
  if (lower === 'pickup scheduled' || lower === 'assigned') return 'Pickup Scheduled';
  if (lower === 'picked up') return 'Picked Up';
  if (lower === 'in transit') return 'In Transit';
  if (lower === 'delivered') return 'Delivered';
  if (lower === 'cancelled') return 'Cancelled';
  return 'Pending';
};

// Allowed status transitions (Part 5 & 6)
const ALLOWED_TRANSITIONS = {
  'Pending': ['Pickup Scheduled', 'Cancelled'],
  'Pickup Scheduled': ['Picked Up', 'Cancelled'],
  'Picked Up': ['In Transit', 'Cancelled'],
  'In Transit': ['Delivered', 'Cancelled'],
  'Delivered': [],
  'Cancelled': [],
};

exports.getLogistics = async (req, res, next) => {
  try {
    const { status, transactionId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (transactionId) filter.transactionId = transactionId;

    if (mongoose.connection.readyState === 1) {
      const logs = await Logistics.find(filter).populate('transaction').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: logs.length, data: logs });
    }

    let filtered = [...fallbackLogistics];
    if (status) filtered = filtered.filter((l) => l.status.toLowerCase() === status.toLowerCase());
    if (transactionId) filtered = filtered.filter((l) => l.transactionId === transactionId);

    res.status(200).json({ success: true, count: filtered.length, data: filtered, source: 'offline-fallback' });
  } catch (error) {
    next(error);
  }
};

exports.getLogisticsById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { $or: [{ _id: req.params.id }, { transactionId: req.params.id }] } : { transactionId: req.params.id };

      const item = await Logistics.findOne(query).populate('transaction');
      if (!item) return res.status(404).json({ success: false, message: 'Logistics record not found' });
      return res.status(200).json({ success: true, data: item });
    }

    const item = fallbackLogistics.find((l) => l._id === req.params.id || l.transactionId === req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Logistics record not found' });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.createLogistics = async (req, res, next) => {
  try {
    const {
      transaction,
      transactionId,
      pickupLocation,
      destination,
      distanceKm,
      transportCost,
      transporter,
      expectedDeliveryDate,
      status,
    } = req.body;

    // Field validations (Part 3 & Part 17)
    if (!pickupLocation || !pickupLocation.trim()) {
      return res.status(400).json({ success: false, message: 'Pickup location is required.' });
    }
    if (!destination || !destination.trim()) {
      return res.status(400).json({ success: false, message: 'Destination is required.' });
    }
    const numDistance = Number(distanceKm);
    if (distanceKm === undefined || isNaN(numDistance) || numDistance <= 0) {
      return res.status(400).json({ success: false, message: 'Distance must be greater than 0 km.' });
    }
    const numCost = Number(transportCost);
    if (transportCost === undefined || isNaN(numCost) || numCost < 0) {
      return res.status(400).json({ success: false, message: 'Transport cost must be 0 or greater.' });
    }
    if (!transporter || !transporter.trim()) {
      return res.status(400).json({ success: false, message: 'Transporter is required.' });
    }
    if (!expectedDeliveryDate) {
      return res.status(400).json({ success: false, message: 'Expected delivery date is required.' });
    }

    const assignedStatus = status ? normalizeStatus(status) : 'Pending';

    if (mongoose.connection.readyState === 1) {
      // Prevent duplicate active logistics for same transaction (Part 17)
      if (transactionId) {
        const existing = await Logistics.findOne({
          transactionId,
          status: { $nin: ['Delivered', 'delivered', 'Cancelled', 'cancelled'] },
        });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: `Active logistics already exists for transaction ${transactionId}.`,
          });
        }
      }

      const newLog = await Logistics.create({
        transaction,
        transactionId: transactionId || '',
        pickupLocation: pickupLocation.trim(),
        destination: destination.trim(),
        distanceKm: numDistance,
        transportCost: numCost,
        transporter: transporter.trim(),
        expectedDeliveryDate: new Date(expectedDeliveryDate),
        status: assignedStatus,
      });
      return res.status(201).json({ success: true, data: newLog });
    }

    // Check offline duplicate
    if (transactionId) {
      const existing = fallbackLogistics.find(
        (l) => l.transactionId === transactionId && l.status !== 'Delivered' && l.status !== 'Cancelled'
      );
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Active logistics already exists for transaction ${transactionId}.`,
        });
      }
    }

    const mockLog = {
      _id: `64g${Date.now().toString(16).padStart(21, '0')}`,
      transactionId: transactionId || 'TXN1001',
      pickupLocation: pickupLocation.trim(),
      destination: destination.trim(),
      distanceKm: numDistance,
      transportCost: numCost,
      transporter: transporter.trim(),
      expectedDeliveryDate: new Date(expectedDeliveryDate),
      status: assignedStatus,
      createdAt: new Date(),
    };
    fallbackLogistics.unshift(mockLog);

    res.status(201).json({ success: true, data: mockLog });
  } catch (error) {
    next(error);
  }
};

exports.updateLogistics = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { $or: [{ _id: req.params.id }, { transactionId: req.params.id }] } : { transactionId: req.params.id };

      const current = await Logistics.findOne(query);
      if (!current) return res.status(404).json({ success: false, message: 'Logistics record not found' });

      if (status) {
        const currentNorm = normalizeStatus(current.status);
        const targetNorm = normalizeStatus(status);

        if (currentNorm === 'Delivered' && targetNorm !== 'Delivered') {
          return res.status(400).json({ success: false, message: 'Cannot change status of an already Delivered shipment.' });
        }
        if (currentNorm === 'Cancelled' && targetNorm !== 'Cancelled') {
          return res.status(400).json({ success: false, message: 'Cannot update a Cancelled shipment.' });
        }

        const allowedNext = ALLOWED_TRANSITIONS[currentNorm] || [];
        if (!allowedNext.includes(targetNorm) && targetNorm !== currentNorm) {
          return res.status(400).json({
            success: false,
            message: `Invalid transition from '${currentNorm}' to '${targetNorm}'. Allowed transitions: ${allowedNext.join(', ')}`,
          });
        }
        req.body.status = targetNorm;
      }

      const updated = await Logistics.findOneAndUpdate(query, req.body, { new: true, runValidators: true });
      return res.status(200).json({ success: true, data: updated, message: 'Delivery status updated successfully.' });
    }

    const idx = fallbackLogistics.findIndex((l) => l._id === req.params.id || l.transactionId === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Logistics record not found' });

    if (status) {
      const currentNorm = normalizeStatus(fallbackLogistics[idx].status);
      const targetNorm = normalizeStatus(status);

      if (currentNorm === 'Delivered' && targetNorm !== 'Delivered') {
        return res.status(400).json({ success: false, message: 'Cannot change status of an already Delivered shipment.' });
      }
      if (currentNorm === 'Cancelled' && targetNorm !== 'Cancelled') {
        return res.status(400).json({ success: false, message: 'Cannot update a Cancelled shipment.' });
      }

      const allowedNext = ALLOWED_TRANSITIONS[currentNorm] || [];
      if (!allowedNext.includes(targetNorm) && targetNorm !== currentNorm) {
        return res.status(400).json({
          success: false,
          message: `Invalid transition from '${currentNorm}' to '${targetNorm}'. Allowed transitions: ${allowedNext.join(', ')}`,
        });
      }
      req.body.status = targetNorm;
    }

    fallbackLogistics[idx] = { ...fallbackLogistics[idx], ...req.body };
    res.status(200).json({ success: true, data: fallbackLogistics[idx], message: 'Delivery status updated successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteLogistics = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { $or: [{ _id: req.params.id }, { transactionId: req.params.id }] } : { transactionId: req.params.id };

      const deleted = await Logistics.findOneAndDelete(query);
      if (!deleted) return res.status(404).json({ success: false, message: 'Logistics record not found' });
      return res.status(200).json({ success: true, message: 'Logistics record deleted' });
    }

    return res.status(200).json({ success: true, message: 'Logistics record deleted' });
  } catch (error) {
    next(error);
  }
};
