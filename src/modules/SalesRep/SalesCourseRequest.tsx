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
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';
import AcceptModal from './components/AcceptModal';
import './style/index.css';
import { ISalesCourseRequest } from './types';

const SalesCourseRequest = () => {
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);
  const navigate = useNavigate();
  const firstRender = useRef(false);
  const updateTitle = useTitle();
  const { currentPage } = useSelector(currentPageSelector);
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 500);
  const rejectModal = useModal();
  const acceptModal = useModal();
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [acceptRejectCourse] = useAxiosPost();
  const [slug, setSlug] = useState('');
  const { company } = useSelector(useCompany);
  const [hasRequestedStatus, setHasRequestedStatus] = useState<boolean>(false);
  const [hideButton, setHideButton] = useState(true);
  const url =
    company?.slug && user?.role_name === ROLES.CompanyManager
      ? `/course-request/${company?.slug}`
      : '/course-request';
  const { response, isLoading, refetch } = useQueryGetFunction(url, {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
  });

  const statusRender = (item: CellProps) => {
    const getStatusClass = () => {
      switch ((item as unknown as ISalesCourseRequest).status) {
        case 'approved':
          return 'completed';
        case 'rejected':
          return 'cancelled';
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
    if (user?.role_name === ROLES.CompanyManager && firstRender.current) {
      firstRender.current = false;
      navigate(PRIVATE_NAVIGATION.dashboard.view.path);
    }
    firstRender.current = true;
  }, [company]);

  useEffect(() => {
    if (response && response.data && Array.isArray(response.data.data)) {
      setHideButton(false);
      const hasRequested = response.data.data.some(
        (item: { status: string }) => item.status === 'requested'
      );
      if (!hasRequested && search !== '') {
        setHasRequestedStatus(true);
      } else {
        setHasRequestedStatus(hasRequested);
      }
    }
  }, [response]);

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
      header: t('UserManagement.courseTab.CompanyName'),
      name: 'company.name',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('UserManagement.courseTab.Title'),
      name: 'title',
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
      header: t('UserManagement.courseTab.AssignUser'),
      name: 'courseRequestUser.full_name',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('UserManagement.courseTab.CourseRequests'),
      className: 'w-40',
      cell: (props: CellProps) => actionRender(props),
    },
  ];

  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Button
          onClickHandler={() => {
            navigate(`/manager/requested-courses/${item?.slug}`, {
              state: { title: item?.slug },
            });
          }}
          parentClass="h-fit"
          className="action-button green-btn"
          tooltipText={t('Tooltip.View')}
        >
          <Image
            iconName="eyeIcon"
            iconClassName=" w-5 h-5"
            width={24}
            height={24}
          />
        </Button>
        {(user?.role_name === ROLES.Admin ||
          (user?.role_name === ROLES.SalesRep && user?.is_head)) &&
          item.status === 'requested' && (
            <Button
              onClickHandler={() => {
                setSlug(item?.slug);
                acceptModal?.openModal();
              }}
              parentClass="h-fit"
              className="action-button primary-btn"
              tooltipText="Accept"
            >
              <Image
                iconName="checkIcon"
                iconClassName="w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
          )}
        {item?.status === 'requested' && (
          <Button
            onClickHandler={() => {
              setSlug(item?.slug);
              rejectModal.openModal();
            }}
            parentClass="h-fit"
            className="action-button red-btn"
            tooltipText={t('Tooltip.Delete')}
          >
            <Image iconName="deleteIcon" iconClassName="stroke-current w-5 h-5" />
          </Button>
        )}
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
    const statusForCourse =
      user && (user?.role_name === ROLES.Admin || user?.role_name === ROLES.SalesRep)
        ? 'rejected'
        : 'canceled';

    const { error } = await acceptRejectCourse(`/course-request/action/${slug}`, {
      status: statusForCourse,
    });
    if (!error) {
      rejectModal.closeModal();
      setSlug('');
      refetch();
    }
  };
  updateTitle(t('SideNavigation.CourseRequest'));

  return (
    <section className={`${user?.role_name === ROLES.Admin ? '' : 'mt-5'}`}>
      <div
        className={`${
          user?.role_name === ROLES.Admin || user?.role_name === ROLES.SalesRep
            ? ''
            : 'container'
        }`}
      >
        <PageHeader text={t('SideNavigation.CourseRequest')} small isScroll>
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
              {user?.role_name === ROLES.CompanyManager &&
                !hasRequestedStatus &&
                hideButton === false && (
                  <Button
                    disabled={isLoading}
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
        {acceptModal.isOpen && (
          <AcceptModal
            modal={acceptModal}
            slug={slug}
            setSlug={setSlug}
            refetch={refetch}
          />
        )}
      </div>
    </section>
  );
};
export default SalesCourseRequest;
