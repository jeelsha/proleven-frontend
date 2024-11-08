/* eslint-disable no-restricted-syntax */
import _, { get } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

// ** component **
import Button from 'components/Button/Button';
import Switch from 'components/FormElement/Switch';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import StatusFilterComponent from 'modules/UsersManagement/Components/StatusFilter';
import { AddEditUser } from 'modules/UsersManagement/pages/addEditUser';

// ** custom hooks **
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';

// ** constant **
import { Fields } from 'modules/UsersManagement/constants';

import {
  useAxiosDelete,
  useAxiosGet,
  useAxiosPatch,
  useAxiosPost,
} from 'hooks/useAxios';

// ** type **
import { TrainerFilterTypes, User } from 'modules/UsersManagement/types';
import { StatusFields } from 'types/common';

// ** redux **
import SearchComponent from 'components/Table/search';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

// ** utils **
import { wait } from '@testing-library/user-event/dist/utils';
import StatusLabel from 'components/StatusLabel';
import { useBulkUploadMessageConstant } from 'constants/BulkUploadNotes';
import { UserManagementBulkUploadObject } from 'constants/BulkUploadStructure';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { FormikValues } from 'formik';
import { useRolePermission } from 'hooks/useRolePermission';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
// import useUpdateQueryParameters from 'hooks/useSearchQuery';
import useUpdateQueryParameters from 'hooks/useSearchQuery';
import { useTitle } from 'hooks/useTitle';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import {
  convertRoleToUrl,
  customRandomNumberGenerator,
  displayUsers,
  FilterObject,
  formatCurrency,
  getCurrencySymbol,
  useDebounce,
  useHandleExport,
} from 'utils';
import TrainerFilter from './Components/TrainerFilter/TrainerFilter';
import BulkUploadModal from './pages/bulkUploadModal';
import { UserBulkUploadValidationSchema } from './validation';

const UsersManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userModal = useModal();
  const bulkUploadModal = useModal();
  const deleteModal = useModal();
  const { t } = useTranslation();
  const { exportDataFunc } = useHandleExport();
  const { currentPage } = useSelector(currentPageSelector);
  const [userDeleteApi] = useAxiosDelete();
  const [updateUserStatusApi] = useAxiosPatch();
  const { uploadNotes } = useBulkUploadMessageConstant();
  const CurrentUser = useSelector(getCurrentUser);

  const { Status_Fields, Role_Fields, isHead_Fields } = Fields();

  const path = /\/users\/([^/]+)/.exec(location.pathname)?.[1];
  const [getAllUserByRole, { isLoading: exportLoader }] = useAxiosGet();
  const [bulkUploadManager] = useAxiosPost();
  const updateTitle = useTitle();
  const deleteAccess = useRolePermission(
    FeaturesEnum.Trainer,
    PermissionEnum.Delete
  );
  const PARAM_MAPPING = {
    courseCategory: 'category',
    courseSubCategory: 'subCategory',
  };

  const editAccess = useRolePermission(FeaturesEnum.Trainer, PermissionEnum.Update);

  const [selectedData, setSelectedData] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFields[]>(Status_Fields);
  const [isHead, setIsHead] = useState<StatusFields[]>(isHead_Fields);
  const [currentRole, setCurrentRole] = useState(
    Role_Fields.find((role) => convertRoleToUrl(role.key) === path)
  );
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const [userData, setUserData] = useState<User[]>([]);
  const url: URL = new URL(window.location.href);
  const params = url.search;
  const { state } = useLocation();
  const [filterApply, setFilterApply] = useState<TrainerFilterTypes>({
    category: params ? url.searchParams.getAll('courseCategory') : [],
    subCategory: params ? url.searchParams.getAll('courseSubCategory') : [],
  });
  const [courseFilter, setCourseFilter] = useState<TrainerFilterTypes>({
    category: params ? url.searchParams.getAll('courseCategory') : [],
    subCategory: params ? url.searchParams.getAll('courseSubCategory') : [],
  });

  const { language } = useSelector(useLanguage);
  const isTemplateCheck = useCallback((filters: Record<string, string | number>) => {
    return Object.values(filters).some((value) => {
      return typeof value === 'object'
        ? Object.values(value).some((item) => {
            return item && !_.isEmpty(String(item));
          })
        : value && !_.isEmpty(String(value));
    });
  }, []);

  useUpdateQueryParameters(
    filterApply,
    PARAM_MAPPING,
    'isTrainer',
    isTemplateCheck,
    state
  );

  const setParamsToApi = (type: string) => {
    if (params) {
      switch (type) {
        case 'category':
          return url.searchParams.getAll('courseCategory');
        case 'subCategory':
          return url.searchParams.getAll('courseSubCategory');
        default:
          return {};
      }
    }
  };
  const courseCategory = setParamsToApi('category');
  const courseSubCategory = setParamsToApi('subCategory');
  const findDisplayLabel = (roleName: string) => {
    const user = displayUsers.find((user) => user.value === roleName);
    return user ? user.label : roleName;
  };

  updateTitle(findDisplayLabel(currentRole?.title ?? ''));

  const statusRender = (item: string) => {
    switch (item) {
      case t('Status.active')?.toUpperCase():
        return 'completed';
      case t('Status.inactive')?.toUpperCase():
        return 'pending';
      case t('isHead.yes')?.toUpperCase():
        return 'completed';
      case t('isHead.no')?.toUpperCase():
        return 'pending';

      default:
        return 'completed';
    }
  };

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
      header: t('UserManagement.columnHeader.name'),
      name: 'full_name',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('UserManagement.columnHeader.emailId'),
      name: 'email',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('UserManagement.addEditUser.contact'),
      name: 'contact',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('UserManagement.addEditUser.status'),
      name: 'active',
      className: '',
      option: {
        sort: false,
        hasFilter: true,
      },
      filterComponent: (
        <StatusFilterComponent
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          title={t('UserManagement.addEditUser.status')}
        />
      ),
      cell: (props) => {
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            {(editAccess &&
              CurrentUser?.id ===
                (props as unknown as Record<string, string>)?.added_by) ||
            CurrentUser?.role_name === ROLES.Admin ? (
              <Switch
                checked={get(props, 'active') === 'ACTIVE'}
                onChangeHandler={() => handleStatusChange(props)}
              />
            ) : (
              <StatusLabel
                variants={statusRender(
                  (props as unknown as Record<string, string>)?.active === 'ACTIVE'
                    ? t('Status.active')?.toUpperCase()
                    : t('Status.inactive')?.toUpperCase()
                )}
                text={
                  (props as unknown as Record<string, string>)?.active === 'ACTIVE'
                    ? t('Status.active')?.toUpperCase()
                    : t('Status.inactive')?.toUpperCase()
                }
              />
            )}
          </label>
        );
      },
    },
    {
      header: t('UserManagement.addEditUser.rating'),
      name: 'trainer.rate_by_admin',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Trainer.invoice.trainerLocation'),
      name: 'trainer.location',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Trainer.invoice.trainerHourlyRate'),
      name: 'trainer.hourly_rate',
      cell: (props: CellProps) => hourlyRate(props as unknown as User),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('UserManagement.addEditUser.category'),
      name: 'category',
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props: CellProps) => categoryNames(props),
    },
    {
      header: t('UserManagement.addEditUser.subCategory'),
      name: 'subCategory',
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props: CellProps) => subCategoryNames(props),
    },
    {
      name: 'is_head',
      className: '',
      option: {
        sort: false,
        hasFilter: true,
      },
      filterComponent: (
        <StatusFilterComponent
          statusFilter={isHead}
          setStatusFilter={setIsHead}
          title={t('UserManagement.addEditUser.departHead')}
        />
      ),
      cell: (props: CellProps) => {
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            {(editAccess &&
              CurrentUser?.id ===
                (props as unknown as Record<string, string>)?.added_by) ||
            CurrentUser?.role_name === ROLES.Admin ? (
              <Switch
                checked={Boolean(get(props, 'is_head')) === true}
                onChangeHandler={() => handleIsHeadChange(props)}
              />
            ) : (
              <StatusLabel
                variants={statusRender(
                  (props as unknown as Record<string, string>)?.is_head
                    ? t('isHead.yes')?.toUpperCase()
                    : t('isHead.no')?.toUpperCase()
                )}
                text={
                  (props as unknown as Record<string, string>)?.is_head
                    ? t('isHead.yes')?.toUpperCase()
                    : t('isHead.no')?.toUpperCase()
                }
              />
            )}
          </label>
        );
      },
    },

    {
      header: t('Codes.action'),
      cell: (props) => actionRender(props),
    },
  ];

  let newColumnData = [...columnData];
  if (currentRole?.key === ROLES.Trainer) {
    newColumnData = newColumnData.filter((i) => i.name !== 'is_head');
  }
  if (currentRole?.key !== ROLES.Trainer) {
    newColumnData = newColumnData.filter(
      (i) =>
        ![
          'trainer.rate_by_admin',
          'category',
          'subCategory',
          'trainer.location',
          'trainer.hourly_rate',
        ].includes(i.name as string)
    );
  }

  const categoryNames = (props: CellProps) => {
    const data = props as unknown as User;
    if (_.isEmpty(data.trainer?.trainerSubCategory)) {
      return '-';
    }
    const categoryName =
      data?.trainer?.trainerSubCategory?.map((item) => {
        return item?.sub_category?.category?.name;
      }) || [];
    const uniqueCategoryNames = [...new Set(categoryName)];
    return !_.isEmpty(uniqueCategoryNames) && uniqueCategoryNames.length > 0
      ? uniqueCategoryNames.join(',').toString()
      : '-';
  };
  const subCategoryNames = (props: CellProps) => {
    const data = props as unknown as User;
    if (_.isEmpty(data.trainer?.trainerSubCategory)) {
      return '-';
    }
    const subCategoryName =
      data?.trainer?.trainerSubCategory?.map((item) => {
        return item?.sub_category?.name;
      }) || [];
    const uniqueSubCategoryNames = [...new Set(subCategoryName)];
    return !_.isEmpty(uniqueSubCategoryNames) && uniqueSubCategoryNames.length > 0
      ? uniqueSubCategoryNames.join(',').toString()
      : '-';
  };

  const hourlyRate = (props: User) => {
    const hourlyRate = Number(props?.trainer?.hourly_rate);
    if (hourlyRate)
      return `${getCurrencySymbol('EUR')} ${formatCurrency(hourlyRate, 'EUR')}`;
    return '-';
  };

  const debouncedSearch = useDebounce(search, 500);

  const status = statusFilter
    .filter((item) => item.isChecked === true)
    .map((item) => item.key);
  const departHead = isHead
    .filter((item) => item.isChecked === true)
    .map((item) => item.key);

  const {
    response,
    isLoading,
    refetch: reFetchUsers,
  } = useQueryGetFunction(
    '/users',
    {
      page: currentPage,
      limit,
      sort,
      role: `${currentRole?.id}`,
      search: debouncedSearch,
      option: {
        ...(statusFilter.filter((item) => item.isChecked === true).length > 0
          ? { status: status.join(',') }
          : {}),
        ...(isHead.filter((item) => item.isChecked === true).length > 0
          ? { is_head: departHead.join(',') }
          : {}),
        ignore_is_active: true,
        ...(currentRole?.key === ROLES.Trainer
          ? {
              courseCategory,
              courseSubCategory,
            }
          : {}),
      },
    },
    {},
    true
  );

  useEffect(() => {
    const getCurrentRole = Role_Fields.find((role) => {
      return convertRoleToUrl(role.key) === path;
    });
    if (getCurrentRole) {
      setCurrentRole(getCurrentRole);
    } else {
      navigate(PRIVATE_NAVIGATION.notFoundPage);
    }
  }, [path]);

  useEffect(() => {
    if (JSON.stringify(statusFilter) !== JSON.stringify(Status_Fields)) {
      setStatusFilter(Status_Fields);
    }
    if (limit !== 10) {
      setLimit(10);
    }
    if (sort !== '-updated_at') {
      setSort('-updated_at');
    }
    if (search !== '') {
      setSearch('');
    }
  }, [currentRole?.id]);

  useEffect(() => {
    if (response?.data?.data) {
      setUserData(response.data.data);
    }
  }, [response]);

  useEffect(() => {
    reFetchUsers();
  }, [language]);

  const handleExportData = async () => {
    const resp = await getAllUserByRole('/users', {
      params: {
        role: `${currentRole?.id}`,
        view: true,
        ignore_is_active: true,
      },
    });
    if (currentRole) {
      exportDataFunc({
        response: resp?.data?.data,
        currentRole,
        exportFor: 'user',
      });
    }
  };
  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        <Button
          onClickHandler={() => {
            navigate(
              `/users/${convertRoleToUrl(String(currentRole?.key))}/${
                (item as unknown as User)?.username
              }`
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
        {((editAccess && CurrentUser?.id === item.added_by) ||
          CurrentUser?.role_name === ROLES.Admin) && (
          <Button
            parentClass="h-fit"
            className="action-button primary-btn relative group"
            onClickHandler={() => {
              setSelectedData(item as unknown as User);
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
        {((deleteAccess && CurrentUser?.id === item.added_by) ||
          CurrentUser?.role_name === ROLES.Admin) && (
          <Button
            parentClass="h-fit"
            className="action-button red-btn relative group"
            onClickHandler={() => {
              setSelectedData(item as unknown as User);
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

  const handleStatusChange = async (item: CellProps) => {
    if (
      item &&
      ((editAccess && CurrentUser?.id === item.added_by) ||
        CurrentUser?.role_name === ROLES.Admin)
    ) {
      const user = item as unknown as User;
      const updatedUser = {
        ...user,
        active: user.active === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        role: user.role.id,
      };
      const { username, active, role } = updatedUser;
      if (username) {
        const tempUserData = [...userData];
        const index = tempUserData?.findIndex(
          (findUser: User) => findUser?.id === user?.id
        );
        tempUserData[index] = { ...user, active: updatedUser.active } as User;
        const resp = await updateUserStatusApi(`/users/${username}`, {
          active,
          role,
        });
        if (resp.data) {
          setUserData(tempUserData);
        }
      }
    } else {
      dispatch(
        setToast({
          variant: 'Error',
          message: `${t('userEdit.access')}`,
          type: 'error',
          id: customRandomNumberGenerator(),
        })
      );
    }
  };
  const handleIsHeadChange = async (item: CellProps) => {
    if (
      item &&
      ((editAccess && CurrentUser?.id === item.added_by) ||
        CurrentUser?.role_name === ROLES.Admin)
    ) {
      const user = item as unknown as User;
      const updatedUser = {
        ...user,
        is_head: user.is_head !== true,
        role: user.role.id,
      };
      const { username, is_head, role } = updatedUser;
      if (username) {
        const tempUserData = [...userData];
        const index = tempUserData?.findIndex(
          (findUser: User) => findUser?.id === user?.id
        );
        tempUserData[index] = { ...user, is_head: updatedUser.is_head } as User;
        const resp = await updateUserStatusApi(`/users/${username}`, {
          is_head,
          role,
        });
        if (resp.data) {
          setUserData(tempUserData);
        }
      }
    } else {
      dispatch(
        setToast({
          variant: 'Error',
          message: `${t('userEdit.access')}`,
          type: 'error',
          id: customRandomNumberGenerator(),
        })
      );
    }
  };

  const handleDelete = async () => {
    if (selectedData) {
      await userDeleteApi(
        `/users/${selectedData?.username}?role=${currentRole?.id}`
      );
      deleteModal.closeModal();
      reFetchUsers();
    }
  };

  const dispatch = useDispatch();

  const handleBulkUpload = async (insertObj: FormikValues) => {
    const newInsert = [...(insertObj as FormikValues[])];
    const resp = await bulkUploadManager('users/bulkInsert', {
      role: Number(currentRole?.id),
      users: newInsert.map((item) => {
        const singleInsert = item;
        return singleInsert;
      }),
    });
    bulkUploadModal.closeModal();
    if (!resp?.error) reFetchUsers();
    if (resp?.error && resp?.data && Object.keys(resp?.data)?.length > 0) {
      for (const errorMessage of resp?.data?.split(', ') ?? []) {
        if (errorMessage) {
          dispatch(
            setToast({
              variant: 'Error',
              message: errorMessage,
              type: 'error',
              id: customRandomNumberGenerator(),
            })
          );
          // eslint-disable-next-line no-await-in-loop
          await wait(0);
        }
      }
    }
  };

  return (
    <>
      {userModal?.isOpen && (
        <AddEditUser
          role={currentRole}
          modal={userModal}
          data={selectedData}
          setData={setSelectedData}
          refetch={reFetchUsers}
        />
      )}

      {currentRole ? (
        <BulkUploadModal
          currentRole={currentRole}
          exportFor="user"
          formFields={UserManagementBulkUploadObject(currentRole, t)}
          modal={bulkUploadModal}
          validationSchema={UserBulkUploadValidationSchema(currentRole?.title)}
          handleBulkUploadSubmit={handleBulkUpload}
          notesForData={[
            uploadNotes.email,
            uploadNotes.mobileNumber,
            uploadNotes.DepartHead,
          ]}
        />
      ) : (
        ''
      )}

      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('UserManagement.addEditUser.deleteText', {
            ROLE: currentRole?.title.replace(/([A-Z])/g, ' $1'),
            EMAIL: selectedData?.email,
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
      <PageHeader
        className=""
        text={
          currentRole?.title !== 'Accounting'
            ? currentRole?.title
            : t('UserManagement.Accounting.Specialist')
        }
        small
        addSpace
        isScroll
      >
        <div className="flex justify-end gap-2 flex-wrap">
          <div className="w-full 1024:w-auto">
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
          {currentRole?.key === ROLES.Trainer ? (
            <TrainerFilter
              courseFilter={courseFilter}
              setCourseFilter={setCourseFilter}
              setFilterApply={setFilterApply}
              filterApply={filterApply as unknown as FilterObject}
            />
          ) : (
            ''
          )}
          <Button
            className=""
            variants="whiteBordered"
            isLoading={exportLoader}
            onClickHandler={() => handleExportData()}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="exportCsv" iconClassName="w-full h-full" />
            </span>
            {t('UserManagement.addEditUser.export')}
          </Button>

          <Button
            className=""
            variants="whiteBordered"
            onClickHandler={() => {
              bulkUploadModal.openModal();
            }}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="bulkUpload" iconClassName="w-full h-full" />
            </span>
            {t('UserManagement.addEditUser.bulkUpload')}
          </Button>

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
            {`${t('UserManagement.add')}  ${
              currentRole?.title !== 'Accounting'
                ? currentRole?.title.replace(/([A-Z])/g, ' $1')
                : t('UserManagement.Accounting.Specialist')
            }`}
          </Button>
        </div>
      </PageHeader>
      <Table
        headerData={newColumnData}
        bodyData={userData}
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

export default UsersManagement;
