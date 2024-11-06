import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import Loaders from 'components/Loaders';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import { REACT_APP_DATE_FORMAT } from 'config';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format, parseISO } from 'date-fns';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { Lesson, LessonModeEnum } from './types';
import { useModal } from 'hooks/useModal';
import { isTodayGreaterThanGivenDate } from 'modules/Courses/helper/CourseCommon';
import { AddEditAttendeeModal } from 'modules/CompanyManager/components/attendees/AddEditAttendeeModal';
import BulkUploadModal from 'modules/UsersManagement/pages/bulkUploadModal';
import { CompanyManagerAttendeesBulkUploadObject } from 'constants/BulkUploadStructure';
import { AttendanceValidationSchema } from 'modules/Client/validation';
import { FormikValues } from 'formik';
import { Fields } from 'modules/UsersManagement/constants';
import { useBulkUploadMessageConstant } from 'constants/BulkUploadNotes';
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import { RoleFields } from 'types/common';

type AttendancePropsType = {
  showLessonSession?: boolean;
  showPageHeader?: boolean;
  urlToNavigate?: {
    url?: string;
    state?: Object;
  };
  singleCompanySheet?: boolean;
  activeTab?: number;
};

const AttendanceSheet = ({
  urlToNavigate,
  singleCompanySheet = false,
  showPageHeader = true,
  showLessonSession = true,
  activeTab,
}: AttendancePropsType) => {
  const updateTitle = useTitle();
  const attendeeModal = useModal();
  const BulkUploadAttendeeModal = useModal();
  const [clientGetApi] = useAxiosGet();
  const { t } = useTranslation();
  const { state } = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const user = useSelector(getCurrentUser);
  const [lesson, setLesson] = useState<Lesson[]>();
  const { Role_Fields } = Fields();
  const currentRole = Role_Fields.find((role) => role.key === ROLES.Trainer);
  const [selectedManager, setSelectedManager] = useState<string | number>();
  const [selectedCompany, setSelectedCompany] = useState<string | number>('');
  const [managersList, setManagersList] = useState<Option[]>([]);
  const [companyList, setCompanyList] = useState<Option[]>([]);
  const { uploadNotes } = useBulkUploadMessageConstant();
  const [allowFileUpload, setAllowFileUpload] = useState(false);
  const [uploadBulkAttendee, { isLoading: isBulkUploadLoading }] = useAxiosPost();

  const { response, isLoading, refetch } = useQueryGetFunction(`/trainer/courses`, {
    option: {
      profile: true,
      course_slug: params?.slug,
    },
  });
  useEffect(() => {
    setLesson(response?.data?.data?.[0]?.lessons);
  }, [response]);

  const isCourseCompleted = response?.data?.data?.[0]?.end_date
    ? isTodayGreaterThanGivenDate(response?.data?.data?.[0]?.end_date)
    : response?.data?.data?.[0]?.end_date;

  const navigateWithState = (path: string, additionalState = {}) => {
    navigate(path, {
      state: {
        slug: params?.slug,
        id: response?.data?.data?.[0]?.id,
        singleCompanySheet,
        activeTab: state?.activeTab,
        ...(urlToNavigate?.url && { url: urlToNavigate?.url }),
        ...(state?.company_id && { company_id: state?.company_id }),
        ...(state?.publish_course_slug && {
          publish_course_slug: state?.publish_course_slug,
        }),
        ...(state?.urlToNavigate && { urlToNavigate: state?.urlToNavigate }),
        ...(state?.status && { status: state?.status }),
        ...additionalState,
      },
    });
  };
  updateTitle(t('AttendanceSheet'));

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

  const handleBulkUpload = async (data: FormikValues) => {
    const attendeeObject: { [key: string]: unknown } = {
      manager_id: selectedManager,
      company_id: selectedCompany,
      participates: data,
    };
    if (response?.data?.data?.[0]?.id ?? state?.id)
      attendeeObject.course_id = response?.data?.data?.[0]?.id ?? state?.id;
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

  return (
    <div>
      {showPageHeader && (
        <PageHeader
          text={t('AttendanceSheet')}
          small
          url={
            !_.isEmpty(state) && state?.urlToNavigate
              ? state?.urlToNavigate
              : PRIVATE_NAVIGATION.trainerCourses.view.path
          }
          passState={{ ...state }}
        >
          <div className="flex justify-end gap-2 flex-wrap">
            {!isLoading && !isCourseCompleted ? (
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
      )}
      {isLoading ? (
        <div className="w-full text-center">
          <Loaders type="Spin" />
        </div>
      ) : (
        ''
      )}
      {!isLoading && !lesson?.length && !singleCompanySheet && (
        <NoDataFound message={t('Table.noDataFound')} />
      )}
      {!isLoading && lesson && lesson?.length > 0 ? (
        <CustomCard
          minimal
          cardClass={
            urlToNavigate &&
            urlToNavigate?.url?.split('company-list')[0] === '/courses/'
              ? 'hidden'
              : ''
          }
        >
          <div className="bg-offWhite/40 border border-solid border-borderColor rounded-xl p-4">
            {showLessonSession && (
              <div className="grid 1200:grid-cols-2 gap-5 mt-5">
                {lesson?.map((lessonData) => {
                  return (
                    <div
                      key={lessonData?.id}
                      className="p-5 bg-white border border-solid border-borderColor rounded-xl"
                    >
                      <div className="flex justify-between border-b border-solid border-borderColor pb-4">
                        <p className="text-base font-semibold text-dark">
                          {lessonData?.title}
                        </p>
                        <p className="text-sm font-normal text-dark">
                          {lessonData?.date
                            ? format(
                                parseISO(lessonData?.date),
                                REACT_APP_DATE_FORMAT as string
                              )
                            : ''}
                        </p>
                      </div>
                      {lessonData?.lesson_sessions?.map((item, index) => {
                        return (
                          <div className="mt-4 flex flex-col gap-y-5" key={item?.id}>
                            <div className="flex flex-wrap items-center justify-between">
                              <div className=" grid grid-cols-3 gap-x-2 w-[calc(100%_-_100px)]">
                                <p>{`${t('Calendar.eventDetails.sessionTitle')} ${
                                  index + 1
                                }`}</p>
                                <p>
                                  {item?.start_time
                                    ? format(parseISO(item?.start_time), 'hh:mm aa')
                                    : ''}
                                  -
                                  {item?.start_time
                                    ? format(parseISO(item?.end_time), 'hh:mm aa')
                                    : ''}
                                </p>
                                <StatusLabel
                                  className="h-fit"
                                  text={item?.mode ?? lessonData?.mode}
                                  variants="secondary"
                                />
                              </div>
                              <div className="flex gap-2">
                                {user?.role_name !== ROLES.CompanyManager &&
                                  user?.role_name !== ROLES.PrivateIndividual && (
                                    <Button
                                      className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center p-2.5"
                                      tooltipText={t('Tooltip.Edit')}
                                      onClickHandler={() => {
                                        navigateWithState(
                                          `/courses/attendee/${
                                            item?.mode ?? lessonData?.mode
                                          }/${params?.slug}`,
                                          { isEdit: true, lessonSessionId: item?.id }
                                        );
                                      }}
                                    >
                                      <Image
                                        iconName="editPen"
                                        iconClassName="w-full h-full"
                                      />
                                    </Button>
                                  )}
                                <Button
                                  className="w-11 h-11 rounded-full bg-green3/10 text-green3 flex items-center justify-center p-2.5"
                                  onClickHandler={() => {
                                    if (
                                      (item?.mode ?? lessonData?.mode) ===
                                      LessonModeEnum.InPerson
                                    ) {
                                      navigateWithState(
                                        `/courses/attendee/${
                                          item?.mode ?? lessonData?.mode
                                        }/${params?.slug}`,
                                        {
                                          ...(activeTab && {
                                            myCourseTab: activeTab,
                                          }),
                                          isEdit: false,
                                          lessonSessionId: item?.id,
                                        }
                                      );
                                    } else {
                                      navigateWithState(
                                        `/courses/attendee/${
                                          item?.mode ?? lessonData?.mode
                                        }/${params?.slug}`,
                                        {
                                          isEdit: false,
                                          lessonSessionId: item?.id,
                                        }
                                      );
                                    }
                                  }}
                                  tooltipText={t('Tooltip.View')}
                                >
                                  <Image
                                    iconName="eyeIcon"
                                    iconClassName="w-full h-full"
                                  />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CustomCard>
      ) : (
        ''
      )}
      {BulkUploadAttendeeModal?.isOpen ? (
        <BulkUploadModal
          isLoading={isBulkUploadLoading}
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
          company_id={state?.company_id ?? null}
          data={null}
          refetch={() => {
            refetch();
          }}
          courseId={response?.data?.data?.[0]?.id ?? state?.id}
          publishCourseSlug={state?.publish_course_slug}
        />
      )}
    </div>
  );
};

export default AttendanceSheet;
