import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import Button from 'components/Button/Button';
import DownloadFileModal from 'components/DownloadPdfModel/DownloadFile';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import {
  REACT_APP_API_BASE_URL,
  REACT_APP_DATE_FORMAT,
  REACT_APP_DATE_FORMAT_EUROPEAN,
} from 'config';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format } from 'date-fns';
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useRolePermission } from 'hooks/useRolePermission';
import useUpdateQueryParameters from 'hooks/useSearchQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { OrderStatusType } from 'modules/CreditNotes/types';
import 'modules/Quotes/styles/quotes.css';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { formatCurrency, getCurrencySymbol, hasValues, useDebounce } from 'utils';
import '../../components/Layout/components/style/topHeader.css';
import CloseOrderModal from './components/CloseOrderModal';
import FilterOrder from './components/FilterOrder';
import PurchaseOrderReminderModal from './components/PurchaseOrderReminderModal';
import {
  AcademyModalProps,
  InvoiceModalProps,
  InvoiceSubProps,
  OrderFiltersDate,
  OrderProps,
} from './types';

const PARAM_MAPPING = {
  orderType: 'orderType',
  orderStatus: 'orderStatus',
  orderRoleType: 'orderRoleType',
  filterDate: 'filterDate',
  payment_mode: 'payment_mode',
  purchaseOrderType: 'purchaseOrderType',
  clientOrderType: 'clientOrderType',
  fundedByType: 'fundedByType',
  sdiCode: 'sdiCode',
  companies: 'companies',
  issuedBy: 'issuedBy',
};

const OrderListing = () => {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.order'));

  const navigate = useNavigate();
  const deleteModal = useModal();
  const downloadModal = useModal();
  const { currentPage } = useSelector(currentPageSelector);
  const CurrentUser = useSelector(getCurrentUser);
  const [filterModal, setFilterModal] = useState(false);
  const deleteAccess = useRolePermission(FeaturesEnum.Quote, PermissionEnum.Delete);
  const editAccess = useRolePermission(FeaturesEnum.Quote, PermissionEnum.Update);
  const reminderDateModal = useModal();

  const [limit, setLimit] = useState<number>(100);
  const [sort, setSort] = useState<string>('id');
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 500);
  const [generatePdf, { isLoading: pdfDownloading }] = useAxiosGet();
  const [selectedData, setSelectedData] = useState<OrderProps>();
  const [orderSlug, setOrderSlug] = useState('');
  const getCompaniesData = () => {
    const data =
      typeof params.getAll('companies')[0] === 'string'
        ? params.getAll('companies')[0]?.split(',')
        : params.getAll('companies');
    return data?.filter(Boolean).map((i) => i);
  };
  const [orderFilters, setOrderFilters] = useState<OrderFiltersDate>({
    orderType: params.getAll('orderType'),
    orderStatus: params.getAll('orderStatus'),
    orderRoleType: params.getAll('orderRoleType'),
    purchaseOrderType: params.getAll('purchaseOrderType'),
    clientOrderType: params.getAll('clientOrderType'),
    fundedByType: params.getAll('fundedByType'),
    sdiCode: params.getAll('sdiCode'),
    issuedBy: params.getAll('issuedBy'),
    filterDate: params.get('filterDate')
      ? JSON.parse(params.get('filterDate') ?? '{}')
      : { startDate: '', endDate: '' },
    payment_mode: params.get('payment_mode') ?? '',
    companies: getCompaniesData() ?? [],
  });
  const [sendReminder] = useAxiosPost();
  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);
  const {
    response,
    isLoading,
    refetch: reFetchOrder,
  } = useQueryGetFunction('/order', {
    page: currentPage,
    sort,
    search: debouncedSearch,
    limit,
    option: {
      ...(params.has('orderStatus') ? { status: params.getAll('orderStatus') } : {}),
      ...(params.has('orderType') ? { orderType: params.getAll('orderType') } : {}),
      ...(params.has('purchaseOrderType')
        ? { purchaseOrderType: params.getAll('purchaseOrderType') }
        : {}),
      ...(params.has('clientOrderType')
        ? { clientOrderType: params.getAll('clientOrderType') }
        : {}),
      ...(params.has('fundedByType')
        ? { fundedByType: params.getAll('fundedByType') }
        : {}),
      ...(params.has('sdiCode') ? { sdiCode: params.getAll('sdiCode') } : {}),
      ...(params.has('issuedBy') ? { issuedBy: params.getAll('issuedBy') } : {}),
      ...(params.has('orderRoleType')
        ? { type: params.getAll('orderRoleType') }
        : {}),
      ...(params.has('filterDate')
        ? { ...JSON.parse(params.get('filterDate') ?? '{}') }
        : {}),
      ...(params.has('companies') ? { companies: params.getAll('companies') } : {}),
    },
  });

  const isTemplateCheck = useCallback((filters: Record<string, string>) => {
    return Object.values(filters).some((value) => {
      return typeof value === 'object'
        ? Object.values(value).some((item) => !_.isEmpty(item))
        : !_.isEmpty(value);
    });
  }, []);

  useUpdateQueryParameters(orderFilters, PARAM_MAPPING, 'isOrder', isTemplateCheck);

  const columnData: ITableHeaderProps[] = [
    {
      name: 'order_date',
      header: t('Calendar.createEvent.date'),
      option: {
        sort: true,
        hasFilter: false,
      },
      cell: (props) => orderDateRender(props as unknown as OrderProps),
    },
    {
      name: 'order_number',
      header: t('orderNumberTitle'),
      option: {
        sort: true,
        hasFilter: false,
      },
      cell: (props) => OrderRender(props as unknown as OrderProps),
    },

    {
      header: t('Auth.RegisterCompany.companyName'),
      cell: (props) => orderNameRender(props as unknown as OrderProps),
    },
    {
      header: t('filterOrderRoleType'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => orderTypeRender(props as unknown as AcademyModalProps),
    },
    {
      name: 'status',
      header: t('Quote.columnsTitle.status'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => statusRender(props as unknown as OrderProps),
    },
    {
      header: t('orderQuoteNumber'),
      cell: (props) => orderQuoteRender(props as unknown as OrderProps),
    },
    {
      name: 'quotes.total_amount',
      header: t('Quote.company.product.netProductAmountTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => totalAmountRender(props as unknown as OrderProps),
    },
    {
      name: 'company.sdi_code',
      header: t('Quote.company.detail.codeDestTitle'),
      cell: (props: CellProps) => CodeRender(props as unknown as OrderProps),
    },
    {
      header: t('order.PurchaseOrder'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => PurchaseOrderRender(props as unknown as OrderProps),
    },
    {
      header: t('clientPurchaseOrderHeaderTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => clientPurchaseRender(props as unknown as OrderProps),
    },
    {
      header: t('orderReminderHeaderTitle'),
      cell: (props) => dateRender(props as unknown as OrderProps),
    },
    {
      header: t('CompanyManager.fundedByTitle'),
      className: '[&>span]:justify-center',
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => FundedByRender(props as unknown as OrderProps),
    },
    {
      header: t('invoiceNo'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => InvoiceRender(props as unknown as InvoiceModalProps),
    },
    {
      header: t('Table.action'),
      cell: (props: CellProps) => actionRender(props),
    },
  ];

  const totalAmountRender = (item: OrderProps) => {
    return (
      <div className="max-w-40 word-break">
        <p>
          {getCurrencySymbol(item?.quotes?.currency)}{' '}
          {item?.quotes
            ? formatCurrency(Number(item?.netAmount ?? 0), item?.quotes?.currency)
            : formatCurrency(Number(item?.netAmount ?? 0))}
        </p>
      </div>
    );
  };

  const PurchaseOrderRender = (item: OrderProps) => {
    const getStatusClass = () => {
      switch (item?.company?.is_invoice) {
        case true:
          return 'completed';
        case false:
          return 'cancelled';
        default:
          return 'primary';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <div className="flex justify-center w-full">
        <StatusLabel
          text={item?.company?.is_invoice ? 'Yes' : 'No'}
          variants={getStatusClass()}
          className={`${item?.company?.is_invoice ? statusClasses : ''}`}
        />
      </div>
    );
  };

  const CodeRender = (item: OrderProps) => {
    const { company } = item;
    return <div className="max-w-[80px] truncate">{company.sdi_code ?? '-'}</div>;
  };

  const InvoiceRender = (item: InvoiceModalProps) => {
    return (
      <div>
        {item?.invoice?.length > 0 ? (
          <ul className="list-none p-0">
            {item?.invoice.map((data: InvoiceSubProps) => (
              <li key={data.invoice_number}>
                <Link
                  to={`${PRIVATE_NAVIGATION?.invoice?.view?.path}/view/${data.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-[220px] ps-2 hover:underline decoration-blue"
                >
                  {data.invoice_number}
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

  const FundedByRender = (item: OrderProps) => {
    const getStatusClass = () => {
      switch (item?.quotes?.funded_by) {
        case 'Client Management':
          return 'pending';
        case 'Proleven Management':
          return 'secondary';
        case 'Gestione Cliente':
          return 'pending';
        case 'Gestione Proleven':
          return 'secondary';
        default:
          return 'completed';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <div className="flex justify-center w-full">
        {item?.quotes?.funded_by ? (
          <StatusLabel
            text={item?.quotes?.funded_by ?? '-'}
            variants={getStatusClass()}
            className={`${item?.quotes?.funded_by ? statusClasses : ''}`}
          />
        ) : (
          '-'
        )}
      </div>
    );
  };

  const orderDateRender = (item: OrderProps) => {
    return (
      <div className="flex items-center">
        {format(
          new Date(item?.created_at),
          REACT_APP_DATE_FORMAT_EUROPEAN as string
        )}
      </div>
    );
  };

  const orderNameRender = (item: OrderProps) => {
    return (
      <div className="flex items-center">
        <Link
          to={`${PRIVATE_NAVIGATION.clientsManagement.company.list.path}/view/${item?.company?.slug}`}
          target="_blank"
        >
          <div className="max-w-[220px] min-w-[200px] ps-2  hover:underline decoration-blue">
            <p className="text-sm text-dark leading-[1.3]">{item?.company?.name}</p>
          </div>
        </Link>
      </div>
    );
  };

  const orderTypeRender = (item: AcademyModalProps) => {
    return (
      <div className="flex items-center">
        {item?.type === OrderStatusType?.Academic ? 'Academy' : item?.type}
      </div>
    );
  };

  const orderQuoteRender = (item: OrderProps) => {
    return (
      <div className="flex items-center">
        {item?.quotes?.quote_number ? (
          <Link
            to={`${PRIVATE_NAVIGATION.quotes.list.path}/view/${item?.quotes?.slug}`}
            target="_blank"
          >
            <div className="ps-2  hover:underline decoration-blue">
              <p className="text-sm text-dark leading-[1.3]">
                {item?.quotes?.quote_number}
              </p>
            </div>
          </Link>
        ) : (
          <p className="ps-3">-</p>
        )}
      </div>
    );
  };

  const dateRender = (item: OrderProps) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Button
          onClickHandler={() => {
            setSelectedData(item as unknown as OrderProps);
            reminderDateModal?.openModal();
          }}
        >
          {item?.purchase_reminder_date
            ? format(
                new Date(item?.purchase_reminder_date),
                REACT_APP_DATE_FORMAT as string
              )
            : '-'}
        </Button>
      </div>
    );
  };

  const clientPurchaseRender = (item: OrderProps) => {
    return (
      <div>
        {item?.client_purchase_order?.slice(0, 2)?.map((order, index) => {
          const data = index >= 1 ? '...' : '';
          return (
            <div key={order?.order_number}>{`${order?.order_number}${data}`}</div>
          );
        })}
      </div>
    );
  };

  const OrderRender = (item: OrderProps) => {
    return (
      <>
        {/* <p>{item?.order_type}</p> */}
        <span className="font-semibold whitespace-nowrap">{item?.order_number}</span>
      </>
    );
  };

  const statusRender = (item: OrderProps) => {
    const getStatusClass = () => {
      switch (item.status) {
        case 'Open':
          return 'completed';
        case 'Partially Closed':
          return 'primary';
        case 'Closed':
          return 'cancelled';
        default:
          return 'primary';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={item.status ?? '-'}
        variants={getStatusClass()}
        className={`${item.status ? statusClasses : ''}`}
      />
    );
  };

  const DownloadPdf = async (data: string) => {
    const response = await generatePdf(`order/order-pdf`, {
      params: {
        order_slug: orderSlug,
        templateLanguage: data,
      },
    });
    if (response.data) {
      const extractedPath = response.data;
      window.open(`${REACT_APP_API_BASE_URL}/${extractedPath}`, '_blank');
      downloadModal?.closeModal();
    }
  };

  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Button
          parentClass="h-fit"
          className="action-button green-btn"
          onClickHandler={() => {
            navigate(
              `${PRIVATE_NAVIGATION.order.list.path}/view/${item?.slug}${url.search}`
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
        {item?.status !== 'Closed' &&
          item?.type === 'Private' &&
          ((editAccess && CurrentUser?.id === item.created_by) ||
            CurrentUser?.role_name === ROLES.Admin) && (
            <Button
              parentClass="h-fit"
              className="action-button primary-btn"
              onClickHandler={() => {
                const itemSlug = item as unknown as OrderProps;
                navigate(
                  `${PRIVATE_NAVIGATION.invoice.add.path}/${itemSlug?.company?.id}/${itemSlug?.id}`
                );
              }}
              tooltipText="Invoice"
            >
              <Image
                iconName="bookIcon"
                iconClassName="stroke-current w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
          )}

        {item?.status !== 'Closed' &&
          item?.type !== 'Trainer' &&
          item?.client_purchase_order?.length === 0 && (
            <Button
              parentClass="h-fit"
              className="action-button primary-btn"
              onClickHandler={() => {
                sendOrderReminder(item?.id, item?.quote_id);
              }}
              tooltipText={t('Tooltip.OrderReminder')}
            >
              <Image
                iconName="reminderIcon"
                iconClassName="stroke-current w-5 h-5"
              />
            </Button>
          )}
        {item?.status !== 'Closed' &&
          item.type === 'Private' &&
          ((deleteAccess && CurrentUser?.id === item.created_by) ||
            CurrentUser?.role_name === ROLES.Admin) && (
            <Button
              parentClass="h-fit"
              className="action-button red-btn"
              onClickHandler={() => {
                setSelectedData(item as unknown as OrderProps);
                deleteModal?.openModal();
              }}
              tooltipText={t('Tooltip.Closed')}
            >
              <Image
                iconName="crossRoundIcon"
                iconClassName="stroke-current w-5 h-5"
              />
            </Button>
          )}
        <Button
          parentClass="h-fit"
          className="action-button primary-btn"
          onClickHandler={() => {
            downloadModal?.openModal();
            setOrderSlug(item?.slug);
          }}
          tooltipText={t('Tooltip.DownloadPDF')}
        >
          <Image iconName="downloadFile2" iconClassName="stroke-current w-5 h-5" />
        </Button>
      </div>
    );
  };

  const sendOrderReminder = async (orderId: string, quoteId: string) => {
    await sendReminder('/order/reminder', {
      order_id: orderId,
      quote_id: quoteId,
    });
    reFetchOrder();
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

  return (
    <>
      <PageHeader small text={t('SideNavigation.order')} isScroll>
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
                {!_.isEmpty(orderFilters) && hasValues(orderFilters) && (
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
                }  absolute right-0 top-full before:absolute transition-all duration-300`}
              >
                <div className="bg-white rounded-xl top-full shadow-xl w-[340px]">
                  <div className="px-5 py-3.5 border-b border-solid border-offWhite">
                    <h5 className="text-base leading-5 font-semibold text-dark">
                      {t('ProjectManagement.Header.filter')}
                    </h5>
                  </div>
                  <div className="px-5 py-3">
                    <div className="flex flex-col gap-y-3 mt-4">
                      <FilterOrder
                        setFilterModal={setFilterModal}
                        setOrderFilters={setOrderFilters}
                        orderFilters={orderFilters}
                        t={t}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageHeader>

      {deleteModal?.isOpen && (
        <CloseOrderModal
          modal={deleteModal}
          data={selectedData as OrderProps}
          refetchOrder={reFetchOrder}
        />
      )}
      {downloadModal?.isOpen && (
        <DownloadFileModal
          modal={downloadModal}
          handleAccept={(data) => DownloadPdf(data)}
          disabled={pdfDownloading}
        />
      )}
      {reminderDateModal?.isOpen && (
        <PurchaseOrderReminderModal
          modal={reminderDateModal}
          data={selectedData as OrderProps}
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
        quoteTotalSum={response?.data?.netAmount}
      />
    </>
  );
};

export default OrderListing;
