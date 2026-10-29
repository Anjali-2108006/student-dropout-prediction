const Grievance = require('../models/Grievance');
const mongoose = require('mongoose');

function normalizeStatus(status) {
  if (!status) return 'Open';
  const s = status.toString().trim().toLowerCase().replace(/_/g, ' ');
  if (s === 'open' || s === 'pending') return 'Open';
  if (s === 'under review') return 'Under Review';
  if (s === 'resolved') return 'Resolved';
  if (s === 'rejected') return 'Rejected';
  if (s === 'closed') return 'Closed';
  return status;
}

function normalizeIssueType(type) {
  if (!type) return 'Other';
  const t = type.toString().trim().toLowerCase().replace(/_/g, ' ');
  if (t === 'payment not received' || t === 'payment delay') return 'Payment Not Received';
  if (t === 'quantity mismatch' || t === 'quantity dispute') return 'Quantity Mismatch';
  if (t === 'quality dispute') return 'Quality Dispute';
  if (t === 'delivery delay' || t === 'transport issue') return 'Delivery Delay';
  if (t === 'damaged goods') return 'Damaged Goods';
  if (t === 'incorrect price') return 'Incorrect Price';
  if (t === 'other') return 'Other';
  return type;
}

const ALLOWED_GRIEVANCE_TRANSITIONS = {
  'Open': ['Under Review', 'Rejected'],
  'Under Review': ['Resolved', 'Rejected'],
  'Resolved': ['Closed'],
  'Rejected': ['Closed'],
  'Closed': [], // No transitions from Closed
};

const fallbackGrievances = [
  {
    _id: '64h000000000000000000001',
    grievanceId: 'GRV1001',
    transactionRef: 'TXN1001',
    complainantName: 'Ramesh Patel',
    againstEntity: 'ABC Agro Foods Pvt Ltd',
    issueType: 'Payment Not Received',
    description: 'Produce delivered 18 hours ago but payment is still pending.',
    status: 'Under Review',
    resolution: '',
    createdAt: new Date('2026-09-04'),
  },
  {
    _id: '64h000000000000000000002',
    grievanceId: 'GRV1002',
    transactionRef: 'TXN1024',
    complainantName: 'Ramesh Patel',
    againstEntity: 'Kisan Logistics Partner',
    issueType: 'Delivery Delay',
    description: 'Vehicle arrived 4 hours late beyond agreed farm-gate pickup slot.',
    status: 'Resolved',
    resolution: 'Transporter provided fuel rebate on return trip.',
    createdAt: new Date('2026-08-15'),
  },
];

exports.getGrievances = async (req, res, next) => {
  try {
    const { status, issueType } = req.query;
    const filter = {};
    if (status) filter.status = normalizeStatus(status);
    if (issueType) filter.issueType = normalizeIssueType(issueType);

    if (mongoose.connection.readyState === 1) {
      const list = await Grievance.find(filter)
        .populate('transaction')
        .populate('raisedBy', 'name email phone')
        .sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: list.length, data: list });
    }

    let filtered = [...fallbackGrievances];
    if (status) filtered = filtered.filter((g) => normalizeStatus(g.status) === normalizeStatus(status));
    if (issueType) filtered = filtered.filter((g) => normalizeIssueType(g.issueType) === normalizeIssueType(issueType));

    res.status(200).json({ success: true, count: filtered.length, data: filtered, source: 'offline-fallback' });
  } catch (error) {
    next(error);
  }
};

exports.getGrievanceById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { $or: [{ _id: req.params.id }, { grievanceId: req.params.id }] } : { grievanceId: req.params.id };

      const item = await Grievance.findOne(query).populate('transaction').populate('raisedBy', 'name email phone');
      if (!item) return res.status(404).json({ success: false, message: 'Grievance not found' });
      return res.status(200).json({ success: true, data: item });
    }

    const item = fallbackGrievances.find((g) => g._id === req.params.id || g.grievanceId === req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Grievance not found' });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.createGrievance = async (req, res, next) => {
  try {
    const { grievanceId, transaction, transactionRef, raisedBy, complainantName, againstEntity, issueType, description, status, resolution } = req.body;

    if (!issueType || !description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide issueType and description' });
    }

    const normIssueType = normalizeIssueType(issueType);
    const normStatus = normalizeStatus(status || 'Open');
    const assignedId = grievanceId || `GRV${1000 + fallbackGrievances.length + 1}`;

    if (mongoose.connection.readyState === 1) {
      const newGrv = await Grievance.create({
        grievanceId: assignedId,
        transaction,
        transactionRef: transactionRef || '',
        raisedBy,
        complainantName: complainantName || 'Ramesh Patel',
        againstEntity: againstEntity || '',
        issueType: normIssueType,
        description: description.trim(),
        status: normStatus,
        resolution: resolution || '',
      });
      return res.status(201).json({ success: true, data: newGrv, message: 'Grievance submitted successfully.' });
    }

    const mockGrv = {
      _id: `mock-${Date.now()}`,
      grievanceId: assignedId,
      transactionRef: transactionRef || 'TXN1001',
      complainantName: complainantName || 'Ramesh Patel',
      againstEntity: againstEntity || 'ABC Agro Foods Pvt Ltd',
      issueType: normIssueType,
      description: description.trim(),
      status: normStatus,
      resolution: resolution || '',
      createdAt: new Date(),
    };
    fallbackGrievances.unshift(mockGrv);

    res.status(201).json({ success: true, data: mockGrv, message: 'Grievance submitted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.updateGrievance = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.status) {
      updates.status = normalizeStatus(updates.status);
    }
    if (updates.issueType) {
      updates.issueType = normalizeIssueType(updates.issueType);
    }

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { $or: [{ _id: req.params.id }, { grievanceId: req.params.id }] } : { grievanceId: req.params.id };

      const existing = await Grievance.findOne(query);
      if (!existing) return res.status(404).json({ success: false, message: 'Grievance not found' });

      // Check transition if status is changing
      if (updates.status && updates.status !== existing.status) {
        const allowed = ALLOWED_GRIEVANCE_TRANSITIONS[existing.status] || [];
        if (!allowed.includes(updates.status)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status transition from '${existing.status}' to '${updates.status}'. Allowed: ${allowed.join(', ') || 'None'}`,
          });
        }
      }

      const updated = await Grievance.findOneAndUpdate(query, updates, { new: true, runValidators: true });
      return res.status(200).json({ success: true, data: updated, message: 'Grievance updated successfully.' });
    }

    const idx = fallbackGrievances.findIndex((g) => g._id === req.params.id || g.grievanceId === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Grievance not found' });

    const currentG = fallbackGrievances[idx];
    if (updates.status && updates.status !== currentG.status) {
      const allowed = ALLOWED_GRIEVANCE_TRANSITIONS[currentG.status] || [];
      if (!allowed.includes(updates.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from '${currentG.status}' to '${updates.status}'. Allowed: ${allowed.join(', ') || 'None'}`,
        });
      }
    }

    fallbackGrievances[idx] = { ...fallbackGrievances[idx], ...updates, updatedAt: new Date() };
    res.status(200).json({ success: true, data: fallbackGrievances[idx], message: 'Grievance updated successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteGrievance = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { $or: [{ _id: req.params.id }, { grievanceId: req.params.id }] } : { grievanceId: req.params.id };

      const deleted = await Grievance.findOneAndDelete(query);
      if (!deleted) return res.status(404).json({ success: false, message: 'Grievance not found' });
      return res.status(200).json({ success: true, message: 'Grievance deleted successfully' });
    }

    return res.status(200).json({ success: true, message: 'Grievance deleted successfully' });
  } catch (error) {
    next(error);
  }
};
