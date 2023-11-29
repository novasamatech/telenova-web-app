import {Navigate, RouteObject} from 'react-router-dom';
import {Paths} from './paths';
import {DashboardMain} from '@app/dashboard';
import {OnboardingStartPage, CreateWalletPage, ImportWalletPage} from '@app/onboarding';
import {TransferPage} from '@app/transfer/Transfer';
import {SplashPage} from '@app/splash/Splash';

export const routesConfig: RouteObject[] = [
    {
        path: Paths.ONBOARDING,
        element: <OnboardingStartPage/>,
    },
    {
        path: Paths.ONBOARDING_CREATE_WALLET,
        element: <CreateWalletPage/>
    },
    {
        path: Paths.ONBOARDING_IMPORT_WALLET,
        element: <ImportWalletPage/>
    },
    {path: Paths.TRANSFER, element: <TransferPage/>},
    {path: Paths.DASHBOARD, element: <DashboardMain/>},

    {path: '*', element: <SplashPage/>}
];