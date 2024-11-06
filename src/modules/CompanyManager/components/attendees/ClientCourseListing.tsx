// ** imports **
import { format } from 'date-fns';
import { TFunction } from 'i18next';
import { Dispatch, SetStateAction, useState } from 'react';

// ** components **
import Table from 'components/Table/Table';

// ** styles **
import 'modules/Client/styles/index.css';

// ** types **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import { ITableHeaderProps } from 'components/Table/types';
import { REACT_APP_DATE_FORMAT, REACT_APP_ENCRYPTION_KEY } from 'config';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { useAxiosGet } from 'hooks/useAxios';
import { CompanyCourseList } from 'modules/Client/types';
import {
  CompanyCourseListProps,
  FetchAttendeeDetails,
} from 'modules/CompanyManager/types';
import { useLocation, useNavigate } from 'react-router-dom';
import { aesEncrypt } from 'utils/encrypt';

export interface ClientCourseListingProps {
  courseLoading: boolean;
  courseList: CompanyCourseListProps;
  sort: string;
  limit: number;
  setSort: Dispatch<SetStateAction<string>>;
  setLimit: Dispatch<SetStateAction<number>>;
  t: TFunction<'translation', undefined>;
  activeTab?: number;
  unknownCompany?: boolean;
  comingFromManagerProfile?: boolean;
}
const ClientCourseListing = ({
  courseLoading,
  courseList,
  setLimit,
  setSort,
  sort,
  limit,
  t,
  activeTab,
  unknownCompany,
  comingFromManagerProfile,
}: ClientCourseListingProps) => {
  const { state } = useLocation();
  const [selectedData, setSelectedData] = useState<FetchAttendeeDetails | null>(
    null
  );
  const [companyManagerGetApi, { isLoading: pdfLoader }] = useAxiosGet();
  const navigate = useNavigate();

  const KEY = REACT_APP_ENCRYPTION_KEY ?? '';

  const statusRender = (item: CompanyCourseList) => {
    const getStatusClass = () => {
      if (item.course) {
        switch (item?.course?.status) {
          case 'publish':
            return 'completed';
          case 'confirmed':
            return 'completed';
          case 'draft':
            return 'pending';
          case 'proposed':
            return 'gray';
          case 'rejected':
            return 'cancelled';
          case 'requested':
            return 'neon';
          default:
            return 'pending';
        }
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return item.course ? (
      <StatusLabel
        text={item.course.status}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    ) : (
      <span>-</span>
    );
  };

  const columnData: ITableHeaderProps[] = [
    {
      header: t('Table.no.'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      name: 'course.courseCategory.name',
      header: t('CoursesManagement.CourseCategory.courseCategory'),
      option: {
        sort: true,
        hasFilter: false,
      },
    },

    {
      name: 'course.title',
      header: t('ClientManagement.courseListing.courseName'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('RecoveredCourse.title'),
      name: 'recoverCourse.title',
      option: {
        sort: false,
        hasFilter: false,
      },
    },

    {
      // name: 'course.type',
      header: t('ClientManagement.courseListing.type'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => {
        return (
          <div>
            <p className="capitalize">
              {(props as unknown as CompanyCourseList)?.course?.type}
            </p>
          </div>
        );
      },
    },
    {
      name: 'course.status',
      header: t('ClientManagement.clientColumnTitles.clientStatus'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => statusRender(props as unknown as CompanyCourseList),
    },
    {
      name: 'course.start_date',
      header: t('ClientManagement.courseListing.startDate'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => dateRender(props as unknown as CompanyCourseList, 'start'),
    },
    {
      name: 'course.end_date',
      header: t('ClientManagement.courseListing.endDate'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => dateRender(props as unknown as CompanyCourseList, 'end'),
    },
    {
      name: 'expiry_date',
      header: t('ClientManagement.courseListing.expiryDate'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => dateRender(props as unknown as CompanyCourseList, 'expiry'),
    },
    {
      header: t('CoursesManagement.columnHeader.Actions'),
      cell: (props) => actionRender(props as unknown as CompanyCourseList),
    },
  ];

  const dateRender = (item: CompanyCourseList, dateType?: string) => {
    if (dateType === 'start') {
      return (
        <div>
          {item?.course?.start_date
            ? format(
                new Date(item?.course?.start_date),
                REACT_APP_DATE_FORMAT as string
              )
            : '-'}
        </div>
      );
    }
    if (dateType === 'end') {
      return (
        <div>
          {item?.course?.end_date
            ? format(
                new Date(item?.course?.end_date),
                REACT_APP_DATE_FORMAT as string
              )
            : '-'}
        </div>
      );
    }
    return (
      <div>
        {item?.course?.expiry_date
          ? format(
              new Date(item?.course?.expiry_date),
              REACT_APP_DATE_FORMAT as string
            )
          : '-'}
      </div>
    );
  };
  const DownloadCertificate = async (item: FetchAttendeeDetails) => {
    const { data: response, error } = await companyManagerGetApi(
      `/generate-certificate`,
      {
        params: {
          course_slug: item?.course?.slug,
          course_participate_slug: item?.slug,
        },
      }
    );
    if (!error) {
      window.open(response, '_blank');
    }
  };

  const renderButton = (item: CompanyCourseList) => {
    if (comingFromManagerProfile || state?.comingFromAttendeeTab) {
      return (
        <Button
          onClickHandler={() => {
            navigate(
              `${PRIVATE_NAVIGATION.companyManager.courses.list.path}/${item?.course?.slug}`,
              {
                state: {
                  fromAttendee: true,
                  activeTab,
                  type: item?.course?.type,
                  isCourse: true,
                  attendeeSlug: item?.slug,
                  status: item?.course?.status,
                },
              }
            );
          }}
          parentClass="h-fit"
          className="action-button green-btn relative group"
          tooltipText={t('Tooltip.View')}
        >
          <Image
            iconName="eyeIcon"
            iconClassName=" w-5 h-5"
            width={24}
            height={24}
          />
        </Button>
      );
    }
    return (
      <Button
        onClickHandler={() => {
          navigate(`/courses/view/${item?.course?.slug}`, {
            state: {
              fromAttendee: true,
              activeTab,
              type: item?.course?.type,
              isCourse: true,
              attendeeSlug: item?.slug,
              status: item?.course?.status,
            },
          });
        }}
        parentClass="h-fit"
        className="action-button green-btn relative group"
        tooltipText={t('Tooltip.View')}
      >
        <Image iconName="eyeIcon" iconClassName=" w-5 h-5" width={24} height={24} />
      </Button>
    );
  };
  const actionRender = (item: CompanyCourseList) => {
    const currentDate = new Date();
    const endDate = new Date(item?.course?.end_date as string);
    const showAttendanceIcon = currentDate >= endDate;

    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        {renderButton(item)}
        <Button
          parentClass="h-fit"
          className="action-button primary-btn"
          onClickHandler={() => {
            setSelectedData(item as unknown as FetchAttendeeDetails);
            DownloadCertificate(item as unknown as FetchAttendeeDetails);
          }}
          tooltipText={t('Tooltip.DownloadPDF')}
        >
          {pdfLoader && selectedData?.id === item.id && <Image loaderType="Spin" />}
          {(pdfLoader === false ||
            selectedData === null ||
            selectedData?.id !== item.id) && (
            <Image iconName="downloadFile2" iconClassName="stroke-current w-5 h-5" />
          )}
        </Button>
        {!comingFromManagerProfile && showAttendanceIcon && !unknownCompany && (
          <Button
            onClickHandler={() => {
              const companyId = item?.company_id ? item?.company_id?.toString() : '';
              const encryptedCompany = aesEncrypt(companyId, KEY);
              setSelectedData(item as unknown as FetchAttendeeDetails);
              navigate(
                `/courses/company/attendance-timesheet/${item?.course?.slug}/${encryptedCompany}/${item?.slug}`,
                {
                  state: {
                    courseSlug: item?.course?.slug,
                    companyId: item?.company_id,
                    participateSlug: item?.slug,
                    url: `/clients/attendee/${item?.slug}`,
                    activeTab,
                  },
                }
              );
            }}
            parentClass="h-fit"
            className="action-button primary-btn"
            tooltipText={t('Tooltip.Attendance')}
          >
            <Image
              iconName="calendarCheckIcon"
              iconClassName="stroke-current w-5 h-5"
              width={24}
              height={24}
            />
          </Button>
        )}
      </div>
    );
  };

  return courseList?.data?.data ? (
    <Table
      headerData={columnData}
      bodyData={courseList?.data?.data ?? []}
      loader={courseLoading}
      pagination
      dataPerPage={limit}
      setLimit={setLimit}
      totalPage={courseList?.data?.lastPage}
      dataCount={courseList?.data?.count}
      setSort={setSort}
      sort={sort}
    />
  ) : (
    <>{pdfLoader}</>
  );
};

export default ClientCourseListing;
