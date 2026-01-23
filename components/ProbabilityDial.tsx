import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface ProbabilityDialProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ProbabilityDial({
  percentage,
  size = 200,
  strokeWidth = 12,
  label = 'Upgrade Probability',
}: ProbabilityDialProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [percentage]);

  const getColor = (pct: number) => {
    if (pct >= 70) return '#22c55e'; // Green
    if (pct >= 40) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const color = getColor(percentage);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size / 2 + 40 }]}>
      <Svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <G rotation="-180" origin={`${size / 2}, ${size / 2}`}>
          {/* Background arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
          {/* Foreground arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]}>{percentage}%</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  value: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});
