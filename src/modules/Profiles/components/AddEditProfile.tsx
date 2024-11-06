// ** Components
import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik } from 'formik';

// ** Types
import { AddEditProfileProps } from 'modules/Profiles/types';

// ** Hooks
import { useAxiosGet, useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Redux
import { useSelector } from 'react-redux';

// ** Slices
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { capitalizeFirstCharacter } from 'utils';

// ** Validation schema
import { ProfileValidation } from 'modules/Profiles/validation';

// ** Helpers
import { sortLanguages } from 'modules/Courses/helper/CourseTemplateHelper';

const AddEditProfile = ({ data, modal, refetch }: AddEditProfileProps) => {
  const { t } = useTranslation();

  // ** APIs
  const [createProfileApi, { isLoading: profileCreating }] = useAxiosPost();
  const [updateProfileApi, { isLoading: profileUpdating }] = useAxiosPut();
  const [getProfileApi, { isLoading: profileLoading }] = useAxiosGet();
  const { response, isLoading: companiesLoading } =
    useQueryGetFunction('/companies/dropdown');

  // ** Selector
  const { allLanguages } = useSelector(useLanguage);

  // ** States
  const [currentProfile, setCurrentProfile] = useState<Record<
    string,
    string
  > | null>(null);

  // ** CONTSs
  const formLanguages = [...(allLanguages ?? [])].sort(sortLanguages);

  const initialValues: Record<string, string | null> = {
    company_id: currentProfile?.company_id_italian ?? null,
  };

  const fieldObject: {
    job_title: string;
    description: string;
    label: string;
    key: string;
  }[] = [];

  (formLanguages ?? []).forEach((lang) => {
    // ** Adding attributes for all languages
    fieldObject.push({
      key: lang.short_name,
      job_title: `job_title_${lang.name}`,
      description: `description_${lang.name}`,
      label: capitalizeFirstCharacter(lang.name),
    });

    // ** adding all languages field to initialvalue object
    initialValues[`job_title_${lang.name}`] =
      currentProfile?.[`job_title_${lang.name}`] ?? '';
    initialValues[`description_${lang.name}`] =
      currentProfile?.[`description_${lang.name}`] ?? '';

    if (currentProfile)
      initialValues[`id_${lang.name}`] = currentProfile?.[`id_${lang.name}`];
  });

  const headerTitle = data ? t('Profiles.editProfile') : t('Profiles.addProfile');

  const fetchProfile = async () => {
    const response = await getProfileApi('/profile', {
      params: {
        allLanguage: true,
        simplifyResponseByLanguage: true,
        getByParentSlug: data?.slug,
      },
    });
    const profile = response.data;
    if (Array.isArray(profile?.data) && profile?.data?.length > 0)
      setCurrentProfile(profile?.data?.[0]);
  };

  const OnSubmit = async (profile: Record<string, string | null>) => {
    if (profile) {
      const profileData = { ...profile, company_id: profile?.company_id ?? null };
      const formData = new FormData();
      Object.entries(profileData).forEach(([key, value]) => {
        formData.append(key, (value ?? '') as string);
      });
      const apiFunction = data ? updateProfileApi : createProfileApi;
      const response = await apiFunction(`/profile`, formData);
      if (!response.error) {
        modal.closeModal();
        if (refetch) refetch();
      }
    }
  };

  useEffect(() => {
    if (data) fetchProfile();
  }, [data]);

  return (
    <Modal headerTitle={headerTitle} modal={modal} closeOnOutsideClick>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={ProfileValidation()}
        onSubmit={(values) => OnSubmit(values)}
      >
        {() => {
          return (
            <Form>
              <div className="grid grid-cols-2 gap-4  ">
                {/* ** Displaying input field for all languages ** */}
                {fieldObject.map((language, index) => {
                  return (
                    <Fragment key={`Profile_${index + 1}`}>
                      <InputField
                        isCompulsory
                        placeholder={t('Profiles.titlePlaceholder')}
                        type="text"
                        label={`${t('Profiles.title')} ( ${language.label} )`}
                        name={language.job_title}
                        isLoading={profileLoading}
                      />
                      <InputField
                        placeholder={t('Profiles.descriptionPlaceholder')}
                        type="text"
                        label={`${t('Profiles.description')} ( ${language.label} )`}
                        name={language.description}
                        isLoading={profileLoading}
                        isCompulsory
                      />
                    </Fragment>
                  );
                })}
                <ReactSelect
                  isClearable
                  label={t('Profiles.company')}
                  placeholder={t('Profiles.companyPlaceholder')}
                  options={response?.data ?? []}
                  name="company_id"
                  isLoading={companiesLoading}
                />
              </div>

              <div className="flex justify-end gap-4 col-span-2 mt-3">
                <Button
                  className="min-w-[90px]"
                  variants="whiteBordered"
                  onClickHandler={modal.closeModal}
                >
                  {t('Button.cancelButton')}
                </Button>

                <Button
                  className="min-w-[90px]"
                  type="submit"
                  variants="primary"
                  isLoading={profileCreating || profileUpdating}
                >
                  {data
                    ? t('CoursesManagement.CourseCategory.AddEditSubCategory.update')
                    : t('CoursesManagement.CourseCategory.AddEditSubCategory.add')}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default AddEditProfile;
