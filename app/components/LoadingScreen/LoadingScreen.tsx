import { Icon } from '../Icon/Icon';
import { BodyText } from '../Typography';

export const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[93svh]">
      <Icon name="Loader" size={130} className="animate-pulse m-auto pl-5" />
      <BodyText className="text-text-on-button-disabled mb-2">by</BodyText>
      <Icon name="Novasama" size={110} className="ml-[10px]" />
    </div>
  );
};
