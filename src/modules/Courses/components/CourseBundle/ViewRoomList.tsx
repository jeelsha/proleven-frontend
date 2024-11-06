// **components**
import Table from 'components/Table/Table';
import { ITableHeaderProps } from 'components/Table/types';

// **hooks**
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// **redux**
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

const ViewRoomList = () => {
  const updateTitle = useTitle();
  const { t } = useTranslation();
  const { currentPage } = useSelector(currentPageSelector);

  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');

  const currentURL = new URL(window.location.href);
  const bundleSlug = currentURL.searchParams.get('slug');

  const { response, isLoading } = useQueryGetFunction('/bundle/rooms', {
    page: currentPage,
    limit,
    sort,
    option: {
      bundle_slug: bundleSlug,
    },
  });

  const columnData = [
    {
      header: t('UserManagement.columnHeader.no'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('Calendar.createEvent.topic'),
      name: 'course_room.title',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('Calendar.eventDetails.trainerTitle'),
      name: 'course_room.title',
      cell: (is_optional: boolean) => {
        return is_optional === true ? t('OptionalTrainer') : t('MainTrainer');
      },
    },
    {
      header: t('CoursesManagement.CreateCourse.maxParticipants'),
      name: 'course_room.maximum_participate',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
  ];

  updateTitle(t('CourseBundle.trainer.room'));
  return (
    <Table
      headerData={columnData as ITableHeaderProps[]}
      bodyData={response?.data?.data}
      loader={isLoading}
      pagination
      dataPerPage={limit}
      setLimit={setLimit}
      totalPage={response?.data?.lastPage}
      dataCount={response?.data?.count}
      setSort={setSort}
      sort={sort}
    />
  );
};

export default ViewRoomList;
