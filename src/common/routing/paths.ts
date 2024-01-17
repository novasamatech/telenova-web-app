export const Paths = {
  ROOT: '/',

  ONBOARDING: '/onboarding',
  ONBOARDING_CREATE_WALLET: '/onboarding/create-wallet',
  ONBOARDING_PASSWORD: '/onboarding/password',
  ONBOARDING_IMPORT_WALLET: '/onboarding/import-wallet',

  DASHBOARD: '/dashboard',
  RECEIVE: '/dashboard/receive',

  SETTINGS: '/settings',

  GIFTS: '/gifts',
  GIFT_DETAILS: '/gifts/gift-details',

  TRANSFER: '/transfer',
  TRANSFER_SELECT_TOKEN: '/transfer/select-token',
  TRANSFER_ADDRESS: '/transfer/address',
  TRANSFER_AMOUNT: '/transfer/amount',
  TRANSFER_CONFIRMATION: '/transfer/confirmation',
  TRANSFER_RESULT: '/transfer/result',
  TRANSFER_CREATE_GIFT: '/transfer/create-gift',
} as const;

export type PathValue = (typeof Paths)[keyof typeof Paths];
