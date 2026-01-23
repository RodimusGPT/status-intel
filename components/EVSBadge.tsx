/**
 * Elite Value Score Badge
 */

import { View, Text, StyleSheet } from 'react-native';

interface EVSBadgeProps {
  score: number | string | null | undefined;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

function getEVSColor(score: number): string {
  if (score >= 7) return '#059669';
  if (score >= 5) return '#0ea5e9';
  if (score >= 3) return '#f59e0b';
  return '#ef4444';
}

function getEVSGrade(score: number): string {
  if (score >= 8) return 'Elite';
  if (score >= 7) return 'Excellent';
  if (score >= 5) return 'Good';
  if (score >= 3) return 'Average';
  return 'Poor';
}

export function EVSBadge({ score, size = 'medium', showLabel = true }: EVSBadgeProps) {
  const numericScore = typeof score === 'string' ? parseFloat(score) : score;
  const displayScore = numericScore ?? 0;
  const color = getEVSColor(displayScore);
  const grade = getEVSGrade(displayScore);

  const sizeStyles = {
    small: { container: styles.containerSmall, score: styles.scoreSmall, grade: styles.gradeSmall },
    medium: { container: styles.containerMedium, score: styles.scoreMedium, grade: styles.gradeMedium },
    large: { container: styles.containerLarge, score: styles.scoreLarge, grade: styles.gradeLarge },
  };

  const currentSize = sizeStyles[size];

  if (numericScore === null || numericScore === undefined || isNaN(numericScore)) {
    return (
      <View style={[styles.container, currentSize.container, styles.noScore]}>
        <Text style={[styles.score, currentSize.score, { color: '#9ca3af' }]}>?</Text>
        <Text style={[styles.noDataText, currentSize.grade, { color: '#9ca3af' }]}>Not enough{'\n'}info</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, currentSize.container, { borderColor: color, backgroundColor: `${color}10` }]}>
      <Text style={[styles.score, currentSize.score, { color }]}>{displayScore.toFixed(1)}</Text>
      <Text style={[styles.grade, currentSize.grade, { color }]}>{grade}</Text>
      {showLabel && <Text style={[styles.label, { color }]}>Elite Score</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: 12,
  },
  noScore: {
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  containerSmall: {
    width: 54,
    height: 54,
    borderRadius: 8,
    borderWidth: 2,
  },
  containerMedium: {
    width: 75,
    height: 75,
    borderRadius: 10,
  },
  containerLarge: {
    width: 110,
    height: 110,
    borderRadius: 16,
    borderWidth: 4,
  },
  score: {
    fontWeight: 'bold',
  },
  scoreSmall: {
    fontSize: 16,
  },
  scoreMedium: {
    fontSize: 22,
  },
  scoreLarge: {
    fontSize: 32,
  },
  grade: {
    fontWeight: '600',
  },
  gradeSmall: {
    fontSize: 8,
  },
  gradeMedium: {
    fontSize: 10,
  },
  gradeLarge: {
    fontSize: 14,
  },
  label: {
    fontSize: 8,
    fontWeight: '500',
    marginTop: 1,
  },
  noDataText: {
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 10,
  },
});
