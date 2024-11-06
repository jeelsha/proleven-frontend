import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import Table from 'components/Table/Table';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosDelete } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useRolePermission } from 'hooks/useRolePermission';
import { CourseStatus } from 'modules/Courses/Constants';
import { accessFunc } from 'modules/Courses/helper';
import { CourseTemplate } from 'modules/Courses/types/TemplateBundle';
import StatusFilterComponent from 'modules/UsersManagement/Components/StatusFilter';
import { Fields } from 'modules/UsersManagement/constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { StatusFields } from 'types/common';
import { useDebounce } from 'utils';
import { IAccess } from '../CourseViewDetail/types';

type CourseTemplateProps = {
  search: string;
  status: CourseStatus;
  activeTab?: number;
};

const CourseTemplates = ({ search, status, activeTab }: CourseTemplateProps) => {
  const { t } = useTranslation();
  const { search: searchQuery } = useLocation();
  const navigate = useNavigate();
  const { currentPage } = useSelector(currentPageSelector);
  const user = useSelector(getCurrentUser);
  const [courseDeleteApi] = useAxiosDelete();
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [selectedData, setSelectedData] = useState<CourseTemplate | null>(null);
  const { isSubCatEmpty } = Fields();
  const [isSubCategoryEmpty, setIsSubCategoryEmpty] = useState<StatusFields[]>(isSubCatEmpty);
  const deleteModal = useModal();
  const url: URL = new URL(window.location.href);
  const params = url.search;
  const newQueryParameters = new URLSearchParams(searchQuery);
  const debouncedSearch = useDebounce(search, 500);

  const updateAccess = useRolePermission(
    FeaturesEnum.CourseInvitations,
    PermissionEnum.Update
  );

  const setParamsToApi = (type: string) => {
    if (params) {
      switch (type) {
        case 'code':
          return url.searchParams.getAll('courseCode');
        case 'category':
          return url.searchParams.getAll('courseCategory');
        case 'subCategory':
          return url.searchParams.getAll('courseSubCategory');
        default:
          return {};
      }
    }
  };
  const subCategoryEmpty = isSubCategoryEmpty
    .filter((item) => item.isChecked === true)
    .map((item) => item.key);
  const containsTrue = subCategoryEmpty.includes('true');
  const containsFalse = subCategoryEmpty.includes('false');
  const shouldIncludeIsEmptySubCat = (containsTrue && !containsFalse) || (!containsTrue && containsFalse);
  const isEmptySubCatValue = containsTrue ? true : containsFalse ? false : undefined;

  const courseCode = setParamsToApi('code');
  const courseCategory = setParamsToApi('category');
  const courseSubCategory = setParamsToApi('subCategory');
  const { response, isLoading, refetch } = useQueryGetFunction('/course/template', {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
    option: {
      status,
      allLanguage: status === CourseStatus.incomplete,
      courseCode,
      courseCategory,
      courseSubCategory,
      ...(shouldIncludeIsEmptySubCat ? { isEmptySubCat: isEmptySubCatValue } : {}),

    },
  });

  const columnData: ITableHeaderProps[] = [
    {
      header: t('CoursesManagement.columnHeader.No'),
      name: 'no',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Templates'),
      cell: (props) => templateRender(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.CourseCode'),
      name: 'course.code',

      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Category'),
      name: 'course.courseCategory.name',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.SubCategory'),
      name: 'course.courseSubCategory.name',
      option: {
        sort: false,
        hasFilter: true,
      },
      filterComponent: (
        <StatusFilterComponent
          statusFilter={isSubCategoryEmpty}
          setStatusFilter={setIsSubCategoryEmpty}
          title={t('CoursesManagement.columnHeader.SubCategory')}
        />
      ),
      cell: (props: CellProps) => {
        const { courseSubCategory } = props as unknown as CourseTemplate;
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            {courseSubCategory && courseSubCategory.name ? courseSubCategory.name : '-'}
          </label>
        );
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Actions'),
      cell: (props) => actionRender(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
  ];

  const actionRender = (item: CellProps) => {
    const rolePermission = accessFunc(
      item?.access as unknown as IAccess[],
      user?.id
    );

    return (
      <div className="flex gap-2 items-center justify-center">
        {item ? (
          <Button
            onClickHandler={() => {
              newQueryParameters.set('isTemplate', String(true));

              const newPathname = `/courses/template/view/${item.slug}`;
              const newSearch = newQueryParameters.toString();
              if (newQueryParameters.toString()) {
                navigate(
                  {
                    pathname: newPathname,
                    search: newSearch,
                  },
                  {
                    state: { isTemplate: true, activeTab },
                    replace: true,
                  }
                );
              }
            }}
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
        ) : (
          ''
        )}
        {(rolePermission && rolePermission.edit) ||
          (updateAccess && user?.id === item.created_by) ||
          user?.role_name === ROLES.Admin ? (
          <Button
            parentClass="h-fit"
            className="action-button primary-btn"
            onClickHandler={() => {
              navigate(`/course/templates/edit?slug=${item?.slug}`, {
                state: {
                  activeTab,
                },
              });
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
        ) : (
          ''
        )}
        {((rolePermission && rolePermission.delete) ||
          user?.role_name === ROLES.Admin) && (
            <Button
              parentClass="h-fit"
              className="action-button red-btn"
              onClickHandler={() => {
                setSelectedData(item as unknown as CourseTemplate);
                deleteModal?.openModal();
              }}
              tooltipText={t('Tooltip.Delete')}
            >
              <Image iconName="deleteIcon" iconClassName="stroke-current w-5 h-5" />
            </Button>
          )}
      </div>
    );
  };

  const templateRender = (item: CellProps) => {
    return (
      <div className="flex">
        <div className="w-[100px] h-[70px]">
          <Image
            src={item.image}
            width={100}
            height={100}
            imgClassName="w-full h-full object-cover rounded-lg"
            serverPath
          />
        </div>
        <div className="w-[350px] ps-2 flex flex-col justify-center flex-1">
          <p className="text-base text-dark leading-[1.3] mb-1">{item.title}</p>
        </div>
      </div>
    );
  };

  useEffect(() => {
    setLimit(10);
    setSort('-updated_at');
  }, [status]);

  const handleDelete = async () => {
    if (selectedData) {
      await courseDeleteApi(`/course/template/${selectedData?.slug}`);
      deleteModal.closeModal();
      refetch();
    }
  };
  return (
    <>
      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('CoursesManagement.CreateCourse.deleteText', {
            COURSE: selectedData?.title,
          })}
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonVariant="danger"
          deleteTitle={t('Button.deleteTitle')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={deleteModal.closeModal}
          confirmButtonFunction={handleDelete}
        />
      )}
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
    </>
  );
};

export default CourseTemplates;
