import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosDelete } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useRolePermission } from 'hooks/useRolePermission';
import { useTitle } from 'hooks/useTitle';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';
import { AddEditRoom } from './AddEditRoom';

const CourseRoom = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle()
  updateTitle(t('SideNavigation.coursesRoom'))

  const { currentPage } = useSelector(currentPageSelector);
  const userModal = useModal();
  const deleteModal = useModal();
  const [selectedData, setSelectedData] = useState<Record<string, string> | null>(
    null
  );
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const [showRender, setShowRender] = useState(true);
  const CurrentUser = useSelector(getCurrentUser);

  const debouncedSearch = useDebounce(search, 500);
  const [resourcesDeleteApi] = useAxiosDelete();

  const deleteAccess = useRolePermission(
    FeaturesEnum.CourseInvitations,
    PermissionEnum.Delete
  );

  const editAccess = useRolePermission(
    FeaturesEnum.CourseInvitations,
    PermissionEnum.Update
  );

  const { response, isLoading, refetch } = useQueryGetFunction('/room', {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
  });
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
      header: t('Calendar.createEvent.topic'),
      name: 'title',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.CreateCourse.maxParticipants'),
      name: 'maximum_participate',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    ...(showRender
      ? [
        {
          header: t('Table.action'),
          cell: (props: CellProps) => actionRender(props),
        },
      ]
      : []),
  ];

  const actionRender = (item: CellProps) => {
    if (CurrentUser?.role_name !== ROLES.Admin && (editAccess || deleteAccess)) {
      if (CurrentUser?.id !== item.created_by) {
        setShowRender(false);
      }
    }

    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        {((editAccess && CurrentUser?.id === item.created_by) ||
          CurrentUser?.role_name === ROLES.Admin) && (
            <Button
              parentClass="h-fit"
              className="action-button primary-btn"
              onClickHandler={() => {
                setSelectedData(item as Record<string, string>);
                userModal?.openModal();
              }}
              tooltipText={t('Tooltip.Edit')}
            >
              <Image
                iconName="editIcon"
                iconClassName="stroke-current w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
          )}
        {((deleteAccess && CurrentUser?.id === item.created_by) ||
          CurrentUser?.role_name === ROLES.Admin) && (
            <Button
              parentClass="h-fit"
              className="action-button red-btn"
              onClickHandler={() => {
                setSelectedData(item as Record<string, string>);
                deleteModal?.openModal();
              }}
              tooltipText={t('Tooltip.Delete')}
            >
              <Image iconName="deleteIcon" iconClassName="stroke-current w-5 h-5" />
            </Button>
          )}
      </div>
    );
  };

  const handleDelete = async () => {
    if (selectedData) {
      const { error } = await resourcesDeleteApi(`/room/${selectedData?.slug}`);

      if (!error) {
        setSelectedData(null);
        refetch();
      }
      deleteModal.closeModal();
    }
  };

  return (
    <>
      {userModal?.isOpen && (
        <AddEditRoom
          modal={userModal}
          data={selectedData}
          setData={setSelectedData}
          refetch={refetch}
        />
      )}
      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('CoursesManagement.Errors.Course.deleteResourcesText', {
            RESOURCE: selectedData?.title,
          })}
          variants="primary"
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonVariant="danger"
          deleteTitle={t('Button.deleteTitle')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={deleteModal.closeModal}
          confirmButtonFunction={handleDelete}
        />
      )}
      <PageHeader text={t('room')} small isScroll>
        <div className="flex justify-end gap-2 flex-wrap">
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

          {CurrentUser?.role_name === ROLES.Admin ? (
            <Button
              variants="primary"
              onClickHandler={() => {
                setSelectedData(null);
                userModal.openModal();
              }}
            >
              <span className="w-5 h-5 inline-block me-2">
                <Image iconName="userGroupStrokeSD" iconClassName="w-full h-full" />
              </span>
              {`${t('UserManagement.add')} ${t('room')}`}
            </Button>
          ) : (
            ''
          )}
        </div>
      </PageHeader>
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
    </>
  );
};

export default CourseRoom;
