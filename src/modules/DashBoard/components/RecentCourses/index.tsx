import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { useQueryGetFunction } from 'hooks/useQuery';
import { TFunction } from 'i18next';
import { dateRender } from 'modules/Courses/components/Common';
import { isTodayGreaterThanOrEqualToGivenDate } from 'modules/Courses/helper/CourseCommon';
import { CourseResponse } from 'modules/Courses/types';
import 'modules/DashBoard/components/style/dashboard.css';
import { useTranslation } from 'react-i18next';
import { Rating } from 'react-simple-star-rating';

interface RecentCourseType {
  title: string;
  end_date: string;
  rate_by_admin: string;
  start_date: string;
}

const templateRender = (item: CellProps, t: TFunction) => {
  return (
    <div className="flex items-center mr-auto">
      <div className="w-[100px] h-[70px] ss ">
        <Image
          src={item.image}
          width={100}
          height={100}
          imgClassName="w-full h-full object-cover rounded-lg"
          serverPath
        />
      </div>
      <div className="max-max-w-[220px] min-w-[200px] ps-2 flex-1">
        <p className="text-sm text-dark leading-[1.3] mb-1">{item.title}</p>
        {item?.course_bundle_id && (
          <p className="text-base text-primary leading-[1.3] mb-1">
            {t('Dashboard.courses.bundle.title')}
          </p>
        )}
      </div>
    </div>
  );
};

const ratingRender = (
  item: RecentCourseType,
  t: TFunction<'translation', undefined>
) => {
  return isTodayGreaterThanOrEqualToGivenDate(item?.start_date) ? (
    <div className="flex gap-2 items-center">
      <Rating
        size={25}
        initialValue={Number(item.rate_by_admin)}
        transition
        readonly
        allowFraction
        SVGstyle={{ display: 'inline' }}
      />
      <div className="text-sm leading-5 text-dark font-medium">
        {item.rate_by_admin}/5
      </div>
    </div>
  ) : (
    <StatusLabel text={t('courseNotStarted')} variants="secondary" />
  );
};

const RecentCourses = () => {
  const { t } = useTranslation();

  const { response, isLoading } = useQueryGetFunction('/course/trainers', {
    page: 1,
    limit: 10,
    sort: '-updated_at',
    option: {
      is_dashboard: true,
    },
  });

  const columnData: ITableHeaderProps[] = [
    {
      header: t('UserManagement.courseTab.Title'),
      cell: (props) => templateRender(props, t),
    },
    {
      header: t('CoursesManagement.columnHeader.endDate'),
      name: 'end_date',
      cell: (props) => dateRender((props as unknown as CourseResponse).end_date),
    },
    {
      header: t('CoursesManagement.columnHeader.Rating'),
      cell: (props) => ratingRender(props as unknown as RecentCourseType, t),
      name: 'rate_by_admin',
    },
  ];

  return (
    <Table
      parentClassName="!p-0"
      tableRoundedRadius="pt-[1.75rem]"
      tableHeaderClass="sticky top-0 z-1"
      tableHeightClassName="!min-h-[unset] max-h-[390px] overflow-auto pe-2"
      headerTitle={t('Dashboard.Trainer.RecentCourse.title')}
      headerData={columnData}
      bodyData={response?.data?.data}
      loader={isLoading}
      dataPerPage={10}
      PageHeaderClass="!pt-0 !z-1"
    />
  );
};
export default RecentCourses;
