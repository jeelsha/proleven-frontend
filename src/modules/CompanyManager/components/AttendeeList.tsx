// ** imports **
import { FormikValues } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDebounce, useHandleExport } from 'utils';

// ** components **
import Button from 'components/Button/Button';
import CourseFilters from 'components/CourseFilter/CourseFilters';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';
import { useBulkUploadMessageConstant } from 'constants/BulkUploadNotes';
import { CompanyManagerAttendeesBulkUploadObject } from 'constants/BulkUploadStructure';
import { useModal } from 'hooks/useModal';
import { AddEditAttendeeModal } from 'modules/CompanyManager/components/attendees/AddEditAttendeeModal';
import AttendanceTimeSheet from 'modules/Courses/pages/AttendanceTimeSheet';
import BulkUploadModal from 'modules/UsersManagement/pages/bulkUploadModal';

// ** types **
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import {
  AttendeeProps,
  FetchAttendeeDetails,
  IAttendees,
} from 'modules/CompanyManager/types';

// ** hooks **
import { useAxiosDelete, useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useRolePermission } from 'hooks/useRolePermission';

// ** constants **
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { Fields } from 'modules/UsersManagement/constants';
import { FilterStatus, RoleFields } from 'types/common';

// ** styles **
import 'modules/Client/styles/index.css';

// ** validation **
import { AttendanceValidationSchema } from 'modules/Client/validation';

// ** redux **
import useUpdateQueryParameters from 'hooks/useSearchQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { CourseMarkAsEnum } from 'modules/Courses/Constants';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { AddAttendeeEnum } from '../constants';
import ExistingAttendeeModal from './attendees/ExistingAttendeeModal';
import SelectionModal from './attendees/SelectionModal';
import { BulkUploadCourseModal } from './courses/CourseBulkUpload';
import { aesEncrypt } from 'utils/encrypt';
import { REACT_APP_ENCRYPTION_KEY } from 'config';

const PARAM_MAPPING = {
  companies: 'companies',
};

const AttendeeList = ({
  courseId,
  activeTab,
  courseMarkAs,
  isFromSideBar = false,
  unknownCompany = false,
  end_date,
  fromCompanyManager,
}: AttendeeProps) => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.client.attendee'));

  const navigate = useNavigate();
  const { state } = useLocation();

  const params = useParams();

  const deleteModal = useModal();
  const attendeeModal = useModal();
  const BulkUploadAttendeeModal = useModal();
  const ExistingParticipateModal = useModal();
  const selectionModal = useModal();

  const CurrentUser = useSelector(getCurrentUser);
  const { currentPage } = useSelector(currentPageSelector);

  const [companyManagerDeleteApi] = useAxiosDelete();
  const [companyManagerGetApi, { isLoading: pdfLoader }] = useAxiosGet();
  const [uploadBulkAttendee, { isLoading: isBulkUploadLoading }] = useAxiosPost();
  const [downloadAllCertificate, { isLoading: isCertificateLoading }] =
    useAxiosGet();
  const [getAllUserByRole, { isLoading: isExportLoading }] = useAxiosGet();
  const { exportDataFunc } = useHandleExport();

  const [limit, setLimit] = useState<number>(10);
  const url: URL = new URL(window.location.href);
  const QueryParams = url.search;
  const [sort, setSort] = useState<string>(isFromSideBar ? '-id' : '-updated_at');
  const [search, setSearch] = useState<string>('');
  const [selectedData, setSelectedData] = useState<FetchAttendeeDetails | null>(
    null
  );
  const [selectedCourse, setSelectedCourse] = useState<string | number>('');
  const [selectedCompany, setSelectedCompany] = useState<string | number>('');
  const [selectedOption, setSelectedOption] = useState(AddAttendeeEnum.newAttendee);
  const [attendeeData, setAttendeeData] = useState<FetchAttendeeDetails | null>(
    null
  );
  const [viewAttendance, setViewAttendance] = useState(false);
  const [allowFileUpload, setAllowFileUpload] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const [filterApply, setFilterApply] = useState<FilterStatus>({
    companies: QueryParams ? url.searchParams.getAll('companies') : [],
  });
  const [courseFilter, setCourseFilter] = useState<FilterStatus>({
    companies: QueryParams ? url.searchParams.getAll('companies') : [],
  });

  const ActiveCompany = useSelector(useCompany);
  const { Role_Fields } = Fields();
  const currentRole = Role_Fields.find(
    (role) => role.key === ROLES.PrivateIndividual
  );

  const deleteAccess = useRolePermission(
    FeaturesEnum.CourseParticipates,
    PermissionEnum.Delete
  );

  const editAccess = useRolePermission(
    FeaturesEnum.CourseParticipates,
    PermissionEnum.Update
  );
  const { uploadNotes } = useBulkUploadMessageConstant();

  const companies = url.searchParams.getAll('companies');
  const currDate = new Date();
  const courseEndTime = end_date ? new Date(end_date) : '';

  const KEY = REACT_APP_ENCRYPTION_KEY ?? '';

  const {
    response,
    isLoading,
    refetch: reFetchParticipate,
  } = useQueryGetFunction('/course/participates', {
    option: {
      ...(ROLES.CompanyManager === CurrentUser?.role_name
        ? { company_id: ActiveCompany.company?.id }
        : {}),
      ...(params?.slug && { course_slug: params?.slug }),
      ...(unknownCompany && { get_unknown: true, course_slug: state?.params }),
      // ...(isFromSideBar && { isGroupByCode: true }),
      companies,
      isGroupByCode: true,
    },
    search: debouncedSearch,
    page: currentPage,
    limit,
    sort,
  });

  const columnData: ITableHeaderProps[] = [
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
      name: 'first_name',
      header: t('CompanyManager.AttendeeList.columnsTitles.name'),
      option: {
        sort: true,
        hasFilter: false,
      },
      cell: (props) => nameRender(props as unknown as FetchAttendeeDetails),
    },
    {
      name: 'email',
      header: t('Auth.Login.email'),
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    ...(isFromSideBar
      ? [
          {
            name: 'code',
            header: t('socialSecurityNumber'),
            option: {
              sort: true,
              hasFilter: false,
            },
          },
        ]
      : []),
    {
      name: 'job_title',
      header: t('CompanyManager.AttendeeList.columnsTitles.role'),
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      name: 'mobile_number',
      header: t('CompanyManager.AttendeeList.columnsTitles.mobileNo'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    ...(fromCompanyManager || state?.comingFromManagerProfile
      ? [
          {
            name: 'code',
            header: t('socialSecurityNumber'),
            option: {
              sort: false,
              hasFilter: false,
            },
          },
        ]
      : []),

    ...(!isFromSideBar && !state?.comingFromManagerProfile && !fromCompanyManager
      ? [
          {
            name: 'course.course_title',
            header: t('CoursesManagement.CreateCourse.courseName'),
            option: {
              sort: true,
              hasFilter: false,
            },
            cell: (props: CellProps) =>
              courseTitleRender(props as unknown as FetchAttendeeDetails),
          },
        ]
      : []),
    ...(!fromCompanyManager && !state?.comingFromManagerProfile
      ? [
          {
            name: 'company.company_name',
            header: t('Quote.company.detail.nameTitle'),
            option: {
              sort: true,
              hasFilter: false,
            },
            cell: (props: CellProps) =>
              companyTitleRender(props as unknown as FetchAttendeeDetails),
          },
        ]
      : []),
    ...(!isFromSideBar && !fromCompanyManager && !state?.comingFromManagerProfile
      ? [
          {
            name: 'course.courseCategory.course_category',
            header: t('CoursesManagement.CourseCategory.courseCategory'),
            option: {
              sort: true,
              hasFilter: false,
            },
          },
        ]
      : []),
    ...(!unknownCompany && !isFromSideBar && !state?.comingFromManagerProfile
      ? [
          {
            header: t('RecoveredCourse.title'),
            option: {
              sort: false,
              hasFilter: false,
            },
            cell: (props: CellProps) =>
              renderRecoveredCourse(props as unknown as FetchAttendeeDetails),
          },
        ]
      : []),

    {
      header: t('Table.action'),
      cell: (props: CellProps) => actionRender(props as unknown as IAttendees),
    },
  ];

  const isTemplateCheck = useCallback((filters: FilterStatus) => {
    return (
      !_.isEmpty(filters.courseCode) ||
      !_.isEmpty(filters.courseCategory) ||
      !_.isEmpty(filters.courseSubCategory) ||
      !_.isEmpty(filters.companies) ||
      !_.isEmpty(filters.courseType)
    );
  }, []);

  useUpdateQueryParameters(
    filterApply,
    PARAM_MAPPING,
    'isAttendee',
    isTemplateCheck,
    state
  );

  useEffect(() => {
    if (
      window.location.pathname ===
      PRIVATE_NAVIGATION.clientsManagement.attendee.list.path
    )
      isFromSideBar = true;
  }, [window.location.pathname]);

  const courseTitleRender = (item: FetchAttendeeDetails) => {
    return item?.course ? (
      <div className="flex flex-col">
        <span>{item?.course?.title}</span>
        <span className="text-primary font-semibold">{item?.course?.code}</span>
        {item?.course?.type && (
          <span
            className={`${
              item?.course?.type === 'academy' ? 'text-primary' : 'text-green'
            } font-semibold capitalize`}
          >{`(${item?.course?.type})`}</span>
        )}
      </div>
    ) : (
      '-'
    );
  };
  const nameRender = (item: FetchAttendeeDetails) => {
    if (item?.full_name) {
      item.full_name = `${item.full_name}`;
    }
    return (
      <div className="flex flex-col">
        <span>{item?.full_name}</span>
        {!isFromSideBar && item?.recovered_from_course_id ? (
          <StatusLabel text={t('RecoveredCourse.recovered')} variants="completed" />
        ) : (
          ''
        )}
      </div>
    );
  };

  const companyTitleRender = (item: FetchAttendeeDetails) => {
    const companyName = item?.company?.name;
    const companySlug = item?.company?.slug;
    const commonContent = (
      <div
        className={`flex flex-col ${
          isFromSideBar ? 'hover:underline decoration-blue' : ''
        }`}
      >
        <span>{companyName}</span>
      </div>
    );

    if (isFromSideBar) {
      return companyName ? (
        <Link
          to={`${PRIVATE_NAVIGATION.clientsManagement.company.list.path}/view/${companySlug}`}
          target="_blank"
          className="flex-1"
        >
          {commonContent}
        </Link>
      ) : (
        '-'
      );
    }

    return companyName ? commonContent : '-';
  };
  const renderRecoveredCourse = (item: FetchAttendeeDetails) => {
    return (
      <div className="flex flex-col">
        {item?.recovered_from_course_id ? (
          <Button
            onClickHandler={() => {
              const companyId = item?.company_id ? item?.company_id?.toString() : '';
              const encryptedCompany = aesEncrypt(companyId, KEY);
              if (ROLES.CompanyManager === CurrentUser?.role_name) {
                setSelectedData(() => {
                  const courseData = {
                    ...(item as unknown as FetchAttendeeDetails),
                    course: { ...item?.recoverCourse },
                  } as unknown as FetchAttendeeDetails;
                  return courseData;
                });
                setViewAttendance(true);
              } else {
                navigate(
                  `/courses/company/attendance-timesheet/${item?.recoverCourse?.slug}/${encryptedCompany}`,
                  {
                    state: {
                      courseSlug: item?.recoverCourse?.slug,
                      companyId: item?.company_id,
                      participateSlug: item?.slug,
                      url: `/clients/attendee`,
                      ...(activeTab ? { myCourseTab: activeTab } : {}),
                    },
                  }
                );
              }
            }}
          >
            {item?.recoverCourse?.title}
          </Button>
        ) : (
          '-'
        )}
      </div>
    );
  };

  const DownloadCertificate = async (item: FetchAttendeeDetails) => {
    const { data, error } = await companyManagerGetApi(`/generate-certificate`, {
      params: {
        course_slug: params?.slug ?? item?.course?.slug,
        course_participate_slug: item?.slug,
      },
    });

    if (!error) {
      window.open(data, '_blank');
    }
  };

  const actionRender = (item: IAttendees) => {
    const itemProperties = item as unknown as FetchAttendeeDetails;
    const currentDate = new Date();
    const startDate = new Date(itemProperties?.course?.start_date as string);
    const endDate = new Date(itemProperties?.course?.end_date as string);
    const showAttendanceIcon = currentDate >= endDate;
    const showDeleteIcon = currentDate <= startDate;
    const url = !isFromSideBar
      ? `${PRIVATE_NAVIGATION.companyManager.attendeeList.list.path}/${item.slug}`
      : `${PRIVATE_NAVIGATION.clientsManagement.attendee.list.path}/${item.slug}`;

    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        {!unknownCompany && (
          <Button
            parentClass="h-fit"
            className="action-button green-btn"
            onClickHandler={() => {
              navigate(`${url}${QueryParams ?? ''}`, {
                state: {
                  companyId: ActiveCompany?.company?.id
                    ? ActiveCompany?.company?.id
                    : item.company_id,
                  activeTab,
                  unknownCompany,
                  ...(!isFromSideBar && { comingFromAttendeeTab: true }),
                  ...(!_.isEmpty(state) && {
                    comingFromManagerProfile: state?.comingFromManagerProfile,
                  }),
                  courseType: itemProperties?.course?.type,
                },
              });
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
        )}
        {((editAccess && CurrentUser?.id === item.created_by) ||
          CurrentUser?.role_name === ROLES.Admin) && (
          <Button
            parentClass="h-fit"
            className="action-button primary-btn"
            onClickHandler={() => {
              onEdit(item as unknown as FetchAttendeeDetails);
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
        {showAttendanceIcon &&
          !unknownCompany &&
          !isFromSideBar &&
          !state?.comingFromManagerProfile &&
          !state?.comingFromAttendeeTab &&
          !state?.fromAttendee && (
            <Button
              onClickHandler={() => {
                setSelectedData(item as unknown as FetchAttendeeDetails);
                setViewAttendance(true);
              }}
              parentClass="h-fit"
              className="action-button primary-btn"
              tooltipText={t('Tooltip.Attendance')}
            >
              <Image
                iconName="calendarCheckIcon"
                iconClassName="stroke-current w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
          )}
        {showDeleteIcon &&
          ((deleteAccess && CurrentUser?.id === item.created_by) ||
            CurrentUser?.role_name === ROLES.Admin) &&
          !unknownCompany && (
            <Button
              parentClass="h-fit"
              className="action-button red-btn"
              onClickHandler={() => {
                setSelectedData(item as unknown as FetchAttendeeDetails);
                deleteModal?.openModal();
              }}
              tooltipText={t('Tooltip.Delete')}
            >
              <Image iconName="deleteIcon" iconClassName="stroke-current w-5 h-5" />
            </Button>
          )}

        {!isFromSideBar &&
          !state?.comingFromManagerProfile &&
          !state?.comingFromAttendeeTab &&
          !state?.fromAttendee && (
            <Button
              parentClass="h-fit"
              className="action-button primary-btn"
              onClickHandler={() => {
                setSelectedData(item as unknown as FetchAttendeeDetails);
                DownloadCertificate(item as unknown as FetchAttendeeDetails);
              }}
              tooltipText={t('Tooltip.DownloadPDF')}
            >
              {pdfLoader && selectedData?.id === item.id && (
                <Image loaderType="Spin" />
              )}
              {(pdfLoader === false ||
                selectedData === null ||
                selectedData?.id !== item.id) && (
                <Image
                  iconName="downloadFile2"
                  iconClassName="stroke-current w-5 h-5"
                />
              )}
            </Button>
          )}
      </div>
    );
  };

  const onDelete = async () => {
    if (selectedData) {
      const slug = selectedData?.slug;
      const response = await companyManagerDeleteApi(`/course/participates/${slug}`);
      if (!response?.error) deleteModal.closeModal();
      reFetchParticipate();
    }
  };

  const onEdit = async (item: FetchAttendeeDetails) => {
    setSelectedData(item as unknown as FetchAttendeeDetails);
    attendeeModal?.openModal();
    const response = await companyManagerGetApi(`/course/participates`, {
      params: {
        company_id: ActiveCompany?.company?.id
          ? ActiveCompany?.company?.id
          : item.company_id,
        slug: item?.slug,
      },
    });
    setAttendeeData(response?.data);
  };

  const handleBulkUpload = async (data: FormikValues) => {
    const attendeeObject: { [key: string]: unknown } = {
      manager_id:
        CurrentUser?.role_name === ROLES.Trainer ? '' : CurrentUser?.id?.toString(),
      company_id:
        CurrentUser?.role_name === ROLES.Trainer
          ? ''
          : ActiveCompany?.company?.id ?? selectedCompany,
      participates: data,
    };
    if (courseId || selectedCourse) {
      attendeeObject.course_id = courseId ?? selectedCourse;
    }
    const { error } = await uploadBulkAttendee(
      '/course/participates/bulk',
      attendeeObject
    );
    setAllowFileUpload(false);

    if (_.isEmpty(error)) {
      reFetchParticipate();
    }
    BulkUploadAttendeeModal.closeModal();
  };

  const selectCompanyComponent = () => {
    return (
      <BulkUploadCourseModal
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
      />
    );
  };

  const renderBulkUploadModal = () => {
    const commonProps = {
      isLoading: isBulkUploadLoading,
      currentRole: currentRole as RoleFields,
      exportFor: 'attendee',
      formFields: CompanyManagerAttendeesBulkUploadObject(t),
      modal: BulkUploadAttendeeModal,
      validationSchema: AttendanceValidationSchema(t),
      handleBulkUploadSubmit: handleBulkUpload,
      notesForData: [
        uploadNotes.email,
        uploadNotes.mobileNumber,
        uploadNotes.CodiceFiscale,
      ],
    };

    if (BulkUploadAttendeeModal?.isOpen) {
      if (isFromSideBar) {
        return (
          <BulkUploadModal
            {...commonProps}
            allowFileUpload={allowFileUpload}
            isValidData={selectedCompany !== ''}
            setAllowFilUpload={setAllowFileUpload}
            DynamicValueComponent={selectCompanyComponent}
            fileName="Attendee"
          />
        );
      }
      return <BulkUploadModal {...commonProps} />;
    }

    return null;
  };

  const handleDownloadAllCertificate = async () => {
    const { error, data } = await downloadAllCertificate(
      `/generate-certificate-zip`,
      {
        params: {
          course_slug: params?.slug,
          company_id: ActiveCompany?.company?.id,
        },
      }
    );
    if (!error && data) {
      window.open(data, '_blank');
    }
  };

  const handleExportData = async () => {
    const resp = await getAllUserByRole('/course/participates', {
      params: {
        isGroupByCode: true,
        view: true,
        ...(ROLES.CompanyManager === CurrentUser?.role_name
          ? { company_id: ActiveCompany.company?.id }
          : {}),
      },
    });
    if (currentRole) {
      exportDataFunc({
        response: resp?.data?.data,
        currentRole,
        exportFor: 'attendee',
        fileName: 'Attendee',
      });
    }
  };

  const showAddButton =
    courseMarkAs !== CourseMarkAsEnum.SoldOut &&
    courseMarkAs !== CourseMarkAsEnum.TemporarySoldOut;

  return (
    <div
      className={`
      ${
        CurrentUser?.role_name === ROLES.CompanyManager &&
        url.pathname === '/attendee'
          ? 'container'
          : ''
      } `}
    >
      {!viewAttendance && (
        <PageHeader
          small
          text={
            unknownCompany
              ? t('unknownCompaniesAttendee')
              : t('CompanyManager.AttendeeList.title')
          }
          url={unknownCompany ? `/courses/company-list/${state?.params}` : ''}
          passState={unknownCompany ? { ...state } : {}}
        >
          {unknownCompany !== undefined && unknownCompany === false ? (
            <div className="flex justify-end gap-2 flex-wrap">
              {(isFromSideBar ||
                (!_.isEmpty(state) && state.comingFromManagerProfile) ||
                (CurrentUser?.role_name === ROLES.CompanyManager &&
                  url.pathname === '/attendee')) && (
                <div className="flex gap-2">
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
                  <Button
                    className="whitespace-nowrap"
                    variants="secondary"
                    isLoading={isExportLoading}
                    disabled={isExportLoading}
                    onClickHandler={() => {
                      handleExportData();
                    }}
                  >
                    <span className="w-5 h-5 inline-block me-2">
                      <Image iconName="exportCsv" iconClassName="w-full h-full" />
                    </span>
                    {t('ClientManagers.managersButtons.exportButton')}
                  </Button>
                </div>
              )}
              {showAddButton && (
                <Button
                  variants="primary"
                  onClickHandler={() => {
                    setSelectedCourse('');
                    setSelectedCompany('');
                    BulkUploadAttendeeModal.openModal();
                  }}
                >
                  <span className="w-5 h-5 inline-block me-3">
                    <Image iconName="bulkUpload" iconClassName="w-full h-full" />
                  </span>
                  {t('UserManagement.addEditUser.bulkUpload')}
                </Button>
              )}
              {isFromSideBar ? (
                <CourseFilters
                  componentType="attendees"
                  courseFilter={courseFilter}
                  setCourseFilter={setCourseFilter}
                  setFilterApply={setFilterApply}
                  filterApply={filterApply}
                />
              ) : (
                ''
              )}
              {showAddButton ? (
                <Button
                  variants="primary"
                  onClickHandler={() => {
                    const modalToOpen =
                      CurrentUser?.role_name === ROLES.Admin
                        ? attendeeModal
                        : selectionModal;
                    setAttendeeData(null);
                    modalToOpen.openModal();
                  }}
                >
                  <span className="w-5 h-5 inline-block me-2">
                    <Image
                      iconName="userGroupStrokeSD"
                      iconClassName="w-full h-full"
                    />
                  </span>
                  {t('CompanyManager.AttendeeList.addAttendee')}
                </Button>
              ) : (
                ''
              )}
              {CurrentUser?.role_name === ROLES.CompanyManager &&
              url.pathname !== '/attendee' &&
              !_.isEmpty(response?.data?.data) &&
              currDate > courseEndTime &&
              !state?.comingFromManagerProfile ? (
                <Button
                  variants="primary"
                  isLoading={isCertificateLoading}
                  onClickHandler={() => {
                    handleDownloadAllCertificate();
                  }}
                >
                  <span className="w-5 h-5 inline-block me-3">
                    <Image iconName="awardBadgeIcon" iconClassName="w-full h-full" />
                  </span>
                  {t('downloadAllCertificates')}
                </Button>
              ) : (
                ''
              )}
            </div>
          ) : (
            <></>
          )}
        </PageHeader>
      )}
      {attendeeModal?.isOpen && (
        <AddEditAttendeeModal
          isFromSideBar={isFromSideBar}
          modal={attendeeModal}
          data={attendeeData}
          setData={setSelectedData}
          refetch={() => {
            reFetchParticipate();
          }}
          courseId={courseId}
          company_id={attendeeData?.company_id}
        />
      )}
      {selectionModal?.isOpen && (
        <SelectionModal
          attendeeModal={attendeeModal}
          setSelectedOption={setSelectedOption}
          modal={selectionModal}
          selectedOption={selectedOption}
          existingAttendeeModal={ExistingParticipateModal}
        />
      )}
      {selectionModal?.isOpen && (
        <SelectionModal
          attendeeModal={attendeeModal}
          setSelectedOption={setSelectedOption}
          modal={selectionModal}
          selectedOption={selectedOption}
          existingAttendeeModal={ExistingParticipateModal}
        />
      )}
      {renderBulkUploadModal()}

      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('CompanyManager.AttendeeList.deleteText', {
            attendeeName: `${selectedData?.first_name} ${selectedData?.last_name}`,
          })}
          variants="primary"
          confirmButtonText={t('Button.deleteButton')}
          deleteTitle={t('Button.deleteTitle')}
          confirmButtonFunction={onDelete}
          confirmButtonVariant="primary"
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            setSelectedData(null);
            deleteModal.closeModal();
          }}
        />
      )}
      {!viewAttendance ? (
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
      ) : (
        selectedData && (
          <AttendanceTimeSheet
            course_slug={selectedData.course?.slug}
            participate_slug={selectedData.slug}
            company_id={Number(selectedData.company_id)}
            setViewAttendance={setViewAttendance}
            isCompanyManager={CurrentUser?.role_name === ROLES.CompanyManager}
          />
        )
      )}
      {ExistingParticipateModal?.isOpen && (
        <ExistingAttendeeModal
          reFetchParticipate={reFetchParticipate}
          modal={ExistingParticipateModal}
          courseId={courseId}
        />
      )}
    </div>
  );
};

export default AttendeeList;
