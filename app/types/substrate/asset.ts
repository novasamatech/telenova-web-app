export type Asset = {
  name: string;
  assetId: AssetId;
  symbol: string;
  precision: number;
  priceId?: string;
  icon: string;
  type: 'native' | 'statemine'; // Support 'orml' in future
  typeExtras?: StatemineExtras;
};

export type StatemineExtras = {
  assetId: string;
};

// export type OrmlExtras = {
//   currencyIdScale: string;
//   currencyIdType: string;
//   existentialDeposit: string;
//   transfersEnabled?: boolean;
// };

export type AssetPrice = Record<Currency, PriceItem>;

export type PriceItem = {
  price: number;
  change?: number;
};

export type AssetsMap = Record<ChainId, Record<AssetId, Asset> | undefined>;
