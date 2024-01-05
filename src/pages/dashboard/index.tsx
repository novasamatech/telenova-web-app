import { ReactElement } from 'react';
import { Layout } from '@/components';
import { DashboardMain } from '@/screens/dashboard';

export default function DashboardMainPage() {
  return <DashboardMain />;
}

DashboardMainPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
