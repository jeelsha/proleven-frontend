// **components**
import Table from 'components/Table/Table';
import { ITableHeaderProps } from 'components/Table/types';

// **hooks**
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// **redux**
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

const ViewResourceList = () => {
  const updateTitle = useTitle();
  const { t } = useTranslation();
  const { currentPage } = useSelector(currentPageSelector);

  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');

  const currentURL = new URL(window.location.href);
  const bundleSlug = currentURL.searchParams.get('slug');

  const { response, isLoading } = useQueryGetFunction('/bundle/resources', {
    page: currentPage,
    limit,
    sort,
    option: {
      bundle_slug: bundleSlug,
    },
  });
  const columnData = [
    {
      header: t('UserManagement.columnHeader.no'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('Calendar.createEvent.topic'),
      name: 'resources.title',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('trainerRequestAcceptModal.QuantityTitle'),
      name: 'quantity',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('Calendar.eventDetails.trainerTitle'),
      name: 'course_room.title',
      cell: (is_optional: boolean) => {
        return is_optional === true ? t('OptionalTrainer') : t('MainTrainer');
      },
    },
  ];
  updateTitle(t('Calendar.eventDetails.resourceTitle'));

  return (
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
  );
};

export default ViewResourceList;
