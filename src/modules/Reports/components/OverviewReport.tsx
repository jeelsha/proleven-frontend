import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import { useQueryGetFunction } from 'hooks/useQuery';
import { Doughnut } from 'react-chartjs-2';
import { OverviewData, ReportsProps } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

const OverviewReport = ({ t, filterData, className }: ReportsProps) => {
  const { response, isLoading } = useQueryGetFunction(`/reports/users`, {
    option: {
      ...(filterData?.startDate && { start_date: filterData?.startDate }),
      ...(filterData?.endDate && { end_date: filterData?.endDate }),
    },
  });
  const maxTotal = Math.max(
    ...Object.values(response?.data || {}).map(
      (item) => (item as { total: number }).total
    )
  );
  const getTitle = (key: string) => {
    switch (key) {
      case 'trainingSpecialists':
        return t('roles.TrainingSpecialist');
      case 'companies':
        return t('SideNavigation.client.label');
      default:
        return t('Calendar.filterTabs.trainersTitle');
    }
  };
  const getTooltip = (key: string) => {
    switch (key) {
      case 'trainingSpecialists':
        return t('OverView.trainingSpecialists');
      case 'companies':
        return t('OverView.companies');
      default:
        return t('OverView.trainer');
    }
  };

  const getData1 = (data: OverviewData) => ({
    labels: ['Progress'],
    datasets: [
      {
        data: [data.total, maxTotal], // assigned and remaining
        backgroundColor: ['#00BD9D', '#e0e0e0'],
        hoverBackgroundColor: ['#00aaff', '#e0e0e0'],
        borderWidth: 0,
        cutout: '93%',
      },
    ],
  });

  const options1 = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: 235,
    circumference: 250,
    plugins: {
      tooltip: {
        enabled: false, // Disable tooltip
      },
      legend: {
        display: false, // Hide legend
      },
    },
  };

  const getData2 = (data: OverviewData) => ({
    labels: ['Progress'],
    datasets: [
      {
        data: [data.assigned, maxTotal], // assigned
        backgroundColor: ['#0B4565', '#e0e0e0'],
        hoverBackgroundColor: ['#ff4d4d', '#e0e0e0'],
        borderWidth: 0,
        cutout: '93%',
      },
    ],
  });

  const options2 = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: 270,
    circumference: 180,
    plugins: {
      tooltip: {
        enabled: false, // Disable tooltip
      },
      legend: {
        display: false, // Hide legend
      },
    },
  };
  return (
    <CustomCard
      cardClass={className ?? ''}
      headerClass="pb-2"
      title={t('reports.overview.title')}
      minimal
    >
      <>
        {isLoading ? (
          <div className="lazy w-full rounded-lg min-h-[300px]" />
        ) : (
          <div className="grid 1300:grid-cols-3 1200:grid-cols-2 991:grid-cols-3 grid-cols-2 gap-5 mt-10">
            {response?.data &&
              Object.entries(response?.data).map(([key, data]: [string, any]) => (
                <div
                  key={key}
                  className="relative flex items-center flex-col justify-center"
                >
                  <div className="relative 1600:max-w-[200px] 1400:max-w-[160px] 1300:max-w-[140px] max-w-[170px]">
                    <div className="absolute 1600:top-[-30px] 1400:top-[-24px] 1300:top-[-20px] top-[-24px] left-0 w-full">
                      <Doughnut data={getData2(data)} options={options2} />
                    </div>
                    <div className="px-3">
                      <Doughnut data={getData1(data)} options={options1} />
                    </div>
                  </div>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2.5">
                      <Image iconName="userGroupIcon" />
                    </span>
                    <span className="block font-semibold text-xl text-[#00BD9D]">
                      {data.total}
                    </span>
                  </div>
                  <p className="font-medium text-center flex items-center gap-1 text-dark text-sm mt-3">
                    {getTitle(key)}
                    <Button
                      className="group relative"
                      tooltipText={getTooltip(key)}
                      tooltipPosition="bottom"
                    >
                      <Image iconName="infoIcon" iconClassName="w-3.5 h-3.5" />
                    </Button>
                  </p>
                </div>
              ))}
          </div>
        )}
      </>
    </CustomCard>
  );
};

export default OverviewReport;
