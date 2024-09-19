// @vitest-environment node
// Above directive is required, otherwise isU8a fails
// https://github.com/vitest-dev/vitest/issues/4043#issuecomment-1713787131
import { describe, expect, test } from 'vitest';

import { validateAddress } from '../address';

describe('shared/helpers/address#validateAddress', () => {
  test('should fail validation for short address', () => {
    const result = validateAddress('0x00');
    expect(result).toEqual(false);
  });

  test('should fail validation for invalid public key', () => {
    const result = validateAddress('0xf5d5714c08vc112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b');
    expect(result).toEqual(false);
  });

  test('should fail validation for incorrect ss58 address', () => {
    const result = validateAddress('16fL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD');
    expect(result).toEqual(false);
  });

  test('should pass validation for valid public key', () => {
    const result = validateAddress('0xf5d5714c084c112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b');
    expect(result).toEqual(true);
  });

  test('should pass validation for valid ss58 address', () => {
    const result = validateAddress('16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD');
    expect(result).toEqual(true);
  });

  test('should pass validation for H160 address', () => {
    const result = validateAddress('0xbd9156517165b34c6a2f3172d64ecc8ee0b05391');
    expect(result).toEqual(true);
  });

  test('should fail validation for short random set of bytes', () => {
    const result = validateAddress('0x00010200102');
    expect(result).toEqual(false);
  });

  test('should fail validation for invalid set of chars', () => {
    const result = validateAddress('randomaddress');
    expect(result).toEqual(false);
  });

  test('short address is not valid', () => {
    const result = validateAddress('F7NZ');
    expect(result).toEqual(false);
  });
});
