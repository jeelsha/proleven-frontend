import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import FilterCourse from './FilterCourse';
import { IGetProjectCardArgs, ICardType, IMemberType, IDateType } from '../types';

const FilterCoursePipeline = (props: {
  getProjectCards: ({
    courseType,
    dateFilter,
    labelsFilter,
    membersFilter,
    stageId,
  }: IGetProjectCardArgs) => Promise<void>;
  cardType: ICardType;
  setCardType: React.Dispatch<React.SetStateAction<ICardType>>;
  selectedValue: IMemberType;
  setSelectedValue: React.Dispatch<React.SetStateAction<IMemberType>>;
  cardAssign: string;
  setCardAssign: React.Dispatch<React.SetStateAction<string>>;
  dateFilter: IDateType;
  setDateFilter: React.Dispatch<React.SetStateAction<IDateType>>;
}) => {
  const { t } = useTranslation();

  const {
    getProjectCards,
    cardType,
    setCardType,
    selectedValue,
    setSelectedValue,
    cardAssign,
    setCardAssign,
    dateFilter,
    setDateFilter,
  } = props;

  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);

  const [filterModal, setFilterModal] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setFilterModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative group" ref={modalRef}>
      <Button
        variants="primary"
        className="flex gap-x-2"
        onClickHandler={() => {
          setFilterModal(!filterModal);
        }}
      >
        <span className="w-5 h-5 inline-block">
          <Image iconName="filterIcon2" iconClassName="w-full h-full" />
        </span>
        {t('ProjectManagement.Header.filter')}
      </Button>

      {filterModal && (
        <div
          className={`${
            filterModal && 'z-1'
          } absolute top-full right-0 before:absolute transition-all duration-300`}
        >
          <div className="bg-white rounded-xl shadow-xl w-[340px]">
            <div className="px-5 py-3.5 border-b border-solid border-offWhite">
              <h5 className="text-base leading-5 font-semibold text-dark">
                {t('ProjectManagement.Header.filter')}
              </h5>
            </div>
            <div className="px-5 py-3">
              <div className="flex flex-col gap-y-3 mt-4">
                <FilterCourse
                  setCardType={setCardType}
                  cardType={cardType}
                  setFilterModal={setFilterModal}
                  getProjectCards={getProjectCards}
                  setCardAssign={setCardAssign}
                  cardAssign={cardAssign}
                  setSelectedValue={setSelectedValue}
                  selectedValue={selectedValue}
                  setDateFilter={setDateFilter}
                  dateFilter={dateFilter}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterCoursePipeline;
