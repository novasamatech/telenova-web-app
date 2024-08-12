import { describe, expect, test } from 'vitest';

import { BN } from '@polkadot/util';

import { toFormattedBalance } from '../balance';

describe('shared/helpers/balance#formatBalance', () => {
  test('should calculate amount without float part', () => {
    const { value, bn, suffix, decimalPlaces } = toFormattedBalance('50000000000000', 12);

    expect(value).toEqual('50');
    expect(suffix).toEqual('');
    expect(decimalPlaces).toEqual(2);
    expect(bn).toEqual(new BN('50000000000000'));
  });

  test('should calculate small amount', () => {
    const { value, bn, suffix, decimalPlaces } = toFormattedBalance('5923210799282', 12);

    expect(value).toEqual('5.92321');
    expect(suffix).toEqual('');
    expect(decimalPlaces).toEqual(5);
    expect(bn).toEqual(new BN('5923210799282'));
  });

  test('should calculate thousands', () => {
    const { value, bn, suffix, decimalPlaces } = toFormattedBalance('16172107992822306', 12);

    expect(value).toEqual('16172.1');
    expect(suffix).toEqual('');
    expect(decimalPlaces).toEqual(2);
    expect(bn).toEqual(new BN('16172107992822306'));
  });

  test('should calculate millions', () => {
    const { value, bn, suffix, decimalPlaces } = toFormattedBalance('1617210799282230602', 12);

    expect(value).toEqual('1.61');
    expect(suffix).toEqual('M');
    expect(decimalPlaces).toEqual(2);
    expect(bn).toEqual(new BN('1617210799282230602'));
  });

  test('should calculate billion', () => {
    const { value, bn, suffix, decimalPlaces } = toFormattedBalance('8717210799282230602024', 12);

    expect(value).toEqual('8.71');
    expect(suffix).toEqual('B');
    expect(decimalPlaces).toEqual(2);
    expect(bn).toEqual(new BN('8717210799282230602024'));
  });

  test('should calculate trillion', () => {
    const { value, bn, suffix, decimalPlaces } = toFormattedBalance('91528717210799282230602024', 12);

    expect(value).toEqual('91.52');
    expect(suffix).toEqual('T');
    expect(decimalPlaces).toEqual(2);
    expect(bn).toEqual(new BN('91528717210799282230602024'));
  });

  test('should work with BN', () => {
    const { value, bn, suffix, decimalPlaces } = toFormattedBalance(new BN('1617210799282230602'), 12);

    expect(value).toEqual('1.61');
    expect(suffix).toEqual('M');
    expect(decimalPlaces).toEqual(2);
    expect(bn).toEqual(new BN('1617210799282230602'));
  });

  test('should add correct shorthands, when parametrized', () => {
    const { value, bn, suffix, decimalPlaces } = toFormattedBalance('5200000000000000', 12, {
      thousand: true,
    });

    expect(value).toEqual('5.2');
    expect(suffix).toEqual('K');
    expect(decimalPlaces).toEqual(2);
    expect(bn).toEqual(new BN('5200000000000000'));
  });
});
