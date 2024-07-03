import CryptoJS from 'crypto-js';

import { type TransferAsset } from '../types';

type WidgetParams = {
  root: HTMLElement;
  widgetId: string;
  returnPage: string;
  secret: string;
  selectedAsset: Partial<TransferAsset | null>;
  handleStatus: (data: { status: 'paid' | 'new' }) => void;
  handleSell: (data: { address: string; amount: string }) => void;
};

export const runMercuryoWidget = ({
  root,
  secret,
  widgetId,
  returnPage,
  selectedAsset,
  handleStatus,
  handleSell,
}: WidgetParams) => {
  if (!selectedAsset || !selectedAsset.address) return;

  const signature = CryptoJS.SHA512(selectedAsset.address + secret).toString();
  const returnUrl = new URL(returnPage, window.location.origin).toString();

  window.mercuryoWidget.run({
    widgetId,
    returnUrl,
    signature,
    host: root,
    fixCurrency: true,
    type: selectedAsset.operationType,
    refundAddress: selectedAsset.address,
    address: selectedAsset.address,
    currency: selectedAsset.asset?.symbol,
    onStatusChange: handleStatus,
    onSellTransferEnabled: handleSell,
  });
};
