// ** Components
import Table from 'components/Table/Table';

// ** Hooks
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** axios
import { useQueryGetFunction } from 'hooks/useQuery';

// ** Types
import { ITableHeaderProps } from 'components/Table/types';

// ** Redux
import { useSelector } from 'react-redux';

// ** Slices
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

interface ProfileListingProps {
  company_id: number;
}

const ProfileListing = ({ company_id }: ProfileListingProps) => {
  const { t } = useTranslation();

  // ** Selector
  const { currentPage } = useSelector(currentPageSelector);

  // ** States
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');

  const columnData: ITableHeaderProps[] = [
    {
      header: t('Codes.no'),
      name: 'no',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('Profiles.title'),
      name: 'job_title',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('Codes.description'),
      name: 'description',
      className: 'full-width-heading',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
  ];

  // ** APIs
  const { response, isLoading } = useQueryGetFunction('/profile', {
    page: currentPage,
    limit,
    sort,
    option: {
      company_id,
    },
  });

  return (
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
      parentClassName="profile-listing-table"
    />
  );
};

export default ProfileListing;
