// ** Components **
import Button from 'components/Button/Button';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import { ReactCalendar } from 'components/ReactCalendar';
import EventShow from './components/EventShow';
import FilterShow from './components/FilterShow';
import { CreateEvent } from './components/InternalEvents/CreateEvent';

// ** types **
import {
  EventProps,
  TrainerEvent,
  TrainerEventResponse,
} from 'components/ReactCalendar/types';
import { CalendarEventDetails, Meeting } from './types';

// ** hooks **
import { useAxiosDelete, useAxiosGet } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useRef, useState } from 'react';

// ** constants and utils **
import { ROLES } from 'constants/roleAndPermission.constant';
import { useTranslation } from 'react-i18next';
import { customRandomNumberGenerator } from 'utils';
import { useCalendarGetApi } from './services';

// ** libraries **
import {
  addDays,
  endOfMonth,
  format,
  lastDayOfMonth,
  parseISO,
  startOfMonth,
  subDays,
} from 'date-fns';

// ** style **
import 'modules/Calendar/style/calendar.css';

// ** redux **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { useFilterOptions } from 'redux-toolkit/slices/filtereventSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';

const Calendar = () => {
  // ** hooks **
  const [callInternalEvent] = useAxiosGet();
  const [clientDeleteApi] = useAxiosDelete();
  const navigate = useNavigate();
  const EventModal = useModal();
  const EventCreateModal = useModal();
  const FilterModal = useModal();
  const deleteModal = useModal();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { calendarGetApi, isLoading } = useCalendarGetApi();
  const filterOptions = useSelector(useFilterOptions);
  const user = useSelector(getCurrentUser);
  const ActiveCompany = useSelector(useCompany);

  // ** Refs **
  const firstRender = useRef(false);

  // ** states **
  const [currentView, setCurrentView] = useState('month');
  const [isEventEdit, setIsEventEdit] = useState(false);
  const [currentMonthView, setCurrentMonthView] = useState(
    format(new Date(), 'yyyy-MM')
  );
  const [internalEventsResponse, setInternalEventsResponse] = useState<Meeting[]>(
    []
  );
  const [eventSlug, setEventSlug] = useState<EventProps>();
  const [events, setEvents] = useState([] as EventProps[]);
  const [trainerEvents, setTrainerEvents] = useState<TrainerEvent[]>();
  const currentDate = new Date();
  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthEnd = endOfMonth(currentDate);
  const visibleRangeStart = subDays(currentMonthStart, 6);
  const visibleRangeEnd = addDays(currentMonthEnd, 6);
  const [filterValue, setFilterValue] = useState<{
    start_date?: string | Date;
    end_date?: string | Date;
  }>({
    start_date: format(visibleRangeStart, 'yyyy-MM-dd'),
    end_date: format(visibleRangeEnd, 'yyyy-MM-dd'),
  });
  const [eventDetails, setEventDetails] = useState<
    CalendarEventDetails | undefined
  >();
  const courseIds = filterOptions.course.map((item) => item.id);
  const trainerIds = filterOptions.trainer.map((item) => item.id);
  const roomIds = filterOptions.room.map((item) => item.id);
  const resourceIds = filterOptions.resource.map((item) => item.id);
  const trainingSpecialistIds = filterOptions.trainingspecialist.map(
    (item) => item.id
  );
  const formattedYearDate =
    filterValue?.end_date &&
    format(lastDayOfMonth(parseISO(filterValue?.end_date as string)), 'yyyy-MM-dd');

  // const formattedYearDate =
  //   filterValue?.end_date &&
  //   format(lastDayOfMonth(parseISO(filterValue?.end_date as string)), dateFormat);

  const { response: calendarEventsResponse, isLoading: eventsLoading } =
    useQueryGetFunction('/calendarEvents', {
      option: {
        view: true,
        ...(courseIds.length > 0 && { course_id: courseIds.join(',') }),
        ...(trainerIds.length > 0 && { trainer_id: trainerIds.join(',') }),
        ...(trainingSpecialistIds.length > 0 && {
          trainingSpecialistIdFilters: trainingSpecialistIds.join(','),
        }),
        ...(roomIds.length > 0 && {
          room_id: roomIds.join(','),
        }),
        ...(resourceIds.length > 0 && {
          resource_id: resourceIds.join(','),
        }),
        ...(filterValue?.start_date && { start_date: filterValue?.start_date }),
        ...(filterValue?.end_date && {
          end_date:
            currentView === 'year' ? formattedYearDate : filterValue?.end_date,
        }),
        ...(ActiveCompany?.company?.id && {
          company_id: ActiveCompany?.company?.id,
        }),
      },
    });
  const [getTrainerSocialEvents, { isLoading: trainerLoader }] = useAxiosGet();
  const [initialValues, setInitialValues] = useState<{ trainer_id: string[] }>({
    trainer_id: [],
  });
  const [trainerColors, setTrainerColors] = useState<{ [key: string]: string }>({});
  const roles = [ROLES.Admin];
  const getTrainerEvents = async () => {
    if (currentView === 'month') {
      const response = await getTrainerSocialEvents(
        '/internal-events/social-account-event',
        {
          params: {
            trainerId: initialValues?.trainer_id?.toString(),
            ...(filterValue?.start_date && {
              start_date: filterValue?.start_date,
            }),
            ...(filterValue?.end_date && {
              end_date: filterValue?.end_date,
            }),
          },
        }
      );
      if (response?.error) {
        dispatch(
          setToast({
            variant: 'Error',
            message: `An unexpected error occurred. Please try again later.`,
            type: 'error',
            id: customRandomNumberGenerator(),
          })
        );
      } else {
        setTrainerEvents(() =>
          Object.values(response?.data as TrainerEventResponse).flat()
        );
      }
    } else {
      setTrainerEvents([]);
    }
  };

  const onDelete = async () => {
    if (eventDetails) {
      const slug = eventDetails?.slug;
      const response = await clientDeleteApi(`/internal-events/${slug}`);
      if (response.data) {
        EventModal.closeModal();
        deleteModal.closeModal();
        getInternalEvent();
      }
    }
  };

  useEffect(() => {
    if (user?.role_name === ROLES.CompanyManager && firstRender.current) {
      firstRender.current = false;
      navigate(PRIVATE_NAVIGATION.dashboard.view.path);
    }
    firstRender.current = true;
  }, [ActiveCompany]);

  useEffect(() => {
    if (initialValues.trainer_id) {
      getTrainerEvents();
    }
  }, [initialValues, currentView, filterValue?.start_date, filterValue?.end_date]);

  useEffect(() => {
    if (user?.role_name) {
      if (roles?.some((role) => role === user?.role_name)) {
        getInternalEvent();
      }
    }
  }, [user?.role_name]);

  const getInternalEvent = async () => {
    const res = await callInternalEvent('/internal-events', {
      params: { view: true },
    });
    if (res?.data) {
      setInternalEventsResponse(res?.data?.data);
    }
  };
  const conditionForFilterEvents =
    courseIds?.length > 0 ||
    trainerIds.length > 0 ||
    trainingSpecialistIds.length > 0 ||
    roomIds.length ||
    resourceIds.length > 0;
  useEffect(() => {
    let colorIndex = 0;
    if (
      calendarEventsResponse?.data?.data ||
      internalEventsResponse ||
      trainerEvents
    ) {
      const AllEvents = [
        ...(calendarEventsResponse?.data?.data || []),
        ...(conditionForFilterEvents ? [] : internalEventsResponse || []),
        ...(trainerEvents || []),
      ];
      const eventData = AllEvents.filter(
        (data) => !(courseIds.length > 0 && !data?.course)
      ).map((data) => {
        colorIndex = colorIndex > 10 ? 1 : colorIndex + 1;
        return {
          start:
            data?.start_time || data?.start_date
              ? parseISO(data?.start_time || data?.start_date)
              : null,
          end:
            data?.end_time || data?.end_date
              ? parseISO(data?.end_time || data?.end_date)
              : null,
          title: data?.lesson?.title || data?.topic || data?.title,
          color: colorIndex,
          ...data,
        };
      });
      setEvents(eventData);
    }
  }, [calendarEventsResponse?.data?.data, internalEventsResponse, trainerEvents]);

  useEffect(() => {
    const callApi = async () => {
      if (eventSlug?.course?.slug && eventSlug?.lesson?.id) {
        const response = await calendarGetApi(
          `/calendarEvents/${eventSlug?.course?.slug}`,
          {
            params: {
              lesson_id: eventSlug?.lesson?.id,
            },
          }
        );
        setEventDetails(response?.data);
      }
      if (eventSlug?.slug) {
        const response = await calendarGetApi(`/internal-events/${eventSlug?.slug}`);
        setEventDetails(response?.data);
      }
    };
    callApi();
  }, [eventSlug]);

  const trainerEventDetail: CalendarEventDetails = {
    title: eventSlug?.title ?? '',
    topic: eventSlug?.topic ?? '',
    agenda: eventSlug?.agenda ?? '',
    type: '',
    image: '',
    calendar_provider: {},
    course_notes: [],
    lessons: [],
    ...(eventSlug?.trainerUser
      ? {
          trainerUser: {
            first_name: eventSlug.trainerUser.first_name ?? '',
            last_name: eventSlug.trainerUser.last_name ?? '',
            id: eventSlug.trainerUser.id,
          },
        }
      : {}),

    hangoutLink: eventSlug?.hangoutLink ?? '',
    description: eventSlug?.description ?? '',
    start_date: eventSlug?.start_date,
    end_date: eventSlug?.end_date,
  };

  return (
    <div
      className={`${
        user?.role_name === ROLES.CompanyManager ||
        user?.role_name === ROLES.PrivateIndividual
          ? 'max-w-[calc(100%_-_100px)] mx-auto'
          : ''
      }`}
    >
      <PageHeader small text={t('Calendar.calendarTitle')}>
        {user?.role_name === ROLES.Admin ? (
          <div>
            <Button
              className="bg-primary text-white p-2 rounded-lg cursor-pointer"
              onClickHandler={() => {
                setIsEventEdit(false);
                EventCreateModal.openModal();
              }}
            >
              {t('Calendar.createEventTitle')}
            </Button>
          </div>
        ) : undefined}
      </PageHeader>
      <div className="p-7 bg-white rounded-xl overflow-auto">
        <ReactCalendar
          setInitialValues={setInitialValues}
          initialValues={initialValues}
          events={events}
          modal={EventModal}
          setEventSlug={setEventSlug}
          filterModal={FilterModal}
          setCurrentCalendarView={setCurrentView}
          setFilterValue={setFilterValue}
          setCurrentMonthView={setCurrentMonthView}
          loading={trainerLoader}
          eventsLoading={eventsLoading}
          setTrainerColors={setTrainerColors}
          trainerColors={trainerColors}
          EventCreateModal={EventCreateModal}
        />
      </div>

      {EventModal.isOpen && (
        <EventShow
          eventDetails={
            eventSlug?.slug || eventSlug?.course?.slug
              ? eventDetails
              : trainerEventDetail
          }
          isOtherCalendar={!(eventSlug?.slug || eventSlug?.course?.slug)}
          modal={EventModal}
          EventCreateModal={EventCreateModal}
          setIsEventEdit={setIsEventEdit}
          deleteModal={deleteModal}
          isLoading={isLoading || trainerLoader}
        />
      )}
      {EventCreateModal.isOpen && (
        <CreateEvent
          eventDetail={
            isEventEdit
              ? (EventCreateModal?.modalData as CalendarEventDetails)
              : undefined
          }
          isEventEdit={isEventEdit}
          modal={EventCreateModal}
          internalEventsFetch={getInternalEvent}
        />
      )}
      {FilterModal.isOpen && (
        <FilterShow
          modal={FilterModal}
          currentView={currentView}
          filterValue={filterValue}
          currentMonthView={currentMonthView}
        />
      )}

      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('Calendar.createEventTitle.deleteText', {
            EventTitle: eventDetails?.topic,
          })}
          variants="primary"
          deleteTitle={t('Button.deleteTitle')}
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonFunction={onDelete}
          confirmButtonVariant="primary"
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            deleteModal.closeModal();
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
