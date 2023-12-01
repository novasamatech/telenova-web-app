import { BalanceProvider } from '@/common/balances/BalanceProvider';
import { ChainRegistry } from '@/common/chainRegistry';
import { DashboardMain } from '@/screens/dashboard';

export default function DashboardMainPage() {
  return (
    <ChainRegistry>
      <BalanceProvider>
        <DashboardMain />
      </BalanceProvider>
    </ChainRegistry>
  );
}
