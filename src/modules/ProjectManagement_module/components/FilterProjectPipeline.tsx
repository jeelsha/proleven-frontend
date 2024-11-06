import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import _ from 'lodash';
import { hasValues } from 'utils';
import FilterProject from './FilterProject';

export type IFilterApply = {
  cardPriority: string[];
  dateFilter: {
    start_date: string;
    end_date: string;
  };
  selectedMembers: (string | number)[];
};

const FilterProjectPipeline = (props: {
  getProjectCards: (
    cardPriority?: string[],
    dateFilter?: {
      start_date: string;
      end_date: string;
    }
  ) => Promise<void>;
  setCardAssign: Dispatch<SetStateAction<string | undefined>>;
  cardAssign: string | undefined;
}) => {
  const { t } = useTranslation();

  const { getProjectCards, setCardAssign, cardAssign } = props;

  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);

  const [filterModal, setFilterModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState<{
    selectedMember?: (string | number)[];
    selectedLabels?: (string | number)[];
  }>({
    selectedLabels: [],
    selectedMember: [],
  });

  const [cardPriority, setCardPriority] = useState({
    high: '',
    medium: '',
    low: '',
  });
  const [dateFilter, setDateFilter] = useState({
    start_date: '',
    end_date: '',
  });

  const [filterApply, setFilterApply] = useState<IFilterApply>({
    cardPriority: [],
    dateFilter: {
      start_date: '',
      end_date: '',
    },
    selectedMembers: [cardAssign ?? ''],
  });
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
        {!_.isEmpty(filterApply) && hasValues(filterApply) && (
          <span className="filter-badge" />
        )}
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
                <FilterProject
                  setFilterApply={setFilterApply}
                  setCardPriority={setCardPriority}
                  getProjectCards={getProjectCards}
                  priority={cardPriority}
                  setCardAssign={setCardAssign}
                  cardAssign={cardAssign}
                  setSelectedValue={setSelectedValue}
                  selectedValue={selectedValue}
                  setFilterModal={setFilterModal}
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

export default FilterProjectPipeline;
