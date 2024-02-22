import { RouteObject } from 'react-router-dom';
import { Paths } from './paths';

import { OnboardingPage, CreateWalletPage, PasswordPage } from '@/screens/onboarding/';
import { DashboardMain, ReceivePage } from '@/screens/dashboard';
import {
  SettingsPage,
  SettingsBackupPage,
  ChangePasswordPage,
  NewPasswordPage,
  PasswordConfirmationPage,
  RecoveryPage,
} from '@/screens/settings';
import { GiftPage, GiftDetailsPage } from '@/screens/gifts/';
import {
  TransferPage,
  SelectTokenPage,
  AddressPage,
  AmountPage,
  ConfirmationPage,
  ResultPage,
  CreateGiftPage,
  AmountGiftPage,
} from '@/screens/transfer/';
import Error from '@/components/Error/Error';

export const routesConfig: RouteObject[] = [
  {
    path: Paths.ONBOARDING,
    element: <OnboardingPage />,
  },
  {
    path: Paths.ONBOARDING_CREATE_WALLET,
    element: <CreateWalletPage />,
  },
  {
    path: Paths.ONBOARDING_PASSWORD,
    element: <PasswordPage />,
  },
  {
    path: Paths.DASHBOARD,
    element: <DashboardMain />,
  },
  {
    path: Paths.RECEIVE,
    element: <ReceivePage />,
  },
  {
    path: Paths.SETTINGS,
    element: <SettingsPage />,
  },
  {
    path: Paths.SETTINGS_BACKUP,
    element: <SettingsBackupPage />,
  },
  {
    path: Paths.SETTINGS_CHANGE_PASSWORD,
    element: <ChangePasswordPage />,
  },
  {
    path: Paths.SETTINGS_NEW_PASSWORD,
    element: <NewPasswordPage />,
  },
  {
    path: Paths.SETTINGS_PASSWORD_CONFIRMATION,
    element: <PasswordConfirmationPage />,
  },
  {
    path: Paths.SETTINGS_RECOVERY,
    element: <RecoveryPage />,
  },
  {
    path: Paths.GIFTS,
    element: <GiftPage />,
  },
  {
    path: Paths.GIFT_DETAILS,
    element: <GiftDetailsPage />,
  },
  {
    path: Paths.TRANSFER,
    element: <TransferPage />,
  },
  {
    path: Paths.TRANSFER_SELECT_TOKEN,
    element: <SelectTokenPage />,
  },
  {
    path: Paths.TRANSFER_ADDRESS,
    element: <AddressPage />,
  },
  {
    path: Paths.TRANSFER_AMOUNT,
    element: <AmountPage />,
  },
  {
    path: Paths.TRANSFER_AMOUNT_GIFT,
    element: <AmountGiftPage />,
  },
  {
    path: Paths.TRANSFER_CONFIRMATION,
    element: <ConfirmationPage />,
  },
  {
    path: Paths.TRANSFER_RESULT,
    element: <ResultPage />,
  },
  {
    path: Paths.TRANSFER_CREATE_GIFT,
    element: <CreateGiftPage />,
  },

  { path: '*', element: <Error /> },
];
