// **hooks**
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// **selector
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

// **components**
import Button from 'components/Button/Button';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import { AddEmailModal } from './components/modals/AddModal';
import { ViewModal } from './components/modals/ViewModal';

// ** types **
import Image from 'components/Image';
import SearchComponent from 'components/Table/search';
import { ITableHeaderProps } from 'components/Table/types';
import { useTitle } from 'hooks/useTitle';
import { useDebounce } from 'utils';
import { IEmailTemplateList } from './types';

const EmailTemplateListing = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.emailTemplate'));

  const { currentPage } = useSelector(currentPageSelector);
  const addModal = useModal();
  const viewModal = useModal();
  const [selectedData, setSelectedData] = useState<IEmailTemplateList | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 500);

  const { refetch, response, isLoading } = useQueryGetFunction('/template', {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
  });

  // Table  column data
  const columnData = [
    {
      header: t('EmailTemplate.emailTempTableNo'),
      name: 'no',
      className: 'w-16',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },

    {
      header: t('EmailTemplate.emailTempTableTitle'),
      name: 'title',
      option: {
        sort: true,
        hasFilter: false,
      },
    },

    {
      header: t('EmailTemplate.emailTempTableActions'),
      className: 'w-40',
      cell: (props: { id: number; status: string; slug: string }) =>
        actionRender(props),
    },
  ];

  // Table action buttons
  const actionRender = (item: IEmailTemplateList) => {
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        <Button
          onClickHandler={() => {
            setSelectedData(item);
            viewModal?.openModal();
          }}
          parentClass="h-fit"
          className="action-button green-btn"
          tooltipText={t('Tooltip.View')}
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
          onClickHandler={() => {
            setSelectedData(item);
            addModal?.openModal();
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
      </div>
    );
  };

  return (
    <div className="w-full">
      <PageHeader small text={t('EmailTemplate.emailTempTitle')} isScroll>
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
      </PageHeader>
      <div className="relative overflow-x-auto sm:rounded-lg">
        <Table
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
      </div>
      {addModal.isOpen && (
        <AddEmailModal
          modal={addModal}
          data={selectedData}
          setData={setSelectedData}
          refetch={refetch}
        />
      )}
      {viewModal.isOpen && <ViewModal modal={viewModal} data={selectedData} />}
    </div>
  );
};

export default EmailTemplateListing;
