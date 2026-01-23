import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { EVSBadge } from './EVSBadge';
import { TrendIndicator } from './TrendIndicator';
import { InfoTooltip } from './InfoTooltip';
import { PropertyWithScore } from '@/hooks/useProperty';
import { getUpgradeConfidence } from '@/lib/upgrade-confidence';

interface PropertyCardProps {
  property: PropertyWithScore;
}

export function PropertyCard({ property }: PropertyCardProps) {
  // Handle both array and object score (Supabase returns array for relations)
  const rawScore = property.score;
  const score = Array.isArray(rawScore) ? rawScore[0] : rawScore;

  return (
    <Link href={`/property/${property.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {property.name}
            </Text>
            <Text style={styles.location}>
              {property.city}, {property.country}
            </Text>
            {property.brand && (
              <Text style={styles.brand}>{property.brand.name}</Text>
            )}
            <View style={styles.stats}>
              {/* Suite upgrade confidence - shows tier label, not raw % */}
              {score?.suite_upgrade_pct != null && (() => {
                const confidence = getUpgradeConfidence(
                  score.suite_upgrade_pct,
                  score.evs_audit_count
                );
                return (
                  <View style={styles.upgradeBadge}>
                    <View style={styles.upgradeRow}>
                      <Text style={[styles.suiteUpgrade, { color: confidence.color }]}>
                        🛏️ {confidence.label}
                      </Text>
                      <InfoTooltip
                        title="Suite Upgrade Likelihood"
                        explanation={confidence.explanation}
                        size={12}
                        color={confidence.color}
                      />
                    </View>
                    <Text style={styles.upgradeLabel}>Suite</Text>
                  </View>
                );
              })()}
              {/* Room upgrade - still shows tier for consistency */}
              {score?.room_upgrade_pct != null && score?.suite_upgrade_pct == null && (() => {
                const confidence = getUpgradeConfidence(
                  score.room_upgrade_pct,
                  score.evs_audit_count
                );
                return (
                  <View style={styles.upgradeBadge}>
                    <View style={styles.upgradeRow}>
                      <Text style={[styles.roomUpgrade, { color: confidence.color }]}>
                        📈 {confidence.label}
                      </Text>
                      <InfoTooltip
                        title="Room Upgrade Likelihood"
                        explanation={confidence.explanation}
                        size={12}
                        color={confidence.color}
                      />
                    </View>
                    <Text style={styles.upgradeLabel}>Upgrade</Text>
                  </View>
                );
              })()}
              <TrendIndicator trend={score?.trend_direction} size="small" />
            </View>
          </View>
          <View style={styles.scoreContainer}>
            <EVSBadge score={score?.evs_score ?? null} size="medium" />
            {score?.evs_audit_count != null && score.evs_audit_count > 0 && (
              <Text style={styles.auditCount}>
                {score.evs_audit_count} {score.evs_audit_count === 1 ? 'report' : 'reports'}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  brand: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upgradeBadge: {
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suiteUpgrade: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',  // Purple for suite - the premium metric
  },
  roomUpgrade: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',  // Green for any upgrade
  },
  upgradeLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: -2,
  },
  upgradeProb: {
    fontSize: 12,
    color: '#4b5563',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  auditCount: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
  },
});
