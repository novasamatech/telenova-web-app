import CryptoJS from 'crypto-js';

type WidgetParams = {
  root: HTMLElement;
  widgetId: string;
  returnPage: string;
  secret: string;
  address: Address;
  operationType: 'buy' | 'sell';
  symbol: string;
  handleStatus: (data: { status: 'paid' | 'new' }) => void;
  handleSell: (data: { address: string; amount: string }) => void;
};

export const runMercuryoWidget = ({
  root,
  secret,
  widgetId,
  returnPage,
  address,
  operationType,
  symbol,
  handleStatus,
  handleSell,
}: WidgetParams) => {
  window.mercuryoWidget?.run({
    widgetId,
    returnUrl: new URL(returnPage, window.location.origin).toString(),
    signature: CryptoJS.SHA512(address + secret).toString(),
    host: root,
    fixCurrency: true,
    type: operationType,
    refundAddress: address,
    address: address,
    currency: symbol,
    onStatusChange: handleStatus,
    onSellTransferEnabled: handleSell,
  });
};
