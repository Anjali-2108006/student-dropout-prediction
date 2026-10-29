/**
 * AgriLink Buyer Matching Algorithm
 * Evaluates farmer lots against commercial buyer demands.
 *
 * Scoring Weights:
 * - Price: 30%
 * - Quality: 25%
 * - Quantity: 20%
 * - Distance: 15%
 * - Reliability: 10%
 *
 * All scores are calculated transparently with rule-based heuristics.
 */

// Helper to convert volume strings (e.g., '10 MT', '500 kg', '2 Quintal') to kilograms
export function parseQuantityKg(qtyStr) {
  if (typeof qtyStr === 'number') return qtyStr;
  if (!qtyStr) return 0;
  const str = String(qtyStr).toLowerCase().replace(/,/g, '').trim();
  const num = parseFloat(str) || 0;
  if (str.includes('mt') || str.includes('ton')) {
    return num * 1000;
  }
  if (str.includes('quintal')) {
    return num * 100;
  }
  return num;
}

// Demo distance estimations based on buyer locations relative to Madanapalle / Chittoor cluster
export function estimateBuyerDistance(locationStr = '') {
  const loc = String(locationStr).toLowerCase();
  if (loc.includes('madanapalle')) return 10;
  if (loc.includes('chittoor')) return 45;
  if (loc.includes('tirupati')) return 80;
  if (loc.includes('bengaluru') || loc.includes('bangalore')) return 110;
  if (loc.includes('hosur')) return 135;
  if (loc.includes('vellore')) return 95;
  return 60; // default estimated distance in km
}

// Demo buyer reliability rating (0 to 100%)
export function getBuyerReliability(buyerName = '', isVerified = true) {
  const name = String(buyerName).toLowerCase();
  if (name.includes('abc agro')) return 96;
  if (name.includes('kisan fresh')) return 94;
  if (name.includes('south green')) return 91;
  if (name.includes('heritage foods')) return 95;
  if (name.includes('nilgiri')) return 89;
  if (name.includes('freshmart')) return 95;
  return isVerified ? 92 : 82;
}

/**
 * Calculates a match score between a farmer lot and a buyer demand.
 * Returns breakdown and total score (0 to 100).
 */
export function calculateMatchScore(lot, demand) {
  // If crop names are completely different, return minimal compatibility
  const lotCrop = (lot.crop || '').toLowerCase().trim();
  const demandCrop = (demand.crop || '').toLowerCase().trim();
  const sameCrop = lotCrop && demandCrop && (lotCrop.includes(demandCrop) || demandCrop.includes(lotCrop));

  if (!sameCrop) {
    return {
      matchScore: 15,
      priceScore: 20,
      qualityScore: 20,
      quantityScore: 20,
      distanceScore: 20,
      reliabilityScore: 80,
      distanceKm: 150,
      reliability: 80,
      isCropMatch: false,
    };
  }

  // 1. PRICE SCORE (30%)
  const expectedPrice = typeof lot.expectedPrice === 'number'
    ? lot.expectedPrice
    : parseFloat(String(lot.expectedPrice || '0').replace(/[^0-9.]/g, '')) || 30;
  const offeredPrice = typeof demand.offeredPrice === 'number'
    ? demand.offeredPrice
    : parseFloat(String(demand.offeredPrice || '0').replace(/[^0-9.]/g, '')) || 30;

  let priceScore = 100;
  if (expectedPrice > 0) {
    if (offeredPrice >= expectedPrice) {
      priceScore = 100;
    } else {
      priceScore = Math.max(20, Math.min(100, Math.round((offeredPrice / expectedPrice) * 100)));
    }
  }

  // 2. QUALITY SCORE (25%)
  const lotGrade = (lot.qualityGrade || lot.quality || 'Grade A').toUpperCase();
  const demandGrade = (demand.qualityGrade || demand.grade || 'Grade A').toUpperCase();

  let qualityScore = 75;
  if (lotGrade === demandGrade) {
    qualityScore = 100;
  } else if (lotGrade.includes('GRADE A') && demandGrade.includes('GRADE B')) {
    qualityScore = 95; // Premium lot easily satisfies Grade B demand
  } else if (lotGrade.includes('GRADE A') && demandGrade.includes('GRADE C')) {
    qualityScore = 90;
  } else if (lotGrade.includes('GRADE B') && demandGrade.includes('GRADE A')) {
    qualityScore = 70;
  } else if (lotGrade.includes('GRADE B') && demandGrade.includes('GRADE C')) {
    qualityScore = 90;
  } else if (lotGrade.includes('GRADE C') && demandGrade.includes('GRADE A')) {
    qualityScore = 35;
  } else if (lotGrade.includes('GRADE C') && demandGrade.includes('GRADE B')) {
    qualityScore = 55;
  }

  // 3. QUANTITY SCORE (20%)
  const lotKg = parseQuantityKg(lot.quantity) || 500;
  const demandKg = parseQuantityKg(demand.quantity) || 500;

  let quantityScore = 80;
  if (lotKg === demandKg) {
    quantityScore = 100;
  } else if (demandKg >= lotKg) {
    // Buyer wants equal or larger bulk volume; can absorb the entire lot
    quantityScore = 95;
  } else {
    // Buyer demand is smaller than lot
    const ratio = demandKg / lotKg;
    quantityScore = Math.max(30, Math.min(100, Math.round(ratio * 100)));
  }

  // 4. DISTANCE SCORE (15%)
  const distanceKm = demand.distanceKm || estimateBuyerDistance(demand.location);
  const distanceScore = Math.max(35, Math.min(100, Math.round(100 - distanceKm * 0.35)));

  // 5. RELIABILITY SCORE (10%)
  const isVerified = demand.buyer?.verified !== false;
  const reliability = demand.reliability || getBuyerReliability(demand.buyerName, isVerified);
  const reliabilityScore = reliability;

  // Weighted total match score
  const totalScore = Math.round(
    priceScore * 0.30 +
    qualityScore * 0.25 +
    quantityScore * 0.20 +
    distanceScore * 0.15 +
    reliabilityScore * 0.10
  );

  return {
    matchScore: Math.min(99, Math.max(25, totalScore)),
    priceScore,
    qualityScore,
    quantityScore,
    distanceScore,
    reliabilityScore,
    distanceKm,
    reliability,
    isCropMatch: true,
  };
}

/**
 * Ranks all buyer demands against a given farmer lot.
 * Returns demands sorted by match score descending.
 */
export function rankBuyerMatchesForLot(lot, demands = []) {
  if (!demands || demands.length === 0) return [];

  const evaluated = demands.map((demand) => {
    const scoring = calculateMatchScore(lot, demand);
    return {
      ...demand,
      ...scoring,
    };
  });

  // Sort descending by match score
  return evaluated.sort((a, b) => b.matchScore - a.matchScore);
}
