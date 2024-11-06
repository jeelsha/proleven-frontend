import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';

// ** types **
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { SurveyQuestionProps } from 'modules/Courses/types/survey';

// ** hooks **
import { useQueryGetFunction } from 'hooks/useQuery';
import { useRolePermission } from 'hooks/useRolePermission';

// ** constants **
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { Fields } from 'modules/UsersManagement/constants';

// ** utils **
import { useDebounce } from 'utils';

// ** redux slice **
import { useTitle } from 'hooks/useTitle';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

// ** style **
import 'modules/Client/styles/index.css';
import { accessFunc } from 'modules/Courses/helper';
import { IAccess } from '../CourseViewDetail/types';

const SurveyTemplate = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle()
  updateTitle(t('SideNavigation.surveyTemplate'))

  const { Role_Fields } = Fields();
  const { currentPage } = useSelector(currentPageSelector);
  const user = useSelector(getCurrentUser);
  const currentRole = Role_Fields.find((role) => role.key === ROLES.Admin);

  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 500);

  const { response, isLoading } = useQueryGetFunction('/survey-template', {
    page: currentPage,
    limit,
    sort,
    role: `${currentRole?.id}`,

    option: {
      search: debouncedSearch,
    },
  });

  const editAccess = useRolePermission(
    FeaturesEnum.CourseInvitations,
    PermissionEnum.Update
  );

  const actionRender = (item: CellProps) => {
    const rolePermission = accessFunc(
      item?.access as unknown as IAccess[],
      user?.id
    );
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        <Button
          parentClass="h-fit"
          className="action-button green-btn"
          tooltipText={t('Tooltip.View')}
          onClickHandler={() => {
            const itemSlug = item as unknown as SurveyQuestionProps;
            navigate(
              `${PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.list.path}/view/${itemSlug.slug}`
            );
          }}
        >
          <Image
            iconName="eyeIcon"
            iconClassName=" w-5 h-5"
            width={24}
            height={24}
          />
        </Button>
        {((rolePermission && rolePermission.edit) ||
          (editAccess && user?.id === item.created_by) ||
          ROLES.Admin === user?.role_name) && (
            <Button
              parentClass="h-fit"
              className="action-button primary-btn"
              onClickHandler={() => {
                const itemSlug = item as unknown as SurveyQuestionProps;
                navigate(
                  `${PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.list.path}/${itemSlug.slug}`
                );
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
          )}
      </div>
    );
  };

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
      name: 'title',
      header: t('CoursesManagement.surveyTemplateColumnsName'),
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
  const handleAddSurvey = () => {
    navigate(PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.add.path);
  };
  return (
    <>
      <PageHeader small text={t('CoursesManagement.surveyTemplateTitle')} isScroll>
        <div className="flex justify-end gap-2 flex-wrap">
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

          <Button variants="primary" onClickHandler={handleAddSurvey}>
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="userGroupStrokeSD" iconClassName="w-full h-full" />
            </span>
            {t('CoursesManagement.surveyTemplateAdd')}
          </Button>
        </div>
      </PageHeader>
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
    </>
  );
};

export default SurveyTemplate;
