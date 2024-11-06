import CustomCard from 'components/Card';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import { getLocale } from 'constants/common.constant';
import { format, getMonth, parse } from 'date-fns';
import { useAxiosGet } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { ReportsProps, SellRepsData, TransactionData } from '../types';

const TransactionReport = ({ t, filterData, className }: ReportsProps) => {
  const { language } = useSelector(useLanguage);
  const { response, isLoading } = useQueryGetFunction(`/reports/transactions`, {
    option: {
      ...(filterData?.startDate && { start_date: filterData?.startDate }),
      ...(filterData?.endDate && { end_date: filterData?.endDate }),
    },
  });
  const [fetchReps] = useAxiosGet();
  const [sellReps, setSellReps] = useState<SellRepsData[]>([]);
  const [barData, setBarData] = useState<TransactionData[]>([]);
  const [selectVal, setSelectVal] = useState('');
  useEffect(() => {
    setBarData(response?.data);
    fetchSellRep();
  }, [response?.data]);
  function fetchSellRep() {
    fetchReps('/users?role=6&view=true')
      .then((res) => {
        setSellReps(res.data.data);
      })
      .catch();
  }
  const now = new Date();
  const currentYear = now.getFullYear();

  const getData = (data: TransactionData[]) => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: t('InvoiceFilter.paid'),
            backgroundColor: '#00BD9D',
            borderWidth: 1,
            data: [],
          },
          {
            label: t('reports.unPaidTitle'),
            backgroundColor: '#0B4565',
            borderWidth: 1,
            data: [],
          },
        ],
      };
    }
    const monthsData = data.map((item) => item.month);
    const months = monthsData.map(
      (dateString) => getMonth(parse(dateString, 'yyyy-MM', new Date())) + 1
    );
    const highestMonth = months.length ? Math.max(...months) : 0;
    const paidData = new Array(highestMonth).fill(0);
    const unpaidData = new Array(highestMonth).fill(0);

    data.forEach((item) => {
      const monthIndex = getMonth(parse(item.month, 'yyyy-MM', new Date()));
      paidData[monthIndex] = item.paid;
      unpaidData[monthIndex] = item.unpaid;
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
          label: t('InvoiceFilter.paid'),
          backgroundColor: '#00BD9D',
          borderWidth: 1,
          data: paidData,
        },
        {
          label: t('reports.unPaidTitle'),
          backgroundColor: '#0B4565',
          borderWidth: 1,
          data: unpaidData,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };
  const opt = sellReps?.map((sell) => ({
    value: sell.id,
    label: sell.full_name,
  }));
  function fetchDataOfSell(salesPerson: Option | null) {
    if (salesPerson !== null) {
      fetchReps(`/reports/transactions`, {
        params: {
          sales_rep_id: salesPerson.value,
          ...(filterData?.startDate && { start_date: filterData?.startDate }),
          ...(filterData?.endDate && { end_date: filterData?.endDate }),
        },
      })
        .then((res) => {
          setBarData(res.data);
          setSelectVal(salesPerson.label);
        })
        .catch();
    }
  }
  return (
    <div>
      <CustomCard
        cardClass={className ?? ''}
        title={t('reports.transaction.title')}
        minimal
        headerExtra={
          <div className="max-w-[220px] min-w-[200px]">
            <ReactSelect
              isMulti={false}
              name="Sells"
              selectedValue={selectVal}
              isInput
              options={opt ?? []}
              className={`${'relative'}`}
              isLoading={isLoading}
              onChange={(e) => fetchDataOfSell(e as Option)}
              placeholder={t('Reports.salesReps')}
            />
          </div>
        }
      >
        <>
          {barData?.[0]?.net_revenue ? (
            <div className="flex items-center mb-5 -mt-4">
              <span className="w-3 h-3 bg-[#00BD9D] inline-block mr-2" />
              <span className=" text-black/50">
                {t('netRevenue')}:
                <i className="font-semibold text-black not-italic">
                  {' '}
                  {getCurrencySymbol('EUR')}
                  {formatCurrency(Number(barData?.[0]?.net_revenue), 'EUR')}
                </i>
              </span>
            </div>
          ) : (
            ''
          )}
          {isLoading ? (
            <div className="lazy w-full rounded-lg min-h-[300px]" />
          ) : (
            <Bar data={getData(barData)} options={options} />
          )}
        </>
      </CustomCard>
    </div>
  );
};

export default TransactionReport;
