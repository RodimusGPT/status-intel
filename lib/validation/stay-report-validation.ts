/**
 * Stay Report Validation
 *
 * Defines quality standards for user-submitted stay reports.
 * This is critical - we only want accurate, real experiences in the app.
 *
 * TODO: Implement validation rules based on your data quality requirements
 */

export interface StayReportSubmission {
  propertyId: string;
  stayDate: string;
  loyaltyProgram?: string;
  eliteStatus?: string;
  recognitionStyle?: string;
  upgradeReceived?: boolean;
  upgradeOutcome?: string;
  roomTypeBooked?: string;
  roomTypeReceived?: string;
  breakfastIncluded?: boolean;
  breakfastLocation?: string;
  breakfastQuality?: number;
  loungeAccess?: boolean;
  loungeQuality?: string;
  loungeNotes?: string;
  lateCheckoutGranted?: boolean;
  checkoutTime?: string;
  overallExperience?: number;
  wouldRecommend?: boolean;
  additionalNotes?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a stay report submission
 *
 * IMPORTANT: This determines what data gets into your app.
 * Define your quality standards here.
 *
 * Questions to consider:
 * - Should stayDate be recent (e.g., within last 12 months)?
 * - Should we require minimum fields (e.g., property + date + recognition)?
 * - Should we validate date format?
 * - Should we require elite status to be specified?
 * - Should we flag suspicious patterns (e.g., all 5-star ratings)?
 *
 * @param submission The stay report data to validate
 * @returns Validation result with errors and warnings
 */
export function validateStayReport(submission: StayReportSubmission): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // TODO: Implement your validation logic here
  //
  // This is where YOU define what makes a valid submission.
  // The rules you define here directly impact data quality.
  //
  // Example validation rules you might implement:
  //
  // 1. Required fields:
  //    if (!submission.propertyId) errors.push('Property is required');
  //    if (!submission.stayDate) errors.push('Stay date is required');
  //
  // 2. Date validation:
  //    const stayDate = new Date(submission.stayDate);
  //    if (isNaN(stayDate.getTime())) errors.push('Invalid stay date format');
  //
  //    const monthsAgo = (Date.now() - stayDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  //    if (monthsAgo > 12) warnings.push('Stay was over 12 months ago - conditions may have changed');
  //    if (monthsAgo < 0) errors.push('Stay date cannot be in the future');
  //
  // 3. Elite status validation:
  //    if (!submission.eliteStatus) warnings.push('Elite status not specified');
  //
  // 4. Consistency checks:
  //    if (submission.upgradeReceived && !submission.roomTypeReceived) {
  //      warnings.push('Upgrade was received but upgraded room type not specified');
  //    }
  //
  //    if (submission.breakfastIncluded && !submission.breakfastLocation) {
  //      warnings.push('Breakfast included but location not specified');
  //    }
  //
  // 5. Quality signals:
  //    if (submission.overallExperience === 5 &&
  //        submission.breakfastQuality === 5 &&
  //        !submission.additionalNotes) {
  //      warnings.push('Perfect ratings without additional context may seem suspicious');
  //    }
  //
  // 6. Minimum detail requirement:
  //    const hasMinimumDetail = submission.recognitionStyle ||
  //                             submission.upgradeReceived !== undefined ||
  //                             submission.breakfastIncluded !== undefined;
  //    if (!hasMinimumDetail) {
  //      errors.push('Report must include at least one benefit detail');
  //    }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate a quality score for a submission
 *
 * Higher scores indicate more detailed, valuable submissions.
 * This could be used for:
 * - Ranking submissions in the UI
 * - Weighting data in ERI score calculations
 * - Gamification (reward detailed reports)
 *
 * @param submission The stay report
 * @returns Quality score (0-100)
 */
export function calculateSubmissionQuality(submission: StayReportSubmission): number {
  let score = 0;

  // TODO: Define your quality scoring criteria
  //
  // Example scoring:
  // - Has all required fields: +20
  // - Has elite status: +10
  // - Has detailed notes: +15
  // - Has upgrade details: +10
  // - Has breakfast details: +10
  // - Has lounge details: +10
  // - Recent stay (< 3 months): +15
  // - Detailed room type info: +10

  return Math.min(100, score);
}
