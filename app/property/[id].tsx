/**
 * Property Detail Screen
 *
 * Displays synthesized elite traveler intelligence for a specific property.
 * Redesigned with cohesive sections and clear visual hierarchy.
 */

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useProperty, useCommunityStats, CommunityStats } from '../../hooks/useProperty';
import { EVSBadge } from '../../components/EVSBadge';
import { TrendIndicator } from '../../components/TrendIndicator';
import { InfoTooltip } from '../../components/InfoTooltip';
import { getUpgradeConfidence } from '../../lib/upgrade-confidence';

// Tier-specific upgrade data
interface TierUpgradeData {
  successRate?: number;
  sampleSize?: number;
  notes?: string;
}

// Insight sub-interfaces with strict typing
interface UpgradeInsight {
  successRate?: number;
  summary?: string;
  proTips?: string[];
  byTier?: Record<string, TierUpgradeData>;
}

interface BreakfastInsight {
  location?: string;
  quality?: string;
  qualityRating?: number;
  summary?: string;
  keyInsights?: string[];
}

interface LoungeInsight {
  quality?: string;
  qualityRating?: number;
  access?: string;
  hours?: string;
  summary?: string;
  keyInsights?: string[];
}

interface RecognitionInsight {
  style?: string;
  summary?: string;
  keyInsights?: string[];
}

interface LateCheckoutInsight {
  successRate?: number;
  typical?: string;
  summary?: string;
  keyInsights?: string[];
}

interface OverallRecommendation {
  score?: number;
  summary?: string;
  bestFor?: string[];
  warnings?: string[];
}

// Main intelligence interface with all known fields
interface PropertyIntelligence {
  // Core upgrade strategy
  suite_upgrade_strategy?: string;
  nua_strategy?: string;
  upgrade_notes?: string;
  suite_ratio?: number;
  upgrade_reliability?: 'high' | 'medium' | 'low' | string;

  // Lists
  key_insights?: string[];
  tips?: string[];
  best_for?: string[];
  best_practices?: string[];
  watch_outs?: string[];

  // Simple insight strings
  lounge_insight?: string;
  breakfast_insight?: string;
  recognition_insight?: string;

  // Ratings
  overall_rating?: number;

  // Structured insights
  upgradeInsight?: UpgradeInsight;
  breakfastInsight?: BreakfastInsight;
  loungeInsight?: LoungeInsight;
  recognitionInsight?: RecognitionInsight;
  lateCheckoutInsight?: LateCheckoutInsight;
  overallRecommendation?: OverallRecommendation;

  // Metadata
  lastUpdated?: string;
  last_researched?: string;
  confidence_level?: string;
  data_sources?: string[];

  // Additional imported fields from elite intelligence
  evs_score?: number;
  suite_upgrade_pct?: number;
  room_upgrade_pct?: number;
  has_lounge?: boolean;
  lounge_quality?: string;
  lounge_hours?: string;
  happy_hour_type?: string;
  breakfast_location?: string;
  breakfast_quality?: number;
  breakfast_notes?: string;
  recognition_style?: string;
  late_checkout_success?: string;
  welcome_amenity?: string;
}

export default function PropertyDetailScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const {
    property: propertyData,
    benefits,
    details,
    upgradeStats,
    evsScore,
    loading,
  } = useProperty(id);

  const { stats: communityStats, loading: communityLoading } = useCommunityStats(id);

  const [intelligence, setIntelligence] = useState<PropertyIntelligence | null>(null);
  const [upgradeAnalysis, setUpgradeAnalysis] = useState<{
    suite_count?: number;
    suite_scarcity?: string;
    suite_upgrade_strategy?: string;
  } | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadIntelligence() {
      const { data: detailsData, error: detailsError } = await supabase
        .from('property_details')
        .select('elite_intelligence')
        .eq('property_id', id)
        .single();

      if (!detailsError && detailsData?.elite_intelligence) {
        const intel = detailsData.elite_intelligence as any;
        setIntelligence(intel as PropertyIntelligence);
        if (intel.upgrade_analysis) {
          setUpgradeAnalysis(intel.upgrade_analysis);
        }
      }
    }

    loadIntelligence();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!propertyData) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center p-4">
        <Text className="text-xl text-gray-600">Property not found</Text>
      </View>
    );
  }

  const suiteUpgradePct = propertyData?.score?.suite_upgrade_pct ?? upgradeStats?.suiteUpgradePct;
  const totalAudits = upgradeStats?.totalAuditsWithRoomData ?? propertyData?.score?.audit_count;
  const suiteConfidence = getUpgradeConfidence(suiteUpgradePct, totalAudits);

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: '#0ea5e9' },
          headerTintColor: '#fff',
          headerShown: true,
          headerBackVisible: true,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView className="flex-1 bg-gray-100">
        {/* Hero Header */}
        <View className="bg-sky-500 px-4 pt-2 pb-6">
          <Text className="text-2xl font-bold text-white">{propertyData.name}</Text>
          <Text className="text-sky-100 mt-1">
            {propertyData.address_full || `${propertyData.city}, ${propertyData.country}`}
          </Text>
          <View className="flex-row items-center mt-3 gap-2">
            {propertyData.brand && (
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-white">
                  {propertyData.brand.name}
                </Text>
              </View>
            )}
            {details?.website_url && (
              <TouchableOpacity
                onPress={() => Linking.openURL(details.website_url!)}
                className="bg-white/20 px-3 py-1 rounded-full flex-row items-center"
              >
                <Text className="text-xs font-semibold text-white">Website</Text>
                <Ionicons name="open-outline" size={12} color="white" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Score Card - Overlapping */}
        <View className="mx-4 -mt-4 bg-white rounded-2xl p-4 shadow-md border border-gray-200">
          <View className="flex-row items-center">
            <EVSBadge
              score={propertyData?.score?.evs_score ?? evsScore?.score}
              size="large"
            />
            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-gray-900">Elite Value Score</Text>
              <View className="flex-row items-center mt-1">
                <TrendIndicator trend={propertyData?.score?.trend_direction} size="small" />
                {(propertyData?.score?.evs_audit_count ?? evsScore?.auditCount) != null && (
                  <Text className="text-xs text-gray-500 ml-2">
                    Based on {propertyData?.score?.evs_audit_count ?? evsScore?.auditCount} reports
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          {(suiteUpgradePct != null || upgradeAnalysis?.suite_count) && (
            <View className="flex-row mt-4 pt-4 border-t border-gray-100">
              {suiteUpgradePct != null && (
                <View className="flex-1 items-center">
                  <Text className="text-xs text-gray-500 mb-1">Suite Upgrades</Text>
                  <Text className="text-lg font-bold" style={{ color: suiteConfidence.color }}>
                    {suiteConfidence.label}
                  </Text>
                </View>
              )}
              {upgradeAnalysis?.suite_count != null && (
                <View className="flex-1 items-center border-l border-gray-100">
                  <Text className="text-xs text-gray-500 mb-1">Suite Inventory</Text>
                  <Text className="text-lg font-bold text-gray-900">
                    {upgradeAnalysis.suite_count}
                  </Text>
                </View>
              )}
              {totalAudits != null && totalAudits > 0 && (
                <View className="flex-1 items-center border-l border-gray-100">
                  <Text className="text-xs text-gray-500 mb-1">Reports</Text>
                  <Text className="text-lg font-bold text-gray-900">{totalAudits}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Community Intel Section */}
        {communityStats && communityStats.audit_count > 0 && (
          <View className="mx-4 mt-4">
            <CommunityIntelSection stats={communityStats} />
          </View>
        )}

        {/* Content */}
        <View className="px-4 mt-4">
          {intelligence ? (
            <IntelligenceContent
              intelligence={intelligence}
              upgradeAnalysis={upgradeAnalysis}
            />
          ) : (
            <NoIntelligenceState propertyName={propertyData.name} />
          )}
        </View>

        {/* Bottom padding */}
        <View className="h-28" />
      </ScrollView>

      {/* Floating Share Button */}
      <View className="absolute bottom-6 left-4 right-4">
        <TouchableOpacity
          className="bg-sky-500 py-4 rounded-xl shadow-lg flex-row items-center justify-center"
          onPress={() => router.push({
            pathname: '/audit',
            params: {
              propertyId: propertyData.id,
              programId: propertyData.brand?.program_id || '',
            }
          })}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={20} color="white" />
          <Text className="text-white text-lg font-semibold ml-2">Share Your Stay</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

/**
 * Reorganized intelligence display with clear sections
 */
function IntelligenceContent({
  intelligence,
  upgradeAnalysis,
}: {
  intelligence: PropertyIntelligence;
  upgradeAnalysis?: { suite_upgrade_strategy?: string } | null;
}) {
  // Collect all insights and tips into arrays
  const allTips = [
    ...(intelligence.tips || []),
    ...(intelligence.key_insights || []),
    ...(intelligence.upgradeInsight?.proTips || []),
    ...(intelligence.best_practices || []),
  ];

  const allWarnings = [
    ...(intelligence.watch_outs || []),
    ...(intelligence.overallRecommendation?.warnings || []),
  ];

  const bestFor = [
    ...(intelligence.best_for || []),
    ...(intelligence.overallRecommendation?.bestFor || []),
  ];

  // Get strategy text
  const strategyText = intelligence.suite_upgrade_strategy ||
    upgradeAnalysis?.suite_upgrade_strategy ||
    intelligence.upgradeInsight?.summary ||
    intelligence.nua_strategy;

  // Get lounge info
  const loungeText = intelligence.lounge_insight || intelligence.loungeInsight?.summary;
  const loungeDetails = intelligence.loungeInsight;

  // Get breakfast info
  const breakfastText = intelligence.breakfast_insight || intelligence.breakfastInsight?.summary;
  const breakfastDetails = intelligence.breakfastInsight;

  // Get recognition info
  const recognitionText = intelligence.recognition_insight || intelligence.recognitionInsight?.summary;

  // Get rating
  const rating = intelligence.overall_rating || intelligence.overallRecommendation?.score;

  return (
    <View>
      {/* Strategy Section */}
      {strategyText && (
        <Section title="Upgrade Strategy" icon="trending-up">
          <Text className="text-gray-700 leading-6">{strategyText}</Text>
          {intelligence.upgrade_notes && (
            <Text className="text-gray-600 leading-6 mt-2">{intelligence.upgrade_notes}</Text>
          )}
        </Section>
      )}

      {/* Best For Tags */}
      {bestFor.length > 0 && (
        <Section title="Best For" icon="star">
          <View className="flex-row flex-wrap gap-2">
            {bestFor.map((item, i) => (
              <View key={i} className="bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                <Text className="text-sm text-emerald-700">{item}</Text>
              </View>
            ))}
          </View>
        </Section>
      )}

      {/* Tips & Insights */}
      {allTips.length > 0 && (
        <Section title="Tips & Insights" icon="bulb">
          {allTips.slice(0, 6).map((tip, i) => (
            <View key={i} className="flex-row items-start mb-3">
              <View className="w-6 h-6 rounded-full bg-amber-50 items-center justify-center mr-3 mt-0.5">
                <Ionicons name="bulb-outline" size={14} color="#d97706" />
              </View>
              <Text className="text-gray-700 flex-1 leading-5">{tip}</Text>
            </View>
          ))}
        </Section>
      )}

      {/* Amenities Grid */}
      {(loungeText || breakfastText || recognitionText) && (
        <Section title="Elite Benefits" icon="gift">
          {loungeText && (
            <AmenityRow
              icon="wine"
              title="Executive Lounge"
              description={loungeText}
              details={loungeDetails ? [
                loungeDetails.quality && `Quality: ${loungeDetails.quality}`,
                loungeDetails.hours && `Hours: ${loungeDetails.hours}`,
                loungeDetails.access && `Access: ${loungeDetails.access}`,
              ].filter(Boolean) as string[] : undefined}
            />
          )}
          {breakfastText && (
            <AmenityRow
              icon="restaurant"
              title="Breakfast"
              description={breakfastText}
              details={breakfastDetails ? [
                breakfastDetails.location && `Location: ${breakfastDetails.location}`,
                breakfastDetails.quality && `Quality: ${breakfastDetails.quality}`,
              ].filter(Boolean) as string[] : undefined}
            />
          )}
          {recognitionText && (
            <AmenityRow
              icon="ribbon"
              title="Elite Recognition"
              description={recognitionText}
            />
          )}
          {intelligence.lateCheckoutInsight && (
            <AmenityRow
              icon="time"
              title="Late Checkout"
              description={intelligence.lateCheckoutInsight.summary || ''}
              details={[
                intelligence.lateCheckoutInsight.typical && `Typical: ${intelligence.lateCheckoutInsight.typical}`,
              ].filter(Boolean) as string[]}
            />
          )}
        </Section>
      )}

      {/* Stats Row */}
      {(intelligence.suite_ratio || intelligence.upgrade_reliability) && (
        <Section title="Stats" icon="stats-chart">
          <View className="flex-row gap-3">
            {intelligence.suite_ratio && (
              <View className="flex-1 bg-blue-50 p-3 rounded-xl border border-blue-100">
                <Text className="text-xs text-blue-600 mb-1">Suite Ratio</Text>
                <Text className="text-xl font-bold text-blue-900">{intelligence.suite_ratio}%</Text>
              </View>
            )}
            {intelligence.upgrade_reliability && (
              <View className={`flex-1 p-3 rounded-xl border ${
                intelligence.upgrade_reliability === 'high' ? 'bg-green-50 border-green-100' :
                intelligence.upgrade_reliability === 'medium' ? 'bg-amber-50 border-amber-100' :
                'bg-gray-50 border-gray-200'
              }`}>
                <Text className={`text-xs mb-1 ${
                  intelligence.upgrade_reliability === 'high' ? 'text-green-600' :
                  intelligence.upgrade_reliability === 'medium' ? 'text-amber-600' :
                  'text-gray-600'
                }`}>Reliability</Text>
                <Text className={`text-xl font-bold capitalize ${
                  intelligence.upgrade_reliability === 'high' ? 'text-green-900' :
                  intelligence.upgrade_reliability === 'medium' ? 'text-amber-900' :
                  'text-gray-900'
                }`}>{intelligence.upgrade_reliability}</Text>
              </View>
            )}
            {rating && (
              <View className="flex-1 bg-purple-50 p-3 rounded-xl border border-purple-100">
                <Text className="text-xs text-purple-600 mb-1">Rating</Text>
                <Text className="text-xl font-bold text-purple-900">{rating}/5</Text>
              </View>
            )}
          </View>
        </Section>
      )}

      {/* Warnings */}
      {allWarnings.length > 0 && (
        <View className="bg-amber-50 rounded-2xl p-4 mb-4 border border-amber-200">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-amber-100 items-center justify-center mr-3">
              <Ionicons name="warning" size={18} color="#d97706" />
            </View>
            <Text className="text-base font-semibold text-amber-900">Watch Out</Text>
          </View>
          {allWarnings.map((warning, i) => (
            <View key={i} className="flex-row items-start mb-2">
              <Text className="text-amber-600 mr-2">•</Text>
              <Text className="text-amber-800 flex-1 leading-5">{warning}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Overall Summary */}
      {intelligence.overallRecommendation?.summary && (
        <Section title="Summary" icon="document-text">
          <Text className="text-gray-700 leading-6 italic">
            "{intelligence.overallRecommendation.summary}"
          </Text>
        </Section>
      )}
    </View>
  );
}

/**
 * Section wrapper component
 */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full bg-sky-50 items-center justify-center mr-3">
          <Ionicons name={icon as any} size={18} color="#0ea5e9" />
        </View>
        <Text className="text-base font-semibold text-gray-900">{title}</Text>
      </View>
      {children}
    </View>
  );
}

/**
 * Amenity row for benefits section
 */
function AmenityRow({
  icon,
  title,
  description,
  details,
}: {
  icon: string;
  title: string;
  description: string;
  details?: string[];
}) {
  return (
    <View className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon as any} size={16} color="#6b7280" />
        <Text className="text-sm font-semibold text-gray-900 ml-2">{title}</Text>
      </View>
      <Text className="text-gray-600 leading-5 ml-6">{description}</Text>
      {details && details.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-2 ml-6">
          {details.map((detail, i) => (
            <Text key={i} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {detail}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Empty state when no intelligence available
 */
function NoIntelligenceState({ propertyName }: { propertyName: string }) {
  return (
    <View className="bg-white rounded-2xl p-6 items-center border border-gray-200">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name="document-text-outline" size={32} color="#9ca3af" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
        Intel Coming Soon
      </Text>
      <Text className="text-gray-500 text-center leading-5">
        We're working on adding elite traveler insights for {propertyName}.
      </Text>
    </View>
  );
}

/**
 * Community Intel Section - displays aggregated stats from user submissions
 * Organized to mirror the AuditForm structure so submissions → display is clear
 */
function CommunityIntelSection({ stats }: { stats: CommunityStats }) {
  // Helper to format score (1-5 scale)
  const formatScore = (value: number | null) => {
    if (value === null) return '-';
    return value.toFixed(1);
  };

  // Calculate upgrade rates
  const upgradeRate = stats.audits_with_room_data > 0
    ? Math.round((stats.upgrade_count / stats.audits_with_room_data) * 100)
    : null;

  const suiteUpgradeRate = stats.suite_eligible_count > 0
    ? Math.round((stats.suite_upgrade_count / stats.suite_eligible_count) * 100)
    : null;

  // Calculate late checkout rate
  const lateCheckoutRate = stats.late_checkout_total > 0
    ? Math.round((stats.late_checkout_granted_count / stats.late_checkout_total) * 100)
    : null;

  // Get top recognition style
  const getTopStyle = (items: { label: string; pct: number | null; color: string }[]) => {
    const valid = items.filter(s => s.pct !== null && s.pct > 0) as { label: string; pct: number; color: string }[];
    if (valid.length === 0) return null;
    return valid.reduce((a, b) => (a.pct > b.pct ? a : b));
  };

  const topRecognition = getTopStyle([
    { label: 'Proactive', pct: stats.recognition_proactive_pct, color: 'green' },
    { label: 'Asked', pct: stats.recognition_asked_pct, color: 'amber' },
    { label: 'Denied', pct: stats.recognition_denied_pct, color: 'red' },
    { label: 'None', pct: stats.recognition_none_pct, color: 'gray' },
  ]);

  const topLoungeQuality = getTopStyle([
    { label: 'Exceptional', pct: stats.lounge_exceptional_pct, color: 'green' },
    { label: 'Good', pct: stats.lounge_good_pct, color: 'emerald' },
    { label: 'Basic', pct: stats.lounge_basic_pct, color: 'amber' },
    { label: 'Poor', pct: stats.lounge_poor_pct, color: 'red' },
    { label: 'None', pct: stats.lounge_none_pct, color: 'gray' },
  ]);

  const topHappyHour = getTopStyle([
    { label: 'Full Meal', pct: stats.happy_hour_full_pct, color: 'green' },
    { label: 'Substantial', pct: stats.happy_hour_substantial_pct, color: 'emerald' },
    { label: 'Light Snacks', pct: stats.happy_hour_light_pct, color: 'amber' },
    { label: 'Drinks Only', pct: stats.happy_hour_drinks_pct, color: 'orange' },
  ]);

  const topBreakfastLocation = getTopStyle([
    { label: 'Restaurant', pct: stats.breakfast_restaurant_pct, color: 'blue' },
    { label: 'Lounge', pct: stats.breakfast_lounge_pct, color: 'purple' },
    { label: 'Both', pct: stats.breakfast_both_pct, color: 'green' },
  ]);

  const topUpgradeEffort = getTopStyle([
    { label: 'Proactive', pct: stats.upgrade_effort_proactive_pct, color: 'green' },
    { label: 'Asked Once', pct: stats.upgrade_effort_asked_once_pct, color: 'emerald' },
    { label: 'Asked Multiple', pct: stats.upgrade_effort_asked_multiple_pct, color: 'amber' },
    { label: 'Negotiated', pct: stats.upgrade_effort_negotiated_pct, color: 'orange' },
    { label: 'Denied', pct: stats.upgrade_effort_denied_pct, color: 'red' },
  ]);

  // Color helper
  const getColorClasses = (color: string) => ({
    bg: color === 'green' ? 'bg-green-50' :
        color === 'emerald' ? 'bg-emerald-50' :
        color === 'amber' ? 'bg-amber-50' :
        color === 'orange' ? 'bg-orange-50' :
        color === 'red' ? 'bg-red-50' :
        color === 'blue' ? 'bg-blue-50' :
        color === 'purple' ? 'bg-purple-50' :
        'bg-gray-50',
    text: color === 'green' ? 'text-green-600' :
          color === 'emerald' ? 'text-emerald-600' :
          color === 'amber' ? 'text-amber-600' :
          color === 'orange' ? 'text-orange-600' :
          color === 'red' ? 'text-red-600' :
          color === 'blue' ? 'text-blue-600' :
          color === 'purple' ? 'text-purple-600' :
          'text-gray-600',
    textBold: color === 'green' ? 'text-green-900' :
              color === 'emerald' ? 'text-emerald-900' :
              color === 'amber' ? 'text-amber-900' :
              color === 'orange' ? 'text-orange-900' :
              color === 'red' ? 'text-red-900' :
              color === 'blue' ? 'text-blue-900' :
              color === 'purple' ? 'text-purple-900' :
              'text-gray-900',
  });

  // Stat badge component
  const StatBadge = ({ label, value, color, suffix }: { label: string; value: string; color: string; suffix?: string }) => {
    const colors = getColorClasses(color);
    return (
      <View className={`${colors.bg} px-3 py-2 rounded-lg`}>
        <Text className={`text-xs ${colors.text}`}>{label}</Text>
        <Text className={`text-base font-semibold ${colors.textBold}`}>
          {value}{suffix && <Text className={`text-xs font-normal ${colors.text}`}>{suffix}</Text>}
        </Text>
      </View>
    );
  };

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-200">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-violet-50 items-center justify-center mr-3">
          <Ionicons name="people" size={18} color="#8b5cf6" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">Community Intel</Text>
          <Text className="text-xs text-gray-500">
            {stats.audit_count} report{stats.audit_count !== 1 ? 's' : ''}
            {stats.latest_audit_date && ` · Latest: ${stats.latest_audit_date}`}
          </Text>
        </View>
      </View>

      {/* Pulse Scores */}
      {(stats.avg_lounge_score || stats.avg_breakfast_score || stats.avg_culture_score) && (
        <View className="mb-4">
          <Text className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Pulse Scores</Text>
          <View className="flex-row gap-2">
            {stats.avg_lounge_score !== null && (
              <View className="flex-1 bg-blue-50 p-3 rounded-xl">
                <Text className="text-xs text-blue-600 mb-1">Lounge</Text>
                <Text className="text-lg font-bold text-blue-900">{formatScore(stats.avg_lounge_score)}/5</Text>
              </View>
            )}
            {stats.avg_breakfast_score !== null && (
              <View className="flex-1 bg-orange-50 p-3 rounded-xl">
                <Text className="text-xs text-orange-600 mb-1">Breakfast</Text>
                <Text className="text-lg font-bold text-orange-900">{formatScore(stats.avg_breakfast_score)}/5</Text>
              </View>
            )}
            {stats.avg_culture_score !== null && (
              <View className="flex-1 bg-purple-50 p-3 rounded-xl">
                <Text className="text-xs text-purple-600 mb-1">Culture</Text>
                <Text className="text-lg font-bold text-purple-900">{formatScore(stats.avg_culture_score)}/5</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Elite Recognition */}
      {topRecognition && (
        <View className="mb-4">
          <Text className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Elite Recognition</Text>
          <View className="flex-row flex-wrap gap-2">
            <StatBadge label="Style" value={topRecognition.label} color={topRecognition.color} />
            {lateCheckoutRate !== null && (
              <StatBadge
                label="Late Checkout"
                value={`${lateCheckoutRate}%`}
                color={lateCheckoutRate >= 80 ? 'green' : lateCheckoutRate >= 50 ? 'amber' : 'red'}
                suffix={` (${stats.late_checkout_granted_count}/${stats.late_checkout_total})`}
              />
            )}
          </View>
        </View>
      )}

      {/* Lounge & Breakfast */}
      {(topLoungeQuality || topHappyHour || topBreakfastLocation) && (
        <View className="mb-4">
          <Text className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Lounge & Breakfast</Text>
          <View className="flex-row flex-wrap gap-2">
            {topLoungeQuality && (
              <StatBadge label="Lounge Quality" value={topLoungeQuality.label} color={topLoungeQuality.color} />
            )}
            {topHappyHour && (
              <StatBadge label="Happy Hour" value={topHappyHour.label} color={topHappyHour.color} />
            )}
            {topBreakfastLocation && (
              <StatBadge label="Breakfast" value={topBreakfastLocation.label} color={topBreakfastLocation.color} />
            )}
          </View>
        </View>
      )}

      {/* Upgrades - Always show this section */}
      <View>
        <Text className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Upgrades</Text>
        <View className="flex-row flex-wrap gap-2">
          {/* Suite Upgrade - Primary metric for elites */}
          {stats.suite_eligible_count > 0 ? (
            <StatBadge
              label="Suite Upgrade"
              value={`${suiteUpgradeRate}%`}
              color={suiteUpgradeRate !== null && suiteUpgradeRate >= 50 ? 'green' : suiteUpgradeRate !== null && suiteUpgradeRate >= 25 ? 'amber' : 'red'}
              suffix={` (${stats.suite_upgrade_count}/${stats.suite_eligible_count})`}
            />
          ) : (
            <View className="bg-gray-50 px-3 py-2 rounded-lg">
              <Text className="text-xs text-gray-500">Suite Upgrade</Text>
              <Text className="text-base font-semibold text-gray-400">No data</Text>
            </View>
          )}
          {/* Any Upgrade */}
          {stats.audits_with_room_data > 0 ? (
            <StatBadge
              label="Any Upgrade"
              value={`${upgradeRate}%`}
              color={upgradeRate !== null && upgradeRate >= 70 ? 'green' : upgradeRate !== null && upgradeRate >= 40 ? 'amber' : 'red'}
              suffix={` (${stats.upgrade_count}/${stats.audits_with_room_data})`}
            />
          ) : (
            <View className="bg-gray-50 px-3 py-2 rounded-lg">
              <Text className="text-xs text-gray-500">Any Upgrade</Text>
              <Text className="text-base font-semibold text-gray-400">No data</Text>
            </View>
          )}
          {topUpgradeEffort && (
            <StatBadge label="How" value={topUpgradeEffort.label} color={topUpgradeEffort.color} />
          )}
          {stats.avg_upgrade_satisfaction !== null && (
            <StatBadge
              label="Quality"
              value={`${formatScore(stats.avg_upgrade_satisfaction)}/5`}
              color={stats.avg_upgrade_satisfaction >= 4 ? 'green' : stats.avg_upgrade_satisfaction >= 3 ? 'amber' : 'red'}
            />
          )}
        </View>
      </View>
    </View>
  );
}
