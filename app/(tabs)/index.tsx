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
import { PropertyCard } from '@/components/PropertyCard';
import { useProperties, useLoyaltyPrograms, LoyaltyProgram } from '@/hooks/useProperty';

const formatCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'eri' | 'evs' | 'name' | 'city'>('evs');

  const { programs } = useLoyaltyPrograms(search || undefined);

  const { properties, totalCount, loading, error, refetch } = useProperties({
    search,
    sortBy,
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

  const programsWithCounts: (LoyaltyProgram & { id: string | undefined })[] = useMemo(() => {
    return programs
      .map((p) => ({ ...p }))
      .sort((a, b) => b.propertyCount - a.propertyCount);
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
          {search
            ? 'Try adjusting your search terms'
            : 'Properties will appear here once data is available'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search properties, cities, or countries..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
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
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => toggleProgram(item.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {item.name}
                </Text>
                {item.propertyCount > 0 && (
                  <Text
                    style={[
                      styles.filterChipCount,
                      isSelected && styles.filterChipCountActive,
                    ]}
                  >
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
        {(['evs', 'eri', 'name', 'city'] as const).map((option) => (
          <Pressable
            key={option}
            style={[styles.sortOption, sortBy === option && styles.sortOptionActive]}
            onPress={() => setSortBy(option)}
          >
            <Text
              style={[
                styles.sortOptionText,
                sortBy === option && styles.sortOptionTextActive,
              ]}
            >
              {option === 'evs' ? 'Elite Score' : option === 'eri' ? 'ERI' : option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0ea5e9"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 4,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#0ea5e9',
  },
  filterChipText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  filterChipCount: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  filterChipCountActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sortLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 6,
  },
  sortOptionActive: {
    backgroundColor: '#e0f2fe',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sortOptionTextActive: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
