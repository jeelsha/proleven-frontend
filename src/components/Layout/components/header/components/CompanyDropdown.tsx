import Button from 'components/Button/Button';
import 'components/Layout/components/style/topHeader.css';
import NoDataFound from 'components/NoDataFound';
import SearchComponent from 'components/Table/search';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import {
  CompanyType,
  setCompany,
  useCompany,
} from 'redux-toolkit/slices/companySlice';
import { customRandomNumberGenerator, useDebounce } from 'utils';

export interface CompanyDropdownProps {
  id: string | undefined;
  name: string | undefined;
  slug: string | undefined;
}

export const CompanyDropdown = () => {
  const CurrentUser = useSelector(getCurrentUser);
  const dispatch = useDispatch();
  const activeCompany: CompanyType = useSelector(useCompany);

  const [allCompanies, setAllCompanies] = useState<
    { id?: string; name?: string; slug?: string }[]
  >([]);
  const [filteredCompanies, setFilteredCompanies] = useState<
    { id?: string; name?: string; slug?: string }[]
  >([]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 1000);

  useEffect(() => {
    if (
      Array.isArray(CurrentUser?.manager?.company_manager) &&
      CurrentUser?.manager?.company_manager &&
      CurrentUser?.manager?.company_manager?.length > 0
    ) {
      const companiesArray = CurrentUser?.manager?.company_manager
        .map((item) => {
          if (item.company !== null) {
            return {
              id: item?.company?.id,
              name: item?.company?.name,
              slug: item?.company?.slug,
            };
          }
          return null;
        })
        .filter((data) => data !== null);
      if (_.isEmpty(activeCompany?.company)) {
        dispatch(setCompany({ company: companiesArray[0] }));
      }
      if (Array.isArray(companiesArray) && companiesArray.length > 0) {
        setAllCompanies(companiesArray as CompanyDropdownProps[]);
      }
    }
  }, [CurrentUser?.manager?.company_manager]);

  useEffect(() => {
    if (!debouncedSearch) setFilteredCompanies(allCompanies);
    else {
      const companies = allCompanies.filter((item) =>
        item?.name?.toLowerCase().includes(debouncedSearch?.toLowerCase())
      );
      setFilteredCompanies(companies);
    }
  }, [debouncedSearch, allCompanies]);

  const companyChange = (currCompany: {
    id?: string;
    name?: string;
    slug?: string;
  }) => {
    dispatch(setCompany({ company: currCompany }));
  };

  return (
    <div className="relative group">
      <div className="company-dropdown-title !w-auto px-3 z-10 relative ">
        {allCompanies.length > 0 ? activeCompany?.company?.name : 'No Company Found'}
      </div>
      {allCompanies.length > 0 && (
        <div
          className={`company-dropdown-card with-scrollbar max-h-[250px] w-[300px] overflow-auto ${
            allCompanies.length > 1 && 'has-values'
          }`}
        >
          <SearchComponent
            onSearch={(e) => {
              setSearch?.(e.target.value);
            }}
            placeholder="Search"
            parentClass="mb-3"
          />

          {filteredCompanies.map((data: { id?: string; name?: string }) => (
            <Button
              key={customRandomNumberGenerator()}
              onClickHandler={() => companyChange(data)}
              className="company-card-button"
            >
              <p className="whitespace-nowrap truncate">{data?.name}</p>
            </Button>
          ))}
          {filteredCompanies.length < 1 && (
            <NoDataFound className="scale-[0.7] origin-top" />
          )}
        </div>
      )}
    </div>
  );
};
