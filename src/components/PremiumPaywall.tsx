import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, ScreenContainer, Text } from '@/components';
import { usePremiumStore } from '@/store/usePremiumStore';

export const PremiumPaywall = (): React.JSX.Element => {
  const isVisible = usePremiumStore((state) => state.isPaywallVisible);
  const hide = usePremiumStore((state) => state.hidePaywall);
  const purchase = usePremiumStore((state) => state.purchase);
  const restore = usePremiumStore((state) => state.restore);
  const purchasePackage = usePremiumStore((state) => state.purchasePackage);
  const isPurchasing = usePremiumStore((state) => state.isPurchasing);
  const errorMessage = usePremiumStore((state) => state.errorMessage);
  const status = usePremiumStore((state) => state.status);

  return (
    <Modal
      animationType="slide"
      onRequestClose={hide}
      presentationStyle="pageSheet"
      transparent={false}
      visible={isVisible}
    >
      <ScreenContainer>
        <View style={styles.headerRow}>
          <Text variant="heading" weight="bold">EPA 608 PRO Premium</Text>
          <Pressable accessibilityLabel="Close Premium upgrade" accessibilityRole="button" onPress={hide}>
            <Text tone="primary" weight="semibold">Close</Text>
          </Pressable>
        </View>

        <Card style={styles.card}>
          <Text variant="subheading" weight="bold">One purchase. Permanent access.</Text>
          <View style={styles.features}>
            <Text>✓ Type I, Type II, and Type III question banks</Text>
            <Text>✓ Randomized section and full Universal mock exams</Text>
            <Text>✓ Progress and explanation tracking dashboard</Text>
          </View>
          <Text tone="muted">
            Core remains free with randomized 25-question quizzes.
          </Text>

          {status === 'unavailable' ? (
            <Text tone="error">
              Premium purchasing is not configured in this build.
            </Text>
          ) : null}
          {errorMessage ? <Text tone="error">{errorMessage}</Text> : null}

          <Button
            disabled={!purchasePackage || status === 'unavailable'}
            loading={isPurchasing}
            onPress={() => void purchase()}
            title={purchasePackage ? `Unlock Premium • ${purchasePackage.localizedPrice}` : 'Premium Unavailable'}
          />
          <Button
            disabled={status === 'unavailable'}
            loading={isPurchasing}
            onPress={() => void restore()}
            title="Restore Purchase"
            variant="ghost"
          />
          <Text tone="muted" variant="caption">
            This is a one-time, non-consumable purchase. The final localized price is shown by your app store before confirmation.
          </Text>
        </Card>
      </ScreenContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  card: { gap: 18, marginTop: 24 },
  features: { gap: 12 },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
});
