import { type FC, useEffect } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useGlobalContext } from '@/common/providers';
import { getWallet } from '@/common/wallet';

const Page: FC = () => {
  const { showBoundary } = useErrorBoundary();
  const { setPublicKey } = useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    getWallet()
      .then(wallet => {
        if (!wallet) {
          return navigate($path('/onboarding'), { replace: true });
        }
        setPublicKey(wallet?.publicKey);
        navigate($path('/dashboard'), { replace: true });
      })
      .catch(showBoundary);
  }, []);

  return null;
};

export default Page;
