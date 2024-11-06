import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import CustomCard from 'components/Card';
import { useQueryGetFunction } from 'hooks/useQuery';
import { Bar } from 'react-chartjs-2';
import { ReportsProps } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

function RatingGraphReport({ t, filterData, className }: ReportsProps) {
  const { response, isLoading } = useQueryGetFunction(`/reports/ratings`, {
    option: {
      ...(filterData?.startDate && { start_date: filterData?.startDate }),
      ...(filterData?.endDate && { end_date: filterData?.endDate }),
    },
  });
  const labels = [t('1Star'), t('2Star'), t('3Star'), t('4Star'), t('5Star')];

  const getData = (data: number[]) => {
    const maxValue = Math.max(...data);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((_, index) =>
            data[index] === maxValue ? '#00BD9D' : '#0B4565'
          ),
          barThickness: 28,
        },
      ],
    };
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: t('reports.ratingTitle'),
          font: { size: 16, color: '#898989', family: 'Inter, sans-serif' },
        },
      },
      y: {
        title: {
          display: true,
          text: t('reports.numberOfCustomersTitle'),
          font: {
            size: 16,
            color: '#898989',
            family: 'Inter, sans-serif',
          },
        },
        suggestedMin: 0,
        ticks: {
          format: {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          },
        },
      },
    },
  };

  const ratings = response?.data;
  let totalVotes = 0;
  let totalScore = 0;

  if (ratings)
    Object.keys(ratings).forEach((r) => {
      const rating = Number(r);
      totalVotes += ratings[rating];
      totalScore += rating * ratings[rating];
    });

  const totalAverage = totalVotes > 0 ? totalScore / totalVotes : 0;

  return (
    <CustomCard
      cardClass={className ?? ''}
      title={t('reports.rating.title')}
      minimal
    >
      <>
        {isLoading ? (
          <div className="lazy w-full rounded-lg min-h-[360px]" />
        ) : (
          <>
            {response?.data && (
              <div className="flex items-center mb-5 -mt-4">
                <span className=" text-black/50">
                  {t('surveyRating')}: &nbsp;
                  <i className="font-semibold text-black not-italic">
                    {totalAverage.toFixed(2)}
                  </i>
                </span>
              </div>
            )}
            {response?.data && (
              <Bar options={options} data={getData(Object.values(response?.data))} />
            )}
          </>
        )}
      </>
    </CustomCard>
  );
}

export default RatingGraphReport;
