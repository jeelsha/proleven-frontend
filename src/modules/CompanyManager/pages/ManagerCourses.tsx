// ** components **
import Button from 'components/Button/Button';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import DatePicker from 'components/FormElement/datePicker';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import CourseList from 'modules/CompanyManager/components/CourseList';
import DropdownFilter from 'modules/CompanyManager/components/courses/DropdwonFilter';

// ** constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { AvailableFilterOptions } from 'modules/CompanyManager/constants';

// ** imports **
import { format } from 'date-fns';
import { useQueryGetFunction } from 'hooks/useQuery';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'utils';

// ** types **
import {
  AvailableFilterProps,
  CourseFilter,
  DateFilterProps,
  Filters,
  OtherCourseFilters,
  QueryFilterProps,
} from 'modules/CompanyManager/types';

// ** redux **
import { Option } from 'components/FormElement/types';
import SearchComponent from 'components/Table/search';
import { REACT_APP_DATE_FORMAT } from 'config';
import { useAxiosGet } from 'hooks/useAxios';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import {
  currentPageCount,
  currentPageSelector,
} from 'redux-toolkit/slices/paginationSlice';

const DateFilter = ({ filters, setFilters }: DateFilterProps) => {
  return (
    <DatePicker
      parentClass="flex-[1_0_0%]"
      isCompulsory
      range
      selectedDate={filters.startDate ? new Date(filters?.startDate) : null}
      endingDate={filters.endDate ? new Date(filters?.endDate) : null}
      onRangeChange={(startDate, endDate) => {
        // if (startDate && !endDate) {
        //   endDate = addDays(startDate, 1);
        // }
        if (!!startDate && !!endDate) {
          setFilters({
            ...filters,
            startDate: startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '',
            endDate: endDate ? format(new Date(endDate), 'yyyy-MM-dd') : '',
          });
        }
      }}
      dateFormat={`${REACT_APP_DATE_FORMAT as string}`}
      type="date"
      endDatePlaceholder={t('CompanyManager.courses.endDatePlaceholder')}
      startDatePlaceholder={t('CompanyManager.courses.startDatePlaceholder')}
      isClearable
    />
  );
};

const AvailabilityFilter = ({
  availability,
  setAvailability,
}: AvailableFilterProps) => {
  return (
    <RadioButtonGroup
      optionWrapper="flex gap-4"
      options={AvailableFilterOptions()}
      isCompulsory
      setSelectedValue={setAvailability}
      selectedValue={availability}
      parentClass="radio-group col-span-2"
    />
  );
};

const ManagerCourses = () => {
  const { t } = useTranslation();
  const updateTitle = useTitle();
  const { currentPage } = useSelector(currentPageSelector);
  // const courseFilterLength = 4;
  // ...Array(courseFilterLength).keys(),
  const [subCategoryData] = useAxiosGet();
  const [categorySearch, setCategorySearch] = useState('');
  const [limit, setLimit] = useState<number>(12);
  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [openFilters, setOpenFilters] = useState<number[]>([0]);
  const [availability, setAvailability] = useState('');
  const [search, setSearch] = useState('');
  const user = useSelector(getCurrentUser);
  const [categoryFilters, setCategoryFilters] = useState<Filters>({
    categories: [],
    subcategories: [],
    courses: [],
  });
  const [subCategory, setSubCategory] = useState<Option[]>([]);
  const [otherFilters, setOtherFilters] = useState<OtherCourseFilters>({
    startDate: '',
    endDate: '',
  });
  const ActiveCompany = useSelector(useCompany);
  const { language } = useSelector(useLanguage);
  const [queryFilters, setQueryFilters] = useState<QueryFilterProps>();
  const debouncedCategorySearch = useDebounce(categorySearch, 500);
  const debouncedSubCategorySearch = useDebounce(subCategorySearch, 500);
  const debouncedCourseSearch = useDebounce(courseSearch, 500);
  const debouncedSearch = useDebounce(search, 500);
  const dispatch = useDispatch();
  const [coursesTemplateResponse, setCoursesTemplateResponse] = useState([]);
  const [coursesTemplateLoading, setCoursesTemplateLoading] = useState<boolean>();
  const getCourses = async () => {
    setCoursesTemplateLoading(true);
    const response = await subCategoryData('/course/template', {
      params: {
        search: debouncedCourseSearch,
        dropdown: true,
        ...(!_.isEmpty(categoryFilters?.categories)
          ? { courseCategory: categoryFilters?.categories.toString() }
          : {}),
        ...(!_.isEmpty(categoryFilters?.subcategories)
          ? { courseSubCategory: categoryFilters?.subcategories.toString() }
          : {}),
        label: 'title',
        value: 'code',
      },
    });
    setCoursesTemplateResponse(response?.data);
    setCoursesTemplateLoading(false);
  };
  useEffect(() => {
    getCourses();
  }, [categoryFilters.categories, categoryFilters.subcategories]);
  const { response: CategoriesResponse, isLoading: categoryLoading } =
    useQueryGetFunction('/course-category', {
      option: { dropdown: true, search: debouncedCategorySearch },
    });

  useEffect(() => {
    getSubCategory();
  }, [categoryFilters.categories, debouncedSubCategorySearch]);

  const getSubCategory = async () => {
    const response = await subCategoryData('/course-sub-category', {
      params: {
        dropdown: true,
        search: debouncedSubCategorySearch,
        ...(!_.isEmpty(categoryFilters?.categories) && {
          categoriesid: categoryFilters?.categories.toString(),
        }),
      },
    });
    setSubCategory(response?.data);
  };

  const { response: coursesResponse, isLoading: courseLoading } =
    useQueryGetFunction('/managers/course/all', {
      page: currentPage,
      limit,
      option: {
        ...queryFilters,
        company_id: ActiveCompany?.company?.id,
        courseFilterWithCode: true,
      },
      search: debouncedSearch,
    });
  const startRecord = (Number(currentPage || 1) - 1) * Number(limit ?? 10) + 1;
  const endRecord =
    Number(currentPage || 1) * Number(limit || 10) <=
    Number(coursesResponse?.data?.count)
      ? Number(currentPage || 1) * Number(limit ?? 10)
      : coursesResponse?.data?.count;

  const isDataAvailable = endRecord && startRecord <= endRecord;

  const toggleFilter = (index: number) => {
    if (openFilters.includes(index)) {
      setOpenFilters(openFilters.filter((item) => item !== index));
    } else {
      setOpenFilters([...openFilters, index]);
    }
  };
  useEffect(() => {
    if (language) {
      handleClearFilter();
    }
  }, [language]);

  const reorderedData = CategoriesResponse?.data
    .filter((item: Option) => item.label === 'Health & Safety')
    .concat(
      CategoriesResponse?.data.filter(
        (item: Option) => item.label !== 'Health & Safety'
      )
    );
  const CourseFilters: CourseFilter[] = [
    {
      title: t('CompanyManager.courses.categoryTitle'),
      content: (
        <DropdownFilter
          options={reorderedData}
          filterKey="categories"
          setSearch={setCategorySearch}
          search={categorySearch}
          setFilters={setCategoryFilters}
          filters={categoryFilters}
          loading={categoryLoading}
        />
      ),
    },
    {
      title: t('CompanyManager.courses.subCategoryTitle'),
      content: (
        <DropdownFilter
          options={subCategory}
          filterKey="subcategories"
          setSearch={setSubCategorySearch}
          search={subCategorySearch}
          setFilters={setCategoryFilters}
          filters={categoryFilters}
        />
      ),
    },
    {
      title: t('Dashboard.Trainer.CourseInvitation.courses'),
      content: (
        <DropdownFilter
          options={coursesTemplateResponse}
          filterKey="courses"
          setSearch={setCourseSearch}
          search={courseSearch}
          setFilters={setCategoryFilters}
          filters={categoryFilters}
          loading={coursesTemplateLoading}
        />
      ),
    },
    {
      title: t('CompanyManager.courses.dateTitle'),
      content: <DateFilter setFilters={setOtherFilters} filters={otherFilters} />,
    },
    {
      title: t('CompanyManager.courses.availabilityTitle'),
      content: (
        <AvailabilityFilter
          setAvailability={setAvailability}
          availability={availability}
        />
      ),
    },
  ];

  const handleCourseFilter = () => {
    const newQueryFilters: QueryFilterProps = {
      courseCategory: categoryFilters.categories.join(),
      courseSubCategory: categoryFilters.subcategories.join(),
      courseTemplate: categoryFilters.courses.join(),
      startDate: otherFilters.startDate,
      endDate: otherFilters.endDate,
      marked_as: availability,
    };

    const filteredQueryFilters = Object.fromEntries(
      Object.entries(newQueryFilters).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    );
    dispatch(currentPageCount({ currentPage: 1 }));
    setQueryFilters(filteredQueryFilters as QueryFilterProps);
  };

  const handleClearFilter = () => {
    setOtherFilters({ startDate: '', endDate: '' });
    setCategorySearch('');
    setSubCategorySearch('');
    setCategoryFilters({ categories: [], subcategories: [], courses: [] });
    setAvailability('');
    const filters: QueryFilterProps = {
      courseCategory: '',
      courseSubCategory: '',
      startDate: '',
      endDate: '',
      marked_as: '',
      courseTemplate: '',
    };
    const filteredQueryFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    );
    setQueryFilters(filteredQueryFilters as QueryFilterProps);
  };
  updateTitle(t('CompanyManager.courses.title'));
  return (
    <section className="mt-5">
      <div className="container">
        <PageHeader text={t('CompanyManager.courses.title')} small>
          <SearchComponent
            onSearch={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e?.target?.value);
            }}
            parentClass="max-w-[250px]"
            value={search}
            placeholder={t('Table.tableSearchPlaceholder')}
            onClear={() => {
              setSearch('');
            }}
          />
        </PageHeader>
        <div className="flex flex-wrap">
          <div className="w-full max-w-[363px] ">
            <div className="bg-white rounded-lg sticky top-0">
              <div className="p-5">
                <p className="text-xl leading-6 font-semibold">
                  {t('CompanyManager.courses.filterTitle')}
                </p>
              </div>
              <div className="overflow-auto max-h-[60vh]">
                {CourseFilters.map((item, index: number) => (
                  <div
                    key={`course_${index + 1}`}
                    className="p-5 border-t border-solid border-borderColor"
                  >
                    <Button
                      className="flex items-center justify-between w-full cursor-pointer"
                      onClickHandler={() => toggleFilter(index)}
                    >
                      <Button className="text-lg font-medium text-dark">
                        {item.title}
                      </Button>
                      <span
                        className={`transform ${
                          openFilters.includes(index)
                            ? 'rotate-90'
                            : '-rotate-90 translate-y-px'
                        } transition-transform`}
                      >
                        <Image iconName="chevronLeft" />
                      </span>
                    </Button>
                    {openFilters.includes(index) && (
                      <div className="mt-5">{item.content}</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 p-5 border-t border-solid border-borderColor">
                <Button
                  variants="primaryBordered"
                  className="flex-[1_0_0%]"
                  onClickHandler={handleClearFilter}
                >
                  {t('CompanyManager.courses.clearFiltersTitle')}
                </Button>
                <Button
                  variants="primary"
                  className="flex-[1_0_0%]"
                  onClickHandler={handleCourseFilter}
                >
                  {t('CompanyManager.courses.applyFiltersTitle')}
                </Button>
              </div>
            </div>
          </div>
          <div className="w-full max-w-[calc(100%_-_363px)] ps-7">
            <CourseList
              coursesResponse={coursesResponse?.data?.data}
              courseLoading={courseLoading}
              startRecord={startRecord}
              endRecord={endRecord}
              isDataAvailable={isDataAvailable}
              limit={limit}
              currentPage={currentPage}
              setLimit={setLimit}
              totalPages={coursesResponse?.data?.lastPage}
              dataCount={coursesResponse?.data?.count}
              navigateUrl={
                user?.role_name === ROLES.CompanyManager
                  ? PRIVATE_NAVIGATION.companyManager.courses.list.path
                  : PRIVATE_NAVIGATION.privateIndividual.courses.list.path
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManagerCourses;
