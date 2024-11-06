import Button from 'components/Button/Button';
import Image from 'components/Image';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Cards, IToggleDropDown } from '../types';

const LabelDisplay = (props: {
  initialBoardData: Cards;
  labelModal: IToggleDropDown;
  isViewable?: boolean;
}) => {
  const { t } = useTranslation();

  const { initialBoardData, labelModal, isViewable } = props;
  return (
    <div className="">
      <span className="block w-full text-sm leading-4 text-grayText mb-2.5">
        {t('ProjectManagement.CustomCardModal.Button.label')}
      </span>
      <div className="flex items-center flex-wrap gap-2">
        {!_.isEmpty(initialBoardData?.card_labels) &&
          initialBoardData?.card_labels?.map((data, index) => {
            return (
              <Button
                key={`card_${index + 1}`}
                small
                className="button"
                customStyle={{
                  backgroundColor: data?.label?.color ?? '#0B4565',
                  color: '#FFFFFF',
                }}
              >
                {data?.label?.title}
              </Button>
            );
          })}

        {!isViewable ? (
          <Button
            className="w-9 h-9 !p-2 "
            variants="whiteBordered"
            onClickHandler={() => {
              labelModal.toggleDropdown();
            }}
          >
            <Image iconName="plusIcon" iconClassName="w-full h-full" />
          </Button>
        ) : (
          _.isEmpty(initialBoardData?.card_labels) && '-'
        )}
      </div>
    </div>
  );
};

export default LabelDisplay;
