import CryptoJS from 'crypto-js';

import { type TransferAsset } from '../types';

type Params = {
  root: HTMLElement;
  widgetId: string;
  returnPage: string;
  secret: string;
  selectedAsset: Partial<TransferAsset | null>;
  handleStatus: (data: any) => void;
  handleSell: (data: any) => void;
};

export const handleWidget = ({
  root,
  secret,
  widgetId,
  returnPage,
  selectedAsset,
  handleStatus,
  handleSell,
}: Params) => {
  if (!selectedAsset || !selectedAsset.address) {
    return;
  }

  const signature = CryptoJS.SHA512(selectedAsset.address + secret).toString();
  const returnUrl = new URL(returnPage, window.location.origin).toString();

  window.mercuryoWidget.run({
    widgetId,
    host: root,
    returnUrl: returnUrl,
    type: selectedAsset.operationType,
    signature,
    fixCurrency: true,
    onStatusChange: handleStatus,
    onSellTransferEnabled: handleSell,
    refundAddress: selectedAsset.address,
    address: selectedAsset.address,
    currency: selectedAsset.asset?.symbol,
  });
};
