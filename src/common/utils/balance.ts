import BigNumber from 'bignumber.js';
import { decodeAddress } from '@polkadot/keyring';
import { BN, BN_TEN } from '@polkadot/util';

import { AssetAccount, ChainId, TrasferAsset } from '../types';
import { Chain } from '../chainRegistry/types';
import { IAssetBalance } from '../balances/types';
import { EstimateFee, ExtrinsicBuilder, SubmitExtrinsic } from '../extrinsicService/types';
import { Balance } from '@polkadot/types/interfaces';
import { FAKE_ACCOUNT_ID } from './constants';

const ZERO_BALANCE = '0';

type FormattedBalance = {
  formattedValue: string;
  suffix: string;
  decimalPlaces: number;
};

const enum Suffix {
  MILLIONS = 'M',
  BILLIONS = 'B',
  TRILLIONS = 'T',
}

export const enum Decimal {
  SMALL_NUMBER = 5,
  BIG_NUMBER = 2,
}

// format balance from spektr

export const formatBalance = (balance = '0', precision = 0): FormattedBalance => {
  const BNWithConfig = BigNumber.clone();
  BNWithConfig.config({
    // HOOK: for divide with decimal part
    DECIMAL_PLACES: precision || Decimal.SMALL_NUMBER,
    ROUNDING_MODE: BNWithConfig.ROUND_DOWN,
    FORMAT: {
      decimalSeparator: '.',
      groupSeparator: '',
    },
  });
  const TEN = new BNWithConfig(10);
  const bnPrecision = new BNWithConfig(precision);
  const bnBalance = new BNWithConfig(balance).div(TEN.pow(bnPrecision));
  let divider = new BNWithConfig(1);
  let decimalPlaces = 0;
  let suffix = '';

  if (bnBalance.lt(1)) {
    decimalPlaces = Math.max(precision - balance.toString().length + 1, 5);
  } else if (bnBalance.lt(10)) {
    decimalPlaces = Decimal.SMALL_NUMBER;
  } else if (bnBalance.lt(1_000_000)) {
    decimalPlaces = Decimal.BIG_NUMBER;
  } else if (bnBalance.lt(1_000_000_000)) {
    decimalPlaces = Decimal.BIG_NUMBER;
    divider = TEN.pow(new BNWithConfig(6));
    suffix = Suffix.MILLIONS;
  } else if (bnBalance.lt(1_000_000_000_000)) {
    decimalPlaces = Decimal.BIG_NUMBER;
    divider = TEN.pow(new BNWithConfig(9));
    suffix = Suffix.BILLIONS;
  } else {
    decimalPlaces = Decimal.BIG_NUMBER;
    divider = TEN.pow(new BNWithConfig(12));
    suffix = Suffix.TRILLIONS;
  }

  return {
    formattedValue: new BNWithConfig(bnBalance).div(divider).decimalPlaces(decimalPlaces).toFormat(),
    suffix,
    decimalPlaces,
  };
};

const getDecimalPlaceForFirstNonZeroChar = (value: string, nonZeroDigits = 3) => {
  const decimalPart = value.toString().split('.')[1];

  return Math.max((decimalPart || '').search(/[1-9]/) + nonZeroDigits, 5);
};

export const formatFiatBalance = (balance = '0', precision = 0): FormattedBalance => {
  if (Number(balance) === 0 || isNaN(Number(balance))) {
    return { formattedValue: ZERO_BALANCE, suffix: '', decimalPlaces: 0 };
  }
  const BNWithConfig = BigNumber.clone();
  BNWithConfig.config({
    ROUNDING_MODE: BNWithConfig.ROUND_DOWN,
    FORMAT: {
      decimalSeparator: '.',
      groupSeparator: '',
    },
  });

  const bnPrecision = new BNWithConfig(precision);
  const TEN = new BNWithConfig(10);
  const bnBalance = new BNWithConfig(balance).div(TEN.pow(bnPrecision));

  let divider = new BNWithConfig(1);
  let suffix = '';
  let decimalPlaces: number;

  if (bnBalance.lt(1)) {
    // if number has more than 7 digits in decimal part BigNumber.toString returns number in scientific notation
    decimalPlaces = getDecimalPlaceForFirstNonZeroChar(bnBalance.toFixed());
  } else if (bnBalance.lt(10)) {
    decimalPlaces = Decimal.SMALL_NUMBER;
  } else if (bnBalance.lt(1_000_000)) {
    decimalPlaces = Decimal.BIG_NUMBER;
  } else if (bnBalance.lt(1_000_000_000)) {
    decimalPlaces = Decimal.BIG_NUMBER;
    divider = TEN.pow(new BNWithConfig(6));
    suffix = Suffix.MILLIONS;
  } else if (bnBalance.lt(1_000_000_000_000)) {
    decimalPlaces = Decimal.BIG_NUMBER;
    divider = TEN.pow(new BNWithConfig(9));
    suffix = Suffix.BILLIONS;
  } else {
    decimalPlaces = Decimal.BIG_NUMBER;
    divider = TEN.pow(new BNWithConfig(12));
    suffix = Suffix.TRILLIONS;
  }

  const bnFiatBalance = new BNWithConfig(bnBalance).div(divider).decimalPlaces(decimalPlaces).toFormat();

  return {
    formattedValue: bnFiatBalance,
    suffix,
    decimalPlaces,
  };
};

export const updateAssetsBalance = (prevAssets: AssetAccount[], chain: Chain, balance: IAssetBalance) => {
  return prevAssets.map((asset) =>
    asset?.chainId === chain.chainId
      ? {
          ...asset,
          totalBalance: balance.total().toString(),
          transferableBalance: balance.transferable().toString(),
        }
      : asset,
  );
};

export const formatAmount = (amount: string, precision: number): string => {
  if (!amount) return ZERO_BALANCE;

  const isDecimalValue = amount.match(/^(\d+)\.(\d+)$/);
  const bnPrecision = new BN(precision);
  if (isDecimalValue) {
    const div = new BN(amount.replace(/\.\d*$/, ''));
    const modString = amount.replace(/^\d+\./, '').slice(0, precision);
    const mod = new BN(modString);

    return div
      .mul(BN_TEN.pow(bnPrecision))
      .add(mod.mul(BN_TEN.pow(new BN(precision - modString.length))))
      .toString();
  }

  return new BN(amount.replace(/\D/g, '')).mul(BN_TEN.pow(bnPrecision)).toString();
};

export async function handleSend(
  submitExtrinsic: SubmitExtrinsic,
  { destinationAddress, chainId, amount, transferAll, precision }: TrasferAsset,
  giftTransfer?: string,
) {
  const decodedAddress = decodeAddress(destinationAddress || giftTransfer);

  return await submitExtrinsic(chainId, (builder) => {
    const transferFunction = transferAll
      ? builder.api.tx.balances.transferAll(decodedAddress, false)
      : builder.api.tx.balances.transferKeepAlive(decodedAddress, formatAmount(amount as string, precision));

    builder.addCall(transferFunction);
  }).then((hash) => {
    console.log('Success, Hash:', hash?.toString());
  });
}

export async function handleFee(
  estimateFee: EstimateFee,
  chainId: ChainId,
  precision: number,
  isGift?: boolean,
): Promise<number> {
  return await estimateFee(chainId, (builder: ExtrinsicBuilder) =>
    builder.addCall(builder.api.tx.balances.transferAll(decodeAddress(FAKE_ACCOUNT_ID), false)),
  ).then((fee: Balance) => {
    const finalFee = isGift ? Number(fee) * 2 : fee;
    const { formattedValue } = formatBalance(finalFee.toString(), precision);

    return Number(formattedValue);
  });
}
