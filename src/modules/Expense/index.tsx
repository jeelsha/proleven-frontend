// ** components **

import Button from 'components/Button/Button';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { REACT_APP_DATE_FORMAT } from 'config';
import { format } from 'date-fns';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import useUpdateQueryParameters from 'hooks/useSearchQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { formatCurrency, getCurrencySymbol, hasValues, useDebounce } from 'utils';
import ExpenseFilter from './components/expenseFilter';
import { ExpenseProps, PaymentStatusType, expenseProps } from './types';

const PARAM_MAPPING = {
  category: 'category',
  name: 'name',
};
const Expense = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.Expense'));

  const url = new URL(window.location.href);
  const params = url.searchParams;
  const { currentPage } = useSelector(currentPageSelector);

  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const navigate = useNavigate();
  const [filterModal, setFilterModal] = useState(false);
  const [expenseFilters, setExpenseFilters] = useState<expenseProps>({
    category: params.getAll('category') ?? [],
    name: params.getAll('name') ?? [],
  });

  const debouncedSearch = useDebounce(search, 500);

  const name = params.getAll('name');

  const category = params.getAll('category');

  const { response, isLoading } = useQueryGetFunction(`/expense`, {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
    option: {
      name,
      category,
    },
  });
  const expensePaidModal = useModal();
  expensePaidModal.modalData = 'hello';
  const isTemplateCheck = useCallback((filters: Record<string, any>) => {
    return Object.values(filters).some((value) => {
      return typeof value === 'object'
        ? Object.values(value).some((item) => !_.isEmpty(item))
        : !_.isEmpty(value);
    });
  }, []);

  useUpdateQueryParameters(
    expenseFilters,
    PARAM_MAPPING,
    'isExpense',
    isTemplateCheck
  );

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
      header: t('Expense.name'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Expense.dueDate'),
      cell: (props) => dateRender(props as unknown as ExpenseProps),
    },
    {
      header: t('Expense.paymentDate'),
      cell: (props) => paymentDateRender(props as unknown as ExpenseProps),
    },
    {
      header: t('Expense.amount'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => amountGross(props as unknown as ExpenseProps),
    },
    {
      name: 'vat_number',
      header: t('Expense.vatNumber'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'role_type',
      header: t('Expense.type'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'status',
      header: t('Expense.markedStatus'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props: CellProps) => statusRender(props as unknown as ExpenseProps),
    },
    {
      header: t('Table.action'),
      cell: (props: CellProps) => actionRender(props),
    },
  ];

  const amountGross = (item: ExpenseProps) => {
    return (
      <div>
        {getCurrencySymbol('EUR')}{' '}
        {formatCurrency(Number(item?.amount_gross), 'EUR')}
      </div>
    );
  };

  const statusRender = (item: ExpenseProps) => {
    const status = item?.status ? item?.status : PaymentStatusType.unpaid;
    const getStatusClass = () => {
      switch (status) {
        case 'paid':
          return 'completed';
        case 'unpaid':
          return 'pending';
        default:
          return 'pending';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={status}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };
  const dateRender = (item: ExpenseProps) => {
    return (
      <div>
        {item?.due_date
          ? format(new Date(item?.due_date), REACT_APP_DATE_FORMAT as string)
          : '-'}
      </div>
    );
  };
  const paymentDateRender = (item: ExpenseProps) => {
    return (
      <div>
        {item?.payment_date
          ? format(new Date(item?.payment_date), REACT_APP_DATE_FORMAT as string)
          : '-'}
      </div>
    );
  };
  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        <Button
          parentClass="h-fit"
          className="action-button green-btn"
          onClickHandler={() => {
            navigate(`/expense/${item?.slug}${url.search}`);
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
  return (
    <>
      <PageHeader small text={t('Expense.title')} isScroll>
        <div className="flex justify-between gap-2">
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
          <div className="relative flex">
            <Button
              onClickHandler={() => {
                setFilterModal(!filterModal);
              }}
              variants="primary"
              className="gap-1 !flex !py-2.5 !px-3.5"
            >
              {!_.isEmpty(expenseFilters) && hasValues(expenseFilters) && (
                <span className="filter-badge" />
              )}
              <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
              {t('Calendar.filterButton')}
            </Button>
            {filterModal && (
              <div
                className={`${
                  filterModal && 'z-1'
                } absolute right-0 top-full before:absolute transition-all duration-300`}
              >
                <div className="bg-white rounded-xl shadow-xl w-[340px]">
                  <div className="px-5 py-3.5 border-b border-solid border-offWhite">
                    <h5 className="text-base leading-5 font-semibold text-dark">
                      {t('ProjectManagement.Header.filter')}
                    </h5>
                  </div>
                  <div className="px-5 py-3">
                    <div className="flex flex-col gap-y-3 mt-4">
                      <ExpenseFilter
                        setFilterModal={setFilterModal}
                        setExpenseFilters={setExpenseFilters}
                        expenseFilters={expenseFilters}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageHeader>

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

export default Expense;
