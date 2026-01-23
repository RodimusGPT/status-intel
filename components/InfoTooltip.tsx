import React, { useState } from 'react';
import {
  TouchableOpacity,
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet
} from 'react-native';

interface InfoTooltipProps {
  title: string;
  explanation: string;
  /** Optional additional context like sample size */
  context?: string;
  /** Icon size - defaults to 14 */
  size?: number;
  /** Icon color - defaults to gray */
  color?: string;
}

/**
 * Mobile-friendly tooltip that shows explanation on tap.
 * Uses a bottom modal pattern common in mobile apps.
 */
export function InfoTooltip({
  title,
  explanation,
  context,
  size = 14,
  color = '#9CA3AF' // gray-400
}: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel={`Info about ${title}`}
        accessibilityRole="button"
      >
        <Text style={[styles.icon, { fontSize: size, color }]}>ⓘ</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.explanation}>{explanation}</Text>
            {context && (
              <Text style={styles.context}>{context}</Text>
            )}
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.dismissText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginLeft: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  explanation: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 8,
  },
  context: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 8,
  },
  dismissButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
