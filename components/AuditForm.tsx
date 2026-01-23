import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Enums, Tables } from '@/lib/database.types';
import { useAudit, AuditFormData, useLoyaltyTiers, useRoomCategories } from '@/hooks/useAudit';

interface AuditFormProps {
  propertyId: string;
  brandId?: string;
  onSuccess?: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const RECOGNITION_OPTIONS: { value: Enums<'recognition_style'>; label: string; description: string }[] = [
  { value: 'proactive', label: 'Proactive', description: 'Recognized without asking' },
  { value: 'asked_received', label: 'Asked & Received', description: 'Asked and got recognition' },
  { value: 'none', label: 'None', description: 'No recognition received' },
  { value: 'denied', label: 'Denied', description: 'Asked but was denied' },
];

const BREAKFAST_OPTIONS: { value: Enums<'breakfast_location'>; label: string }[] = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'lounge', label: 'Club Lounge' },
  { value: 'both', label: 'Restaurant or Lounge' },
  { value: 'room_service', label: 'Room Service' },
  { value: 'none', label: 'Not Included' },
];

const HAPPY_HOUR_OPTIONS: { value: Enums<'happy_hour_type'>; label: string }[] = [
  { value: 'full_meal', label: 'Full Meal' },
  { value: 'substantial_appetizers', label: 'Substantial Apps' },
  { value: 'light_snacks', label: 'Light Snacks' },
  { value: 'drinks_only', label: 'Drinks Only' },
  { value: 'none', label: 'No Happy Hour' },
];

const LOUNGE_QUALITY_OPTIONS: { value: Enums<'lounge_quality'>; label: string }[] = [
  { value: 'exceptional', label: 'Exceptional' },
  { value: 'good', label: 'Good' },
  { value: 'basic', label: 'Basic' },
  { value: 'poor', label: 'Poor' },
  { value: 'none', label: 'No Lounge' },
];

export function AuditForm({ propertyId, brandId, onSuccess }: AuditFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<Partial<AuditFormData>>({
    propertyId,
    stayDate: new Date().toISOString().split('T')[0],
  });

  const { submitAudit, submitting, error } = useAudit();
  const { tiers, fetchTiers } = useLoyaltyTiers(brandId);
  const { categories, fetchCategories } = useRoomCategories(brandId);

  useEffect(() => {
    fetchTiers();
    fetchCategories();
  }, [brandId]);

  const handleRecognitionSelect = (value: Enums<'recognition_style'>) => {
    setFormData({ ...formData, recognitionStyle: value });
  };

  const handleStarSelect = (field: 'loungeScore' | 'breakfastScore' | 'cultureScore', value: number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.recognitionStyle) return;

    const result = await submitAudit({
      propertyId,
      tierId: formData.tierId,
      bookedCategoryId: formData.bookedCategoryId,
      receivedCategoryId: formData.receivedCategoryId,
      recognitionStyle: formData.recognitionStyle,
      loungeScore: formData.loungeScore,
      breakfastScore: formData.breakfastScore,
      cultureScore: formData.cultureScore,
      stayDate: formData.stayDate || new Date().toISOString().split('T')[0],
      notes: formData.notes,
      // Elite Benefits
      breakfastLocation: formData.breakfastLocation,
      happyHourType: formData.happyHourType,
      loungeQuality: formData.loungeQuality,
      lateCheckoutGranted: formData.lateCheckoutGranted,
      actualCheckoutTime: formData.actualCheckoutTime,
    });

    if (result) {
      onSuccess?.();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.recognitionStyle;
      case 2:
        return true; // Room categories are optional
      case 3:
        return true; // Pulse scores are optional
      case 4:
        return true; // Benefits are optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStars = (field: 'loungeScore' | 'breakfastScore' | 'cultureScore', label: string) => {
    const value = formData[field] || 0;
    return (
      <View style={styles.starRow}>
        <Text style={styles.starLabel}>{label}</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => handleStarSelect(field, star)}
              style={styles.starButton}
            >
              <Text style={[styles.star, star <= value && styles.starFilled]}>
                {star <= value ? '\u2605' : '\u2606'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progress}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View
            key={s}
            style={[styles.progressDot, s <= step && styles.progressDotActive]}
          />
        ))}
      </View>

      {/* Step 1: Recognition Style */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Recognition Style</Text>
          <Text style={styles.stepDescription}>How was your elite status recognized?</Text>
          <View style={styles.optionsGrid}>
            {RECOGNITION_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionCard,
                  formData.recognitionStyle === option.value && styles.optionCardSelected,
                ]}
                onPress={() => handleRecognitionSelect(option.value)}
              >
                <Text style={[
                  styles.optionLabel,
                  formData.recognitionStyle === option.value && styles.optionLabelSelected,
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Step 2: Room Delta */}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Room Category</Text>
          <Text style={styles.stepDescription}>What room type did you book vs. receive?</Text>

          <Text style={styles.fieldLabel}>Booked Category</Text>
          <View style={styles.categoryOptions}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryChip,
                  formData.bookedCategoryId === cat.id && styles.categoryChipSelected,
                ]}
                onPress={() => setFormData({ ...formData, bookedCategoryId: cat.id })}
              >
                <Text style={[
                  styles.categoryChipText,
                  formData.bookedCategoryId === cat.id && styles.categoryChipTextSelected,
                ]}>
                  {cat.category}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Received Category</Text>
          <View style={styles.categoryOptions}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryChip,
                  formData.receivedCategoryId === cat.id && styles.categoryChipSelected,
                ]}
                onPress={() => setFormData({ ...formData, receivedCategoryId: cat.id })}
              >
                <Text style={[
                  styles.categoryChipText,
                  formData.receivedCategoryId === cat.id && styles.categoryChipTextSelected,
                ]}>
                  {cat.category}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Step 3: The Pulse */}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>The Pulse</Text>
          <Text style={styles.stepDescription}>Rate your experience</Text>

          {renderStars('loungeScore', 'Lounge Experience')}
          {renderStars('breakfastScore', 'Breakfast Quality')}
          {renderStars('cultureScore', 'Service Culture')}
        </View>
      )}

      {/* Step 4: Elite Benefits */}
      {step === 4 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Elite Benefits</Text>
          <Text style={styles.stepDescription}>Help others know what to expect</Text>

          <Text style={styles.fieldLabel}>Breakfast Location</Text>
          <View style={styles.categoryOptions}>
            {BREAKFAST_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.categoryChip,
                  formData.breakfastLocation === opt.value && styles.categoryChipSelected,
                ]}
                onPress={() => setFormData({ ...formData, breakfastLocation: opt.value })}
              >
                <Text style={[
                  styles.categoryChipText,
                  formData.breakfastLocation === opt.value && styles.categoryChipTextSelected,
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Happy Hour / Evening</Text>
          <View style={styles.categoryOptions}>
            {HAPPY_HOUR_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.categoryChip,
                  formData.happyHourType === opt.value && styles.categoryChipSelected,
                ]}
                onPress={() => setFormData({ ...formData, happyHourType: opt.value })}
              >
                <Text style={[
                  styles.categoryChipText,
                  formData.happyHourType === opt.value && styles.categoryChipTextSelected,
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Club Lounge Quality</Text>
          <View style={styles.categoryOptions}>
            {LOUNGE_QUALITY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.categoryChip,
                  formData.loungeQuality === opt.value && styles.categoryChipSelected,
                ]}
                onPress={() => setFormData({ ...formData, loungeQuality: opt.value })}
              >
                <Text style={[
                  styles.categoryChipText,
                  formData.loungeQuality === opt.value && styles.categoryChipTextSelected,
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Late Checkout</Text>
          <View style={styles.categoryOptions}>
            <Pressable
              style={[
                styles.categoryChip,
                formData.lateCheckoutGranted === true && styles.categoryChipSelected,
              ]}
              onPress={() => setFormData({ ...formData, lateCheckoutGranted: true })}
            >
              <Text style={[
                styles.categoryChipText,
                formData.lateCheckoutGranted === true && styles.categoryChipTextSelected,
              ]}>
                Granted
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.categoryChip,
                formData.lateCheckoutGranted === false && styles.categoryChipSelected,
              ]}
              onPress={() => setFormData({ ...formData, lateCheckoutGranted: false })}
            >
              <Text style={[
                styles.categoryChipText,
                formData.lateCheckoutGranted === false && styles.categoryChipTextSelected,
              ]}>
                Denied
              </Text>
            </Pressable>
          </View>

          {formData.lateCheckoutGranted && (
            <>
              <Text style={styles.fieldLabel}>Checkout Time</Text>
              <TextInput
                style={styles.input}
                value={formData.actualCheckoutTime}
                onChangeText={(text) => setFormData({ ...formData, actualCheckoutTime: text })}
                placeholder="e.g., 2pm, 4pm"
              />
            </>
          )}
        </View>
      )}

      {/* Step 5: Review & Submit */}
      {step === 5 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Confirm Details</Text>
          <Text style={styles.stepDescription}>Review your audit before submitting</Text>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Recognition:</Text>
            <Text style={styles.reviewValue}>
              {RECOGNITION_OPTIONS.find((o) => o.value === formData.recognitionStyle)?.label || '-'}
            </Text>
          </View>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Room Upgrade:</Text>
            <Text style={styles.reviewValue}>
              {formData.bookedCategoryId !== formData.receivedCategoryId ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Pulse Scores:</Text>
            <Text style={styles.reviewValue}>
              L:{formData.loungeScore || '-'} B:{formData.breakfastScore || '-'} C:{formData.cultureScore || '-'}
            </Text>
          </View>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Breakfast:</Text>
            <Text style={styles.reviewValue}>
              {BREAKFAST_OPTIONS.find((o) => o.value === formData.breakfastLocation)?.label || '-'}
            </Text>
          </View>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Happy Hour:</Text>
            <Text style={styles.reviewValue}>
              {HAPPY_HOUR_OPTIONS.find((o) => o.value === formData.happyHourType)?.label || '-'}
            </Text>
          </View>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Lounge:</Text>
            <Text style={styles.reviewValue}>
              {LOUNGE_QUALITY_OPTIONS.find((o) => o.value === formData.loungeQuality)?.label || '-'}
            </Text>
          </View>

          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Late Checkout:</Text>
            <Text style={styles.reviewValue}>
              {formData.lateCheckoutGranted === true ? `Granted${formData.actualCheckoutTime ? ` (${formData.actualCheckoutTime})` : ''}` : formData.lateCheckoutGranted === false ? 'Denied' : '-'}
            </Text>
          </View>

          <Text style={styles.fieldLabel}>Stay Date</Text>
          <TextInput
            style={styles.input}
            value={formData.stayDate}
            onChangeText={(text) => setFormData({ ...formData, stayDate: text })}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Any additional observations..."
            multiline
            numberOfLines={3}
          />

          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      )}

      {/* Navigation */}
      <View style={styles.navigation}>
        {step > 1 && (
          <Pressable
            style={styles.backButton}
            onPress={() => setStep((step - 1) as Step)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        )}

        {step < 5 ? (
          <Pressable
            style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
            onPress={() => canProceed() && setStep((step + 1) as Step)}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Audit</Text>
            )}
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  progressDotActive: {
    backgroundColor: '#0ea5e9',
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  optionCardSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#f0f9ff',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#0ea5e9',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  categoryChipSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#0ea5e9',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  starLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  stars: {
    flexDirection: 'row',
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 28,
    color: '#e5e7eb',
  },
  starFilled: {
    color: '#eab308',
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  reviewLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 12,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  nextButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
