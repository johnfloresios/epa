import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, ThemeColors } from '../constants/theme';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const UpgradeModal = ({ visible, onClose }: UpgradeModalProps) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.emoji}>👑</Text>
          <Text style={styles.title}>Unlock Pro Access</Text>
          <Text style={styles.subtext}>
            Get unlimited practice modules, detailed explanations, and advanced analytics.
          </Text>

          <View style={styles.pricing}>
            <TouchableOpacity style={styles.cardActive}>
              <Text style={styles.cardLabel}>Monthly</Text>
              <Text style={styles.cardAmount}>$4.99</Text>
              <Text style={styles.cardSub}>per month</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <Text style={styles.cardLabel}>Annual</Text>
              <Text style={styles.cardAmount}>$29.99</Text>
              <Text style={styles.cardSub}>per year</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Subscribe Now</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'flex-end' },
  content: { backgroundColor: theme.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, alignItems: 'center' },
  emoji: { fontSize: 60, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: '800', color: theme.text },
  subtext: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  pricing: { flexDirection: 'row', gap: 15, marginTop: 30, width: '100%' },
  card: { flex: 1, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: theme.border, alignItems: 'center' },
  cardActive: { flex: 1, padding: 15, borderRadius: 15, backgroundColor: theme.primary, alignItems: 'center' },
  cardLabel: { fontSize: 14, color: theme.textSecondary, marginBottom: 5 },
  cardAmount: { fontSize: 22, fontWeight: '800', color: theme.text },
  cardSub: { fontSize: 11, color: theme.textSecondary },
  primaryButton: { backgroundColor: theme.text, width: '100%', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  primaryButtonText: { color: theme.white, fontSize: 18, fontWeight: '700' },
  closeButton: { marginTop: 20 },
  closeText: { color: theme.textSecondary, fontSize: 14, fontWeight: '600' },
});
