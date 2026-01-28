import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyCard } from '@/components/PropertyCard';
import { useProperties, useLoyaltyPrograms, LoyaltyProgram } from '@/hooks/useProperty';

const formatCount = (count: number): string => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'evs' | 'name' | 'city'>('evs');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { programs } = useLoyaltyPrograms(search || undefined);

  const { properties, totalCount, loading, error, refetch } = useProperties({
    search,
    sortBy,
    sortDirection,
    programIds: selectedPrograms.length > 0 ? selectedPrograms : undefined,
    limit: 100,
  });

  const allProgramsTotal = useMemo(() => {
    return programs.reduce((sum, p) => sum + p.propertyCount, 0);
  }, [programs]);

  const toggleProgram = (programId: string | undefined) => {
    if (!programId) {
      setSelectedPrograms([]);
    } else {
      setSelectedPrograms((prev) =>
        prev.includes(programId)
          ? prev.filter((id) => id !== programId)
          : [...prev, programId]
      );
    }
  };

  const programsWithCounts = useMemo(() => {
    return programs.map((p) => ({ ...p })).sort((a, b) => b.propertyCount - a.propertyCount);
  }, [programs]);

  // Map from program ID to program name for PropertyCard display
  const programNameMap = useMemo(() => {
    const map = new Map<string, string>();
    programs.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [programs]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.emptyText}>Loading properties...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>\u26A0\uFE0F</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>\uD83C\uDFE8</Text>
        <Text style={styles.emptyTitle}>No properties found</Text>
        <Text style={styles.emptyText}>
          {search ? 'Try adjusting your search terms' : 'Properties will appear here once data is available'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hotels, cities..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9ca3af"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined, name: 'All', propertyCount: allProgramsTotal, code: 'all', brand_count: 0 }, ...programsWithCounts]}
          keyExtractor={(item) => item.id || 'all'}
          renderItem={({ item }) => {
            const isAllSelected = !item.id && selectedPrograms.length === 0;
            const isSelected = item.id ? selectedPrograms.includes(item.id) : isAllSelected;

            return (
              <Pressable
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => toggleProgram(item.id)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {item.name}
                </Text>
                {item.propertyCount > 0 && (
                  <Text style={[styles.filterChipCount, isSelected && styles.filterChipCountActive]}>
                    {formatCount(item.propertyCount)}
                  </Text>
                )}
              </Pressable>
            );
          }}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {(['evs', 'name', 'city'] as const).map((option) => {
          const isActive = sortBy === option;
          const defaultDir = option === 'evs' ? 'desc' : 'asc';

          return (
            <Pressable
              key={option}
              style={[styles.sortOption, isActive && styles.sortOptionActive]}
              onPress={() => {
                if (isActive) {
                  // Toggle direction if same option clicked
                  setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  // Set new sort option with its default direction
                  setSortBy(option);
                  setSortDirection(defaultDir);
                }
              }}
            >
              <Text style={[styles.sortOptionText, isActive && styles.sortOptionTextActive]}>
                {option === 'evs' ? 'Elite Score' : option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
              {isActive && (
                <Ionicons
                  name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
                  size={14}
                  color="#0369a1"
                  style={{ marginLeft: 4 }}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <PropertyCard
            property={item}
            loyaltyProgramName={item.brand?.program_id ? programNameMap.get(item.brand.program_id) : undefined}
            index={index}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: { marginLeft: 12 },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: { padding: 8, marginRight: 4 },
  filterContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  filterList: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  filterChipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  filterChipCount: { fontSize: 11, color: '#6b7280', fontWeight: '600', backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  filterChipCountActive: { color: '#0369a1', backgroundColor: 'rgba(255, 255, 255, 0.9)' },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sortLabel: { fontSize: 13, color: '#6b7280', marginRight: 10, fontWeight: '500' },
  sortOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  sortOptionActive: { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' },
  sortOptionText: { fontSize: 13, color: '#6b7280' },
  sortOptionTextActive: { color: '#0369a1', fontWeight: '600' },
  listContent: { paddingVertical: 8, flexGrow: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  retryButton: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#0ea5e9', borderRadius: 8 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
