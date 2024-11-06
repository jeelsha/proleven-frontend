import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import DownloadFileModal from 'components/DownloadPdfModel/DownloadFile';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import { ITableHeaderProps } from 'components/Table/types';
import {
  REACT_APP_API_BASE_URL,
  REACT_APP_DATE_FORMAT,
  REACT_APP_ENCRYPTION_KEY,
} from 'config';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { format } from 'date-fns';
import { useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import useUpdateQueryParameters from 'hooks/useSearchQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import FilterTrainerOrder from 'modules/TrainerInvoice/Components/FilterTrainerOrder';
import TrainerDetail from 'modules/TrainerInvoice/Components/TrainerDetail';
import { Invoice, TrainerFilterType } from 'modules/TrainerInvoice/types';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, getUserRole } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { formatCurrency, getCurrencySymbol, hasValues } from 'utils';
import { aesDecrypt, aesEncrypt } from 'utils/encrypt';

const PreviousOrder = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('Trainer.invoice.previousOrder'));

  const { state } = useLocation();

  const KEY = REACT_APP_ENCRYPTION_KEY ?? '';

  const currentURL = new URL(window.location.href);
  const trainerEncrypted = currentURL.searchParams.get('trainer');
  const decryptedText = trainerEncrypted ? aesDecrypt(trainerEncrypted, KEY) : '';

  const navigate = useNavigate();

  const downloadModal = useModal();
  // const filterDataModal = useToggleDropdown();

  const { currentPage } = useSelector(currentPageSelector);
  const user = useSelector(getCurrentUser);
  const userRole = useSelector(getUserRole);

  const url: URL = new URL(window.location.href);

  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [selectedData, setSelectedData] = useState<Invoice>();
  // const url = new URL(window.location.href);
  const [generatePdf] = useAxiosPost();
  const params = url.searchParams;
  const [filterModal, setFilterModal] = useState(false);
  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);

  const [invoiceFilters, setInvoiceFilters] = useState<TrainerFilterType>({
    invoiceStatus: params.getAll('invoiceStatus') ?? [],
    startDueDate: params.get('startDueDate') ?? '',
    endDueDate: params.get('endDueDate') ?? '',
    filterDate: params.get('filterDate')
      ? JSON.parse(params.get('filterDate') ?? '{}')
      : { startDate: '', endDate: '' },
    payment_mode: params.get('payment_mode') ?? '',
  });
  const isTemplateCheck = useCallback((filters: Record<string, any>) => {
    return Object.values(filters).some((value) => {
      return typeof value === 'object'
        ? Object.values(value).some((item) => !_.isEmpty(item))
        : !_.isEmpty(value);
    });
  }, []);
  const PARAM_MAPPING = {
    invoiceStatus: 'invoiceStatus',
    startDueDate: 'startDueDate',
    endDueDate: 'endDueDate',
    filterDate: 'filterDate',
    payment_mode: 'payment_mode',
  };

  useUpdateQueryParameters(
    invoiceFilters,
    PARAM_MAPPING,
    'isInvoice',
    isTemplateCheck,
    state
  );

  const { response, isLoading } = useQueryGetFunction(
    '/trainer/trainer-all-invoice',
    {
      page: currentPage,
      limit,
      sort,
      option: {
        ...(decryptedText ? { trainerId: decryptedText } : {}),
        ...(userRole === 'Trainer' && { trainerId: user?.id }),
        ...(params.has('filterDate')
          ? { ...JSON.parse(params.get('filterDate') ?? '{}') }
          : {}),
      },
    }
  );

  const actionRender = (item: Invoice) => {
    const encryptedTrainer = aesEncrypt(item?.trainer_id?.toString(), KEY);
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        <Button
          parentClass="h-fit"
          // bg-primary/10 text-primary p-1
          className="action-button green-btn"
          tooltipText={t('Tooltip.ViewOrder')}
          onClickHandler={() => {
            navigate(
              `${PRIVATE_NAVIGATION.trainerInvoice.currentMonthOrder.view.path}?trainer=${encryptedTrainer}&date=${item.created_at}`
            );
          }}
        >
          <Image
            iconName="eyeIcon"
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
            setSelectedData(item);
          }}
          tooltipText={t('Tooltip.DownloadPDF')}
        >
          <Image iconName="downloadFile2" iconClassName="stroke-current w-5 h-5" />
        </Button>
      </div>
    );
  };
  const dateRender = (item: Invoice) => {
    return (
      <div>
        {item?.created_at
          ? format(new Date(new Date(item?.created_at)), 'MMM yyyy')
          : '-'}
      </div>
    );
  };

  const columnData = [
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
      name: 'created_at',
      header: t('Trainer.invoiceColumnTitles.month'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props: Invoice) => dateRender(props),
    },
    {
      name: 'order_number',
      header: t('Trainer.invoiceColumnTitles.trainerOrderNo'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },

    {
      name: 'status',
      header: t('Trainer.invoiceColumnTitles.orderStatus'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'price',
      header: t('Quote.company.product.netTotalTrainerAmountTitle'),
      cell: (props: Invoice) => totalNetAmountRender(props),
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
      name: 'payment_date',
      header: t('invoicePaymentDate'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props: Invoice) => paymentDateRender(props),
    },
    {
      header: t('Table.action'),
      cell: (props: Invoice) => actionRender(props),
    },
  ];

  const paymentDateRender = (item: Invoice) => {
    return (
      <div>
        {item?.payment_date
          ? format(new Date(item?.payment_date), REACT_APP_DATE_FORMAT as string)
          : '-'}
      </div>
    );
  };

  const totalNetAmountRender = (item: Invoice) => {
    return (
      <div className="max-w-40 word-break">
        <p>
          {getCurrencySymbol()} {formatCurrency(Number(item?.price))}
        </p>
      </div>
    );
  };

  const DownloadPdf = async (data: string) => {
    const response = await generatePdf(`trainer/pdf/${selectedData?.slug}`, {
      language: data,
      ...(decryptedText ? { trainerId: decryptedText } : {}),
      ...(userRole === 'Trainer' ? { trainerId: user?.id } : {}),
      type: 'supplier',
      date: selectedData?.created_at,
    });
    if (response.data) {
      const extractedPath = response.data.invoiceFilePath;
      window.open(`${REACT_APP_API_BASE_URL}/${extractedPath}`, '_blank');
      downloadModal?.closeModal();
    }
  };

  return (
    <div className="flex flex-col gap-y-3">
      {userRole !== 'Trainer' ? (
        <PageHeader
          url={PRIVATE_NAVIGATION.trainerInvoice.list.path}
          small
          text={t('Trainer.invoice.previousMonthTitle')}
          isScroll
        >
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
                    <div className="flex flex-col gap-y-3">
                      <FilterTrainerOrder
                        setFilterModal={setFilterModal}
                        setInvoiceFilters={setInvoiceFilters}
                        invoiceFilters={invoiceFilters}
                        t={t}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PageHeader>
      ) : (
        <PageHeader small text={t('Trainer.invoice.previousMonthTitle')} isScroll>
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
                    <div className="flex flex-col gap-y-3">
                      <FilterTrainerOrder
                        setFilterModal={setFilterModal}
                        setInvoiceFilters={setInvoiceFilters}
                        invoiceFilters={invoiceFilters}
                        t={t}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PageHeader>
      )}
      {userRole !== 'Trainer' && (
        <CustomCard minimal>
          <TrainerDetail
            trainerData={
              !_.isEmpty(response?.data?.data) ? response?.data?.data : null
            }
          />
        </CustomCard>
      )}
      {downloadModal?.isOpen && (
        <DownloadFileModal
          modal={downloadModal}
          handleAccept={(data) => DownloadPdf(data)}
        />
      )}

      {!_.isEmpty(response?.data?.responseData) && (
        <Table
          parentClassName=""
          headerData={columnData as ITableHeaderProps[]}
          bodyData={response?.data?.responseData?.data}
          loader={isLoading}
          pagination
          dataPerPage={limit}
          setLimit={setLimit}
          totalPage={response?.data?.responseData?.lastPage}
          dataCount={response?.data?.responseData?.count}
          setSort={setSort}
          sort={sort}
          showQuoteSum
          quoteTotalSum={response?.data?.netAmount}
        />
      )}
    </div>
  );
};

export default PreviousOrder;
