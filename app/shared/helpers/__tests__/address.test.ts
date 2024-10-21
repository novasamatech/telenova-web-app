// @vitest-environment node
// Above directive is required, otherwise isU8a fails
// https://github.com/vitest-dev/vitest/issues/4043#issuecomment-1713787131
import { describe, expect, test } from 'vitest';

import { toAddress, validateAddress } from '../address';

import { type Chain } from '@/types/substrate';

describe('shared/helpers/address#validateAddress', () => {
  const substrateChain = {} as Chain;
  const evmChain = { options: ['evm'] } as Chain;

  test('should fail validation for short address', () => {
    const result = validateAddress('0x00', substrateChain);
    expect(result).toEqual(false);
  });

  test('should fail validation for invalid public key', () => {
    const result = validateAddress(
      '0xf5d5714c08vc112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b',
      substrateChain,
    );
    expect(result).toEqual(false);
  });

  test('should fail validation for incorrect ss58 address', () => {
    const result = validateAddress('16fL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD', substrateChain);
    expect(result).toEqual(false);
  });

  test('should pass validation for valid public key', () => {
    const result = validateAddress(
      '0xf5d5714c084c112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b',
      substrateChain,
    );
    expect(result).toEqual(true);
  });

  test('should pass validation for valid ss58 address', () => {
    const result = validateAddress('16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD', substrateChain);
    expect(result).toEqual(true);
  });

  test('should pass validation for valid H160 address', () => {
    const result = validateAddress('0x629C0eC6B23D0E3A2f67c2753660971faa9A1907', evmChain);
    expect(result).toEqual(true);
  });

  test('should pass validation for non-normalized H160 address', () => {
    const result = validateAddress('0x4c2ab98b646ce36df6a4a4407ab9fcee1c90549a', evmChain);
    expect(result).toEqual(true);
  });

  test('should fail validation for short random set of bytes', () => {
    const result = validateAddress('0x00010200102', substrateChain);
    expect(result).toEqual(false);
  });

  test('should fail validation for invalid set of chars', () => {
    const result = validateAddress('randomaddress', substrateChain);
    expect(result).toEqual(false);
  });

  test('short address is not valid', () => {
    const result = validateAddress('F7NZ', substrateChain);
    expect(result).toEqual(false);
  });
});

describe('shared/helpers/address#toAddress', () => {
  test('should produce ss58 address for valid public key', () => {
    const result = toAddress('0xf5d5714c084c112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b', {
      chain: { addressPrefix: 0 } as Chain,
    });
    expect(result).toEqual('16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD');
  });

  test('should produce ss58 address for valid ss58 address', () => {
    const result = toAddress('16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD', {
      chain: { addressPrefix: 42 } as Chain,
    });
    expect(result).toEqual('5Hd2ze5ug8n1bo3UCAcQsf66VNjKqGos8u6apNfzcU86pg4N');
  });

  test('should return same value for invalid ss58 public key', () => {
    const result = toAddress('0xe2d5714c08vc112843aca74f8c498da06cc5a2d63153b825189baa51043b1c34', {
      chain: { addressPrefix: 0 } as Chain,
    });
    expect(result).toEqual('0xe2d5714c08vc112843aca74f8c498da06cc5a2d63153b825189baa51043b1c34');
  });

  test('should produce H160 address for valid ethereum public key', () => {
    const result = toAddress('0xf5d5714c084c112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b', {
      chain: { addressPrefix: 1284, options: ['evm'] } as Chain,
    });
    expect(result).toEqual('0x8c498da06Cc5a2d63153b825189BAa51043b1F0B');
  });

  test('should return same value for invalid H160 public key', () => {
    const result = toAddress('0xEa1d5714c084c112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b', {
      chain: { addressPrefix: 1284, options: ['evm'] } as Chain,
    });
    expect(result).toEqual('0xEa1d5714c084c112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b');
  });

  test('should return same result for random string', () => {
    const result = toAddress('F7NZ', {
      chain: { addressPrefix: 1284, options: ['evm'] } as Chain,
    });
    expect(result).toEqual('F7NZ');
  });

  test('should return truncated address', () => {
    const resultSS58 = toAddress('0xf5d5714c084c112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b', {
      chain: { addressPrefix: 0 } as Chain,
      chunk: 10,
    });
    const resultH160 = toAddress('0xf5d5714c084c112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b', {
      chain: { addressPrefix: 1284, options: ['evm'] } as Chain,
      chunk: 10,
    });
    expect(resultSS58).toEqual('16ZL8yLyXv...fMAZ9czzBD');
    expect(resultH160).toEqual('0x8c498da06C...51043b1F0B');
  });
});
