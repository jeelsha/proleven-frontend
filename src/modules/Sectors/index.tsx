/* eslint-disable no-restricted-syntax */
// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';

// ** hooks **
import { useAxiosDelete } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useRolePermission } from 'hooks/useRolePermission';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** constants **
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { ROLES } from 'constants/roleAndPermission.constant';

// ** types **
import { CellProps, ITableHeaderProps } from 'components/Table/types';

// ** validation **

// ** utils **
import { useDebounce } from 'utils';

// ** libraries **

// ** redux **
import { useTitle } from 'hooks/useTitle';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import AddEditSector from './pages/AddEditSector';
import { ISector } from './types';

const Sector = () => {
  // ** Const
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('sector'));

  const sectorModal = useModal();
  const deleteModal = useModal();

  const [sectorDeleteApi] = useAxiosDelete();

  const { currentPage } = useSelector(currentPageSelector);

  // ** States
  const [selectedData, setSelectedData] = useState<ISector | null>(null);

  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const [sectorData, setSectorData] = useState<ISector[]>([]);

  const debouncedSearch = useDebounce(search, 500);

  // ** API calls
  const { response, isLoading, refetch } = useQueryGetFunction('/sectors', {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
  });

  const user = useSelector(getCurrentUser);

  const deleteAccess = useRolePermission(FeaturesEnum.Sector, PermissionEnum.Delete);
  const updateAccess = useRolePermission(FeaturesEnum.Sector, PermissionEnum.Update);

  // ** Column data
  const columnData: ITableHeaderProps[] = [
    {
      header: t('Codes.no'),
      name: 'no',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('letter'),
      name: 'letter',
      cell: (props) => renderLetter(props),
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('Codes.code'),
      name: 'code',
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
      header: t('Codes.action'),
      cell: (props) => actionRender(props),
    },
  ];

  const renderLetter = (item: CellProps) => {
    return <p className="capitalize">{item?.letter}</p>;
  };
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
                setSelectedData(item as unknown as ISector);
                sectorModal?.openModal();
              }}
              tooltipText={t('Codes.edit')}
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
                setSelectedData(item as unknown as ISector);
                deleteModal?.openModal();
              }}
              tooltipText={t('Codes.delete')}
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
      await sectorDeleteApi(`/sectors/delete?slug=${selectedData?.slug}`);
      deleteModal.closeModal();
      refetch();
    }
  };

  // ** UseEffects
  useEffect(() => {
    if (response?.data?.data) {
      setSectorData(response.data.data);
    }
  }, [response]);

  return (
    <>
      {sectorModal?.isOpen && (
        <AddEditSector
          modal={sectorModal}
          data={selectedData}
          setData={setSelectedData}
          refetch={refetch}
        />
      )}
      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('Codes.deleteText', { CODE: selectedData?.code })}
          variants="primary"
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonVariant="danger"
          deleteTitle={t('Button.deleteTitle')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={deleteModal.closeModal}
          confirmButtonFunction={handleDelete}
        />
      )}
      <PageHeader text={t('sector')} small addSpace isScroll>
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
          <Button
            variants="primary"
            onClickHandler={() => {
              setSelectedData(null);
              sectorModal.openModal();
            }}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="plusIcon" iconClassName="w-full h-full" />
            </span>{' '}
            {t('addSector')}
          </Button>
        </div>
      </PageHeader>
      <Table
        headerData={columnData}
        bodyData={sectorData}
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

export default Sector;
