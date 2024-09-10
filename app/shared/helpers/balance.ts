import BigNumber from 'bignumber.js';
import { isEmpty } from 'lodash-es';

import { BN, BN_TEN, BN_ZERO } from '@polkadot/util';

import { type AssetPrices, type ChainBalances, type ChainsMap } from '@/types/substrate';

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

/*
 * Get formatted asset balance with suffixes (M, B, T)
 *
 * @param balance Asset balance
 * @param precision Asset precision
 * @param nonZeroDigits Number of digits to get in decimal part
 *
 * @returns {Object}
 */
export const toFormattedBalance = (balance: string | BN = '0', precision = 0, nonZeroDigits = 1): FormattedBalance => {
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
  let decimalPlaces;
  let suffix = '';

  if (bnBalance.lt(1)) {
    decimalPlaces = getDecimalPlaceForFirstNonZeroChar(bnBalance.toFixed(), nonZeroDigits);
  } else if (bnBalance.lt(10)) {
    decimalPlaces = Decimal.SMALL_NUMBER;
  } else if (bnBalance.lt(1_000_000)) {
    decimalPlaces = Decimal.BIG_NUMBER;
    // divider = TEN.pow(new BNWithConfig(3));
  } else if (bnBalance.lt(1_000_000_000)) {
    decimalPlaces = Decimal.BIG_NUMBER;
    divider = TEN.pow(new BNWithConfig(6));
    suffix = 'M';
  } else if (bnBalance.lt(1_000_000_000_000)) {
    decimalPlaces = Decimal.BIG_NUMBER;
    divider = TEN.pow(new BNWithConfig(9));
    suffix = 'B';
  } else {
    decimalPlaces = Decimal.BIG_NUMBER;
    divider = TEN.pow(new BNWithConfig(12));
    suffix = 'T';
  }

  const value = new BNWithConfig(bnBalance).div(divider).decimalPlaces(decimalPlaces);

  return {
    suffix,
    decimalPlaces,
    value: value.toFormat(),
    bn: new BN(balance),
    formatted: value.toFormat() + suffix,
  };
};

/*
 * Get fiat price for the asset balance
 *
 * @param balance Asset balance
 * @param price Fiat price
 * @param precision Asset precision
 * @param nonZeroDigits Number of digits to get in decimal part
 *
 * @returns {Number}
 */
export const toRoundedFiat = (
  balance: string | BN = '0',
  price: number,
  precision = 0,
  nonZeroDigits?: number,
): number => {
  if (Number(balance) === 0 || isNaN(Number(balance))) return 0;

  const stringBalance = balance.toString();

  const BNWithConfig = BigNumber.clone();
  BNWithConfig.config({
    ROUNDING_MODE: BNWithConfig.ROUND_DOWN,
  });

  const TEN = new BNWithConfig(10);
  const bnPrecision = new BNWithConfig(precision);
  const fiatBalance = new BigNumber(stringBalance).multipliedBy(price);
  const bnFiatBalance = new BNWithConfig(fiatBalance).div(TEN.pow(bnPrecision));

  if (bnFiatBalance.gte(1) && bnFiatBalance.lt(10)) {
    return bnFiatBalance.decimalPlaces(Decimal.SMALL_NUMBER).toNumber();
  }
  if (bnFiatBalance.gt(10)) {
    return bnFiatBalance.decimalPlaces(Decimal.BIG_NUMBER).toNumber();
  }

  const decimalPlaces = getDecimalPlaceForFirstNonZeroChar(bnFiatBalance.toFixed(), nonZeroDigits);

  return Number(bnFiatBalance.toFixed(decimalPlaces));
};

const getDecimalPlaceForFirstNonZeroChar = (value: string, nonZeroDigits = 3) => {
  const decimalPart = value.toString().split('.')[1];

  return Math.max((decimalPart || '').search(/[1-9]/) + nonZeroDigits, 5);
};

/*
 * Get asset balance with precision
 * Balance: 1, Precision 10 --> 1000000000
 *
 * @param balance Asset balance
 * @param precision Asset precision
 *
 * @returns {BigNumber}
 */
export const toPreciseBalance = (balance: string, precision: number): BN => {
  if (!balance || Number.isNaN(parseFloat(balance))) return BN_ZERO;

  const isDecimalValue = balance.match(/^(\d+)\.(\d+)$/);
  const bnPrecision = new BN(precision);

  if (isDecimalValue) {
    const div = new BN(balance.replace(/\.\d*$/, ''));
    const modString = balance.replace(/^\d+\./, '').slice(0, precision);
    const mod = new BN(modString);

    return div.mul(BN_TEN.pow(bnPrecision)).add(mod.mul(BN_TEN.pow(new BN(precision - modString.length))));
  }

  return new BN(balance.replace(/\D/g, '')).mul(BN_TEN.pow(bnPrecision));
};

/*
 * Get total fiat balance for assets with prices
 *
 * @param chains Available chains
 * @param balances Chains' balances
 * @param prices Fiat prices
 *
 * @returns {Number | undefined}
 */
export const getTotalFiatBalance = (
  chains: ChainsMap,
  balances: ChainBalances,
  prices: AssetPrices | null,
): number | undefined => {
  if (isEmpty(chains) || isEmpty(balances) || !prices) return undefined;

  let totalBalance = 0;

  for (const [chainId, assetBalance] of Object.entries(balances)) {
    const asset = chains[chainId as ChainId].assets.find(asset => assetBalance[asset.assetId]);

    if (!asset?.priceId) continue;

    totalBalance += toRoundedFiat(
      assetBalance[asset.assetId].balance.total,
      prices[asset.priceId].price || 0,
      asset.precision,
    );
  }

  return totalBalance;
};
