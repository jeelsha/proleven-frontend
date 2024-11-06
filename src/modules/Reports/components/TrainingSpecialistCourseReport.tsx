// ** Components
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import ReactSelect from 'components/FormElement/ReactSelect';
import Image from 'components/Image';
import Table from 'components/Table/Table';
import { intervalToDuration } from 'date-fns';

// ** Hooks
import { useAxiosGet } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// ** Slices
import {
  currentPageCount,
  currentPageSelector,
} from 'redux-toolkit/slices/paginationSlice';

// ** Types
import { Option } from 'components/FormElement/types';
import { ITableHeaderProps } from 'components/Table/types';
import { CourseResponse } from 'modules/Courses/types';

// ** Utils
import { useHandleExport } from 'utils';
import { CourseTypeEnum, FilterDataProps, TrainingSpecialistProps } from '../types';

interface ReportsProps {
  className?: string;
  filterData?: FilterDataProps;
}

interface ITrainingSpecialists {
  className?: string;
  data: Array<CourseResponse>;
  count: number;
  currentPage: number;
  limit: number;
  lastPage: number;
}

interface TotalDaysProps {
  proposed_date: string;
}

const TrainingSpecialistCourseReport = ({ className, filterData }: ReportsProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // ** Selectors
  const { currentPage } = useSelector(currentPageSelector);

  // ** States
  const [limit, setLimit] = useState<number>(3);
  const [sort, setSort] = useState<string>('-updated_at');
  const [selectedData, setSelectedData] = useState<Option>();
  const [trainingSpecialists, setTrainingSpecialists] =
    useState<ITrainingSpecialists>();
  const { exportDataFunc } = useHandleExport();

  // **  APIs
  const [getTrainingSpecialist, { isLoading }] = useAxiosGet();
  const [exportTrainingSpecialist, { isLoading: exportingData }] = useAxiosGet();
  const { response, isLoading: optionsLoading } = useQueryGetFunction('/users', {
    role: '1,2',
    option: {
      dropdown: true,
      label: 'full_name',
      value: 'slug',
    },
  });

  const columnData: Array<ITableHeaderProps> = [
    {
      header: t('CoursesManagement.columnHeader.No'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Name'),
      name: 'course.title',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.CreateCourse.courseCode'),
      name: 'course.code',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Type'),
      name: 'course.type',
      cell: (props) => typeRender(props as unknown as TrainingSpecialistProps),
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('reports.ratingTitle'),
      name: 'course.rating',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('reports.revenueTitle'),
      name: 'course.courseRevenue',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('reportDays.transactionReport'),
      name: 'course.totalDays',
      cell: (props) => totalDaysRender(props as unknown as TotalDaysProps),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
  ];

  const totalDaysRender = (item: TotalDaysProps) => {
    if (!item?.proposed_date) {
      return <div>-</div>;
    }

    const currentDate = new Date();
    const startDate = new Date(item.proposed_date);
    const endDate = currentDate;

    const interval = { start: startDate, end: endDate };
    const duration = intervalToDuration(interval);

    const totalDays = Math.round(
      (duration.days ?? 0) +
        (duration.hours ?? 0) / 24 +
        (duration.minutes ?? 0) / 1440 +
        (duration.seconds ?? 0) / 86400
    );

    return <div>{totalDays}</div>;
  };

  const typeRender = (item: TrainingSpecialistProps) => {
    return (
      <div className="flex items-center">
        {item?.type === 'private' ? CourseTypeEnum.private : CourseTypeEnum.academy}
      </div>
    );
  };

  const fetchTrainingSpecialistData = async () => {
    const { endDate, startDate } = filterData ?? {};
    const { data, error } = await getTrainingSpecialist('/course/member', {
      params: {
        member: selectedData?.value,
        page: currentPage,
        limit,
        sort,
        report: true,
        ...(endDate ? { end_date: endDate } : {}),
        ...(startDate ? { start_date: startDate } : {}),
      },
    });
    if (!error) setTrainingSpecialists(data);
  };

  const handleChange = (item: Option) => {
    setSelectedData(item);
    dispatch(currentPageCount({ currentPage: 1 }));
  };

  const handleExportData = async () => {
    const { data } = await exportTrainingSpecialist('/course/member', {
      params: {
        member: selectedData?.value,
        sort,
        report: true,
        view: true,
      },
    });

    exportDataFunc({
      response: data.data,
      exportFor: 'report',
      fileName: selectedData?.label,
    });
  };

  const renderHeader = () => {
    return (
      <>
        {optionsLoading ? (
          <div className="flex gap-2 min-w-[220px]">
            <div className="lazy w-36 h-12" />
            <div className="lazy w-48 h-12" />
          </div>
        ) : (
          <div className="flex gap-2 min-w-[220px]">
            <Button
              isLoading={exportingData}
              variants="whiteBordered"
              onClickHandler={() => handleExportData()}
            >
              <span className="w-5 h-5 inline-block me-2">
                <Image iconName="exportCsv" iconClassName="w-full h-full" />
              </span>
              {t('PrivateMembers.membersButtons.exportButton')}
            </Button>
            <ReactSelect
              name={t('roles.trainingSpecialist')}
              selectedValue={selectedData?.value}
              isInput
              options={response?.data ?? []}
              className={`${'relative'}`}
              isLoading={optionsLoading}
              onChange={(e) => handleChange(e as Option)}
              placeholder={t('reports.selectTrainingSpecialist')}
            />
          </div>
        )}
      </>
    );
  };

  // ** useEffects
  useEffect(() => {
    if (selectedData) fetchTrainingSpecialistData();
  }, [selectedData, currentPage, sort, filterData]);

  useEffect(() => {
    const current = response?.data?.[0];
    if (current) setSelectedData(current);
  }, [response]);

  return (
    <CustomCard
      cardClass={className ?? ''}
      headerClass="pb-2"
      title={t('reports.trainingSpecialistCourses')}
      minimal
      headerExtra={renderHeader()}
    >
      <Table
        headerData={columnData}
        bodyData={trainingSpecialists?.data}
        loader={isLoading || optionsLoading}
        dataPerPage={limit}
        setLimit={setLimit}
        totalPage={trainingSpecialists?.lastPage}
        dataCount={trainingSpecialists?.count}
        setSort={setSort}
        sort={sort}
        pagination
      />
    </CustomCard>
  );
};

export default TrainingSpecialistCourseReport;
