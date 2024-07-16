export type Asset = {
  name: string;
  assetId: AssetId;
  symbol: string;
  precision: number;
  priceId?: string;
  icon: string;
  type: AssetType;
  typeExtras?: StatemineExtras;
};

// Support 'orml' in future
export type AssetType = 'native' | 'statemine';

export type StatemineExtras = {
  assetId: string;
};

export type OrmlExtras = {
  currencyIdScale: string;
  currencyIdType: string;
  existentialDeposit: string;
  transfersEnabled?: boolean;
};
