/* eslint-disable no-restricted-syntax */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Table from 'components/Table/Table';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { useQueryGetFunction } from 'hooks/useQuery';

import Button from 'components/Button/Button';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import SearchComponent from 'components/Table/search';
import { REACT_APP_ENCRYPTION_KEY } from 'config';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useTitle } from 'hooks/useTitle';
import 'modules/Client/styles/index.css';
import { Fields } from 'modules/UsersManagement/constants';
import { useNavigate } from 'react-router-dom';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';
import { aesEncrypt } from 'utils/encrypt';

const TrainerInvoiceList = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.TrainerInvoice'));

  const navigate = useNavigate();
  const { Role_Fields } = Fields();

  const KEY = REACT_APP_ENCRYPTION_KEY ?? '';

  const { currentPage } = useSelector(currentPageSelector);
  const currentRole = Role_Fields.find((role) => role.key === ROLES.CompanyManager);

  const [limit, setLimit] = useState<number>(100);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');

  const debouncedSearch = useDebounce(search, 500);

  const { response, isLoading } = useQueryGetFunction('/trainer/list', {
    page: currentPage,
    limit,
    sort,
    role: `${currentRole?.id}`,
    option: {
      search: debouncedSearch,
    },
  });

  const actionRender = (item: CellProps) => {
    const encryptedTrainer = aesEncrypt(item?.id, KEY);
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        <Button
          parentClass="h-fit"
          // bg-primary/10 text-primary p-1
          className="action-button green-btn"
          onClickHandler={() => {
            navigate(
              `${PRIVATE_NAVIGATION.trainerInvoice.currentMonthOrder.view.path}?trainer=${encryptedTrainer}`
            );
          }}
          tooltipText={t('Tooltip.CurrentMonthOrder')}
        >
          <Image
            iconName="bookIcon"
            iconClassName=" w-5 h-5"
            width={24}
            height={24}
          />
        </Button>

        <Button
          parentClass="h-fit"
          className="action-button primary-btn"
          onClickHandler={() => {
            navigate(
              `${PRIVATE_NAVIGATION.trainerInvoice.previousMonthOrder.view.path}?trainer=${encryptedTrainer}`
            );
          }}
          tooltipText={t('Tooltip.PreviousOrder')}
        >
          <Image
            iconName="sideBarOrder"
            iconClassName="stroke-current w-5 h-5"
            width={24}
            height={24}
          />
        </Button>
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
      name: 'TrainerInvoice.full_name',
      header: t('Trainer.invoiceColumnTitles.trainerName'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'TrainerInvoice.email',
      header: t('Trainer.invoiceColumnTitles.trainerEmail'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'TrainerInvoice.contact',
      header: t('Trainer.invoiceColumnTitles.trainerMobileNo'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Table.action'),
      cell: (props: CellProps) => actionRender(props),
    },
  ];

  return (
    <>
      <PageHeader small text={t('SideNavigation.TrainerInvoice')} isScroll>
        <div className="flex justify-end gap-2">
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
        </div>
      </PageHeader>

      <Table
        parentClassName=""
        headerData={columnData as ITableHeaderProps[]}
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

export default TrainerInvoiceList;
