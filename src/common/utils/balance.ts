import BigNumber from 'bignumber.js';
import { BN, BN_TEN } from '@polkadot/util';

import { AssetAccount, AssetPrice, ChainAssetAccount, ChainAssetId } from '../types';
import { Chain } from '../chainRegistry/types';
import { IAssetBalance } from '../balances/types';

import { ZERO_BALANCE } from './constants';

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

export function chainAssetIdToString(value: ChainAssetId): string {
  return `${value.chainId} - ${value.assetId}`;
}

export function chainAssetAccountIdToString(value: ChainAssetAccount): string {
  const partial = chainAssetIdToString({ chainId: value.chainId, assetId: value.asset.assetId });

  return `${partial} - ${value.publicKey}`;
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

export const formatAmount = (rawAmount: string, precision: number): string => {
  if (!rawAmount) return ZERO_BALANCE;

  const amount = (+rawAmount).toString();
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

export const getTotalBalance = (assets: AssetAccount[], assetsPrices: AssetPrice | null) => {
  if (!assets.length || !assetsPrices) return;

  return assets.reduce((acc, asset) => {
    if (!asset.asset.priceId) return acc;

    const price = assetsPrices[asset.asset.priceId].price || 0;
    const formatedBalance = Number(formatBalance(asset.totalBalance, asset.asset.precision).formattedValue);
    acc += price * formatedBalance;

    return acc;
  }, 0);
};
