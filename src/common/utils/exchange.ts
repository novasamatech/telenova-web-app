import CryptoJS from 'crypto-js';

import { type TrasferAsset } from '../types';

const WIDGET_ID = 'debffff3-5bdb-46f4-ab0d-efb2245d7494';

type Params = {
  root: HTMLElement;
  returnPage: string;
  secret: string;
  selectedAsset: Partial<TrasferAsset | null>;
  handleStatus: (data: any) => void;
  handleSell: (data: any) => void;
};

export const handleWidget = ({ root, secret, returnPage, selectedAsset, handleStatus, handleSell }: Params) => {
  if (!selectedAsset || !selectedAsset.address) {
    return;
  }

  const signature = CryptoJS.SHA512(selectedAsset.address + secret).toString();
  const returnUrl = new URL(returnPage, window.location.origin).toString();

  window.mercuryoWidget.run({
    widgetId: WIDGET_ID,
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
