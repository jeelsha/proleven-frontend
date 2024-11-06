/* eslint-disable no-restricted-syntax */
// ** components ** //
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';
import AddEditCode from 'modules/AtecoCodes/pages/AddEditCode';
import BulkUploadModal from 'modules/UsersManagement/pages/bulkUploadModal';

// ** hooks ** //
import { useAxiosDelete, useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useRolePermission } from 'hooks/useRolePermission';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** constants ** //
import { useBulkUploadMessageConstant } from 'constants/BulkUploadNotes';
import { AtecoCodeBulkUploadObject } from 'constants/BulkUploadStructure';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { ROLES } from 'constants/roleAndPermission.constant';

// ** types ** //
import { CellProps, ITableHeaderProps } from 'components/Table/types';

// ** validation ** //
import { AtecoCodeBulkUploadValidationSchema } from './validation';

// ** utils ** //
import {
  customRandomNumberGenerator,
  useDebounce,
  useHandleExport,
  wait,
} from 'utils';

// ** libraries ** //
import { FormikValues } from 'formik';

// ** redux ** //
import { useTitle } from 'hooks/useTitle';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import { AtecoCode } from './types';

const CodesManagement = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.AtecoCodes'));

  const codeModal = useModal();
  const deleteModal = useModal();
  const bulkUploadModal = useModal();
  const [codeDeleteApi] = useAxiosDelete();
  const [getAllCodes] = useAxiosGet();
  const [bulkUploadCode] = useAxiosPost();
  const { exportDataFunc } = useHandleExport();
  const { currentPage } = useSelector(currentPageSelector);
  const dispatch = useDispatch();

  // ** States ** //
  const [selectedData, setSelectedData] = useState<AtecoCode | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const [codeData, setCodeData] = useState<AtecoCode[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  const user = useSelector(getCurrentUser);

  const deleteAccess = useRolePermission(
    FeaturesEnum.AtecoCode,
    PermissionEnum.Delete
  );
  const updateAccess = useRolePermission(
    FeaturesEnum.AtecoCode,
    PermissionEnum.Update
  );

  const { uploadNotes } = useBulkUploadMessageConstant();

  const columnData: ITableHeaderProps[] = [
    {
      header: t('AtecoCodes.no'),
      name: 'no',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('AtecoCodes.name'),
      name: 'name',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('AtecoCodes.description'),
      name: 'description',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('AtecoCodes.risk'),
      name: 'risk',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('AtecoCodes.ateco_letter'),
      name: 'ateco_letter',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Codes.action'),
      cell: (props) => actionRender(props),
    },
  ];

  // ** API calls ** //
  const { response, isLoading, refetch } = useQueryGetFunction('/ateco-code', {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
  });

  // ** Use Effects ** //
  useEffect(() => {
    if (response?.data?.data) {
      setCodeData(response.data.data);
    }
  }, [response]);

  // ** Action Handlers ** //
  const actionRender = (item: CellProps) => {
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
                setSelectedData(item as unknown as AtecoCode);
                codeModal?.openModal();
              }}
              tooltipText={t('AtecoCodes.edit')}
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
                setSelectedData(item as unknown as AtecoCode);
                deleteModal?.openModal();
              }}
              tooltipText={t('AtecoCodes.delete')}
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
      await codeDeleteApi(`/ateco-code/delete?slug=${selectedData?.slug}`);
      deleteModal.closeModal();
      refetch();
    }
  };

  const handleBulkUpload = async (insertObj: FormikValues) => {
    const resp = await bulkUploadCode('acteo-code/bulkInsert', {
      atecoCodes: insertObj,
    });
    bulkUploadModal.closeModal();
    if (!resp?.error) refetch();
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

  const handleExportData = async () => {
    const resp = await getAllCodes('/acteo-code', {
      params: {
        limit: response?.data?.count ?? limit * currentPage,
      },
    });
    exportDataFunc({
      response: resp?.data?.data,
      exportFor: 'acteo-codes',
    });
  };

  // *** COMPONENTS *** //
  const renderBulkUploadComponent = (): JSX.Element | undefined => {
    return bulkUploadModal?.isOpen ? (
      <BulkUploadModal
        exportFor="acteo-codes"
        formFields={AtecoCodeBulkUploadObject(t)}
        modal={bulkUploadModal}
        validationSchema={AtecoCodeBulkUploadValidationSchema(t)}
        handleBulkUploadSubmit={handleBulkUpload}
        notesForData={[uploadNotes.AllowedCodeCourse, uploadNotes.CodeCourseType]}
      />
    ) : (
      <></>
    );
  };

  const renderCodeModelComponent = (): JSX.Element | undefined => {
    return codeModal?.isOpen ? (
      <AddEditCode
        modal={codeModal}
        data={selectedData}
        setData={setSelectedData}
        refetch={refetch}
      />
    ) : (
      <></>
    );
  };

  const renderDeleteModelComponent = (): JSX.Element | undefined => {
    return deleteModal.isOpen ? (
      <ConfirmationPopup
        modal={deleteModal}
        bodyText={t('Codes.deleteText', { CODE: selectedData?.name })}
        variants="primary"
        confirmButtonText={t('Button.deleteButton')}
        confirmButtonVariant="danger"
        deleteTitle={t('Button.deleteTitle')}
        cancelButtonText={t('Button.cancelButton')}
        cancelButtonFunction={deleteModal.closeModal}
        confirmButtonFunction={handleDelete}
      />
    ) : (
      <></>
    );
  };

  const renderTableComponent = (): JSX.Element | undefined => {
    return (
      <Table
        headerData={columnData}
        bodyData={codeData}
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

  const renderPageHeaderComponent = (): JSX.Element | undefined => {
    return (
      <PageHeader text={t('AtecoCodes.name')} small addSpace isScroll>
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

          {false && (
            <>
              <Button
                variants="whiteBordered"
                onClickHandler={() => handleExportData()}
              >
                <span className="w-5 h-5 inline-block me-2">
                  <Image iconName="exportCsv" iconClassName="w-full h-full" />
                </span>
                {t('PrivateMembers.membersButtons.exportButton')}
              </Button>

              <Button
                variants="whiteBordered"
                onClickHandler={() => {
                  bulkUploadModal.openModal();
                }}
              >
                <span className="w-5 h-5 inline-block me-2">
                  <Image iconName="bulkUpload" iconClassName="w-full h-full" />
                </span>
                {t('PrivateMembers.membersButtons.bulkUploadButton')}
              </Button>
            </>
          )}

          <Button
            variants="primary"
            onClickHandler={() => {
              setSelectedData(null);
              codeModal.openModal();
            }}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="plusIcon" iconClassName="w-full h-full" />
            </span>
            {t('Codes.addCode')}
          </Button>
        </div>
      </PageHeader>
    );
  };

  return (
    <>
      {renderPageHeaderComponent()}
      {renderTableComponent()}
      {renderBulkUploadComponent()}
      {renderCodeModelComponent()}
      {renderDeleteModelComponent()}
    </>
  );
};

export default CodesManagement;
