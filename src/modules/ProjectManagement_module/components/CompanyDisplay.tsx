import { t } from 'i18next';
import _ from 'lodash';

// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';

// ** type **
import { Cards, IToggleDropDown } from '../types';

// ** style **
import ToolTip from 'components/Tooltip';
import '../style/index.css';

const CompanyDisplay = (props: {
  initialBoardData: Cards;
  companyModal: IToggleDropDown;
  isViewable?: boolean;
}) => {
  const { initialBoardData, companyModal, isViewable } = props;


  return (
    <>
      <span className="block w-full text-sm leading-4 text-grayText mb-2.5">
        {t('ProjectManagement.CustomCardModal.Button.company')}
      </span>
      <div className="member-wrapper flex items-center gap-1 w-full">
        {!_.isEmpty(initialBoardData?.card_Company) && (
          <div className="flex flex-wrap gap-y-2 -mx-2 w-full">
            {!_.isEmpty(initialBoardData?.card_Company) &&
              initialBoardData?.card_Company
                ?.map((companyData, index) => {
                  return (
                    <div
                      key={`companyData_${index + 1}`}
                      className="flex items-center gap-2 w-full 991:w-1/2 px-2 max-w-full"
                    >
                      <div className="member-img-div group">
                        <Image
                          imgClassName="w-full h-full rounded-full object-cover"
                          width={40}
                          height={40}
                          alt="memberImage"
                          src={
                            companyData?.company?.logo ?? '/images/default-avatar.jpg'
                          }
                          serverPath
                        />
                      </div>
                      <div className='flex-1 h-fit group relative max-w-[calc(100%_-_44px)]'>
                        <ToolTip
                          position="bottom"
                          className="bg-primary before:!border-b-[#0B4565]"
                          text={companyData?.company?.name}
                        />
                        <p className="block w-full truncate max-w-full">
                          {companyData?.company?.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
            <div className="flex items-center gap-2 w-full 991:w-1/2 px-2 max-w-full">
              {!isViewable ? (
                <Button
                  className="!p-2 w-9 h-9 !rounded-full"
                  variants="whiteBordered"
                  onClickHandler={() => companyModal.toggleDropdown()}
                >
                  <Image iconName="plusIcon" />
                </Button>
              ) : (
                _.isEmpty(initialBoardData?.card_Company) && '-'
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CompanyDisplay;
