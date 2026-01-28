import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useProperties } from '@/hooks/useProperty';
import { AuditForm } from '@/components/AuditForm';

export default function AuditScreen() {
  // Get params if navigating from property page
  const params = useLocalSearchParams<{ propertyId?: string; programId?: string }>();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { properties, loading } = useProperties({ search });

  // Pre-select property if coming from property page
  useEffect(() => {
    if (params.propertyId) {
      setSelectedPropertyId(params.propertyId);
      setSelectedProgramId(params.programId || undefined);
    }
  }, [params.propertyId, params.programId]);

  // Show success state
  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>{'\u2705'}</Text>
        <Text style={styles.successTitle}>Mission Complete!</Text>
        <Text style={styles.successText}>
          Your audit has been submitted. Thank you for contributing to the intel network.
        </Text>
        <Pressable
          style={styles.successButton}
          onPress={() => {
            setShowSuccess(false);
            setSelectedPropertyId(null);
          }}
        >
          <Text style={styles.successButtonText}>Submit Another</Text>
        </Pressable>
        <Pressable
          style={styles.homeButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.homeButtonText}>Back to Search</Text>
        </Pressable>
      </View>
    );
  }

  // If a property is selected, show the audit form
  if (selectedPropertyId) {
    const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
    return (
      <View style={styles.formContainer}>
        {/* Back to Search link */}
        <Pressable
          style={styles.backToSearchHeader}
          onPress={() => router.push('/')}
        >
          <Text style={styles.backToSearchText}>{'\u2190'} Back to Search</Text>
        </Pressable>

        <View style={styles.selectedProperty}>
          <View style={styles.selectedPropertyInfo}>
            <Text style={styles.selectedPropertyName}>{selectedProperty?.name}</Text>
            <Text style={styles.selectedPropertyLocation}>
              {selectedProperty?.city}, {selectedProperty?.country}
            </Text>
          </View>
          <Pressable
            style={styles.changeButton}
            onPress={() => setSelectedPropertyId(null)}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </Pressable>
        </View>
        <AuditForm
          propertyId={selectedPropertyId}
          programId={selectedProgramId}
          onSuccess={() => setShowSuccess(true)}
        />
      </View>
    );
  }

  // Property selection view
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backToSearchButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.backToSearchText}>{'\u2190'} Back to Search</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Select Property</Text>
        <Text style={styles.headerSubtitle}>
          Choose the property you want to contribute intel for
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by property name or city..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.propertyItem}
              onPress={() => {
                setSelectedPropertyId(item.id);
                setSelectedProgramId(item.brand?.program_id || undefined);
              }}
            >
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyName}>{item.name}</Text>
                <Text style={styles.propertyLocation}>
                  {item.city}, {item.country}
                </Text>
                {item.brand && (
                  <Text style={styles.propertyBrand}>{item.brand.name}</Text>
                )}
              </View>
              <Text style={styles.selectArrow}>{'\u203A'}</Text>
            </Pressable>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {search ? 'No matching properties found' : 'No properties available'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  backToSearchButton: {
    marginBottom: 12,
  },
  backToSearchHeader: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backToSearchText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  propertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  propertyBrand: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  selectArrow: {
    fontSize: 24,
    color: '#9ca3af',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  selectedProperty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: '#bae6fd',
  },
  selectedPropertyInfo: {
    flex: 1,
  },
  selectedPropertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
  },
  selectedPropertyLocation: {
    fontSize: 14,
    color: '#0369a1',
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  authIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  authText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  successButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    marginBottom: 12,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  homeButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});
