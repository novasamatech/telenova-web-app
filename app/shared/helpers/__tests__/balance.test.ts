import { describe, expect, test } from 'vitest';

import { BN } from '@polkadot/util';

import { toFormattedBalance, toRoundedFiat } from '../balance';

describe('shared/helpers/balance#toFormattedBalance', () => {
  test.each([
    ['1343', 13, '0.0000000001', ''],
    ['1343', 13, '0.000000000134', '', 3],
    ['1000', 13, '0.0000000001', '', 3],
    ['12344343', 11, '0.00012', ''],
    ['1005', 4, '0.1005', ''],
    ['1123456', 6, '1.12345', ''],
    ['10023', 2, '100.23', ''],
    ['100123456', 6, '100.12', ''],
    ['5923210799282', 12, '5.92321', ''],
    ['9999999', 10, '0.00099', ''],
    ['99999999', 5, '999.99', ''],
    ['315000041811', 12, '0.315', ''],
    ['50000000000000', 12, '50', ''],
    ['5923210799282', 12, '5.92321', ''],
    ['16172107992822306', 12, '16172.1', ''],
    ['1617210799282230602', 12, '1.61', 'M'],
    ['8717210799282230602024', 12, '8.71', 'B'],
    ['91528717210799282230602024', 12, '91.52', 'T'],
    [new BN('1617210799282230602'), 12, '1.61', 'M'],
  ])('should format balance value based on price and precision', (...args) => {
    const [amount, precision, expectedValue, expectedSuffix, nonZeroDigits] = args;
    const { value, bn, suffix, formatted } = toFormattedBalance(amount, precision, nonZeroDigits);

    expect(value).toEqual(expectedValue);
    expect(bn).toEqual(new BN(amount));
    expect(suffix).toEqual(expectedSuffix);
    expect(formatted).toEqual(`${value}${suffix}`);
  });
});

describe('shared/helpers/balance#toRoundedFiat', () => {
  test.each([
    ['5923210799282', 12, 0.5, 2.9616, ''],
    ['5923210799282', 12, 0.000000000005, 0.0000000000296, ''],
    ['5923210799282', 12, 1.2, 7.10785, ''],
    ['5923210799282', 12, 2.4, 14.21, ''],
    ['5923210799282', 12, 56000, 331699.8, ''],
  ])('should format balance value based on price and precision', (...args) => {
    const [balance, precision, price, expectedValue] = args;
    const result = toRoundedFiat(balance, price, precision);

    expect(result).toEqual(expectedValue);
  });
});
