import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import { getLocale } from 'constants/common.constant';
import { format, getMonth, parse } from 'date-fns';
import { useAxiosGet } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useToggleDropdown } from 'hooks/useToggleDropdown';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import {
  ProductFilterType,
  ReportsProps,
  RevenueData,
  RevenueFilterProps,
} from '../types';
import RevenueFilter from './RevenueFilter';

const RevenueReport = ({ t, className, filterData }: ReportsProps) => {
  const [filterListData, setFilterListData] = useState({
    codeResponse: [] as unknown as ProductFilterType[],
    categoryResponse: [] as unknown as ProductFilterType[],
    courseListResponse: [] as number[],
  });
  const [getRevenueData, { isLoading }] = useAxiosGet();
  const [revenueResponse, setRevenueResponse] = useState();
  const { language } = useSelector(useLanguage);
  const now = new Date();
  const currentYear = now.getFullYear();
  const [initialValues, setInitialValues] = useState<RevenueFilterProps>();

  const fetchRevenueData = async () => {
    const params = {
      ...(filterData?.startDate && { start_date: filterData?.startDate }),
      ...(filterData?.endDate && { end_date: filterData?.endDate }),
      ...(initialValues &&
        Array.isArray(initialValues?.category_id) &&
        initialValues?.category_id?.length > 0 && {
          category_id: initialValues?.category_id?.join(','),
        }),
      ...(initialValues &&
        Array.isArray(initialValues?.code_id) &&
        initialValues?.code_id?.length > 0 && {
          code_id: initialValues?.code_id?.join(','),
        }),
    };
    const response = await getRevenueData(`/reports/revenue`, {
      params,
    });
    setRevenueResponse(response.data);
  };

  useEffect(() => {
    fetchRevenueData();
  }, [initialValues, filterData]);

  const { response: filterResponse, isLoading: filterLoading } = useQueryGetFunction(
    `/reports/product-filter`,
    {
      option: {
        ...(initialValues?.category_id && {
          category_id: initialValues?.category_id.join(','),
        }),
        ...(initialValues?.code_id && { code_id: initialValues?.code_id.join(',') }),
      },
    }
  );
  const productArea = useToggleDropdown();
  const productCode = useToggleDropdown();

  useEffect(() => {
    setFilterListData({
      ...filterListData,
      codeResponse: filterResponse?.data?.codes,
      categoryResponse: filterResponse?.data?.categories?.data,
    });
  }, [filterResponse]);

  const getData = (data: RevenueData[]) => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: t('reports.expenseTitle'),
            backgroundColor: '#0B4565',
            borderWidth: 1,
            data: [],
          },
          {
            label: t('reports.revenueTitle'),
            backgroundColor: '#00BD9D',
            borderWidth: 1,
            data: [],
          },
          {
            label: t('reports.trainerExpenseTitle'),
            backgroundColor: '#F2C94C',
            borderWidth: 1,
            data: [],
          },
        ],
      };
    }

    const monthsData = data.length > 0 ? data?.map((item) => item.month) : [];
    const months =
      monthsData.length > 0
        ? monthsData?.map(
            (dateString) => getMonth(parse(dateString, 'yyyy-MM', new Date())) + 1
          )
        : [];
    const highestMonth = months && Math.max(...months);
    const trainerExpenseData = new Array(highestMonth).fill(0);
    const revenueData = new Array(highestMonth).fill(0);
    const expenseData = new Array(highestMonth).fill(0);

    data.forEach((item) => {
      const monthIndex = getMonth(parse(item.month, 'yyyy-MM', new Date()));
      trainerExpenseData[monthIndex] = item.trainer_expense;
      revenueData[monthIndex] = item.revenue;
      expenseData[monthIndex] = item.expense;
    });

    const labels = Array.from({ length: highestMonth }, (_, i) => {
      const monthName = format(new Date(currentYear, i, 1), 'MMM', {
        locale: getLocale(language),
      });
      return `${monthName} ${currentYear}`;
    });

    return {
      labels,
      datasets: [
        {
          label: t('reports.expenseTitle'),
          backgroundColor: '#0B4565',
          borderWidth: 1,
          data: expenseData,
        },
        {
          label: t('reports.revenueTitle'),
          backgroundColor: '#00BD9D',
          borderWidth: 1,
          data: revenueData,
        },
        {
          label: t('reports.trainerExpenseTitle'),
          backgroundColor: '#F2C94C',
          borderWidth: 1,
          data: trainerExpenseData,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <CustomCard
      cardClass={className ?? ''}
      title={t('reports.revenue.title')}
      minimal
    >
      <>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            onClickHandler={() => {
              setInitialValues({ category_id: [], code_id: [] });
            }}
            variants="primary"
            className="gap-1 !flex !py-2.5 !px-3.5"
          >
            <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
            {t('CompanyManager.courses.clearFiltersTitle')}
          </Button>
          <div className="relative" ref={productArea.dropdownRef}>
            <Button
              variants="primary"
              className="gap-1 !flex !py-2.5 !px-3.5"
              onClickHandler={() => {
                productArea.toggleDropdown();
              }}
            >
              <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
              {t('reports.productAreaTitle')}
            </Button>
            {productArea.isDropdownOpen && (
              <div
                className={`${
                  productArea.isDropdownOpen && 'z-1'
                } absolute top-full right-0 mt-2  before:absolute transition-all duration-300`}
              >
                <div className="bg-white rounded-xl shadow-card w-[340px]">
                  <div className="px-5 py-3">
                    <div className="flex flex-col gap-y-3">
                      <RevenueFilter
                        filterListData={filterListData.categoryResponse}
                        setInitialValues={setInitialValues}
                        initialValues={initialValues}
                        type="category"
                        modal={productArea}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={productCode.dropdownRef}>
            <Button
              variants="primary"
              className="gap-1 !flex !py-2.5 !px-3.5"
              onClickHandler={() => {
                productCode.toggleDropdown();
              }}
            >
              <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
              {t('reports.productCodeTitle')}
            </Button>
            {productCode.isDropdownOpen && (
              <div
                className={`${
                  productCode.isDropdownOpen && 'z-1'
                } absolute top-full right-0 mt-2 before:absolute transition-all duration-300`}
              >
                <div className="bg-white rounded-xl shadow-card w-[340px]">
                  <div className="px-5 py-3">
                    <div className="flex flex-col gap-y-3">
                      <RevenueFilter
                        filterListData={filterListData.codeResponse}
                        setInitialValues={setInitialValues}
                        initialValues={initialValues}
                        type="code"
                        modal={productCode}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {filterLoading || isLoading ? (
          <div className="lazy w-full rounded-lg min-h-[300px]" />
        ) : (
          revenueResponse && (
            <Bar data={getData(revenueResponse)} options={options} />
          )
        )}
      </>
    </CustomCard>
  );
};

export default RevenueReport;
