// ** Components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import Table from 'components/Table/Table';

// ** Constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';

// ** Hooks **
import { useQueryGetFunction } from 'hooks/useQuery';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

// ** Types **
import { CellProps, ITableHeaderProps } from 'components/Table/types';

// ** Slices **
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';

interface CompanyDetailProps {
  state: Record<string, string>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const CompanyDetail = ({ state, setActiveTab }: CompanyDetailProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const params = useParams();

  // ** CONSTs **
  const { currentPage } = useSelector(currentPageSelector);
  const allRoles = useSelector(getRoles);
  const currentRole = allRoles.find((role) => role.name === ROLES.Company);

  // ** States **
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');

  // ** APIs **
  const { response, isLoading } = useQueryGetFunction('/course/private/companies', {
    page: currentPage,
    limit,
    sort,
    option: { course_slug: params?.slug },
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
      name: 'company.name',
      header: t('ClientManagement.clientColumnTitles.clientTitle'),
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

  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        <Button
          parentClass="h-fit"
          className="action-button green-btn"
          onClickHandler={() => {
            setActiveTab('company');
            navigate(
              `${PRIVATE_NAVIGATION.clientsManagement.company.list.path}/view/${item?.slug}`,
              {
                state: {
                  ...state,
                  role: currentRole?.id,
                  url: `/courses/view/${params?.slug}`,
                  fromCourse: true,
                },
              }
            );
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
      </div>
    );
  };

  return (
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
  );
};

export default CompanyDetail;
