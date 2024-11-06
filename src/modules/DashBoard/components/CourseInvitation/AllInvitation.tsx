import Button from 'components/Button/Button';
import Image from 'components/Image';
// import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { TFunction } from 'i18next';
import { COURSE_TYPE } from 'modules/Courses/Constants';
import { CourseResponse } from 'modules/Courses/types';
import 'modules/DashBoard/components/style/dashboard.css';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';

interface AllInvitations {
  search: string;
}

const CourseAcceptModal = React.lazy(
  () => import('modules/DashBoard/components/CourseAccept/index')
);

const templateRender = (item: CellProps, t: TFunction) => {
  return (
    <div className="flex items-center">
      <div className="w-[100px] h-[70px]">
        <Image
          src={item.image}
          width={100}
          height={100}
          imgClassName="w-full h-full object-cover rounded-lg"
          serverPath
        />
      </div>
      <div className="max-w-[220px] ps-2 flex-1">
        <p className="text-sm text-dark leading-[1.3] mb-1 text-left">
          {item.title}
        </p>
        {item?.course_bundle_id && (
          <p className="text-sm text-primary leading-[1.3] mb-1 text-left">
            {t('Dashboard.courses.bundle.title')}
          </p>
        )}
      </div>
    </div>
  );
};
const CourseTypeCell = (props: CellProps): string =>
  getCourseType((props as unknown as CourseResponse)?.type);

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

const AllInvitation = ({ search }: AllInvitations) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentPage } = useSelector(currentPageSelector);
  const searchString = typeof search === 'string' ? search : '';
  const debouncedSearch = useDebounce(searchString, 500);
  const acceptModal = useModal();
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');

  const { response, isLoading, refetch } = useQueryGetFunction(
    '/trainer/trainer-accepted-course',
    {
      page: currentPage,
      limit,
      sort,
      search: debouncedSearch,
      option: {
        profile: true,
        processedInvitation: true,
      },
    }
  );

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
      header: t('UserManagement.courseTab.Title'),
      className: '!w-[350px]',
      cell: (props) => templateRender(props, t),
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
      header: t('EmailTemplate.emailTempTableActions'),
      name: 'action',
      className: 'w-40',
      cell: (props: CellProps) => viewRender(props),
    },
  ];

  const viewRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Button
          onClickHandler={() =>
            navigate(`/trainer/courses/view/${item?.slug}`, {
              state: { isAllInvite: true },
            })
          }
          parentClass="h-fit"
          className="action-button green-btn"
          tooltipText={t('Tooltip.View')}
        >
          <Image
            iconName="eyeIcon"
            iconClassName="stroke-current w-5 h-5"
            width={24}
            height={24}
          />
        </Button>

        <Button
          onClickHandler={() => {
            acceptModal?.openModalWithData?.(item);
          }}
          parentClass="h-fit"
          className="action-button green-btn select-none"
          tooltipText={t('reviewInvite')}
        >
          <Image
            iconName="reviewInvite"
            iconClassName=" w-5 h-5"
            width={24}
            height={24}
          />
        </Button>
      </div>
    );
  };

  return (
    <div>
      <Table
        parentClassName="!p-0"
        tableRoundedRadius="pt-[1.75rem]"
        tableHeaderClass="sticky top-0 z-1"
        headerData={columnData}
        bodyData={response?.data?.data}
        loader={isLoading}
        dataPerPage={limit}
        pagination
        setLimit={setLimit}
        totalPage={response?.data?.lastPage}
        dataCount={response?.data?.count}
        setSort={setSort}
        sort={sort}
        width="min-w-[1300px]"
        PageHeaderClass="!pt-0 !z-1"
      />

      {acceptModal.isOpen && (
        <CourseAcceptModal
          modal={acceptModal}
          refetchTrainers={refetch}
          viewModeOnly
        />
      )}
    </div>
  );
};
export default AllInvitation;
