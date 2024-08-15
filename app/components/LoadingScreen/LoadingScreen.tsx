import { Icon } from '../Icon/Icon';
import { BodyText } from '../Typography';

export const LoadingScreen = () => {
  return (
    <div className="flex h-[93svh] flex-col items-center justify-center">
      <Icon name="Loader" size={130} className="m-auto animate-pulse pl-5" />
      <BodyText className="mb-2 text-text-on-button-disabled">by</BodyText>
      <Icon name="Novasama" size={110} className="ml-[10px]" />
    </div>
  );
};
