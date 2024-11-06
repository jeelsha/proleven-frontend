import Button from 'components/Button/Button';
import Image from 'components/Image';
import Table from 'components/Table/Table';
import { ITableHeaderProps } from 'components/Table/types';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const ViewTrainers = () => {
  const params = useParams();
  const [limit, setLimit] = useState<number>(5);
  const [sort, setSort] = useState<string>('-updated_at');
  const { t } = useTranslation();

  const { response, isLoading } = useQueryGetFunction(`/course`, {
    option: {
      course_slug: params?.slug,
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
      header: t('Table.action'),
      cell: () => actionRender(),
    },
  ];

  const actionRender = () => {
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        <Button
          parentClass="h-fit"
          className="action-button green-btn"
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
      tableHeightClassName="!min-h-[unset]"
    />
  );
};

export default ViewTrainers;
