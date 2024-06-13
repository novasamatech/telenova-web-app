import type { EstimateFee, EstimateFeeParams, SubmitExtrinsic, SubmitExtrinsicParams } from './types';

import { type PropsWithChildren, createContext, useContext } from 'react';

import { type Balance, type Hash } from '@polkadot/types/interfaces';

import { FAKE_ACCOUNT_ID } from '@/common/utils';
import { getKeyringPair } from '@/common/wallet';

import { useExtrinsicService } from './ExtrinsicService';

type ExtrinsicProviderContextProps = {
  estimateFee: EstimateFee;
  submitExtrinsic: SubmitExtrinsic;
};

const ExtrinsicProviderContext = createContext<ExtrinsicProviderContextProps>({} as ExtrinsicProviderContextProps);

export const ExtrinsicProvider = ({ children }: PropsWithChildren) => {
  const { prepareExtrinsic } = useExtrinsicService();

  async function estimateFee({ chainId, transaction, signOptions, options }: EstimateFeeParams): Promise<Balance> {
    const extrinsic = await prepareExtrinsic<'promise'>(chainId, transaction, options);
    const paymentInfo = await extrinsic.paymentInfo(FAKE_ACCOUNT_ID, signOptions);

    return paymentInfo.partialFee;
  }

  async function submitExtrinsic({
    chainId,
    transaction,
    keyring,
    options,
    signOptions,
  }: SubmitExtrinsicParams): Promise<Hash | undefined> {
    const extrinsic = await prepareExtrinsic<'promise'>(chainId, transaction, options);

    const keyringPair = keyring || getKeyringPair();
    if (!keyringPair) {
      return;
    }

    await extrinsic.signAsync(keyringPair, signOptions);
    keyringPair.lock();

    return await extrinsic.send();
  }

  return (
    <ExtrinsicProviderContext.Provider
      value={{
        estimateFee,
        submitExtrinsic,
      }}
    >
      {children}
    </ExtrinsicProviderContext.Provider>
  );
};

export const useExtrinsicProvider = () => useContext<ExtrinsicProviderContextProps>(ExtrinsicProviderContext);
