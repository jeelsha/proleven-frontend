import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import 'modules/DashBoard/components/style/dashboard.css';
import { ISalesCourseRequest } from 'modules/SalesRep/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';
import '../style/companyManager.css';

const MyCourseRequest = () => {
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);
  const updateTitle = useTitle();
  const navigate = useNavigate();
  const { currentPage } = useSelector(currentPageSelector);
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 500);
  const rejectModal = useModal();
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [rejectCourse] = useAxiosPost();
  const params = useParams();
  const [slug, setSlug] = useState('');
  const [hasRequestedStatus, setHasRequestedStatus] = useState<boolean>(false);
  const { response, isLoading, refetch } = useQueryGetFunction(
    `/course-request/courses/${params?.slug}`,
    {
      page: currentPage,
      limit,
      sort,
      search: debouncedSearch,
    }
  );

  const statusRender = (item: CellProps) => {
    const getStatusClass = () => {
      switch ((item as unknown as ISalesCourseRequest).status) {
        case 'approved':
          return 'completed';
        case 'canceled':
          return 'cancelled';
        case 'requested':
          return 'pending';
        default:
          return 'neon';
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
  useEffect(() => {
    if (response && response.data && Array.isArray(response.data.data)) {
      const hasRequested = response.data.data.some(
        (item: { status: string }) => item.status === 'requested'
      );
      setHasRequestedStatus(hasRequested);
    }
  }, [response]);
  const columnData: ITableHeaderProps[] = [
    {
      header: t('CourseRequest.courseImage'),
      name: 'course.image',
      cell: (props) =>
        courseImageRender(props as unknown as { course: { image: string } }),

      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('ClientManagement.courseListing.courseName'),
      name: 'course.title',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CompanyManager.courses.categoryTitle'),
      name: 'course.courseCategory.name',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Dashboard.Trainer.CourseInvitation.type'),
      name: 'course.type',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('UserManagement.courseTab.Status'),
      name: 'status',
      cell: (props) => statusRender(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('UserManagement.courseTab.CourseRequests'),
      className: 'w-40',
      cell: (props) => actionRender(props),
    },
  ];
  const courseImageRender = (item: { course: { image: string } }) => {
    return (
      <>
        {' '}
        <div className="w-[100px] h-[70px]">
          <Image
            src={item?.course?.image}
            width={100}
            height={100}
            imgClassName="w-full h-full object-cover rounded-lg"
            serverPath
          />
        </div>
      </>
    );
  };
  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Button
          onClickHandler={() =>
            navigate(`/courses/template/view/${item?.course_slug}`, {
              state: {
                comingFromCourseRequest: true,
                slug: params?.slug,
                isTemplate: true,
              },
            })
          }
          parentClass="h-fit"
          // className="action-render"
          className="action-button green-btn"
        >
          <Image
            iconName="eyeIcon"
            iconClassName="stroke-current w-5 h-5"
            width={24}
            height={24}
          />
        </Button>
      </div>
    );
  };
  let RequestCourseData = [...columnData];

  if (user?.role_name === ROLES.CompanyManager) {
    RequestCourseData = RequestCourseData.filter(
      (item) => item.name !== 'company.name'
    );
  }
  const onReject = async () => {
    const { error } = await rejectCourse(`/course-request/action/${slug}`, {
      status: 'canceled',
    });
    if (!error) {
      rejectModal.closeModal();
      setSlug('');
      refetch();
    }
  };
  updateTitle(t('CourseRequest.reqCourseTitle'));

  return (
    <section className={`${user?.role_name === ROLES.Admin ? '' : 'mt-5'}`}>
      <div
        className={`${
          user?.role_name === ROLES.Admin || user?.role_name === ROLES.SalesRep
            ? ''
            : 'container'
        }`}
      >
        <PageHeader
          text={t('CourseRequest.reqCourseTitle')}
          small
          url={PRIVATE_NAVIGATION.companyManager.requestCourse.list.path}
        >
          <div className="flex justify-end gap-2">
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
              />
            </div>
            <div>
              {user?.role_name === ROLES.CompanyManager && !hasRequestedStatus && (
                <Button
                  variants="primary"
                  onClickHandler={() => {
                    navigate(
                      PRIVATE_NAVIGATION.companyManager.requestCourse.add.path
                    );
                  }}
                >
                  <span className="w-5 h-5 inline-block me-2">
                    <Image
                      iconName="userGroupStrokeSD"
                      iconClassName="w-full h-full"
                    />
                  </span>
                  {t('CourseRequest.addCourseRequest')}
                </Button>
              )}
            </div>
          </div>
        </PageHeader>
        <Table
          headerData={RequestCourseData}
          bodyData={response?.data?.data}
          loader={isLoading}
          pagination
          dataPerPage={limit}
          setLimit={setLimit}
          totalPage={response?.data?.lastPage}
          dataCount={response?.data?.count}
          setSort={setSort}
          sort={sort}
          // width="min-w-[1700px]"
        />
        {rejectModal.isOpen && (
          <ConfirmationPopup
            modal={rejectModal}
            bodyText={t('rejectCourse.body')}
            variants="primary"
            confirmButtonText={t('rejectCourse.reject')}
            deleteTitle={t('rejectCourse.title')}
            confirmButtonFunction={onReject}
            confirmButtonVariant="primary"
            cancelButtonText={t('Button.cancelButton')}
            cancelButtonFunction={() => {
              rejectModal.closeModal();
            }}
          />
        )}
      </div>
    </section>
  );
};
export default MyCourseRequest;
