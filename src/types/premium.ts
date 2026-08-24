export type PremiumPackage = {
  identifier: string;
  localizedPrice: string;
  nativePackage: unknown;
};

export type PremiumStatus = 'loading' | 'free' | 'premium' | 'unavailable';
