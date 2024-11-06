import CustomCard from 'components/Card';
import Image from 'components/Image';
import InfiniteScroll from 'components/InfiniteScroll/infiniteScroll';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import { format } from 'date-fns';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { SystemLogsProps } from '../types';

const ViewLogs = () => {
  const url = new URL(window.location.href);
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('quoteProduct.logTitle'));

  const [page, setPage] = useState(1);
  const [systemLogs, setSystemLogs] = useState([] as SystemLogsProps[]);
  const { language } = useSelector(useLanguage);
  const { slug } = useParams();
  const { response, isLoading } = useQueryGetFunction('/quotes/product_logs', {
    page,
    sort: '-created_at',
    option: {
      productId: slug,
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
    if (response?.data?.data && page === 1) {
      const newData = response?.data?.data;
      setSystemLogs(newData);
    }
  }, [response]);

  useEffect(() => {
    if (response?.data?.data && page > 1) {
      const newData = response?.data?.data;
      setSystemLogs((prevLogs) => [...prevLogs, ...newData]);
    }
  }, [page, response]);
  return (
    <div>
      <PageHeader
        small
        text={t('quoteProduct.logTitle')}
        url={
          url.searchParams.has('isProduct')
            ? `/quote-products${url.search}`
            : '/quote-products'
        }
      />
      <CustomCard minimal>
        <InfiniteScroll
          showLoading
          callBack={logCallBack}
          hasMoreData={systemLogs?.length < response?.data?.count}
          className="max-h-[650px] min-h-[230px] mb-8"
        >
          <div className="flex flex-wrap">
            <div className="w-full">
              {isLoading && (
                <div className="flex justify-center">
                  <Image loaderType="Spin" />
                </div>
              )}
              {!isLoading && systemLogs.length === 0 && (
                <NoDataFound
                  message={t('Table.noDataFound')}
                  className="justify-between"
                />
              )}
              {!isLoading &&
                systemLogs &&
                systemLogs?.length > 0 &&
                systemLogs?.map((data, index: number) => (
                  <div
                    className="bg-white flex tab-content-item p-5 cursor-pointer border-b border-solid border-gray-200 last:border-b-0 "
                    key={`log_${index + 1}`}
                  >
                    <div className="icons w-11 h-11 rounded-full text-white flex items-center justify-center bg-[#00BD9D]">
                      <Image iconName="navSystemLogsIcon" />
                    </div>
                    <div className="flex items-center">
                      <div className=" ps-2.5">
                        <label className="block text-sm leading-[1.3] mt-1 cursor-pointer">
                          {t('quoteProduct.status.logs.description', {
                            old_status: data?.old_status,
                            new_status: data?.new_status,
                            user: data?.product_users?.full_name,
                          })}
                          {data.reason && (
                            <>
                              {t('quoteProduct.status.logs.descriptionProduct')}
                              <strong>
                                {t('quoteProduct.status.logs.descriptionReason', {
                                  reason: data.reason,
                                })}
                              </strong>
                            </>
                          )}
                        </label>
                        <p className="text-grayText text-sm mt-1">
                          {format(
                            new Date(data.created_at),
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

export default ViewLogs;
