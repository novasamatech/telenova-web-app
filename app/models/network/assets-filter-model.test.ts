import { allSettled, fork } from 'effector';
import { describe, expect, test } from 'vitest';

import { assetsFilterModel } from '@/models/network/assets-filter-model.ts';

import { networkModel } from './network-model';

describe('@/common/network/assets-filter-model', () => {
  const assetsMock = {
    '0x001': { 1: { symbol: 'DOT', assetId: 1 } },
    '0x002': { 1: { symbol: 'KSM', assetId: 1 } },
    '0x003': { 1: { symbol: 'HDX', assetId: 1 } },
  };

  test('should filter assets on queryChange', async () => {
    const scope = fork({
      values: [[networkModel._internal.$assets, assetsMock]],
    });

    await allSettled(assetsFilterModel.input.queryChanged, { scope, params: 'D' });

    expect(scope.getState(assetsFilterModel.$assets)).toEqual([
      ['0x001', { symbol: 'DOT', assetId: 1 }],
      ['0x003', { symbol: 'HDX', assetId: 1 }],
    ]);
  });
});
