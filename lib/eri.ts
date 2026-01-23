import { Tables, Enums } from './database.types';

// Decay-weighted scoring constants
const HALF_LIFE_DAYS = 90;
const LAMBDA = Math.log(2) / HALF_LIFE_DAYS;

// Calculate decay weight based on days since stay
export function calculateWeight(daysSinceStay: number): number {
  return Math.exp(-LAMBDA * daysSinceStay);
}

// Calculate days between two dates
export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Recognition style scores
const RECOGNITION_SCORES: Record<Enums<'recognition_style'>, number> = {
  proactive: 100,
  asked_received: 70,
  none: 30,
  denied: 0,
};

// Calculate individual audit score (0-100)
export function computeAuditScore(audit: {
  recognition_style: Enums<'recognition_style'>;
  lounge_score?: number | null;
  breakfast_score?: number | null;
  culture_score?: number | null;
  booked_category_id?: string | null;
  received_category_id?: string | null;
}): number {
  // Recognition weight: 40%
  const recognitionScore = RECOGNITION_SCORES[audit.recognition_style] * 0.4;

  // Pulse scores (lounge + breakfast + culture) weight: 40%
  const loungeScore = audit.lounge_score ?? 3;
  const breakfastScore = audit.breakfast_score ?? 3;
  const cultureScore = audit.culture_score ?? 3;
  const pulseAvg = (loungeScore + breakfastScore + cultureScore) / 3;
  const pulseScore = (pulseAvg / 5) * 100 * 0.4;

  // Upgrade weight: 20% (if different room categories)
  let upgradeScore = 0;
  if (audit.received_category_id && audit.booked_category_id) {
    // If received is different from booked, consider it an upgrade
    upgradeScore = audit.received_category_id !== audit.booked_category_id ? 100 * 0.2 : 50 * 0.2;
  } else {
    upgradeScore = 50 * 0.2; // Neutral if no data
  }

  return Math.round(recognitionScore + pulseScore + upgradeScore);
}

// Calculate ERI score from multiple audits
export function calculateERI(
  audits: Array<{
    recognition_style: Enums<'recognition_style'>;
    lounge_score?: number | null;
    breakfast_score?: number | null;
    culture_score?: number | null;
    booked_category_id?: string | null;
    received_category_id?: string | null;
    stay_date: string;
  }>
): number {
  if (audits.length === 0) return 0;

  const now = new Date();
  let weightedSum = 0;
  let totalWeight = 0;

  for (const audit of audits) {
    const stayDate = new Date(audit.stay_date);
    const days = daysBetween(stayDate, now);
    const weight = calculateWeight(days);
    const score = computeAuditScore(audit);

    weightedSum += score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// Determine trend direction based on recent vs older audits
export function calculateTrend(
  audits: Array<{
    recognition_style: Enums<'recognition_style'>;
    lounge_score?: number | null;
    breakfast_score?: number | null;
    culture_score?: number | null;
    stay_date: string;
  }>
): Enums<'trend_direction'> {
  if (audits.length < 3) return 'stable';

  const now = new Date();
  const sorted = [...audits].sort(
    (a, b) => new Date(b.stay_date).getTime() - new Date(a.stay_date).getTime()
  );

  // Recent audits (last 30 days)
  const recent = sorted.filter((a) => daysBetween(new Date(a.stay_date), now) <= 30);
  // Older audits (30-90 days)
  const older = sorted.filter((a) => {
    const days = daysBetween(new Date(a.stay_date), now);
    return days > 30 && days <= 90;
  });

  if (recent.length === 0 || older.length === 0) return 'stable';

  const recentAvg = recent.reduce((sum, a) => sum + computeAuditScore(a), 0) / recent.length;
  const olderAvg = older.reduce((sum, a) => sum + computeAuditScore(a), 0) / older.length;

  const diff = recentAvg - olderAvg;
  if (diff > 10) return 'improving';
  if (diff < -10) return 'declining';
  return 'stable';
}

// Format ERI score as grade
export function getERIGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

// Get color for ERI score
export function getERIColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green-500
  if (score >= 60) return '#eab308'; // yellow-500
  if (score >= 40) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}
