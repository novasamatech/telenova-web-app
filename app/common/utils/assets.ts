import { encodeAddress } from '@polkadot/util-crypto';

import { type AssetAccount, AssetType } from '../types';

import { type Asset, type Chain } from '@/common/chainRegistry';

export const getAssetId = (asset: Asset): string => {
  if (asset.type === AssetType.STATEMINE) {
    return asset.typeExtras!.assetId;
  }

  return asset.assetId.toString();
};

export const isStatemineAsset = (type?: string): boolean => {
  return type === AssetType.STATEMINE;
};

const isPolkadotOrUSDT = (symbol: string): boolean => {
  return symbol === 'USDT' || symbol === 'DOT';
};

export const sortingAssets = (first: Asset, second: Asset): number => {
  const isFirstPolkadotOrUSDT = isPolkadotOrUSDT(first.symbol);
  const isSecondPolkadotOrUSDT = isPolkadotOrUSDT(second.symbol);

  if (isFirstPolkadotOrUSDT && !isSecondPolkadotOrUSDT) {
    return -1;
  }
  if (!isFirstPolkadotOrUSDT && isSecondPolkadotOrUSDT) {
    return 1;
  }

  return first.symbol.localeCompare(second.symbol);
};

export const mapAssetAccountsFromChains = (chains: Chain[], publicKey: PublicKey): AssetAccount[] => {
  return chains
    .flatMap(chain =>
      chain.assets.map(asset => ({
        chainId: chain.chainId,
        publicKey: publicKey,
        chainName: chain.name,
        asset: asset,
        addressPrefix: chain.addressPrefix,
        address: encodeAddress(publicKey, chain.addressPrefix),
      })),
    )
    .sort((a, b) => sortingAssets(a.asset, b.asset));
};

export const pickAsset = (chainId: string, assetId: string, assets: AssetAccount[]): AssetAccount | undefined => {
  return assets.find(asset => {
    const isChainIdMatch = asset.chainId === chainId;
    const isAssetIdMatch = asset.asset.assetId.toString() === assetId;

    return isChainIdMatch && isAssetIdMatch;
  });
};
