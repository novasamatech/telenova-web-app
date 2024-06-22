import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useMainButton } from '@/common/telegram/useMainButton';
import { Icon } from '@/components';
import { TitleText } from '@/components/Typography';

export default function PasswordConfirmationPage() {
  const navigate = useNavigate();
  const { mainButton, addMainButton, hideMainButton } = useMainButton();

  useEffect(() => {
    const callback = () => {
      navigate($path('/dashboard'), { replace: true });
    };
    mainButton.enable();
    addMainButton(callback);

    return () => {
      hideMainButton();
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-[95vh]">
      <Icon name="Success" size={250} />
      <TitleText className="m-3">Password changed sussessfully!</TitleText>
    </div>
  );
}
