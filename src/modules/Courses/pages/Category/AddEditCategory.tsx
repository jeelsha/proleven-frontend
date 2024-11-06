import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import DropZone from 'components/FormElement/DropZoneField';
import InputField from 'components/FormElement/InputField';
import { EnumFileType } from 'components/FormElement/enum';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosGet, useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { AddEditCategoryProps, CourseCategory } from 'modules/Courses/types';
import { CategoryValidation } from 'modules/Courses/validation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { capitalizeFirstCharacter } from 'utils';

const AddEditCategory = ({
  modal,
  data,
  setData,
  refetch,
  isView,
}: AddEditCategoryProps) => {
  const { t } = useTranslation();
  const { allLanguages } = useSelector(useLanguage);

  // ** APIs
  const [createCategoryApi, { isLoading: categoryCreating }] = useAxiosPost();
  const [updateCategoryApi, { isLoading: categoryUpdating }] = useAxiosPut();
  const [getCategoryApi, { isLoading: categoryLoading }] = useAxiosGet();

  // ** States
  const [currentCategory, setCurrentCategory] = useState<CourseCategory | null>(
    null
  );

  const fetchCategory = async () => {
    const response = await getCategoryApi('/course-category', {
      params: {
        allLanguage: true,
        simplifyResponseByLanguage: true,
        getByParentSlug: data?.slug,
      },
    });
    const category = response.data;
    if (Array.isArray(category?.data) && category?.data?.length > 0)
      setCurrentCategory(category?.data?.[0]);
  };
  useEffect(() => {
    if (data) fetchCategory();
  }, [data]);

  // Initialvalue for image
  const initialValues: Record<string, string | boolean> = {
    course_category_image: currentCategory?.image_english
      ? currentCategory?.image_english
      : '',
    is_legislation_included: currentCategory?.is_legislation_included_english
      ? currentCategory?.is_legislation_included_english
      : false,
    legislation_term: currentCategory?.legislation_term_english
      ? currentCategory?.legislation_term_english
      : '',
  };

  const fieldObject: { name: string; key: string; label: string }[] = [];

  (allLanguages ?? []).forEach((lang) => {
    // ** Adding name attribute for all other optional languages
    fieldObject.push({
      key: lang.short_name,
      name: `name_${lang.name}`,
      label: capitalizeFirstCharacter(lang.name),
    });

    // ** adding all languages field to initialvalue object
    initialValues[`name_${lang.name}`] = currentCategory
      ? currentCategory[`name_${lang.name}`]
      : '';

    if (currentCategory)
      initialValues[`id_${lang.name}`] = currentCategory[`id_${lang.name}`];
  });

  const OnSubmit = async (categoryData: FormikValues) => {
    if (categoryData) {
      if (!categoryData.is_legislation_included)
        delete categoryData.legislation_term;
      const formData = new FormData();
      Object.entries(categoryData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const apiFunction = data ? updateCategoryApi : createCategoryApi;
      const response = await apiFunction(`/course-category`, formData);
      if (!response.error) {
        modal.closeModal();
        if (refetch) refetch();
        if (isView && setData) setData(null);
      }
    }
  };
  const headerTitle = data
    ? t('CoursesManagement.CourseCategory.AddEditCategory.editCategory')
    : t('CoursesManagement.CourseCategory.AddEditCategory.addCategory');
  return (
    <Modal
      headerTitle={headerTitle}
      modal={modal}
      closeOnOutsideClick
      setDataClear={isView ? setData : null}
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={CategoryValidation()}
        onSubmit={(values) => OnSubmit(values)}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <div className="grid grid-cols-2 gap-4  ">
              {/* *** Displaying input field for all languages ** */}
              {fieldObject.map((language, index) => {
                return (
                  <InputField
                    key={`Category_${index + 1}`}
                    isCompulsory
                    placeholder={t(
                      'CoursesManagement.CourseCategory.PlaceHolders.categoryNamePlaceHolder'
                    )}
                    type="text"
                    label={`${t(
                      'CoursesManagement.CourseCategory.AddEditCategory.category'
                    )} ( ${language.label} )`}
                    name={language.name}
                    isLoading={categoryLoading}
                  />
                );
              })}
              <Checkbox
                name="is_legislation_included"
                id="is_legislation_included"
                text={t(
                  'CoursesManagement.CourseCategory.AddEditCategory.legislation'
                )}
                check={Boolean(values.is_legislation_included)}
                isLoading={categoryLoading}
              />
            </div>
            {values.is_legislation_included ? (
              <InputField
                placeholder={t(
                  'CoursesManagement.CourseCategory.AddEditCategory.legislationTermPlaceholder'
                )}
                type="text"
                label={t(
                  'CoursesManagement.CourseCategory.AddEditCategory.legislationTerm'
                )}
                parentClass=" mt-4"
                name="legislation_term"
                isLoading={categoryLoading}
                isCompulsory
              />
            ) : (
              ''
            )}

            <DropZone
              value={values.course_category_image as string}
              label={t(
                'CoursesManagement.CourseCategory.AddEditCategory.categoryImage'
              )}
              SubTitle={t('Auth.AdditionalInfo.dragDropText')}
              name="course_category_image"
              setValue={setFieldValue}
              fileType={EnumFileType.Image}
              isCompulsory
              parentClass="mt-4"
              acceptTypes="image/*"
              isLoading={categoryLoading}
            />

            <div className="flex justify-end gap-4 col-span-2 mt-3">
              <Button
                className="min-w-[90px]"
                variants="whiteBordered"
                onClickHandler={() => {
                  if (isView && setData) setData(null);
                  modal.closeModal();
                }}
              >
                {t('Button.cancelButton')}
              </Button>

              <Button
                className="min-w-[90px]"
                type="submit"
                variants="primary"
                isLoading={categoryCreating || categoryUpdating}
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

export default AddEditCategory;
