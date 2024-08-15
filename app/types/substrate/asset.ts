interface BaseAsset {
  name: string;
  assetId: AssetId;
  symbol: string;
  precision: number;
  priceId?: string;
  icon: string;
}

export interface NativeAsset extends BaseAsset {
  type: 'native';
}

export interface StatemineAsset extends BaseAsset {
  type: 'statemine';
  typeExtras: {
    assetId: string;
  };
}

export interface OrmlAsset extends BaseAsset {
  type: 'orml';
  typeExtras: {
    currencyIdScale: string;
    currencyIdType: string;
    existentialDeposit: string;
    transfersEnabled?: boolean;
  };
}

export type Asset = NativeAsset | StatemineAsset | OrmlAsset;

export type AssetPrice = Record<Currency, PriceItem>;

export type PriceItem = {
  price: number;
  change?: number;
};

export type AssetsMap = Record<ChainId, Record<AssetId, Asset>>;
