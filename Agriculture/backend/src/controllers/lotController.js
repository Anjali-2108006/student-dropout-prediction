const Lot = require('../models/Lot');
const mongoose = require('mongoose');

const fallbackLots = [
  { _id: '64d000000000000000000001', lotId: 'AGRI1025', farmerName: 'Ramesh Patel', crop: 'Tomato', variety: 'Sahu Hybrid', quantity: '500 kg', qualityGrade: 'Grade A', harvestDate: new Date('2026-09-03'), expectedPrice: 32, location: 'Madanapalle, AP', availableFrom: new Date('2026-09-05'), status: 'available', createdAt: new Date() },
  { _id: '64d000000000000000000002', lotId: 'AGRI1026', farmerName: 'Ramesh Patel', crop: 'Onion', variety: 'Nashik Red', quantity: '1,200 kg', qualityGrade: 'Grade A', harvestDate: new Date('2026-09-02'), expectedPrice: 24, location: 'Madanapalle, AP', availableFrom: new Date('2026-09-04'), status: 'offer_received', createdAt: new Date() },
  { _id: '64d000000000000000000003', lotId: 'AGRI1027', farmerName: 'Srinivasulu Reddy', crop: 'Chilli', variety: 'G4 Superhot', quantity: '300 kg', qualityGrade: 'Grade B', harvestDate: new Date('2026-09-04'), expectedPrice: 45, location: 'Chittoor, AP', availableFrom: new Date('2026-09-06'), status: 'available', createdAt: new Date() },
];

exports.getLots = async (req, res, next) => {
  try {
    const { status, crop } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (crop) filter.crop = new RegExp(`^${crop}$`, 'i');

    if (mongoose.connection.readyState === 1) {
      const lots = await Lot.find(filter).populate('farmer', 'name email phone location').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: lots.length, data: lots });
    }

    let filtered = [...fallbackLots];
    if (status) filtered = filtered.filter((l) => l.status === status);
    if (crop) filtered = filtered.filter((l) => l.crop.toLowerCase() === crop.toLowerCase());

    res.status(200).json({ success: true, count: filtered.length, data: filtered, source: 'offline-fallback' });
  } catch (error) {
    next(error);
  }
};

exports.getLotById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Support finding by MongoDB _id or business lotId
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { $or: [{ _id: req.params.id }, { lotId: req.params.id }] } : { lotId: req.params.id };

      const lot = await Lot.findOne(query).populate('farmer', 'name email phone location');
      if (!lot) return res.status(404).json({ success: false, message: 'Lot not found' });
      return res.status(200).json({ success: true, data: lot });
    }

    const lot = fallbackLots.find((l) => l._id === req.params.id || l.lotId === req.params.id);
    if (!lot) return res.status(404).json({ success: false, message: 'Lot not found' });
    res.status(200).json({ success: true, data: lot });
  } catch (error) {
    next(error);
  }
};

exports.createLot = async (req, res, next) => {
  try {
    const { lotId, farmer, farmerName, crop, variety, quantity, qualityGrade, harvestDate, expectedPrice, location, availableFrom, status } = req.body;

    if (!crop || !quantity || !qualityGrade || expectedPrice === undefined || !location) {
      return res.status(400).json({ success: false, message: 'Please provide crop, quantity, qualityGrade, expectedPrice, and location' });
    }

    const assignedLotId = lotId || `AGRI${Math.floor(1000 + Math.random() * 9000)}`;

    if (mongoose.connection.readyState === 1) {
      const newLot = await Lot.create({
        lotId: assignedLotId,
        farmer,
        farmerName: farmerName || 'Ramesh Patel',
        crop,
        variety: variety || '',
        quantity,
        qualityGrade,
        harvestDate: harvestDate || Date.now(),
        expectedPrice,
        location,
        availableFrom: availableFrom || Date.now(),
        status: status || 'available',
      });
      return res.status(201).json({ success: true, data: newLot });
    }

    const mockLot = {
      _id: `mock-${Date.now()}`,
      lotId: assignedLotId,
      farmerName: farmerName || 'Ramesh Patel',
      crop,
      variety: variety || '',
      quantity,
      qualityGrade,
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      expectedPrice: Number(expectedPrice),
      location,
      availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
      status: status || 'available',
      createdAt: new Date(),
    };
    fallbackLots.push(mockLot);

    res.status(201).json({ success: true, data: mockLot });
  } catch (error) {
    next(error);
  }
};

exports.updateLot = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { $or: [{ _id: req.params.id }, { lotId: req.params.id }] } : { lotId: req.params.id };

      const updated = await Lot.findOneAndUpdate(query, req.body, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Lot not found' });
      return res.status(200).json({ success: true, data: updated });
    }

    const idx = fallbackLots.findIndex((l) => l._id === req.params.id || l.lotId === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Lot not found' });
    fallbackLots[idx] = { ...fallbackLots[idx], ...req.body };
    res.status(200).json({ success: true, data: fallbackLots[idx] });
  } catch (error) {
    next(error);
  }
};

exports.deleteLot = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { $or: [{ _id: req.params.id }, { lotId: req.params.id }] } : { lotId: req.params.id };

      const deleted = await Lot.findOneAndDelete(query);
      if (!deleted) return res.status(404).json({ success: false, message: 'Lot not found' });
      return res.status(200).json({ success: true, message: 'Lot deleted successfully' });
    }

    return res.status(200).json({ success: true, message: 'Lot deleted successfully' });
  } catch (error) {
    next(error);
  }
};
