import { View, Text, StyleSheet } from 'react-native';
import { getERIGrade, getERIColor } from '@/lib/eri';

interface ERIBadgeProps {
  score: number | null | undefined;
  size?: 'small' | 'medium' | 'large';
  showGrade?: boolean;
}

export function ERIBadge({ score, size = 'medium', showGrade = true }: ERIBadgeProps) {
  const displayScore = score ?? 0;
  const color = getERIColor(displayScore);
  const grade = getERIGrade(displayScore);

  const sizeStyles = {
    small: { container: styles.containerSmall, score: styles.scoreSmall, grade: styles.gradeSmall },
    medium: { container: styles.containerMedium, score: styles.scoreMedium, grade: styles.gradeMedium },
    large: { container: styles.containerLarge, score: styles.scoreLarge, grade: styles.gradeLarge },
  };

  const currentSize = sizeStyles[size];

  if (score === null || score === undefined) {
    return (
      <View style={[styles.container, currentSize.container, styles.noScore]}>
        <Text style={[styles.score, currentSize.score, { color: '#9ca3af' }]}>--</Text>
        <Text style={[styles.label, { color: '#9ca3af' }]}>ERI</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, currentSize.container, { borderColor: color }]}>
      <Text style={[styles.score, currentSize.score, { color }]}>{displayScore}</Text>
      {showGrade && <Text style={[styles.grade, currentSize.grade, { color }]}>{grade}</Text>}
      <Text style={[styles.label, { color }]}>ERI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  noScore: {
    borderColor: '#e5e7eb',
  },
  containerSmall: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
  },
  containerMedium: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  containerLarge: {
    width: 100,
    height: 100,
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
    fontSize: 24,
  },
  scoreLarge: {
    fontSize: 36,
  },
  grade: {
    fontWeight: '600',
  },
  gradeSmall: {
    fontSize: 10,
  },
  gradeMedium: {
    fontSize: 12,
  },
  gradeLarge: {
    fontSize: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});
