export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      brand_clauses: {
        Row: {
          benefit_key: string
          brand_id: string | null
          created_at: string | null
          id: string
          legal_text: string | null
          verbal_script: string | null
        }
        Insert: {
          benefit_key: string
          brand_id?: string | null
          created_at?: string | null
          id?: string
          legal_text?: string | null
          verbal_script?: string | null
        }
        Update: {
          benefit_key?: string
          brand_id?: string | null
          created_at?: string | null
          id?: string
          legal_text?: string | null
          verbal_script?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_clauses_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          logo_url: string | null
          name: string
          program_id: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          logo_url?: string | null
          name: string
          program_id?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          logo_url?: string | null
          name?: string
          program_id?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "loyalty_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_programs: {
        Row: {
          brand_count: number | null
          code: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          brand_count?: number | null
          code: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          brand_count?: number | null
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_tiers: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          level: number
          name: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          level: number
          name: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          level?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          primary_tier_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          primary_tier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          primary_tier_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_primary_tier_id_fkey"
            columns: ["primary_tier_id"]
            isOneToOne: false
            referencedRelation: "loyalty_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address_full: string | null
          brand_id: string | null
          city: string
          country: string
          created_at: string | null
          google_rating: number | null
          google_review_count: number | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          lat: number | null
          lng: number | null
          name: string
          search_keywords: string | null
          source_id: string | null
        }
        Insert: {
          address_full?: string | null
          brand_id?: string | null
          city: string
          country: string
          created_at?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          search_keywords?: string | null
          source_id?: string | null
        }
        Update: {
          address_full?: string | null
          brand_id?: string | null
          city?: string
          country?: string
          created_at?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          search_keywords?: string | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      property_benefits: {
        Row: {
          breakfast_location:
            | Database["public"]["Enums"]["breakfast_location"]
            | null
          breakfast_notes: string | null
          breakfast_quality: number | null
          checkout_notes: string | null
          elite_floor_available: boolean | null
          happy_hour_hours: string | null
          happy_hour_notes: string | null
          happy_hour_type: Database["public"]["Enums"]["happy_hour_type"] | null
          has_lounge: boolean | null
          last_updated: string | null
          late_checkout_policy:
            | Database["public"]["Enums"]["checkout_policy"]
            | null
          lounge_has_showers: boolean | null
          lounge_has_workspace: boolean | null
          lounge_hours: string | null
          lounge_notes: string | null
          lounge_quality: Database["public"]["Enums"]["lounge_quality"] | null
          property_id: string
          report_count: number | null
          suite_upgrade_likelihood: number | null
          typical_checkout_time: string | null
          welcome_amenity_typical: string | null
        }
        Insert: {
          breakfast_location?:
            | Database["public"]["Enums"]["breakfast_location"]
            | null
          breakfast_notes?: string | null
          breakfast_quality?: number | null
          checkout_notes?: string | null
          elite_floor_available?: boolean | null
          happy_hour_hours?: string | null
          happy_hour_notes?: string | null
          happy_hour_type?:
            | Database["public"]["Enums"]["happy_hour_type"]
            | null
          has_lounge?: boolean | null
          last_updated?: string | null
          late_checkout_policy?:
            | Database["public"]["Enums"]["checkout_policy"]
            | null
          lounge_has_showers?: boolean | null
          lounge_has_workspace?: boolean | null
          lounge_hours?: string | null
          lounge_notes?: string | null
          lounge_quality?: Database["public"]["Enums"]["lounge_quality"] | null
          property_id: string
          report_count?: number | null
          suite_upgrade_likelihood?: number | null
          typical_checkout_time?: string | null
          welcome_amenity_typical?: string | null
        }
        Update: {
          breakfast_location?:
            | Database["public"]["Enums"]["breakfast_location"]
            | null
          breakfast_notes?: string | null
          breakfast_quality?: number | null
          checkout_notes?: string | null
          elite_floor_available?: boolean | null
          happy_hour_hours?: string | null
          happy_hour_notes?: string | null
          happy_hour_type?:
            | Database["public"]["Enums"]["happy_hour_type"]
            | null
          has_lounge?: boolean | null
          last_updated?: string | null
          late_checkout_policy?:
            | Database["public"]["Enums"]["checkout_policy"]
            | null
          lounge_has_showers?: boolean | null
          lounge_has_workspace?: boolean | null
          lounge_hours?: string | null
          lounge_notes?: string | null
          lounge_quality?: Database["public"]["Enums"]["lounge_quality"] | null
          property_id?: string
          report_count?: number | null
          suite_upgrade_likelihood?: number | null
          typical_checkout_time?: string | null
          welcome_amenity_typical?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_benefits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_details: {
        Row: {
          address_line1: string | null
          brand_property_code: string | null
          checkin_time: string | null
          checkout_time: string | null
          created_at: string | null
          data_quality_score: number | null
          data_source: string | null
          elite_intelligence: Json | null
          email: string | null
          floor_count: number | null
          google_place_id: string | null
          last_intelligence_update: string | null
          last_scraped_at: string | null
          parking_fee_daily: number | null
          parking_type: Database["public"]["Enums"]["parking_type"] | null
          phone_primary: string | null
          postal_code: string | null
          property_category:
            | Database["public"]["Enums"]["property_category"]
            | null
          property_id: string
          room_count: number | null
          state_province: string | null
          suite_count: number | null
          updated_at: string | null
          website_url: string | null
          year_built: number | null
          year_renovated: number | null
        }
        Insert: {
          address_line1?: string | null
          brand_property_code?: string | null
          checkin_time?: string | null
          checkout_time?: string | null
          created_at?: string | null
          data_quality_score?: number | null
          data_source?: string | null
          elite_intelligence?: Json | null
          email?: string | null
          floor_count?: number | null
          google_place_id?: string | null
          last_intelligence_update?: string | null
          last_scraped_at?: string | null
          parking_fee_daily?: number | null
          parking_type?: Database["public"]["Enums"]["parking_type"] | null
          phone_primary?: string | null
          postal_code?: string | null
          property_category?:
            | Database["public"]["Enums"]["property_category"]
            | null
          property_id: string
          room_count?: number | null
          state_province?: string | null
          suite_count?: number | null
          updated_at?: string | null
          website_url?: string | null
          year_built?: number | null
          year_renovated?: number | null
        }
        Update: {
          address_line1?: string | null
          brand_property_code?: string | null
          checkin_time?: string | null
          checkout_time?: string | null
          created_at?: string | null
          data_quality_score?: number | null
          data_source?: string | null
          elite_intelligence?: Json | null
          email?: string | null
          floor_count?: number | null
          google_place_id?: string | null
          last_intelligence_update?: string | null
          last_scraped_at?: string | null
          parking_fee_daily?: number | null
          parking_type?: Database["public"]["Enums"]["parking_type"] | null
          phone_primary?: string | null
          postal_code?: string | null
          property_category?:
            | Database["public"]["Enums"]["property_category"]
            | null
          property_id?: string
          room_count?: number | null
          state_province?: string | null
          suite_count?: number | null
          updated_at?: string | null
          website_url?: string | null
          year_built?: number | null
          year_renovated?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_details_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_lounges: {
        Row: {
          breakfast_end: string | null
          breakfast_quality: string | null
          breakfast_start: string | null
          created_at: string | null
          elite_tier_required: string | null
          evening_end: string | null
          evening_food_quality: string | null
          evening_start: string | null
          floor_location: string | null
          has_showers: boolean | null
          has_workspace: boolean | null
          id: string
          lounge_name: string | null
          property_id: string | null
          report_count: number | null
        }
        Insert: {
          breakfast_end?: string | null
          breakfast_quality?: string | null
          breakfast_start?: string | null
          created_at?: string | null
          elite_tier_required?: string | null
          evening_end?: string | null
          evening_food_quality?: string | null
          evening_start?: string | null
          floor_location?: string | null
          has_showers?: boolean | null
          has_workspace?: boolean | null
          id?: string
          lounge_name?: string | null
          property_id?: string | null
          report_count?: number | null
        }
        Update: {
          breakfast_end?: string | null
          breakfast_quality?: string | null
          breakfast_start?: string | null
          created_at?: string | null
          elite_tier_required?: string | null
          evening_end?: string | null
          evening_food_quality?: string | null
          evening_start?: string | null
          floor_location?: string | null
          has_showers?: boolean | null
          has_workspace?: boolean | null
          id?: string
          lounge_name?: string | null
          property_id?: string | null
          report_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_lounges_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_scores: {
        Row: {
          audit_count: number | null
          eri_score: number | null
          evs_audit_count: number | null
          evs_last_calculated: string | null
          evs_score: number | null
          honesty_gap_score: number | null
          last_calculated: string | null
          property_id: string
          room_upgrade_pct: number | null
          suite_upgrade_pct: number | null
          trend_direction: Database["public"]["Enums"]["trend_direction"] | null
          upgrade_prob_pct: number | null
        }
        Insert: {
          audit_count?: number | null
          eri_score?: number | null
          evs_audit_count?: number | null
          evs_last_calculated?: string | null
          evs_score?: number | null
          honesty_gap_score?: number | null
          last_calculated?: string | null
          property_id: string
          room_upgrade_pct?: number | null
          suite_upgrade_pct?: number | null
          trend_direction?:
            | Database["public"]["Enums"]["trend_direction"]
            | null
          upgrade_prob_pct?: number | null
        }
        Update: {
          audit_count?: number | null
          eri_score?: number | null
          evs_audit_count?: number | null
          evs_last_calculated?: string | null
          evs_score?: number | null
          honesty_gap_score?: number | null
          last_calculated?: string | null
          property_id?: string
          room_upgrade_pct?: number | null
          suite_upgrade_pct?: number | null
          trend_direction?:
            | Database["public"]["Enums"]["trend_direction"]
            | null
          upgrade_prob_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_scores_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_jobs: {
        Row: {
          brand_code: string | null
          completed_at: string | null
          created_at: string | null
          error_log: Json | null
          id: string
          job_type: string
          processed_items: number | null
          properties_added: number | null
          properties_updated: number | null
          started_at: string | null
          status: string | null
          total_items: number | null
        }
        Insert: {
          brand_code?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_log?: Json | null
          id?: string
          job_type: string
          processed_items?: number | null
          properties_added?: number | null
          properties_updated?: number | null
          started_at?: string | null
          status?: string | null
          total_items?: number | null
        }
        Update: {
          brand_code?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_log?: Json | null
          id?: string
          job_type?: string
          processed_items?: number | null
          properties_added?: number | null
          properties_updated?: number | null
          started_at?: string | null
          status?: string | null
          total_items?: number | null
        }
        Relationships: []
      }
      standardized_rooms: {
        Row: {
          brand_id: string | null
          category: string
          created_at: string | null
          id: string
          room_type: Database["public"]["Enums"]["room_type"] | null
          tier: number
        }
        Insert: {
          brand_id?: string | null
          category: string
          created_at?: string | null
          id?: string
          room_type?: Database["public"]["Enums"]["room_type"] | null
          tier: number
        }
        Update: {
          brand_id?: string | null
          category?: string
          created_at?: string | null
          id?: string
          room_type?: Database["public"]["Enums"]["room_type"] | null
          tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "standardized_rooms_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      stay_audits: {
        Row: {
          actual_checkout_time: string | null
          booked_category_id: string | null
          breakfast_location:
            | Database["public"]["Enums"]["breakfast_location"]
            | null
          breakfast_score: number | null
          created_at: string | null
          culture_score: number | null
          elite_consistency_score: number | null
          happy_hour_type: Database["public"]["Enums"]["happy_hour_type"] | null
          hard_product_score: number | null
          honesty_gap_screenshot_url: string | null
          id: string
          late_checkout_granted: boolean | null
          lounge_quality: Database["public"]["Enums"]["lounge_quality"] | null
          lounge_score: number | null
          notes: string | null
          property_id: string
          received_category_id: string | null
          recognition_style: Database["public"]["Enums"]["recognition_style"]
          stay_date: string
          tier_id: string | null
          transit_time_minutes: number | null
          user_id: string | null
          welcome_amenity: string | null
        }
        Insert: {
          actual_checkout_time?: string | null
          booked_category_id?: string | null
          breakfast_location?:
            | Database["public"]["Enums"]["breakfast_location"]
            | null
          breakfast_score?: number | null
          created_at?: string | null
          culture_score?: number | null
          elite_consistency_score?: number | null
          happy_hour_type?:
            | Database["public"]["Enums"]["happy_hour_type"]
            | null
          hard_product_score?: number | null
          honesty_gap_screenshot_url?: string | null
          id?: string
          late_checkout_granted?: boolean | null
          lounge_quality?: Database["public"]["Enums"]["lounge_quality"] | null
          lounge_score?: number | null
          notes?: string | null
          property_id: string
          received_category_id?: string | null
          recognition_style: Database["public"]["Enums"]["recognition_style"]
          stay_date: string
          tier_id?: string | null
          transit_time_minutes?: number | null
          user_id?: string | null
          welcome_amenity?: string | null
        }
        Update: {
          actual_checkout_time?: string | null
          booked_category_id?: string | null
          breakfast_location?:
            | Database["public"]["Enums"]["breakfast_location"]
            | null
          breakfast_score?: number | null
          created_at?: string | null
          culture_score?: number | null
          elite_consistency_score?: number | null
          happy_hour_type?:
            | Database["public"]["Enums"]["happy_hour_type"]
            | null
          hard_product_score?: number | null
          honesty_gap_screenshot_url?: string | null
          id?: string
          late_checkout_granted?: boolean | null
          lounge_quality?: Database["public"]["Enums"]["lounge_quality"] | null
          lounge_score?: number | null
          notes?: string | null
          property_id?: string
          received_category_id?: string | null
          recognition_style?: Database["public"]["Enums"]["recognition_style"]
          stay_date?: string
          tier_id?: string | null
          transit_time_minutes?: number | null
          user_id?: string | null
          welcome_amenity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stay_audits_booked_category_id_fkey"
            columns: ["booked_category_id"]
            isOneToOne: false
            referencedRelation: "standardized_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_audits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_audits_received_category_id_fkey"
            columns: ["received_category_id"]
            isOneToOne: false
            referencedRelation: "standardized_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_audits_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "loyalty_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_audits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          brands_added: number | null
          completed_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          program: string | null
          properties_added: number | null
          properties_updated: number | null
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          brands_added?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          program?: string | null
          properties_added?: number | null
          properties_updated?: number | null
          started_at?: string | null
          status: string
          sync_type: string
        }
        Update: {
          brands_added?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          program?: string | null
          properties_added?: number | null
          properties_updated?: number | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aggregate_property_benefits: {
        Args: { p_property_id: string }
        Returns: undefined
      }
    }
    Enums: {
      breakfast_location:
        | "restaurant"
        | "lounge"
        | "both"
        | "room_service"
        | "none"
      checkout_policy:
        | "guaranteed_late"
        | "subject_to_availability"
        | "rarely_granted"
        | "no_benefit"
      happy_hour_type:
        | "full_meal"
        | "substantial_appetizers"
        | "light_snacks"
        | "drinks_only"
        | "none"
      lounge_quality: "exceptional" | "good" | "basic" | "poor" | "none"
      parking_type: "valet" | "self" | "both" | "street" | "none"
      property_category:
        | "luxury"
        | "upper_upscale"
        | "upscale"
        | "upper_midscale"
        | "midscale"
        | "economy"
        | "extended_stay"
        | "resort"
        | "all_inclusive"
      recognition_style: "proactive" | "asked_received" | "none" | "denied"
      room_type: "standard" | "premium" | "junior_suite" | "suite" | "specialty"
      trend_direction: "declining" | "stable" | "improving"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      breakfast_location: [
        "restaurant",
        "lounge",
        "both",
        "room_service",
        "none",
      ],
      checkout_policy: [
        "guaranteed_late",
        "subject_to_availability",
        "rarely_granted",
        "no_benefit",
      ],
      happy_hour_type: [
        "full_meal",
        "substantial_appetizers",
        "light_snacks",
        "drinks_only",
        "none",
      ],
      lounge_quality: ["exceptional", "good", "basic", "poor", "none"],
      parking_type: ["valet", "self", "both", "street", "none"],
      property_category: [
        "luxury",
        "upper_upscale",
        "upscale",
        "upper_midscale",
        "midscale",
        "economy",
        "extended_stay",
        "resort",
        "all_inclusive",
      ],
      recognition_style: ["proactive", "asked_received", "none", "denied"],
      room_type: ["standard", "premium", "junior_suite", "suite", "specialty"],
      trend_direction: ["declining", "stable", "improving"],
    },
  },
} as const
