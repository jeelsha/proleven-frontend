// ** Components
import Button from 'components/Button/Button';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import SearchComponent from 'components/Table/search';
import Table from 'components/Table/Table';
import ViewContactUs from 'modules/ContactUsFormData/components/ViewContactUs';

// ** Hooks
import { useModal } from 'hooks/useModal';
import { useTitle } from 'hooks/useTitle';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'utils';

// ** axios
import { useQueryGetFunction } from 'hooks/useQuery';

// ** Types
import { ITableHeaderProps } from 'components/Table/types';
import { IContactUs } from 'modules/ContactUsFormData/types';

// ** Redux
import { useSelector } from 'react-redux';

// ** Slices
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

const ContactUsFormListing = () => {
  const { t } = useTranslation();

  // ** Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.contactUs'));

  const modal = useModal();

  // ** Selector
  const { currentPage } = useSelector(currentPageSelector);

  // ** States
  const [selectedData, setSelectedData] = useState<IContactUs | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 500);

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
      header: t('CMS.ContactUs.full_name'),
      name: 'full_name',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('CMS.ContactUs.Company'),
      name: 'contact_agency',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('CMS.ContactUs.Email'),
      name: 'contact_email',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CMS.ContactUs.Phone'),
      name: 'contact_phone',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CMS.ContactUs.Description'),
      name: 'contact_message',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Codes.action'),
      cell: (props) => actionRender(props as unknown as IContactUs),
    },
  ];

  // ** APIs
  const { response, isLoading } = useQueryGetFunction('/cms/contact-us', {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
  });

  const actionRender = (item: IContactUs) => {
    return (
      <Button
        parentClass="h-fit"
        className="action-button primary-btn relative group"
        onClickHandler={() => {
          setSelectedData(item);
          modal.openModal();
        }}
        tooltipText={t('Tooltip.View')}
      >
        <Image
          iconName="eyeIcon"
          iconClassName="stroke-current w-5 h-5"
          width={24}
          height={24}
        />
      </Button>
    );
  };

  return (
    <>
      <PageHeader text={t('CMS.ContactUs.FormSubmission')} small addSpace isScroll>
        <div className="flex justify-end gap-2 flex-wrap">
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
        headerData={columnData}
        bodyData={response?.data?.data ?? []}
        loader={isLoading}
        pagination
        dataPerPage={limit}
        setLimit={setLimit}
        totalPage={response?.data?.lastPage}
        dataCount={response?.data?.count}
        setSort={setSort}
        sort={sort}
      />
      {modal.isOpen ? (
        <ViewContactUs
          modal={modal}
          data={selectedData}
          setData={() => setSelectedData(null)}
        />
      ) : (
        ''
      )}
    </>
  );
};

export default ContactUsFormListing;
