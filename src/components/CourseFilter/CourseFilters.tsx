// ** Components
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import ReactSelect from 'components/FormElement/ReactSelect';
import DatePicker from 'components/FormElement/datePicker';
import Image from 'components/Image';

// ** Types **
import { ObjectOption, Option } from 'components/FormElement/types';
import { CourseFilterProps, FilterCategory } from 'modules/UsersManagement/types';

// ** Constants
import { ROLES } from 'constants/roleAndPermission.constant';
import { CourseStatus, CourseType } from 'modules/UsersManagement/constants';
import { FilterStatus } from 'types/common';
import { FundedBy } from 'modules/Courses/Constants';

// ** Hooks
import { useAxiosGet } from 'hooks/useAxios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

// ** Slice
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';

// ** Utils
import { isBefore } from 'date-fns';
import { Form, Formik } from 'formik';
import _ from 'lodash';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { hasValues } from 'utils';
import { dateFilterOption, handleDateFilter } from 'utils/dateFilterDropDown';
import '../Layout/components/style/topHeader.css';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';

const CourseFilters = ({
  componentType,
  courseFilter,
  setCourseFilter,
  setFilterApply,
  courseStatus,
  memberId,
  filterApply,
}: CourseFilterProps) => {
  const user = useSelector(getCurrentUser);
  const { t } = useTranslation();
  const { language } = useSelector(useLanguage);
  const dispatch = useDispatch();

  const [category, setCategory] = useState<FilterCategory>([]);
  const [subCategory, setSubCategory] = useState<FilterCategory>([]);
  const [companies, setCompanies] = useState<FilterCategory>([]);
  const [codeData, setCodeData] = useState<Option[]>([]);
  const [trainingSpecialist, setTrainingSpecialist] = useState<FilterCategory>([]);

  const [formValue, setFormValue] = useState<{ payment_mode: string }>({
    payment_mode: courseFilter?.payment_mode ? courseFilter?.payment_mode : '',
  });
  const [filterDateData, setFilterDate] = useState<{
    startDate: string | Date;
    endDate: string | Date;
  }>({
    startDate: courseFilter?.filterDate?.startDate
      ? courseFilter?.filterDate?.startDate
      : '',
    endDate: courseFilter?.filterDate?.endDate
      ? courseFilter?.filterDate?.endDate
      : '',
  });
  const [filterModal, setFilterModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const customCheck =
    courseFilter?.payment_mode === 'Custom'
      ? courseFilter?.payment_mode === 'Custom'
      : false;
  const [customPicker, setCustomPicker] = useState<boolean>(customCheck);

  const allRoles = useSelector(getRoles);
  const currentRole = allRoles.find((role) => role.name === ROLES.Company);
  const currentRoleTrainingSpecialist = allRoles.find(
    (role) => role.name === ROLES.TrainingSpecialist
  );
  const handleStatusCheckboxChange = (type: keyof FilterStatus, data: string) => {
    if (type !== 'filterDate') {
      if (type !== 'payment_mode') {
        if (courseFilter && !courseFilter?.[type]?.includes(data)) {
          setCourseFilter({
            ...courseFilter,
            [type]: [...(courseFilter?.[type] ?? []), data],
          });
        } else if (Array.isArray(courseFilter[type])) {
          const filterData = courseFilter[type]?.filter((filter) => filter !== data);
          setCourseFilter({ ...courseFilter, [type]: filterData });
        }
      }
    }
  };

  const handleFundedByCheck = (tempConst: string) => {
    const nullFundCourseFilter = courseFilter?.fundedBy?.filter(
      (item) => item !== FundedBy.NAN
    );
    if (!nullFundCourseFilter?.includes(tempConst)) {
      setCourseFilter((prev) => ({
        ...prev,
        fundedBy: nullFundCourseFilter?.length
          ? [...nullFundCourseFilter, tempConst ?? '']
          : [tempConst ?? ''],
      }));
    } else {
      const filterData = nullFundCourseFilter?.filter(
        (filter) => filter !== tempConst
      );
      setCourseFilter({ ...courseFilter, fundedBy: filterData });
    }
  };

  const [getAllCategories] = useAxiosGet();
  const [getAllSubCategories, isSubCategoryLoading] = useAxiosGet();
  const [getAllCompanies] = useAxiosGet();
  const [getAllTrainingSpecialist] = useAxiosGet();
  const [getAllCode] = useAxiosGet();

  const getFilterApplyData = () => {
    const getCategorySlug = category
      ?.filter((categoryData) =>
        courseFilter?.courseCategory?.includes(categoryData?.value?.toString())
          ? categoryData.value
          : ''
      )
      .map((data) => data.value);

    const getCompanySlug = companies
      ?.filter((categoryData) =>
        courseFilter?.companies?.includes(categoryData?.value?.toString())
          ? categoryData.value
          : ''
      )
      .map((data) => data.value);
    const getTraniningSpecialistSlug = trainingSpecialist
      ?.filter((categoryData) =>
        courseFilter?.trainingSpecialist?.includes(categoryData?.value?.toString())
          ? categoryData.value
          : ''
      )
      .map((data) => data.value);
    const getCode = codeData
      ?.filter((categoryData) =>
        courseFilter?.courseCode?.includes(categoryData?.value?.toString())
          ? categoryData.value
          : ''
      )
      .map((data) => data?.value?.toString());

    const result = isBefore(
      new Date(filterDateData?.startDate),
      new Date(filterDateData?.endDate)
    );
    if (_.isEmpty(filterDateData?.startDate) || result) {
      setFilterApply({
        ...courseFilter,
        courseCategory: getCategorySlug,
        companies: getCompanySlug,
        trainingSpecialist: getTraniningSpecialistSlug,
        courseCode: getCode,
        filterDate: { ...filterDateData },
        payment_mode: formValue?.payment_mode,
      });
      setFilterModal(false);
    }
  };

  const fetchAllCategories = async () => {
    const { data } = await getAllCategories('/course-category', {
      params: {
        dropdown: true,
        value: 'slug',
        status: courseStatus,
        ...(memberId && { member: memberId }),
      },
    });
    setCategory(data);
  };

  const fetchAllSubCategories = async () => {
    const categorySlug = courseFilter?.courseCategory?.length
      ? courseFilter?.courseCategory?.map((data) => data).join(',')
      : [];

    const { data } = await getAllSubCategories('/course-sub-category', {
      params: {
        categoriesSlug: categorySlug,
        dropdown: true,
        value: 'slug',
      },
    });
    setSubCategory(data);
  };

  const fetchAllCompanies = async () => {
    const { data } = await getAllCompanies('/companies/dropdown', {
      params: {
        dropdown: true,
        label: 'name',
        value: 'slug',
        role: currentRole?.id,
      },
    });
    setCompanies(data);
  };

  const fetchAllTrainingSpecialist = async () => {
    const { data } = await getAllTrainingSpecialist('/users/dropdown', {
      params: {
        dropdown: true,
        label: 'full_name',
        role: currentRoleTrainingSpecialist?.id,
      },
    });
    if (user?.role_name === ROLES.TrainingSpecialist) {
      const trainingSpecialistObj = {
        label: t('trainingSpecialist.Assignment'),
        value: user?.id,
      };
      return setTrainingSpecialist([trainingSpecialistObj, ...data]);
    }
    setTrainingSpecialist(data);
  };

  const fetchAllCode = async () => {
    const { data } = await getAllCode('/codes', {
      params: { dropdown: true, label: 'code', value: 'slug' },
    });
    setCodeData(data);
  };

  const handleDate = (item: Option) => {
    const { filterDate, customPicker } = handleDateFilter(item);
    setCustomPicker(customPicker);
    setFilterDate({ ...filterDate });
  };

  const handleSubmit = () => {
    getFilterApplyData();
    dispatch(currentPageCount({ currentPage: 1 }));
  };

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

  useEffect(() => {
    if (
      componentType !== 'attendeesTabFilter' &&
      componentType !== 'attendees' &&
      componentType !== 'systemLogs' &&
      componentType !== 'profiles'
    ) {
      fetchAllCategories();
    }
    if (
      componentType === 'courseTab' ||
      componentType === 'attendees' ||
      componentType === 'attendeesTabFilter' ||
      componentType === 'profiles'
    ) {
      fetchAllCompanies();
    }
    if (
      componentType !== 'attendees' &&
      componentType !== 'attendeesTabFilter' &&
      componentType !== 'profiles'
    ) {
      fetchAllTrainingSpecialist();
    }
    if (componentType === 'attendees') {
      fetchAllCode();
    }
  }, [language, courseStatus]);

  useEffect(() => {
    if (
      componentType !== 'attendeesTabFilter' &&
      componentType !== 'systemLogs' &&
      componentType !== 'attendees' &&
      componentType !== 'profiles' &&
      courseFilter?.courseCategory?.length
    ) {
      fetchAllSubCategories();
    }
  }, [language, courseStatus, courseFilter?.courseCategory]);
  const companyOption = companies.map((comp) => {
    return { label: comp?.label, value: comp?.value };
  });
  const trainingSpecialistOption = trainingSpecialist.map((trainer) => {
    return { label: trainer?.label, value: trainer?.value };
  });
  return (
    <div ref={modalRef}>
      <Formik initialValues={formValue} onSubmit={handleSubmit}>
        {() => (
          <Form>
            <div className="relative flex">
              <Button
                variants="primary"
                className="flex whitespace-nowrap gap-1 !py-[0.80rem] "
                onClickHandler={() => {
                  setFilterModal(!filterModal);
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
                    filterModal && 'z-3'
                  } absolute right-0 top-full before:absolute transition-all duration-300`}
                >
                  <div className="bg-white rounded-xl shadow-xl w-[340px]">
                    <div className="px-5 py-3.5 border-b border-solid border-offWhite">
                      <h5 className="text-base leading-5 font-semibold text-dark">
                        {t('ProjectManagement.Header.filter')}
                      </h5>
                    </div>
                    <div className="px-5 py-3 max-h-[70vh] overflow-auto">
                      <div className="flex flex-col gap-y-3 mt-4" />
                      <div>
                        {componentType !== 'attendeesTabFilter' && (
                          <>
                            {/* {componentType !== 'attendees' && (
                              <>
                                <p className="text-sm leading-5 font-semibold">
                                  {t(
                                    'CoursesManagement.CourseCategory.AddEditCategory.code'
                                  )}
                                </p>
                                <div className="overflow-auto max-h-[155px] p-1">
                                  {codeData?.map((codeData) => {
                                    return (
                                      <div key={codeData?.label}>
                                        <Checkbox
                                          text={codeData?.label}
                                          check={courseFilter?.courseCode?.includes(
                                            `${codeData?.value}`
                                          )}
                                          onChange={() => {
                                            handleStatusCheckboxChange(
                                              'courseCode',
                                              codeData?.value.toString()
                                            );
                                          }}
                                          parentClass="my-[10px]"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )} */}
                            {componentType === 'userManagement' && (
                              <>
                                <p className="text-sm leading-5 font-semibold">
                                  {t('CoursesManagement.CreateCourse.courseStatus')}
                                </p>
                                <Checkbox
                                  text={
                                    CourseStatus?.publish &&
                                    t('CoursesManagement.User.Filter.publish')
                                  }
                                  check={courseFilter?.courseStatus?.includes(
                                    'publish'
                                  )}
                                  onChange={() => {
                                    handleStatusCheckboxChange(
                                      'courseStatus',
                                      'publish'
                                    );
                                  }}
                                  parentClass="my-[10px]"
                                />
                                <Checkbox
                                  text={
                                    CourseStatus?.draft &&
                                    t('CoursesManagement.draft')
                                  }
                                  check={courseFilter?.courseStatus?.includes(
                                    'draft'
                                  )}
                                  onChange={() => {
                                    handleStatusCheckboxChange(
                                      'courseStatus',
                                      'draft'
                                    );
                                  }}
                                  parentClass="my-[10px]"
                                />
                              </>
                            )}
                            <>
                              {componentType !== 'systemLogs' &&
                                componentType !== 'attendees' &&
                                componentType !== 'profiles' && (
                                  <>
                                    <p
                                      className={`text-sm leading-5 font-semibold ${
                                        (componentType === 'userManagement' ||
                                          componentType === 'attendees') &&
                                        'mt-5 pt-5 border-t border-solid border-offWhite'
                                      }`}
                                    >
                                      {t(
                                        'CoursesManagement.CreateCourse.courseType'
                                      )}
                                    </p>
                                    <Checkbox
                                      text={
                                        CourseType?.Academy &&
                                        t('CoursesManagement.CreateCourse.academy')
                                      }
                                      check={courseFilter?.courseType?.includes(
                                        'academy'
                                      )}
                                      onChange={() => {
                                        handleStatusCheckboxChange(
                                          'courseType',
                                          'academy'
                                        );
                                      }}
                                      parentClass="my-[10px]"
                                    />
                                    <Checkbox
                                      text={
                                        CourseType?.Private &&
                                        t(
                                          'CourseManagement.Filter.privateCourseText'
                                        )
                                      }
                                      check={courseFilter?.courseType?.includes(
                                        'private'
                                      )}
                                      onChange={() => {
                                        handleStatusCheckboxChange(
                                          'courseType',
                                          'private'
                                        );
                                      }}
                                      parentClass="my-[10px]"
                                    />
                                    <p
                                      className={`text-sm leading-5 font-semibold ${
                                        componentType === 'userManagement' &&
                                        'mt-5 pt-5 border-t border-solid border-offWhite'
                                      }`}
                                    >
                                      {t('CoursesManagement.CreateCourse.fundedBy')}
                                    </p>
                                    <Checkbox
                                      text={t(
                                        'CoursesManagement.CreateCourse.prolevenManagement'
                                      )}
                                      check={courseFilter?.fundedBy?.includes(
                                        FundedBy.ProlevenAcademy
                                      )}
                                      onChange={() => {
                                        handleFundedByCheck(
                                          FundedBy.ProlevenAcademy
                                        );
                                      }}
                                      parentClass="my-[10px]"
                                    />
                                    <Checkbox
                                      text={t(
                                        'CoursesManagement.CreateCourse.customerManagement'
                                      )}
                                      check={courseFilter?.fundedBy?.includes(
                                        FundedBy.ClientAddress
                                      )}
                                      onChange={() => {
                                        handleFundedByCheck(FundedBy.ClientAddress);
                                      }}
                                      parentClass="my-[10px]"
                                    />
                                    <Checkbox
                                      text={t('CoursesManagement.CreateCourse.none')}
                                      check={courseFilter?.fundedBy?.includes(
                                        FundedBy.NAN
                                      )}
                                      onChange={() => {
                                        if (
                                          !courseFilter?.fundedBy?.includes(
                                            FundedBy.NAN
                                          )
                                        ) {
                                          setCourseFilter({
                                            ...courseFilter,
                                            fundedBy: [FundedBy.NAN],
                                          });
                                        } else {
                                          const filterData =
                                            courseFilter?.fundedBy?.filter(
                                              (filter) => filter !== FundedBy.NAN
                                            );
                                          setCourseFilter({
                                            ...courseFilter,
                                            fundedBy: filterData,
                                          });
                                        }
                                      }}
                                      parentClass="my-[10px]"
                                    />

                                    <ReactSelect
                                      parentClass="filter-category-selector"
                                      selectedValue={courseFilter?.courseCategory}
                                      label={t(
                                        'CoursesManagement.CreateCourse.category'
                                      )}
                                      placeholder={t(
                                        'CoursesManagement.CourseCategory.AddEditCategory.seletedCategory'
                                      )}
                                      options={category}
                                      onChange={(val) => {
                                        const values = val as Option[];
                                        handleStatusCheckboxChange(
                                          'courseCategory',
                                          (values ?? [])[
                                            values.length - 1
                                          ].value.toString()
                                        );
                                      }}
                                      isMulti
                                    />
                                    <div className="mt-3">
                                      <ReactSelect
                                        parentClass="filter-category-selector"
                                        placeholder={t(
                                          'CoursesManagement.CourseCategory.AddEditCategory.selectSubcategory'
                                        )}
                                        selectedValue={
                                          courseFilter?.courseSubCategory
                                        }
                                        label={t(
                                          'CoursesManagement.columnHeader.SubCategory'
                                        )}
                                        onChange={(val) => {
                                          const values = val as Option[];
                                          handleStatusCheckboxChange(
                                            'courseSubCategory',
                                            (values ?? [])[
                                              values.length - 1
                                            ].value.toString()
                                          );
                                        }}
                                        options={subCategory}
                                        isMulti
                                        isLoading={isSubCategoryLoading.isLoading}
                                      />
                                    </div>
                                  </>
                                )}
                            </>
                          </>
                        )}
                        {(componentType === 'courseTab' ||
                          componentType === 'attendees' ||
                          componentType === 'attendeesTabFilter' ||
                          componentType === 'profiles') && (
                          <>
                            <div className="mt-3">
                              <ReactSelect
                                options={companyOption || []}
                                parentClass="filter-category-selector"
                                placeholder={t('Exam.companyTitle')}
                                selectedValue={courseFilter?.companies}
                                label={t(
                                  'CoursesManagement.CourseCategory.courseCompanies'
                                )}
                                onChange={(val) => {
                                  const values = val as Option[];
                                  handleStatusCheckboxChange(
                                    'companies',
                                    (values ?? [])[
                                      values.length - 1
                                    ]?.value?.toString()
                                  );
                                }}
                                isMulti
                              />
                            </div>
                            {componentType !== 'attendees' &&
                              componentType !== 'attendeesTabFilter' &&
                              componentType !== 'profiles' &&
                              !_.isEmpty(trainingSpecialist) && (
                                <div className="mt-3">
                                  <ReactSelect
                                    options={trainingSpecialistOption || []}
                                    parentClass="filter-category-selector"
                                    placeholder={t(
                                      'CoursesManagement.CourseCategory.traningSpecialist.PlaceHolder'
                                    )}
                                    selectedValue={courseFilter?.trainingSpecialist}
                                    label={t(
                                      'CoursesManagement.CourseCategory.traningSpecialist'
                                    )}
                                    onChange={(val) => {
                                      const values = val as Option[];
                                      handleStatusCheckboxChange(
                                        'trainingSpecialist',
                                        (values ?? [])[
                                          values.length - 1
                                        ]?.value?.toString()
                                      );
                                    }}
                                    isMulti
                                  />
                                </div>
                              )}
                          </>
                        )}
                      </div>
                      {componentType !== 'attendees' && (
                        <div className="mt-4">
                          <ReactSelect
                            label={t('Calendar.createEvent.date')}
                            name="formValue.payment_mode"
                            options={dateFilterOption(t)}
                            onChange={(
                              item: Option | Option[] | ObjectOption | ObjectOption[]
                            ) => {
                              const { value } = item as Option;
                              handleDate(item as Option);
                              setFormValue({
                                ...formValue,
                                payment_mode: value as string,
                              });
                            }}
                            selectedValue={formValue?.payment_mode}
                            // isCompulsory
                          />
                        </div>
                      )}
                      {customPicker && (
                        <>
                          <p className="text-sm leading-5 font-semibold mt-5 pt-5 border-t border-solid border-offWhite mb-3">
                            {t('Calendar.createEvent.date')}
                          </p>
                          <DatePicker
                            isClearable
                            parentClass="flex-[1_0_0%]"
                            labelClass="font-semibold rounded-md truncate flex-[1_0_0%] capitalize"
                            range
                            selectedDate={
                              filterDateData?.startDate
                                ? new Date(filterDateData?.startDate ?? '')
                                : null
                            }
                            endingDate={
                              filterDateData?.endDate
                                ? new Date(filterDateData?.endDate)
                                : null
                            }
                            onRangeChange={(startDate, endDate) => {
                              setFilterDate({ startDate, endDate });
                            }}
                            dateFormat="dd/MM/yyyy"
                            type="date"
                            endDatePlaceholder={t(
                              'CompanyManager.courses.endDatePlaceholder'
                            )}
                            startDatePlaceholder={t(
                              'CompanyManager.courses.startDatePlaceholder'
                            )}
                          />
                        </>
                      )}
                      <div className="flex flex-col-2 gap-2">
                        <Button
                          type="submit"
                          variants="primary"
                          className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5 !py-1"
                        >
                          {t('ClientManagement.clientTabs.courseTitle.filterApply')}
                        </Button>
                        <Button
                          onClickHandler={() => {
                            setFilterApply({
                              courseStatus: [],
                              courseCategory: [],
                              courseSubCategory: [],
                              companies: [],
                              trainingSpecialist: [],
                              courseType: [],
                              fundedBy: [],
                              courseCode: [],
                              filterDate: {
                                startDate: '',
                                endDate: '',
                              },
                              payment_mode: '',
                            });
                            setCourseFilter({
                              courseStatus: [],
                              courseCategory: [],
                              courseSubCategory: [],
                              companies: [],
                              trainingSpecialist: [],
                              courseType: [],
                              fundedBy: [],
                              courseCode: [],
                              filterDate: {
                                startDate: '',
                                endDate: '',
                              },
                              payment_mode: '',
                            });
                            setFilterDate({
                              startDate: '',
                              endDate: '',
                            });
                            setFormValue({
                              payment_mode: '',
                            });
                            setFilterModal(false);
                            dispatch(currentPageCount({ currentPage: 1 }));
                          }}
                          className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5"
                          variants="primary"
                        >
                          {t('CompanyManager.courses.clearFiltersTitle')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CourseFilters;
