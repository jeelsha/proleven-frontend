import Button from 'components/Button/Button';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import { ITableHeaderProps } from 'components/Table/types';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';
import { InvoiceStatus } from '../constants';
import { HoldSelectedData, PrivateProductProps, QuoteProductsProps } from '../types';
import HoldModal from './HoldModal';

const PrivateProducts = ({
  t,
  sort,
  setSort,
  limit,
  setLimit,
  search,
}: PrivateProductProps) => {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const holdModal = useModal();
  const [selectedData, setSelectedData] = useState<QuoteProductsProps | undefined>();
  const navigate = useNavigate();
  const user = useSelector(getCurrentUser);
  const { currentPage } = useSelector(currentPageSelector);
  const debouncedSearch = useDebounce(search, 500);

  const {
    response,
    isLoading,
    refetch: ProductRefetch,
  } = useQueryGetFunction('/allProducts', {
    sort,
    limit,
    search: debouncedSearch,
    page: currentPage,
    option: {
      ...(params.has('status') ? { status: params.getAll('status') } : {}),
      ...(params.has('productType')
        ? { productType: params.getAll('productType') }
        : {}),
    },
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
      name: 'title',
      header: t('productName'),
      className: '',
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => courseTitleRender(props as unknown as QuoteProductsProps),
    },
    {
      name: 'codes.code',
      header: t('reports.productCodeTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: '',
      header: t('UserManagement.courseTab.CompanyName'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => companyNameRender(props as unknown as QuoteProductsProps),
    },
    {
      header: t('order.PurchaseOrder'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => PurchaseOrderRender(props as unknown as QuoteProductsProps),
    },

    {
      name: 'codes.course_code_type',
      header: t('productTypeTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('orderNumberTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => orderNumberRender(props as unknown as QuoteProductsProps),
    },
    {
      header: t('clientPurchaseOrderHeaderTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => clientPurchaseRender(props as unknown as QuoteProductsProps),
    },
    {
      name: 'invoice_status',
      header: t('Quote.columnsTitle.status'),
      className: 'max-w-[100px]',
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => statusRender(props as unknown as QuoteProductsProps),
    },
    {
      header: t('Table.action'),
      cell: (item) => actionRender(item as unknown as QuoteProductsProps),
    },
  ];
  const statusRender = (item: QuoteProductsProps) => {
    const getStatusClass = () => {
      switch (item?.invoice_status) {
        case 'Open':
          return 'completed';
        case 'Invoiced':
          return 'primary';
        case 'Completed':
          return 'completed';
        case 'Partially Closed':
          return 'primary';
        case 'Not Completed':
          return 'pending';
        default:
          return 'pending';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={
          item?.invoice_status === InvoiceStatus?.NotCompleted
            ? 'Not Invoiced'
            : item?.invoice_status === InvoiceStatus?.Invoiced
            ? 'Invoiced'
            : item?.invoice_status === InvoiceStatus?.Completed
            ? 'Completed'
            : item?.invoice_status
        }
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };

  const companyNameRender = (item: QuoteProductsProps) => {
    return (
      <Link
        to={`${PRIVATE_NAVIGATION.clientsManagement.company.list.path}/view/${item?.quotes?.company?.slug}`}
        target="_blank"
        className="flex-1"
      >
        <div className="max-w-[220px] min-w-[200px] ps-2  hover:underline decoration-blue ccc">
          {item?.quotes?.company?.name ?? '-'}
        </div>
      </Link>
    );
  };

  const clientPurchaseRender = (item: QuoteProductsProps) => {
    const orders = item?.quotes?.order?.[0]?.client_purchase_order?.slice(0, 2);
    return (
      <div>
        {orders?.map((order, index) => {
          const data = orders?.length === 1 ? '' : index >= 1 ? '...' : ',';
          return (
            <div key={order?.order_number}>{`${order?.order_number}${data}`}</div>
          );
        })}
        {orders?.length === 0 && '-'}
      </div>
    );
  };
  // const courseTitleRender = (item: QuoteProductsProps) => {
  //   const redirectLink = item?.product?.[0]?.course
  //     ? `/courses/view/${item?.product?.[0]?.course?.slug}?status=publish&activeTab=1&type=private&isCourse=true`
  //     : `/courses/template/view/${item?.codes?.courses?.[0]?.slug}?isTemplate=true`;

  //   return (
  //     <Link to={redirectLink} target="_blank" className="flex-1">
  //       <div className="max-w-[220px] ps-2 hover:underline decoration-blue ccc">
  //         {item?.courseQuotes?.title}
  //         {item?.product?.[0]?.course ? (
  //           <>
  //             <p>{item?.title ?? '-'}</p>
  //             <p>
  //               {item.product[0].course.start_date && (
  //                 <>
  //                   <span>(</span>
  //                   <span>
  //                     {format(
  //                       new Date(item.product[0].course.start_date),
  //                       REACT_APP_DATE_FORMAT as string
  //                     )}
  //                   </span>
  //                 </>
  //               )}
  //               {item.product[0].course.start_date &&
  //                 item.product[0].course.end_date && <span>-</span>}
  //               {item.product[0].course.end_date && (
  //                 <>
  //                   <span>
  //                     {format(
  //                       new Date(item.product[0].course.end_date),
  //                       REACT_APP_DATE_FORMAT as string
  //                     )}
  //                   </span>
  //                   <span>)</span>
  //                 </>
  //               )}
  //             </p>
  //           </>
  //         ) : (
  //           <p>{item?.title ?? '-'}</p>
  //         )}
  //       </div>
  //     </Link>
  //   );
  // };

  const courseTitleRender = (item: QuoteProductsProps) => {
    const redirectLink = `/courses/view/${item?.courseQuotes?.slug}?status=publish&activeTab=1&type=private&isCourse=true`;

    return item?.courseQuotes?.slug ? (
      <Link to={redirectLink} target="_blank" className="flex-1">
        <div className="max-w-[220px] ps-2 hover:underline decoration-blue ccc">
          {item?.courseQuotes?.title}
        </div>
      </Link>
    ) : (
      '-'
    );
  };

  const PurchaseOrderRender = (item: QuoteProductsProps) => {
    const getStatusClass = () => {
      switch (item?.quotes?.company?.is_invoice) {
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
          text={item?.quotes?.company?.is_invoice ? 'Yes' : 'No'}
          variants={getStatusClass()}
          className={`${item?.quotes?.company?.is_invoice ? statusClasses : ''}`}
        />
      </div>
    );
  };

  const orderNumberRender = (item: QuoteProductsProps) => {
    return item?.quotes?.order?.[0]?.order_number ? (
      <Link
        to={`${PRIVATE_NAVIGATION.order.list.path}/view/${item?.quotes?.order?.[0]?.slug}`}
        target="_blank"
        className="flex-1"
      >
        <div className="max-w-[220px] min-w-[200px] ps-2  hover:underline decoration-blue ccc">
          {item?.quotes?.order?.[0]?.order_number}
        </div>
      </Link>
    ) : (
      '-'
    );
  };
  const actionRender = (item: QuoteProductsProps) => {
    const isAccessOfHold =
      user?.role_name === ROLES.Admin || user?.role_name === ROLES.Accounting;
    return (
      <div className="flex gap-2 items-center justify-center">
        {item.invoice_status !== InvoiceStatus.Invoiced && (
          <>
            {item.invoice_status === InvoiceStatus.Hold && (
              <Button
                parentClass="h-fit"
                className="action-button green-btn"
                tooltipText={t('Tooltip.Resume')}
                onClickHandler={() => {
                  holdModal.openModal();
                  setSelectedData(item);
                }}
              >
                <Image
                  iconName="bookmarkIcon2"
                  iconClassName="w-5 h-5"
                  width={24}
                  height={24}
                />
              </Button>
            )}
            {item.invoice_status !== InvoiceStatus.Hold &&
              item.invoice_status !== InvoiceStatus.Completed &&
              isAccessOfHold && (
                <Button
                  parentClass="h-fit"
                  className="action-button primary-btn accessdenied-btn"
                  tooltipText="On hold"
                  onClickHandler={() => {
                    holdModal.openModal();
                    setSelectedData(item);
                  }}
                >
                  <Image
                    iconName="accessDeniedIcon"
                    iconClassName="stroke-current w-5 h-5"
                    width={24}
                    height={24}
                  />
                </Button>
              )}
          </>
        )}
        <Button
          parentClass="h-fit"
          className="action-button primary-btn"
          tooltipText={t('Tooltip.View')}
          onClickHandler={() => {
            navigate(`/quote-products/${item.id}${url.search}`);
          }}
        >
          <Image
            iconName="eyeIcon"
            iconClassName="stroke-current w-5 h-5"
            width={24}
            height={24}
          />
        </Button>
        <Button
          parentClass="h-fit"
          className="action-button primary-btn"
          tooltipText={t('Tooltip.ViewInvoice')}
          onClickHandler={() => {
            window.open(
              `/invoice/view/${item?.product[0]?.invoice_product?.slug}`,
              '_blank'
            );
          }}
        >
          <Image
            src="/images/invoice-terms.png"
            imgClassName="w-5 h-5 object-contain invoice-terms-image"
          />
        </Button>
      </div>
    );
  };
  return (
    <div>
      <div className="relative overflow-x-auto sm:rounded-lg">
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
      </div>

      <HoldModal
        modal={holdModal}
        t={t}
        selectedData={selectedData as unknown as HoldSelectedData}
        ProductRefetch={ProductRefetch}
      />
    </div>
  );
};

export default PrivateProducts;
