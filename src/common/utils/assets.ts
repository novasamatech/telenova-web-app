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

const isPolkadotOrUSDT = (symbol: string): boolean => {
  return symbol === 'USDT' || symbol === 'DOT';
};

export const sortingAssets = (first: Asset, second: Asset) => {
  const isFirstPolkadotOrUSDT = isPolkadotOrUSDT(first.symbol);
  const isSecondPolkadotOrUSDT = isPolkadotOrUSDT(second.symbol);

  if (isFirstPolkadotOrUSDT && !isSecondPolkadotOrUSDT) return -1;
  if (!isFirstPolkadotOrUSDT && isSecondPolkadotOrUSDT) return 1;

  return first.symbol.localeCompare(second.symbol);
};
