/**
 * Property Detail Screen
 *
 * Displays synthesized elite traveler intelligence for a specific property.
 * This is the core value: instant, actionable insights instead of hours of research.
 */

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useProperty, UpgradeStats } from '../../hooks/useProperty';
import { EVSBadge } from '../../components/EVSBadge';
import { TrendIndicator } from '../../components/TrendIndicator';
import { InfoTooltip } from '../../components/InfoTooltip';
import { getUpgradeConfidence } from '../../lib/upgrade-confidence';

interface PropertyIntelligence {
  propertyId: string;
  propertyName: string;
  upgradeInsight: {
    successRate?: number;
    totalReports: number;
    byStatus?: Record<string, { rate: number; count: number }>;
    recentTrend?: 'improving' | 'declining' | 'stable';
    keyInsights: string[];
  };
  breakfastInsight: {
    location?: 'lounge' | 'restaurant' | 'mixed';
    qualityRating?: number;
    totalReports: number;
    keyInsights: string[];
  };
  loungeInsight: {
    hasLounge: boolean;
    qualityRating?: number;
    totalReports: number;
    keyInsights: string[];
  };
  recognitionInsight: {
    style?: 'proactive' | 'ask_required' | 'inconsistent';
    totalReports: number;
    keyInsights: string[];
  };
  lateCheckoutInsight: {
    successRate?: number;
    totalReports: number;
    keyInsights: string[];
  };
  overallRecommendation: {
    score: number;
    summary: string;
    bestFor?: string[];
    warnings?: string[];
  };
  basedOnReports: number;
  lastUpdated: string;
  sources: any[];
}

interface PropertyData {
  id: string;
  name: string;
  city: string;
  country: string;
  address_full: string | null;
  brands: { name: string } | null;
}

export default function PropertyDetailScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;  // Ensure id is string

  // Use the property hook which fetches scores and calculates upgrade stats
  const {
    property: propertyData,
    benefits,
    details,
    upgradeStats,
    evsScore,
    loading,
    error,
  } = useProperty(id);

  const [intelligence, setIntelligence] = useState<PropertyIntelligence | null>(null);
  const [upgradeAnalysis, setUpgradeAnalysis] = useState<{
    suite_count?: number;
    suite_scarcity?: string;
    suite_upgrade_strategy?: string;
  } | null>(null);

  // Load elite intelligence separately (this is synthesized FlyerTalk data)
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
        // Extract upgrade_analysis if it exists
        if (intel.upgrade_analysis) {
          setUpgradeAnalysis(intel.upgrade_analysis);
        }
      }
    }

    loadIntelligence();
  }, [id]);

  // Map to the local PropertyData interface
  const property: PropertyData | null = propertyData ? {
    id: propertyData.id,
    name: propertyData.name,
    city: propertyData.city,
    country: propertyData.country,
    address_full: propertyData.address_full,
    brands: propertyData.brand ? { name: propertyData.brand.name } : null,
  } : null;

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-4">
        <Text className="text-xl text-gray-600">Property not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: property.name,
          headerStyle: { backgroundColor: '#0ea5e9' },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView className="flex-1 bg-gray-50">
        {/* Property Header */}
        <View className="bg-white p-4 border-b border-gray-200">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text className="text-2xl font-bold text-gray-900">{property.name}</Text>
              {property.address_full ? (
                <Text className="text-sm text-gray-600 mt-1">
                  {property.address_full}
                </Text>
              ) : (
                <Text className="text-sm text-gray-600 mt-1">
                  {property.city}, {property.country}
                </Text>
              )}
              {property.brands && (
                <View className="mt-2 bg-blue-50 px-3 py-1 rounded-full self-start">
                  <Text className="text-xs font-semibold text-blue-700">
                    {property.brands.name}
                  </Text>
                </View>
              )}
            </View>
            {/* Elite Value Score */}
            <View className="items-center">
              <EVSBadge
                score={propertyData?.score?.evs_score ?? evsScore?.score}
                size="large"
              />
              {(propertyData?.score?.evs_audit_count ?? evsScore?.auditCount) != null && (
                <Text className="text-xs text-gray-500 mt-1">
                  {propertyData?.score?.evs_audit_count ?? evsScore?.auditCount} reports
                </Text>
              )}
              <TrendIndicator trend={propertyData?.score?.trend_direction} size="small" />
            </View>
          </View>
        </View>

        {/* Upgrade Stats - Compact with strategy */}
        <UpgradeStatsCard
          suiteUpgradePct={propertyData?.score?.suite_upgrade_pct ?? upgradeStats?.suiteUpgradePct}
          roomUpgradePct={propertyData?.score?.room_upgrade_pct ?? upgradeStats?.roomUpgradePct}
          totalAudits={upgradeStats?.totalAuditsWithRoomData ?? propertyData?.score?.audit_count}
          upgradeAnalysis={upgradeAnalysis}
        />

        {/* Intelligence Display */}
        {intelligence ? (
          <IntelligenceDisplay intelligence={intelligence} />
        ) : (
          <NoIntelligenceState propertyName={property.name} />
        )}
      </ScrollView>
    </>
  );
}

/**
 * Display synthesized intelligence
 * Handles both the new simplified format (string insights) and legacy format (nested objects)
 */
function IntelligenceDisplay({ intelligence }: { intelligence: any }) {
  // Handle new simplified format with string insights
  const hasSimplifiedFormat = typeof intelligence.lounge_insight === 'string' ||
                              typeof intelligence.breakfast_insight === 'string';

  if (hasSimplifiedFormat) {
    return (
      <View className="p-4">
        {/* Best Practices */}
        {intelligence.best_practices && intelligence.best_practices.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">✨ Best Practices</Text>
            {intelligence.best_practices.map((item: string, i: number) => (
              <View key={i} className="flex-row items-start mb-2">
                <Text className="text-green-600 mr-2">✓</Text>
                <Text className="text-sm text-gray-700 flex-1">{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Lounge Insight */}
        {intelligence.lounge_insight && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-2">🛋️ Lounge</Text>
            <Text className="text-gray-700 leading-5">{intelligence.lounge_insight}</Text>
          </View>
        )}

        {/* Breakfast Insight */}
        {intelligence.breakfast_insight && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-2">🍳 Breakfast</Text>
            <Text className="text-gray-700 leading-5">{intelligence.breakfast_insight}</Text>
          </View>
        )}

        {/* Recognition Insight */}
        {intelligence.recognition_insight && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-2">🎖️ Recognition</Text>
            <Text className="text-gray-700 leading-5">{intelligence.recognition_insight}</Text>
          </View>
        )}

        {/* Watch Outs */}
        {intelligence.watch_outs && intelligence.watch_outs.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">⚠️ Watch Outs</Text>
            {intelligence.watch_outs.map((item: string, i: number) => (
              <View key={i} className="flex-row items-start mb-2">
                <Text className="text-amber-600 mr-2">⚠️</Text>
                <Text className="text-sm text-gray-700 flex-1">{item}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  // Legacy format with nested objects
  return (
    <View className="p-4">
      {/* Data Source Info */}
      {intelligence.basedOnReports && (
        <View className="bg-blue-50 rounded-lg p-3 mb-4">
          <Text className="text-xs font-semibold text-blue-900 mb-1">
            🔍 ELITE TRAVELER INTELLIGENCE
          </Text>
          <Text className="text-xs text-blue-700">
            Based on {intelligence.basedOnReports} real traveler reports
          </Text>
          {intelligence.lastUpdated && (
            <Text className="text-xs text-blue-600 mt-1">
              Last updated: {new Date(intelligence.lastUpdated).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Overall Recommendation */}
      {intelligence.overallRecommendation && (
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <Text className="text-lg font-bold text-gray-900 flex-1">Overall Rating</Text>
            {intelligence.overallRecommendation.score && (
              <View className="bg-blue-500 rounded-full px-3 py-1">
                <Text className="text-white font-bold">
                  {intelligence.overallRecommendation.score}/5
                </Text>
              </View>
            )}
          </View>
          {intelligence.overallRecommendation.summary && (
            <Text className="text-gray-700 leading-5 mb-3">
              {intelligence.overallRecommendation.summary}
            </Text>
          )}

          {intelligence.overallRecommendation.bestFor && intelligence.overallRecommendation.bestFor.length > 0 && (
            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Best For:</Text>
              {intelligence.overallRecommendation.bestFor.map((item: string, i: number) => (
                <View key={i} className="flex-row items-start mb-1">
                  <Text className="text-green-600 mr-2">✓</Text>
                  <Text className="text-sm text-gray-700 flex-1">{item}</Text>
                </View>
              ))}
            </View>
          )}

          {intelligence.overallRecommendation.warnings && intelligence.overallRecommendation.warnings.length > 0 && (
            <View>
              <Text className="text-sm font-semibold text-gray-900 mb-2">Warnings:</Text>
              {intelligence.overallRecommendation.warnings.map((item: string, i: number) => (
                <View key={i} className="flex-row items-start mb-1">
                  <Text className="text-amber-600 mr-2">⚠️</Text>
                  <Text className="text-sm text-gray-700 flex-1">{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Breakfast */}
      {intelligence.breakfastInsight?.totalReports >= 3 && (
        <InsightCard
          title="🍳 Elite Breakfast"
          icon="🍳"
          insights={intelligence.breakfastInsight.keyInsights || []}
        >
          <View className="flex-row justify-between mb-2">
            {intelligence.breakfastInsight.location && (
              <View>
                <Text className="text-xs text-gray-500">Location</Text>
                <Text className="text-sm font-semibold text-gray-900 capitalize">
                  {intelligence.breakfastInsight.location.replace('_', ' ')}
                </Text>
              </View>
            )}
            {intelligence.breakfastInsight.qualityRating && (
              <View>
                <Text className="text-xs text-gray-500">Quality</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {intelligence.breakfastInsight.qualityRating.toFixed(1)}/5 ⭐
                </Text>
              </View>
            )}
          </View>
        </InsightCard>
      )}

      {/* Lounge */}
      {intelligence.loungeInsight?.hasLounge && intelligence.loungeInsight?.totalReports >= 3 && (
        <InsightCard
          title="🍷 Executive Lounge"
          icon="🍷"
          insights={intelligence.loungeInsight?.keyInsights || []}
        >
          {intelligence.loungeInsight?.qualityRating && (
            <View className="mb-2">
              <Text className="text-xs text-gray-500">Quality Rating</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {intelligence.loungeInsight.qualityRating.toFixed(1)}/5 ⭐
              </Text>
            </View>
          )}
        </InsightCard>
      )}

      {/* Recognition */}
      {intelligence.recognitionInsight?.totalReports >= 3 && (
        <InsightCard
          title="👋 Elite Recognition"
          icon="👋"
          insights={intelligence.recognitionInsight?.keyInsights || []}
        >
          {intelligence.recognitionInsight?.style && (
            <View className="mb-2">
              <Text className="text-xs text-gray-500">Recognition Style</Text>
              <Text className="text-sm font-semibold text-gray-900 capitalize">
                {intelligence.recognitionInsight.style.replace('_', ' ')}
              </Text>
            </View>
          )}
        </InsightCard>
      )}

      {/* Late Checkout */}
      {intelligence.lateCheckoutInsight?.totalReports >= 3 && (
        <InsightCard
          title="⏰ Late Checkout"
          icon="⏰"
          insights={intelligence.lateCheckoutInsight?.keyInsights || []}
        >
          {intelligence.lateCheckoutInsight?.successRate !== undefined && (
            <View className="mb-2">
              <Text className="text-xs text-gray-500">Success Rate</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {(intelligence.lateCheckoutInsight.successRate * 100).toFixed(0)}%
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                Based on {intelligence.lateCheckoutInsight.totalReports} reports
              </Text>
            </View>
          )}
        </InsightCard>
      )}

      {/* Sources */}
      {intelligence.sources && intelligence.sources.length > 0 && (
        <View className="bg-gray-100 rounded-lg p-3 mt-4">
          <Text className="text-xs font-semibold text-gray-700 mb-2">Data Sources</Text>
          <Text className="text-xs text-gray-600">
            Intelligence synthesized from {intelligence.sources.length} traveler reports across{' '}
            FlyerTalk, Reddit, and travel blogs.
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Reusable insight card component
 */
function InsightCard({
  title,
  icon,
  insights,
  children,
}: {
  title: string;
  icon: string;
  insights: string[];
  children?: React.ReactNode;
}) {
  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-bold text-gray-900 mb-3">{title}</Text>

      {children}

      {insights.length > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <Text className="text-xs font-semibold text-gray-500 mb-2">💡 KEY INSIGHTS</Text>
          {insights.map((insight, i) => (
            <View key={i} className="flex-row items-start mb-2">
              <Text className="text-blue-500 mr-2 text-xs">•</Text>
              <Text className="text-sm text-gray-700 flex-1">{insight}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Show when no intelligence has been generated yet
 */
function NoIntelligenceState({ propertyName }: { propertyName: string }) {
  return (
    <View className="p-4">
      <View className="bg-white rounded-xl p-6 items-center">
        <Text className="text-6xl mb-4">🔍</Text>
        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          Intelligence Not Yet Available
        </Text>
        <Text className="text-gray-600 text-center mb-4">
          We haven't synthesized elite traveler intelligence for {propertyName} yet.
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          Intelligence is generated by analyzing real traveler reports from FlyerTalk, Reddit,
          and travel blogs. Check back soon!
        </Text>
      </View>

      {/* Coming Soon Features */}
      <View className="mt-6">
        <Text className="text-sm font-semibold text-gray-700 mb-3">What you'll see once generated:</Text>

        <View className="bg-gray-50 rounded-lg p-3 mb-2">
          <Text className="text-sm font-semibold text-gray-900">🏨 Suite Upgrade Rates</Text>
          <Text className="text-xs text-gray-600 mt-1">
            Success rates by elite status based on real reports
          </Text>
        </View>

        <View className="bg-gray-50 rounded-lg p-3 mb-2">
          <Text className="text-sm font-semibold text-gray-900">🍳 Breakfast Quality</Text>
          <Text className="text-xs text-gray-600 mt-1">
            Where breakfast is served and quality ratings
          </Text>
        </View>

        <View className="bg-gray-50 rounded-lg p-3 mb-2">
          <Text className="text-sm font-semibold text-gray-900">🍷 Lounge Experience</Text>
          <Text className="text-xs text-gray-600 mt-1">
            Executive lounge quality and access patterns
          </Text>
        </View>

        <View className="bg-gray-50 rounded-lg p-3">
          <Text className="text-sm font-semibold text-gray-900">💡 Key Insights</Text>
          <Text className="text-xs text-gray-600 mt-1">
            Specific tips from experienced elite travelers
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Compact Upgrade Card - Shows key stats + strategy in one place
 */
function UpgradeStatsCard({
  suiteUpgradePct,
  roomUpgradePct,
  totalAudits,
  upgradeAnalysis,
}: {
  suiteUpgradePct?: number | null;
  roomUpgradePct?: number | null;
  totalAudits?: number | null;
  upgradeAnalysis?: {
    suite_count?: number;
    suite_scarcity?: string;
    suite_upgrade_strategy?: string;
  } | null;
}) {
  // Don't show if no data at all
  if (suiteUpgradePct == null && roomUpgradePct == null && !upgradeAnalysis?.suite_upgrade_strategy) {
    return null;
  }

  const scarcityColors: Record<string, string> = {
    'very_limited': 'text-red-600',
    'limited': 'text-orange-600',
    'moderate': 'text-yellow-600',
    'abundant': 'text-green-600',
    'all_suites': 'text-blue-600',
  };

  const scarcityLabels: Record<string, string> = {
    'very_limited': 'Very Limited',
    'limited': 'Limited',
    'moderate': 'Moderate',
    'abundant': 'Abundant',
    'all_suites': 'All Suites',
  };

  // Calculate confidence tier for suite upgrades
  const suiteConfidence = getUpgradeConfidence(suiteUpgradePct, totalAudits);

  return (
    <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
      {/* Compact stats row */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-bold text-gray-900">Suite Upgrades</Text>
        <View className="flex-row items-center">
          {suiteUpgradePct != null && (
            <View className="flex-row items-center bg-purple-100 px-3 py-1 rounded-full mr-2">
              <Text
                className="text-sm font-bold"
                style={{ color: suiteConfidence.color }}
              >
                {suiteConfidence.label}
              </Text>
              <InfoTooltip
                title="Suite Upgrade Likelihood"
                explanation={suiteConfidence.explanation}
                size={14}
                color={suiteConfidence.color}
              />
            </View>
          )}
          {upgradeAnalysis?.suite_count != null && (
            <Text className="text-xs text-gray-500">
              {upgradeAnalysis.suite_count} suites
              {upgradeAnalysis.suite_scarcity && (
                <Text className={scarcityColors[upgradeAnalysis.suite_scarcity] || 'text-gray-500'}>
                  {' '}({scarcityLabels[upgradeAnalysis.suite_scarcity] || upgradeAnalysis.suite_scarcity})
                </Text>
              )}
            </Text>
          )}
        </View>
      </View>

      {/* Strategy paragraph - the key insight */}
      {upgradeAnalysis?.suite_upgrade_strategy && (
        <Text className="text-sm text-gray-700 leading-5">
          {upgradeAnalysis.suite_upgrade_strategy}
        </Text>
      )}

      {/* Minimal footer */}
      {totalAudits != null && totalAudits > 0 && (
        <Text className="text-xs text-gray-400 mt-3">
          Based on {totalAudits} {totalAudits === 1 ? 'report' : 'reports'}
        </Text>
      )}
    </View>
  );
}
