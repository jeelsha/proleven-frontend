import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Button from 'components/Button/Button';
import DownloadFileModal from 'components/DownloadPdfModel/DownloadFile';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { REACT_APP_API_BASE_URL, REACT_APP_DATE_FORMAT } from 'config';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format } from 'date-fns';
import { useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import useUpdateQueryParameters from 'hooks/useSearchQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import 'modules/Quotes/styles/quotes.css';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { formatCurrency, getCurrencySymbol, hasValues, useDebounce } from 'utils';
import '../../components/Layout/components/style/topHeader.css';
import FilterInvoice from './components/FilterInvoice';
import { CompanyProps, InvoiceProps } from './constants';
import { InvoiceAttributesType, InvoiceFilterType } from './types';

const CompanyNameRender = (item: InvoiceProps) => {
  const { invoice_product } = item;
  const companies = invoice_product
    ?.map((data) => data.company)
    .filter((company) => company !== undefined);
  const uniqueCompanies: CompanyProps[] =
    companies.length > 0
      ? Array.from(new Set(companies.map((company) => JSON.stringify(company)))).map(
          (companyString) => JSON.parse(companyString)
        )
      : [];

  return (
    <div>
      {uniqueCompanies?.length > 0
        ? uniqueCompanies?.map((data) => (
            <div key={data.id} className="flex gap-3">
              <Link
                to={`${PRIVATE_NAVIGATION.clientsManagement.company.list.path}/view/${data?.slug}`}
                target="_blank"
              >
                <div className="max-w-[220px] min-w-[200px] ps-2  hover:underline decoration-blue">
                  <p>{data?.name ?? '-'}</p>
                </div>
              </Link>
            </div>
          ))
        : '-'}
    </div>
  );
};

const OrderRender = ({ invoice_product }: InvoiceProps) => {
  const orderData = invoice_product
    ?.map((data) => ({
      orderNumber: String(data?.order?.order_number),
      slug: String(data?.order?.slug),
    }))
    .filter((data) => data.orderNumber !== undefined && data.slug !== undefined);

  const onlyUnique = (
    value: { orderNumber: string; slug: string },
    index: number,
    array: { orderNumber: string; slug: string }[]
  ) => {
    return (
      array.findIndex((item) => item.orderNumber === value.orderNumber) === index
    );
  };

  const uniqueOrderData = orderData.filter(onlyUnique);
  return (
    <div>
      {uniqueOrderData.length > 0 ? (
        <ul className="list-none p-0 whitespace-nowrap">
          {uniqueOrderData.map((data) => (
            <li key={data.orderNumber}>
              <Link
                to={`${PRIVATE_NAVIGATION.order.list.path}/view/${data.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[220px] ps-2 hover:underline decoration-blue"
              >
                {data.orderNumber}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        '-'
      )}
    </div>
  );
};

const PaymentTermRender = ({ invoice_product }: InvoiceProps) => {
  const paymentData = invoice_product
    ?.map((data) => ({
      paymentName: String(
        data?.payment_terms?.child?.[0]?.name ?? data?.payment_terms?.name
      ),
    }))
    .filter((data) => data.paymentName !== undefined);

  const onlyUnique = (
    value: { paymentName: string },
    index: number,
    array: { paymentName: string }[]
  ) => {
    return (
      array.findIndex((item) => item.paymentName === value.paymentName) === index
    );
  };

  const uniqueOrderData = paymentData.filter(onlyUnique);
  return (
    <div>
      {uniqueOrderData.length > 0 ? (
        <ul className="list-none p-0">
          {uniqueOrderData.map((data) => (
            <li key={data.paymentName}>{data.paymentName}</li>
          ))}
        </ul>
      ) : (
        '-'
      )}
    </div>
  );
};

const DueDateRender = (item: InvoiceProps) => {
  const { due_date } = item;
  return (
    <div>
      <p>{format(new Date(due_date), REACT_APP_DATE_FORMAT as string)}</p>
    </div>
  );
};

const PaymentDateRender = (item: InvoiceProps) => {
  const { payment_date } = item;
  return (
    <div>
      <p>
        {payment_date
          ? format(new Date(payment_date), REACT_APP_DATE_FORMAT as string)
          : '-'}
      </p>
    </div>
  );
};

const DateRender = (item: InvoiceProps) => {
  const { invoice_date } = item;
  return (
    <div>
      <p>{format(new Date(invoice_date), 'dd-MM-yy' as string)}</p>
    </div>
  );
};

const PARAM_MAPPING = {
  invoiceStatus: 'invoiceStatus',
  startDueDate: 'startDueDate',
  endDueDate: 'endDueDate',
  filterDate: 'filterDate',
  paymentStartDate: 'paymentStartDate',
  paymentEndDate: 'paymentEndDate',
  paymentFilterMode: 'paymentFilterMode',
  payment_mode: 'payment_mode',
  salesRep: 'salesRep',
  companies: 'companies',
};

const Invoice = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.invoice'));

  const navigate = useNavigate();
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const { currentPage } = useSelector(currentPageSelector);
  const [filterModal, setFilterModal] = useState(false);
  const downloadModal = useModal();
  const [limit, setLimit] = useState<number>(100);
  const [sort, setSort] = useState<string>('id');
  const [search, setSearch] = useState<string>('');
  const [selectedData, setSelectedData] = useState<InvoiceAttributesType>();
  const [generatePdf, { isLoading: pdfDownloading }] = useAxiosPost();
  const user = useSelector(getCurrentUser);
  const paramsData = useLocation();
  const getSalesRepData = () => {
    const data =
      typeof params.getAll('salesRep')[0] === 'string'
        ? params.getAll('salesRep')[0]?.split(',')
        : params.getAll('salesRep');
    return data?.filter(Boolean).map((i) => Number(i));
  };
  const getCompaniesData = () => {
    const data =
      typeof params.getAll('companies')[0] === 'string'
        ? params.getAll('companies')[0]?.split(',')
        : params.getAll('companies');
    return data?.filter(Boolean).map((i) => i);
  };
  const [invoiceFilters, setInvoiceFilters] = useState<InvoiceFilterType>({
    invoiceStatus: params.getAll('invoiceStatus') ?? [],
    startDueDate: params.get('startDueDate') ?? '',
    endDueDate: params.get('endDueDate') ?? '',
    filterDate: params.get('filterDate')
      ? JSON.parse(params.get('filterDate') ?? '{}')
      : { startDate: '', endDate: '' },
    paymentStartDate: params.get('paymentStartDate') ?? '',
    paymentEndDate: params.get('paymentEndDate') ?? '',
    payment_mode: params.get('payment_mode') ?? '',
    paymentFilterMode: params.get('paymentFilterMode') ?? '',
    salesRep: getSalesRepData() ?? [],
    companies: getCompaniesData() ?? [],
  });
  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);

  const debouncedSearch = useDebounce(search, 500);

  const allRoles = useSelector(getRoles);
  const currentRole = allRoles.find((role) => role.name === ROLES.SalesRep);
  const { response: salesRepResponse } = useQueryGetFunction('/users', {
    option: {
      dropdown: true,
      label: 'full_name',
    },
    role: currentRole?.id.toString(),
  });
  const { response, isLoading } = useQueryGetFunction('/invoice', {
    page: currentPage,
    sort,
    limit,
    search: debouncedSearch,
    option: {
      type: 'invoice',
      ...(params.has('invoiceStatus')
        ? { invoiceStatus: params.getAll('invoiceStatus') }
        : {}),
      ...(params.has('startDueDate')
        ? { startDueDate: params.get('startDueDate') }
        : {}),
      ...(params.has('endDueDate') ? { endDueDate: params.get('endDueDate') } : {}),
      ...(params.has('filterDate')
        ? { ...JSON.parse(params.get('filterDate') ?? '{}') }
        : {}),
      ...(params.has('paymentStartDate')
        ? { paymentStartDate: params.get('paymentStartDate') }
        : {}),
      ...(params.has('paymentEndDate')
        ? { paymentEndDate: params.get('paymentEndDate') }
        : {}),
      ...(params.has('salesRep') ? { salesRepIds: params.getAll('salesRep') } : {}),
      ...(params.has('companies') ? { companies: params.getAll('companies') } : {}),
    },
  });

  const isTemplateCheck = useCallback((filters: Record<string, any>) => {
    return Object.values(filters).some((value) => {
      return typeof value === 'object'
        ? Object.values(value).some((item) => !_.isEmpty(item))
        : !_.isEmpty(value);
    });
  }, []);

  useUpdateQueryParameters(
    invoiceFilters,
    PARAM_MAPPING,
    'isInvoice',
    isTemplateCheck
  );

  const DownloadPdf = async (data: string) => {
    const response = await generatePdf(`invoice/pdf/${selectedData?.slug}`, {
      language: data,
      type: 'invoice',
    });
    if (response.data) {
      const extractedPath = response.data.invoiceFilePath;
      window.open(`${REACT_APP_API_BASE_URL}/${extractedPath}`, '_blank');
      downloadModal?.closeModal();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setFilterModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      name: 'invoice_number',
      header: t('invoiceNo'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'created_at',
      header: 'Date',
      option: {
        sort: false,
        hasFilter: false,
      },
      className: 'w-40',
      cell: (props) => DateRender(props as unknown as InvoiceProps),
    },
    {
      name: 'due_date',
      header: t('dueDate'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => DueDateRender(props as unknown as InvoiceProps),
    },
    {
      name: 'payment_date',
      header: t('invoicePaymentDate'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => PaymentDateRender(props as unknown as InvoiceProps),
    },
    {
      header: t('Auth.RegisterCompany.companyName'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => CompanyNameRender(props as unknown as InvoiceProps),
    },
    {
      name: 'order_number',
      header: t('orderNumberTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => OrderRender(props as unknown as InvoiceProps),
    },
    {
      header: 'Payment Term',
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => PaymentTermRender(props as unknown as InvoiceProps),
    },
    {
      name: 'quotes.total_amount',
      header: t('Quote.company.product.netProductAmountTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => totalAmountRender(props as unknown as InvoiceProps),
    },
    {
      name: 'quotes.total_vat_amount',
      header: t('Quote.company.product.totalPriceTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => totalNetAmountRender(props as unknown as InvoiceProps),
    },
    {
      name: 'payment_status',
      header: t('Quote.columnsTitle.status'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => statusRender(props as unknown as InvoiceProps),
    },
    {
      header: t('Table.action'),
      cell: (props: CellProps) => actionRender(props),
    },
  ];

  const totalNetAmountRender = (item: InvoiceProps) => {
    const vatAmt = item?.quotes?.total_amount_without_tax
      ? (paramsData?.pathname?.includes('invoice')
          ? Number(item?.quotes?.total_amount)
          : Number(item?.quotes?.total_amount_without_tax)) +
        Number(item?.quotes?.total_vat_amount)
      : Number(item?.quotes?.total_amount) + Number(item?.quotes?.total_vat_amount);
    return (
      <div className="max-w-40 word-break">
        <p>
          {getCurrencySymbol(item?.quotes?.currency)}{' '}
          {formatCurrency(Number(vatAmt), item?.quotes?.currency)}
        </p>
      </div>
    );
  };

  const totalAmountRender = (item: InvoiceProps) => {
    return (
      <div className="max-w-40 word-break">
        <p>
          {getCurrencySymbol(item?.quotes?.currency)}{' '}
          {item?.quotes?.total_amount_without_tax
            ? paramsData?.pathname?.includes('invoice')
              ? formatCurrency(
                  Number(item?.quotes?.total_amount ?? 0),
                  item?.quotes?.currency
                )
              : formatCurrency(
                  Number(item?.quotes?.total_amount_without_tax ?? 0),
                  item?.quotes?.currency
                )
            : formatCurrency(
                Number(item?.quotes?.total_amount ?? 0),
                item?.quotes?.currency
              )}
        </p>
      </div>
    );
  };

  const statusRender = (item: InvoiceProps) => {
    const getStatusClass = () => {
      switch (item.payment_status) {
        case 'Sent':
          return 'completed';
        case 'Paid':
          return 'primary';
        case 'Overdue':
          return 'cancelled';
        default:
          return 'primary';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={item.payment_status}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };

  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Button
          parentClass="h-fit"
          className="action-button green-btn"
          onClickHandler={() => {
            navigate(
              `${PRIVATE_NAVIGATION.invoice.view.path}/view/${item?.slug}${url.search}`
            );
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
        {user?.role_name !== ROLES.TrainingSpecialist && (
          <>
            <Button
              parentClass="h-fit"
              className="action-button green-btn"
              onClickHandler={() => {
                navigate(`/credit-notes/${item.slug}`);
              }}
              tooltipText={t('Tooltip.CreditNotes')}
            >
              <Image
                iconName="bookmarkIcon2"
                iconClassName=" w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
            <Button
              parentClass="h-fit"
              className="action-button primary-btn"
              onClickHandler={() => {
                downloadModal?.openModal();
                setSelectedData(item as unknown as InvoiceAttributesType);
              }}
              tooltipText={t('Tooltip.DownloadPDF')}
            >
              <Image
                iconName="downloadFile2"
                iconClassName="stroke-current w-5 h-5"
              />
            </Button>
          </>
        )}
      </div>
    );
  };
  const handleAddInvoice = () => {
    navigate(PRIVATE_NAVIGATION.invoice.add.path, {
      state: {
        isFromInvoice: true,
      },
    });
  };

  return (
    <>
      <PageHeader small text={t('SideNavigation.invoice')} isScroll>
        <div className="flex flex-wrap justify-end gap-2">
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
          <div className="flex relative">
            <div className="relative flex">
              <Button
                onClickHandler={() => {
                  setFilterModal(!filterModal);
                }}
                variants="primary"
                className="gap-1 !flex !py-2.5 !px-3.5"
              >
                {!_.isEmpty(invoiceFilters) && hasValues(invoiceFilters) && (
                  <span className="filter-badge" />
                )}
                <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
                {t('Calendar.filterButton')}
              </Button>
            </div>
            {filterModal && (
              <div
                ref={modalRef}
                className={`${
                  filterModal && 'z-1'
                } absolute  right-0 top-full before:absolute transition-all duration-300`}
              >
                <div className="bg-white rounded-xl shadow-xl w-[340px]">
                  <div className="px-5 py-3.5 border-b border-solid border-offWhite">
                    <h5 className="text-base leading-5 font-semibold text-dark">
                      {t('ProjectManagement.Header.filter')}
                    </h5>
                  </div>
                  <div className="px-5 py-3">
                    <div className="flex flex-col gap-y-3 mt-4">
                      <FilterInvoice
                        setFilterModal={setFilterModal}
                        setInvoiceFilters={setInvoiceFilters}
                        invoiceFilters={invoiceFilters}
                        salesRepResponse={
                          salesRepResponse?.data ? salesRepResponse?.data : []
                        }
                        t={t}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {user?.role_name !== ROLES.TrainingSpecialist && (
            <Button variants="primary" onClickHandler={handleAddInvoice}>
              <span className="w-5 h-5 inline-block me-2">
                <Image iconName="plusSquareIcon" iconClassName="w-full h-full" />
              </span>
              {t('createInvoiceTitle')}
            </Button>
          )}
        </div>
      </PageHeader>

      {downloadModal?.isOpen && (
        <DownloadFileModal
          modal={downloadModal}
          handleAccept={(data) => DownloadPdf(data)}
          disabled={pdfDownloading}
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
        showQuoteSum
        quoteTotalSum={response?.data?.sum}
      />
    </>
  );
};

export default Invoice;
