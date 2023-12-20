export const Paths = {
  ROOT: '/',

  ONBOARDING: '/onboarding',
  ONBOARDING_CREATE_WALLET: '/onboarding/create-wallet',
  ONBOARDING_PASSWORD: '/onboarding/password',
  ONBOARDING_IMPORT_WALLET: '/onboarding/import-wallet',

  DASHBOARD: '/dashboard',

  TRANSFER: '/transfer',
  TRANSFER_SELECT_TOKEN: '/transfer/select-token',
  TRANSFER_ADDRESS: '/transfer/address',
  TRANSFER_AMOUNT: '/transfer/amount',
} as const;

export type PathValue = (typeof Paths)[keyof typeof Paths];
