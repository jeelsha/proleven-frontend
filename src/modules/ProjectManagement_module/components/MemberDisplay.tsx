// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';

// ** type **
import { Cards, IToggleDropDown } from '../types';

// ** style **
import ToolTip from 'components/Tooltip';
import { StageNameConstant } from '../enum';
import '../style/index.css';

// ** Constants ***
import { ROLES } from 'constants/roleAndPermission.constant';

// ** Utils ***
import { t } from 'i18next';
import _ from 'lodash';

const MemberDisplay = (props: {
  initialBoardData: Cards;
  memberModal: IToggleDropDown;
  isViewable?: boolean;
}) => {
  const { initialBoardData, memberModal, isViewable } = props;

  return (
    <div>
      <span className="block w-full text-sm leading-4 text-grayText mb-2.5">
        {t('ProjectManagement.CustomCardModal.Button.member')}
      </span>
      <div className="member-wrapper flex items-center gap-1">
        {!_.isEmpty(initialBoardData?.card_members) && (
          <div className="flex flex-wrap gap-1">
            {!_.isEmpty(initialBoardData?.card_members) &&
              initialBoardData?.card_members
                ?.filter((members) => members.member?.role?.name !== ROLES.Admin)
                ?.map((memberData, index) => {
                  return (
                    <div
                      key={`memberData_${index + 1}`}
                      className="member-img-div group"
                    >
                      <ToolTip
                        position="right"
                        className="bg-primary before:!border-r-[#0B4565]"
                        text={`${memberData?.member?.first_name} ${memberData?.member?.last_name}`}
                      />
                      <Image
                        imgClassName="w-full h-full rounded-full object-cover"
                        width={40}
                        height={40}
                        alt="memberImage"
                        src={
                          memberData?.member?.profile_image ??
                          '/images/default-avatar.jpg'
                        }
                        serverPath
                      />
                    </div>
                  );
                })}
          </div>
        )}
        {!isViewable ? (
          <Button
            className="!p-2 w-9 h-9 !rounded-full"
            variants="whiteBordered"
            onClickHandler={() => memberModal.toggleDropdown()}
            disabled={
              initialBoardData.stage?.name === StageNameConstant.CoursesStandby
            }
          >
            <Image iconName="plusIcon" />
          </Button>
        ) : (
          _.isEmpty(initialBoardData?.card_members) && '-'
        )}
      </div>
    </div>
  );
};

export default MemberDisplay;
