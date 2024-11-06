// **hooks**
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

// ** types **
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import SearchComponent from 'components/Table/search';
import { ITableHeaderProps } from 'components/Table/types';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { useTitle } from 'hooks/useTitle';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'utils';
import { ITemplate } from './types';

const CertificateTemplateListing = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle()
  updateTitle(t('certificate.temp'))

  const { currentPage } = useSelector(currentPageSelector);
  const navigate = useNavigate();

  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');

  const debouncedSearch = useDebounce(search, 500);

  const { response, isLoading } = useQueryGetFunction('/certificate-templates', {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
    option: {
      is_default: true,
    },
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
      header: t('Calendar.createEvent.topic'),
      name: 'title',
      option: {
        sort: true,
        hasFilter: false,
      },
      cell: (props: { title: string; is_legislation_included: number | boolean }) =>
        renderIsLegislationTile(props),
    },
    {
      header: t('certificate.latestVersions'),
      name: 'latest_version',
      option: {
        sort: true,
        hasFilter: false,
      },
    },

    {
      header: t('EmailTemplate.emailTempTableActions'),
      className: 'w-40',
      cell: (props: ITemplate) => actionRender(props),
    },
  ];

  // Table render legislation tile
  const renderIsLegislationTile = ({
    title,
    is_legislation_included,
  }: {
    title: string;
    is_legislation_included: number | boolean;
  }) => {
    return (
      <div className="flex">
        <div className="max-w-[220px] ps-2">
          <p className="text-base text-dark leading-[1.3] mb-1">{title}</p>

          <p
            className={`text-xs ${is_legislation_included === true
                ? 'bg-navText text-white '
                : 'bg-navText/10 text-navText '
              } px-1 pt-0.5 border border-solid border-navText leading-[1.65] rounded font-semibold text-center`}
          >
            {is_legislation_included === true
              ? t('certificate.legislationIncluded')
              : t('certificate.legislationNotIncluded')}
          </p>
        </div>
      </div>
    );
  };

  // Table action buttons
  const actionRender = (item: ITemplate) => {
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        <Button
          onClickHandler={() => {
            navigate(`/certificate-template/version/${item?.slug}`, {
              state: {
                data: item,
              },
            });
          }}
          parentClass="h-fit"
          className=" green-btn"
        >
          <StatusLabel text={t('certificate.ViewVersions')} variants="primary" />
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full">
      <PageHeader
        small
        text={t('CompanyManager.AttendeeList.certificateDownload')}
        isScroll
      >
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
          <Button
            variants="primary"
            onClickHandler={() => {
              navigate(
                PRIVATE_NAVIGATION.coursesManagement.certificateTemplate.add.path,
                {
                  state: {
                    isAdd: true,
                  },
                }
              );
            }}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="bookmarkIcon2" iconClassName="w-full h-full" />
            </span>
            {t('CoursesManagement.surveyTemplateAdd')}
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
  );
};

export default CertificateTemplateListing;
