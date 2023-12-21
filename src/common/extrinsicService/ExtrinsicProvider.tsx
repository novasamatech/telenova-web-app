import { createContext, PropsWithChildren, useContext } from 'react';
import { ChainId } from '@common/types';
import {
  EstimateFee,
  ExtrinsicBuilding,
  ExtrinsicBuildingOptions,
  SubmitExtrinsic,
} from '@common/extrinsicService/types';
import { Balance, Hash } from '@polkadot/types/interfaces';
import { useExtrinsicService } from '@common/extrinsicService/ExtrinsicService';
import { getKeyringPair } from '../wallet';

type ExtrinsicProviderContextProps = {
  estimateFee: EstimateFee;
  submitExtrinsic: SubmitExtrinsic;
};

const ExtrinsicProviderContext = createContext<ExtrinsicProviderContextProps>({} as ExtrinsicProviderContextProps);

export const FAKE_ACCOUNT_ID = '0x' + '1'.repeat(64);

export const ExtrinsicProvider = ({ children }: PropsWithChildren) => {
  const { prepareExtrinsic } = useExtrinsicService();

  async function estimateFee(
    chainId: ChainId,
    building: ExtrinsicBuilding,
    options?: Partial<ExtrinsicBuildingOptions>,
  ): Promise<Balance> {
    const extrinsic = await prepareExtrinsic<'promise'>(chainId, building, options);
    const paymentInfo = await extrinsic.paymentInfo(FAKE_ACCOUNT_ID);

    return paymentInfo.partialFee;
  }

  async function submitExtrinsic(
    chainId: ChainId,
    building: ExtrinsicBuilding,
    options?: Partial<ExtrinsicBuildingOptions>,
  ): Promise<Hash | undefined> {
    const extrinsicPromise = prepareExtrinsic<'promise'>(chainId, building, options);

    return extrinsicPromise.then(async (extrinsic) => {
      const keyringPair = getKeyringPair();

      if (!keyringPair) return;
      await extrinsic.signAsync(keyringPair);
      keyringPair.lock();

      return await extrinsic.send();
    });
  }

  return (
    <ExtrinsicProviderContext.Provider value={{ estimateFee, submitExtrinsic }}>
      {children}
    </ExtrinsicProviderContext.Provider>
  );
};

export const useExtrinsicProvider = () => useContext<ExtrinsicProviderContextProps>(ExtrinsicProviderContext);
