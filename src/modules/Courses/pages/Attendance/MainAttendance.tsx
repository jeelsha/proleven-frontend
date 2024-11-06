import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import SearchComponent from 'components/Table/search';
import { useBulkUploadMessageConstant } from 'constants/BulkUploadNotes';
import { CompanyManagerAttendeesBulkUploadObject } from 'constants/BulkUploadStructure';
import { ROLES } from 'constants/roleAndPermission.constant';
import { FormikValues } from 'formik';
import { useAxiosGet, useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { AttendanceValidationSchema } from 'modules/Client/validation';
import { AddEditAttendeeModal } from 'modules/CompanyManager/components/attendees/AddEditAttendeeModal';
import AttendanceCard from 'modules/Courses/components/AttendanceCard';
import { isTodayGreaterThanGivenDate } from 'modules/Courses/helper/CourseCommon';
import { Fields } from 'modules/UsersManagement/constants';
import BulkUploadModal from 'modules/UsersManagement/pages/bulkUploadModal';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { RoleFields } from 'types/common';
import { useDebounce } from 'utils';
import { AttendanceSheetCourse, CourseParticipant } from './types';

const MainAttendance = () => {
  const updateTitle = useTitle();
  const { t } = useTranslation();
  const [clientGetApi] = useAxiosGet();
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 500);
  const [attendanceData, setAttendanceData] = useState<CourseParticipant[]>([]);
  const attendeeModal = useModal();
  const [addMainAttendance] = useAxiosPut();
  const BulkUploadAttendeeModal = useModal();
  const { Role_Fields } = Fields();
  const currentRole = Role_Fields.find((role) => role.key === ROLES.Trainer);
  const { uploadNotes } = useBulkUploadMessageConstant();
  const location = useLocation()?.state;
  const [allowFileUpload, setAllowFileUpload] = useState(false);
  const user = useSelector(getCurrentUser);
  const [managersList, setManagersList] = useState<Option[]>([]);
  const [companyList, setCompanyList] = useState<Option[]>([]);
  const [selectedManager, setSelectedManager] = useState<string | number>();
  const [selectedCompany, setSelectedCompany] = useState<string | number>('');
  const [courseData, setCourseData] = useState<AttendanceSheetCourse>();
  const [uploadBulkAttendee] = useAxiosPost();
  const activeCompany = useSelector(useCompany);

  const getCompanyId = () => {
    if (user?.role_name === ROLES.CompanyManager) {
      return {
        company_id: activeCompany?.company?.id,
      };
    }
    if (location?.singleCompanySheet) {
      return {
        company_id: location?.company_id,
      };
    }
  };

  const { response, refetch, isLoading } = useQueryGetFunction(
    `/trainer/courses/attendance-sheet`,
    {
      search: debouncedSearch,

      option: {
        course_slug: location?.slug,
        ...getCompanyId(),
      },
    }
  );
  const GetManagers = async () => {
    const response = await clientGetApi(
      `/managers/dropdown?company_id=${selectedCompany}`
    );
    if (response?.data) {
      setManagersList(response.data);
    }
  };
  const GetCompany = async () => {
    const response = await clientGetApi(`/companies/dropdown`);
    if (response?.data) {
      setCompanyList(response.data);
    }
  };
  useEffect(() => {
    if (selectedCompany) GetManagers();
    GetCompany();
  }, [selectedCompany]);
  useEffect(() => {
    setAttendanceData(response?.data?.participates?.data);
    setCourseData(response?.data?.course);
  }, [response]);
  const handleBulkUpload = async (data: FormikValues) => {
    const attendeeObject: { [key: string]: unknown } = {
      manager_id: selectedManager,
      company_id: selectedCompany,
      participates: data,
    };
    if (location?.id) attendeeObject.course_id = location?.id;
    const { error } = await uploadBulkAttendee(
      '/course/participates/bulk',
      attendeeObject
    );
    setAllowFileUpload(false);

    if (_.isEmpty(error)) {
      refetch();
    }
    BulkUploadAttendeeModal.closeModal();
  };

  const SelectCompanyComponent = () => {
    return (
      <div className="col-span-2">
        <ReactSelect
          options={companyList}
          label="Select Company"
          isCompulsory
          placeholder="Select Company"
          onChange={(obj) => {
            setSelectedCompany((obj as Option)?.value);
          }}
          selectedValue={selectedCompany}
        />
        <ReactSelect
          options={managersList}
          label="Select Manager"
          isCompulsory
          placeholder="Select Manager"
          onChange={(obj) => {
            setSelectedManager((obj as Option)?.value);
          }}
          selectedValue={selectedManager}
        />
      </div>
    );
  };

  const OnSubmit = async (
    data: CourseParticipant,
    signature: File | null,
    type: 'begin' | 'end'
  ) => {
    const formData = new FormData();

    if (type === 'begin') {
      if (signature) {
        formData.append('start_signature', signature);
        formData.append(
          'mark_as_start_signed_at',
          data?.courseAttendanceSheet[0].lessonSession.start_time
        );
      }
    } else if (type === 'end') {
      if (signature) {
        formData.append('end_signature', signature);
        formData.append(
          'mark_as_end_signed_at',
          data?.courseAttendanceSheet[0].lessonSession.end_time
        );
      }
    }

    formData.append('course_slug', location?.slug);
    formData.append('course_participate_id', data?.id.toString());
    formData.append('lesson_session_id', location?.lessonSessionId);

    const { error } = await addMainAttendance(
      '/trainer/courses/attendance-sheet/assign',
      formData
    );

    if (!error) {
      refetch?.();
    }
  };

  const isCourseCompleted = courseData?.end_date
    ? isTodayGreaterThanGivenDate(courseData?.end_date)
    : courseData?.end_date;

  updateTitle(t('AttendanceSheet'));

  return (
    <div
      className={user?.role_name === ROLES.CompanyManager ? 'pt-5 container' : ''}
    >
      <PageHeader
        text={t('AttendanceSheet')}
        small
        url={location?.url ? location?.url : `/courses/attendance/${location?.slug}`}
        passState={{ ...location }}
      >
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
          {!isLoading && location?.edit && !isCourseCompleted ? (
            <>
              <Button
                className="shrink-0"
                variants="primary"
                onClickHandler={() => {
                  BulkUploadAttendeeModal.openModal();
                }}
              >
                <span className="w-5 h-5 inline-block me-3">
                  <Image
                    iconName="userGroupStrokeSD"
                    iconClassName="w-full h-full"
                  />
                </span>
                {t('UserManagement.addEditUser.bulkUpload')}
              </Button>
              <Button
                variants="primary"
                className="gap-1 shrink-0"
                onClickHandler={() => {
                  attendeeModal?.openModal();
                }}
              >
                <Image iconName="plusSquareIcon" iconClassName="w-4 h-4" />
                {t('UserManagement.add')}
              </Button>
            </>
          ) : (
            ''
          )}
        </div>
      </PageHeader>

      {attendanceData?.length > 0 ? (
        <div className="1400:columns-2 gap-7">
          {attendanceData.map((data, index) => {
            return (
              <AttendanceCard
                data={data}
                index={index}
                key={data?.id}
                OnSubmit={OnSubmit}
                isEdit={location?.edit}
              />
            );
          })}
        </div>
      ) : (
        <NoDataFound message={t('AttendanceSheet.noDataMessage')} />
      )}

      {BulkUploadAttendeeModal?.isOpen ? (
        <BulkUploadModal
          currentRole={currentRole as RoleFields}
          exportFor="attendee"
          formFields={CompanyManagerAttendeesBulkUploadObject(t)}
          modal={BulkUploadAttendeeModal}
          validationSchema={AttendanceValidationSchema(t)}
          allowFileUpload={allowFileUpload}
          isValidData={
            selectedCompany !== undefined && selectedManager !== undefined
          }
          setAllowFilUpload={setAllowFileUpload}
          handleBulkUploadSubmit={handleBulkUpload}
          DynamicValueComponent={SelectCompanyComponent}
          notesForData={[
            uploadNotes.email,
            uploadNotes.mobileNumber,
            uploadNotes.CodiceFiscale,
          ]}
        />
      ) : (
        ''
      )}

      {attendeeModal?.isOpen && (
        <AddEditAttendeeModal
          modal={attendeeModal}
          company_id={location?.company_id ?? null}
          data={null}
          refetch={() => {
            refetch();
          }}
          courseId={location?.id}
          publishCourseSlug={location?.publish_course_slug}
        />
      )}
    </div>
  );
};

export default MainAttendance;
