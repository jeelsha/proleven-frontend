import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Button from 'components/Button/Button';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';

import DownloadFileModal from 'components/DownloadPdfModel/DownloadFile';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import StatusLabel from 'components/StatusLabel';
import SearchComponent from 'components/Table/search';
import { REACT_APP_API_BASE_URL, REACT_APP_DATE_FORMAT } from 'config';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format } from 'date-fns';
import { useAxiosDelete, useAxiosGet } from 'hooks/useAxios';
import { useRolePermission } from 'hooks/useRolePermission';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { CreateQuoteModal } from 'modules/Quotes/components/CreateQuoteModal';
import FilterShow from 'modules/Quotes/components/FilterShow';
import 'modules/Quotes/styles/quotes.css';
import {
  FilterOptionsType,
  QuoteResponseValues,
  TabDetailProps,
} from 'modules/Quotes/types';
import StatusFilterComponent from 'modules/UsersManagement/Components/StatusFilter';
import { Fields } from 'modules/UsersManagement/constants';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { StatusFields } from 'types/common';
import { formatCurrency, getCurrencySymbol, hasValues, useDebounce } from 'utils';
import { QuoteStatusEnum } from './constants';
import './styles/quotes.css';

const Quotes = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.quotesTitle'));

  const location = useLocation();
  const navigate = useNavigate();
  const deleteModal = useModal();
  const downloadModal = useModal();
  const isCreateCourseModal = useModal();
  const filterModal = useModal();
  const [quoteDeleteApi] = useAxiosDelete();
  const [getQuoteApi, { isLoading: pdfDownloading }] = useAxiosGet();
  const { currentPage } = useSelector(currentPageSelector);
  const CurrentUser = useSelector(getCurrentUser);

  const deleteAccess = useRolePermission(FeaturesEnum.Quote, PermissionEnum.Delete);
  const editAccess = useRolePermission(FeaturesEnum.Quote, PermissionEnum.Update);

  const { quoteStatus_Fields, quoteType_Fields } = Fields();

  const [limit, setLimit] = useState<number>(100);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 500);
  const [selectedData, setSelectedData] = useState<QuoteResponseValues | null>(null);
  const [quoteFilters, setQuoteFilters] = useState<FilterOptionsType>({
    companies: [] as TabDetailProps[],
    codes: [],
    filterDate: {
      startDate: '',
      endDate: '',
    },
    payment_mode: '',
    salesRep: [],
  });
  const [quoteStatus, setQuoteStatus] = useState<StatusFields[]>(quoteStatus_Fields);
  const [quoteType, setQuoteType] = useState<StatusFields[]>(quoteType_Fields);
  const [clonedQuote, setClonedQuote] = useState('');

  const status = quoteStatus
    .filter((item) => item.isChecked === true)
    .map((item) => item.key);

  const typeQuote = quoteType
    .filter((item) => item.isChecked === true)
    .map((item) => item.key);

  const combinedFilters = [
    ...quoteFilters.companies,
    ...quoteFilters.codes,
    ...quoteFilters.salesRep,
  ];
  const companiesIds = quoteFilters.companies.map((item) => item.id);
  const codesIds = quoteFilters.codes.map((item) => item.id);
  const salesRepIds = quoteFilters.salesRep.map((item) => item.id);
  const { response, isLoading, refetch } = useQueryGetFunction('/quotes', {
    page: currentPage,
    sort,
    limit,
    option: {
      tableView: true,
      search: debouncedSearch,
      ...(quoteStatus.filter((item) => item.isChecked === true).length > 0
        ? { status: status.join(',') }
        : {}),
      ...(quoteType.filter((item) => item.isChecked === true).length > 0
        ? { quote_type: typeQuote.join(',') }
        : {}),
      ...(companiesIds.length > 0 && { company: companiesIds.join() }),
      ...(codesIds.length > 0 && { code: codesIds.join() }),
      ...(!_.isEmpty(quoteFilters?.filterDate)
        ? { ...quoteFilters?.filterDate }
        : {}),
      ...(salesRepIds.length > 0 && { sales_rep_id: salesRepIds.join() }),
    },
  });
  const columnData: ITableHeaderProps[] = [
    // {
    //   header: t('Table.no.'),
    //   name: 'no',
    //   className: '',
    //   option: {
    //     sort: false,
    //     hasFilter: false,
    //     isIndex: true,
    //   },
    // },
    {
      header: t('Quote.columnsTitle.name'),
      cell: (props) => companyNameRender(props as unknown as QuoteResponseValues),
      // className: 'min-w-[]',
    },
    {
      name: 'id',
      header: t('Quote.columnsTitle.quoteNumber'),
      option: {
        sort: true,
        hasFilter: false,
      },
      cell: (props) => quoteNumberRender(props as unknown as QuoteResponseValues),
    },
    {
      header: t('Quote.columnsTitle.date'),
      name: 'date',
      cell: (props) => dateRender(props as unknown as QuoteResponseValues),
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      name: 'status',
      option: {
        sort: false,
        hasFilter: true,
      },
      filterComponent: (
        <StatusFilterComponent
          statusFilter={quoteStatus}
          setStatusFilter={setQuoteStatus}
          title={t('Quote.columnsTitle.status')}
        />
      ),
      cell: (props) => statusRender(props as unknown as QuoteResponseValues),
    },
    {
      name: 'quote_type',
      option: {
        sort: false,
        hasFilter: true,
      },
      className: 'whitespace-nowrap',
      filterComponent: (
        <StatusFilterComponent
          statusFilter={quoteType}
          setStatusFilter={setQuoteType}
          title={t('Quote.columnsTitle.quoteType')}
        />
      ),
      cell: (props) => quoteTypeRender(props as unknown as QuoteResponseValues),
    },
    {
      name: 'quote.comments',
      header: t('ProjectManagement.CustomCardModal.commentLabel'),
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      name: 'salesRep.full_name',
      header: t('Quote.company.detail.salesRepTitle'),
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
      header: t('orderStatus'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => orderStatusRender(props as unknown as QuoteResponseValues),
    },
    {
      header: t('Table.action'),
      cell: (props: CellProps) => actionRender(props),
    },
  ];

  const dateRender = (item: QuoteResponseValues) => {
    return (
      <div>
        {item?.date
          ? format(new Date(item?.date), REACT_APP_DATE_FORMAT as string)
          : '-'}
      </div>
    );
  };

  const quoteNumberRender = (item: QuoteResponseValues) => {
    return <div>{item?.quote_number}</div>;
  };

  const statusRender = (item: QuoteResponseValues) => {
    const getStatusClass = () => {
      switch (item.status) {
        case QuoteStatusEnum.approved:
          return 'completed';
        case QuoteStatusEnum.open:
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
        text={item.status}
        variants={getStatusClass()}
        className={` ${statusClasses ?? ''}`}
      />
    );
  };

  const orderStatusRender = (item: QuoteResponseValues) => {
    if (item?.order.length > 0) {
      const getStatusClass = () => {
        switch (item?.order[0]?.status) {
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
          text={item?.order[0]?.status}
          variants={getStatusClass()}
          className={` ${statusClasses ?? ''}`}
        />
      );
    }
    return '-';
  };

  const companyNameRender = (item: QuoteResponseValues) => {
    return (
      <div className="flex items-center">
        <div className="w-[100px] h-[70px]">
          <Image
            imgClassName="block w-full h-full object-cover rounded-lg"
            src={item?.company?.logo ?? '/images/no-image.png'}
            width={100}
            height={100}
            serverPath
          />
        </div>
        <Link
          to={`${PRIVATE_NAVIGATION.clientsManagement.company.list.path}/view/${item?.company?.slug}`}
          target="_blank"
          className="flex-1"
        >
          <div className="w-[220px] ps-2  hover:underline decoration-blue">
            <p className="text-sm text-dark leading-[1.3]">{item?.company?.name}</p>
          </div>
        </Link>
      </div>
    );
  };

  const quoteTypeRender = (item: QuoteResponseValues) => {
    return (
      <div className="max-w-40 word-break">
        <p className="capitalize">{item?.quote_type ?? '-'}</p>
      </div>
    );
  };

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

  useEffect(() => {
    if (location?.state?.isModalOpen) {
      isCreateCourseModal?.openModal();
    }
  }, [location]);

  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Button
          parentClass="h-fit"
          className="action-button green-btn"
          onClickHandler={() => {
            const itemSlug = item as unknown as QuoteResponseValues;
            navigate(`${PRIVATE_NAVIGATION.quotes.list.path}/view/${itemSlug.slug}`);
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

        {((editAccess && CurrentUser?.id === item.created_by) ||
          CurrentUser?.role_name === ROLES.Admin) && (
          <Button
            parentClass="h-fit"
            className="action-button primary-btn"
            onClickHandler={() => {
              const itemSlug = item as unknown as QuoteResponseValues;
              navigate(`${PRIVATE_NAVIGATION.quotes.list.path}/${itemSlug.slug}`);
            }}
            tooltipText={t('Tooltip.Edit')}
          >
            <Image
              iconName="editIcon"
              iconClassName="stroke-current w-5 h-5"
              width={24}
              height={24}
            />
          </Button>
        )}
        {item.status !== QuoteStatusEnum.approved &&
          ((deleteAccess && CurrentUser?.id === item.created_by) ||
            CurrentUser?.role_name === ROLES.Admin) && (
            <Button
              parentClass="h-fit"
              className="action-button red-btn"
              onClickHandler={() => {
                setSelectedData(item as unknown as QuoteResponseValues);
                deleteModal?.openModal();
              }}
              tooltipText={t('Tooltip.Delete')}
            >
              <Image iconName="deleteIcon" iconClassName="stroke-current w-5 h-5" />
            </Button>
          )}

        <Button
          parentClass="h-fit"
          className="action-button primary-btn"
          onClickHandler={() => {
            setSelectedData(item as unknown as QuoteResponseValues);
            downloadModal?.openModal();
          }}
          tooltipText={t('Tooltip.DownloadPDF')}
        >
          <Image iconName="downloadFile2" iconClassName="stroke-current w-5 h-5" />
        </Button>

        <Button
          parentClass="h-fit"
          className="action-button primary-btn"
          onClickHandler={() => {
            const quoteItem = item as unknown as QuoteResponseValues;
            setClonedQuote(quoteItem?.slug);
            isCreateCourseModal.openModal();
          }}
          tooltipText={t('Quote.clone')}
        >
          <Image iconName="copyIcon" iconClassName="stroke-current w-5 h-5" />
        </Button>
      </div>
    );
  };

  const handleDelete = async () => {
    if (selectedData) {
      await quoteDeleteApi(`/quotes/${selectedData?.slug}`);
      deleteModal.closeModal();
      refetch();
    }
  };
  const handleClearFilter = () => {
    setQuoteFilters({
      companies: [],
      codes: [],
      filterDate: {
        startDate: '',
        endDate: '',
      },
      payment_mode: '',
      salesRep: [],
    });
  };
  const handleDeleteFilter = (data: TabDetailProps) => {
    const filteredData: FilterOptionsType = {
      companies: [],
      codes: [],
      filterDate: {
        startDate: '',
        endDate: '',
      },
      payment_mode: '',
      salesRep: [],
    };

    Object.keys(quoteFilters).forEach((type) => {
      const filterType = type as keyof FilterOptionsType;
      if (filterType === 'filterDate') {
        filteredData.filterDate = {
          startDate: '',
          endDate: '',
        };
      } else if (filterType === 'payment_mode') {
        filteredData.payment_mode = '';
      } else {
        filteredData[filterType] = quoteFilters[filterType].filter(
          (item: TabDetailProps) => item.slug !== data?.slug
        );
      }
    });

    setQuoteFilters(filteredData);
  };
  const DownloadPdf = async (data: string) => {
    const response = await getQuoteApi(`/quotes/generate-pdf`, {
      params: {
        language: data,
        quote_slug: selectedData?.slug,
        quote_number: selectedData?.quote_number,
      },
    });
    if (response.data) {
      const extractedPath = response.data.split('backend/')[1];
      window.open(`${REACT_APP_API_BASE_URL}/${extractedPath}`, '_blank');
      downloadModal?.closeModal();
    }
  };

  return (
    <>
      <PageHeader small text={t('Quote.company.detail.quoteTitle')} isScroll>
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
          <div className="relative flex">
            <Button
              onClickHandler={() => {
                filterModal.openModal();
              }}
              variants="primary"
              className="gap-1 !flex !py-2.5 !px-3.5"
            >
              {!_.isEmpty(quoteFilters) && hasValues(quoteFilters) && (
                <span className="filter-badge" />
              )}
              <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
              {t('Calendar.filterButton')}
            </Button>
          </div>
          <Button
            variants="primary"
            onClickHandler={() => {
              isCreateCourseModal.openModal();
            }}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="plusSquareIcon" iconClassName="w-full h-full" />
            </span>
            {t('Quote.company.createQuoteTitle')}
          </Button>
        </div>
      </PageHeader>
      {combinedFilters?.length > 0 && (
        <div className="rbc-applied-filter my-4 w-full">
          <div className="flex gap-4 justify-start">
            <Button className="mt-2 text-sm text-dark font-medium inline-block select-none">
              {t('Calendar.appliedFiltersTitle')}
            </Button>
            <div className="max-w-[calc(100%_-_180px)] flex flex-wrap gap-4">
              {combinedFilters.map((data, ind) => {
                return (
                  <Button
                    className="calendar-filter-button"
                    key={`filters_${ind + 1}`}
                  >
                    {data?.title}
                    <Button
                      className="w-4 h-5 inline-block cursor-pointer active:scale-95 select-none"
                      onClickHandler={() => handleDeleteFilter(data)}
                    >
                      <Image iconName="crossRoundIcon2" />
                    </Button>
                  </Button>
                );
              })}
            </div>
            <Button
              className="calendar-filter-clear"
              onClickHandler={handleClearFilter}
            >
              {t('Calendar.clearAllTitle')}
            </Button>
          </div>
        </div>
      )}

      {isCreateCourseModal?.isOpen && (
        <CreateQuoteModal modal={isCreateCourseModal} quoteSlug={clonedQuote} />
      )}
      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={
            selectedData?.isQuoteAssigned
              ? t('Quote.assignedProjectText', {
                  projectId: selectedData?.project_id,
                })
              : t('Quote.deleteText', {
                  companyName: selectedData?.company?.name,
                  quoteNumber: selectedData?.quote_number,
                })
          }
          variants="primary"
          confirmButtonText={
            selectedData?.isQuoteAssigned ? '' : t('Button.deleteButton')
          }
          confirmButtonVariant="danger"
          deleteTitle={selectedData?.isQuoteAssigned ? '' : t('Button.deleteTitle')}
          cancelButtonText={
            selectedData?.isQuoteAssigned ? '' : t('Button.cancelButton')
          }
          cancelButtonFunction={deleteModal.closeModal}
          confirmButtonFunction={
            selectedData?.isQuoteAssigned ? undefined : handleDelete
          }
          showCloseIcon
        />
      )}
      {downloadModal?.isOpen && (
        <DownloadFileModal
          modal={downloadModal}
          handleAccept={(data) => DownloadPdf(data)}
          disabled={pdfDownloading} //
        />
      )}
      {filterModal.isOpen && (
        <FilterShow
          modal={filterModal}
          setQuoteFilters={setQuoteFilters}
          quoteFilters={quoteFilters}
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

export default Quotes;
