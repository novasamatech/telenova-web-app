import BigNumber from 'bignumber.js';
import { isEmpty } from 'lodash-es';

import { BN, BN_TEN, BN_ZERO } from '@polkadot/util';

import { type AssetPrice, type ChainBalances, type ChainsMap } from '@/types/substrate';

type Suffix = 'thousand' | 'million' | 'billion' | 'trillion';

const Decimal = {
  SMALL_NUMBER: 5,
  BIG_NUMBER: 2,
};

type FormattedBalance = {
  value: string;
  bn: BN;
  suffix: string;
  decimalPlaces: number;
  formatted: string;
};

const defaultShorthands: Record<Suffix, boolean> = {
  thousand: false,
  million: true,
  billion: true,
  trillion: true,
};

export const toFormattedBalance = (
  balance: string | BN = '0',
  precision = 0,
  shorthands?: Partial<Record<Suffix, boolean>>,
): FormattedBalance => {
  const mergedShorthands = shorthands ? Object.assign(defaultShorthands, shorthands) : defaultShorthands;

  const stringBalance = balance.toString();

  const BNWithConfig = BigNumber.clone();
  BNWithConfig.config({
    DECIMAL_PLACES: precision || Decimal.SMALL_NUMBER,
    ROUNDING_MODE: BNWithConfig.ROUND_DOWN,
    FORMAT: {
      decimalSeparator: '.',
      groupSeparator: '',
    },
  });
  const TEN = new BNWithConfig(10);
  const bnPrecision = new BNWithConfig(precision);
  const bnBalance = new BNWithConfig(stringBalance).div(TEN.pow(bnPrecision));
  let divider = new BNWithConfig(1);
  let decimalPlaces = 0;
  let suffix = '';

  if (bnBalance.lt(1)) {
    decimalPlaces = Math.max(precision - stringBalance.length + 1, 5);
  } else if (bnBalance.lt(10)) {
    decimalPlaces = Decimal.SMALL_NUMBER;
  } else if (bnBalance.lt(1_000_000)) {
    decimalPlaces = Decimal.BIG_NUMBER;
    if (mergedShorthands.thousand) {
      divider = TEN.pow(new BNWithConfig(3));
      suffix = 'K';
    }
  } else if (bnBalance.lt(1_000_000_000)) {
    decimalPlaces = Decimal.BIG_NUMBER;
    if (mergedShorthands.million) {
      divider = TEN.pow(new BNWithConfig(6));
      suffix = 'M';
    }
  } else if (bnBalance.lt(1_000_000_000_000)) {
    decimalPlaces = Decimal.BIG_NUMBER;
    if (mergedShorthands.billion) {
      divider = TEN.pow(new BNWithConfig(9));
      suffix = 'B';
    }
  } else {
    decimalPlaces = Decimal.BIG_NUMBER;
    if (mergedShorthands.trillion) {
      divider = TEN.pow(new BNWithConfig(12));
      suffix = 'T';
    }
  }

  const value = new BNWithConfig(bnBalance).div(divider).decimalPlaces(decimalPlaces);

  return {
    value: value.toFormat(),
    bn: new BN(balance),
    suffix,
    decimalPlaces,
    formatted: value.toFormat() + suffix,
  };
};

export const toPrecisedBalance = (amount: string, precision: number): BN => {
  if (!amount || Number.isNaN(parseFloat(amount))) return BN_ZERO;

  const isDecimalValue = amount.match(/^(\d+)\.(\d+)$/);
  const bnPrecision = new BN(precision);

  if (isDecimalValue) {
    const div = new BN(amount.replace(/\.\d*$/, ''));
    const modString = amount.replace(/^\d+\./, '').slice(0, precision);
    const mod = new BN(modString);

    return div.mul(BN_TEN.pow(bnPrecision)).add(mod.mul(BN_TEN.pow(new BN(precision - modString.length))));
  }

  return new BN(amount.replace(/\D/g, '')).mul(BN_TEN.pow(bnPrecision));
};

export const getTotalBalance = (chains: ChainsMap, balances: ChainBalances, prices: AssetPrice | null): number => {
  if (isEmpty(balances) || !prices) return 0;

  let totalBalance = 0;

  for (const [chainId, assetBalance] of Object.entries(balances)) {
    const asset = chains[chainId as ChainId].assets.find(asset => assetBalance[asset.assetId]);

    if (!asset?.priceId) continue;

    const formatedBalance = toFormattedBalance(assetBalance[asset.assetId].balance.total, asset.precision).value;

    totalBalance += parseFloat(formatedBalance) * (prices[asset.priceId].price || 0);
  }

  return totalBalance;
};
