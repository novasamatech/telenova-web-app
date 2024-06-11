export const Paths = {
  ROOT: '/',

  ONBOARDING: '/onboarding',
  ONBOARDING_START: '/onboarding/start',
  ONBOARDING_CREATE_WALLET: '/onboarding/create-wallet',
  ONBOARDING_PASSWORD: '/onboarding/password',

  DASHBOARD: '/dashboard',

  RECEIVE: '/receive',
  RECEIVE_SELECT_TOKEN: '/receive/select-token',

  EXCHANGE: '/exchange',
  EXCHANGE_WIDGET: '/exchange/widget',
  EXCHANGE_SELECT: '/exchange/select',

  SETTINGS: '/settings',
  SETTINGS_BACKUP: '/settings/backup',
  SETTINGS_CHANGE_PASSWORD: '/settings/change-password',
  SETTINGS_NEW_PASSWORD: '/settings/new-password',
  SETTINGS_PASSWORD_CONFIRMATION: '/settings/password-confirmation',
  SETTINGS_RECOVERY: '/settings/recovery',

  GIFTS: '/gifts',
  GIFT_DETAILS: '/gifts/gift-details',

  TRANSFER: '/transfer',
  TRANSFER_SELECT_TOKEN: '/transfer/select-token',
  TRANSFER_ADDRESS: '/transfer/address',
  TRANSFER_AMOUNT: '/transfer/amount',
  TRANSFER_AMOUNT_GIFT: '/transfer/amount-gift',
  TRANSFER_CONFIRMATION: '/transfer/confirmation',
  TRANSFER_RESULT: '/transfer/result',
  TRANSFER_CREATE_GIFT: '/transfer/create-gift',
} as const;

export type PathValue = (typeof Paths)[keyof typeof Paths];
