import { BalanceProvider } from '@/common/balances/BalanceProvider';
import { ChainRegistry } from '@/common/chainRegistry';
import { ExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { DashboardMain } from '@/screens/dashboard';

export default function DashboardMainPage() {
  return (
    <ChainRegistry>
      <ExtrinsicProvider>
        <BalanceProvider>
          <DashboardMain />
        </BalanceProvider>
      </ExtrinsicProvider>
    </ChainRegistry>
  );
}
