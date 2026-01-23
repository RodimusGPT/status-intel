/**
 * Submit Stay Report Screen
 *
 * Allows elite travelers to contribute their real stay experiences.
 * This is the primary source of accurate, verified elite experience data.
 *
 * Data quality is critical - we want real experiences, not guesses.
 */

import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface StayReportForm {
  propertyId: string;
  propertyName: string;
  stayDate: string;

  // Elite Status
  loyaltyProgram: 'marriott_bonvoy' | 'world_of_hyatt' | 'hilton_honors' | 'ihg_rewards';
  eliteStatus: string; // e.g., "Titanium", "Globalist", "Diamond"

  // Recognition (matches database enum: proactive, asked_received, none, denied)
  recognitionStyle: 'proactive' | 'asked_received' | 'denied' | 'none';
  recognitionNotes?: string;

  // Upgrade
  upgradeReceived: boolean;
  upgradeOutcome?: 'upgraded' | 'waitlisted' | 'no_upgrade';
  roomTypeBooked?: string;
  roomTypeReceived?: string;

  // Benefits
  breakfastIncluded: boolean;
  breakfastLocation?: 'lounge' | 'restaurant' | 'room_service' | 'none';
  breakfastQuality?: number; // 1-5

  loungeAccess: boolean;
  loungeQuality?: 'exceptional' | 'good' | 'basic' | 'poor' | 'none';  // Matches database enum
  loungeNotes?: string;

  lateCheckoutGranted: boolean;
  checkoutTime?: string;

  // Overall
  overallExperience: number; // 1-5
  wouldRecommend: boolean;
  additionalNotes?: string;
}

export default function SubmitReportScreen() {
  const [form, setForm] = useState<Partial<StayReportForm>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // TODO: Implement validation logic
    // This is where YOU define what makes a valid submission

    setSubmitting(true);

    try {
      // Save to stay_audits table
      // Note: Upgrade tracking uses booked_category_id/received_category_id (room category UUIDs)
      // The upgrade_outcome from the form would need room category lookup to populate those fields
      const { error } = await supabase.from('stay_audits').insert({
        property_id: form.propertyId!,
        stay_date: form.stayDate!,
        recognition_style: form.recognitionStyle!,
        breakfast_location: form.breakfastLocation || null,
        breakfast_score: form.breakfastQuality || null,
        lounge_quality: form.loungeQuality || null,
        late_checkout_granted: form.lateCheckoutGranted || null,
        actual_checkout_time: form.checkoutTime || null,
        notes: `User submission: ${form.additionalNotes || ''}`,
        // TODO: Add user_id when auth is implemented
        // TODO: Map roomTypeBooked/roomTypeReceived to booked_category_id/received_category_id
      });

      if (error) throw error;

      Alert.alert('Success', 'Thank you for your contribution!');
      setForm({});
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Share Your Stay</Text>
        <Text className="text-gray-600 mt-2">
          Help fellow elite travelers by sharing your real experience.
          Your contribution makes this app valuable.
        </Text>
      </View>

      {/* Property Selection */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-semibold mb-2">Property</Text>
        <Text className="text-sm text-gray-600 mb-3">
          Which property did you stay at?
        </Text>
        {/* TODO: Add property picker component */}
        <TouchableOpacity className="border border-gray-300 rounded p-3">
          <Text className="text-gray-500">
            {form.propertyName || 'Select property...'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stay Date */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-semibold mb-2">Stay Date</Text>
        <TextInput
          className="border border-gray-300 rounded p-3"
          placeholder="YYYY-MM-DD"
          value={form.stayDate}
          onChangeText={(text) => setForm({ ...form, stayDate: text })}
        />
      </View>

      {/* Elite Status */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-semibold mb-2">Your Elite Status</Text>
        <Text className="text-sm text-gray-600 mb-3">
          What status did you have during this stay?
        </Text>
        {/* TODO: Add status picker */}
        <TextInput
          className="border border-gray-300 rounded p-3"
          placeholder="e.g., Globalist, Titanium, Diamond"
          value={form.eliteStatus}
          onChangeText={(text) => setForm({ ...form, eliteStatus: text })}
        />
      </View>

      {/* Recognition */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-semibold mb-2">Recognition</Text>
        <Text className="text-sm text-gray-600 mb-3">
          How were you recognized as an elite member?
        </Text>
        {/* TODO: Add radio buttons for recognition styles */}
        <View className="space-y-2">
          {(['proactive', 'asked_received', 'denied', 'none'] as const).map((style) => (
            <TouchableOpacity
              key={style}
              onPress={() => setForm({ ...form, recognitionStyle: style })}
              className={`p-3 rounded border ${
                form.recognitionStyle === style
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              <Text className={form.recognitionStyle === style ? 'text-blue-700' : 'text-gray-700'}>
                {style === 'proactive' && 'Proactive (they mentioned it first)'}
                {style === 'asked_received' && 'Asked and received'}
                {style === 'denied' && 'Asked but denied'}
                {style === 'none' && 'Not recognized'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Upgrade */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-semibold mb-2">Room Upgrade</Text>
        <TouchableOpacity
          onPress={() => setForm({ ...form, upgradeReceived: !form.upgradeReceived })}
          className="flex-row items-center mb-3"
        >
          <View
            className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
              form.upgradeReceived ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            }`}
          >
            {form.upgradeReceived && <Text className="text-white">✓</Text>}
          </View>
          <Text className="text-gray-700">I received an upgrade</Text>
        </TouchableOpacity>

        {form.upgradeReceived && (
          <>
            <TextInput
              className="border border-gray-300 rounded p-3 mb-2"
              placeholder="Room type booked (e.g., Standard King)"
              value={form.roomTypeBooked}
              onChangeText={(text) => setForm({ ...form, roomTypeBooked: text })}
            />
            <TextInput
              className="border border-gray-300 rounded p-3"
              placeholder="Room type received (e.g., Junior Suite)"
              value={form.roomTypeReceived}
              onChangeText={(text) => setForm({ ...form, roomTypeReceived: text })}
            />
          </>
        )}
      </View>

      {/* Breakfast */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-semibold mb-2">Breakfast</Text>
        <TouchableOpacity
          onPress={() => setForm({ ...form, breakfastIncluded: !form.breakfastIncluded })}
          className="flex-row items-center mb-3"
        >
          <View
            className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
              form.breakfastIncluded ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            }`}
          >
            {form.breakfastIncluded && <Text className="text-white">✓</Text>}
          </View>
          <Text className="text-gray-700">Breakfast was included</Text>
        </TouchableOpacity>

        {form.breakfastIncluded && (
          <>
            <Text className="text-sm text-gray-600 mb-2">Where did you have breakfast?</Text>
            <View className="space-y-2">
              {(['lounge', 'restaurant', 'room_service'] as const).map((location) => (
                <TouchableOpacity
                  key={location}
                  onPress={() => setForm({ ...form, breakfastLocation: location })}
                  className={`p-3 rounded border ${
                    form.breakfastLocation === location
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  <Text
                    className={form.breakfastLocation === location ? 'text-blue-700' : 'text-gray-700'}
                  >
                    {location === 'lounge' && 'Executive/Club Lounge'}
                    {location === 'restaurant' && 'Hotel Restaurant'}
                    {location === 'room_service' && 'Room Service'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm text-gray-600 mt-3 mb-2">Rate the quality (1-5):</Text>
            <View className="flex-row justify-between">
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  onPress={() => setForm({ ...form, breakfastQuality: rating })}
                  className={`w-12 h-12 rounded-full border-2 items-center justify-center ${
                    form.breakfastQuality === rating
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      form.breakfastQuality === rating ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Lounge */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-semibold mb-2">Executive Lounge</Text>
        <TouchableOpacity
          onPress={() => setForm({ ...form, loungeAccess: !form.loungeAccess })}
          className="flex-row items-center mb-3"
        >
          <View
            className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
              form.loungeAccess ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            }`}
          >
            {form.loungeAccess && <Text className="text-white">✓</Text>}
          </View>
          <Text className="text-gray-700">I had lounge access</Text>
        </TouchableOpacity>

        {form.loungeAccess && (
          <>
            <Text className="text-sm text-gray-600 mb-2">How was the lounge?</Text>
            <View className="space-y-2">
              {(['exceptional', 'good', 'basic', 'poor', 'none'] as const).map((quality) => (
                <TouchableOpacity
                  key={quality}
                  onPress={() => setForm({ ...form, loungeQuality: quality })}
                  className={`p-3 rounded border ${
                    form.loungeQuality === quality
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  <Text
                    className={form.loungeQuality === quality ? 'text-blue-700' : 'text-gray-700'}
                  >
                    {quality === 'none' ? 'No lounge access' : quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              className="border border-gray-300 rounded p-3 mt-3"
              placeholder="Notes about the lounge (optional)"
              multiline
              numberOfLines={3}
              value={form.loungeNotes}
              onChangeText={(text) => setForm({ ...form, loungeNotes: text })}
            />
          </>
        )}
      </View>

      {/* Late Checkout */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-semibold mb-2">Late Checkout</Text>
        <TouchableOpacity
          onPress={() => setForm({ ...form, lateCheckoutGranted: !form.lateCheckoutGranted })}
          className="flex-row items-center mb-3"
        >
          <View
            className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
              form.lateCheckoutGranted ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            }`}
          >
            {form.lateCheckoutGranted && <Text className="text-white">✓</Text>}
          </View>
          <Text className="text-gray-700">Late checkout was granted</Text>
        </TouchableOpacity>

        {form.lateCheckoutGranted && (
          <TextInput
            className="border border-gray-300 rounded p-3"
            placeholder="Checkout time (e.g., 2:00 PM)"
            value={form.checkoutTime}
            onChangeText={(text) => setForm({ ...form, checkoutTime: text })}
          />
        )}
      </View>

      {/* Overall Experience */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-semibold mb-2">Overall Experience</Text>
        <Text className="text-sm text-gray-600 mb-3">Rate your overall stay (1-5):</Text>
        <View className="flex-row justify-between mb-4">
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              onPress={() => setForm({ ...form, overallExperience: rating })}
              className={`w-12 h-12 rounded-full border-2 items-center justify-center ${
                form.overallExperience === rating
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              }`}
            >
              <Text
                className={`font-semibold ${
                  form.overallExperience === rating ? 'text-white' : 'text-gray-700'
                }`}
              >
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setForm({ ...form, wouldRecommend: !form.wouldRecommend })}
          className="flex-row items-center mb-3"
        >
          <View
            className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
              form.wouldRecommend ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            }`}
          >
            {form.wouldRecommend && <Text className="text-white">✓</Text>}
          </View>
          <Text className="text-gray-700">I would recommend this property to other elite travelers</Text>
        </TouchableOpacity>

        <TextInput
          className="border border-gray-300 rounded p-3"
          placeholder="Additional notes (optional)"
          multiline
          numberOfLines={4}
          value={form.additionalNotes}
          onChangeText={(text) => setForm({ ...form, additionalNotes: text })}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        className={`rounded-lg p-4 items-center mb-8 ${
          submitting ? 'bg-gray-400' : 'bg-blue-500'
        }`}
      >
        <Text className="text-white font-semibold text-lg">
          {submitting ? 'Submitting...' : 'Submit Stay Report'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
