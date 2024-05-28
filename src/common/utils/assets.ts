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
