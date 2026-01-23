import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TablesInsert, Tables, Enums } from '@/lib/database.types';
import { useAuth } from './useAuth';

type StayAudit = Tables<'stay_audits'>;
type StayAuditInsert = TablesInsert<'stay_audits'>;

export interface AuditFormData {
  propertyId: string;
  tierId?: string;
  bookedCategoryId?: string;
  receivedCategoryId?: string;
  recognitionStyle: Enums<'recognition_style'>;
  loungeScore?: number;
  breakfastScore?: number;
  cultureScore?: number;
  stayDate: string;
  notes?: string;
  breakfastLocation?: Enums<'breakfast_location'>;
  happyHourType?: Enums<'happy_hour_type'>;
  loungeQuality?: Enums<'lounge_quality'>;
  lateCheckoutGranted?: boolean;
  actualCheckoutTime?: string;
}

export function useAudit() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAudit = async (formData: AuditFormData): Promise<StayAudit | null> => {
    if (!user) {
      setError('You must be logged in to submit an audit');
      return null;
    }

    setSubmitting(true);
    setError(null);

    try {
      const audit: StayAuditInsert = {
        user_id: user.id,
        property_id: formData.propertyId,
        tier_id: formData.tierId,
        booked_category_id: formData.bookedCategoryId,
        received_category_id: formData.receivedCategoryId,
        recognition_style: formData.recognitionStyle,
        lounge_score: formData.loungeScore,
        breakfast_score: formData.breakfastScore,
        culture_score: formData.cultureScore,
        stay_date: formData.stayDate,
        notes: formData.notes,
        breakfast_location: formData.breakfastLocation,
        happy_hour_type: formData.happyHourType,
        lounge_quality: formData.loungeQuality,
        late_checkout_granted: formData.lateCheckoutGranted,
        actual_checkout_time: formData.actualCheckoutTime,
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

export function useUserAudits() {
  const { user } = useAuth();
  const [audits, setAudits] = useState<StayAudit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('stay_audits')
      .select(`
        *,
        property:properties(name, city)
      `)
      .eq('user_id', user.id)
      .order('stay_date', { ascending: false });

    if (!error && data) {
      setAudits(data);
    }
    setLoading(false);
  };

  return { audits, loading, refetch: fetchAudits };
}

export function useLoyaltyTiers(brandId?: string) {
  const [tiers, setTiers] = useState<Tables<'loyalty_tiers'>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTiers = async () => {
    let query = supabase
      .from('loyalty_tiers')
      .select('*')
      .order('level', { ascending: true });

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setTiers(data);
    }
    setLoading(false);
  };

  return { tiers, loading, fetchTiers };
}

export function useRoomCategories(brandId?: string) {
  const [categories, setCategories] = useState<Tables<'standardized_rooms'>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    let query = supabase
      .from('standardized_rooms')
      .select('*')
      .order('tier', { ascending: true });

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  };

  return { categories, loading, fetchCategories };
}
