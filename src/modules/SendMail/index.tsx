// **components**
import Button from 'components/Button/Button';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import { ITableHeaderProps } from 'components/Table/types';
import { AddSendEmailModal } from './components/modals/AddModal';
import { ViewModal } from './components/modals/ViewModal';

// **hooks**
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// **selector**
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

// **types**
import SearchComponent from 'components/Table/search';
import ToolTip from 'components/Tooltip';
import { useTitle } from 'hooks/useTitle';
import { useDebounce } from 'utils';
import { ISendMail } from './types';

const SendMailListing = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.sendMail'));

  const { currentPage } = useSelector(currentPageSelector);
  const addModal = useModal();
  const viewModal = useModal();

  const [selectedData, setSelectedData] = useState<ISendMail | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');

  const debouncedSearch = useDebounce(search, 500);
  const { response, isLoading, refetch } = useQueryGetFunction('/send_mails', {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
  });

  const columnData = [
    {
      header: t('EmailTemplate.emailTempTableNo'),
      name: 'no',
      option: {
        sort: false,
        filter: false,
        isIndex: true,
      },
    },

    {
      header: t('EmailTemplate.emailTempTableSubject'),
      name: 'subject',
      option: {
        sort: true,
        filter: false,
      },
    },

    // {
    //   header: t('EmailTemplate.emailTempTableDescription'),
    //   name: 'description',
    //   option: {
    //     sort: true,
    //     filter: false,
    //   },
    // },
    {
      header: t('SendMail.to'),
      name: 'to',
      option: {
        sort: true,
        filter: false,
      },
      cell: (props: { id: number; status: string; slug: string }) =>
        toMailRender(props),
    },

    {
      header: t('EmailTemplate.emailTempTableActions'),
      cell: (props: { id: number; status: string; slug: string }) =>
        actionRender(props),
    },
  ];
  const actionRender = (item: ISendMail) => {
    return (
      <div className="flex gap-2 items-center justify-center">
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
          tooltipText={t('Tooltip.Copy')}
        >
          <Image
            iconName="copyIcon"
            iconClassName="stroke-current w-5 h-5"
            width={24}
            height={24}
          />
        </Button>
      </div>
    );
  };
  const toMailRender = (item: ISendMail) => {
    const toEmails = item?.to?.split(',');
    const count = toEmails?.length;
    if (count) {
      return (
        <div className="flex gap-2 items-center justify-center">
          <span
            // max-w-[200px] truncate
            className={`  whitespace-nowrap block ${count > 1 ? 'truncate' : ''}`}
          >
            {toEmails?.[0]}
          </span>
          {count > 1 && (
            <span className="text-secondary group relative">
              +{count - 1}
              {t('SendMail.More')}
              <ToolTip
                className="wordBreak-word"
                text={toEmails?.slice(1).map((item, index) => (
                  <p key={`email_${index + 1}`}> {item}</p>
                ))}
                position="bottom"
              />
            </span>
          )}
        </div>
      );
    }
    return <></>;
  };

  return (
    <div className="w-full">
      <div>
        <PageHeader small text={t('SendMail.title')}>
          <div className="manage-btns text-sm text-graytext flex flex-wrap gap-4 items-center font-normal whitespace-nowrap justify-end">
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
            <Button
              variants="primary"
              onClickHandler={() => {
                setSelectedData(null);
                addModal.openModal();
              }}
            >
              <span className="w-5 h-5 me-2">
                <Image iconClassName="w-full h-full" iconName="emailTemplateIcon" />
              </span>
              {t('SendMail.compose')}
            </Button>
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
      </div>
      {addModal.isOpen && (
        <AddSendEmailModal
          modal={addModal}
          data={selectedData}
          setData={setSelectedData}
          refetch={refetch}
        />
      )}
      {viewModal.isOpen && selectedData && (
        <ViewModal modal={viewModal} data={selectedData} setData={setSelectedData} />
      )}
    </div>
  );
};

export default SendMailListing;
