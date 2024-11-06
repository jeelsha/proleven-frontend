import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { DateFilterOption } from 'constants/dateFilterOption.constant';
import { differenceInMonths, eachMonthOfInterval } from 'date-fns';
import { useQueryGetFunction } from 'hooks/useQuery';
import { Months } from 'modules/DashBoard/constants';
import { IBarChatProps } from 'modules/DashBoard/types';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { convertDateToUTCISOString } from 'utils/date';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function BarChart(props: IBarChatProps) {
  const { t } = useTranslation();

  const { response } = useQueryGetFunction('/dashboard/graph', {
    option: {
      start_date: convertDateToUTCISOString(props?.startDate),
      end_date: convertDateToUTCISOString(props?.endDate),
    },
  });
  const [count, setCount] = useState<{
    privateCourse: number[];
    academyCourse: number[];
  }>({
    privateCourse: [],
    academyCourse: [],
  });

  const getDayOfMonth = (start: Date, end: Date) => {
    const allDates = [];
    const date = new Date(start);
    while (date <= end) {
      allDates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return allDates.map((date) =>
      date.toLocaleDateString('en-CA', {
        day: 'numeric',
      })
    );
  };

  const days = getDayOfMonth(props?.startDate, props?.endDate);

  const getLabels = () => {
    const scaleTitle = new Date().getFullYear();
    const scaleTitleMonth = new Date(props?.startDate).toLocaleString('default', { month: 'long' });

    const differenceMonth = differenceInMonths(props?.endDate, props?.startDate);

    if (props?.startDate > props?.endDate) {
      return { labels: [], title: '' };
    }

    const monthsName = eachMonthOfInterval({
      start: props?.startDate,
      end: props?.endDate,
    });

    // Determine if the start and end dates are in the same month and year
    const isSameMonth = props?.startDate.getMonth() === props?.endDate.getMonth() &&
      props?.startDate.getFullYear() === props?.endDate.getFullYear();

    // Correctly set the title based on whether the dates are in the same month
    const rangeMonthName = isSameMonth
      ? scaleTitleMonth
      : `${monthsName[0].toLocaleString('default', { month: 'long' })} - ${monthsName[monthsName.length - 1].toLocaleString('default', { month: 'long' })}`;

    switch (props?.selectedVal as string) {
      case DateFilterOption.THIS_YEAR:
        return { labels: Months, title: scaleTitle };
      case DateFilterOption.NEXT_YEAR:
        return { labels: Months, title: scaleTitle };
      case DateFilterOption.LAST_YEAR:
        return { labels: Months, title: new Date().getFullYear() - 1 };
      case DateFilterOption.THIS_QUAT:
        return { labels: Months, title: scaleTitle };
      case DateFilterOption.NEXT_QUAT:
        return { labels: Months, title: scaleTitle };
      case DateFilterOption.PREV_QUAT:
        return { labels: Months, title: new Date().getFullYear() - 1 };
      case DateFilterOption.THIS_MONTH:
        return { labels: days, title: scaleTitleMonth };
      case DateFilterOption.PREV_MONTH:
        return { labels: days, title: scaleTitleMonth };
      default:
        return {
          labels: differenceMonth >= 1 ? Months : days,
          title: differenceMonth >= 1 ? rangeMonthName : scaleTitleMonth,
        };
    }
  };

  const { labels } = getLabels();

  useEffect(() => {
    if (response?.data) {
      const privateCount = labels?.map((item) => {
        const value = response?.data?.private ? response?.data?.private[item] : 0;
        return value;
      });
      const academicCount = labels?.map((item) => {
        const value = response?.data?.academic ? response?.data?.academic[item] : 0;
        return value;
      });
      if (privateCount.length > 0 || academicCount.length > 0) {
        setCount({
          privateCourse: privateCount,
          academyCourse: academicCount,
        });
      }
    }
  }, [response?.data]);

  // CSS for GRAPH
  // useEffect(() => {
  //   const a = document.getElementById('canvasBar')
  //   if (!openSidebar) {
  //     const parentDiv = a?.parentElement;
  //     if (parentDiv) {
  //       parentDiv.style.height = "40vh"
  //       parentDiv.style.width = "auto"
  //     }
  //   }
  //   else {
  //     const parentDiv = a?.parentElement;
  //     if (parentDiv) {
  //       parentDiv.style.height = ""
  //       parentDiv.style.width = ""
  //     }
  //   }
  // }, [openSidebar])
  const { title } = getLabels();
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
      },
    },
    scales: {
      y: {
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: {
          format: {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: title as string,
          font: {
            size: 20,
          },
          padding: {
            top: 20,
          },
        },
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: t('Dashboard.reports.reportsTabPrivate'),
        data: count.privateCourse,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: t('Dashboard.reports.reportsTabAcademy'),
        data: count.academyCourse,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return <Bar id="canvasBar" options={options} data={data} />;
}
