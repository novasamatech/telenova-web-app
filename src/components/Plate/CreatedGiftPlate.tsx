import { Icon, Plate, TitleText } from '@/components';
import { Link } from 'react-router-dom';
import { Paths } from '@/common/routing';
import secureLocalStorage from 'react-secure-storage';
import { GIFT_STORE } from '@/common/utils/constants';
import { getStoreName } from '@/common/wallet';

const CreatedGiftPlate = () => {
  const isGiftsInfo = secureLocalStorage.getItem(getStoreName(GIFT_STORE));
  if (!isGiftsInfo) return;

  return (
    <Plate className="w-full h-[90px] rounded-3xl mt-4 active:bg-bg-item-pressed">
      <Link to={Paths.GIFTS} className="w-full grid grid-cols-[auto,1fr,auto] items-center gap-4">
        <Icon name="Present" className="w-[60px] h-[60px]" />
        <div className="grid">
          <TitleText align="left">Created Gifts</TitleText>
          {/* {helpText && <HelpText className="text-text-hint">{helpText}</HelpText>} */}
        </div>
        <Icon name="ArrowBold" className="w-10 h-10 self-center" />
      </Link>
    </Plate>
  );
};

export default CreatedGiftPlate;
