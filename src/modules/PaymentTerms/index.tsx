// ** components **

import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosDelete } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';
import AddPaymentTermsModel from './components/addPaymentTermsModel';
import ViewPaymentTermsModel from './components/viewPaymentTermsModel';
import { PaymentTermsProps } from './types';

const PaymentTerms = () => {
  const { currentPage } = useSelector(currentPageSelector);
  const user = useSelector(getCurrentUser);

  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.paymentTerms'));

  const deleteModal = useModal();
  const addModal = useModal();
  const viewModal = useModal();

  const [selectedData, setSelectedData] = useState<PaymentTermsProps | null>(null);
  const [selectedViewData, setSelectedViewData] = useState<PaymentTermsProps | null>(
    null
  );

  const [paymentTermsDeleteApi] = useAxiosDelete();
  const debouncedSearch = useDebounce(search, 500);

  const {
    response,
    isLoading,
    refetch: reFetchPaymentTerms,
  } = useQueryGetFunction(`/paymentterms`, {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
    // option: {
    //   company_id: companyId,
    // },
  });

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
      name: 'name',
      header: t('Payment.table.title'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'payment_mode',
      header: t('Payment.mode'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Table.action'),
      cell: (props: CellProps) => actionRender(props),
    },
  ];

  const actionRender = (item: CellProps) => {
    const isAccessDelete =
      user?.role_name === ROLES.Admin || user?.role_name === ROLES.Accounting;
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        <Button
          parentClass="h-fit"
          className="action-button green-btn"
          onClickHandler={() => {
            setSelectedViewData(item as unknown as PaymentTermsProps);
            viewModal?.openModal();
          }}
          tooltipText={t('Tooltip.View')}
        >
          <Image
            iconName="eyeIcon"
            iconClassName=" w-5 h-5"
            width={24}
            height={24}
          />
        </Button>
        {isAccessDelete && (
          <Button
            parentClass="h-fit"
            className="action-button red-btn "
            onClickHandler={() => {
              setSelectedData(item as unknown as PaymentTermsProps);
              deleteModal?.openModal();
            }}
            tooltipText={t('Tooltip.Delete')}
          >
            <Image iconName="deleteIcon" iconClassName="w-5 h-5 stroke-current" />
          </Button>
        )}
      </div>
    );
  };
  const handleAddPaymentTerm = () => {
    addModal?.openModal();
  };
  const onDelete = async () => {
    if (selectedData) {
      const response = await paymentTermsDeleteApi(
        `paymentterms/delete/${selectedData?.slug}`
      );
      if (!response.error) deleteModal.closeModal();
      reFetchPaymentTerms();
    }
  };

  return (
    <>
      <PageHeader small text={t('Payment.title')} isScroll>
        <div className=" justify-end flex-wrap flex gap-2">
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
          <Button variants="primary" onClickHandler={handleAddPaymentTerm}>
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="plusSquareIcon" iconClassName="w-full h-full" />
            </span>
            {t('UserManagement.add')}
          </Button>
        </div>
      </PageHeader>
      {viewModal.isOpen && (
        <ViewPaymentTermsModel
          modal={viewModal}
          selectedViewData={selectedViewData}
        />
      )}
      {addModal.isOpen && (
        <AddPaymentTermsModel
          modal={addModal}
          reFetchPaymentTerms={reFetchPaymentTerms}
        />
      )}
      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('paymentTerm.delete', {
            CompanyName: selectedData?.name,
          })}
          variants="primary"
          deleteTitle={t('Button.deleteTitle')}
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonFunction={onDelete}
          confirmButtonVariant="primary"
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            deleteModal.closeModal();
          }}
        />
      )}
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

export default PaymentTerms;
