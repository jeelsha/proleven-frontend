import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosGet, useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { AddEditSubCategoryProps, CourseSubCategory } from 'modules/Courses/types';
import { SubCategoryValidation } from 'modules/Courses/validation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { capitalizeFirstCharacter } from 'utils';

const AddEditSubCategory = ({
  modal,
  data,
  setData,
  slug: category_slug,
  refetch,
  is_legislation_included,
}: AddEditSubCategoryProps) => {
  const { t } = useTranslation();
  const { allLanguages } = useSelector(useLanguage);

  // ** APIs
  const [getSubCategoryApi, { isLoading: subCategoryLoading }] = useAxiosGet();
  const [createSubCategoryApi, { isLoading: subCategoryCreating }] = useAxiosPost();
  const [updateSubCategoryApi, { isLoading: subCategoryUpdating }] = useAxiosPut();

  const { response: surveyTemplate, isLoading: surveyLoading } = useQueryGetFunction(
    `/survey-template`,
    {
      option: { dropdown: true, label: 'title', value: 'slug' },
    }
  );

  // ** States
  const [currentSubCategory, setCurrentSubCategory] =
    useState<CourseSubCategory | null>(null);
  const [surveyDropDown, setSurveyDropDown] = useState<Option[]>([]);

  // ** CONSTs
  const isFormLoading = subCategoryLoading || surveyLoading;
  const isFormSubmitting = subCategoryCreating || subCategoryUpdating;

  // ** Adding name attribute for all languages
  const fieldObject = (allLanguages ?? []).map((lang) => ({
    key: lang.short_name,
    name: `name_${lang.name}`,
    label: capitalizeFirstCharacter(lang.name),
  }));

  // ** Adding all languages field to initial value object
  const initialValues: Record<string, string> = {};
  (allLanguages ?? []).forEach((lang) => {
    initialValues[`name_${lang.name}`] = currentSubCategory
      ? (currentSubCategory[`name_${lang.name}`] as string) ?? ''
      : '';
  });

  initialValues.survey_slug =
    (currentSubCategory?.surveyTemplate_italian as { slug: string })?.slug ?? '';
  initialValues.legislation_term =
    (currentSubCategory?.legislation_term_italian as string) ?? '';

  const fetchSubCategory = async () => {
    // ** Fetching sub categories with all languages by sub-category's own  slug
    const { data: subCategory } = await getSubCategoryApi('/course-sub-category', {
      params: {
        simplifyResponseByLanguage: true,
        allLanguage: true,
        slug: data?.slug,
      },
    });
    if (Array.isArray(subCategory?.data) && subCategory?.data?.length > 0)
      setCurrentSubCategory(subCategory?.data?.[0]);
  };

  const OnSubmit = async (subCategoryData: FormikValues) => {
    if (subCategoryData && category_slug) {
      if (!is_legislation_included) delete subCategoryData.legislation_term;
      const formData = new FormData();
      Object.entries(subCategoryData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      (allLanguages ?? []).forEach((lang) => {
        if (currentSubCategory)
          formData.append(
            `id_${lang.name}`,
            currentSubCategory[`id_${lang.name}`] as string
          );
      });
      formData.append('category_slug', category_slug);
      const apiFunction = data ? updateSubCategoryApi : createSubCategoryApi;

      const response = await apiFunction(`/course-sub-category`, formData);
      if (!response.error) {
        modal.closeModal();
        if (refetch){
          refetch(true)
          };
      }
    }
  };

  // ** UseEffects
  useEffect(() => {
    if (surveyTemplate) {
      setSurveyDropDown(surveyTemplate.data);
    }
  }, [surveyTemplate]);
  useEffect(() => {
    if (data) fetchSubCategory();
  }, [data]);
  return (
    <Modal
      headerTitle={
        data
          ? t('CoursesManagement.CourseCategory.AddEditSubCategory.editSubCategory')
          : t('CoursesManagement.CourseCategory.AddEditSubCategory.addSubCategory')
      }
      modal={modal}
      closeOnOutsideClick
      setDataClear={setData}
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={SubCategoryValidation(is_legislation_included)}
        onSubmit={(values) => OnSubmit(values)}
      >
        {({ values }) => (
          <Form>
            <div className="grid grid-cols-2 gap-4">
              {fieldObject.map((language, index) => {
                // Displaying input field for all other languages
                return (
                  <InputField
                    key={`SubCategory_${index + 1}`}
                    isCompulsory
                    placeholder={t(
                      'CoursesManagement.CourseCategory.PlaceHolders.subCategoryNamePlaceHolder'
                    )}
                    type="text"
                    value={values[language.name]}
                    label={`${t(
                      'CoursesManagement.CourseCategory.AddEditSubCategory.subCategoryName'
                    )} ( ${language.label} )`}
                    name={language.name}
                    isLoading={isFormLoading}
                  />
                );
              })}
              <ReactSelect
                isCompulsory
                name="survey_slug"
                options={surveyDropDown}
                label={t('SideNavigation.surveyTemplate')}
                placeholder={t(
                  'CourseManagement.surveyTemplate.dropDownPlaceHolder'
                )}
                selectedValue={values.survey_slug}
                isLoading={isFormLoading}
              />
              {is_legislation_included ? (
                <InputField
                  placeholder={t(
                    'CoursesManagement.CourseCategory.AddEditCategory.legislationTermPlaceholder'
                  )}
                  type="text"
                  label={t(
                    'CoursesManagement.CourseCategory.AddEditCategory.legislationTerm'
                  )}
                  name="legislation_term"
                  isCompulsory
                  isLoading={isFormLoading}
                />
              ) : (
                ''
              )}
            </div>
            <div className="flex justify-end gap-4 col-span-2 mt-3">
              <Button
                className="min-w-[90px]"
                variants="whiteBordered"
                onClickHandler={() => {
                  if (setData) setData(null);
                  modal.closeModal();
                }}
              >
                {t('Button.cancelButton')}
              </Button>

              <Button
                isLoading={isFormSubmitting}
                className="min-w-[90px]"
                type="submit"
                variants="primary"
              >
                {data
                  ? t('CoursesManagement.CourseCategory.AddEditSubCategory.update')
                  : t('CoursesManagement.CourseCategory.AddEditSubCategory.add')}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default AddEditSubCategory;
