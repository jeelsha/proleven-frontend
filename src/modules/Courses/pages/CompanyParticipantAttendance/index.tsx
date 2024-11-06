import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import ToolTip from 'components/Tooltip';
import { REACT_APP_DATE_FORMAT, REACT_APP_ENCRYPTION_KEY } from 'config';
import { format } from 'date-fns';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import _ from 'lodash';

import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import NoDataFound from 'components/NoDataFound';
import { useAxiosGet, useAxiosPut } from 'hooks/useAxios';
import { FetchAttendeeDetails } from 'modules/CompanyManager/types';
import { isTodayGreaterThanGivenDate } from 'modules/Courses/helper/CourseCommon';
import RecoverCourseModal from 'modules/Courses/pages/CompanyParticipantAttendance/RecoverCourseModal';
import UploadCertificate from 'modules/Courses/pages/CompanyParticipantAttendance/UploadCertificate';
import {
  CompanyCourseResponse,
  CompanyData,
  ParticipantData,
} from 'modules/Courses/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import { customRandomNumberGenerator } from 'utils';
import '../../style/index.css';
import AttendanceSheet from '../Attendance';
import { ExamEnum } from './Enum';
import { getPresignedImageUrl } from 'services/aws.service';
import { aesDecrypt, aesEncrypt } from 'utils/encrypt';

const CompanyParticipantAttendance = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation()?.state;
  const [limit, setLimit] = useState<number>(10);
  const [company, setCompany] = useState<CompanyData>();
  const [course, setCourse] = useState<CompanyCourseResponse>();
  const dispatch = useDispatch();
  const [participants, setParticipants] = useState<ParticipantData>();
  const [selectedData, setSelectedData] = useState<FetchAttendeeDetails | null>(
    null
  );
  const [sort, setSort] = useState<string>('-updated_at');
  const { currentPage } = useSelector(currentPageSelector);

  const KEY = REACT_APP_ENCRYPTION_KEY ?? '';

  const currentURL = new URL(window.location.href);
  const encryptedCompanyId = currentURL.searchParams.get('company');

  const companyId = encryptedCompanyId ? aesDecrypt(encryptedCompanyId, KEY) : '';

  const { t } = useTranslation();

  const recoverModal = useModal();
  const uploadModal = useModal();
  const markAsSignedModal = useModal();

  const [markAsSigned, { isLoading: signing }] = useAxiosPut();
  const [GenerateCertificate, { isLoading: isCertificateLoading }] = useAxiosGet();

  const { response, isLoading, refetch } = useQueryGetFunction(
    `/course/companies/participate`,
    {
      page: currentPage,
      limit,
      sort,
      option: {
        course_slug: params?.slug,
        company_id: companyId ?? location?.company_id,
      },
    }
  );
  useEffect(() => {
    if (response?.data) {
      setCompany(response?.data?.company);
      setCourse(response?.data?.course);
      setParticipants(response?.data?.participate);
    }
  }, [response]);
  const columnData: ITableHeaderProps[] = [
    {
      header: t('UserManagement.columnHeader.no'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('InPersonAttendee.name'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => nameRender(props as unknown as FetchAttendeeDetails),
    },
    {
      name: 'email',
      header: t('CompanyManager.AttendeeList.columnsTitles.emailId'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'code',
      header: t('CompanyManager.AttendeeList.codeTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: '',
      header: t('companyCard.attendanceStatus'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => attendanceStatusRender(props),
    },
    {
      name: '',
      header: t('companyCard.signedStatus'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props: CellProps) => signedStatusRender(props),
    },
    {
      name: '',
      header: t('attendees.attendance.percentage'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props: CellProps) => percentageRender(props),
    },
    {
      name: '',
      header: t('attendees.exam.result.statusTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props: CellProps) =>
        examStatusRender(props as unknown as FetchAttendeeDetails),
    },
    {
      header: t('RecoveredCourse.title'),
      option: {
        sort: true,
        hasFilter: false,
      },
      cell: (props) =>
        renderRecoveredCourse(props as unknown as FetchAttendeeDetails),
    },
    {
      header: 'Action',
      cell: (props: CellProps) =>
        actionRender(props as unknown as FetchAttendeeDetails),
    },
  ];

  const attendanceStatusRender = (item: CellProps) => {
    return (
      <StatusLabel
        text={item?.attendance_status}
        variants={item?.attendance_status === 'completed' ? 'completed' : 'pending'}
      />
    );
  };

  const signedStatusRender = (item: CellProps) => {
    return (
      <StatusLabel
        text={
          item?.signature_status === 'signed'
            ? t('companyCard.signedText')
            : t('companyCard.unSignedText')
        }
        variants={item?.signature_status === 'signed' ? 'completed' : 'pending'}
      />
    );
  };
  const examStatusRender = (item: FetchAttendeeDetails) => {
    let status = '';
    if (item?.courseParticipateExam.length > 0) {
      status = item?.courseParticipateExam.length
        ? item?.courseParticipateExam[item.courseParticipateExam.length - 1]
            ?.status_without_attendance
        : '';
    }
    return (
      <StatusLabel
        text={
          status === ExamEnum.PASS
            ? t('attendees.exam.pass')
            : status === ExamEnum.FAIL
            ? t('attendees.exam.fail')
            : t('attendees.exam.notAttempted')
        }
        variants={
          status === ExamEnum.PASS
            ? 'completed'
            : status === ExamEnum.FAIL
            ? 'cancelled'
            : 'pending'
        }
      />
    );
  };
  const percentageRender = (item: CellProps) => {
    return `${item?.courseAttendance}%`;
  };

  const createToast = (message: string) => {
    const random = customRandomNumberGenerator();
    dispatch(
      setToast({
        variant: 'Warning',
        message,
        type: 'error',
        id: random,
      })
    );
  };

  const handleDownloadCertificate = async (item: FetchAttendeeDetails) => {
    const isCertificateAvailable =
      item?.courseParticipateExam?.length &&
      item?.courseParticipateExam?.[item.courseParticipateExam.length - 1]
        ?.status_without_attendance !== ExamEnum.PASS;
    if (isCertificateAvailable) {
      createToast(t('CourseManagement.company.attendee.certificateTemplate'));
      return;
    }
    if (item?.external_certificate_pdf_link) {
      const url = await getPresignedImageUrl(
        item?.external_certificate_pdf_link,
        undefined,
        undefined,
        true
      );
      window.open(url, '_blank');
    } else {
      const { data, error } = await GenerateCertificate(`/generate-certificate`, {
        params: {
          course_slug: item?.course?.slug,
          course_participate_slug: item?.slug,
        },
      });
      if (!error) {
        window.open(data, '_blank');
      }
    }
  };

  const handleMarkAsSigned = async () => {
    if (selectedData) {
      await markAsSigned(
        `/course/attendance-sheet/participate/sign/${selectedData?.course?.slug}`,
        {
          participateSlug: selectedData?.slug,
          lessonSessionSlug: [],
        }
      );
      markAsSignedModal.closeModal();
      refetch();
    }
  };

  const actionRender = (item: FetchAttendeeDetails) => {
    const isCourseCompleted = item?.course?.end_date
      ? isTodayGreaterThanGivenDate(item?.course?.end_date)
      : item?.course?.end_date;
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        {Number(item?.courseAttendance) < 90 && (
          <Button
            onClickHandler={() => {
              setSelectedData(item as unknown as FetchAttendeeDetails);
              recoverModal.openModal();
            }}
            disabled={Boolean(item.is_recovered)}
            parentClass="h-fit"
            className={`action-button primary-btn ${
              item.is_recovered ? 'opacity-50' : ''
            }`}
            tooltipText={t('Tooltip.Recover')}
          >
            <Image
              iconName="refreshIcon"
              iconClassName=" w-5 h-5"
              width={24}
              height={24}
            />
          </Button>
        )}
        <Button
          onClickHandler={() => {
            const companyId = item?.company_id ? item?.company_id?.toString() : '';
            const encryptedCompany = aesEncrypt(companyId, KEY);
            navigate(
              `/courses/company/attendance-timesheet/${params?.slug}/${encryptedCompany}/${item?.slug}`,
              {
                state: {
                  ...location,
                  courseSlug: params?.slug,
                  companyId: location?.company_id,
                  participateSlug: item?.slug,
                },
              }
            );
          }}
          parentClass="h-fit"
          className="action-button primary-btn"
          tooltipText={t('Tooltip.View')}
        >
          <Image
            iconName="calendarCheckIcon"
            iconClassName=" w-5 h-5"
            width={24}
            height={24}
          />
        </Button>

        {item?.course?.is_external_certificate && (
          <Button
            parentClass="h-fit"
            className="action-button primary-btn"
            onClickHandler={() => {
              setSelectedData(item as unknown as FetchAttendeeDetails);
              uploadModal.openModal();
            }}
            tooltipText={t('CompanyParticipants.UploadCertificate')}
          >
            <Image iconName="bulkUpload" iconClassName="stroke-current w-5 h-5" />
          </Button>
        )}

        {isCourseCompleted && item?.signature_status === 'unsigned' ? (
          <Button
            parentClass="h-fit"
            className="action-button green-btn"
            onClickHandler={() => {
              setSelectedData(item as unknown as FetchAttendeeDetails);
              markAsSignedModal.openModal();
            }}
            tooltipText={t('companyCard.markSigned')}
          >
            <Image iconName="editpen2" iconClassName="stroke-current w-4 h-4" />
          </Button>
        ) : (
          ''
        )}

        <Button
          parentClass="h-fit"
          className="action-button primary-btn here"
          onClickHandler={() => {
            setSelectedData(item);
            handleDownloadCertificate(item);
          }}
          tooltipText={t('CompanyParticipants.DownloadCertificate')}
          disabled={isCertificateLoading}
        >
          {isCertificateLoading && selectedData?.id === item.id && (
            <Image loaderType="Spin" />
          )}
          {(!isCertificateLoading ||
            !selectedData ||
            selectedData?.id !== item.id) && (
            <Image iconName="downloadFile2" iconClassName="stroke-current w-5 h-5" />
          )}
        </Button>
      </div>
    );
  };

  const nameRender = (item: FetchAttendeeDetails) => {
    if (item?.full_name?.length > 15) {
      item.full_name = `${item.full_name.substring(0, 15)}...`;
    }
    return (
      <div className="flex flex-col">
        <span>{item?.full_name}</span>
        {item?.recovered_from_course_id ? (
          <span className="font-bold capitalize">
            {t('RecoveredCourse.recovered')}
          </span>
        ) : (
          ''
        )}
      </div>
    );
  };

  const renderRecoveredCourse = (item: FetchAttendeeDetails) => {
    return (
      <div className="flex flex-col">
        {item?.recovered_from_course_id ? (
          <Button
            onClickHandler={() => {
              const companyId = item?.company_id ? item?.company_id?.toString() : '';
              const encryptedCompany = aesEncrypt(companyId, KEY);
              navigate(
                `/courses/company/attendance-timesheet/${item?.recoverCourse?.slug}/${encryptedCompany}/${item?.slug}`,
                {
                  state: {
                    ...location,
                    courseSlug: item?.recoverCourse?.slug,
                    companyId: item?.company_id,
                    participateSlug: item?.slug,
                    url: `/courses/company-participant/attendance/${item?.course?.slug}?company=${encryptedCompany}`,
                  },
                }
              );
            }}
          >
            {item?.recoverCourse?.title}
          </Button>
        ) : (
          '-'
        )}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        text={t('Tooltip.Attendance')}
        url={`/courses/company-list/${
          params?.slug ?? location?.publish_course_slug
        }`}
        small
        passState={{
          status: location?.status,
          publish_course_slug: location?.publish_course_slug,
          activeTab: location?.activeTab,
        }}
      />

      <CustomCard minimal>
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-10">
              <div className="flex ">
                <div className="lazy h-32 w-[220px] rounded-md" />
                <div className="ps-6 w-full">
                  <div className="flex flex-col gap-y-3.5">
                    <div className="lazy w-2/3 h-6" />
                    <div className="lazy w-1/2 h-6" />
                    <div className="lazy h-6  w-[220px]" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ''
          )}
          {!isLoading && !course ? <NoDataFound /> : ''}
          {!isLoading && !_.isEmpty(course) ? (
            <div className="grid grid-cols-2 gap-10">
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
                <div className="ps-6 max-w-[calc(100%_-_220px)]">
                  <div className="max-w-[360px] flex flex-col gap-y-3.5">
                    <div className="flex flex-wrap">
                      {course?.category_name && (
                        <Button className="text-sm leading-4 text-secondary last:after:hidden after:mx-1.5 after:content-['•']">
                          {course?.category_name}
                        </Button>
                      )}
                      {course?.sub_category_name && (
                        <Button className="text-sm leading-4 text-secondary last:after:hidden after:mx-1.5 after:content-['•']">
                          {course?.sub_category_name}
                        </Button>
                      )}
                    </div>
                    {course?.title && (
                      <h4 className="text-lg font-semibold text-dark leading-6">
                        {course?.title}
                      </h4>
                    )}
                    <div className="flex flex-wrap">
                      {!_.isEmpty(course?.trainers) && (
                        <>
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
                                        key={`trainer_image_${index + 1}`}
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
                                            trainer?.profile_image ??
                                            '/images/member.png'
                                          }
                                          serverPath
                                        />
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </p>
                        </>
                      )}
                      {course?.start_date && (
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
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative before:absolute before:content-[''] before:h-[60%] before:w-px before:bg-gray-200 before:top-1/2 before:-translate-y-1/2">
                <div className="max-w-[550px] mx-auto">
                  <div className="flex flex-wrap gap-2.5 items-center mb-4">
                    {company?.company_logo && (
                      <div className="w-16 h-10 border border-solid border-borderColor rounded-md overflow-hidden">
                        <Image
                          src={company?.company_logo ?? `/images/no-image.png`}
                          imgClassName="w-full h-full object-cover"
                          width={96}
                          height={96}
                          serverPath
                        />
                      </div>
                    )}
                    <Button className="text-lg font-bold leading-7">
                      {company?.name}
                    </Button>
                  </div>
                  {company?.address1 && (
                    <p className="text-lg font-semibold leading-[1.2] text-primary">
                      {company?.address1},{company?.address2}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            ''
          )}
        </>
      </CustomCard>
      <div className="mt-8">
        <AttendanceSheet
          singleCompanySheet
          urlToNavigate={{
            url: `/courses/company-list/${location?.publish_course_slug}`,
          }}
          showLessonSession={false}
          showPageHeader={false}
        />
      </div>
      <div className="mt-8">
        {participants && (
          <Table
            headerData={columnData}
            bodyData={participants?.data}
            loader={isLoading}
            pagination
            dataPerPage={limit}
            setLimit={setLimit}
            totalPage={participants.lastPage}
            dataCount={participants.count}
            setSort={setSort}
            sort={sort}
            tableHeightClassName="!min-h-[unset]"
          />
        )}
      </div>
      {recoverModal.isOpen && (
        <RecoverCourseModal
          modal={recoverModal}
          courseCode={course?.code ?? ''}
          participateSlug={selectedData?.slug ?? ''}
          refetch={refetch}
          courseSlug={course?.slug}
        />
      )}
      {uploadModal.isOpen ? (
        <UploadCertificate
          modal={uploadModal}
          refetch={refetch}
          participateSlug={selectedData?.slug}
          certificateLink={selectedData?.external_certificate_pdf_link}
        />
      ) : (
        ''
      )}

      {markAsSignedModal.isOpen && (
        <ConfirmationPopup
          modal={markAsSignedModal}
          bodyText={t('CompanyParticipants.markAsSignedText', {
            NAME: selectedData?.full_name,
          })}
          popUpType="primary"
          confirmButtonText={t('CoursesManagement.confirm')}
          deleteTitle={t('companyCard.markSigned')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            setSelectedData(null);
            markAsSignedModal.closeModal();
          }}
          confirmButtonFunction={handleMarkAsSigned}
          isLoading={signing}
        />
      )}
    </>
  );
};

export default CompanyParticipantAttendance;
