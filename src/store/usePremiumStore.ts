import { create } from 'zustand';

import { purchaseService } from '@/services/purchases';
import { PremiumPackage, PremiumStatus } from '@/types/premium';

type PremiumState = {
  status: PremiumStatus;
  hasPremium: boolean;
  isPaywallVisible: boolean;
  isPurchasing: boolean;
  purchasePackage: PremiumPackage | null;
  errorMessage: string;
  initialize: (userId: string | null) => Promise<void>;
  showPaywall: () => void;
  hidePaywall: () => void;
  purchase: () => Promise<boolean>;
  restore: () => Promise<boolean>;
};

const errorText = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unable to connect to the app store right now.';

export const usePremiumStore = create<PremiumState>((set, get) => ({
  status: 'loading',
  hasPremium: false,
  isPaywallVisible: false,
  isPurchasing: false,
  purchasePackage: null,
  errorMessage: '',
  initialize: async (userId) => {
    if (!userId) {
      set({
        status: purchaseService.isConfigured() ? 'free' : 'unavailable',
        hasPremium: false,
        purchasePackage: null,
        isPaywallVisible: false,
      });
      return;
    }

    if (!purchaseService.isConfigured()) {
      set({ status: 'unavailable', hasPremium: false });
      return;
    }

    try {
      set({ status: 'loading', errorMessage: '' });
      await purchaseService.configure(userId);
      const result = await purchaseService.getPremiumState();
      set({
        status: result.hasPremium ? 'premium' : 'free',
        hasPremium: result.hasPremium,
        purchasePackage: result.purchasePackage,
      });
    } catch (error) {
      set({ status: 'unavailable', hasPremium: false, errorMessage: errorText(error) });
    }
  },
  showPaywall: () => set({ isPaywallVisible: true, errorMessage: '' }),
  hidePaywall: () => set({ isPaywallVisible: false, errorMessage: '' }),
  purchase: async () => {
    const purchasePackage = get().purchasePackage;
    if (!purchasePackage) {
      set({ errorMessage: 'The Premium product is not available from the store right now.' });
      return false;
    }

    try {
      set({ isPurchasing: true, errorMessage: '' });
      const hasPremium = await purchaseService.purchase(purchasePackage);
      set({ status: hasPremium ? 'premium' : 'free', hasPremium, isPaywallVisible: !hasPremium });
      return hasPremium;
    } catch (error) {
      set({ errorMessage: errorText(error) });
      return false;
    } finally {
      set({ isPurchasing: false });
    }
  },
  restore: async () => {
    try {
      set({ isPurchasing: true, errorMessage: '' });
      const hasPremium = await purchaseService.restore();
      set({
        status: hasPremium ? 'premium' : 'free',
        hasPremium,
        isPaywallVisible: !hasPremium,
        errorMessage: hasPremium ? '' : 'No previous Premium purchase was found.',
      });
      return hasPremium;
    } catch (error) {
      set({ errorMessage: errorText(error) });
      return false;
    } finally {
      set({ isPurchasing: false });
    }
  },
}));
