'use client';
import { ExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { ChainRegistry } from '@/common/chainRegistry';
import ConfirmationPage from '@/screens/transfer/confirmation/confirmation';

// TODO: switch to Layout pattern
export default function Confirmation() {
  return (
    <ChainRegistry>
      <ExtrinsicProvider>
        <ConfirmationPage />
      </ExtrinsicProvider>
    </ChainRegistry>
  );
}
