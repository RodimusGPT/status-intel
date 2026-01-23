import { View, Text, StyleSheet } from 'react-native';
import { Tables, Enums } from '@/lib/database.types';

type PropertyBenefits = Tables<'property_benefits'>;

interface BenefitsCardProps {
  benefits: PropertyBenefits | null;
}

const BREAKFAST_LABELS: Record<Enums<'breakfast_location'>, string> = {
  restaurant: 'Restaurant',
  lounge: 'Club Lounge',
  both: 'Restaurant or Lounge',
  room_service: 'Room Service',
  none: 'Not Included',
};

const HAPPY_HOUR_LABELS: Record<Enums<'happy_hour_type'>, string> = {
  full_meal: 'Full Meal',
  substantial_appetizers: 'Substantial Apps',
  light_snacks: 'Light Snacks',
  drinks_only: 'Drinks Only',
  none: 'No Happy Hour',
};

const LOUNGE_LABELS: Record<Enums<'lounge_quality'>, string> = {
  exceptional: 'Exceptional',
  good: 'Good',
  basic: 'Basic',
  poor: 'Poor',
  none: 'No Lounge',
};

const CHECKOUT_LABELS: Record<Enums<'checkout_policy'>, string> = {
  guaranteed_late: 'Guaranteed Late',
  subject_to_availability: 'Upon Availability',
  rarely_granted: 'Rarely Granted',
  no_benefit: 'No Late Checkout',
};

function BenefitRow({ icon, label, value, quality }: {
  icon: string;
  label: string;
  value: string | null;
  quality?: 'good' | 'neutral' | 'bad' | null;
}) {
  const qualityColor = quality === 'good' ? '#22c55e' : quality === 'bad' ? '#ef4444' : '#6b7280';

  return (
    <View style={styles.benefitRow}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitLabel}>{label}</Text>
        <Text style={[styles.benefitValue, { color: qualityColor }]}>
          {value || 'No data yet'}
        </Text>
      </View>
    </View>
  );
}

export function BenefitsCard({ benefits }: BenefitsCardProps) {
  if (!benefits) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Elite Benefits</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataIcon}>\uD83D\uDCCB</Text>
          <Text style={styles.noDataText}>No benefit data yet</Text>
          <Text style={styles.noDataSubtext}>Be the first to report on this property!</Text>
        </View>
      </View>
    );
  }

  const getBreakfastQuality = () => {
    if (!benefits.breakfast_location || benefits.breakfast_location === 'none') return 'bad';
    if (benefits.breakfast_location === 'both' || benefits.breakfast_quality && benefits.breakfast_quality >= 4) return 'good';
    return 'neutral';
  };

  const getHappyHourQuality = () => {
    if (!benefits.happy_hour_type || benefits.happy_hour_type === 'none') return 'bad';
    if (benefits.happy_hour_type === 'full_meal' || benefits.happy_hour_type === 'substantial_appetizers') return 'good';
    return 'neutral';
  };

  const getLoungeQuality = () => {
    if (!benefits.has_lounge || benefits.lounge_quality === 'none') return 'bad';
    if (benefits.lounge_quality === 'exceptional' || benefits.lounge_quality === 'good') return 'good';
    return 'neutral';
  };

  const getCheckoutQuality = () => {
    if (benefits.late_checkout_policy === 'guaranteed_late') return 'good';
    if (benefits.late_checkout_policy === 'no_benefit' || benefits.late_checkout_policy === 'rarely_granted') return 'bad';
    return 'neutral';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Elite Benefits</Text>

      <View style={styles.benefitSection}>
        <BenefitRow
          icon="\uD83C\uDF73"
          label="Breakfast"
          value={benefits.breakfast_location ? BREAKFAST_LABELS[benefits.breakfast_location] : null}
          quality={getBreakfastQuality()}
        />
      </View>

      <View style={styles.benefitSection}>
        <BenefitRow
          icon="\uD83C\uDF78"
          label="Happy Hour / Evening"
          value={benefits.happy_hour_type ? HAPPY_HOUR_LABELS[benefits.happy_hour_type] : null}
          quality={getHappyHourQuality()}
        />
      </View>

      <View style={styles.benefitSection}>
        <BenefitRow
          icon="\uD83D\uDECB\uFE0F"
          label="Club Lounge"
          value={benefits.has_lounge
            ? (benefits.lounge_quality ? LOUNGE_LABELS[benefits.lounge_quality] : 'Available')
            : 'No Lounge'}
          quality={getLoungeQuality()}
        />
      </View>

      <View style={styles.benefitSection}>
        <BenefitRow
          icon="\u23F0"
          label="Late Checkout"
          value={benefits.late_checkout_policy
            ? `${CHECKOUT_LABELS[benefits.late_checkout_policy]}${benefits.typical_checkout_time ? ` (${benefits.typical_checkout_time})` : ''}`
            : null}
          quality={getCheckoutQuality()}
        />
      </View>

      {benefits.report_count && (
        <Text style={styles.reportCount}>
          Based on {benefits.report_count} {benefits.report_count === 1 ? 'report' : 'reports'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', marginTop: 8, paddingVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', paddingHorizontal: 16, marginBottom: 12 },
  noDataContainer: { alignItems: 'center', paddingVertical: 24 },
  noDataIcon: { fontSize: 40, marginBottom: 8 },
  noDataText: { fontSize: 16, fontWeight: '500', color: '#6b7280' },
  noDataSubtext: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  benefitSection: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  benefitRow: { flexDirection: 'row', alignItems: 'center' },
  benefitIcon: { fontSize: 24, marginRight: 12 },
  benefitContent: { flex: 1 },
  benefitLabel: { fontSize: 14, color: '#6b7280' },
  benefitValue: { fontSize: 16, fontWeight: '600' },
  reportCount: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 12 },
});
