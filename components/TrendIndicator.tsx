import { View, Text, StyleSheet } from 'react-native';
import { Enums } from '@/lib/database.types';

interface TrendIndicatorProps {
  trend: Enums<'trend_direction'> | null | undefined;
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

export function TrendIndicator({ trend, size = 'medium', showLabel = true }: TrendIndicatorProps) {
  const getTrendConfig = (t: Enums<'trend_direction'> | null | undefined) => {
    switch (t) {
      case 'improving':
        return { icon: '↑', color: '#22c55e', label: 'Improving' };
      case 'declining':
        return { icon: '↓', color: '#ef4444', label: 'Declining' };
      case 'stable':
      default:
        return { icon: '→', color: '#6b7280', label: 'Stable' };
    }
  };

  const config = getTrendConfig(trend);
  const iconSize = size === 'small' ? styles.iconSmall : styles.iconMedium;
  const labelSize = size === 'small' ? styles.labelSmall : styles.labelMedium;

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, iconSize, { color: config.color }]}>{config.icon}</Text>
      {showLabel && (
        <Text style={[styles.label, labelSize, { color: config.color }]}>{config.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontWeight: 'bold',
  },
  iconSmall: {
    fontSize: 14,
  },
  iconMedium: {
    fontSize: 18,
  },
  label: {
    fontWeight: '500',
  },
  labelSmall: {
    fontSize: 12,
  },
  labelMedium: {
    fontSize: 14,
  },
});
