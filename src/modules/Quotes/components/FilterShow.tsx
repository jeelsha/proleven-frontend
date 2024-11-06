// ** imports **
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// ** components **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import Image from 'components/Image';
import InfiniteScroll from 'components/InfiniteScroll/infiniteScroll';
import { Modal } from 'components/Modal/Modal';
import NoDataFound from 'components/NoDataFound';
import TabComponent from 'components/Tabs';
import {
  endOfMonth,
  endOfYear,
  isBefore,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from 'date-fns';

// ** constants **
import { ROLES } from 'constants/roleAndPermission.constant';
import { useDebounce } from 'utils';

// ** hooks **
import { useQueryGetFunction } from 'hooks/useQuery';

// ** styles **
import '../styles/quotes.css';

// ** redux **
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';

// ** types **
import ReactSelect from 'components/FormElement/ReactSelect';
import DatePicker from 'components/FormElement/datePicker';
import { ObjectOption, Option } from 'components/FormElement/types';
import _ from 'lodash';
import {
  FilterOptionsClearType,
  // FilterOptionsType,
  FilterProps,
  TabDetailProps,
} from 'modules/Quotes/types';

const FilterShow = ({ modal, setQuoteFilters, quoteFilters }: FilterProps) => {
  const { t } = useTranslation();
  const allRoles = useSelector(getRoles);
  const rolesToPass: Array<number> = [];
  const targetRoles = [ROLES.SalesRep];

  allRoles.forEach((role) => {
    if (targetRoles.toString().includes(role.name)) {
      rolesToPass.push(role.id);
    }
  });
  const currentRole = allRoles.find((role) => role.name === ROLES.Company);
  const [activeTab, setActiveTab] = useState(0);
  const [companiesPage, setCompaniesPage] = useState(1);
  const [salesRepPage, setSalesRepPage] = useState(1);
  const [productCodePage, setProductCodePage] = useState(1);
  const [companies, setCompanies] = useState([] as TabDetailProps[]);
  const [codes, setCodes] = useState([] as TabDetailProps[]);
  const [search, setSearch] = useState({ companies: '', productCode: '' });
  const debouncedCompaniesSearch = useDebounce(search.companies, 1000);
  const debouncedCodeSearch = useDebounce(search.productCode, 500);
  const [selectedFilter, setSelectedFilter] = useState('companies');
  const [selectedOptions, setSelectedOptions] = useState<FilterOptionsClearType>({
    companies: [],
    codes: [],
    salesRep: [],
  });
  const [dateFilter, setDateFilter] = useState(
    quoteFilters?.payment_mode ? quoteFilters?.payment_mode : ''
  );

  const [filterDateData, setFilterDate] = useState<{
    startDate: string | Date;
    endDate: string | Date;
  }>({
    startDate: quoteFilters?.filterDate?.startDate
      ? quoteFilters?.filterDate?.startDate
      : '',
    endDate: quoteFilters?.filterDate?.endDate
      ? quoteFilters?.filterDate?.endDate
      : '',
  });
  const [salesRepData, setSalesRepData] = useState([] as TabDetailProps[]);

  const customCheck =
    quoteFilters?.payment_mode === 'Custom'
      ? quoteFilters?.payment_mode === 'Custom'
      : false;
  const [customPicker, setCustomPicker] = useState<boolean>(customCheck);

  const paymentOptions: Option[] = [
    { value: 'This month', label: t('filterThisMonth') },
    { value: 'Previous month', label: t('filterPreviousMonth') },
    { value: 'This year', label: t('filterThisYear') },
    { value: 'Last year', label: t('filterLastYear') },
    { value: 'Custom', label: t('Payment.Custom') },
  ];

  const { response: getCompanies, isLoading: CompaniesLoading } =
    useQueryGetFunction(`/companies`, {
      page: companiesPage,
      search: debouncedCompaniesSearch,
      role: `${currentRole?.id}`,
      limit: 12,
    });

  const { response: getProductCode, isLoading: CodeLoading } = useQueryGetFunction(
    `/codes`,
    {
      option: {
        assignedCourses: true,
      },
      page: productCodePage,
      search: debouncedCodeSearch,
    }
  );

  const { response: getSalesRep, isLoading: SalesRepLoading } = useQueryGetFunction(
    `/users`,
    {
      role: rolesToPass.toString(),
      page: salesRepPage,
      search: debouncedCodeSearch,
    }
  );

  useEffect(() => {
    if (getCompanies?.data?.data && companiesPage === 1) {
      const newData = getCompanies?.data?.data;
      setCompanies(newData);
    }
    if (getProductCode?.data?.data && productCodePage === 1) {
      const newData = getProductCode?.data?.data;
      setCodes(newData);
    }
    if (getSalesRep?.data?.data && salesRepPage === 1) {
      const newData = getSalesRep?.data?.data;
      setSalesRepData(newData);
    }
  }, [getCompanies, activeTab, getProductCode, getSalesRep]);

  useEffect(() => {
    if (getCompanies?.data?.data && companiesPage > 1) {
      const newData = getCompanies?.data?.data;
      setCompanies((prevCourse) => [...prevCourse, ...newData]);
    }
    if (getProductCode?.data?.data && productCodePage > 1) {
      const newData = getProductCode?.data?.data;
      setCodes((prevTrainer) => [...prevTrainer, ...newData]);
    }
    if (getSalesRep?.data?.data && salesRepPage > 1) {
      const newData = getSalesRep?.data?.data;
      setSalesRepData((prevSalesRep) => [...prevSalesRep, ...newData]);
    }
  }, [companiesPage, getCompanies, getSalesRep, getProductCode]);

  useEffect(() => {
    setCompaniesPage(1);
    setProductCodePage(1);
    setSalesRepPage(1);
  }, [search]);

  useEffect(() => {
    const getTabName = () => {
      if (activeTab === 0) {
        return 'companies';
      }
      if (activeTab === 1) {
        return 'codes';
      }
      return 'salesRep';
    };
    setSelectedFilter(getTabName());
  }, [activeTab]);

  useEffect(() => {
    if (quoteFilters) {
      setSelectedOptions(quoteFilters);
    }
  }, [quoteFilters]);

  const handleActiveTab = (tab: number) => {
    setActiveTab(tab);
  };

  const courseCallBack = useCallback(async () => {
    if (companiesPage < getCompanies?.data?.lastPage) {
      setCompaniesPage((prevPage) => prevPage + 1);
    }
  }, [companiesPage, getCompanies?.data?.lastPage]);

  const codeCallBack = useCallback(async () => {
    if (productCodePage < getProductCode?.data?.lastPage) {
      setProductCodePage((prevPage) => prevPage + 1);
    }
  }, [productCodePage, getProductCode?.data?.lastPage]);

  const salesCallBack = useCallback(async () => {
    if (salesRepPage < getSalesRep?.data?.lastPage) {
      setSalesRepPage((prevPage) => prevPage + 1);
    }
  }, [salesRepPage, getSalesRep?.data?.lastPage]);

  const handleSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: TabDetailProps
  ) => {
    const isChecked = event.target.checked;
    const filterOptions: TabDetailProps[] =
      selectedOptions[selectedFilter as keyof typeof selectedOptions];
    const selectedValue = {
      id: data?.id,
      title:
        data?.title ??
        data?.name ??
        data?.full_name ??
        `${data?.code}(${data?.courses[0]?.courseSubCategory?.name}:${data?.course_title})`,
      slug: data?.slug,
    };
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [selectedFilter]: isChecked
        ? [...filterOptions, selectedValue]
        : filterOptions.filter((item) => item.id !== selectedValue.id),
    }));
  };

  const handleFilterOptions = () => {
    const result = isBefore(
      new Date(filterDateData?.startDate),
      new Date(filterDateData?.endDate)
    );
    if (_.isEmpty(filterDateData?.startDate) || result) {
      setQuoteFilters({
        companies: selectedOptions.companies,
        codes: selectedOptions.codes,
        filterDate: { ...filterDateData },
        payment_mode: dateFilter,
        salesRep: selectedOptions.salesRep,
      });

      modal.closeModal();
    }
  };

  const handleContainerClick = (data: TabDetailProps) => {
    const filterOptions: TabDetailProps[] =
      selectedOptions[selectedFilter as keyof typeof selectedOptions];
    const selectedValue = {
      id: data?.id,
      title:
        data?.title ??
        data?.name ??
        data?.full_name ??
        `${data?.code}(${data?.courses[0]?.courseSubCategory?.name}:${data?.course_title})`,
      slug: data?.slug,
    };
    // if (!filterOptions.some((item) => item.id === selectedValue.id)) {
    //   setSelectedOptions((prevSelectedOptions) => ({
    //     ...prevSelectedOptions,
    //     [selectedFilter]: [...filterOptions, selectedValue],
    //   }));
    // }
    const isSelected = filterOptions.some((item) => item.id === selectedValue.id);

    if (isSelected) {
      setSelectedOptions((prevSelectedOptions) => ({
        ...prevSelectedOptions,
        [selectedFilter]: filterOptions.filter(
          (item) => item.id !== selectedValue.id
        ),
      }));
    } else {
      setSelectedOptions((prevSelectedOptions) => ({
        ...prevSelectedOptions,
        [selectedFilter]: [...filterOptions, selectedValue],
      }));
    }
  };

  const handleDate = (item: Option) => {
    let filterDate = {
      startDate: new Date(),
      endDate: new Date(),
    };
    setCustomPicker(false);
    if (item.value === 'This month') {
      filterDate = {
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      };
    } else if (item.value === 'Previous month') {
      const monthSub = subMonths(new Date(), 1);

      filterDate = {
        startDate: startOfMonth(monthSub),
        endDate: endOfMonth(monthSub),
      };
    } else if (item.value === 'This year') {
      filterDate = {
        startDate: startOfYear(new Date()),
        endDate: endOfYear(new Date()),
      };
    } else if (item.value === 'Last year') {
      const yearSub = subYears(new Date(), 1);

      filterDate = {
        startDate: startOfYear(yearSub),
        endDate: endOfYear(yearSub),
      };
    } else {
      filterDate = {
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      };
      setCustomPicker(true);
    }
    setFilterDate({ ...filterDate });
  };

  const renderFilter = (filterData: TabDetailProps[]) => {
    const renderName = (data: TabDetailProps) => {
      if (data?.name) return data?.name;
      if (data?.full_name) return data?.full_name;
      return (
        <div className="flex flex-wrap">
          <p>
            {data?.code}&nbsp;(
            <span className="font-semibold uppercase">
              &nbsp;{data?.courses?.[0]?.courseSubCategory?.name}
            </span>
            &nbsp;: {data?.course_title})
          </p>
        </div>
      );
    };
    if (filterData && filterData.length > 0) {
      return filterData.map((data) => (
        <div
          className="filter-card-container"
          key={data.id}
          onClick={() => {
            handleContainerClick(data);
          }}
        >
          <div className="flex items-center gap-2 max-w-[calc(100%_-_30px)]">
            <Image
              src={data?.logo}
              imgClassName="w-[70px] h-12 rounded-lg object-cover"
              serverPath
            />
            <div className="flex-[1_0_0%] flex flex-col text-sm leading-4 ">
              {renderName(data)}
            </div>
          </div>
          <div className="w-5 h-5">
            <Checkbox
              check={selectedOptions[
                selectedFilter as keyof typeof selectedOptions
              ]?.some((item: TabDetailProps) => item.id === data?.id)}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handleSelect(event, data)
              }
            />
          </div>
        </div>
      ));
    }
  };
  return (
    <Modal
      width="!max-w-[1000px] 1400:!max-w-[1200px]"
      headerTitle={t('Calendar.filterButton')}
      modal={modal}
    >
      <>
        <TabComponent
          searchable
          current={activeTab}
          onTabChange={handleActiveTab}
          onSearch={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch((prev) => {
              return {
                ...prev,
                [activeTab === 0 ? 'companies' : 'productCode']: e.target.value,
              };
            });
          }}
        >
          <TabComponent.Tab
            title={t('Quote.filter.companyTitle')}
            icon="companyIcon"
          >
            <InfiniteScroll
              callBack={courseCallBack}
              hasMoreData={companies?.length < getCompanies?.data?.count}
              className="max-h-[240px] min-h-[230px] mb-8 with-scrollbar pr-1"
            >
              {CompaniesLoading && (
                <div className="flex justify-center">
                  <Image loaderType="Spin" />
                </div>
              )}
              {!CompaniesLoading && companies.length === 0 && (
                <NoDataFound
                  message={t('Table.noDataFound')}
                  className="justify-between"
                />
              )}
              <div className="grid grid-cols-2 1400:grid-cols-3 gap-4 mt-7 ">
                {renderFilter(companies)}
              </div>
            </InfiniteScroll>
          </TabComponent.Tab>
          <TabComponent.Tab
            title={t('Quote.filter.productCodeTitle')}
            icon="clipboardIcon"
          >
            <InfiniteScroll
              callBack={codeCallBack}
              hasMoreData={codes?.length < getProductCode?.data?.count}
              className="max-h-[300px] min-h-[230px] mb-8 with-scrollbar pr-1"
            >
              {CodeLoading && (
                <div className="flex justify-center">
                  <Image loaderType="Spin" />
                </div>
              )}
              {!CodeLoading && codes.length === 0 && (
                <NoDataFound
                  message={t('Table.noDataFound')}
                  className="justify-between"
                />
              )}
              <div className="grid grid-cols-2 1400:grid-cols-3 gap-4 mt-7">
                {renderFilter(codes)}
              </div>
            </InfiniteScroll>
          </TabComponent.Tab>
          <TabComponent.Tab title={t('Quote.filter.salesRep')} icon="companyIcon">
            <InfiniteScroll
              callBack={salesCallBack}
              hasMoreData={salesRepData?.length < getSalesRep?.data?.count}
              className="max-h-[300px] min-h-[230px] mb-8"
            >
              {SalesRepLoading && (
                <div className="flex justify-center">
                  <Image loaderType="Spin" />
                </div>
              )}
              {!SalesRepLoading && salesRepData.length === 0 && (
                <NoDataFound
                  message={t('Table.noDataFound')}
                  className="justify-between"
                />
              )}
              <div className="grid grid-cols-2 1400:grid-cols-3 gap-4 mt-7 ">
                {renderFilter(salesRepData)}
              </div>
            </InfiniteScroll>
          </TabComponent.Tab>
          <TabComponent.Tab
            title={t('Calendar.createEvent.date')}
            icon="clipboardIcon"
          >
            <InfiniteScroll
              callBack={codeCallBack}
              hasMoreData={codes?.length < getProductCode?.data?.count}
              className={`max-h-[300px]  mb-8 ${customPicker && 'min-h-[550px]'}`}
            >
              <div className="grid grid-cols-2 1400:grid-cols-3 gap-4 mt-7">
                <div className="">
                  <ReactSelect
                    label={t('Calendar.createEvent.date')}
                    options={paymentOptions}
                    onChange={(
                      item: Option | Option[] | ObjectOption | ObjectOption[]
                    ) => {
                      const { value } = item as Option;
                      handleDate(item as Option);
                      setDateFilter(value as string);
                    }}
                    selectedValue={dateFilter}
                  />
                  {customPicker && (
                    <>
                      <p className="text-sm leading-5 font-semibold mt-5 pt-5 border-t border-solid border-offWhite mb-3">
                        {t('Calendar.createEvent.date')}
                      </p>
                      <div>
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
                      </div>
                    </>
                  )}
                </div>
              </div>
            </InfiniteScroll>
          </TabComponent.Tab>
        </TabComponent>
        <div className="flex justify-end gap-2">
          <Button
            variants="primary"
            className=""
            onClickHandler={handleFilterOptions}
          >
            <Button className="w-5 h-5 rounded-full border-2 border-solid p-[3px] me-1 inline-block border-white/50 text-white">
              <Image
                iconName="checkIcon"
                iconClassName="w-full h-full stroke-[2px]"
              />
            </Button>
            {t('Calendar.applyFilterButton')}
          </Button>
          <Button
            onClickHandler={() => {
              setQuoteFilters({
                companies: [] as TabDetailProps[],
                codes: [],
                filterDate: {
                  startDate: '',
                  endDate: '',
                },
                payment_mode: '',
                salesRep: [],
              });
              setDateFilter('');
              setFilterDate({
                startDate: '',
                endDate: '',
              });
              modal.closeModal();
            }}
            className=""
            variants="primary"
          >
            {t('CompanyManager.courses.clearFiltersTitle')}
          </Button>
        </div>
      </>
    </Modal>
  );
};

export default FilterShow;
