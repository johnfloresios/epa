import { Platform } from 'react-native';

import { env } from '@/config/env';
import { premiumConfig } from '@/config/premium';
import { PremiumPackage } from '@/types/premium';

declare const require: (moduleName: string) => any;

type CustomerInfo = {
  entitlements: { active: Record<string, unknown> };
};

type PurchasesModule = {
  configure: (options: { apiKey: string; appUserID?: string }) => void;
  getCustomerInfo: () => Promise<CustomerInfo>;
  getOfferings: () => Promise<{
    all: Record<string, { availablePackages: NativePackage[] }>;
    current: { availablePackages: NativePackage[] } | null;
  }>;
  purchasePackage: (purchasePackage: NativePackage) => Promise<{ customerInfo: CustomerInfo }>;
  restorePurchases: () => Promise<CustomerInfo>;
  logIn: (appUserId: string) => Promise<{ customerInfo: CustomerInfo }>;
  logOut: () => Promise<CustomerInfo>;
};

type NativePackage = {
  identifier: string;
  product: { priceString: string };
};

let purchases: PurchasesModule | null = null;
let configured = false;

const getApiKey = (): string =>
  Platform.OS === 'ios' ? env.revenueCatAppleApiKey : env.revenueCatGoogleApiKey;

const getPurchases = (): PurchasesModule => {
  if (purchases) return purchases;

  try {
    const module = require('react-native-purchases');
    purchases = (module.default ?? module) as PurchasesModule;
    return purchases;
  } catch {
    throw new Error(
      'In-app purchases require a development build with react-native-purchases installed.',
    );
  }
};

const hasPremiumEntitlement = (customerInfo: CustomerInfo): boolean =>
  Boolean(customerInfo.entitlements.active[premiumConfig.entitlementId]);

export const purchaseService = {
  isConfigured: (): boolean => Boolean(getApiKey()),
  configure: async (appUserId: string | null): Promise<void> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('Premium purchases are not configured for this build.');

    const sdk = getPurchases();
    if (!configured) {
      sdk.configure({ apiKey, appUserID: appUserId ?? undefined });
      configured = true;
    } else if (appUserId) {
      await sdk.logIn(appUserId);
    }
  },
  getPremiumState: async (): Promise<{ hasPremium: boolean; purchasePackage: PremiumPackage | null }> => {
    const sdk = getPurchases();
    const [customerInfo, offerings] = await Promise.all([
      sdk.getCustomerInfo(),
      sdk.getOfferings(),
    ]);
    const offering = offerings.all[premiumConfig.offeringId] ?? offerings.current;
    const nativePackage = offering?.availablePackages.find(
      (candidate) => candidate.identifier === premiumConfig.packageIdentifier,
    ) ?? null;

    return {
      hasPremium: hasPremiumEntitlement(customerInfo),
      purchasePackage: nativePackage
        ? {
            identifier: nativePackage.identifier,
            localizedPrice: nativePackage.product.priceString,
            nativePackage,
          }
        : null,
    };
  },
  purchase: async (purchasePackage: PremiumPackage): Promise<boolean> => {
    const result = await getPurchases().purchasePackage(
      purchasePackage.nativePackage as NativePackage,
    );
    return hasPremiumEntitlement(result.customerInfo);
  },
  restore: async (): Promise<boolean> =>
    hasPremiumEntitlement(await getPurchases().restorePurchases()),
};
