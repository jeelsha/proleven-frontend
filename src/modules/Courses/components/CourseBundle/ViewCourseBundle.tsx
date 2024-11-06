import Button from 'components/Button/Button';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import { ITableHeaderProps } from 'components/Table/types';
import { REACT_APP_DATE_FORMAT } from 'config';
import { format } from 'date-fns';
import { useAxiosGet } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useTitle } from 'hooks/useTitle';
import { CourseBundleStatus, CourseStatus } from 'modules/Courses/Constants';
import { SavedCourseBundle } from 'modules/Courses/types/TemplateBundle';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import CourseSplitModal from '../CourseSplitModal';

const ExpandableTableRow = React.lazy(
  () => import('modules/Courses/components/CourseBundle/ExpandableTableRow')
);

type PropType = {
  setCurrentTabTitle?: React.Dispatch<React.SetStateAction<string>>;
  status?: string;
  activeTab?: number;
  setShowSideComponent?: React.Dispatch<React.SetStateAction<boolean>>;
  setBundleTitle?: React.Dispatch<React.SetStateAction<string | undefined>>;
};
const ViewCourseBundle = ({
  setCurrentTabTitle,
  status,
  activeTab,
  setBundleTitle,
  setShowSideComponent,
}: PropType) => {
  const updateTitle = useTitle();
  const { t } = useTranslation();
  const currentURL = new URL(window.location.href);
  const bundleSlug = currentURL.searchParams.get('slug');
  const courseModal = useModal();
  const [getBundleById, { isLoading: isBundleLoading }] = useAxiosGet();
  const [optionalCount, setOptionalCount] = useState(0);
  const { state } = useLocation();
  const [bundleData, setBundleData] = useState<SavedCourseBundle>();
  const columnData: ITableHeaderProps[] = [
    {
      header: t('CoursesManagement.columnHeader.No'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Templates'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Actions'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
  ];
  const tableLazyCount = [...Array(5).keys()];

  const fetchBundleData = async () => {
    const { data } = await getBundleById('/course/bundle/used', {
      params: { bundle_slug: bundleSlug },
    });
    if (data?.data?.[0]?.status === CourseBundleStatus.draft) {
      setShowSideComponent?.(true);
      setBundleTitle?.(data.data[0].title);
    }
    setBundleData?.(data?.data?.[0]);
    setOptionalCount(data?.is_optional_available);
    setCurrentTabTitle?.(data?.data?.[0]?.title);
  };

  useEffect(() => {
    if (bundleSlug) fetchBundleData();
  }, [bundleSlug]);

  updateTitle(t('bundleDetail'));

  return (
    <>
      {(state?.fromTrainerBundleRequest || state?.url) && (
        <PageHeader
          text="Bundle Details"
          small
          url={state?.url ?? '/courses/invitation'}
          passState={{ ...state }}
        />
      )}
      <div className="main-table bg-white rounded-xl p-4">
        <div className="flex  mb-5 -mx-4">
          <div className="w-1/2 1600:w-4/12 px-4">
            {isBundleLoading ? (
              <div className="lazy h-[250px]" />
            ) : (
              <div className="h-[250px]">
                <Image
                  src="/images/BundleImage.svg"
                  imgClassName="w-full h-full object-cover rounded-lg"
                  width={250}
                  height={250}
                />
              </div>
            )}
          </div>
          <div className="w-1/2 1600:w-/12 px-4">
            <div className="flex flex-col gap-y-4">
              {isBundleLoading ? (
                <div className="lazy h-[100px]" />
              ) : (
                <>
                  <h2 className="text-dark font-bold text-2xl">
                    {bundleData?.title}
                  </h2>
                  {bundleData?.start_date ? (
                    <div className="flex gap-x-2 items-center">
                      <Image iconClassName="w-5 h-5" iconName="calendarEditIcon" />
                      <p className="text-base font-medium text-dark/50">
                        {bundleData?.start_date &&
                          format(
                            new Date(bundleData?.start_date),
                            REACT_APP_DATE_FORMAT as string
                          )}
                        -
                        {bundleData?.end_date &&
                          format(
                            new Date(bundleData?.end_date),
                            REACT_APP_DATE_FORMAT as string
                          )}
                      </p>
                    </div>
                  ) : (
                    ''
                  )}
                </>
              )}
              {bundleData && !bundleData?.start_date ? (
                <StatusLabel
                  text={t('CourseBundle.Incomplete')}
                  variants="cancelled"
                  className="course-warning"
                />
              ) : (
                ''
              )}
              {!isBundleLoading && status === CourseStatus.publish && (
                <div className="flex gap-x-2 items-center">
                  <Image iconClassName="w-5 h-5" iconName="userGroupIcon" />
                  <p className="text-base font-medium text-dark/50">
                    {bundleData?.total_participate}&nbsp;
                    {t('CourseBundle.ViewBundle.participateCount')}
                  </p>
                </div>
              )}
              {!isBundleLoading && status === CourseStatus.publish && (
                <div className="flex gap-x-2 items-center">
                  <Button
                    variants="primary"
                    disabled={optionalCount <= 0}
                    parentClass="h-fit"
                    className={`whitespace-nowrap gap-1 ${
                      optionalCount <= 0
                        ? 'disabled:opacity-50 pointer-events-none'
                        : ''
                    }`}
                    onClickHandler={() => {
                      courseModal?.openModal();
                    }}
                  >
                    <Image
                      iconName="plusSquareIcon"
                      iconClassName=" w-5 h-5"
                      width={24}
                      height={24}
                    />
                    {t('AssignOptionalTrainer')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="table-wrapper relative bg-[#FBFBFC] rounded-xl p-4 border border-borderColor/50">
          <div className={`overflow-auto max-w-full min-h-[calc(100dvh_-_355px)] `}>
            <table className="datatable-main w-full text-sm text-left rtl:text-right text-dark border border-borderColor/0 ">
              <thead>
                <tr>
                  {columnData.map((val, index) => (
                    <th
                      key={`header_${index + 1}`}
                      scope="col"
                      className={`group/tbl ${val.className}`}
                    >
                      <span className="flex items-center select-none group-first/tbl:justify-center group-last/tbl:justify-end">
                        {val.header}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isBundleLoading ? (
                  <>
                    {tableLazyCount.map((_, i) => {
                      return (
                        <tr key={`Key_${i + 1}`}>
                          {[1, 2, 3].map((_, j) => {
                            return (
                              <td key={`Key_${j + 1}`}>
                                <div className="relative w-full flex items-center">
                                  <div className="lazy w-full h-10 rounded-lg" />
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </>
                ) : (
                  ''
                )}

                {(bundleData?.courses ?? []).map((item, index) => (
                  <ExpandableTableRow
                    item={item}
                    index={index}
                    key={`Bundle_${index + 1}`}
                    status={status}
                    refetch={fetchBundleData}
                    bundleSlug={bundleSlug}
                    activeTab={activeTab}
                    bundleId={state?.bundle_id}
                    state={state}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {courseModal?.isOpen && (
        <CourseSplitModal
          courseModal={courseModal}
          bundleId={bundleData?.id}
          fetchBundleData={fetchBundleData}
        />
      )}
    </>
  );
};

export default ViewCourseBundle;
