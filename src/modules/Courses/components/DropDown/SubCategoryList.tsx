import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import { useAxiosGet } from 'hooks/useAxios';
import { useEffect, useState } from 'react';

export interface CategoryDropdownProps {
  selectedSubCategory?: string | number;
  selectedCategory?: string | number;
  parentClass?: string;
  label: string;
  name: string;
  placeholder: string;
  disabled?: boolean;
  isLoading?: boolean;
  formLanguage?: string;
  currentFormLanguage?: string;
}
const SubCategoryDropdown = ({
  selectedSubCategory,
  selectedCategory,
  disabled,
  isLoading,
  formLanguage,
  currentFormLanguage,
  ...props
}: CategoryDropdownProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [getSubCategoryApi, { isLoading: subCategoryLoading }] = useAxiosGet();

  const fetchSubCategories = async () => {
    const { data: subCategory } = await getSubCategoryApi(`/course-sub-category`, {
      params: {
        category_id: selectedCategory,
        dropdown: true,
        dropdownParent: true,
      },
      headers: { 'accept-custom-language ': currentFormLanguage ?? '' },
    });
    setOptions(subCategory);
  };

  useEffect(() => {
    if (selectedCategory) fetchSubCategories();
  }, [selectedCategory, formLanguage]);
  return (
    <div className={`${props.parentClass ?? ''}`}>
      <ReactSelect
        label={props.label}
        isMulti={false}
        name={props.name}
        placeholder={props.placeholder}
        options={options}
        isClearable
        selectedValue={selectedSubCategory}
        disabled={disabled}
        isLoading={isLoading ?? subCategoryLoading}
      />
    </div>
  );
};

export default SubCategoryDropdown;
