import Button from 'components/Button/Button';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import { ITableHeaderProps } from 'components/Table/types';
import { REACT_APP_DATE_FORMAT } from 'config';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { format } from 'date-fns';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';
import {
  AcademicProductsProps,
  AcademicQuoteProductsProps,
  PrivateProductProps,
  QuoteProductsProps,
} from '../types';

const dateRender = (item: AcademicProductsProps, dateType: string) => {
  if (dateType === 'start') {
    return (
      <div>
        {item?.course?.start_date
          ? format(
              new Date(item?.course?.start_date),
              REACT_APP_DATE_FORMAT as string
            )
          : '-'}
      </div>
    );
  }
  return (
    <div>
      {item?.course?.end_date
        ? format(new Date(item?.course?.end_date), REACT_APP_DATE_FORMAT as string)
        : '-'}
    </div>
  );
};

const AcademicProducts = ({
  t,
  sort,
  setSort,
  limit,
  setLimit,
  search,
}: PrivateProductProps) => {
  const { currentPage } = useSelector(currentPageSelector);
  const debouncedSearch = useDebounce(search, 500);

  const { response, isLoading } = useQueryGetFunction('/invoice/academic/product', {
    sort,
    limit,
    search: debouncedSearch,
    page: currentPage,
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
      name: 'course.title',
      header: t('productName'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) =>
        courseTitleRender(props as unknown as AcademicQuoteProductsProps),
    },
    {
      header: t('ClientManagement.courseListing.startDate'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) =>
        dateRender(props as unknown as AcademicProductsProps, 'start'),
    },
    {
      header: t('ClientManagement.courseListing.endDate'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => dateRender(props as unknown as AcademicProductsProps, 'end'),
    },
    {
      // name: 'order.order_number',
      header: t('orderNumberTitle'),
      cell: (props) => orderNumberRender(props as unknown as QuoteProductsProps),
    },
    {
      name: 'invoice_status',
      header: t('Quote.columnsTitle.status'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => statusRender(props as unknown as QuoteProductsProps),
    },
    {
      header: t('Table.action'),
      cell: (item) => actionRender(item as unknown as AcademicQuoteProductsProps),
    },
  ];

  const orderNumberRender = (item: QuoteProductsProps) => {
    return (
      <Link
        to={`${PRIVATE_NAVIGATION.order.list.path}/view/${item?.order?.slug}`}
        target="_blank"
      >
        <div className="max-w-[220px] min-w-[200px] ps-2  hover:underline decoration-blue">
          {item?.order?.order_number ?? '-'}
        </div>
      </Link>
    );
  };

  const courseTitleRender = (item: AcademicQuoteProductsProps) => {
    const redirectLink = item?.course?.slug
      ? `/courses/view/${item?.course?.slug}?status=publish&activeTab=1&type=academy&isCourse=true`
      : `/courses/template/view/${item?.product?.codes?.courses?.[0]?.slug}?isTemplate=true`;
    return (
      <Link to={redirectLink} target="_blank" className="flex-1">
        <div className="max-w-[220px] min-w-[200px] ps-2  hover:underline decoration-blue ccc">
          {item?.course?.title ?? '-'}
        </div>
      </Link>
    );
  };

  const statusRender = (item: QuoteProductsProps) => {
    const getStatusClass = () => {
      switch (item?.invoice_status) {
        case 'Sent':
          return 'completed';
        case 'Partially Closed':
          return 'primary';
        case 'Not Completed':
          return 'pending';
        case 'Completed':
          return 'completed';
        default:
          return 'pending';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={item?.invoice_status}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };

  const actionRender = (item: AcademicQuoteProductsProps) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Button
          parentClass="h-fit"
          className="action-button primary-btn"
          tooltipText={t('Tooltip.ViewInvoice')}
          onClickHandler={() => {
            window.open(`/invoice/view/${item?.invoice_product?.slug}`, '_blank');
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
  );
};

export default AcademicProducts;
