import 'react-big-calendar/lib/css/react-big-calendar.css';

import { format, getDay, parse, startOfWeek } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, ToolbarProps, dateFnsLocalizer } from 'react-big-calendar';
import { useSelector } from 'react-redux';
import { CalendarProps, CustomToolbarProps, EventProps, PopupStyles } from './types';

import Image from 'components/Image';
import CustomYearView from 'components/ReactCalendar/components/Year';
import 'components/ReactCalendar/style/calendar.css';
import enUS from 'date-fns/locale/en-US';
import it from 'date-fns/locale/it';
import { Root, createRoot } from 'react-dom/client';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { calculateDimensions } from './components/CalculateDimension';
import { calculatePosition } from './components/CalculatePosition';
import { CustomModal } from './components/CustomModal';
import { CustomToolbar } from './components/CustomToolbar';
import { Event } from './components/Event';
import { EventData } from './components/ShowMoreModel';
import { generateUniqueKey } from './constants';

const locales = {
  'en-US': enUS,
  it,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
export const ReactCalendar = ({
  events,
  modal,
  setEventSlug,
  filterModal,
  setFilterValue,
  setCurrentCalendarView,
  setCurrentMonthView,
  setInitialValues,
  initialValues,
  loading,
  trainerColors,
  setTrainerColors,
  EventCreateModal,
  eventsLoading,
}: CalendarProps) => {
  const url: URL = new URL(window.location.href);
  const queryDateString = url.searchParams.get('date');
  const queryDate = queryDateString ? new Date(queryDateString) : new Date();
  const storeLang = useSelector(useLanguage);
  const [currentDate, setCurrentDate] = useState(queryDate);
  const user = useSelector(getCurrentUser);
  const [currentView, setCurrentView] = useState('month');
  const [showPopOversOpen, setShowPopOversOpen] = useState<boolean>(false);
  const [showPopOversData, setShowPopOversData] = useState<EventProps[]>([]);
  const [otherModalShow, setOtherModalShow] = useState(false);
  const [pointerEventsNone, setPointerEventsNone] = useState(false);

  const [showPopOvers, setShowPopOvers] = useState<boolean>(true);

  const parentModalRef = useRef<HTMLDivElement | null>(null);

  const [root, setRoot] = useState<Root | undefined>();
  const [additionalClassNames, setAdditionalClassNames] = useState('');
  const customToolbarCallback = useCallback(
    (props: ToolbarProps<EventProps, object>) => {
      return (
        <CustomToolbar
          setTrainerColors={setTrainerColors}
          setInitialValues={setInitialValues}
          initialValues={initialValues}
          {...(props as CustomToolbarProps)}
          filterModal={filterModal}
          setOtherModalShow={setOtherModalShow}
        />
      );
    },
    [initialValues]
  );
  const isWindowWidth = window.innerWidth > 1200;

  useEffect(() => {
    if (
      modal.isOpen ||
      EventCreateModal.isOpen ||
      filterModal.isOpen ||
      otherModalShow
    ) {
      setAdditionalClassNames(
        '[&_.rbc-month-view]:pointer-events-none [&_.rbc-time-view]:pointer-events-none'
      );
    } else {
      const timeoutId = setTimeout(() => {
        setAdditionalClassNames('');
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [modal.isOpen, EventCreateModal.isOpen, filterModal.isOpen, otherModalShow]);

  let className = '';
  if (currentView === 'month') {
    className = 'month-view';
  }
  if (currentView === 'year') {
    className = 'year-view';
  }
  if (currentView === 'week') {
    className = 'week-view';
  }
  if (currentView === 'day') {
    className = 'day-view';
  }

  const TimeGutterHeader = () => (
    <p className="text-base leading-6 text-dark font-medium">
      {format(currentDate, 'EEEE (dd MMM)')}
    </p>
  );

  const handleNavigate = (date: Date) => {
    setCurrentMonthView?.(format(date, 'yyyy-MM'));
    setCurrentDate(date);
  };
  useEffect(() => {
    if (isWindowWidth) {
      const rootElement = document.getElementsByTagName('body')[0];
      if (!rootElement) return;
      rootElement.style.position = 'relative';
      const dynamicDiv = document.createElement('div');
      dynamicDiv.id = 'dynamic-div';
      rootElement.appendChild(dynamicDiv);
      if (parentModalRef) {
        parentModalRef.current = dynamicDiv;
        setRoot(createRoot(parentModalRef.current));
      }
    }
  }, []);

  const showPopUpData = (event: EventProps[]) => {
    setShowPopOversData(event);
    setShowPopOversOpen(true);
  };
  const handleModalOpen = async (
    information: EventProps,
    eventId: string,
    taskID: string
  ) => {
    if (showPopOvers && parentModalRef?.current) {
      let parentInstance = null;
      if (!root) {
        parentInstance = createRoot(parentModalRef.current);
        setRoot(parentInstance);
      } else {
        parentInstance = root;
      }
      const taskInformation = information;
      const targetElement: HTMLElement | null = document.getElementById(taskID);

      root?.render(
        <div
          key={generateUniqueKey()}
          id={`${eventId}`}
          className={`${eventId}`}
          style={{
            visibility: 'hidden',
            opacity: '0',
            zIndex: '1000000',
            position: 'absolute',
            pointerEvents: 'none',
            transition: '.2s ease',
          }}
        >
          <CustomModal
            taskInfo={taskInformation}
            className=""
            position={{ position: 'relative' }}
            user={user}
          />
        </div>
      );

      const Dimensions: { width: number; height: number } =
        (await calculateDimensions({
          divRef: eventId,
          duration: 200,
        })) as { width: number; height: number };
      const clickedEventPositions = targetElement?.getBoundingClientRect();
      const calendarPopupStyles: PopupStyles = calculatePosition({
        modalWidth: Dimensions.width,
        modalHeight: Dimensions.height,
        clickedEventPositions,
      });
      calendarPopupStyles.visibility = 'visible';
      calendarPopupStyles.opacity = '1';
      calendarPopupStyles.pointerEvents = 'none';
      const modalContainer = document.getElementById(eventId);
      if (modalContainer) {
        Object.keys(calendarPopupStyles).forEach((e) => {
          const styleKey = e as keyof typeof calendarPopupStyles;
          const styleValue = calendarPopupStyles[styleKey] ?? '';
          modalContainer.style[styleKey] = styleValue;
        });
      }
    }
  };

  const handleModalClose = (eventId: string) => {
    setTimeout(() => {
      const obj = document.getElementById(eventId);
      if (obj) {
        obj.style.opacity = '0';
      }
    }, 200);
  };

  useEffect(() => {
    const divElement = document.querySelector('.main__cn__wrapper');
    const handleScroll = () => {
      const overlay: Element | null | undefined =
        currentView === 'month'
          ? Array.from(document.body.getElementsByClassName('rbc-overlay')).find(
              (el) => el.classList.length === 1
            )
          : document.getElementById('dynamic-models');

      if (overlay) {
        (overlay as HTMLElement).style.visibility = 'hidden';
        (overlay as HTMLElement).style.opacity = '0';
      }
    };

    divElement?.addEventListener('scroll', handleScroll);

    return () => {
      divElement?.removeEventListener('scroll', handleScroll);
    };
  }, [currentView]);
  const additionalProps = {
    handleModalOpen,
    handleModalClose,
    setShowPopOvers,
    currentView,
  };

  const rangeGetter = (start: Date, culture: string | undefined) => {
    const formattedDate = format(start, 'MMMM yyyy', {
      locale: locales[culture as keyof typeof locales],
    });
    return formattedDate;
  };

  const debounceParam = handleModalOpen;

  useEffect(() => {
    if (loading || eventsLoading) {
      setPointerEventsNone(true);
    } else {
      setPointerEventsNone(false);
    }
  }, [loading, eventsLoading]);

  if (loading || eventsLoading) {
    return (
      <div>
        <Image loaderType="SiteLoader" />
      </div>
    );
  }
  return (
    <div
      className={`calendars ${className ?? ''} ${
        isWindowWidth
          ? `${additionalClassNames} ${
              pointerEventsNone ? 'pointer-events-none' : ''
            }`
          : ''
      }`}
    >
      <div
        onClick={() => {
          if (showPopOversOpen) {
            setShowPopOversOpen(false);
          }
        }}
      >
        <Calendar
          events={events}
          localizer={localizer}
          culture={storeLang.language}
          defaultDate={currentDate}
          onNavigate={handleNavigate}
          onView={(e) => {
            setCurrentView(e);
            setCurrentCalendarView?.(e);
          }}
          onRangeChange={(range) => {
            if (Array.isArray(range)) {
              setFilterValue?.({
                start_date: format(range[0], 'yyyy-MM-dd'),
                end_date: format(range[range.length - 1], 'yyyy-MM-dd'),
              });
            } else {
              setFilterValue?.({
                start_date: format(range?.start, 'yyyy-MM-dd'),
                end_date: format(range?.end, 'yyyy-MM-dd'),
              });
            }
          }}
          defaultView={currentView as any}
          components={{
            toolbar: customToolbarCallback,
            timeGutterHeader: TimeGutterHeader,
            event: (eventProps) => {
              const key = `my-event-${new Date(
                eventProps.event.start
              ).getTime()}-${new Date(
                eventProps.event.end
              ).getTime()}-${Math.random()}`;
              return (
                <Event
                  key={key}
                  customID={`${key}_event_id`}
                  {...eventProps}
                  view={currentView}
                  handleMouseEnter={() => {
                    if (isWindowWidth) {
                      debounceParam(eventProps.event, key, `${key}_event_id`);
                    }
                  }}
                  onClick={() => {
                    const obj: any = document.getElementById(key);
                    if (obj) {
                      obj.style.opacity = 0;
                      handleModalClose(key);
                    }
                  }}
                  handleMouseLeave={() => {
                    if (isWindowWidth) {
                      handleModalClose(key);
                    }
                  }}
                  trainerColors={trainerColors}
                />
              );
            },
          }}
          views={
            {
              day: true,
              week: true,
              month: true,
              year: CustomYearView,
            } as object
          }
          formats={{
            dayFormat: 'EEE (dd MMM)',
            weekdayFormat: 'EEE',
            dayRangeHeaderFormat: ({ start }, culture) => {
              return rangeGetter(start, culture);
            },
            dayHeaderFormat: (date, culture) => {
              return format(date, 'MMMM yyyy', {
                locale: locales[culture as keyof typeof locales],
              });
            },
            monthHeaderFormat: (date, culture) => {
              return format(date, 'MMMM yyyy', {
                locale: locales[culture as keyof typeof locales],
              });
            },
            eventTimeRangeFormat: () => {
              return '';
            },
          }}
          style={{ height: 1000 }}
          {...additionalProps}
          onSelectEvent={(event) => {
            modal.openModal();
            setEventSlug(event);
          }}
          onShowMore={(event) => {
            showPopUpData(event);
          }}
          doShowMoreDrillDown={false}
        />
      </div>
      {showPopOversOpen && (
        <EventData
          event={showPopOversData}
          setShowPopOversOpen={setShowPopOversOpen}
          setEventSlug={setEventSlug}
          modal={modal}
          handleMouseEnter={(event: EventProps, key: string) => {
            debounceParam(event, key, `${key}_event_id`);
          }}
          onClick={(key: string) => {
            handleModalClose(key);
          }}
          handleMouseLeave={(key: string) => {
            handleModalClose(key);
          }}
          currentView={currentView}
        />
      )}
    </div>
  );
};
