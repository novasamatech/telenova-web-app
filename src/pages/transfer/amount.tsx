'use client';
import { ExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { ChainRegistry } from '@/common/chainRegistry';
import AmountPage from '@/screens/transfer/amount/amount';

// TODO: swithch to Layout pattern
export default function Amount() {
  return (
    <ChainRegistry>
      <ExtrinsicProvider>
        <AmountPage />
      </ExtrinsicProvider>
    </ChainRegistry>
  );
}
