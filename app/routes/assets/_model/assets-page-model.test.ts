import { allSettled, fork } from 'effector';
import { describe, expect, test, vi } from 'vitest';

import { networkModel } from '@/models';
import type { ChainsMap } from '@/types/substrate';

import { assetsPageModel } from './assets-page-model';

const mockedChains = {
  '0x001': { name: 'Polkadot', chainId: '0x001', assets: [{ symbol: 'DOT', assetId: 0 }] },
  '0x002': { name: 'Kusama', chainId: '0x002', assets: [{ symbol: 'KSM', assetId: 0 }] },
  '0x003': { name: 'Polkadot Asset Hub', chainId: '0x003', assets: [{ symbol: 'USDT', assetId: 1 }] },
  '0x004': { name: 'Westend', chainId: '0x004', assets: [{ symbol: 'WND', assetId: 0 }] },
  '0x005': {
    name: 'Karura',
    chainId: '0x005',
    assets: [
      { symbol: 'KAR_0', assetId: 0 },
      { symbol: 'KAR_1', assetId: 1 },
      { symbol: 'KAR_2', assetId: 2 },
    ],
  },
  '0x006': {
    name: 'Moonbeam',
    chainId: '0x006',
    assets: [
      { symbol: 'GLMR_0', assetId: 2 },
      { symbol: 'GLMR_1', assetId: 3 },
    ],
  },
} as unknown as ChainsMap;

const mockedAssets = [
  ['0x006', { assetId: 2, symbol: 'GLMR_0' }],
  ['0x006', { assetId: 3, symbol: 'GLMR_1' }],
  ['0x005', { assetId: 0, symbol: 'KAR_0' }],
  ['0x005', { assetId: 1, symbol: 'KAR_1' }],
  ['0x005', { assetId: 2, symbol: 'KAR_2' }],
];

// These assets should not appear in any list on Assets page
vi.mock('@/shared/helpers/chains', () => ({
  DEFAULT_CONNECTED_CHAINS: {
    '0x001': [0], // POLKADOT
    '0x002': [0], // KUSAMA
    '0x003': [1], // DOT_ASSET_HUB
    '0x004': [0], // WESTEND
  },
}));

describe('routes/assets/_model/assets-page-model', () => {
  test('should set $assets alphabetically on networkModel.$chains change', async () => {
    const scope = fork();

    await allSettled(networkModel._internal.$chains, { scope, params: mockedChains });

    expect(scope.getState(assetsPageModel._internal.$sortedAssets)).toEqual(mockedAssets);
  });

  test('should set $filteredAssets on pageMounted', async () => {
    const scope = fork({
      values: [
        [
          networkModel._internal.$assets,
          {
            '0x001': { 0: { assetId: 0 } },
            '0x002': { 1: { assetId: 1 } },
            '0x006': { 2: { assetId: 2 }, 3: { assetId: 3 } },
          },
        ],
      ],
    });

    await allSettled(networkModel._internal.$chains, { scope, params: mockedChains });
    await allSettled(assetsPageModel.input.pageMounted, { scope });

    expect(scope.getState(assetsPageModel.$assets)).toEqual([
      ['0x006', { assetId: 2, symbol: 'GLMR_0' }, true],
      ['0x006', { assetId: 3, symbol: 'GLMR_1' }, true],
      ['0x005', { assetId: 0, symbol: 'KAR_0' }, false],
      ['0x005', { assetId: 1, symbol: 'KAR_1' }, false],
      ['0x005', { assetId: 2, symbol: 'KAR_2' }, false],
    ]);
  });

  test('should set $filteredAssets on queryChanged', async () => {
    const scope = fork({
      values: [[networkModel._internal.$assets, { '0x005': { 2: { assetId: 2 } }, '0x006': { 3: { assetId: 3 } } }]],
    });

    await allSettled(networkModel._internal.$chains, { scope, params: mockedChains });
    await allSettled(assetsPageModel.input.queryChanged, { scope, params: 'ar' });

    expect(scope.getState(assetsPageModel.$assets)).toEqual([
      ['0x005', { assetId: 2, symbol: 'KAR_2' }, true],
      ['0x005', { assetId: 0, symbol: 'KAR_0' }, false],
      ['0x005', { assetId: 1, symbol: 'KAR_1' }, false],
    ]);
  });

  test('should set $filteredAssets on networkModel.output.assetChanged', async () => {
    // Karura asset_1 is ON and filtered by "K"
    const filteredAssets = [
      ['0x005', { assetId: 1, symbol: 'KAR_1' }, true],
      ['0x005', { assetId: 0, symbol: 'KAR_0' }, false],
      ['0x005', { assetId: 2, symbol: 'KAR_2' }, false],
    ];

    const scope = fork({
      values: [[assetsPageModel._internal.$filteredAssets, filteredAssets]],
    });

    await allSettled(networkModel.output.assetChanged, {
      scope,
      params: { chainId: '0x005', assetId: 2, status: 'on' },
    });

    expect(scope.getState(assetsPageModel.$assets)).toEqual([
      ['0x005', { assetId: 1, symbol: 'KAR_1' }, true],
      ['0x005', { assetId: 0, symbol: 'KAR_0' }, false],
      ['0x005', { assetId: 2, symbol: 'KAR_2' }, true],
    ]);
  });
});
