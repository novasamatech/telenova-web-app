import type { EstimateFeeParams, SubmitExtrinsicParams } from './types';

import { type PropsWithChildren, createContext, useContext, useMemo } from 'react';

import { type Hash } from '@polkadot/types/interfaces';
import { type BN, BN_ZERO } from '@polkadot/util';

import { FAKE_ACCOUNT_ID } from '@/shared/helpers';

import { useExtrinsicService } from './ExtrinsicService';

type ExtrinsicProviderContextProps = {
  estimateFee: (params: EstimateFeeParams) => Promise<BN>;
  submitExtrinsic: (params: SubmitExtrinsicParams) => Promise<Hash | undefined>;
};

const ExtrinsicProviderContext = createContext<ExtrinsicProviderContextProps>({} as ExtrinsicProviderContextProps);

export const ExtrinsicProvider = ({ children }: PropsWithChildren) => {
  const { prepareExtrinsic } = useExtrinsicService();

  async function estimateFee({ chainId, transaction, signOptions, options }: EstimateFeeParams): Promise<BN> {
    try {
      const extrinsic = await prepareExtrinsic<'promise'>(chainId, transaction, options);
      const paymentInfo = await extrinsic.paymentInfo(FAKE_ACCOUNT_ID, signOptions);

      return paymentInfo.partialFee.toBn();
    } catch (e) {
      console.log('=== e', e);
    }

    return BN_ZERO;
  }

  async function submitExtrinsic({
    chainId,
    transaction,
    keyringPair,
    options,
    signOptions,
  }: SubmitExtrinsicParams): Promise<Hash> {
    const extrinsic = await prepareExtrinsic<'promise'>(chainId, transaction, options);

    await extrinsic.signAsync(keyringPair, signOptions);
    keyringPair.lock();

    return extrinsic.send();
  }

  const value = useMemo(() => {
    return { estimateFee, submitExtrinsic };
  }, [estimateFee, submitExtrinsic]);

  return <ExtrinsicProviderContext.Provider value={value}>{children}</ExtrinsicProviderContext.Provider>;
};

export const useExtrinsicProvider = () => useContext<ExtrinsicProviderContextProps>(ExtrinsicProviderContext);
