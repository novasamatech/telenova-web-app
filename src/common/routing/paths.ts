export const Paths = {
    ROOT: '/',

    ONBOARDING: '/onboarding',
    ONBOARDING_CREATE_WALLET: '/create-wallet',
    ONBOARDING_IMPORT_WALLET: '/import-wallet',

    TRANSFER: '/transfer',
    DASHBOARD: '/dashboard'
} as const;

export type PathValue = (typeof Paths)[keyof typeof Paths];
