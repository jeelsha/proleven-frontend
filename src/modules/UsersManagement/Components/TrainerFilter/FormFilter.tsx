// ** Components **
import ReactSelect from 'components/FormElement/ReactSelect';

// ** Hooks **
import { useEffect, useState } from 'react';
import { useAxiosGet } from 'hooks/useAxios';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// ** Types **
import { Option } from 'components/FormElement/types';
import {
  TrainerFilterTypes,
  TrainerTemplateFilter,
} from 'modules/UsersManagement/types';

// ** Slices **
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

interface CategoryData {
  value: string;
  label: string;
}
interface Subcategory {
  value: string;
  label: string;
}

const FormFilter = ({
  courseFilter,
  // setCourseFilter,
  values,
  setFieldValue,
}: TrainerTemplateFilter) => {
  const { t } = useTranslation();

  // ** States
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>(
    courseFilter?.category
  );

  // ** APIs
  const [getAllCategories] = useAxiosGet();
  const [getAllSubCategories] = useAxiosGet();

  // ** Selector
  const { language } = useSelector(useLanguage);

  const fetchAllCategories = async () => {
    const { data } = await getAllCategories('/course-category', {
      params: {
        dropdown: true,
        value: 'slug',
      },
    });
    setCategories(data);
  };

  const fetchAllSubCategories = async () => {
    const category_slug =
      selectedCategory?.length > 0
        ? selectedCategory?.map((data) => data).join(',')
        : [];

    const { data } = await getAllSubCategories('/course-sub-category', {
      params: {
        categoriesSlug: category_slug,
        dropdown: true,
        value: 'slug'
      },
    });
    if (values) {
      const filterData = values.subCategory.filter((item) => {
        const filter = data.some((val: Subcategory) => {
          return val?.value === item;
        });
        return filter;
      });
      setFieldValue?.('subCategory', filterData);
    }
    setSubcategories(data);
  };

  // ** useEffects
  useEffect(() => {
    fetchAllCategories();
  }, [language]);

  useEffect(() => {
    fetchAllSubCategories();
  }, [selectedCategory, language]);

  const handleCategoryOrSubCategoryChange = (
    val: Option | Option[],
    type: string | undefined,
    fieldName: 'category' | 'subCategory',
    setIdsFunction: React.Dispatch<React.SetStateAction<string[]>>,
    values: TrainerFilterTypes
  ) => {
    const currentIds = values[fieldName] || [];
    const updatedIds =
      type === 'Removed'
        ? currentIds.filter((item) => item !== (val as Option[])[0].value)
        : [
          ...new Set([
            ...currentIds,
            ...(val as Option[]).map((opt) => opt.value),
          ]),
        ];
    setIdsFunction(updatedIds?.map((item) => item.toString()));
    return updatedIds;
  };

  return (
    <>
      <ReactSelect
        parentClass="filter-category-selector"
        name="category"
        label={t('CoursesManagement.CourseCategory.AddEditCategory.seletedCategory')}
        options={categories}
        onChange={(val, type) => {
          if (values) {
            setFieldValue?.(
              'category',
              handleCategoryOrSubCategoryChange(
                val as Option | Option[],
                type,
                'category',
                setSelectedCategory,
                values
              )
            );
          }
        }}
        isMulti
      />

      <ReactSelect
        parentClass="filter-category-selector"
        name="subCategory"
        label={t(
          'CoursesManagement.CourseCategory.AddEditCategory.selectSubcategory'
        )}
        options={values && values?.category?.length > 0 ? subcategories : []}
        isMulti
      />
    </>
  );
};

export default FormFilter;
