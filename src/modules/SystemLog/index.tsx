// ** components ** //
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import InfiniteScroll from 'components/InfiniteScroll/infiniteScroll';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import FilterLog from './components/FilterLog';

// ** Hooks ***//
import { useQueryGetFunction } from 'hooks/useQuery';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

// ** types ** //
import { IconTypes } from 'components/Icon/types';
import { useTitle } from 'hooks/useTitle';
import { FilterApplyProps, SystemLogProps } from 'modules/SystemLog/types';

// ** Utils ***//
import { format, parseISO } from 'date-fns';
import _ from 'lodash';
import { hasValues } from 'utils';

export const SystemLog = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('systemLogTitle'));

  const [page, setPage] = useState(1);
  const [systemLogs, setSystemLogs] = useState<SystemLogProps[]>([]);
  const [filterApply, setFilterApply] = useState<FilterApplyProps>({
    modules: [],
    startDate: '',
    endDate: '',
    end_time: '',
    start_time: '',
  });
  const [filterModal, setFilterModal] = useState(false);
  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);
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

  const { language } = useSelector(useLanguage);
  const { modules, startDate, endDate } = filterApply;

  const { response, isLoading } = useQueryGetFunction('/system-logs', {
    page,
    sort: '-created_at',
    option: {
      ...(modules && modules?.length > 0 ? { modulesId: modules?.join(',') } : ''),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
  });
  useEffect(() => {
    setPage(1);
  }, [language]);

  const logCallBack = useCallback(async () => {
    if (page < response?.data?.lastPage) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [page, response?.data?.lastPage]);

  useEffect(() => {
    if (response?.data?.data) {
      if (page === 1) {
        setSystemLogs(response.data.data);
      } else {
        setSystemLogs((prevLogs) => [...prevLogs, ...response.data.data]);
      }
    }
  }, [response, page]);

  const getPermissionsStatus = (variant: string) => {
    switch (variant) {
      case 'Create':
        return 'bg-emerald-600';
      case 'Update':
        return 'bg-sky-600';
      case 'Delete':
        return 'bg-rose-600';
      default:
        return 'bg-gray-300 !text-gray-500';
    }
  };

  const getPermissionsStatusIcon = (variant: string) => {
    switch (variant) {
      case 'Create':
        return 'plusIcon';
      case 'Update':
        return 'refreshIcon';
      case 'Delete':
        return 'deleteIcon';
      default:
        return 'box3DIcon';
    }
  };
  if (isLoading && page === 1) {
    return (
      <>
        <PageHeader small text={t('systemLogTitle')} />
        <CustomCard minimal>
          <>
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex tab-content-item p-5">
                <div className="lazy w-11 h-11 rounded-full flex items-center justify-center mt-1" />
                <div className="flex items-center">
                  <div className="ps-2.5">
                    <p className="lazy w-[800px] mt-1 h-5" />
                    <p className="lazy block w-[800px] mt-1 h-5" />
                    <p className="lazy h-5 w-[800px] mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </>
        </CustomCard>
      </>
    );
  }
  return (
    <div>
      <PageHeader small text={t('systemLogTitle')}>
        <div className="flex flex-wrap justify-end gap-2">
          <div className="relative flex">
            <Button
              onClickHandler={() => {
                setFilterModal(!filterModal);
              }}
              variants="primary"
              className="gap-1 !flex !py-2.5 !px-3.5"
            >
              {!_.isEmpty(filterApply) && hasValues(filterApply) && (
                <span className="filter-badge" />
              )}

              <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
              {t('Calendar.filterButton')}
            </Button>
            {filterModal && (
              <div
                ref={modalRef}
                className={`${
                  filterModal && 'z-1'
                } absolute right-0 top-full before:absolute transition-all duration-300`}
              >
                <div className="bg-white rounded-xl shadow-xl w-[380px]">
                  <div className="px-5 py-3.5 border-b border-solid border-offWhite">
                    <h5 className="text-base leading-5 font-semibold text-dark">
                      {t('ProjectManagement.Header.filter')}
                    </h5>
                  </div>
                  <div className="px-5 py-3">
                    <div className="flex flex-col gap-y-3 mt-4">
                      <FilterLog
                        setFilterModal={setFilterModal}
                        setFilterApply={setFilterApply}
                        filterApply={filterApply}
                        t={t}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageHeader>
      <CustomCard minimal>
        <InfiniteScroll
          showLoading={isLoading}
          callBack={logCallBack}
          hasMoreData={
            !response?.data?.count || systemLogs.length < response?.data?.count
          }
          className="max-h-[650px] min-h-[230px] mb-8"
        >
          <div className="flex flex-wrap">
            <div className="w-full">
              {!isLoading && systemLogs.length === 0 && (
                <NoDataFound
                  message={t('Table.noDataFound')}
                  className="justify-between"
                />
              )}

              {systemLogs.length > 0 &&
                systemLogs.map((data, index: number) => (
                  <div
                    className="bg-white flex tab-content-item p-5 cursor-pointer border-b border-solid border-gray-200 last:border-b-0 "
                    key={`log_${index + 1}`}
                  >
                    <div
                      className={`icons w-11 h-11 rounded-full text-white flex items-center justify-center bg-[#00BD9D] ${getPermissionsStatus(
                        data.permission_type
                      )}`}
                    >
                      <Image
                        iconClassName="w-6 h-6"
                        iconName={
                          getPermissionsStatusIcon(data.permission_type) as IconTypes
                        }
                      />
                    </div>
                    <div className="flex items-center">
                      <div className="ps-2.5">
                        <p className="text-base font-semibold text-black cursor-pointer">
                          {data.title}
                        </p>
                        <label className="block text-sm leading-[1.3] mt-1 cursor-pointer">
                          {data.description}
                        </label>
                        <p className="text-grayText text-sm mt-1">
                          {format(
                            parseISO(data.created_at),
                            'do MMMM, yyyy hh:mm:ss'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </InfiniteScroll>
      </CustomCard>
    </div>
  );
};
