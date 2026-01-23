import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Tables, Database } from '@/lib/database.types';
import { classifyRoomType, isSuiteUpgrade, isAnyUpgrade } from '@/config/room-type-mappings';
import { calculateEVSFromAudits, EVSResult } from '@/config/scoring';

type Property = Tables<'properties'>;
type PropertyScore = Tables<'property_scores'>;
type PropertyBenefits = Tables<'property_benefits'>;
type Brand = Tables<'brands'>;
type RoomType = Database['public']['Enums']['room_type'];
type StandardizedRoom = Tables<'standardized_rooms'>;

// Property details from the new property_details table
export interface PropertyDetails {
  property_id: string;
  room_count: number | null;
  suite_count: number | null;
  floor_count: number | null;
  year_built: number | null;
  year_renovated: number | null;
  property_category: string | null;
  phone_primary: string | null;
  email: string | null;
  website_url: string | null;
  address_line1: string | null;
  postal_code: string | null;
  state_province: string | null;
  checkin_time: string | null;
  checkout_time: string | null;
  parking_type: string | null;
  parking_fee_daily: number | null;
  brand_property_code: string | null;
  google_place_id: string | null;
  data_source: string | null;
  data_quality_score: number | null;
  last_scraped_at: string | null;
}

// Property lounge information
export interface PropertyLounge {
  id: string;
  property_id: string;
  lounge_name: string | null;
  floor_location: string | null;
  elite_tier_required: string | null;
  breakfast_start: string | null;
  breakfast_end: string | null;
  evening_start: string | null;
  evening_end: string | null;
  has_showers: boolean;
  has_workspace: boolean;
  breakfast_quality: string | null;
  evening_food_quality: string | null;
  report_count: number;
}

// Upgrade statistics calculated from audits
export interface UpgradeStats {
  suiteUpgradePct: number | null;  // % of stays that got suite upgrade
  roomUpgradePct: number | null;   // % of stays that got any upgrade
  totalAuditsWithRoomData: number; // Audits used for calculation
}

// Explicit type for joined query results (Supabase relations aren't typed)
type PropertyQueryResult = Property & {
  brand: (Brand & { program_id: string }) | null;
  score: PropertyScore | null;
};

export interface PropertyWithScore extends Property {
  brand?: (Brand & { program_id?: string }) | null;
  score?: PropertyScore | null;
  // Note: google_rating, google_review_count, and address_full are already in Property base type
}

// Loyalty program type matching the database table
export interface LoyaltyProgram {
  id: string;
  name: string;
  code: string;
  brand_count: number | null;  // Can be null in database
  propertyCount: number;       // Computed from properties, not brands
}

/**
 * Calculate upgrade statistics from audits with room type data
 * This determines what % of stays resulted in suite upgrades vs any upgrades
 */
async function calculateUpgradeStats(
  audits: Tables<'stay_audits'>[],
  brandCode?: string
): Promise<UpgradeStats> {
  // Filter audits that have both booked and received room data
  const auditsWithRoomData = audits.filter(
    (a) => a.booked_category_id && a.received_category_id
  );

  if (auditsWithRoomData.length === 0) {
    return { suiteUpgradePct: null, roomUpgradePct: null, totalAuditsWithRoomData: 0 };
  }

  // Fetch room categories for all booked/received IDs
  const roomIds = new Set<string>();
  auditsWithRoomData.forEach((a) => {
    if (a.booked_category_id) roomIds.add(a.booked_category_id);
    if (a.received_category_id) roomIds.add(a.received_category_id);
  });

  const { data: rooms } = await supabase
    .from('standardized_rooms')
    .select('id, category, room_type')
    .in('id', Array.from(roomIds));

  if (!rooms || rooms.length === 0) {
    return { suiteUpgradePct: null, roomUpgradePct: null, totalAuditsWithRoomData: 0 };
  }

  // Create lookup map
  const roomMap = new Map<string, StandardizedRoom>();
  rooms.forEach((r) => roomMap.set(r.id, r as StandardizedRoom));

  // Count upgrades
  let suiteUpgrades = 0;
  let anyUpgrades = 0;

  for (const audit of auditsWithRoomData) {
    const booked = roomMap.get(audit.booked_category_id!);
    const received = roomMap.get(audit.received_category_id!);

    if (!booked || !received) continue;

    // Get room types (use DB value if set, otherwise classify from name)
    const bookedType: RoomType = booked.room_type || classifyRoomType(booked.category, brandCode);
    const receivedType: RoomType = received.room_type || classifyRoomType(received.category, brandCode);

    if (isSuiteUpgrade(bookedType, receivedType)) {
      suiteUpgrades++;
    }
    if (isAnyUpgrade(bookedType, receivedType)) {
      anyUpgrades++;
    }
  }

  const total = auditsWithRoomData.length;

  return {
    suiteUpgradePct: Math.round((suiteUpgrades / total) * 100),
    roomUpgradePct: Math.round((anyUpgrades / total) * 100),
    totalAuditsWithRoomData: total,
  };
}

interface UsePropertiesOptions {
  search?: string;
  brandId?: string;
  programIds?: string[];  // Filter by loyalty program UUIDs
  sortBy?: 'eri' | 'evs' | 'name' | 'city';
  limit?: number;  // Max properties to fetch (default 100)
}

export function useProperties(options: UsePropertiesOptions = {}) {
  const [properties, setProperties] = useState<PropertyWithScore[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build base query for count
      let countQuery = supabase
        .from('properties')
        .select('*, brand:brands!inner(program_id)', { count: 'exact', head: true });

      // Build query for data
      // When sorting by score, we need to fetch all properties first since
      // Supabase can't sort by joined table columns. We'll sort client-side.
      const needsClientSort = options.sortBy === 'evs' || options.sortBy === 'eri';
      const fetchLimit = needsClientSort ? 500 : (options.limit || 100);

      let query = supabase
        .from('properties')
        .select(`
          *,
          brand:brands!inner(*, program_id),
          score:property_scores(*)
        `)
        .limit(fetchLimit);

      // Apply search filter (searches name, city, country, and keywords)
      if (options.search) {
        const searchFilter = `name.ilike.%${options.search}%,city.ilike.%${options.search}%,country.ilike.%${options.search}%,search_keywords.ilike.%${options.search}%`;
        query = query.or(searchFilter);
        countQuery = countQuery.or(searchFilter);
      }

      // Apply program filter using brand.program_id foreign key
      if (options.programIds && options.programIds.length > 0) {
        query = query.in('brand.program_id', options.programIds);
        countQuery = countQuery.in('brand.program_id', options.programIds);
      } else if (options.brandId) {
        query = query.eq('brand_id', options.brandId);
        countQuery = countQuery.eq('brand_id', options.brandId);
      }

      // Apply server-side sorting for name/city (Supabase can handle these)
      if (options.sortBy === 'name') {
        query = query.order('name', { ascending: true });
      } else if (options.sortBy === 'city') {
        query = query.order('city', { ascending: true });
      }

      // Fetch count and data in parallel
      const [countResult, dataResult] = await Promise.all([
        countQuery,
        query,
      ]);

      if (dataResult.error) {
        setError(dataResult.error.message);
        return;
      }

      setTotalCount(countResult.count || 0);

      // Normalize score data - Supabase returns relations as arrays
      const normalized = (dataResult.data || []).map((p: any) => ({
        ...p,
        score: Array.isArray(p.score) ? p.score[0] || null : p.score,
      }));

      // Sort results - cast to explicit type since Supabase relations aren't typed
      let sorted = normalized as unknown as PropertyQueryResult[];

      // Client-side sorting for score-based sorts (can't sort by joined columns in Supabase)
      if (options.sortBy === 'eri') {
        sorted = sorted.sort((a, b) => {
          const scoreA = a.score?.eri_score ?? 0;
          const scoreB = b.score?.eri_score ?? 0;
          return scoreB - scoreA;
        });
      } else if (options.sortBy === 'evs') {
        sorted = sorted.sort((a, b) => {
          // Properties with EVS scores come first (high to low)
          // Properties without scores go to the bottom
          const scoreA = a.score?.evs_score;
          const scoreB = b.score?.evs_score;
          if (scoreA == null && scoreB == null) return 0;
          if (scoreA == null) return 1;
          if (scoreB == null) return -1;
          return Number(scoreB) - Number(scoreA);
        });
      }
      // name/city sorting is done server-side in the query

      // Apply final limit after client-side sorting
      const finalLimit = options.limit || 100;
      if (sorted.length > finalLimit) {
        sorted = sorted.slice(0, finalLimit);
      }

      setProperties(sorted);
    } catch (err) {
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, [options.search, options.brandId, options.programIds?.join(','), options.sortBy, options.limit]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, totalCount, loading, error, refetch: fetchProperties };
}

export function useProperty(propertyId: string | undefined) {
  const [property, setProperty] = useState<PropertyWithScore | null>(null);
  const [benefits, setBenefits] = useState<PropertyBenefits | null>(null);
  const [details, setDetails] = useState<PropertyDetails | null>(null);
  const [lounges, setLounges] = useState<PropertyLounge[]>([]);
  const [audits, setAudits] = useState<Tables<'stay_audits'>[]>([]);
  const [upgradeStats, setUpgradeStats] = useState<UpgradeStats | null>(null);
  const [evsScore, setEvsScore] = useState<EVSResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch property with brand and score
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select(`
            *,
            brand:brands(*),
            score:property_scores(*)
          `)
          .eq('id', propertyId)
          .single();

        if (propertyError) {
          setError(propertyError.message);
          return;
        }

        // Normalize score - Supabase returns relations as arrays
        const normalizedProperty = {
          ...propertyData,
          score: Array.isArray(propertyData.score) ? propertyData.score[0] || null : propertyData.score,
        };
        setProperty(normalizedProperty as unknown as PropertyQueryResult);

        // Fetch property benefits
        const { data: benefitsData } = await supabase
          .from('property_benefits')
          .select('*')
          .eq('property_id', propertyId)
          .single();

        setBenefits(benefitsData);

        // Fetch property details (new table with extended info)
        const { data: detailsData } = await supabase
          .from('property_details')
          .select('*')
          .eq('property_id', propertyId)
          .single();

        setDetails(detailsData as PropertyDetails | null);

        // Fetch property lounges
        const { data: loungesData } = await supabase
          .from('property_lounges')
          .select('*')
          .eq('property_id', propertyId);

        setLounges((loungesData as PropertyLounge[]) || []);

        // Fetch recent audits for this property
        const { data: auditsData, error: auditsError } = await supabase
          .from('stay_audits')
          .select('*')
          .eq('property_id', propertyId)
          .order('stay_date', { ascending: false })
          .limit(50);  // Fetch more for better upgrade stats calculation

        if (!auditsError && auditsData) {
          setAudits(auditsData);

          // Calculate upgrade statistics from audits
          // Get brand code for brand-specific room classification
          const brandCode = (propertyData as PropertyQueryResult)?.brand?.name?.toLowerCase().split(' ')[0];
          const stats = await calculateUpgradeStats(auditsData, brandCode);
          setUpgradeStats(stats);

          // Calculate EVS (Elite Value Score)
          const hasLounge = (loungesData && loungesData.length > 0) || false;
          const loungeHappyHour = loungesData?.[0]?.evening_food_quality || null;
          const evs = calculateEVSFromAudits(
            auditsData,
            { has_lounge: hasLounge, happy_hour_type: loungeHappyHour },
            { suiteUpgradePct: stats.suiteUpgradePct, roomUpgradePct: stats.roomUpgradePct }
          );
          setEvsScore(evs);
        }
      } catch (err) {
        setError('Failed to fetch property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  return { property, benefits, details, lounges, audits, upgradeStats, evsScore, loading, error };
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (!error && data) {
        setBrands(data);
      }
      setLoading(false);
    };

    fetchBrands();
  }, []);

  return { brands, loading };
}

/**
 * Fetch loyalty programs from database with property counts
 * Now uses the loyalty_programs table instead of hardcoded values
 */
export function useLoyaltyPrograms(search?: string) {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      // Fetch programs from database
      const { data: programData, error: programError } = await supabase
        .from('loyalty_programs')
        .select('*')
        .order('name');

      if (programError || !programData) {
        setLoading(false);
        return;
      }

      // Count properties for each program (filtered by search if provided)
      const programsWithCounts = await Promise.all(
        programData.map(async (program) => {
          let query = supabase
            .from('properties')
            .select('*, brand:brands!inner(program_id)', { count: 'exact', head: true })
            .eq('brand.program_id', program.id);

          if (search) {
            query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,country.ilike.%${search}%,search_keywords.ilike.%${search}%`);
          }

          const { count } = await query;

          return {
            id: program.id,
            name: program.name,
            code: program.code,
            brand_count: program.brand_count,
            propertyCount: count || 0,
          };
        })
      );

      // Sort by property count descending
      programsWithCounts.sort((a, b) => b.propertyCount - a.propertyCount);

      setPrograms(programsWithCounts);
      setLoading(false);
    };

    fetchPrograms();
  }, [search]);

  return { programs, loading };
}

/**
 * Get all brand IDs for a loyalty program
 */
export function getBrandIdsForProgram(programId: string, brands: (Brand & { program_id?: string })[]): string[] {
  return brands
    .filter((b) => b.program_id === programId)
    .map((b) => b.id);
}
