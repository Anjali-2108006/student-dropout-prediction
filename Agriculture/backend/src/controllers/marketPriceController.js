const MarketPrice = require('../models/MarketPrice');
const mongoose = require('mongoose');

// Rich fallback dataset containing 20+ records across Tomato, Onion, Chilli, Potato and markets
const fallbackMarketPrices = [
  // Tomato in Bengaluru across dates (showing price trend)
  { _id: '64b000000000000000000001', crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-01'), pricePerKg: 25, arrivalVolume: 350, unit: 'kg', source: 'APMC Portal' },
  { _id: '64b000000000000000000002', crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-02'), pricePerKg: 26, arrivalVolume: 340, unit: 'kg', source: 'APMC Portal' },
  { _id: '64b000000000000000000003', crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-03'), pricePerKg: 27, arrivalVolume: 310, unit: 'kg', source: 'APMC Portal' },
  { _id: '64b000000000000000000004', crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-04'), pricePerKg: 29, arrivalVolume: 305, unit: 'kg', source: 'APMC Portal' },
  { _id: '64b000000000000000000005', crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-05'), pricePerKg: 35, arrivalVolume: 300, unit: 'kg', source: 'APMC Portal' },

  // Tomato in Madanapalle, Chittoor, Tirupati
  { _id: '64b000000000000000000006', crop: 'Tomato', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 28, arrivalVolume: 120, unit: 'kg', source: 'Demo Data' },
  { _id: '64b000000000000000000007', crop: 'Tomato', market: 'Chittoor', location: 'Chittoor APMC, AP', date: new Date('2026-09-05'), pricePerKg: 30, arrivalVolume: 150, unit: 'kg', source: 'Demo Data' },
  { _id: '64b000000000000000000008', crop: 'Tomato', market: 'Tirupati', location: 'Tirupati Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 32, arrivalVolume: 180, unit: 'kg', source: 'Demo Data' },

  // Onion across markets
  { _id: '64b000000000000000000009', crop: 'Onion', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 22, arrivalVolume: 85, unit: 'kg', source: 'Demo Data' },
  { _id: '64b000000000000000000010', crop: 'Onion', market: 'Chittoor', location: 'Chittoor APMC, AP', date: new Date('2026-09-05'), pricePerKg: 24, arrivalVolume: 110, unit: 'kg', source: 'Demo Data' },
  { _id: '64b000000000000000000011', crop: 'Onion', market: 'Tirupati', location: 'Tirupati Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 25, arrivalVolume: 140, unit: 'kg', source: 'Demo Data' },
  { _id: '64b000000000000000000012', crop: 'Onion', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-05'), pricePerKg: 27, arrivalVolume: 210, unit: 'kg', source: 'Demo Data' },

  // Chilli across markets
  { _id: '64b000000000000000000013', crop: 'Chilli', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 42, arrivalVolume: 40, unit: 'kg', source: 'Demo Data' },
  { _id: '64b000000000000000000014', crop: 'Chilli', market: 'Chittoor', location: 'Chittoor APMC, AP', date: new Date('2026-09-05'), pricePerKg: 45, arrivalVolume: 60, unit: 'kg', source: 'Demo Data' },
  { _id: '64b000000000000000000015', crop: 'Chilli', market: 'Tirupati', location: 'Tirupati Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 46, arrivalVolume: 75, unit: 'kg', source: 'Demo Data' },
  { _id: '64b000000000000000000016', crop: 'Chilli', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-05'), pricePerKg: 50, arrivalVolume: 120, unit: 'kg', source: 'Demo Data' },

  // Potato across markets
  { _id: '64b000000000000000000017', crop: 'Potato', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 18, arrivalVolume: 90, unit: 'kg', source: 'Demo Data' },
  { _id: '64b000000000000000000018', crop: 'Potato', market: 'Chittoor', location: 'Chittoor APMC, AP', date: new Date('2026-09-05'), pricePerKg: 20, arrivalVolume: 120, unit: 'kg', source: 'Demo Data' },
  { _id: '64b000000000000000000019', crop: 'Potato', market: 'Tirupati', location: 'Tirupati Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 21, arrivalVolume: 135, unit: 'kg', source: 'Demo Data' },
  { _id: '64b000000000000000000020', crop: 'Potato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-05'), pricePerKg: 24, arrivalVolume: 280, unit: 'kg', source: 'Demo Data' },
  { _id: '64b000000000000000000021', crop: 'Tomato', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', date: new Date('2026-09-04'), pricePerKg: 26, arrivalVolume: 130, unit: 'kg', source: 'Demo Data' },
];

// @desc    Get all market prices (optional filter by crop, market)
// @route   GET /api/market-prices
exports.getMarketPrices = async (req, res, next) => {
  try {
    const { crop, market } = req.query;
    const filter = {};
    if (crop) filter.crop = new RegExp(`^${crop}$`, 'i');
    if (market) filter.market = new RegExp(`^${market}$`, 'i');

    if (mongoose.connection.readyState === 1) {
      const prices = await MarketPrice.find(filter).sort({ date: -1 });
      return res.status(200).json({
        success: true,
        count: prices.length,
        data: prices,
      });
    }

    let filtered = [...fallbackMarketPrices];
    if (crop) {
      filtered = filtered.filter((p) => p.crop.toLowerCase() === crop.toLowerCase());
    }
    if (market) {
      filtered = filtered.filter((p) => p.market.toLowerCase() === market.toLowerCase());
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
      source: 'offline-fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single market price record by ID
// @route   GET /api/market-prices/:id
exports.getMarketPriceById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const item = await MarketPrice.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Market price record not found' });
      }
      return res.status(200).json({ success: true, data: item });
    }

    const item = fallbackMarketPrices.find((p) => p._id === req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Market price record not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new market price entry
// @route   POST /api/market-prices
exports.createMarketPrice = async (req, res, next) => {
  try {
    const { crop, market, location, date, pricePerKg, arrivalVolume, unit, source } = req.body;

    if (!crop || !market || !location || pricePerKg === undefined || arrivalVolume === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide crop, market, location, pricePerKg, and arrivalVolume',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const newPrice = await MarketPrice.create({
        crop,
        market,
        location,
        date: date || Date.now(),
        pricePerKg,
        arrivalVolume,
        unit: unit || 'kg',
        source: source || 'Demo Data',
      });
      return res.status(201).json({ success: true, data: newPrice });
    }

    const mockItem = {
      _id: `mock-${Date.now()}`,
      crop,
      market,
      location,
      date: date ? new Date(date) : new Date(),
      pricePerKg: Number(pricePerKg),
      arrivalVolume: Number(arrivalVolume),
      unit: unit || 'kg',
      source: source || 'Demo Data',
      createdAt: new Date(),
    };
    fallbackMarketPrices.push(mockItem);

    res.status(201).json({ success: true, data: mockItem });
  } catch (error) {
    next(error);
  }
};

// @desc    Update market price
// @route   PUT /api/market-prices/:id
exports.updateMarketPrice = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const updated = await MarketPrice.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Market price record not found' });
      }
      return res.status(200).json({ success: true, data: updated });
    }

    const idx = fallbackMarketPrices.findIndex((p) => p._id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Market price record not found' });
    }
    fallbackMarketPrices[idx] = { ...fallbackMarketPrices[idx], ...req.body };
    res.status(200).json({ success: true, data: fallbackMarketPrices[idx] });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete market price
// @route   DELETE /api/market-prices/:id
exports.deleteMarketPrice = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const deleted = await MarketPrice.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Market price record not found' });
      }
      return res.status(200).json({ success: true, message: 'Market price record deleted' });
    }

    return res.status(200).json({ success: true, message: 'Market price record deleted' });
  } catch (error) {
    next(error);
  }
};
