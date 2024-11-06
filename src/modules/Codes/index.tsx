/* eslint-disable no-restricted-syntax */
// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';
import AddEditCode from 'modules/Codes/pages/AddEditCode';
import StatusFilterComponent from 'modules/UsersManagement/Components/StatusFilter';
import BulkUploadModal from 'modules/UsersManagement/pages/bulkUploadModal';

// ** hooks **
import { useAxiosDelete, useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useRolePermission } from 'hooks/useRolePermission';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** constants **
import { useBulkUploadMessageConstant } from 'constants/BulkUploadNotes';
import { CodeBulkUploadObject } from 'constants/BulkUploadStructure';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { Fields } from 'modules/UsersManagement/constants';

// ** types **
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { Code, CodeFilterTypes, CodeType } from 'modules/Codes/types';
import { StatusFields } from 'types/common';

// ** validation **
import { CodeBulkUploadValidationSchema } from './validation';

// ** utils **
import {
  customRandomNumberGenerator,
  FilterObject,
  useDebounce,
  useHandleExport,
  wait,
} from 'utils';

// ** libraries **
import { FormikValues } from 'formik';

// ** redux **
import useUpdateQueryParameters from 'hooks/useSearchQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import CodeFilter from 'modules/Codes/CodeFilter/CodeFilter';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';

const CodesManagement = () => {
  // ** Const
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle()
  updateTitle(t('SideNavigation.Codes'))

  const codeModal = useModal();
  const deleteModal = useModal();
  const bulkUploadModal = useModal();

  const [codeDeleteApi] = useAxiosDelete();
  const [getAllCodes] = useAxiosGet();
  const [bulkUploadCode] = useAxiosPost();
  const { exportDataFunc } = useHandleExport();

  const { currentPage } = useSelector(currentPageSelector);
  const dispatch = useDispatch();
  const { isCourseCode_Fields } = Fields();
  const url: URL = new URL(window.location.href);
  const params = url.search;
  const PARAM_MAPPING = {
    courseCategory: 'category',
    courseSubCategory: 'subCategory',
  };

  // ** States
  const { state } = useLocation();
  const [selectedData, setSelectedData] = useState<Code | null>(null);
  const [isCourseCode, setIsCourseCode] =
    useState<StatusFields[]>(isCourseCode_Fields);
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const [codeData, setCodeData] = useState<Code[]>([]);
  const [filterApply, setFilterApply] = useState<CodeFilterTypes>({
    category: params ? url.searchParams.getAll('courseCategory') : [],
    subCategory: params ? url.searchParams.getAll('courseSubCategory') : [],
  });
  const [courseFilter, setCourseFilter] = useState<CodeFilterTypes>({
    category: params ? url.searchParams.getAll('courseCategory') : [],
    subCategory: params ? url.searchParams.getAll('courseSubCategory') : [],
  });

  const debouncedSearch = useDebounce(search, 500);
  const courseCodeTemp = isCourseCode
    .filter((item) => item.isChecked === true)
    .map((item) => item.key);

  // const deleteAccess = useRolePermission(FeaturesEnum.Code, PermissionEnum.Delete);
  // ** API calls
  const setParamsToApi = (type: string) => {
    if (params) {
      switch (type) {
        case 'courseCategory':
          return url.searchParams.getAll('courseCategory');
        case 'courseSubCategory':
          return url.searchParams.getAll('courseSubCategory');
        default:
          return {};
      }
    }
  };
  const courseCategory = setParamsToApi('courseCategory');
  const courseSubCategory = setParamsToApi('courseSubCategory');

  const { response, isLoading, refetch } = useQueryGetFunction('/codes', {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
    option: {
      ...(isCourseCode.filter((item) => item.isChecked === true)?.length > 0
        ? { type: courseCodeTemp?.join(',') }
        : {}),
      courseCategory,
      courseSubCategory,
    },
  });
  const user = useSelector(getCurrentUser);

  const deleteAccess = useRolePermission(FeaturesEnum.Code, PermissionEnum.Delete);
  const updateAccess = useRolePermission(FeaturesEnum.Code, PermissionEnum.Update);

  const { uploadNotes } = useBulkUploadMessageConstant();

  const isTemplateCheck = useCallback((filters: Record<string, any>) => {
    return Object.values(filters).some((value) => {
      return typeof value === 'object'
        ? Object.values(value).some((item) => !_.isEmpty(item))
        : !_.isEmpty(value);
    });
  }, []);
  useUpdateQueryParameters(
    filterApply,
    PARAM_MAPPING,
    'isCode',
    isTemplateCheck,
    state
  );

  // ** Column data
  const columnData: ITableHeaderProps[] = [
    {
      header: t('Codes.no'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('Codes.code'),
      name: 'code',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('Codes.description'),
      name: 'description',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('codeType'),
      name: 'course_code_type',
      cell: (props) => renderCourseCodeType(props),
      option: {
        sort: false,
        hasFilter: true,
      },
      filterComponent: (
        <StatusFilterComponent
          statusFilter={isCourseCode}
          setStatusFilter={setIsCourseCode}
          title={t('codeType')}
        />
      ),
    },
    {
      header: t('CoursesManagement.surveyTemplateColumnsName'),
      cell: (props) => renderCourseTitle(props),
    },
    {
      header: t('CoursesManagement.columnHeader.Category'),
      cell: (props) => renderCourseCategory(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.SubCategory'),
      cell: (props) => renderCourseSubCategory(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },

    {
      header: t('Codes.courses'),
      cell: (props) => renderCourseImages(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Codes.action'),
      cell: (props) => actionRender(props),
    },
  ];

  const renderCourseCodeType = (item: CellProps) => {
    return <p className="capitalize">{item?.course_code_type}</p>;
  };
  const actionRender = (item: CellProps) => {
    if (
      (updateAccess &&
        Number(user?.id) === Number(item.created_by) &&
        deleteAccess &&
        Number(user?.id) === Number(item.created_by)) ||
      user?.role_name === ROLES.Admin
    ) {
      return (
        <div className="flex gap-2 items-center justify-center ms-auto">
          {((updateAccess && Number(user?.id) === Number(item.created_by)) ||
            user?.role_name === ROLES.Admin) && (
              <Button
                parentClass="h-fit"
                className="action-button primary-btn relative group"
                onClickHandler={() => {
                  setSelectedData(item as unknown as Code);
                  codeModal?.openModal();
                }}
                tooltipText={t('Codes.edit')}
              >
                <Image
                  iconName="editIcon"
                  iconClassName="stroke-current w-5 h-5"
                  width={24}
                  height={24}
                />
              </Button>
            )}

          {((deleteAccess && Number(user?.id) === Number(item.created_by)) ||
            user?.role_name === ROLES.Admin) && (
              <Button
                parentClass="h-fit"
                className="action-button red-btn relative group"
                onClickHandler={() => {
                  setSelectedData(item as unknown as Code);
                  deleteModal?.openModal();
                }}
                tooltipText={t('Codes.delete')}
              >
                <Image iconName="deleteIcon" iconClassName="stroke-current w-5 h-5" />
              </Button>
            )}
        </div>
      );
    }
    return <p>-</p>;
  };

  const renderCourseImages = (props: CellProps) => {
    const code = props as unknown as Code;
    const maxImagesToShow = 6;
    const visibleCourses = (code.courses ?? []).slice(0, maxImagesToShow);
    const remainingCount = Math.max(
      0,
      (code.courses ?? []).length - maxImagesToShow
    );

    return (
      <>
        {visibleCourses.map((item) => (
          <div
            key={item.id}
            className="w-16 h-10 border border-solid border-borderColor rounded-md overflow-hidden"
          >
            <Image
              width={64}
              height={40}
              src={item.image ?? '/images/no-image.png'}
              alt=""
              imgClassName="w-full h-full object-cover"
              serverPath
            />
          </div>
        ))}
        {visibleCourses.length === 0 && '-'}

        {remainingCount > 0 && <>+{remainingCount}</>}
      </>
    );
  };
  const renderCourseTitle = (props: CellProps) => {
    const code = props as unknown as Code;
    const visibleCourses = code.courses ?? [];
    return (
      <>
        {code?.course_code_type === CodeType.COURSE ? (
          visibleCourses.map((item) => (
            <div key={item.id} className="w-48 min-h-10 flex items-center">
              <p>{item?.title}</p>
            </div>
          ))
        ) : (
          <div className="w-48 min-h-10 flex items-center">
            <p>{code?.title}</p>
          </div>
        )}
        {code?.course_code_type === CodeType.COURSE &&
          visibleCourses?.length === 0 && <p>-</p>}
      </>
    );
  };

  const renderCourseCategory = (props: CellProps) => {
    const code = props as unknown as Code;
    const visibleCourses = code.courses ?? [];
    return (
      <>
        {visibleCourses.map((item) => (
          <div key={item.id} className="w-48 min-h-10 flex items-center">
            {item?.courseCategory?.name}
          </div>
        ))}
        {visibleCourses.length === 0 && '-'}
      </>
    );
  };

  const renderCourseSubCategory = (props: CellProps) => {
    const code = props as unknown as Code;
    const visibleCourses = code.courses ?? [];
    return (
      <>
        {visibleCourses.map((item) => (
          <div key={item.id} className="w-48 min-h-10 flex items-center">
            {item?.courseSubCategory !== null ? item?.courseSubCategory?.name : '-'}
          </div>
        ))}
        {visibleCourses.length === 0 && '-'}
      </>
    );
  };

  const handleDelete = async () => {
    if (selectedData) {
      await codeDeleteApi(`/codes/delete?slug=${selectedData?.slug}`);
      deleteModal.closeModal();
      refetch();
    }
  };

  // ** UseEffects
  useEffect(() => {
    if (response?.data?.data) {
      setCodeData(response.data.data);
    }
  }, [response]);

  const handleBulkUpload = async (insertObj: FormikValues) => {
    const resp = await bulkUploadCode('codes/bulkInsert', {
      // role: Number(currentRole?.id),
      codes: insertObj,
    });
    bulkUploadModal.closeModal();
    if (!resp?.error) refetch();
    if (resp?.error && resp?.data && Object.keys(resp?.data)?.length > 0) {
      for (const errorMessage of resp?.data?.split(', ') ?? []) {
        if (errorMessage) {
          dispatch(
            setToast({
              variant: 'Error',
              message: errorMessage,
              type: 'error',
              id: customRandomNumberGenerator(),
            })
          );
          // eslint-disable-next-line no-await-in-loop
          await wait(0);
        }
      }
    }
  };

  const handleExportData = async () => {
    const resp = await getAllCodes('/codes', {
      params: {
        limit: response?.data?.count ?? limit * currentPage,
        exportCode: true,
        courseCategory,
        courseSubCategory,
      },
    });
    exportDataFunc({
      response: resp?.data?.data,
      exportFor: 'codes',
    });
  };

  return (
    <>
      {codeModal?.isOpen && (
        <AddEditCode
          modal={codeModal}
          data={selectedData}
          setData={setSelectedData}
          refetch={refetch}
        />
      )}
      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('Codes.deleteText', { CODE: selectedData?.code })}
          variants="primary"
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonVariant="danger"
          deleteTitle={t('Button.deleteTitle')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={deleteModal.closeModal}
          confirmButtonFunction={handleDelete}
        />
      )}
      <PageHeader text={t('Codes.codes')} small addSpace isScroll>
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

          <Button variants="whiteBordered" onClickHandler={() => handleExportData()}>
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="exportCsv" iconClassName="w-full h-full" />
            </span>
            {t('PrivateMembers.membersButtons.exportButton')}
          </Button>

          <Button
            variants="whiteBordered"
            onClickHandler={() => {
              bulkUploadModal.openModal();
            }}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="bulkUpload" iconClassName="w-full h-full" />
            </span>
            {t('PrivateMembers.membersButtons.bulkUploadButton')}
          </Button>

          <CodeFilter
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            setFilterApply={setFilterApply}
            filterApply={filterApply as unknown as FilterObject}
          />

          <Button
            variants="primary"
            onClickHandler={() => {
              setSelectedData(null);
              codeModal.openModal();
            }}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="plusIcon" iconClassName="w-full h-full" />
            </span>
            {t('Codes.addCode')}
          </Button>
        </div>
      </PageHeader>
      <Table
        headerData={columnData}
        bodyData={codeData}
        loader={isLoading}
        pagination
        dataPerPage={limit}
        setLimit={setLimit}
        totalPage={response?.data?.lastPage}
        dataCount={response?.data?.count}
        setSort={setSort}
        sort={sort}
      />
      {bulkUploadModal?.isOpen ? (
        <BulkUploadModal
          exportFor="codes"
          formFields={CodeBulkUploadObject(t)}
          modal={bulkUploadModal}
          validationSchema={CodeBulkUploadValidationSchema(t)}
          handleBulkUploadSubmit={handleBulkUpload}
          notesForData={[uploadNotes.AllowedCodeCourse, uploadNotes.CodeCourseType]}
        />
      ) : (
        ''
      )}
    </>
  );
};

export default CodesManagement;
