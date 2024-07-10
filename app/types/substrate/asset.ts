export type Asset = {
  name: string;
  assetId: AssetId;
  symbol: string;
  precision: number;
  priceId?: string;
  icon: string;
  type?: AssetType;
  typeExtras?: StatemineExtras;
  // typeExtras?: StatemineExtras | OrmlExtras;
};

export type AssetType = 'orml' | 'statemine';

export type StatemineExtras = {
  assetId: string;
};

export type OrmlExtras = {
  currencyIdScale: string;
  currencyIdType: string;
  existentialDeposit: string;
  transfersEnabled?: boolean;
};
