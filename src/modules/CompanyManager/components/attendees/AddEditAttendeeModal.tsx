// ** imports **
import { Form, Formik, FormikProps, FormikValues } from 'formik';
import { useAxiosGet, useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// ** components **

import InputField from 'components/FormElement/InputField';
import PhoneNumberInput from 'components/FormElement/PhoneNumberInput';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Modal } from 'components/Modal/Modal';

// ** types **
import { Option } from 'components/FormElement/types';
import _ from 'lodash';
import {
  AttendeeDetailsProps,
  AttendeeInitialProps,
} from 'modules/CompanyManager/types';

// ** constants **
import { ROLES } from 'constants/roleAndPermission.constant';

// ** validation **
import { AttendeeValidationSchema } from 'modules/CompanyManager/validation';

// ** redux **
import { languageConstant } from 'constants/common.constant';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

export const AddEditAttendeeModal = ({
  modal,
  data,
  refetch,
  courseId,
  company_id,
  publishCourseSlug,
  isFromSideBar = false,
}: AttendeeDetailsProps) => {
  const { t } = useTranslation();
  const getLang = useSelector(useLanguage);
  const ActiveCompany = useSelector(useCompany);
  const CurrentUser = useSelector(getCurrentUser);
  const formikRef = useRef<FormikProps<FormikValues>>();
  const [companyManagerCreateApi, { isLoading: creatingClientLoading }] =
    useAxiosPost();
  const [companyManagerUpdateApi, { isLoading: updatingClientLoading }] =
    useAxiosPut();
  const [clientGetApi, { isLoading }] = useAxiosGet();
  const [clientGetPagginatedApi] = useAxiosGet();
  const [roleGetApi, { isLoading: roleLoading }] = useAxiosGet();

  const [companyList, setCompanyList] = useState<Option[]>([]);
  const [courseList, setCourseList] = useState<Option[]>([]);
  const [profileList, setProfileList] = useState<Option[]>([]);
  const [isUnknown, setIsUnknown] = useState(false);

  const showAttendanceIcon =
    new Date() >= new Date(data?.course?.end_date as string);

  useEffect(() => {
    if (
      CurrentUser?.role_name === ROLES.Trainer ||
      CurrentUser?.role_name === ROLES.Admin ||
      CurrentUser?.role_name === ROLES.TrainingSpecialist ||
      CurrentUser?.role_name === ROLES.CompanyManager
    ) {
      GetCompany();
      GetCourse();
    }
  }, [CurrentUser]);

  useEffect(() => {
    if (data) {
      GetProfiles(data?.company_id);
    }
    if (!data && company_id) {
      GetProfiles(company_id);
    }
    if (!data && !company_id && ActiveCompany?.company?.id) {
      GetProfiles(ActiveCompany?.company?.id);
    }
  }, [data, company_id]);

  const GetProfiles = async (cId: string | number) => {
    const response = await roleGetApi(`/profile`, {
      params: {
        dropdown: true,
        label: 'job_title',
        value: 'slug',
        unassigned_companies: true,
        ...(!_.isBoolean(cId)
          ? {
              company_id: ActiveCompany?.company?.id ?? cId,
            }
          : {}),
      },
    });
    if (response?.data) {
      setProfileList(response.data);
    }
  };
  const GetCompany = async () => {
    const response = await roleGetApi(`/companies/dropdown`);
    if (CurrentUser?.role_name === ROLES.Trainer) {
      setCompanyList([...response.data, { label: 'Unknown', value: true }]);
    } else if (response?.data) {
      setCompanyList(response.data);
    }
  };

  const GetCourse = async (page?: number) => {
    const response = await clientGetApi('/course/published', {
      params: {
        page,
        label: 'title',
        is_code: true,
      },
    });
    if (response?.data) {
      const updatedList = response?.data?.data?.map(
        (item: { progressive_number: string; title: string; id: string }) => ({
          label: `${item.progressive_number} - ${item.title}`,
          value: item.id,
        })
      );
      if (page) {
        return updatedList;
      }
      setCourseList(updatedList);
    }
  };

  const GetPaginatedOption = async (page: number) => {
    const response = await clientGetPagginatedApi('/course/published', {
      params: {
        page,
        label: 'title',
        is_code: true,
      },
    });
    if (response?.data) {
      return response?.data?.data?.map(
        (item: { progressive_number: string; title: string; id: string }) => ({
          label: `${item.progressive_number} - ${item.title}`,
          value: item.id,
        })
      );
    }
  };

  const companyId = ActiveCompany?.company?.id
    ? ActiveCompany.company.id
    : data?.company_id
    ? data.company_id
    : company_id || undefined;

  const initialValues: AttendeeInitialProps = {
    first_name: data?.first_name ?? '',
    last_name: data?.last_name ?? '',
    job_title: data?.profileCourseParticipate?.slug ?? '',
    email: data?.email ?? '',
    mobile_number: data?.mobile_number ?? '',
    code: data?.code ?? '',
    manager_id:
      CurrentUser?.role_name === ROLES.CompanyManager
        ? CurrentUser?.id?.toString()
        : data?.manager_id,
    course_id: data?.course_id ?? courseId,
    company_id: companyId,
    ...(CurrentUser?.role_name === ROLES.Trainer ? { company_id: '' } : {}),

    company_name: '',
  };
  const OnSubmit = async (attendees: FormikValues) => {
    if (attendees) {
      if (data) {
        attendees = { ...attendees, slug: data?.slug };
      }
      if (isUnknown) {
        delete attendees?.manager_id;
        delete attendees?.company_id;
        attendees.is_unknown = isUnknown;
      }
      const formData = new FormData();
      Object.entries(attendees).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
      if (data) {
        const { error } = await companyManagerUpdateApi(
          `/course/participates`,
          formData
        );
        if (!error) {
          modal.closeModal();
          refetch();
        }
      } else {
        const { error } = await companyManagerCreateApi(
          `/course/participates`,
          formData
        );
        if (!error) {
          modal.closeModal();
          refetch();
        }
      }
    }
  };
  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };
  return (
    <Modal
      headerTitle={
        data === null
          ? t('CompanyManager.AttendeeList.addAttendeeTitle')
          : t('CompanyManager.AttendeeList.editAttendeeTitle')
      }
      modal={modal}
      showFooter
      footerButtonTitle={t('Button.cancelButton')}
      footerSubmit={handleSubmitRef}
      closeOnOutsideClick
      isSubmitLoading={creatingClientLoading || updatingClientLoading}
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={AttendeeValidationSchema(
          CurrentUser,
          isFromSideBar,
          isUnknown
        )}
        onSubmit={(values) => OnSubmit(values)}
        innerRef={formikRef as React.Ref<FormikProps<FormikValues>>}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form className="grid lg:grid-cols-2 gap-4">
              <InputField
                placeholder={t('CompanyManager.AttendeeList.firstNamePlaceholder')}
                type="text"
                isCompulsory
                value={values.first_name}
                label={t('CompanyManager.AttendeeList.firstNameTitle')}
                name="first_name"
                isLoading={isLoading}
              />
              <InputField
                placeholder={t('CompanyManager.AttendeeList.lastNamePlaceholder')}
                type="text"
                isCompulsory
                value={values.last_name}
                label={t('CompanyManager.AttendeeList.lastNameTitle')}
                name="last_name"
                isLoading={isLoading}
              />

              <PhoneNumberInput
                placeholder={t('CompanyManager.AttendeeList.contactPlaceholder')}
                label={t('CompanyManager.AttendeeList.contactTitle')}
                name="mobile_number"
                isLoading={isLoading}
              />

              {(CurrentUser?.role_name === ROLES.Trainer ||
                CurrentUser?.role_name === ROLES.Admin ||
                CurrentUser?.role_name === ROLES.TrainingSpecialist) && (
                <>
                  <ReactSelect
                    isCompulsory
                    label={t('Quote.company.title')}
                    placeholder={t('Quote.company.title')}
                    options={companyList}
                    onChange={(e) => {
                      if ((e as Option)?.label === 'Unknown') {
                        setIsUnknown(true);
                      } else if ((e as Option)?.label !== 'Unknown') {
                        setIsUnknown(false);
                      }
                      setFieldValue('company_id', (e as Option)?.value);
                      GetProfiles((e as Option)?.value);
                    }}
                    name="company_id"
                    disabled={!!company_id}
                    selectedValue={company_id ?? ''}
                    isLoading={isLoading}
                  />

                  {isUnknown && (
                    <InputField
                      placeholder={t('Auth.RegisterCompany.companyName')}
                      type="text"
                      isCompulsory
                      value={values.company_name}
                      label={t('Auth.RegisterCompany.companyName')}
                      name="company_name"
                      isLoading={isLoading}
                    />
                  )}
                  {!showAttendanceIcon &&
                    CurrentUser?.role_name !== ROLES.Trainer && (
                      <ReactSelect
                        loadOptions={GetPaginatedOption}
                        isPaginated
                        isCompulsory={!isFromSideBar}
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.courseDropDown'
                        )}
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.courseDropDown'
                        )}
                        options={courseList ?? []}
                        name="course_id"
                        selectedValue={values?.course_id ?? ''}
                        disabled={!!publishCourseSlug}
                        isLoading={isLoading}
                      />
                    )}
                </>
              )}
              <ReactSelect
                label={t('CompanyManager.AttendeeList.roleTitle')}
                placeholder={t('CompanyManager.AttendeeList.roleTitle')}
                options={profileList ?? []}
                name="job_title"
                isLoading={isLoading || roleLoading}
                isCompulsory
                isInput
              />
              <div>
                <InputField
                  placeholder={t('CompanyManager.AttendeeList.emailPlaceholder')}
                  type="text"
                  value={values.email}
                  label={t('CompanyManager.AttendeeList.emailTitle')}
                  name="email"
                  isLoading={isLoading}
                />
                <span className="text-xs text-primary">{t('emailInfo.note')}</span>
              </div>
              <div>
                <InputField
                  placeholder={t('CompanyManager.AttendeeList.codePlaceholder')}
                  type="text"
                  isCompulsory
                  value={values.code}
                  label={t('socialSecurityNumber')}
                  name="code"
                  isLoading={isLoading}
                />
                {getLang.language === languageConstant.EN && (
                  <span className="text-xs text-primary">
                    {t('CompanyManager.AttendeeList.uniqueNumberInfo')}
                  </span>
                )}
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};
