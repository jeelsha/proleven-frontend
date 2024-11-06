// ** imports **
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'utils';

// ** components **
import NameBadge from 'components/Badge/NameBadge';
import Button from 'components/Button/Button';
import Image from 'components/Image';
import InfiniteScroll from 'components/InfiniteScroll/infiniteScroll';
import { Modal } from 'components/Modal/Modal';
import NoDataFound from 'components/NoDataFound';
import SearchComponent from 'components/Table/search';
import { useModal } from 'hooks/useModal';
import MisMatchViewModal from 'modules/Courses/components/AttendeeExamResult/MisMatchViewModal';

// ** hooks **
import { useQueryGetFunction } from 'hooks/useQuery';

// ** types **
import { TabDetailProps } from 'modules/Courses/types/survey';
import { ModalProps } from 'types/common';

const MisMatchRecords = ({
  modal,
  onSubmit,
  courseSlug,
}: {
  modal: ModalProps;
  onSubmit: (data: string) => void;
  courseSlug: string | undefined;
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([] as TabDetailProps[]);
  const [search, setSearch] = useState('');
  const misMatchViewModal = useModal();
  const debouncedSearch = useDebounce(search, 1000);
  const { response, isLoading } = useQueryGetFunction(`/exam/get-mismatched`, {
    page,
    search: debouncedSearch,
    option: { course_slug: courseSlug },
  });
  const [selectedRecord, setSelectedRecord] = useState('');
  const [viewRecord, setViewRecord] = useState('');

  useEffect(() => {
    if (response?.data && page === 1) {
      const newData = response?.data?.data;
      setRecords(newData);
    }
  }, [response]);

  useEffect(() => {
    if (response?.data && page > 1) {
      const newData = response?.data?.data;
      setRecords((prevCourse) => [...prevCourse, ...newData]);
    }
  }, [page, response]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const courseCallBack = useCallback(async () => {
    if (page < response?.data?.lastPage) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [page, response?.data?.lastPage]);

  const handleRadioChange = (record: string) => {
    setSelectedRecord(record);
  };

  const handleCardClick = (record: string) => {
    if (selectedRecord === record) {
      setSelectedRecord('');
    } else {
      setSelectedRecord(record);
    }
  };
  const handleSubmit = async () => {
    onSubmit(selectedRecord);
  };
  const renderFilter = (filterData: TabDetailProps[], isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="flex justify-center">
          <Image loaderType="Spin" />
        </div>
      );
    }
    if (filterData && filterData.length > 0) {
      return filterData.map((data) => (
        <div
          className="filter-card-container"
          key={data.id}
          onClick={() => handleCardClick(data.id)}
        >
          <div className="flex items-center gap-2 w-full">
            <NameBadge FirstName={data?.first_name} LastName={data?.last_name} />
            <div className="flex-[1_0_0%] flex text-sm leading-4 text-navText items-center">
              <div className="max-w-[calc(100%_-_32px)] w-full h-fit">
                {data?.first_name}&nbsp;
                {data?.last_name}
              </div>
              <Button
                className="w-8 h-8 flex items-center justify-center border border-solid border-primary bg-primary text-white hover:bg-primary/10 hover:text-primary rounded-full p-1.5 transition-all duration-300"
                onClickHandler={() => {
                  handleRadioChange(data.id);
                  setViewRecord(data.slug);
                }}
              >
                <Button onClickHandler={() => misMatchViewModal.openModal()}>
                  <Image iconClassName="w-full h-full" iconName="arrowRight" />
                </Button>
              </Button>
            </div>
          </div>
          <input
            hidden
            type="radio"
            checked={selectedRecord === data.id}
            onChange={() => handleRadioChange(data.id)}
          />
        </div>
      ));
    }
    return (
      <NoDataFound
        message={t('Table.noDataFound')}
        className="  col-span-2 1400:col-span-3"
      />
    );
  };
  return (
    <Modal
      width="!max-w-[1000px] 1400:!max-w-[1200px]"
      headerTitle={t('attendee.mismatchTitle')}
      modal={modal}
    >
      <>
        <div>
          <SearchComponent
            onSearch={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e?.target?.value);
            }}
            value={search}
            placeholder={t('Table.tableSearchPlaceholder')}
            onClear={() => {
              setSearch('');
            }}
            parentClass="max-w-[450px]"
          />
          <p className="text-sm leading-4 text-dark/50 font-medium w-full mt-5 mb-2.5">
            {t('attendees.mismatchRecordsText')}
          </p>
          <InfiniteScroll
            callBack={courseCallBack}
            hasMoreData={records?.length < response?.data?.count}
            className="max-h-[250px] min-h-[150px]"
          >
            <div className="grid grid-cols-2 1400:grid-cols-3 gap-4 mt-0 ">
              {renderFilter(records, isLoading)}
            </div>
          </InfiniteScroll>
          <div className="flex justify-end">
            <Button
              variants="primary"
              className="mt-3"
              onClickHandler={handleSubmit}
            >
              {t('Button.submit')}
            </Button>
          </div>
        </div>
        {misMatchViewModal?.isOpen && (
          <MisMatchViewModal modal={misMatchViewModal} viewSlug={viewRecord} />
        )}
      </>
    </Modal>
  );
};

export default MisMatchRecords;
