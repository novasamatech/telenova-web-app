import { type Asset } from '@/types/substrate';

export const getAssetId = (asset: Asset): string => {
  const assetIds: Record<Asset['type'], string> = {
    native: asset.assetId.toString(),
    statemine: asset.typeExtras!.assetId,
  };

  return assetIds[asset.type];
};

export const isNativeAsset = (type?: Asset['type']): boolean => {
  return type === 'native';
};

export const isStatemineAsset = (type?: Asset['type']): boolean => {
  return type === 'statemine';
};
