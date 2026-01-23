/**
 * Elite Value Score (EVS) Configuration
 *
 * Calculates a 1-10 composite score for properties based on what
 * elite travelers actually care about.
 *
 * Categories & Weights:
 * - The Upgrade (25%): Suite upgrades, view quality, floor height
 * - Breakfast (20%): Quality, buffet vs à la carte, elite perks
 * - Lounge/HH (20%): Evening spread, alcohol, seating
 * - Service & Recognition (15%): Early/late checkout, welcome amenity
 * - Hard Product (10%): Bed, shower, wifi, tech
 * - Elite Consistency (10%): Brand standards, ease of benefits
 */

export const EVS_WEIGHTS = {
  upgrade: 0.25,
  breakfast: 0.20,
  lounge: 0.20,
  service: 0.15,
  hardProduct: 0.10,
  eliteConsistency: 0.10,
} as const;

/** Maps lounge_quality enum to base score (1-10) */
export const LOUNGE_QUALITY_SCORES: Record<string, number> = {
  exceptional: 10,
  good: 7,
  basic: 5,
  poor: 3,
  none: 0,
};

/** Maps happy_hour_type enum to food quality score (1-10) */
export const LOUNGE_FOOD_SCORES: Record<string, number> = {
  full_meal: 10,
  substantial_appetizers: 8,
  substantial: 8,
  light_snacks: 5,
  drinks_only: 3,
  none: 0,
};

export function calculateLoungeScore(
  hasLounge: boolean,
  loungeQuality: string | null,
  foodQuality: string | null,
  loungeScoreRating: number | null
): number {
  if (!hasLounge) {
    return 0;
  }

  let qualityScore = 5;
  if (loungeQuality && LOUNGE_QUALITY_SCORES[loungeQuality] !== undefined) {
    qualityScore = LOUNGE_QUALITY_SCORES[loungeQuality];
  } else if (loungeScoreRating) {
    qualityScore = loungeScoreRating * 2;
  }

  let foodScore = 5;
  if (foodQuality && LOUNGE_FOOD_SCORES[foodQuality] !== undefined) {
    foodScore = LOUNGE_FOOD_SCORES[foodQuality];
  }

  if (foodQuality === 'none' || foodQuality === 'drinks_only') {
    return Math.min(qualityScore * 0.4, 4);
  }

  return Math.round((foodScore * 0.6 + qualityScore * 0.4) * 10) / 10;
}

export const BREAKFAST_LOCATION_BONUS: Record<string, number> = {
  both: 1.1,
  restaurant: 1.0,
  lounge: 0.95,
  room_service: 0.9,
  none: 0,
};

export function calculateBreakfastScore(
  breakfastScore: number | null,
  breakfastLocation: string | null
): number {
  if (!breakfastScore) return 0;

  let score = breakfastScore * 2;
  const locationBonus = BREAKFAST_LOCATION_BONUS[breakfastLocation || 'restaurant'] || 1.0;
  score = score * locationBonus;

  return Math.min(Math.round(score * 10) / 10, 10);
}

export function calculateUpgradeScore(
  suiteUpgradePct: number | null,
  roomUpgradePct: number | null,
  recognitionStyle: string | null
): number {
  if (suiteUpgradePct === null && roomUpgradePct === null) {
    return 5;
  }

  const suiteScore = (suiteUpgradePct || 0) / 10;
  const roomBonus = Math.min((roomUpgradePct || 0) / 50, 2);

  let recognitionBonus = 0;
  if (recognitionStyle === 'proactive') {
    recognitionBonus = 1;
  } else if (recognitionStyle === 'asked_received') {
    recognitionBonus = 0.5;
  }

  return Math.min(Math.round((suiteScore + roomBonus + recognitionBonus) * 10) / 10, 10);
}

export const RECOGNITION_STYLE_SCORES: Record<string, number> = {
  proactive: 10,
  asked_received: 7,
  none: 4,
  denied: 1,
};

export function calculateServiceScore(
  recognitionStyle: string | null,
  lateCheckoutGranted: boolean | null,
  hasWelcomeAmenity: boolean
): number {
  const recognitionScore = RECOGNITION_STYLE_SCORES[recognitionStyle || 'none'] || 4;
  const lateCheckoutScore = lateCheckoutGranted ? 10 : 4;
  const amenityScore = hasWelcomeAmenity ? 10 : 5;

  return Math.round((recognitionScore * 0.4 + lateCheckoutScore * 0.4 + amenityScore * 0.2) * 10) / 10;
}

export interface EVSCategoryScores {
  upgrade: number;
  breakfast: number;
  lounge: number;
  service: number;
  hardProduct: number;
  eliteConsistency: number;
}

export interface EVSResult {
  score: number | null;
  categoryScores: EVSCategoryScores | null;
  auditCount: number;
}

export function calculateEVS(categories: EVSCategoryScores): number {
  const weighted =
    categories.upgrade * EVS_WEIGHTS.upgrade +
    categories.breakfast * EVS_WEIGHTS.breakfast +
    categories.lounge * EVS_WEIGHTS.lounge +
    categories.service * EVS_WEIGHTS.service +
    categories.hardProduct * EVS_WEIGHTS.hardProduct +
    categories.eliteConsistency * EVS_WEIGHTS.eliteConsistency;

  return Math.round(weighted * 10) / 10;
}

export interface StayAuditForScoring {
  recognition_style: string;
  lounge_score: number | null;
  lounge_quality: string | null;
  breakfast_score: number | null;
  breakfast_location: string | null;
  late_checkout_granted: boolean | null;
  welcome_amenity: string | null;
  hard_product_score: number | null;
  elite_consistency_score: number | null;
  booked_category_id: string | null;
  received_category_id: string | null;
}

export interface PropertyLoungeInfo {
  has_lounge: boolean;
  happy_hour_type?: string | null;
}

export function calculateEVSFromAudits(
  audits: StayAuditForScoring[],
  loungeInfo: PropertyLoungeInfo,
  upgradeStats: { suiteUpgradePct: number | null; roomUpgradePct: number | null }
): EVSResult {
  if (audits.length === 0) {
    return {
      score: null,
      categoryScores: null,
      auditCount: 0,
    };
  }

  const avgBreakfastScore = average(audits.map(a => a.breakfast_score));
  const avgLoungeScore = average(audits.map(a => a.lounge_score));
  const avgHardProduct = average(audits.map(a => a.hard_product_score));
  const avgEliteConsistency = average(audits.map(a => a.elite_consistency_score));

  const mostCommonRecognition = mode(audits.map(a => a.recognition_style));
  const mostCommonLoungeQuality = mode(audits.map(a => a.lounge_quality).filter(Boolean) as string[]);
  const mostCommonBreakfastLocation = mode(audits.map(a => a.breakfast_location).filter(Boolean) as string[]);
  const lateCheckoutRate = audits.filter(a => a.late_checkout_granted).length / audits.length;
  const hasWelcomeAmenityRate = audits.filter(a => a.welcome_amenity).length / audits.length;

  const categoryScores: EVSCategoryScores = {
    upgrade: calculateUpgradeScore(
      upgradeStats.suiteUpgradePct,
      upgradeStats.roomUpgradePct,
      mostCommonRecognition
    ),
    breakfast: calculateBreakfastScore(avgBreakfastScore, mostCommonBreakfastLocation),
    lounge: calculateLoungeScore(
      loungeInfo.has_lounge,
      mostCommonLoungeQuality,
      loungeInfo.happy_hour_type || null,
      avgLoungeScore
    ),
    service: calculateServiceScore(
      mostCommonRecognition,
      lateCheckoutRate > 0.5,
      hasWelcomeAmenityRate > 0.5
    ),
    hardProduct: avgHardProduct ? avgHardProduct : 5,
    eliteConsistency: avgEliteConsistency ? avgEliteConsistency : 5,
  };

  return {
    score: calculateEVS(categoryScores),
    categoryScores,
    auditCount: audits.length,
  };
}

function average(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function mode<T>(values: T[]): T | null {
  if (values.length === 0) return null;
  const counts = new Map<T, number>();
  values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
  let maxCount = 0;
  let result: T | null = null;
  counts.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      result = value;
    }
  });
  return result;
}
