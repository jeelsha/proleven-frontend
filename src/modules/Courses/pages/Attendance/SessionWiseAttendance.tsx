import Image from 'components/Image';
import BreakTimeModal from 'components/LessonCard/BreakTimeModal';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import Pagination from 'components/Pagination/Pagination';
import SearchComponent from 'components/Table/search';
import { CustomTimePicker } from 'components/TimePicker';
import { ROLES } from 'constants/roleAndPermission.constant';
import { parseISO, setHours, setMinutes } from 'date-fns';
import { useAxiosPut } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import AttendanceCard from 'modules/Courses/components/AttendanceCard';
import { getCourseModeLabel } from 'modules/Courses/helper/CourseCommon';
import { LessonSessionTimeSheet } from 'modules/Courses/types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';
import { convertDateToUTCISOString } from 'utils/date';
import { CourseParticipant } from './types';
import { ApiResponse } from './types/sessionTypes';

const SessionWiseAttendance = () => {
  const initialValues = {
    course_slug: '',
    course_participate_id: '',
    mark_as_absent: false,
    lesson_session_id: '',
    set_early_leave: '',
    set_early_arrival: '',
  };
  const { t } = useTranslation();
  const updateTitle = useTitle();
  const user = useSelector(getCurrentUser);
  const [search, setSearch] = useState<string>('');
  const [addMainAttendance] = useAxiosPut();
  const absentModal = useModal();
  const lateArrivalModal = useModal();
  const earlyLeaveModal = useModal();
  const breakTimeModal = useModal();
  const location = useLocation()?.state;
  const ActiveCompany = useSelector(useCompany);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [participateSlug, setParticipateSlug] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const params = useParams();
  const { currentPage } = useSelector(currentPageSelector);
  const [course, setCourse] = useState<{
    end_date: string;
    id: number;
    start_date: string;
  } | null>(null);
  const [participates, setParticipates] = useState<ApiResponse>();
  const [absentData, setAbsentData] = useState<{ [key: string]: unknown }>(
    initialValues
  );
  const debounceSearch = useDebounce(search, 500);
  const { response, refetch, isLoading } = useQueryGetFunction(
    `/trainer/courses/attendance-sheet`,
    {
      option: {
        course_slug: params?.slug,
        lesson_session_id: location?.lessonSessionId,
        ...(user?.role_name === ROLES.CompanyManager
          ? { company_id: ActiveCompany.company?.id }
          : {}),
        limit,
        page: currentPage,
        search: debounceSearch,
      },
    }
  );
  useEffect(() => {
    if (response?.data) {
      setCourse(response?.data?.course);
      setParticipates(response?.data?.participates);
    }
  }, [response?.data]);

  const OnSubmit = async (
    data: CourseParticipant,
    signature: File | null,
    type: 'begin' | 'end'
  ) => {
    const formData = new FormData();

    if (type === 'begin') {
      if (signature) {
        formData.append('start_signature', signature);
        formData.append(
          'mark_as_start_signed_at',
          data?.courseAttendanceSheet[0]?.mark_as_start_signed_at ??
            data?.courseAttendanceSheet[0].lessonSession.start_time
        );
      }
    } else if (type === 'end') {
      if (signature) {
        formData.append('end_signature', signature);
        formData.append(
          'mark_as_end_signed_at',
          data?.courseAttendanceSheet[0]?.mark_as_end_signed_at ??
            data?.courseAttendanceSheet[0].lessonSession.end_time
        );
      }
    }

    formData.append('course_slug', location?.slug);
    formData.append('course_participate_id', data?.id.toString());
    formData.append('lesson_session_id', location?.lessonSessionId);

    const { error } = await addMainAttendance(
      '/trainer/courses/attendance-sheet/assign',
      formData
    );

    if (!error) {
      refetch?.();
    }
  };

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
    const [hour, minute] = time.split(':');
    const dateToSet = parseISO(absentData.session_date as string);
    const timeToSet = setMinutes(setHours(dateToSet, Number(hour)), Number(minute));
    const apiData = {
      set_early_arrival: convertDateToUTCISOString(timeToSet),
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
    const [hour, minute] = time.split(':');
    const dateToSet = parseISO(absentData.session_date as string);

    const timeToSet = setMinutes(setHours(dateToSet, Number(hour)), Number(minute));
    const apiData = {
      set_early_leave: convertDateToUTCISOString(timeToSet),
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

  updateTitle(
    `${t('InPersonAttendee.title')} (${
      params?.mode && getCourseModeLabel(params.mode, t)
    })`
  );
  return (
    <>
      <div
        className={`${
          user?.role_name === ROLES.CompanyManager ? 'pt-5 container' : ''
        } w-full`}
      >
        <PageHeader
          small
          text={`${t('InPersonAttendee.title')} (${params?.mode ?? ''})`}
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
        {isLoading && (
          <div className=" flex justify-center items-center">
            <Image loaderType="Spin" />
          </div>
        )}
        {participates?.data && participates?.data?.length > 0 && !isLoading && (
          <div className="1400:columns-2 gap-7 mb-5">
            {participates?.data?.map((data, index) => {
              return (
                <AttendanceCard
                  data={data}
                  index={index}
                  key={data?.id}
                  OnSubmit={OnSubmit}
                  refetch={refetch}
                  isEdit={user?.role_name !== ROLES.CompanyManager}
                  lessonWiseAttendance
                  setAbsentData={setAbsentData}
                  absentData={absentData}
                  location={location}
                  absentModal={absentModal}
                  lateArrivalModal={lateArrivalModal}
                  earlyLeaveModal={earlyLeaveModal}
                  breakTimeModal={breakTimeModal}
                  course={course}
                  setSelectedData={setSelectedData}
                  setParticipateSlug={setParticipateSlug}
                />
              );
            })}
          </div>
        )}
        {limit && !isLoading && response?.data?.participates?.lastPage ? (
          <Pagination
            setLimit={setLimit}
            currentPage={currentPage ?? 1}
            dataPerPage={limit}
            dataCount={response?.data?.participates?.count}
            totalPages={response?.data?.participates?.lastPage}
          />
        ) : (
          ''
        )}
        {!isLoading && participates?.data?.length === 0 && (
          <NoDataFound message={t('AttendanceSheet.noDataMessage')} />
        )}
      </div>
      {lateArrivalModal.isOpen && (
        <CustomTimePicker
          modal={lateArrivalModal}
          onSubmit={onSetLateArrival}
          title={t('Tooltip.lateArrival')}
          startTime={(absentData?.starTime as string) ?? ''}
          endTime={(absentData?.endTime as string) ?? ''}
          customTime={{
            hour:
              new Date(absentData?.starTime as string).getHours() ??
              new Date().getHours(),
            minute:
              new Date(absentData?.starTime as string).getMinutes() ??
              new Date().getMinutes(),
          }}
        />
      )}
      {earlyLeaveModal.isOpen && (
        <CustomTimePicker
          modal={earlyLeaveModal}
          onSubmit={onSetEarlyLeave}
          title={t('Tooltip.earlyLeave')}
          startTime={(absentData?.starTime as string) ?? ''}
          endTime={(absentData?.endTime as string) ?? ''}
          customTime={{
            hour:
              new Date(absentData?.starTime as string).getHours() ??
              new Date().getHours(),
            minute:
              new Date(absentData?.starTime as string).getMinutes() ??
              new Date().getMinutes(),
          }}
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
    </>
  );
};

export default SessionWiseAttendance;
