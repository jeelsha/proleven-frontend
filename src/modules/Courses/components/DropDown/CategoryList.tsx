import ReactSelect from 'components/FormElement/ReactSelect';
import { Option, ObjectOption } from 'components/FormElement/types';

export interface CategoryDropdownProps {
  categories?: Option[];
  selectedCategory?: string | number;
  parentClass?: string;
  label: string;
  name: string;
  placeholder: string;
  disabled?: boolean;
  isLoading?: boolean;
  onChange?: (
    option: Option | Option[] | ObjectOption[] | ObjectOption,
    type?: string
  ) => void;
}
const CategoryDropdown = ({
  categories,
  disabled,
  isLoading = false,
  onChange,
  ...props
}: CategoryDropdownProps) => {
  return (
    <div className={`${props.parentClass ?? ''}`}>
      <ReactSelect
        label={props.label}
        isMulti={false}
        name={props.name}
        placeholder={props.placeholder}
        options={categories ?? []}
        isCompulsory
        selectedValue={props.selectedCategory}
        disabled={disabled}
        isLoading={isLoading}
        onChange={onChange}
      />
    </div>
  );
};

export default CategoryDropdown;
