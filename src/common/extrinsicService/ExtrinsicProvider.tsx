import { createContext, PropsWithChildren, useContext } from 'react';
import { SignerOptions } from '@polkadot/api/types/submittable';
import { ChainId } from '@common/types';
import {
  EstimateFee,
  ExtrinsicBuilding,
  ExtrinsicBuildingOptions,
  GetExistentialDeposit,
  GetExistentialDepositStatemine,
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
  getExistentialDeposit: GetExistentialDeposit;
  getExistentialDepositStatemine: GetExistentialDepositStatemine;
  assetConversion: (chainId: ChainId, amount: number, assetId: string) => Promise<number>;
};

const ExtrinsicProviderContext = createContext<ExtrinsicProviderContextProps>({} as ExtrinsicProviderContextProps);

export const ExtrinsicProvider = ({ children }: PropsWithChildren) => {
  const { prepareExtrinsic, prepareApi } = useExtrinsicService();

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

  async function getExistentialDeposit(chainId: ChainId): Promise<string | undefined> {
    const api = await prepareApi(chainId);

    return api.consts.balances.existentialDeposit.toString();
  }

  async function getExistentialDepositStatemine(chainId: ChainId, assetId?: string): Promise<string | undefined> {
    if (!assetId) return;

    const api = await prepareApi(chainId);
    const deposit = await api.query.assets.asset(assetId);

    return deposit.value.minBalance.toString();
  }

  async function assetConversion(chainId: ChainId, amount: number, assetId: string): Promise<number> {
    const api = await prepareApi(chainId);

    const convertedFee = await api.call.assetConversionApi.quotePriceTokensForExactTokens(
      {
        // Custom token MultiLocation
        parents: 0,
        interior: {
          X2: [{ PalletInstance: 50 }, { GeneralIndex: assetId }],
        },
      },
      {
        // DOT MultiLocation
        parents: 1,
        interior: {
          Here: '',
        },
      },
      amount,
      true,
    );

    return Number(convertedFee);
  }

  return (
    <ExtrinsicProviderContext.Provider
      value={{
        estimateFee,
        submitExtrinsic,
        getExistentialDeposit,
        getExistentialDepositStatemine,
        assetConversion,
      }}
    >
      {children}
    </ExtrinsicProviderContext.Provider>
  );
};

export const useExtrinsicProvider = () => useContext<ExtrinsicProviderContextProps>(ExtrinsicProviderContext);
