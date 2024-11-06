// ** Components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';

// ** Constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

// ** date-fns **
import { format } from 'date-fns';

// ** Hooks **
import { useQueryGetFunction } from 'hooks/useQuery';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

// ** Types **
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { QuoteResponseValues } from 'modules/Quotes/types';

// ** Slices **
import { REACT_APP_DATE_FORMAT } from 'config';
import { useTitle } from 'hooks/useTitle';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { formatCurrency, getCurrencySymbol } from 'utils';

interface QuoteDetailsProps {
  state: Record<string, string>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}
const QuoteDetails = ({ state, setActiveTab }: QuoteDetailsProps) => {
  const updateTitle = useTitle();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const params = useParams();

  const { currentPage } = useSelector(currentPageSelector);

  // ** States **
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');

  // ** APIs **
  const { response, isLoading } = useQueryGetFunction('/course/quotes', {
    page: currentPage,
    limit,
    sort,
    option: { course_slug: params?.slug },
  });

  const columnData: ITableHeaderProps[] = [
    {
      name: 'quote.quote_number',
      header: t('Quote.columnsTitle.quoteNumber'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Quote.columnsTitle.date'),
      cell: (props) => dateRender(props as unknown as QuoteResponseValues),
    },
    {
      name: 'quote.status',
      header: t('Quote.columnsTitle.status'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => statusRender(props as unknown as QuoteResponseValues),
    },
    {
      name: 'quote.company_name',
      header: t('UserManagement.courseTab.CompanyName'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      // name: 'quote.destination_email',
      header: t('Quote.company.product.netTotalProductAmountTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => totalAmountRender(props as unknown as QuoteResponseValues),
    },
    {
      header: t('Table.action'),
      cell: (props: CellProps) => actionRender(props),
    },
  ];

  const totalAmountRender = (item: QuoteResponseValues) => {
    return (
      <div className="max-w-40 word-break">
        <p>
          {getCurrencySymbol(item?.currency)}{' '}
          {item?.total_amount_without_tax
            ? formatCurrency(Number(item?.total_amount_without_tax), item?.currency)
            : formatCurrency(Number(item?.total_amount), item?.currency)}
        </p>
      </div>
    );
  };

  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Button
          parentClass="h-fit"
          className="action-button green-btn"
          onClickHandler={() => {
            setActiveTab('quotes');
            const itemSlug = item as unknown as QuoteResponseValues;
            navigate(
              `${PRIVATE_NAVIGATION.quotes.list.path}/view/${itemSlug.slug}`,
              {
                state: {
                  ...state,
                  fromCourse: true,
                  url: `/courses/view/${params?.slug}`,
                },
              }
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
      </div>
    );
  };

  const dateRender = (item: QuoteResponseValues) => {
    return (
      <div>
        {item?.date
          ? format(new Date(item?.date), REACT_APP_DATE_FORMAT as string)
          : '-'}
      </div>
    );
  };

  const statusRender = (item: QuoteResponseValues) => {
    const getStatusClass = () => {
      switch (item?.status) {
        case 'approved':
          return 'completed';
        case 'requested':
          return 'pending';
        case 'rejected':
          return 'cancelled';
        default:
          return 'pending';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    updateTitle(t('courseIndex.quotes'));

    return (
      <StatusLabel
        text={item?.status?.toUpperCase()}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };

  return (
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
  );
};

export default QuoteDetails;
