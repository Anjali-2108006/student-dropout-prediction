const BuyerDemand = require('../models/BuyerDemand');
const mongoose = require('mongoose');

const fallbackBuyerDemands = [
  { _id: '64c000000000000000000001', buyerName: 'ABC Agro Foods Pvt Ltd', crop: 'Tomato', quantity: '10 MT', qualityGrade: 'Grade A', offeredPrice: 34, location: 'Bengaluru Central Hub, KA', requiredBy: new Date('2026-09-10'), status: 'active' },
  { _id: '64c000000000000000000002', buyerName: 'Kisan Fresh Mart', crop: 'Onion', quantity: '25 MT', qualityGrade: 'Grade A', offeredPrice: 25, location: 'Chittoor Industrial Area, AP', requiredBy: new Date('2026-09-12'), status: 'active' },
  { _id: '64c000000000000000000003', buyerName: 'South Green Retailers', crop: 'Chilli', quantity: '5 MT', qualityGrade: 'Grade B', offeredPrice: 48, location: 'Tirupati Mandi Hub, AP', requiredBy: new Date('2026-09-08'), status: 'active' },
  { _id: '64c000000000000000000004', buyerName: 'Heritage Foods Bulk', crop: 'Potato', quantity: '20 MT', qualityGrade: 'Grade A', offeredPrice: 22, location: 'Bengaluru Wholesale Terminal, KA', requiredBy: new Date('2026-09-15'), status: 'active' },
  { _id: '64c000000000000000000005', buyerName: 'Nilgiri Food Processing', crop: 'Tomato', quantity: '15 MT', qualityGrade: 'Grade C', offeredPrice: 28, location: 'Hosur Processing Center, TN', requiredBy: new Date('2026-09-11'), status: 'active' },
];

exports.getBuyerDemands = async (req, res, next) => {
  try {
    const { status, crop } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (crop) filter.crop = new RegExp(`^${crop}$`, 'i');

    if (mongoose.connection.readyState === 1) {
      const demands = await BuyerDemand.find(filter).populate('buyer', 'name email phone').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: demands.length, data: demands });
    }

    let filtered = [...fallbackBuyerDemands];
    if (status) filtered = filtered.filter((d) => d.status === status);
    if (crop) filtered = filtered.filter((d) => d.crop.toLowerCase() === crop.toLowerCase());

    res.status(200).json({ success: true, count: filtered.length, data: filtered, source: 'offline-fallback' });
  } catch (error) {
    next(error);
  }
};

exports.getBuyerDemandById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const demand = await BuyerDemand.findById(req.params.id).populate('buyer', 'name email phone');
      if (!demand) return res.status(404).json({ success: false, message: 'Buyer demand not found' });
      return res.status(200).json({ success: true, data: demand });
    }

    const demand = fallbackBuyerDemands.find((d) => d._id === req.params.id);
    if (!demand) return res.status(404).json({ success: false, message: 'Buyer demand not found' });
    res.status(200).json({ success: true, data: demand });
  } catch (error) {
    next(error);
  }
};

exports.createBuyerDemand = async (req, res, next) => {
  try {
    const { buyer, buyerName, crop, quantity, qualityGrade, offeredPrice, location, requiredBy, status } = req.body;

    if (!crop || !quantity || offeredPrice === undefined || !location) {
      return res.status(400).json({ success: false, message: 'Please provide crop, quantity, offeredPrice, and location' });
    }

    if (mongoose.connection.readyState === 1) {
      const newDemand = await BuyerDemand.create({
        buyer,
        buyerName: buyerName || '',
        crop,
        quantity,
        qualityGrade: qualityGrade || 'Grade A',
        offeredPrice,
        location,
        requiredBy: requiredBy || undefined,
        status: status || 'active',
      });
      return res.status(201).json({ success: true, data: newDemand });
    }

    const mockDemand = {
      _id: `mock-${Date.now()}`,
      buyerName: buyerName || 'Verified Buyer',
      crop,
      quantity,
      qualityGrade: qualityGrade || 'Grade A',
      offeredPrice: Number(offeredPrice),
      location,
      requiredBy: requiredBy ? new Date(requiredBy) : new Date(),
      status: status || 'active',
      createdAt: new Date(),
    };
    fallbackBuyerDemands.push(mockDemand);

    res.status(201).json({ success: true, data: mockDemand });
  } catch (error) {
    next(error);
  }
};

exports.updateBuyerDemand = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const updated = await BuyerDemand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Buyer demand not found' });
      return res.status(200).json({ success: true, data: updated });
    }

    const idx = fallbackBuyerDemands.findIndex((d) => d._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Buyer demand not found' });
    fallbackBuyerDemands[idx] = { ...fallbackBuyerDemands[idx], ...req.body };
    res.status(200).json({ success: true, data: fallbackBuyerDemands[idx] });
  } catch (error) {
    next(error);
  }
};

exports.deleteBuyerDemand = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const deleted = await BuyerDemand.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Buyer demand not found' });
      return res.status(200).json({ success: true, message: 'Buyer demand deleted' });
    }

    return res.status(200).json({ success: true, message: 'Buyer demand deleted' });
  } catch (error) {
    next(error);
  }
};
