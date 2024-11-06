// ** Components **
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import CompanyCard from 'components/CompanyCard';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import Pagination from 'components/Pagination/Pagination';
import ToolTip from 'components/Tooltip';

// ** Hooks **
import { useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// ** Constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

// ** Helpers **
import { REACT_APP_API_BASE_URL, REACT_APP_DATE_FORMAT } from 'config';
import { format } from 'date-fns';
import _ from 'lodash';

// ** Types **
import { ApiResponse, CompanyCourseResponse } from 'modules/Courses/types';

// ** Slices **
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

// ** Styles
import DownloadFileModal from 'components/DownloadPdfModel/DownloadFile';
import { useModal } from 'hooks/useModal';
import '../../../ProjectManagement_module/style/index.css';

const CourseCompanyList = () => {
  const [downloadAttendanceSheetOfCourse] = useAxiosPost();
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const downloadModal = useModal();

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // ** States
  const [company, setCompany] = useState<ApiResponse>();
  const [course, setCourse] = useState<CompanyCourseResponse>();
  const [limit, setLimit] = useState<number>(10);
  const [companyIds, setCompanyIds] = useState<number[]>([]);
  const url: URL = new URL(window.location.href);

  // ** Selectors
  const { currentPage } = useSelector(currentPageSelector);

  // ** APIs
  const [postMarkAsSigned, { isLoading }] = useAxiosPut();
  const {
    response,
    refetch,
    isLoading: isCourseCompanyLoading,
  } = useQueryGetFunction('/course/companies', {
    option: {
      course_slug: state?.publish_course_slug ?? params?.slug,
      limit,
      page: currentPage,
    },
  });
  const handleOnChangeCheckBox = (
    checkData: React.ChangeEvent<HTMLInputElement>,
    trainerIds: number[]
  ) => {
    const newData = Number(checkData.target.value);
    const isChecked = checkData.target.checked;
    const cloneFormValue = [...trainerIds];
    if (isChecked) {
      cloneFormValue.push(newData);
    } else {
      cloneFormValue.splice(cloneFormValue.indexOf(newData), 1);
    }

    setCompanyIds(cloneFormValue);
  };

  const handleMarkAsAllSigned = async () => {
    const { error } = await postMarkAsSigned(
      `/course/attendance-sheet/company-wise/sign/${course?.slug}`,
      { companies: companyIds }
    );
    if (!error) {
      setCompanyIds([]);
      refetch();
    }
  };

  const DownloadPdf = async (language: string) => {
    const config = {
      headers: {
        'accept-language': language,
      },
    };

    const response = await downloadAttendanceSheetOfCourse(
      `/course/companies/participate/attendance-sheet/download/${
        state?.publish_course_slug ?? params?.slug
      }`,
      { language },
      { ...config, params: { userTimezone } }
    );
    if (response.data) {
      const extractedPath = response.data;
      window.open(`${REACT_APP_API_BASE_URL}/${extractedPath}`, '_blank');
      downloadModal?.closeModal();
    }
  };

  // ** useEffects
  useEffect(() => {
    if (response?.data) {
      setCompany(response?.data?.company);
      setCourse(response.data?.course);
    }
  }, [response?.data]);
  return (
    <>
      <PageHeader
        text={t('companyCard.participateCompany')}
        small
        url={
          state?.url
            ? state?.url
            : state?.isCourseBundle
            ? `/course-bundle/view?slug=${state?.bundleSlug}`
            : url.searchParams.has('isCourse')
            ? `/course-management${url?.search ?? ''}`
            : PRIVATE_NAVIGATION.coursesManagement.courseManagement.path
        }
        passState={{ ...state }}
      >
        <div className="flex justify-end gap-2 flex-wrap">
          <Button
            className="w-fit"
            variants="secondary"
            onClickHandler={() => {
              navigate(PRIVATE_NAVIGATION.unknownAttendeeListing.list.path, {
                state: {
                  ...state,
                  params: params?.slug,
                },
              });
            }}
          >
            {t('unknownCompanies')}
          </Button>
          {!_.isEmpty(company?.data) && !_.isEmpty(companyIds) ? (
            <Button
              className="w-fit opacity-60"
              variants="greenLowOpacity"
              onClickHandler={() => {
                if (companyIds?.length > 0) {
                  handleMarkAsAllSigned();
                }
              }}
              isLoading={isLoading}
              disabled={isLoading}
            >
              {t('companyCard.markSigned')}
            </Button>
          ) : (
            ''
          )}
          <Button
            className=""
            variants="whiteBordered"
            onClickHandler={() => {
              downloadModal?.openModal();
            }}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="downloadFile" iconClassName="w-full h-full" />
            </span>
            {t('AttendanceSheet')}
          </Button>
          <Button
            className=""
            variants="primary"
            onClickHandler={() => {
              navigate(`/courses/attendance/${params.slug}`, {
                state: {
                  urlToNavigate: `/courses/company-list/${params.slug}`,
                  ...state,
                },
              });
            }}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="eyeIcon" iconClassName="w-full h-full" />
            </span>
            {t('AttendanceSheet')}
          </Button>
        </div>
      </PageHeader>
      <CustomCard minimal>
        <>
          {isCourseCompanyLoading ? (
            <div className="flex items-center">
              <div className="h-32 w-[220px] rounded-md lazy bg-gray-300" />

              <div className="ps-6 w-1/2">
                <div className="flex flex-col gap-y-3.5">
                  <div className="flex flex-wrap">
                    <p className="lazy w-1/2 h-5 bg-gray-300 rounded-md" />
                  </div>
                  <p className="w-1/2 h-7 lazy bg-gray-300 rounded-md" />
                  <p className="lazy w-1/2 h-5 bg-gray-300 rounded-md" />
                </div>
              </div>
            </div>
          ) : (
            ''
          )}

          {!isCourseCompanyLoading && course && (
            <div className="flex items-center">
              {course?.image && (
                <div className="h-32 w-[220px] rounded-md">
                  <Image
                    src={course?.image}
                    imgClassName="w-full h-full rounded-md"
                    serverPath
                  />
                </div>
              )}
              <div className="ps-6 max-w-[calc(100%_-_220px)] pr-2">
                <div className="flex flex-col gap-y-3.5">
                  <div className="flex flex-wrap">
                    <Button className="text-sm leading-4 text-secondary last:after:hidden after:mx-1.5 after:content-['•']">
                      {course?.category_name}
                    </Button>
                    <Button className="text-sm leading-4 text-secondary last:after:hidden after:mx-1.5 after:content-['•']">
                      {course?.sub_category_name}
                    </Button>
                  </div>
                  <h4 className="text-lg font-semibold text-dark leading-6">
                    {course?.title}
                  </h4>
                  <div className="flex flex-wrap">
                    <p className="text-sm leading-4 text-dark/50 font-medium flex items-center w-full mb-2">
                      {t('companyCard.trainerDuration')}
                    </p>
                    <p className="text-sm leading-4 text-dark flex items-center after:mx-2.5 after:opacity-50 after:block after:content-['|']">
                      <div className="member-wrapper flex items-center gap-1">
                        <div className="flex">
                          {!_.isEmpty(course?.trainers) &&
                            course?.trainers?.map((trainer, index) => {
                              return (
                                <div
                                  key={`trainer_${index + 1}`}
                                  className="member-img-div relative group"
                                >
                                  <ToolTip
                                    position="top"
                                    text={trainer?.assignedToUser}
                                  />
                                  <Image
                                    imgClassName="w-full h-full rounded-full object-cover"
                                    width={40}
                                    height={40}
                                    alt="memberImage"
                                    src={
                                      trainer?.profile_image ?? '/images/member.png'
                                    }
                                    serverPath
                                  />
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </p>
                    <p className="text-sm leading-4 text-dark flex items-center">
                      <Button className="w-[18px] h-[18px] inline-block me-1.5 opacity-50">
                        <Image
                          iconName="calendarIcon2"
                          iconClassName="w-full h-full"
                        />
                      </Button>
                      {course?.start_date
                        ? `${format(
                            new Date(course?.start_date),
                            REACT_APP_DATE_FORMAT as string
                          )}`
                        : ''}
                      -
                      {course?.end_date
                        ? `${format(
                            new Date(course?.end_date),
                            REACT_APP_DATE_FORMAT as string
                          )}`
                        : ''}
                    </p>
                  </div>
                </div>
              </div>
              {response?.data?.course_participate_count ? (
                <div className="ml-auto text-sm rounded-[4px] p-1 flex-shrink-0 self-start  bg-primary/10 text-primary font-semibold">
                  <span>{t('Dashboard.tiles.totalAttendee')}</span> &nbsp;
                  <span>{response?.data?.course_participate_count}</span>
                </div>
              ) : (
                <></>
              )}
            </div>
          )}
          {!isCourseCompanyLoading && company?.data?.length === 0 ? (
            <NoDataFound message={t('Table.noDataFound')} />
          ) : (
            ''
          )}

          {!isCourseCompanyLoading && company?.data && company?.data?.length > 0 ? (
            <>
              <div className="mt-10">
                <div className="grid grid-cols-1 1400:grid-cols-2 1800:grid-cols-3 gap-4">
                  {company?.data?.map((item) => {
                    return (
                      <CompanyCard
                        company={item}
                        key={item?.id}
                        activeTab={state?.activeTab}
                        courseState={state}
                        handleOnChangeCheckBox={handleOnChangeCheckBox}
                        companyIds={companyIds}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="mt-10 items-center justify-center">
                {company && (
                  <Pagination
                    setLimit={setLimit}
                    isShow={false}
                    currentPage={company?.currentPage}
                    dataPerPage={5}
                    dataCount={company?.count}
                    totalPages={company?.lastPage}
                  />
                )}
              </div>
            </>
          ) : (
            ''
          )}
        </>
      </CustomCard>
      {downloadModal?.isOpen && (
        <DownloadFileModal
          modal={downloadModal}
          handleAccept={(data) => DownloadPdf(data)}
          germanIgnore="true"
        />
      )}
    </>
  );
};

export default CourseCompanyList;
