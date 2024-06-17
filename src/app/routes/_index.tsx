import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useGlobalContext } from '@/common/providers';
import { getWallet } from '@/common/wallet';

const Page: FC = () => {
  const { setPublicKey } = useGlobalContext();
  const wallet = getWallet();
  const navigate = useNavigate();

  useEffect(() => {
    setPublicKey(wallet?.publicKey);
    if (wallet) {
      navigate($path('/dashboard'), { replace: true });
    } else {
      navigate($path('/onboarding'), { replace: true });
    }
  }, []);

  return null;
};

export default Page;
