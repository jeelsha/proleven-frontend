// ** Components
import Button from 'components/Button/Button';
import CourseFilters from 'components/CourseFilter/CourseFilters';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';
import AddEditProfile from 'modules/Profiles/components/AddEditProfile';

// ** Hooks
import { useModal } from 'hooks/useModal';
import { useRolePermission } from 'hooks/useRolePermission';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'utils';

// ** axios
import { useAxiosDelete } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';

// ** Types
import { ITableHeaderProps } from 'components/Table/types';
import { IProfile } from 'modules/Profiles/types';
import { FilterStatus } from 'types/common';

// ** Constants
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { ROLES } from 'constants/roleAndPermission.constant';

// ** Redux
import { useSelector } from 'react-redux';

// ** Slices
import { useTitle } from 'hooks/useTitle';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

const Profile = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.profilesTitle'));

  const modal = useModal();
  const deleteModal = useModal();

  // ** Selector
  const { currentPage } = useSelector(currentPageSelector);
  const user = useSelector(getCurrentUser);

  // ** Access
  const deleteAccess = useRolePermission(
    FeaturesEnum.Profile,
    PermissionEnum.Delete
  );
  const updateAccess = useRolePermission(
    FeaturesEnum.Profile,
    PermissionEnum.Update
  );

  // ** States
  const [selectedData, setSelectedData] = useState<IProfile | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const [filterApply, setFilterApply] = useState<FilterStatus>({ companies: [] });
  const [courseFilter, setCourseFilter] = useState<FilterStatus>({ companies: [] });
  const debouncedSearch = useDebounce(search, 500);

  const columnData: ITableHeaderProps[] = [
    {
      header: t('Codes.no'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('Profiles.title'),
      name: 'job_title',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('Codes.description'),
      name: 'description',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Profiles.company'),
      name: 'company.name',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Codes.action'),
      cell: (props) => actionRender(props as unknown as IProfile),
    },
  ];

  const companies =
    (filterApply?.companies ?? []).length > 0
      ? filterApply?.companies?.join(',')
      : {};

  const { filterDate } = filterApply || {};
  const { startDate, endDate } = filterDate || {};

  // ** APIs
  const [profileDeleteApi] = useAxiosDelete();
  const {
    response,
    isLoading,
    refetch: reFetchProfiles,
  } = useQueryGetFunction('/profile', {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
    option: { companies, ...(startDate && endDate ? { startDate, endDate } : {}) },
  });

  const actionRender = (item: IProfile) => {
    if (
      (updateAccess &&
        Number(user?.id) === Number(item.created_by) &&
        deleteAccess &&
        Number(user?.id) === Number(item.created_by)) ||
      user?.role_name === ROLES.Admin
    ) {
      return (
        <div className="flex gap-2 items-center justify-center ms-auto">
          {((updateAccess && Number(user?.id) === Number(item.created_by)) ||
            user?.role_name === ROLES.Admin) && (
            <Button
              parentClass="h-fit"
              className="action-button primary-btn relative group"
              onClickHandler={() => {
                setSelectedData(item);
                modal.openModal();
              }}
              tooltipText={t('Tooltip.edit')}
            >
              <Image
                iconName="editIcon"
                iconClassName="stroke-current w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
          )}

          {((deleteAccess && Number(user?.id) === Number(item.created_by)) ||
            user?.role_name === ROLES.Admin) && (
            <Button
              parentClass="h-fit"
              className="action-button red-btn relative group"
              onClickHandler={() => {
                setSelectedData(item);
                deleteModal.openModal();
              }}
              tooltipText={t('Tooltip.delete')}
            >
              <Image iconName="deleteIcon" iconClassName="stroke-current w-5 h-5" />
            </Button>
          )}
        </div>
      );
    }
    return <p>-</p>;
  };

  const handleDelete = async () => {
    if (selectedData) {
      await profileDeleteApi(`/profile?slug=${selectedData?.slug}`);
      deleteModal.closeModal();
      reFetchProfiles();
    }
  };

  return (
    <>
      <PageHeader text={t('Profiles.profiles')} small addSpace isScroll>
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

          <CourseFilters
            componentType="profiles"
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            setFilterApply={setFilterApply}
            filterApply={filterApply}
          />
          <Button
            variants="primary"
            onClickHandler={() => {
              setSelectedData(null);
              modal.openModal();
            }}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="plusIcon" iconClassName="w-full h-full" />
            </span>
            {t('Profiles.addProfile')}
          </Button>
        </div>
      </PageHeader>
      <Table
        headerData={columnData}
        bodyData={response?.data?.data ?? []}
        loader={isLoading}
        pagination
        dataPerPage={limit}
        setLimit={setLimit}
        totalPage={response?.data?.lastPage}
        dataCount={response?.data?.count}
        setSort={setSort}
        sort={sort}
      />
      {modal.isOpen ? (
        <AddEditProfile
          modal={modal}
          data={selectedData}
          setData={setSelectedData}
          refetch={reFetchProfiles}
        />
      ) : (
        ''
      )}

      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('Profiles.deleteText', { PROFILE: selectedData?.job_title })}
          variants="primary"
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonVariant="danger"
          deleteTitle={t('Button.deleteTitle')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={deleteModal.closeModal}
          confirmButtonFunction={handleDelete}
        />
      )}
    </>
  );
};

export default Profile;
