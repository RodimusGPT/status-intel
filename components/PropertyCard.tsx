import { View, Text, Pressable, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EVSBadge } from './EVSBadge';
import { PropertyWithScore } from '@/hooks/useProperty';
import { getUpgradeConfidence } from '@/lib/upgrade-confidence';

interface PropertyCardProps {
  property: PropertyWithScore;
  loyaltyProgramName?: string;
  index?: number;
}

export function PropertyCard({ property, loyaltyProgramName, index = 0 }: PropertyCardProps) {
  const router = useRouter();
  const rawScore = property.score;
  const score = Array.isArray(rawScore) ? rawScore[0] : rawScore;
  const isOdd = index % 2 === 1;

  // Get EVS score or fall back to Google rating
  const evsScore = score?.evs_score;
  const googleRating = property.google_rating;
  const hasEVS = evsScore != null;
  const hasGoogle = googleRating != null;

  // Get upgrade confidence if available
  const upgradeConfidence = score?.suite_upgrade_pct != null
    ? getUpgradeConfidence(score.suite_upgrade_pct, score.evs_audit_count)
    : score?.room_upgrade_pct != null
      ? getUpgradeConfidence(score.room_upgrade_pct, score.evs_audit_count)
      : null;

  const navigateToProperty = () => {
    router.push(`/property/${property.id}`);
  };

  return (
    <Pressable
      onPress={navigateToProperty}
      style={({ pressed }) => ({
        backgroundColor: pressed ? '#e5e7eb' : isOdd ? '#f0f4f8' : '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
      })}
    >
      {/* Score Badge - Left side */}
      <View style={{ marginRight: 10 }}>
        {hasEVS ? (
          <EVSBadge score={evsScore} size="small" />
        ) : hasGoogle ? (
          <GoogleRatingBadge rating={googleRating} />
        ) : (
          <EVSBadge score={null} size="small" />
        )}
      </View>

      {/* Hotel Info - Middle */}
      <View style={{ flex: 1 }}>
        {/* Row 1: Hotel Name */}
        <Text
          numberOfLines={1}
          style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}
        >
          {property.name}
        </Text>

        {/* Row 2: City, Country • Loyalty Program */}
        <Text numberOfLines={1} style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          {property.city}, {property.country}
          {loyaltyProgramName && (
            <Text style={{ color: '#0ea5e9' }}> • {loyaltyProgramName}</Text>
          )}
        </Text>
      </View>

      {/* Upgrade Badge - Right side */}
      {upgradeConfidence && (
        <View style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          backgroundColor: '#f8fafc',
          borderRadius: 6,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          marginLeft: 8,
        }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: upgradeConfidence.color }}>
            {upgradeConfidence.label}
          </Text>
        </View>
      )}

      {/* Navigation Arrow - Far right */}
      <View style={{ padding: 8, marginLeft: 4 }}>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </Pressable>
  );
}

/**
 * Google Rating Badge - shows Google rating (1-5 scale) when EVS not available
 */
function GoogleRatingBadge({ rating }: { rating: number }) {
  // Color based on Google rating (1-5 scale)
  const getColor = (r: number) => {
    if (r >= 4.5) return '#059669'; // Green - Excellent
    if (r >= 4.0) return '#0ea5e9'; // Blue - Good
    if (r >= 3.5) return '#f59e0b'; // Amber - Average
    return '#ef4444'; // Red - Poor
  };

  const color = getColor(rating);

  return (
    <View style={{
      width: 54,
      height: 54,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: color,
      backgroundColor: `${color}15`,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color }}>
        {rating.toFixed(1)}
      </Text>
      <Text style={{ fontSize: 8, fontWeight: '500', color, marginTop: -2 }}>
        Google
      </Text>
    </View>
  );
}
