# EPA 608 Ultimate

## Premium purchase setup

Premium is a one-time, non-consumable in-app purchase backed by the RevenueCat
entitlement `premium` and offering `default`. Core 25-question quizzes remain
free. Premium unlocks the Type I/II/III banks, randomized mock exams, and the
Progress dashboard.

1. Install the native SDK: `npm install react-native-purchases`.
2. In App Store Connect and Google Play Console, create the same one-time
   non-consumable product (for example `epa608_premium_lifetime`) and choose the
   price tier you want.
3. Import both products into RevenueCat, attach them to the `premium`
   entitlement, and add it as the `$rc_lifetime` package in the `default`
   offering. Subscription packages are intentionally ignored by the app.
4. Set `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` and
   `EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY` in the build environment.
5. Create an Expo development build. Store purchases do not run in Expo Go.
6. Test purchase, cancellation, restore, refund/revocation, and account changes
   using Apple Sandbox/TestFlight and Google Play test tracks before release.

The paywall reads the localized price from the store. Do not replace it with a
hard-coded price in UI copy.

The authenticated Supabase user UUID is used as RevenueCat's App User ID. Never
replace it with an email address or a shared/hard-coded identifier.

Phase 1 foundation for a production-ready React Native exam prep app built with Expo, TypeScript, React Navigation, and Zustand.

## Scripts

- `npm install`
- `npm run start`
- `npm run ios`
- `npm run android`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
# my-difinder-app
