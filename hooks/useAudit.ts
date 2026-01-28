import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TablesInsert, Tables, Enums } from '@/lib/database.types';

type StayAudit = Tables<'stay_audits'>;
type StayAuditInsert = TablesInsert<'stay_audits'>;

export interface AuditFormData {
  propertyId: string;
  tierId?: string;
  bookedRoomType?: Enums<'room_type'>;
  receivedRoomType?: Enums<'room_type'>;
  recognitionStyle: Enums<'recognition_style'>;
  loungeScore?: number;
  breakfastScore?: number;
  cultureScore?: number;
  stayDate: string;
  notes?: string;
  // Elite Benefits
  breakfastLocation?: Enums<'breakfast_location'>;
  happyHourType?: Enums<'happy_hour_type'>;
  loungeQuality?: Enums<'lounge_quality'>;
  lateCheckoutGranted?: boolean;
  actualCheckoutTime?: string;
  // Upgrade Experience (how good was the upgrade, not just what room)
  upgradeEffort?: Enums<'upgrade_effort'>;
  upgradeSatisfaction?: number; // 1-5
  upgradeRoomQuality?: Enums<'upgrade_room_quality'>;
  upgradeLocationQuality?: Enums<'upgrade_location_quality'>;
  upgradeNotes?: string;
}

export function useAudit() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAudit = async (formData: AuditFormData): Promise<StayAudit | null> => {
    setSubmitting(true);
    setError(null);

    try {
      const audit: StayAuditInsert = {
        user_id: null,
        property_id: formData.propertyId,
        tier_id: formData.tierId,
        booked_room_type: formData.bookedRoomType,
        received_room_type: formData.receivedRoomType,
        recognition_style: formData.recognitionStyle,
        lounge_score: formData.loungeScore,
        breakfast_score: formData.breakfastScore,
        culture_score: formData.cultureScore,
        stay_date: formData.stayDate,
        notes: formData.notes,
        // Elite Benefits
        breakfast_location: formData.breakfastLocation,
        happy_hour_type: formData.happyHourType,
        lounge_quality: formData.loungeQuality,
        late_checkout_granted: formData.lateCheckoutGranted,
        actual_checkout_time: formData.actualCheckoutTime,
        // Upgrade Experience
        upgrade_effort: formData.upgradeEffort,
        upgrade_satisfaction: formData.upgradeSatisfaction,
        upgrade_room_quality: formData.upgradeRoomQuality,
        upgrade_location_quality: formData.upgradeLocationQuality,
        upgrade_notes: formData.upgradeNotes,
      };

      const { data, error: submitError } = await supabase
        .from('stay_audits')
        .insert(audit)
        .select()
        .single();

      if (submitError) {
        if (submitError.code === '23505') {
          setError('You have already submitted an audit for this property on this date');
        } else {
          setError(submitError.message);
        }
        return null;
      }

      return data;
    } catch (err) {
      setError('Failed to submit audit');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitAudit, submitting, error };
}

export function useLoyaltyTiers(programId?: string) {
  const [tiers, setTiers] = useState<Tables<'loyalty_tiers'>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTiers = async () => {
    let query = supabase
      .from('loyalty_tiers')
      .select('*')
      .order('level', { ascending: true });

    if (programId) {
      query = query.eq('program_id', programId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setTiers(data);
    }
    setLoading(false);
  };

  return { tiers, loading, fetchTiers };
}

// Standardized room types for upgrade tracking (not specific hotel room names)
export interface RoomCategory {
  id: Enums<'room_type'>;
  name: string;
  tier: number;
}

const STANDARD_ROOM_CATEGORIES: RoomCategory[] = [
  { id: 'standard', name: 'Standard Room', tier: 1 },
  { id: 'premium', name: 'Premium Room', tier: 2 },
  { id: 'junior_suite', name: 'Junior Suite', tier: 3 },
  { id: 'suite', name: 'Suite', tier: 4 },
  { id: 'specialty', name: 'Specialty Suite', tier: 5 },
];

export function useRoomCategories(_programId?: string) {
  // Use standardized room types, not specific hotel room names
  // This allows consistent upgrade tracking across all properties
  return {
    categories: STANDARD_ROOM_CATEGORIES,
    loading: false,
    fetchCategories: () => {}
  };
}
