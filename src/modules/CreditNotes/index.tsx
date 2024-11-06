import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Button from 'components/Button/Button';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { useQueryGetFunction } from 'hooks/useQuery';

import DownloadFileModal from 'components/DownloadPdfModel/DownloadFile';
import Image from 'components/Image';
import SearchComponent from 'components/Table/search';
import { REACT_APP_API_BASE_URL, REACT_APP_DATE_FORMAT } from 'config';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { format } from 'date-fns';
import { useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import useUpdateQueryParameters from 'hooks/useSearchQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { FilterApplyProps, InvoiceProps } from 'modules/CreditNotes/types';
import 'modules/Quotes/styles/quotes.css';
import { Link } from 'react-router-dom';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { formatCurrency, getCurrencySymbol, hasValues, useDebounce } from 'utils';
import '../../components/Layout/components/style/topHeader.css';
import FilterCreditNote from './FilterCreditNote';

const DateRender = (item: InvoiceProps) => {
  const { created_at } = item;
  return (
    <div>
      <p>{format(new Date(created_at), REACT_APP_DATE_FORMAT as string)}</p>
    </div>
  );
};

const CreditPriceRender = (item: InvoiceProps) => {
  const { credit_price } = item;
  return (
    <div>
      <p>
        -{getCurrencySymbol(item?.quote_product?.quotes?.currency)}{' '}
        {formatCurrency(
          Number(credit_price),
          item?.quote_product?.quotes?.currency
        ) ?? 0}
      </p>
    </div>
  );
};

const CompanyNameRender = (item: InvoiceProps) => {
  const { company } = item;

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12">
        <Image src={company.logo} serverPath />
      </div>
      <p>{company.name}</p>
    </div>
  );
};

const PARAM_MAPPING = {
  startDate: 'startDate',
  endDate: 'endDate',
};

const CreditNotes = () => {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.creditNotes'));

  const { currentPage } = useSelector(currentPageSelector);
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [filterApply, setFilterApply] = useState<FilterApplyProps>({
    startDate: params.get('startDate') ?? '',
    endDate: params.get('endDate') ?? '',
  });
  const [search, setSearch] = useState<string>('');
  const [filterModal, setFilterModal] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [selectedData, setSelectedData] = useState<InvoiceProps>();
  const downloadModal = useModal();
  const [generatePdf] = useAxiosPost();

  const { response, isLoading } = useQueryGetFunction('/credit-notes', {
    page: currentPage,
    sort,
    search: debouncedSearch,
    option: {
      startDate: params.get('startDate'),
      endDate: params.get('endDate'),
    },
  });

  const isTemplateCheck = useCallback((filters: Record<string, any>) => {
    return Object.values(filters).some((value) => {
      return typeof value === 'object'
        ? Object.values(value).some((item) => !_.isEmpty(item))
        : !_.isEmpty(value);
    });
  }, []);

  useUpdateQueryParameters(filterApply, PARAM_MAPPING, 'isCredit', isTemplateCheck);

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
      name: 'credit_number',
      header: t('creditNoteNo'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'invoice.invoice_number',
      header: t('invoiceNo'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => CreditNoteRender(props as unknown as InvoiceProps),
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
      name: 'order.order_number',
      header: t('orderNumberTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => OrderRender(props as unknown as InvoiceProps),
    },
    {
      name: 'created_at',
      header: t('Calendar.createEvent.date'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => DateRender(props as unknown as InvoiceProps),
    },
    {
      name: 'credit_price',
      header: t('creditPrice'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => CreditPriceRender(props as unknown as InvoiceProps),
    },
    {
      header: t('Table.action'),
      cell: (props: CellProps) => actionRender(props),
    },
  ];

  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Button
          parentClass="h-fit"
          className="action-button primary-btn"
          onClickHandler={() => {
            downloadModal?.openModal();
            setSelectedData(item as unknown as InvoiceProps);
          }}
          tooltipText={t('Tooltip.DownloadPDF')}
        >
          <Image iconName="downloadFile2" iconClassName="stroke-current w-5 h-5" />
        </Button>
        <Link
          to={`${PRIVATE_NAVIGATION.creditNotes.list.path}/${
            item?.invoice_slug as unknown as string
          }`}
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-[220px] ps-2 hover:underline decoration-blue"
        >
          <Button
            parentClass="h-fit"
            className="action-button primary-btn relative group"
            tooltipText={t('AtecoCodes.edit')}
          >
            <Image
              iconName="editIcon"
              iconClassName="stroke-current w-5 h-5"
              width={24}
              height={24}
            />
          </Button>
        </Link>
      </div>
    );
  };
  const DownloadPdf = async (data: string) => {
    const response = await generatePdf(
      `invoice/pdf/${selectedData?.invoice?.slug}`,
      {
        language: data,
        type: 'credit_note',
        ...(selectedData?.course_id ? { course_id: selectedData?.course_id } : {}),
        ...(selectedData?.product_id
          ? { product_id: selectedData?.product_id }
          : {}),
      }
    );
    if (response.data) {
      const extractedPath = response.data.invoiceFilePath;
      window.open(`${REACT_APP_API_BASE_URL}/${extractedPath}`, '_blank');
      downloadModal?.closeModal();
    }
  };
  const OrderRender = (data: InvoiceProps) => {
    return (
      <div>
        <Link
          to={`${PRIVATE_NAVIGATION.order.list.path}/view/${data?.order?.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-[220px] ps-2 hover:underline decoration-blue"
        >
          {data?.order?.order_number}
        </Link>
      </div>
    );
  };
  const CreditNoteRender = (data: InvoiceProps) => {
    return (
      <div>
        <Link
          to={`${PRIVATE_NAVIGATION.invoice.view.path}/view/${data?.invoice?.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-[220px] ps-2 hover:underline decoration-blue"
        >
          {data?.invoice?.invoice_number}
        </Link>
      </div>
    );
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
      <PageHeader small text={t('SideNavigation.creditNotes')} isScroll>
        <div className="flex flex-wrap justify-end gap-2 test">
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
          <div className="relative flex">
            <Button
              onClickHandler={() => {
                setFilterModal(!filterModal);
              }}
              variants="primary"
              className="gap-1 !flex !py-2.5 !px-3.5"
            >
              {!_.isEmpty(filterApply) && hasValues(filterApply) && (
                <span className="filter-badge" />
              )}
              <Image iconName="filterIcon2" iconClassName="w-4 h-4" />

              {t('Calendar.filterButton')}
            </Button>
          </div>
        </div>
      </PageHeader>
      {filterModal && (
        <div
          ref={modalRef}
          className={`${
            filterModal && 'z-1'
          } absolute right-0 before:absolute transition-all duration-300`}
        >
          <div className="bg-white rounded-xl shadow-xl w-[340px]">
            <div className="px-5 py-3.5 border-b border-solid border-offWhite">
              <h5 className="text-base leading-5 font-semibold text-dark">
                {t('ProjectManagement.Header.filter')}
              </h5>
            </div>
            <div className="px-5 py-3">
              <div className="flex flex-col gap-y-3">
                <FilterCreditNote
                  setFilterModal={setFilterModal}
                  setFilterApply={setFilterApply}
                  filterApply={filterApply}
                  t={t}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {downloadModal?.isOpen && (
        <DownloadFileModal
          modal={downloadModal}
          handleAccept={(data) => DownloadPdf(data)}
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

export default CreditNotes;
