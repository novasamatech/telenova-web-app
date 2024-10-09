import { describe, expect, test } from 'vitest';

import { telegramApi } from '../telegram-api';

describe('shared/api/telegram/telegram-api', () => {
  test.each([
    ['acbdeacbdeacbde12345_12_WND', true], // valid (with chainIndex)
    ['acbdeacbdeacbde12345_wnd', true], // valid (no chainIndex)
    ['acbdeacbdeacbdeabcde_12_wnd', true], // valid (no digits inside entropy)
    ['acbdeacbdeacbde12345_12_23_wnd', false], // double chainIndex
    ['qwertqwertqwert12345_12_wnd', false], // wrong letters inside entropy
    ['acbdeacbdeacbde12345_12', false], // no asset symbol
    ['', false], // no data at all
  ])('should validate Telegram StartParam', (value, expectedResult) => {
    const result = telegramApi.validateStartParam(value);

    expect(result).toEqual(expectedResult);
  });
});
