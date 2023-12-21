import BigNumber from 'bignumber.js';
import { decodeAddress } from '@polkadot/keyring';
import { Address, AssetAccount, ChainId } from '../types';
import { Chain } from '../chainRegistry/types';
import { IAssetBalance } from '../balances/types';
import { EstimateFee, ExtrinsicBuilder } from '../extrinsicService/types';
import { Balance } from '@polkadot/types/interfaces';

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

// async function handleSign() {
//   extrinsicService
//     .submitExtrinsic(polkadot.chainId, (builder) => builder.addCall(builder.api.tx.system.remark('Hello')))
//     .then(
//       (hash) => {
//         alert('Success: ' + hash);
//       },
//       (failure) => {
//         alert('Failed: ' + failure);
//       },
//     );
// }

const FAKE_AMMOUNT = '1';
export async function handleFee(
  estimateFee: EstimateFee,
  chainId: ChainId,
  address: Address,
  precision: number,
): Promise<number> {
  return await estimateFee(chainId, (builder: ExtrinsicBuilder) =>
    builder.addCall(builder.api.tx.balances.transferKeepAlive(decodeAddress(address), FAKE_AMMOUNT)),
  ).then((fee: Balance) => {
    const { formattedValue } = formatBalance(fee.toString(), precision);

    return Number(formattedValue);
  });
}
