export type GiftWallet = {
  address: Address;
  secret: string;
};

declare global {
  interface Window {
    mercuryoWidget?: {
      run: (params: {
        widgetId: string;
        returnUrl: string;
        signature: string;
        host: HTMLElement;
        fixCurrency: boolean;
        type: 'buy' | 'sell';
        refundAddress: Address;
        address: Address;
        // Asset symbol
        currency: string;
        onStatusChange: (data: { status: 'paid' | 'new' }) => void;
        onSellTransferEnabled: (data: { address: string; amount: string }) => void;
      }) => void;
    };
  }
}
