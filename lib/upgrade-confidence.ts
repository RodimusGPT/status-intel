/**
 * Upgrade Confidence Calculator
 *
 * Converts raw upgrade percentages + sample sizes into user-friendly confidence tiers.
 * This prevents misleading displays like "100%" based on only 2 reports.
 */

export type ConfidenceTier = 'very_high' | 'high' | 'likely' | 'possible' | 'unlikely' | 'unknown';

export interface ConfidenceResult {
  tier: ConfidenceTier;
  label: string;
  color: string;
  /** Explanation for tooltip */
  explanation: string;
}

const TIER_CONFIG: Record<ConfidenceTier, { label: string; color: string }> = {
  very_high: { label: 'Very High', color: '#047857' }, // emerald-700 (darker green)
  high: { label: 'High', color: '#059669' },           // green-600
  likely: { label: 'Likely', color: '#2563EB' },       // blue-600
  possible: { label: 'Possible', color: '#D97706' },   // amber-600
  unlikely: { label: 'Unlikely', color: '#DC2626' },   // red-600
  unknown: { label: '?', color: '#9CA3AF' },           // gray-400
};

/**
 * Calculate upgrade confidence tier from percentage and sample size.
 *
 * @param percentage - The upgrade success rate (0-100)
 * @param sampleSize - Number of stay reports this is based on
 * @returns ConfidenceTier
 */
export function calculateConfidenceTier(
  percentage: number | null | undefined,
  sampleSize: number | null | undefined
): ConfidenceTier {
  // No data = unknown
  if (percentage == null || sampleSize == null || sampleSize === 0) {
    return 'unknown';
  }

  // "Very High" = excellent rate with strong statistical confidence
  // 70%+ with 10+ reports = very confident this property delivers
  if (percentage >= 70 && sampleSize >= 10) {
    return 'very_high';
  }

  // "High" = strong rate with good evidence
  // 70%+ with 5+ reports, OR 80%+ with 4+ reports
  if ((percentage >= 70 && sampleSize >= 5) || (percentage >= 80 && sampleSize >= 4)) {
    return 'high';
  }

  // "Likely" = good rate with some evidence
  // 50%+ with 3+ reports, OR 70%+ with 2+ reports
  if ((percentage >= 50 && sampleSize >= 3) || (percentage >= 70 && sampleSize >= 2)) {
    return 'likely';
  }

  // "Unlikely" = low rate with enough data to trust it
  // < 30% with 5+ reports = confident it's rare
  // < 20% with 3+ reports = also confident
  if ((percentage < 30 && sampleSize >= 5) || (percentage < 20 && sampleSize >= 3)) {
    return 'unlikely';
  }

  // Everything else is "Possible" - either:
  // - Decent rate but too few reports to trust
  // - Middle-of-road rate (30-50%)
  // - Low rate but not enough data to be sure
  return 'possible';
}

/**
 * Get full confidence result with label, color, and explanation.
 */
export function getUpgradeConfidence(
  percentage: number | null | undefined,
  sampleSize: number | null | undefined
): ConfidenceResult {
  const tier = calculateConfidenceTier(percentage, sampleSize);
  const config = TIER_CONFIG[tier];

  // Build contextual explanation with the actual percentage
  let explanation = '';
  if (tier === 'unknown') {
    explanation = 'Not enough data to estimate upgrade likelihood.';
  } else if (sampleSize != null && percentage != null) {
    const reportWord = sampleSize === 1 ? 'report' : 'reports';
    explanation = `${percentage}% of ${sampleSize} elite ${reportWord} received suite upgrades.\n\n`;
    explanation += 'Your experience may vary based on elite status, day of week, seasonality, and hotel occupancy.';
  }

  return {
    tier,
    ...config,
    explanation,
  };
}

/**
 * Format confidence for display with optional percentage.
 * Returns something like "Likely" or "Likely (75%)" depending on showPercentage.
 */
export function formatConfidence(
  result: ConfidenceResult,
  percentage?: number | null,
  showPercentage: boolean = false
): string {
  if (result.tier === 'unknown') return result.label;
  if (showPercentage && percentage != null) {
    return `${result.label} (${percentage}%)`;
  }
  return result.label;
}
