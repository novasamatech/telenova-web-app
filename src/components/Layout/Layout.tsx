import { PropsWithChildren } from 'react';
import { ChainRegistry } from '@/common/chainRegistry';
import { ExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { BalanceProvider } from '@/common/balances/BalanceProvider';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <ChainRegistry>
      <ExtrinsicProvider>
        <BalanceProvider>
          <div className="min-h-screen p-4 w-full overflow-x-auto break-words">{children}</div>
        </BalanceProvider>
      </ExtrinsicProvider>
    </ChainRegistry>
  );
}
