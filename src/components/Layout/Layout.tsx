import { PropsWithChildren } from 'react';
import { ExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { ChainRegistry } from '@/common/chainRegistry';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <ChainRegistry>
      <ExtrinsicProvider>
        <div className="min-h-screen p-4 w-full">{children}</div>
      </ExtrinsicProvider>
    </ChainRegistry>
  );
}
