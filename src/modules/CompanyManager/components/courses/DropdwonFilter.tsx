// ** imports **
import { useTranslation } from 'react-i18next';

// ** components **
import Checkbox from 'components/FormElement/CheckBox';
import SearchComponent from 'components/Table/search';

// ** types **
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import _ from 'lodash';
import { DropdownProps, Filters } from 'modules/CompanyManager/types';

const DropdownFilter = ({
  options,
  setSearch,
  search,
  filterKey,
  filters,
  setFilters,
  loading,
}: DropdownProps) => {
  const { t } = useTranslation();
  const handleCheckboxChange = (optionValue: number) => {
    if (filterKey) {
      const currentFilter = filters[filterKey as keyof Filters];

      if (currentFilter !== undefined) {
        const updatedCategories =
          Array.isArray(currentFilter) && currentFilter.includes(optionValue)
            ? Array.isArray(currentFilter) &&
              currentFilter?.filter((category: number) => category !== optionValue)
            : [...currentFilter, optionValue];

        const updatedFilters = { ...filters, [filterKey]: updatedCategories };
        setFilters(updatedFilters);
      }
    }
  };
  return (
    <>
      <SearchComponent
        inputClass="!bg-offWhite2"
        parentClass="mb-5"
        onSearch={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearch(e?.target?.value);
        }}
        value={search}
        placeholder={t('Table.tableSearchPlaceholder')}
        onClear={() => {
          setSearch('');
        }}
      />
      <div className="flex flex-col gap-2 max-h-[210px] overflow-auto pl-1 py-0.5 with-scrollbar">
        {loading ? (
          <Image loaderType="Spin" />
        ) : !_.isEmpty(options) ? (
          options?.map((option: Option) => (
            <div key={option.value} className="flex items-center mb-2 ">
              <Checkbox
                onChange={() => handleCheckboxChange(option?.value as never)}
                check={filters[filterKey as keyof Filters]?.includes(
                  option?.value as never
                )}
                text={option.label}
                labelClass="text-clip text-wrap hyphens-auto break-words"
              />
            </div>
          ))
        ) : (
          <NoDataFound
            message={
              filterKey === 'subcategories'
                ? 'No SubCategory Found'
                : 'No Category Found'
            }
          />
        )}
      </div>
    </>
  );
};
export default DropdownFilter;
