import Checkbox from 'components/FormElement/CheckBox';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import { useAxiosGet } from 'hooks/useAxios';
import { CoursesFilter } from 'modules/Courses/types/TemplateBundle';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { CourseTamplateFilter } from '../../types/IBundleTemplate';

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
  setCourseFilter,
  values,
  setFieldValue,
}: CourseTamplateFilter) => {
  const { t } = useTranslation();
  const { language } = useSelector(useLanguage);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [codeData, setCodeData] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Array<string>>(
    courseFilter?.category
  );
  const [getAllCategories] = useAxiosGet();
  const [getAllSubCategories] = useAxiosGet();
  const [getAllCode] = useAxiosGet();

  const fetchAllCategories = async () => {
    const { data } = await getAllCategories('/course-category', {
      params: {
        dropdown: true,
        value: 'id',
        // dropdownParent: true
      },
    });
    setCategories(data);
  };

  const fetchAllSubCategories = async () => {
    const category_id =
      selectedCategory?.length > 0
        ? selectedCategory?.map((data) => data).join(',')
        : [];

    const { data } = await getAllSubCategories('/course-sub-category', {
      params: {
        categoriesid: category_id,
        dropdown: true,
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

  const fetchAllCode = async () => {
    const { data } = await getAllCode('/codes', {
      params: { dropdown: true, label: 'code', value: 'slug' },
    });
    setCodeData(data);
  };

  useEffect(() => {
    fetchAllCategories();
    fetchAllCode();
  }, [language]);
  useEffect(() => {
    fetchAllSubCategories();
  }, [selectedCategory, language]);
  const handleStatusCheckboxChange = (data: string) => {
    const type = 'courseCode';
    if (courseFilter && !courseFilter?.courseCode?.includes(data)) {
      setCourseFilter({
        ...courseFilter,
        [type]: [...(courseFilter?.courseCode ?? []), data],
      });
    } else {
      const filterData = courseFilter?.courseCode?.filter(
        (filter) => filter !== data
      );
      setCourseFilter({ ...courseFilter, [type]: filterData });
    }
  };

  const handleCategoryOrSubCategoryChange = (
    val: Option | Option[],
    type: string | undefined,
    fieldName: 'category' | 'subCategory',
    setIdsFunction: React.Dispatch<React.SetStateAction<string[]>>,
    values: CoursesFilter
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
      <p className="text-sm leading-5 font-semibold">
        {t('CoursesManagement.CourseCategory.AddEditCategory.code')}
      </p>
      <div className="overflow-auto max-h-[155px] p-1">
        {codeData?.map((codeData) => {
          return (
            <div key={codeData?.label}>
              <Checkbox
                text={codeData?.label}
                check={courseFilter?.courseCode?.includes(`${codeData?.value}`)}
                onChange={() => {
                  handleStatusCheckboxChange(codeData?.value);
                }}
                parentClass="my-[10px]"
              />
            </div>
          );
        })}
      </div>
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
