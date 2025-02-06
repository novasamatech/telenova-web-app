export type Subscriptions = {
  [chainId: ChainId]: Record<AssetId, VoidFunction> | undefined;
};
