import { createContext, PropsWithChildren, useContext } from 'react';
import { ChainId } from '@common/types';
import { EstimateFee, ExtrinsicBuilding, ExtrinsicBuildingOptions } from '@common/extrinsicService/types';
import { Balance } from '@polkadot/types/interfaces';
import { SubmittableResultResult } from '@polkadot/api-base/types/submittable';
import { useExtrinsicService } from '@common/extrinsicService/ExtrinsicService';
import { KeyringPair } from '@polkadot/keyring/types';

type ExtrinsicProviderContextProps = {
  estimateFee: EstimateFee;

  submitExtrinsic: (
    chainId: ChainId,
    building: ExtrinsicBuilding,
    options?: Partial<ExtrinsicBuildingOptions>,
  ) => SubmittableResultResult<'promise'>;
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

  function submitExtrinsic(
    chainId: ChainId,
    building: ExtrinsicBuilding,
    options?: Partial<ExtrinsicBuildingOptions>,
  ): SubmittableResultResult<`promise`> {
    const extrinsicPromise = prepareExtrinsic<'promise'>(chainId, building, options);

    const keyringPromise = new Promise<KeyringPair>(function () {});

    return extrinsicPromise.then(async (extrinsic) => {
      const keyringPair = await keyringPromise;
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
