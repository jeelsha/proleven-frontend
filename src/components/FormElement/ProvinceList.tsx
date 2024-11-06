import { useField } from 'formik';
import React, { useEffect, useState } from 'react';
// import { RegionDropdown } from 'react-country-region-selector';
import { LocationDropdownProps, Option } from './types';
import province from "../../province/province.json"


import './style/countrySelect.css';
import ReactSelect from './ReactSelect';

const ProvinceDropDown: React.FC<LocationDropdownProps> = ({
  selectedCountry,
  parentClass,
  name,
  label,
  disabled,
  className,
  placeholder,
  selectedState,
  isCompulsory = false,
  // onChange,
  isLoading = false,
}) => {
  const [, , helpers] = useField(name);


  const [filteredProvince, setFilteredProvince] = useState<Option[]>([])
  const [previousCountry, setPreviousCountry] = useState<string | undefined>(selectedCountry);

  useEffect(() => {
    const opt = province.map((item) => {
      return {
        label: item.region,
        value: item.region,
        countryName: item.countryName,
        shortCode: item?.shortCode
      }
    })
    setFilteredProvince(opt?.filter((data) => data.countryName === selectedCountry))
    setPreviousCountry(selectedCountry);
  }, [selectedCountry])

  useEffect(() => {
    if (previousCountry && selectedCountry !== previousCountry) {
      helpers.setValue('');
      setPreviousCountry(selectedCountry);
    }
  }, [filteredProvince, selectedCountry])

  return (
    <>
      {isLoading ? (
        <div className={parentClass}>
          <div className="lazy h-[50px]" />
        </div>
      ) : (
        <div className={`w-full ${parentClass ?? ''}`} id="xyz">
          <ReactSelect
            label={label}
            isMulti={false}
            name={name}
            placeholder={placeholder}
            options={filteredProvince ?? []}
            isCompulsory={isCompulsory}
            onChange={(e) => helpers.setValue((e as Option)?.value)}
            selectedValue={selectedState}
            disabled={disabled}
            className={`${className ?? ''}`}
            isLoading={isLoading}
            isInput
          />

          {/* {isCompulsory && name ? <ErrorMessage name={name} /> : ''} */}
        </div>
      )}
    </>
  );
};

export default ProvinceDropDown;
