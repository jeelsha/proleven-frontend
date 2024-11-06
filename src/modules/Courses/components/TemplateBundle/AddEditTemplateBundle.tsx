// ** Components **
import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import TextArea from 'components/FormElement/TextArea';
import { Modal } from 'components/Modal/Modal';

// ** Formik **
import { Form, Formik } from 'formik';

// ** Hooks **
import { useAxiosPost } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Types **
import { Option } from 'components/FormElement/types';
import { Course } from 'modules/Courses/types';
import { Bundle } from 'modules/Courses/types/TemplateBundle';
import { ModalProps } from 'types/common';

// ** Validation Schemas **
import { TemplateBundleSchema } from 'modules/Courses/validation/TemplateBundle';

export type AddEditBundleProps = {
  modal: ModalProps;
  refetch?: () => void;
  bundle?: Bundle;
};
interface CourseSubCategory {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  category_id: number;
  courses: Course[];
}

interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  image: string;
  courseSubCategories: CourseSubCategory[];
  courses: Course[];
}
interface TemplateBundleType {
  bundle_id?: number;
  course_slugs: Array<string>;
  title?: string;
  description?: string;
  category_id: Array<number>;
  sub_category_id: Array<number>;
}

const AddEditTemplateBundle = ({ modal, refetch, bundle }: AddEditBundleProps) => {
  const { t } = useTranslation();

  const [createBundleApi, { isLoading: bundleCreating }] = useAxiosPost();

  const categoryData: Option[] = [];
  const subCategoryData: Option[] = [];
  const courseData: Option[] = [];

  // ** Category dropdown
  const { response, isLoading } = useQueryGetFunction(
    '/course/template/categories',
    {
      option: { view: true },
    }
  );

  // ** STATES
  const [categoryIds, setCategoryIds] = useState<Array<number>>([]);
  const [subCategoryIds, setSubCategoryIds] = useState<Array<number>>([]);

  const { id: bundleId } = bundle ?? {};

  const initialValues: TemplateBundleType = {
    category_id: [],
    course_slugs: [],
    sub_category_id: [],
    title: '',
    description: '',
    bundle_id: bundleId,
  };

  const getCategoryData = () => {
    (response?.data?.data || []).map((category: CourseCategory) =>
      categoryData.push({
        label: category.name,
        value: category.id,
      })
    );
  };

  const getSubCategoryData = () => {
    response?.data?.data?.flatMap((category: CourseCategory) =>
      category.courseSubCategories
        ?.filter((subCategory) => categoryIds?.includes(subCategory.category_id))
        .forEach((subCategory) =>
          subCategoryData.push({ label: subCategory.name, value: subCategory.id })
        )
    );
  };

  const getCourseData = () => {
    response?.data?.data
      ?.flatMap((category: CourseCategory) => category?.courses)
      .filter(
        (course: Course) =>
          (categoryIds.length === 0 ||
            (course?.category_id && categoryIds.includes(course.category_id))) &&
          (subCategoryIds.length === 0 ||
            (course?.sub_category_id &&
              subCategoryIds.includes(course.sub_category_id)))
      )
      .forEach((course: Course) =>
        courseData.push({
          label: `${course.code} - ${course.title}`,
          value: course.slug ?? '',
        })
      );
  };

  getCategoryData();

  useEffect(() => {
    getSubCategoryData();
  }, [categoryData]);

  useEffect(() => {
    getCourseData();
  }, [subCategoryData]);

  const createFormData = (
    fieldArray: string[],
    val: TemplateBundleType
  ): FormData => {
    const formData = new FormData();
    fieldArray.forEach((field) => {
      formData.append(field, JSON.stringify(val[field as keyof TemplateBundleType]));
    });
    return formData;
  };

  const OnSubmit = async (val: TemplateBundleType) => {
    if (val) {
      const formData = bundleId
        ? createFormData(['course_slugs', 'bundle_id'], val)
        : createFormData(['course_slugs', 'title', 'description'], val);

      const { error } = await createBundleApi('/bundle', formData);
      if (!error) {
        modal.closeModal();
        if (refetch) refetch();
      }
    }
  };

  const handleCategoryOrSubCategoryChange = (
    val: Option | Option[],
    type: string | undefined,
    fieldName: 'sub_category_id' | 'category_id',
    setIdsFunction: React.Dispatch<React.SetStateAction<number[]>>,
    values: TemplateBundleType
  ) => {
    if (((val as Option[]) ?? []).length === 0) {
      setIdsFunction([]);
      return [];
    }
    const currentIds: Array<number> = values[fieldName] || [];
    const updatedIds =
      type === 'Removed'
        ? currentIds.filter((item) => item !== (val as Option[])[0].value)
        : [...currentIds, ...(val as Option[]).map((opt) => opt.value as number)];
    setIdsFunction(updatedIds);
    return updatedIds;
  };

  const filterData = (
    items: Array<number | string>,
    filterArray: Array<number | string>
  ) => {
    return items.filter((item) => filterArray.includes(item));
  };

  return (
    <Modal headerTitle={bundleId ? t('addCourse') : t('addBundle')} modal={modal}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={TemplateBundleSchema(bundleId)}
        onSubmit={(values) => OnSubmit(values)}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form className="grid grid-cols-2 gap-4">
              {!bundleId ? (
                <InputField
                  parentClass="w-full col-span-2"
                  placeholder={t(
                    'CoursesManagement.Bundle.AddEditBundle.Placeholders.bundleName'
                  )}
                  type="text"
                  isCompulsory
                  value={values.title}
                  label={t('CoursesManagement.Bundle.AddEditBundle.bundleName')}
                  name="title"
                  isLoading={isLoading}
                />
              ) : (
                ''
              )}
              <ReactSelect
                parentClass="w-full"
                label={t('CoursesManagement.Bundle.AddEditBundle.courseCategory')}
                name="category_id"
                options={categoryData ?? []}
                placeholder={t(
                  'CoursesManagement.Bundle.AddEditBundle.Placeholders.courseCategory'
                )}
                isMulti
                onChange={(val, type) => {
                  setFieldValue(
                    'category_id',
                    handleCategoryOrSubCategoryChange(
                      val as Option | Option[],
                      type,
                      'category_id',
                      setCategoryIds,
                      values
                    )
                  );
                  setFieldValue(
                    'sub_category_id',
                    filterData(
                      values.sub_category_id,
                      subCategoryData.map((val) => val.value)
                    )
                  );
                  setFieldValue(
                    'course_slugs',
                    filterData(
                      values.course_slugs,
                      courseData.map((val) => val.value)
                    )
                  );
                }}
                isClearable
                isLoading={isLoading}
              />

              <ReactSelect
                parentClass="w-full"
                label={t('CoursesManagement.Bundle.AddEditBundle.courseSubCategory')}
                name="sub_category_id"
                options={subCategoryData ?? []}
                placeholder={t(
                  'CoursesManagement.Bundle.AddEditBundle.Placeholders.courseSubCategory'
                )}
                isMulti
                onChange={(val, type) => {
                  setFieldValue(
                    'sub_category_id',
                    handleCategoryOrSubCategoryChange(
                      val as Option | Option[],
                      type,
                      'sub_category_id',
                      setSubCategoryIds,
                      values
                    )
                  );
                  setFieldValue(
                    'course_slugs',
                    filterData(
                      values.course_slugs,
                      courseData.map((val) => val.value)
                    )
                  );
                }}
                isClearable
                isLoading={isLoading}
              />
              <ReactSelect
                options={courseData ?? []}
                parentClass="col-span-2"
                isMulti
                name="course_slugs"
                label={t('CoursesManagement.Bundle.AddEditBundle.courses')}
                placeholder={t(
                  'CoursesManagement.Bundle.AddEditBundle.Placeholders.courses'
                )}
                isCompulsory
                isLoading={isLoading}
              />
              {!bundleId ? (
                <TextArea
                  parentClass=" col-span-2"
                  name="description"
                  label={t('Codes.description')}
                  placeholder={t('Codes.descriptionPlaceHolder')}
                  rows={3}
                  value={values.description}
                  isCompulsory
                  isLoading={isLoading}
                />
              ) : (
                ''
              )}

              <div className="flex justify-end gap-4 col-span-2">
                <Button
                  className="min-w-[90px]"
                  variants="whiteBordered"
                  onClickHandler={() => {
                    modal.closeModal();
                  }}
                >
                  {t('Button.cancelButton')}
                </Button>

                <Button
                  className="min-w-[90px]"
                  type="submit"
                  variants="primary"
                  isLoading={bundleCreating}
                  disabled={isLoading || bundleCreating}
                >
                  {t('Button.submit')}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default AddEditTemplateBundle;
