export const Paths = {
  ROOT: '/',

  ONBOARDING: '/onboarding',
  ONBOARDING_CREATE_WALLET: '/onboarding/create-wallet',
  ONBOARDING_PASSWORD: '/onboarding/password',
  ONBOARDING_IMPORT_WALLET: '/onboarding/import-wallet',

  TRANSFER: '/transfer',
  DASHBOARD: '/dashboard',
} as const;

export type PathValue = (typeof Paths)[keyof typeof Paths];
