import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SHA512 } from 'crypto-js';

import { useTelegram } from '@/common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { Plate } from '@/components';

export default function BuyPage() {
  const { BackButton } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    BackButton?.show();
    const callback = () => navigate(Paths.DASHBOARD);
    BackButton?.onClick(callback);
    handle();

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  const handle = () => {
    const signature = SHA512('1514j2gUQjmvXwdYM8t6XQp4MGZEqNKQXzG4qTmCwuuuUe2H' + 'secret').toString();

    window.mercuryoWidget.run({
      widgetId: 'debffff3-5bdb-46f4-ab0d-efb2245d7494',
      host: document.getElementById('mercuryo-widget'),
      returnUrl: Paths.DASHBOARD,
      address: '1514j2gUQjmvXwdYM8t6XQp4MGZEqNKQXzG4qTmCwuuuUe2H',
      signature,
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Plate className="w-full p-0">
        <div id="mercuryo-widget"></div>
      </Plate>
    </div>
  );
}
