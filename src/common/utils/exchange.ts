import CryptoJS from 'crypto-js';
import { Paths } from '../routing';
import { TrasferAsset } from '../types';

const WIDGET_ID = 'debffff3-5bdb-46f4-ab0d-efb2245d7494';

export const handleWidget = (
  selectedAsset: Partial<TrasferAsset | null>,
  handleStatus: (data: any) => void,
  handleSell: (data: any) => void,
) => {
  if (!selectedAsset || !selectedAsset.address) return;
  const signature = CryptoJS.SHA512(selectedAsset.address + process.env.NEXT_PUBLIC_WIDGET_SECRET).toString();

  window.mercuryoWidget.run({
    widgetId: WIDGET_ID,
    host: document.getElementById('mercuryo-widget'),
    returnUrl: `${process.env.NEXT_PUBLIC_WEB_APP_URL}${Paths.DASHBOARD}`,
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
