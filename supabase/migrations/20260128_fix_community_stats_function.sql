-- Community stats function that aggregates ALL form fields for display
-- Matches the AuditForm fields so user submissions directly affect displayed content
-- Uses correct enum values from database

DROP FUNCTION IF EXISTS get_property_community_stats(uuid);

CREATE OR REPLACE FUNCTION get_property_community_stats(p_property_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'audit_count', COUNT(*),
    'latest_audit_date', MAX(stay_date),
    'avg_lounge_score', ROUND(AVG(lounge_score)::numeric, 1),
    'avg_breakfast_score', ROUND(AVG(breakfast_score)::numeric, 1),
    'avg_culture_score', ROUND(AVG(culture_score)::numeric, 1),
    'upgrade_count', COUNT(*) FILTER (WHERE
      (booked_room_type IS NOT NULL AND received_room_type IS NOT NULL AND booked_room_type != received_room_type)
      OR (booked_category_id IS NOT NULL AND received_category_id IS NOT NULL AND booked_category_id != received_category_id)
    ),
    'audits_with_room_data', COUNT(*) FILTER (WHERE
      (booked_room_type IS NOT NULL AND received_room_type IS NOT NULL)
      OR (booked_category_id IS NOT NULL AND received_category_id IS NOT NULL)
    ),
    -- recognition_style enum: proactive, asked_received, denied, none
    'recognition_proactive_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE recognition_style = 'proactive') / NULLIF(COUNT(*) FILTER (WHERE recognition_style IS NOT NULL), 0)),
    'recognition_asked_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE recognition_style = 'asked_received') / NULLIF(COUNT(*) FILTER (WHERE recognition_style IS NOT NULL), 0)),
    'recognition_denied_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE recognition_style = 'denied') / NULLIF(COUNT(*) FILTER (WHERE recognition_style IS NOT NULL), 0)),
    'recognition_none_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE recognition_style = 'none') / NULLIF(COUNT(*) FILTER (WHERE recognition_style IS NOT NULL), 0)),
    'late_checkout_granted_count', COUNT(*) FILTER (WHERE late_checkout_granted = true),
    'late_checkout_denied_count', COUNT(*) FILTER (WHERE late_checkout_granted = false),
    'late_checkout_total', COUNT(*) FILTER (WHERE late_checkout_granted IS NOT NULL),
    -- breakfast_location enum: restaurant, lounge, both
    'breakfast_restaurant_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE breakfast_location = 'restaurant') / NULLIF(COUNT(*) FILTER (WHERE breakfast_location IS NOT NULL), 0)),
    'breakfast_lounge_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE breakfast_location = 'lounge') / NULLIF(COUNT(*) FILTER (WHERE breakfast_location IS NOT NULL), 0)),
    'breakfast_both_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE breakfast_location = 'both') / NULLIF(COUNT(*) FILTER (WHERE breakfast_location IS NOT NULL), 0)),
    -- lounge_quality enum: exceptional, good, basic, poor, none
    'lounge_exceptional_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE lounge_quality = 'exceptional') / NULLIF(COUNT(*) FILTER (WHERE lounge_quality IS NOT NULL), 0)),
    'lounge_good_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE lounge_quality = 'good') / NULLIF(COUNT(*) FILTER (WHERE lounge_quality IS NOT NULL), 0)),
    'lounge_basic_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE lounge_quality = 'basic') / NULLIF(COUNT(*) FILTER (WHERE lounge_quality IS NOT NULL), 0)),
    'lounge_poor_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE lounge_quality = 'poor') / NULLIF(COUNT(*) FILTER (WHERE lounge_quality IS NOT NULL), 0)),
    'lounge_none_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE lounge_quality = 'none') / NULLIF(COUNT(*) FILTER (WHERE lounge_quality IS NOT NULL), 0)),
    -- happy_hour_type enum: full_meal, substantial_appetizers, light_snacks, drinks_only
    'happy_hour_full_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE happy_hour_type = 'full_meal') / NULLIF(COUNT(*) FILTER (WHERE happy_hour_type IS NOT NULL), 0)),
    'happy_hour_substantial_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE happy_hour_type = 'substantial_appetizers') / NULLIF(COUNT(*) FILTER (WHERE happy_hour_type IS NOT NULL), 0)),
    'happy_hour_light_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE happy_hour_type = 'light_snacks') / NULLIF(COUNT(*) FILTER (WHERE happy_hour_type IS NOT NULL), 0)),
    'happy_hour_drinks_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE happy_hour_type = 'drinks_only') / NULLIF(COUNT(*) FILTER (WHERE happy_hour_type IS NOT NULL), 0)),
    'avg_upgrade_satisfaction', ROUND(AVG(upgrade_satisfaction) FILTER (WHERE upgrade_satisfaction IS NOT NULL)::numeric, 1),
    -- upgrade_effort enum: proactive, asked_once, asked_multiple, negotiated, denied_then_granted, denied
    'upgrade_effort_proactive_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE upgrade_effort = 'proactive') / NULLIF(COUNT(*) FILTER (WHERE upgrade_effort IS NOT NULL), 0)),
    'upgrade_effort_asked_once_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE upgrade_effort = 'asked_once') / NULLIF(COUNT(*) FILTER (WHERE upgrade_effort IS NOT NULL), 0)),
    'upgrade_effort_asked_multiple_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE upgrade_effort = 'asked_multiple') / NULLIF(COUNT(*) FILTER (WHERE upgrade_effort IS NOT NULL), 0)),
    'upgrade_effort_negotiated_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE upgrade_effort = 'negotiated') / NULLIF(COUNT(*) FILTER (WHERE upgrade_effort IS NOT NULL), 0)),
    'upgrade_effort_denied_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE upgrade_effort = 'denied') / NULLIF(COUNT(*) FILTER (WHERE upgrade_effort IS NOT NULL), 0)),
    -- upgrade_room_quality enum: best_in_class, above_average, average, below_average, disappointing
    'upgrade_room_best_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE upgrade_room_quality = 'best_in_class') / NULLIF(COUNT(*) FILTER (WHERE upgrade_room_quality IS NOT NULL), 0)),
    'upgrade_room_above_avg_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE upgrade_room_quality = 'above_average') / NULLIF(COUNT(*) FILTER (WHERE upgrade_room_quality IS NOT NULL), 0)),
    'upgrade_room_average_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE upgrade_room_quality = 'average') / NULLIF(COUNT(*) FILTER (WHERE upgrade_room_quality IS NOT NULL), 0)),
    'upgrade_room_below_avg_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE upgrade_room_quality = 'below_average') / NULLIF(COUNT(*) FILTER (WHERE upgrade_room_quality IS NOT NULL), 0)),
    'upgrade_room_disappointing_pct', ROUND(100.0 * COUNT(*) FILTER (WHERE upgrade_room_quality = 'disappointing') / NULLIF(COUNT(*) FILTER (WHERE upgrade_room_quality IS NOT NULL), 0))
  ) INTO result
  FROM stay_audits
  WHERE property_id = p_property_id;
  RETURN result;
END;
$$;
