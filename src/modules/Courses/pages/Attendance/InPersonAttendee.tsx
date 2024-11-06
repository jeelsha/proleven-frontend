import { format } from 'date-fns';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import BreakTimeModal from 'components/LessonCard/BreakTimeModal';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';
import { CustomTimePicker } from 'components/TimePicker';
import BreakLogModal from './BreakLogModal';

// ** axios hooks **
import { useAxiosPut } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';

// ** types **
import { ITableHeaderProps } from 'components/Table/types';
import { FetchAttendeeDetails } from 'modules/CompanyManager/types';
import { LessonSessionTimeSheet } from 'modules/Courses/types';

// ** constants **
import { ROLES } from 'constants/roleAndPermission.constant';

// ** redux-slice **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

// ** utils **
import { REACT_APP_DATE_FORMAT } from 'config';
import {
  CourseAttendanceActionProps,
  CourseAttendanceSheetProps,
} from 'modules/Courses/types/attendanceCard';
import { capitalizeFirstCharacter, useDebounce } from 'utils';
import NoDataModal from './NoDataModal';

const InPersonAttendee = () => {
  const { t } = useTranslation();

  const { currentPage } = useSelector(currentPageSelector);
  const user = useSelector(getCurrentUser);

  const location = useLocation()?.state;
  const params = useParams();

  const [addMainAttendance] = useAxiosPut();

  const initialValues = {
    course_slug: '',
    course_participate_id: '',
    mark_as_absent: false,
    lesson_session_id: '',
    set_early_leave: '',
    set_early_arrival: '',
  };

  const [absentData, setAbsentData] = useState<{ [key: string]: unknown }>(
    initialValues
  );
  const [course, setCourse] = useState<{
    end_date: string;
    id: number;
    start_date: string;
  } | null>(null);

  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [search, setSearch] = useState<string>('');
  const [selectedData, setSelectedData] = useState<FetchAttendeeDetails | null>(
    null
  );
  const [participateSlug, setParticipateSlug] = useState<string>('');
  const [breakLog, setBreakLog] = useState<
    LessonSessionTimeSheet['courseAttendanceLog']
  >([]);

  const debouncedSearch = useDebounce(search, 500);

  const absentModal = useModal();
  const lateArrivalModal = useModal();
  const earlyLeaveModal = useModal();
  const breakTimeModal = useModal();
  const breakLogModal = useModal();

  const currDate = new Date();
  const courseStartTime = course?.start_date ? new Date(course?.start_date) : '';
  const courseEndTime = course?.end_date ? new Date(course?.end_date) : '';

  const { response, isLoading, refetch } = useQueryGetFunction(
    `/trainer/courses/attendance-sheet`,
    {
      page: currentPage,
      limit,
      sort,
      search: debouncedSearch,
      option: {
        course_slug: params?.slug,
        lesson_session_id: location?.lessonSessionId,
      },
    }
  );

  useEffect(() => {
    if (response?.data.course) {
      setCourse(response?.data?.course);
    }
  }, [response?.data]);

  const SessionStartTime = ({
    courseAttendanceSheet,
  }: CourseAttendanceSheetProps) => {
    return (
      <>
        {courseAttendanceSheet[0]?.lessonSession?.start_time
          ? format(
              new Date(courseAttendanceSheet[0]?.lessonSession?.start_time),
              'hh:mm aa'
            )
          : ''}
        {location?.isEdit === false && (
          <>
            {courseAttendanceSheet[0]?.mark_as_absent === true && (
              <StatusLabel text={t('Tooltip.absent')} variants="cancelled" />
            )}
            {courseAttendanceSheet[0]?.set_early_arrival && (
              <StatusLabel text={t('Tooltip.lateArrival')} variants="completed" />
            )}
            {courseAttendanceSheet[0]?.set_early_leave && (
              <StatusLabel text={t('Tooltip.earlyLeave')} variants="secondary" />
            )}
          </>
        )}
      </>
    );
  };
  const SessionEndTime = ({ courseAttendanceSheet }: CourseAttendanceSheetProps) => {
    return (
      <>
        {courseAttendanceSheet[0]?.lessonSession?.end_time
          ? format(
              new Date(courseAttendanceSheet[0]?.lessonSession?.end_time),
              'hh:mm aa'
            )
          : ''}
      </>
    );
  };
  const JoinedAt = ({ courseAttendanceSheet }: CourseAttendanceSheetProps) => {
    return (
      <div className="flex flex-col">
        {courseAttendanceSheet[0]?.mark_as_start_signed_at
          ? format(
              new Date(courseAttendanceSheet[0]?.mark_as_start_signed_at),
              'hh:mm aa'
            )
          : '-'}
        <span>
          {courseAttendanceSheet[0]?.set_early_arrival !== null &&
            t('InPersonAttendee.lateJoining')}
        </span>
      </div>
    );
  };
  const LeaveAt = ({ courseAttendanceSheet }: CourseAttendanceSheetProps) => {
    return (
      <div className="flex flex-col">
        {courseAttendanceSheet[0]?.mark_as_end_signed_at
          ? format(
              new Date(courseAttendanceSheet[0]?.mark_as_end_signed_at),
              'hh:mm aa'
            )
          : '-'}
        <span>
          {courseAttendanceSheet[0]?.set_early_leave !== null &&
            courseAttendanceSheet[0]?.set_early_leave !== undefined &&
            t('InPersonAttendee.earlyLeaving')}
        </span>
      </div>
    );
  };

  const MarkedAbsent = ({ courseAttendanceSheet }: CourseAttendanceSheetProps) => {
    return (
      <>
        {courseAttendanceSheet[0]?.mark_as_absent === '0'
          ? t('confirmationChoices.noOption')
          : t('confirmationChoices.yesOption')}
      </>
    );
  };
  const columnData: ITableHeaderProps[] = [
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
      header: t('InPersonAttendee.name'),
      name: 'first_name',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('InPersonAttendee.startTime'),

      cell: (props) =>
        SessionStartTime(props as unknown as CourseAttendanceSheetProps),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('InPersonAttendee.endTime'),
      cell: (props) =>
        SessionEndTime(props as unknown as CourseAttendanceSheetProps),

      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('InPersonAttendee.joinedAt'),
      cell: (props) => JoinedAt(props as unknown as CourseAttendanceSheetProps),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('InPersonAttendee.leaveAt'),
      cell: (props) => LeaveAt(props as unknown as CourseAttendanceSheetProps),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('InPersonAttendee.markAbsent'),
      cell: (props) => MarkedAbsent(props as unknown as CourseAttendanceSheetProps),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('EmailTemplate.emailTempTableActions'),
      name: 'actionRender',
      className: 'w-40',
      cell: (props) => actionRender(props as unknown as CourseAttendanceActionProps),
    },
  ];
  const actionRender = (item: CourseAttendanceActionProps) => {
    const displayAction =
      currDate <= courseStartTime &&
      currDate <= courseEndTime &&
      item.courseAttendanceSheet[0]?.mark_as_absent === '1' &&
      _.isEmpty(item.courseAttendanceLog);

    return displayAction ? (
      '-'
    ) : (
      <div className="flex gap-2 items-center justify-center ms-auto">
        {(user?.role_name === ROLES.Admin ||
          user?.role_name === ROLES.TrainingSpecialist ||
          user?.role_name === ROLES.Trainer) &&
          currDate >= courseStartTime &&
          currDate <= courseEndTime && (
            <>
              <Button
                onClickHandler={() => {
                  setAbsentData({
                    ...absentData,
                    course_participate_id: item?.id,
                    course_slug: location?.slug,
                    lesson_session_id: location?.lessonSessionId,
                    mark_as_absent: true,
                    session_date: format(
                      new Date(
                        item?.courseAttendanceSheet[0]?.lessonSession?.start_time
                      ),
                      REACT_APP_DATE_FORMAT as string
                    ),
                  });
                  lateArrivalModal.openModal();
                }}
                parentClass="h-fit"
                // disabled={currDate < courseStartTime}
                className="action-button green-btn"
                tooltipText={t('Tooltip.lateArrival')}
              >
                <Image
                  iconName="clockIcon"
                  iconClassName="stroke-current w-5 h-5"
                  width={24}
                  height={24}
                />
              </Button>

              <Button
                parentClass="h-fit"
                onClickHandler={() => {
                  setAbsentData({
                    ...absentData,
                    course_participate_id: item?.id,
                    course_slug: location?.slug,
                    lesson_session_id: location?.lessonSessionId,
                    mark_as_absent: true,
                    session_date: format(
                      new Date(
                        item?.courseAttendanceSheet[0]?.lessonSession?.end_time
                      ),
                      REACT_APP_DATE_FORMAT as string
                    ),
                  });
                  earlyLeaveModal.openModal();
                }}
                className="action-button primary-btn"
                tooltipText={t('Tooltip.earlyLeave')}
              >
                <Image
                  iconName="stopwatchIcon"
                  iconClassName="stroke-current w-5 h-5"
                  width={24}
                  height={24}
                />
              </Button>
            </>
          )}
        {item.courseAttendanceSheet[0]?.mark_as_absent === '0' && (
          <Button
            parentClass="h-fit"
            onClickHandler={() => {
              setAbsentData({
                ...absentData,
                course_participate_id: item?.id,
                course_slug: location?.slug,
                lesson_session_id: location?.lessonSessionId,
                mark_as_absent: true,
              });
              absentModal?.openModal();
            }}
            className="action-button red-btn"
            tooltipText={t('Tooltip.absent')}
          >
            <Image
              iconName="userCrossIcon"
              iconClassName="stroke-current w-5 h-5"
              width={24}
              height={24}
            />
          </Button>
        )}
        {(user?.role_name === ROLES.Admin ||
          user?.role_name === ROLES.TrainingSpecialist ||
          user?.role_name === ROLES.Trainer) &&
          currDate >= courseStartTime &&
          currDate <= courseEndTime && (
            <Button
              parentClass="h-fit"
              onClickHandler={() => {
                setSelectedData(
                  item?.courseAttendanceSheet[0]
                    ?.lessonSession as unknown as FetchAttendeeDetails | null
                );
                setParticipateSlug(item?.slug);
                breakTimeModal?.openModal();
              }}
              className="action-button primary-btn"
              tooltipText={t('Tooltip.AddBreakTime')}
            >
              <Image
                iconName="stopwatchIcon"
                iconClassName="stroke-current w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
          )}

        {!_.isEmpty(item.courseAttendanceLog) && (
          <Button
            parentClass="h-fit"
            onClickHandler={() => {
              setBreakLog(item.courseAttendanceLog);
              breakLogModal.openModal();
            }}
            className="action-button green-btn"
            tooltipText={t('Tooltip.ViewBreakTime')}
          >
            <Image
              iconName="eyeIcon"
              iconClassName="stroke-current w-5 h-5"
              width={24}
              height={24}
            />
          </Button>
        )}
      </div>
    );
  };
  let TrainerColumnData = [...columnData];

  if (location?.isEdit === false) {
    TrainerColumnData = TrainerColumnData.filter(
      (item) => item.name !== 'actionRender'
    );
  }
  const onMarkAsAbsent = async () => {
    const apiData = {
      course_participate_id: absentData.course_participate_id,
      course_slug: absentData.course_slug,
      lesson_session_id: absentData.lesson_session_id,
      mark_as_absent: absentData.mark_as_absent,
      set_early_arrival: null,
      set_early_leave: null,
    };
    const { error } = await addMainAttendance(
      '/trainer/courses/attendance-sheet/assign',
      apiData
    );
    if (!error) absentModal.closeModal();
    setAbsentData({});

    refetch();
  };

  const onSetLateArrival = async (time: string) => {
    const apiData = {
      set_early_arrival: `${absentData.session_date} ${time}`,
      course_participate_id: absentData.course_participate_id,
      course_slug: absentData.course_slug,
      lesson_session_id: absentData.lesson_session_id,
      mark_as_absent: false,
    };

    const { error } = await addMainAttendance(
      '/trainer/courses/attendance-sheet/assign',
      apiData
    );
    if (!error) setAbsentData({});

    refetch();
  };
  const onSetEarlyLeave = async (time: string) => {
    const apiData = {
      set_early_leave: `${absentData.session_date} ${time}`,
      course_participate_id: absentData.course_participate_id,
      course_slug: absentData.course_slug,
      lesson_session_id: absentData.lesson_session_id,
      mark_as_absent: false,
    };

    const { error } = await addMainAttendance(
      '/trainer/courses/attendance-sheet/assign',
      apiData
    );
    if (!error) setAbsentData({});

    refetch();
  };
  return (
    <div
      className={`${
        user?.role_name === ROLES.CompanyManager ? 'pt-5 container' : ''
      } w-full`}
    >
      <PageHeader
        small
        text={`${t('InPersonAttendee.title')} (${
          params?.mode && capitalizeFirstCharacter(params.mode)
        })`}
        url={
          !_.isEmpty(location) && location?.url
            ? `${location?.url}`
            : `/courses/attendance/${location?.slug}`
        }
        passState={{ ...location }}
      >
        <div>
          <SearchComponent
            onSearch={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e?.target?.value);
            }}
            value={search}
            placeholder={t('Table.tableSearchPlaceholder')}
            onClear={() => {
              setSearch('');
            }}
          />
        </div>
      </PageHeader>
      <div className="relative overflow-x-auto sm:rounded-lg">
        <Table
          headerData={TrainerColumnData}
          bodyData={response?.data?.participates?.data}
          loader={isLoading}
          pagination
          dataPerPage={limit}
          setLimit={setLimit}
          totalPage={response?.data?.participates?.lastPage}
          dataCount={response?.data?.participates?.count}
          setSort={setSort}
          sort={sort}
        />
      </div>
      {lateArrivalModal.isOpen && (
        <CustomTimePicker
          modal={lateArrivalModal}
          onSubmit={onSetLateArrival}
          title={t('Tooltip.lateArrival')}
        />
      )}
      {earlyLeaveModal.isOpen && (
        <CustomTimePicker
          modal={earlyLeaveModal}
          onSubmit={onSetEarlyLeave}
          title={t('Tooltip.earlyLeave')}
        />
      )}
      {absentModal.isOpen && (
        <ConfirmationPopup
          modal={absentModal}
          bodyText={t('absentModal.bodyText')}
          variants="primary"
          confirmButtonText={t('absentModal.confirm')}
          deleteTitle={t('Button.deleteTitle')}
          confirmButtonFunction={onMarkAsAbsent}
          confirmButtonVariant="primary"
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            absentModal.closeModal();
          }}
        />
      )}
      {breakTimeModal.isOpen && (
        <BreakTimeModal
          breakTimeModal={breakTimeModal}
          data={selectedData as unknown as LessonSessionTimeSheet}
          participateSlug={participateSlug}
          lesson_session_id={location?.lessonSessionId}
          refetch={refetch}
        />
      )}
      {breakLogModal.isOpen && !_.isEmpty(breakLog) ? (
        <BreakLogModal
          breakLogModal={breakLogModal}
          courseAttendanceLog={breakLog}
        />
      ) : (
        <NoDataModal breakLogModal={breakLogModal} />
      )}
    </div>
  );
};

export default InPersonAttendee;
