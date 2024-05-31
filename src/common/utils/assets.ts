import type { Asset } from '@common/chainRegistry';
import { AssetType } from '../types';

export const getAssetId = (asset: Asset): string => {
  if (asset.type === AssetType.STATEMINE) {
    return asset.typeExtras!.assetId;
  }

  return asset.assetId.toString();
};

export const isStatemineAsset = (type?: string) => {
  if (!type) return false;

  return type === AssetType.STATEMINE;
};

export const sortingAssets = (first: Asset, second: Asset) => {
  if (first.symbol === 'DOT') return -1;
  if (second.symbol === 'USDT') return 1;

  return first.symbol.localeCompare(second.symbol);
};
