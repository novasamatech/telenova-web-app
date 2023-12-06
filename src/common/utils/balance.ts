import BigNumber from 'bignumber.js';

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
  console.log(
    1,
    decimalPlaces,
    suffix,
    new BNWithConfig(bnBalance).div(divider).decimalPlaces(decimalPlaces).toFormat(),
  );

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
