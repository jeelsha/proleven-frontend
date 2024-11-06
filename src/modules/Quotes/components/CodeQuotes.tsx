import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import { ITableHeaderProps } from 'components/Table/types';
import { REACT_APP_DATE_FORMAT } from 'config';
import { format } from 'date-fns';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { QuoteStatusEnum } from '../constants';
import { CodeQuotesProps, CodeResponseProps } from '../types';

const CodeQuotes = ({ t, codeId, companyId }: CodeQuotesProps) => {
  const [limit, setLimit] = useState<number>(5);
  const [sort, setSort] = useState<string>('-updated_at');
  const { response: codeQuotesResponse, isLoading: isQuotesLoading } =
    useQueryGetFunction('/quotes/code', {
      sort,
      limit,
      option: { codeId, companyId, removePaginatedParams: true },
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
      name: 'quotes.quote_number',
      header: t('Quote.columnsTitle.quoteNumber'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => renderQuoteNumber(props as unknown as CodeResponseProps),
    },
    {
      name: 'title',
      header: t('Quote.company.product.nameTitle'),
    },
    {
      name: 'price',
      header: t('CoursesManagement.CreateCourse.price'),
      cell: (props) => renderPrice(props as unknown as CodeResponseProps),
    },
    {
      header: t('Quote.columnsTitle.date'),
      cell: (props) => dateRender(props as unknown as CodeResponseProps),
    },
    {
      name: 'status',
      header: t('Quote.columnsTitle.status'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => statusRender(props as unknown as CodeResponseProps),
    },
  ];
  const statusRender = (item: CodeResponseProps) => {
    const getStatusClass = () => {
      switch (item?.quotes?.status) {
        case QuoteStatusEnum.approved:
          return 'completed';
        case QuoteStatusEnum.requested:
          return 'pending';
        case QuoteStatusEnum.rejected:
          return 'cancelled';
        default:
          return 'pending';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={item?.quotes?.status}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };
  const dateRender = (item: CodeResponseProps) => {
    return (
      <div>
        {item?.created_at
          ? format(new Date(item?.created_at), REACT_APP_DATE_FORMAT as string)
          : '-'}
      </div>
    );
  };

  const renderPrice = (item: CodeResponseProps) => {
    return item?.price ? (
      <div>
        {getCurrencySymbol(item?.quotes?.currency) + formatCurrency(item?.price)}
      </div>
    ) : (
      <div>-</div>
    );
  };
  const renderQuoteNumber = (item: CodeResponseProps) => {
    return item?.price ? (
      <Link
        to={`/quotes/view/${item?.quotes?.slug}`}
        target="_blank"
        className="flex-1"
      >
        <div className="max-w-[220px] min-w-[200px] ps-2  hover:underline decoration-blue">
          <p className="text-sm text-dark leading-[1.3]">
            {item?.quotes?.quote_number}
          </p>
        </div>
      </Link>
    ) : (
      <div>-</div>
    );
  };
  return (
    <div>
      {codeQuotesResponse?.data?.length > 0 && (
        <div className="mt-5">
          <p className="font-semibold text-xl pl-3">{t('Quote.previousQuotes')}</p>
          <Table
            headerData={columnData}
            bodyData={codeQuotesResponse?.data}
            loader={isQuotesLoading}
            dataPerPage={limit}
            setLimit={setLimit}
            setSort={setSort}
            sort={sort}
          />
        </div>
      )}
    </div>
  );
};
export default CodeQuotes;
