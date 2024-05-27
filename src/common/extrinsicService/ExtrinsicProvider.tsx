import { createContext, PropsWithChildren, useContext } from 'react';
import { SignerOptions } from '@polkadot/api/types/submittable';
import { ChainId } from '@common/types';
import {
  EstimateFee,
  ExtrinsicBuilding,
  ExtrinsicBuildingOptions,
  SubmitExtrinsic,
  SubmitExtrinsicParams,
} from '@common/extrinsicService/types';
import { Balance, Hash } from '@polkadot/types/interfaces';
import { useExtrinsicService } from '@common/extrinsicService/ExtrinsicService';
import { getKeyringPair } from '../wallet';
import { FAKE_ACCOUNT_ID } from '../utils/constants';

type ExtrinsicProviderContextProps = {
  estimateFee: EstimateFee;
  submitExtrinsic: SubmitExtrinsic;
};

const ExtrinsicProviderContext = createContext<ExtrinsicProviderContextProps>({} as ExtrinsicProviderContextProps);

export const ExtrinsicProvider = ({ children }: PropsWithChildren) => {
  const { prepareExtrinsic } = useExtrinsicService();

  async function estimateFee(
    chainId: ChainId,
    building: ExtrinsicBuilding,
    signOptions?: Partial<SignerOptions>,
    options?: Partial<ExtrinsicBuildingOptions>,
  ): Promise<Balance> {
    const extrinsic = await prepareExtrinsic<'promise'>(chainId, building, options);
    const paymentInfo = await extrinsic.paymentInfo(FAKE_ACCOUNT_ID, signOptions);

    return paymentInfo.partialFee;
  }

  async function submitExtrinsic({
    chainId,
    building,
    giftKeyringPair,
    options,
    signOptions,
  }: SubmitExtrinsicParams): Promise<Hash | undefined> {
    const extrinsic = await prepareExtrinsic<'promise'>(chainId, building, options);

    const keyringPair = giftKeyringPair || getKeyringPair();
    if (!keyringPair) return;

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
