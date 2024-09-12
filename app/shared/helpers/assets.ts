import type { Asset, NativeAsset, OrmlAsset, StatemineAsset } from '@/types/substrate';

export const assetUtils = {
  getAssetId,

  isNativeAsset,
  isStatemineAsset,
  isOrmlAsset,
};

function getAssetId(asset: Asset): string {
  const defaultAssetId = asset.assetId.toString();

  const assetIds: Record<Asset['type'], string> = {
    native: defaultAssetId,
    statemine: (asset as StatemineAsset).typeExtras.assetId,
    orml: (asset as OrmlAsset).typeExtras.currencyIdScale,
  };

  return assetIds[asset.type];
}

function isNativeAsset(asset?: Asset): asset is NativeAsset {
  return asset?.type === 'native';
}

function isStatemineAsset(asset?: Asset): asset is StatemineAsset {
  return asset?.type === 'statemine';
}

function isOrmlAsset(asset?: Asset): asset is OrmlAsset {
  return asset?.type === 'orml';
}
