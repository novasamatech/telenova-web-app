import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { MainButton } from '@/common/telegram/MainButton';
import { Icon, TitleText } from '@/components';

const Page = () => {
  const navigate = useNavigate();

  return (
    <>
      <MainButton onClick={() => navigate($path('/dashboard'), { replace: true })} />
      <div className="flex h-[95vh] flex-col items-center justify-center">
        <Icon name="Success" size={250} />
        <TitleText className="m-3">Password changed successfully!</TitleText>
      </div>
    </>
  );
};

export default Page;
