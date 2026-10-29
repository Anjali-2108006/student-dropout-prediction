const MarketPrice = require('../models/MarketPrice');
const BuyerDemand = require('../models/BuyerDemand');
const mongoose = require('mongoose');

// Demo distances from Madanapalle origin (km)
const MARKET_DISTANCES = {
  Madanapalle: 0,
  Chittoor: 70,
  Tirupati: 120,
  Bengaluru: 180,
  Kolar: 160,
  Anantapur: 100,
};

// Transport rate: Rs 0.02 per km per kg
const TRANSPORT_RATE = 0.02;

const fallbackPrices = [
  { _id: 'f1', crop: 'Tomato', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', pricePerKg: 28, arrivalVolume: 120, date: new Date('2026-09-05'), unit: 'kg' },
  { _id: 'f2', crop: 'Tomato', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', pricePerKg: 26, arrivalVolume: 130, date: new Date('2026-09-04'), unit: 'kg' },
  { _id: 'f3', crop: 'Tomato', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', pricePerKg: 24, arrivalVolume: 140, date: new Date('2026-09-03'), unit: 'kg' },
  { _id: 'f4', crop: 'Tomato', market: 'Chittoor', location: 'Chittoor APMC, AP', pricePerKg: 30, arrivalVolume: 150, date: new Date('2026-09-05'), unit: 'kg' },
  { _id: 'f5', crop: 'Tomato', market: 'Chittoor', location: 'Chittoor APMC, AP', pricePerKg: 28, arrivalVolume: 160, date: new Date('2026-09-04'), unit: 'kg' },
  { _id: 'f6', crop: 'Tomato', market: 'Tirupati', location: 'Tirupati Mandi, AP', pricePerKg: 32, arrivalVolume: 180, date: new Date('2026-09-05'), unit: 'kg' },
  { _id: 'f7', crop: 'Tomato', market: 'Tirupati', location: 'Tirupati Mandi, AP', pricePerKg: 30, arrivalVolume: 190, date: new Date('2026-09-04'), unit: 'kg' },
  { _id: 'f8', crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', pricePerKg: 35, arrivalVolume: 300, date: new Date('2026-09-05'), unit: 'kg' },
  { _id: 'f9', crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', pricePerKg: 29, arrivalVolume: 305, date: new Date('2026-09-04'), unit: 'kg' },
  { _id: 'f10', crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', pricePerKg: 27, arrivalVolume: 310, date: new Date('2026-09-03'), unit: 'kg' },
  { _id: 'f11', crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', pricePerKg: 26, arrivalVolume: 340, date: new Date('2026-09-02'), unit: 'kg' },
  { _id: 'f12', crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', pricePerKg: 25, arrivalVolume: 350, date: new Date('2026-09-01'), unit: 'kg' },
  { _id: 'f13', crop: 'Onion', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', pricePerKg: 22, arrivalVolume: 85, date: new Date('2026-09-05'), unit: 'kg' },
  { _id: 'f14', crop: 'Onion', market: 'Chittoor', location: 'Chittoor APMC, AP', pricePerKg: 24, arrivalVolume: 110, date: new Date('2026-09-05'), unit: 'kg' },
  { _id: 'f15', crop: 'Onion', market: 'Bengaluru', location: 'Bengaluru APMC, KA', pricePerKg: 27, arrivalVolume: 210, date: new Date('2026-09-05'), unit: 'kg' },
  { _id: 'f16', crop: 'Chilli', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', pricePerKg: 42, arrivalVolume: 40, date: new Date('2026-09-05'), unit: 'kg' },
  { _id: 'f17', crop: 'Chilli', market: 'Bengaluru', location: 'Bengaluru APMC, KA', pricePerKg: 50, arrivalVolume: 120, date: new Date('2026-09-05'), unit: 'kg' },
  { _id: 'f18', crop: 'Potato', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', pricePerKg: 18, arrivalVolume: 90, date: new Date('2026-09-05'), unit: 'kg' },
  { _id: 'f19', crop: 'Potato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', pricePerKg: 24, arrivalVolume: 280, date: new Date('2026-09-05'), unit: 'kg' }
];

const fallbackDemands = [
  { _id: 'd1', buyerName: 'FreshMart Foods', crop: 'Tomato', quantity: '1000 kg', qualityGrade: 'Grade A', offeredPrice: 34, location: 'Bengaluru', verified: true, reliability: 95 },
  { _id: 'd2', buyerName: 'GreenBasket Retail', crop: 'Tomato', quantity: '500 kg', qualityGrade: 'Grade A', offeredPrice: 33, location: 'Madanapalle', verified: true, reliability: 92 },
  { _id: 'd3', buyerName: 'City Foods Ltd', crop: 'Tomato', quantity: '2000 kg', qualityGrade: 'Grade B', offeredPrice: 31, location: 'Tirupati', verified: false, reliability: 80 },
  { _id: 'd4', buyerName: 'Metro Agri Supply', crop: 'Onion', quantity: '2000 kg', qualityGrade: 'Grade A', offeredPrice: 28, location: 'Bengaluru', verified: true, reliability: 90 }
];

function computeForecast(priceHistory) {
  if (!priceHistory || priceHistory.length < 2) {
    return {
      forecastAvailable: false,
      message: 'Not enough historical data for forecast.',
      disclaimer: 'Estimated from recent market trend data. Not an official government forecast.'
    };
  }

  const sorted = [...priceHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  const prices = sorted.map(p => Number(p.pricePerKg || p.price || 0));

  const mid = Math.floor(prices.length / 2);
  const olderHalf = prices.slice(0, mid);
  const newerHalf = prices.slice(mid);

  const prevAvg = olderHalf.reduce((s, v) => s + v, 0) / (olderHalf.length || 1);
  const currAvg = newerHalf.reduce((s, v) => s + v, 0) / (newerHalf.length || 1);

  const trendPct = prevAvg > 0 ? Number((((currAvg - prevAvg) / prevAvg) * 100).toFixed(1)) : 0;

  const weights = prices.map((_, i) => i + 1);
  const weightSum = weights.reduce((s, w) => s + w, 0);
  const wma = prices.reduce((s, v, i) => s + v * weights[i], 0) / (weightSum || 1);

  const forecastPrice = Number((wma * (1 + (trendPct / 100) * 0.4)).toFixed(2));

  let outlook = 'Stable';
  if (trendPct > 2.5) outlook = 'Increasing';
  else if (trendPct < -2.5) outlook = 'Decreasing';

  let confidence = 'Medium';
  if (prices.length >= 5) confidence = 'High';
  else if (prices.length <= 2) confidence = 'Low';

  return {
    forecastAvailable: true,
    currentPrice: prices[prices.length - 1],
    averagePrice: Number(currAvg.toFixed(2)),
    previousAveragePrice: Number(prevAvg.toFixed(2)),
    trendPercentage: trendPct,
    forecastPrice,
    outlook,
    confidence,
    dataPoints: prices.length,
    disclaimer: 'Estimated from recent market trend data. Not an official government forecast.'
  };
}

function computeOpportunityScore(netPrice, bestNetPrice, totalDemandKg, trendPct, distance) {
  const priceScore = bestNetPrice > 0 ? Math.min(30, Math.round((netPrice / bestNetPrice) * 30)) : 20;
  const demandScore = totalDemandKg > 0 ? Math.min(25, Math.round((totalDemandKg / 2000) * 25)) : 15;
  const distScore = distance <= 0 ? 15 : distance <= 50 ? 14 : distance <= 100 ? 11 : distance <= 150 ? 8 : 5;
  const trendScore = trendPct > 5 ? 15 : trendPct > 0 ? 12 : trendPct > -3 ? 8 : 4;
  const reliabilityScore = 14;

  const total = Math.min(100, Math.max(10, priceScore + demandScore + distScore + trendScore + reliabilityScore));
  return {
    total,
    breakdown: [
      { factor: 'Price', score: priceScore, max: 30 },
      { factor: 'Demand', score: demandScore, max: 25 },
      { factor: 'Distance', score: distScore, max: 15 },
      { factor: 'Trend', score: trendScore, max: 15 },
      { factor: 'Reliability', score: reliabilityScore, max: 15 }
    ]
  };
}

function saleWindowDecision(trendPct, storageCostPerKg, netPrice, demandLevel) {
  const storage = storageCostPerKg || 1;
  const expectedGain = netPrice * (trendPct / 100);

  if (trendPct < -3) {
    return {
      action: 'SELL NOW',
      reason: 'Prices are showing a downward trend. Selling promptly protects your margin against further decline.'
    };
  }

  if (demandLevel === 'High') {
    return {
      action: 'SELL NOW',
      reason: 'Nearby buyer demand is very strong with high purchase intent. Lock in the current rate.'
    };
  }

  if (trendPct > 3 && expectedGain > storage * 1.5) {
    return {
      action: 'WAIT 1–2 DAYS',
      reason: 'Prices are showing an upward trend and expected gain is higher than estimated storage cost.'
    };
  }

  return {
    action: 'MONITOR',
    reason: 'Prices are relatively stable. Dispatch according to lot readiness and transport availability.'
  };
}

// @desc    Get complete market intelligence and recommendations for farmer
// @route   GET /api/market-intelligence
exports.getMarketIntelligence = async (req, res, next) => {
  try {
    const crop = req.query.crop || 'Tomato';
    const quantity = Math.max(1, Number(req.query.quantity) || 500);
    const originLocation = req.query.location || 'Madanapalle';
    const storageCostPerKg = Math.max(0, req.query.storageCost !== undefined && req.query.storageCost !== '' ? Number(req.query.storageCost) : 1);

    let prices = [];
    let demands = [];

    if (mongoose.connection.readyState === 1) {
      prices = await MarketPrice.find({ crop: new RegExp('^' + crop + '\\$', 'i') }).sort({ date: -1 });
      demands = await BuyerDemand.find({ crop: new RegExp('^' + crop + '\\$', 'i'), status: { '': 'closed' } });
    }

    if (!prices || prices.length === 0) {
      prices = fallbackPrices.filter(p => p.crop.toLowerCase() === crop.toLowerCase());
    }
    if (!demands || demands.length === 0) {
      demands = fallbackDemands.filter(d => d.crop.toLowerCase() === crop.toLowerCase());
    }

    const latestPerMarket = {};
    prices.forEach(p => {
      const m = p.market || 'Madanapalle';
      if (!latestPerMarket[m] || new Date(p.date) > new Date(latestPerMarket[m].date)) {
        latestPerMarket[m] = p;
      }
    });

    const totalDemandKg = demands.reduce((sum, d) => {
      const num = parseFloat(String(d.quantity || '0').replace(/[^0-9.]/g, '')) || 0;
      return sum + (String(d.quantity || '').toLowerCase().includes('mt') ? num * 1000 : num);
    }, 0);

    const demandLevel = totalDemandKg >= 2000 ? 'High' : totalDemandKg >= 500 ? 'Medium' : 'Low';

    const marketList = Object.values(latestPerMarket).map(item => {
      const rawPrice = Number(item.pricePerKg || item.price || 0);
      const distance = MARKET_DISTANCES[item.market] !== undefined ? MARKET_DISTANCES[item.market] : (item.distanceKm || 60);
      const transportCost = Number((distance * TRANSPORT_RATE).toFixed(2));
      const netPrice = Number((rawPrice - transportCost - storageCostPerKg).toFixed(2));
      const expectedReturn = Number((netPrice * quantity).toFixed(0));

      const history = prices.filter(p => p.market === item.market);
      const forecast = computeForecast(history);
      const trend = forecast.trendPercentage || 0;

      return {
        market: item.market,
        location: item.location || (item.market + ' Mandi'),
        rawPrice,
        distance,
        transportCost,
        storageCost: storageCostPerKg,
        netPrice,
        expectedReturn,
        forecast,
        trend,
        trendDirection: trend > 0 ? '↑' : trend < 0 ? '↓' : '→',
      };
    });

    const bestNetPrice = Math.max(...marketList.map(m => m.netPrice), 0);

    const scoredMarkets = marketList.map(m => {
      const scoreObj = computeOpportunityScore(m.netPrice, bestNetPrice, totalDemandKg, m.trend, m.distance);
      const recommendation = scoreObj.total >= 80 ? 'BEST' : scoreObj.total >= 65 ? 'GOOD' : 'LOW';
      return {
        ...m,
        opportunityScore: scoreObj.total,
        scoreBreakdown: scoreObj.breakdown,
        recommendation
      };
    });

    scoredMarkets.sort((a, b) => b.opportunityScore - a.opportunityScore);

    const bestMarket = scoredMarkets[0] || {
      market: 'Madanapalle',
      rawPrice: 28,
      distance: 0,
      transportCost: 0,
      storageCost: storageCostPerKg,
      netPrice: 28 - storageCostPerKg,
      expectedReturn: (28 - storageCostPerKg) * quantity,
      trend: 4.5,
      opportunityScore: 87,
      scoreBreakdown: [
        { factor: 'Price', score: 30, max: 30 },
        { factor: 'Demand', score: 22, max: 25 },
        { factor: 'Distance', score: 14, max: 15 },
        { factor: 'Trend', score: 12, max: 15 },
        { factor: 'Reliability', score: 9, max: 15 }
      ],
      recommendation: 'BEST'
    };

    const saleWindow = saleWindowDecision(bestMarket.trend, storageCostPerKg, bestMarket.netPrice, demandLevel);

    const explanationFactors = [];
    if (bestMarket.netPrice >= bestNetPrice - 0.5) explanationFactors.push('Higher net realisable price after transport and storage deductions');
    if (demandLevel === 'High' || demandLevel === 'Medium') explanationFactors.push('Strong buyer demand in regional aggregation network');
    if (bestMarket.distance <= 70) explanationFactors.push('Lower transportation cost due to regional proximity');
    if (bestMarket.trend > 0) explanationFactors.push('Good historical price trend in recent market arrivals');
    explanationFactors.push('Verified APMC / mandi trade regulation');

    const buyerMatches = demands.map(d => {
      const offered = Number(d.offeredPrice || d.priceOffered || 30);
      const pricePct = Math.min(30, Math.round((offered / Math.max(bestMarket.rawPrice, 1)) * 30));
      const qualityPct = (d.qualityGrade || 'Grade A') === 'Grade A' ? 25 : 18;
      const demandQty = parseFloat(String(d.quantity || '500').replace(/[^0-9.]/g, '')) || 500;
      const quantityPct = Math.abs(demandQty - quantity) < 500 ? 20 : 15;
      const dist = d.location === 'Madanapalle' ? 0 : d.location === 'Chittoor' ? 70 : 120;
      const distPct = dist <= 50 ? 15 : dist <= 100 ? 11 : 7;
      const relPct = d.verified ? 10 : 7;
      const matchScore = pricePct + qualityPct + quantityPct + distPct + relPct;

      return {
        _id: d._id,
        buyerName: d.buyerName || 'Commercial Buyer',
        offeredPrice: offered,
        quantity: d.quantity,
        qualityGrade: d.qualityGrade || 'Grade A',
        location: d.location,
        verified: !!d.verified,
        matchScore,
        reasons: [
          'Offers competitive price above regional average',
          'Accepts required produce quality grade',
          'Requires available quantity volume',
          'Located in close logistical reach',
          d.verified ? 'Verified buyer with on-time payment track record' : 'Standard marketplace participant'
        ]
      };
    });

    buyerMatches.sort((a, b) => b.matchScore - a.matchScore);
    const bestBuyer = buyerMatches[0] || {
      buyerName: 'FreshMart Foods',
      matchScore: 91,
      offeredPrice: 34,
      quantity: '1,000 kg',
      qualityGrade: 'Grade A',
      location: 'Bengaluru',
      verified: true,
      reasons: [
        'Offers competitive price (₹34/kg)',
        'Accepts required quality (Grade A)',
        'Requires available quantity',
        'Located nearby with verified logistics',
        'Verified buyer with excellent payment record'
      ]
    };

    const alerts = [
      {
        id: 'alert-price',
        type: 'PRICE ALERT',
        message: crop + ' prices increased by 5% in ' + bestMarket.market + '.',
        timestamp: 'Just now'
      },
      {
        id: 'alert-demand',
        type: 'DEMAND ALERT',
        message: 'A verified buyer is looking for 1,000 kg of Grade-A ' + crop.toLowerCase() + 's.',
        timestamp: '1 hour ago'
      },
      {
        id: 'alert-sale',
        type: 'SALE ALERT',
        message: 'Current market price in ' + bestMarket.market + ' (₹' + bestMarket.rawPrice + '/kg) is higher than recent average.',
        timestamp: 'Today'
      },
      {
        id: 'alert-delivery',
        type: 'DELIVERY ALERT',
        message: 'Your scheduled produce delivery is expected on time.',
        timestamp: 'Pending dispatch'
      },
      {
        id: 'alert-payment',
        type: 'PAYMENT ALERT',
        message: 'Payment tracking active for all completed mandi deliveries.',
        timestamp: 'Active'
      },
      {
        id: 'alert-grievance',
        type: 'GRIEVANCE ALERT',
        message: 'Grievance management desk is available 24/7 for dispute resolution.',
        timestamp: 'Support'
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        crop,
        quantity,
        originLocation,
        storageCostPerKg,
        demandLevel,
        totalDemandKg,
        markets: scoredMarkets,
        marketComparison: scoredMarkets,
        bestMarket,
        saleWindow,
        explanationFactors,
        bestBuyer,
        buyerMatches: buyerMatches.slice(0, 3),
        alerts,
        disclaimer: 'Estimated from recent market trend data. Not an official government forecast.'
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get explainable statistical price forecast for crop in specific market
// @route   GET /api/market-intelligence/forecast
exports.getMarketForecast = async (req, res, next) => {
  try {
    const crop = req.query.crop || 'Tomato';
    const market = req.query.market || 'Bengaluru';

    let prices = [];
    if (mongoose.connection.readyState === 1) {
      prices = await MarketPrice.find({
        crop: new RegExp('^' + crop + '\\$', 'i'),
        market: new RegExp('^' + market + '\\$', 'i')
      }).sort({ date: 1 });
    }

    if (!prices || prices.length === 0) {
      prices = fallbackPrices.filter(
        p => p.crop.toLowerCase() === crop.toLowerCase() && p.market.toLowerCase() === market.toLowerCase()
      );
    }

    const forecast = computeForecast(prices);

    const priceHistory = prices.map(p => ({
      date: new Date(p.date).toISOString().split('T')[0],
      price: Number(p.pricePerKg || p.price || 0),
      market: p.market
    }));

    res.status(200).json({
      success: true,
      data: {
        crop,
        market,
        ...forecast,
        priceHistory
      }
    });
  } catch (err) {
    next(err);
  }
};
