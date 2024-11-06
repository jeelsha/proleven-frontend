import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import _ from 'lodash';

type FilterApply = Record<string, any>;

type ParamMapping = Record<string, string>;

type QueryParamCheck = (filters: FilterApply) => boolean;

const isObjectEmpty = (val: any) => {
  return typeof val === 'object' && Object.values(val).every((v) => v === '');
};

const useUpdateQueryParameters = (
  filterApply: FilterApply,
  paramMapping: ParamMapping,
  queryParamName: string,
  queryParamCheck: QueryParamCheck,
  state?: { [key: string]: unknown }
) => {
  const navigate = useNavigate();
  const location = useLocation();
  const newQueryParameters = new URLSearchParams(location.search);

  const prevFilterApply = useRef(filterApply);

  useEffect(() => {
    if (!_.isEqual(prevFilterApply.current, filterApply)) {
      Object.entries(paramMapping).forEach(([queryKey, filterKey]) => {
        const value = filterApply[filterKey];

        if (!_.isEmpty(value) && !isObjectEmpty(value)) {
          if (Array.isArray(value)) {
            newQueryParameters.set(queryKey, String(value));
          } else if (typeof value === 'object') {
            newQueryParameters.set(queryKey, JSON.stringify(value)); // For filterDate object
          } else {
            newQueryParameters.set(queryKey, String(value));
          }
        } else {
          newQueryParameters.delete(queryKey);
        }
      });
      if (queryParamCheck(filterApply)) {
        newQueryParameters.set(queryParamName, 'true');
      } else {
        newQueryParameters.delete(queryParamName);
      }

      navigate(
        {
          pathname: location.pathname,
          search: newQueryParameters.toString(),
        },
        { replace: true, state: { ...state } }
      );
      prevFilterApply.current = filterApply;
    }
  }, [
    filterApply,
    location.pathname,
    navigate,
    paramMapping,
    queryParamName,
    queryParamCheck,
  ]);
};

export default useUpdateQueryParameters;
