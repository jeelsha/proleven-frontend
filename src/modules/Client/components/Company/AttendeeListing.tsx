// **hooks**
import { useQueryGetFunction } from 'hooks/useQuery';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// **components**
import Table from 'components/Table/Table';
import { ITableHeaderProps } from 'components/Table/types';

// **styles**
import 'modules/Client/styles/index.css';
import { useSelector } from 'react-redux';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

const AttendeeListing = ({
  CompanyId,
  debouncedSearch,
  group = false,
}: {
  CompanyId: number | undefined;
  debouncedSearch: string;
  group?: boolean;
}) => {
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const { currentPage } = useSelector(currentPageSelector);
  const { t } = useTranslation();
  const { response, isLoading } = useQueryGetFunction('/course/participates', {
    page: currentPage,
    limit,
    sort,
    option: {
      company_id: CompanyId,
      search: debouncedSearch,
      ...(group ? { isGroupByCode: true } : {}),
    },
  });

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
      name: 'first_name',
      header: t('CompanyManager.AttendeeList.firstNameTitle'),
      image: 'logo',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      name: 'last_name',
      header: t('CompanyManager.AttendeeList.lastNameTitle'),
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      name: 'email',
      header: t('CompanyManager.AttendeeList.emailTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'code',
      header: t('CompanyManager.AttendeeList.codeTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'job_title',
      header: t('CompanyManager.AttendeeList.roleTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'mobile_number',
      header: t('CompanyManager.AttendeeList.contactTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
  ];

  return (
    <Table
      parentClassName=""
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
  );
};

export default AttendeeListing;
