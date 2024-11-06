// ** Components ***
import Button from 'components/Button/Button';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';

// ** Hooks ***
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// ** Types ***
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { Course, CourseResponse } from 'modules/Courses/types';

// ** Constants ***
import { REACT_APP_DATE_FORMAT } from 'config';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format } from 'date-fns';
import 'modules/Client/styles/index.css';
import { COURSE_TYPE } from 'modules/Courses/Constants';

// ** Slices ***
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

// ** Utils ***

const CourseDetail = (props: {
  trainingSpecialistId: number;
  roleName: string;
  activeTab?: number;
  userSlug?: string;
  userRolePath?: string;
}) => {
  const { trainingSpecialistId, roleName } = props;

  const { currentPage } = useSelector(currentPageSelector);
  const navigate = useNavigate();
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');

  const { t } = useTranslation();
  const updateTitle = useTitle();
  const urlData = new URL(window.location.href);
  const params = urlData.searchParams;

  updateTitle(t('ClientManagement.clientTabs.courseTitle'));

  const url = roleName === ROLES.Trainer ? '/course/trainers' : '/course/member';
  const optionToPass: { [key: string]: string } = {};
  if (roleName === ROLES.Trainer) {
    optionToPass.user_id = String(trainingSpecialistId);
  } else {
    optionToPass.member = String(trainingSpecialistId);
  }

  const { response, isLoading } = useQueryGetFunction(url, {
    page: currentPage,
    limit,
    sort,
    option: {
      ...optionToPass,
      // courseCategory,
      // courseSubCategory,
      // status,
      ...(params.has('courseCategory')
        ? { courseCategory: params.getAll('courseCategory') }
        : {}),
      ...(params.has('courseSubCategory')
        ? { courseSubCategory: params.getAll('courseSubCategory') }
        : {}),
      ...(params.has('courseStatus')
        ? { status: params.getAll('courseStatus') }
        : {}),
      ...(params.has('fundedBy') ? { fundedBy: params.getAll('fundedBy') } : {}),
      ...(roleName === ROLES.Trainer ? { trainerCourse: true } : {}),
      ...(params.has('courseType') ? { type: params.getAll('courseType') } : {}),
      ...(roleName === ROLES.SalesRep ? { roleType: ROLES.SalesRep } : {}),
      ...(params.has('filterDate')
        ? { ...JSON.parse(params.get('filterDate') ?? '{}') }
        : {}),
    },
  });

  const FundedByCell = (props: CellProps): string | JSX.Element =>
    getFundedBy((props as unknown as Course)?.funded_by);

  const getFundedBy = (funded_by: string): string | JSX.Element => {
    const stringToArray = funded_by?.split(',');

    if (funded_by === 'NAN') {
      return '-';
    }

    const mappedElements = stringToArray?.map((data, index) => (
      <div key={`${index + 1}_fundedBy`} className="flex flex-col">
        <StatusLabel text={data} />
      </div>
    ));

    return <div className="flex flex-col">{mappedElements}</div>;
  };

  const getCourseType = (courseType: string): string => {
    switch (courseType) {
      case COURSE_TYPE.Academy:
        return COURSE_TYPE.academy;
      case COURSE_TYPE.Private:
        return COURSE_TYPE.private;
      default:
        return '';
    }
  };
  const statusRender = (item: CourseResponse) => {
    const getStatusClass = () => {
      switch (item.status) {
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
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={item.status}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };

  const courseCompaniesCell = (item: CourseResponse) => {
    const companyNames = item.companies?.join(', ') || '-';

    const truncatedNames =
      companyNames?.length > 100
        ? `${companyNames.substring(0, 100)}...`
        : companyNames;

    return <>{truncatedNames}</>;
  };

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
      header: t('CoursesManagement.CreateCourse.courseName'),
      name: 'title',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Category'),
      name: 'course.courseCategory.name',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Type'),
      cell: (props) => CourseTypeCell(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.FundedBy'),
      name: 'course.funded_by',
      cell: (props) => FundedByCell(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('ClientManagement.clientColumnTitles.clientStatus'),
      name: 'status',
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => statusRender(props as unknown as CourseResponse),
    },
    {
      header: t('Course.endDate'),
      name: 'end_date',
      cell: (props) => dateRender(props as unknown as CourseResponse),
    },
    {
      header: t('CoursesManagement.columnHeader.ClientCompany'),
      name: 'course.companies',
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => courseCompaniesCell(props as CourseResponse),
    },
    {
      header: t('CoursesManagement.columnHeader.Actions'),
      cell: (props) => actionRender(props),
    },
  ];
  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        <Button
          onClickHandler={() => {
            navigate(`/courses/view/${item?.slug}`, {
              state: {
                fromTrainer: true,
                activeTab: props?.activeTab,
                userSlug: props?.userSlug,
                userRolePath: props?.userRolePath,
                type: item?.type,
              },
            });
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
      </div>
    );
  };

  const dateRender = (item: CourseResponse) => {
    return (
      <div>
        {item?.end_date
          ? format(new Date(item?.end_date), REACT_APP_DATE_FORMAT as string)
          : '-'}
      </div>
    );
  };

  const CourseTypeCell = (props: CellProps): string =>
    getCourseType((props as unknown as CourseResponse)?.type);

  return (
    <Table
      headerData={columnData}
      bodyData={response?.data?.data}
      loader={isLoading}
      pagination
      dataPerPage={limit}
      setLimit={setLimit}
      totalPage={response?.data?.lastPage}
      dataCount={response?.data?.count}
      setSort={setSort}
      sort={sort}
    />
  );
};

export default CourseDetail;
