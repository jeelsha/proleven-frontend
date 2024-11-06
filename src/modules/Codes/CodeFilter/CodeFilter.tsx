// ** Components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import FormFilter from 'modules/UsersManagement/Components/TrainerFilter/FormFilter';

// ** Hooks **
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

// ** Constants **
import { Formik, Form } from 'formik';

// ** Types **
import { CodeFilterTypes, CodeTemplateFilter } from '../types';

// ** utils **
import { hasValues } from 'utils';
import _ from 'lodash';

// ** Slices
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';

function CodeFilter({
  courseFilter,
  setCourseFilter,
  setFilterApply,
  filterApply,
}: CodeTemplateFilter) {
  const { t } = useTranslation();

  // ** States
  const [filterModal, setFilterModal] = useState<boolean>(false);

  // ** Ref
  const modalRef = useRef<HTMLDivElement>(null);

  // ** Redux dispatch
  const dispatch = useDispatch();

  const getFilterApplyData = ({ category, subCategory }: CodeFilterTypes) => {
    setCourseFilter({
      ...courseFilter,
      category: category?.filter(Boolean),
      subCategory,
    });
    setFilterApply?.({
      ...courseFilter,
      category,
      subCategory,
    });
    setFilterModal(false);
    dispatch(currentPageCount({ currentPage: 1 }));
  };

  // ** useEffects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setFilterModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={modalRef} className="bg-white">
      <div className="relative flex">
        <Button
          variants="primary"
          className="flex whitespace-nowrap gap-1 !py-[0.80rem]"
          onClickHandler={() => {
            setFilterModal(true);
          }}
        >
          {!_.isEmpty(filterApply) && hasValues(filterApply) && (
            <span className="filter-badge" />
          )}

          <span>
            <Image iconName="filterIcon2" />
          </span>
          {t('Calendar.filterButton')}
        </Button>
        {filterModal && (
          <div
            className={`${
              filterModal && 'z-1'
            } absolute right-0 top-full before:absolute transition-all duration-300`}
          >
            <div className="bg-white rounded-xl shadow-xl w-[245px]">
              <div className="px-5 py-3.5 border-b border-solid border-offWhite">
                <h5 className="text-base leading-5 font-semibold text-dark">
                  {t('ProjectManagement.Header.filter')}
                </h5>
              </div>
              <div className="px-5 py-3 max-h-[50vh] overflow-y-auto">
                <div className="flex flex-col gap-y-3 mt-4">
                  <Formik
                    onSubmit={(data) => {
                      getFilterApplyData(data);
                    }}
                    initialValues={courseFilter ?? {}}
                    enableReinitialize
                  >
                    {({ values, setFieldValue }) => {
                      return (
                        <Form className="flex flex-col gap-y-2">
                          <FormFilter
                            courseFilter={courseFilter}
                            setCourseFilter={setCourseFilter}
                            values={values}
                            setFieldValue={setFieldValue}
                          />
                          <div className="flex flex-col-2 gap-2">
                            <Button
                              variants="primary"
                              className="button primary w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5 !py-1"
                              type="submit"
                            >
                              {t(
                                'ClientManagement.clientTabs.courseTitle.filterApply'
                              )}
                            </Button>
                            <Button
                              onClickHandler={() => {
                                setFilterApply?.({
                                  category: [],
                                  subCategory: [],
                                });
                                setCourseFilter({
                                  category: [],
                                  subCategory: [],
                                });
                                setFilterModal(false);
                                dispatch(currentPageCount({ currentPage: 1 }));
                              }}
                              className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5"
                              variants="primary"
                            >
                              {t('Calendar.clearAllTitle')}
                            </Button>
                          </div>
                        </Form>
                      );
                    }}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeFilter;
