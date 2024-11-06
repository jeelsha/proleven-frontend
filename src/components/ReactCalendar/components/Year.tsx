import {
  addMonths,
  addYears,
  differenceInMonths,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import { EventProps, PopupStyles, YearProps } from '../types';

import { useModal } from 'hooks/useModal';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-big-calendar';
import { Root, createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { calculateDimensions } from './CalculateDimension';
import { calculatePosition } from './CalculatePosition';
import { CustomModal } from './CustomModal';
import { Event } from './Event';
import { EventData } from './ShowMoreModel';

const CustomYearView = ({
  date,
  localizer,
  events,
  onSelectEvent,
  handleModalOpen,
  handleModalClose,
}: YearProps) => {
  const currRange = useMemo(() => CustomYearView.range(date), [date]);
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);
  const calendarNewRef = useRef<HTMLDivElement>(null);
  const parentModalRef = useRef<HTMLDivElement | null>(null);
  const EventModal = useModal();
  const [showPopOversOpen, setShowPopOversOpen] = useState<boolean>(false);
  const [showPopOversData, setShowPopOversData] = useState<EventProps[]>([]);
  const [root, setRoot] = useState<Root | undefined>();

  useEffect(() => {
    if (window.innerWidth > 1200) {
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

  const handleEventClick = (event: EventProps) => {
    onSelectEvent(event);
  };

  const handleShowMoreClick = async (
    information: EventProps,
    eventId: string,
    taskID: string
  ) => {
    if (parentModalRef?.current) {
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
          key={`key-${Math.random()}`}
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
      const yearStyles: PopupStyles = calculatePosition({
        modalWidth: Dimensions.width,
        modalHeight: Dimensions.height,
        clickedEventPositions,
      });
      yearStyles.visibility = 'visible';
      yearStyles.opacity = '1';
      yearStyles.pointerEvents = 'none';
      const modalContainer = document.getElementById(eventId);
      if (modalContainer) {
        Object.keys(yearStyles).forEach((e) => {
          const styleKey = e as keyof typeof yearStyles;
          const styleValue = yearStyles[styleKey] ?? '';
          modalContainer.style[styleKey] = styleValue;
        });
      }
    }
  };

  const debounceParam = handleShowMoreClick;
  return (
    <div
      className={`grid grid-cols-1 1200:grid-cols-3 year-view-grid ${
        showPopOversOpen ? 'pointer-events-none' : ''
      }`}
      ref={calendarNewRef}
      style={{ position: 'relative' }}
    >
      {currRange.map((monthDate, index) => {
        const monthEvents = events.filter((event: EventProps) => {
          if (event.start && localizer.inRange) {
            return localizer.inRange(
              event.start,
              monthDate,
              localizer.endOf(monthDate, 'month')
            );
          }
          return false;
        });
        const visibleEvents = monthEvents.slice(0, 2);
        const remainingEvents = monthEvents.slice(2);

        const randomString = `${new Date().getTime()}-${Math.random()}-${Math.random()}`;
        const taskID = `task-id-${randomString}_event_id`;
        return (
          <div
            key={`year_${index + 1}`}
            className="border py-1.5 px-2.5 1800:h-auto 1600:h-auto h-auto min-h-[150px]"
            onClick={() => {
              if (showPopOversOpen) {
                setShowPopOversOpen(false);
              }
            }}
          >
            <div className="text-end text-sm text-dark font-medium">
              {t(`Calendar.months.long.${format(monthDate, 'MMMM').toLowerCase()}`)}
            </div>
            <div className="flex flex-col gap-1.5 m-0 pt-2.5 px-1">
              {visibleEvents.map((event: EventProps, eventIndex: number) => {
                const key = `my-event-${event.id}`;
                return (
                  <div
                    key={`event_${eventIndex + 1}`}
                    onClick={() => {
                      handleModalClose(key);
                      handleEventClick(event);
                    }}
                    onMouseEnter={() => {
                      handleModalOpen(event, key, `${key}_event_id`);
                    }}
                    onMouseLeave={() => handleModalClose(key)}
                  >
                    <Event view="year" event={event} customID={`${key}_event_id`} />
                  </div>
                );
              })}
              {remainingEvents.length > 0 && (
                <div
                  className="rbc-show-more cursor-pointer"
                  id={taskID}
                  style={{ width: 'fit-content' }}
                  onClick={() => {
                    setShowPopOversData(monthEvents);
                    setShowPopOversOpen(true);
                  }}
                >
                  {remainingEvents.length}
                  {t('Calendar.yearMoreCount')}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {showPopOversOpen && (
        <EventData
          event={showPopOversData}
          currentView="year"
          setShowPopOversOpen={setShowPopOversOpen}
          modal={EventModal}
          handleMouseEnter={(event: EventProps, key: string) => {
            debounceParam(event, key, `${key}_event_id`);
          }}
          onClick={(key: string, event: EventProps) => {
            handleModalClose(key);
            handleEventClick(event);
          }}
          handleMouseLeave={(key: string) => {
            handleModalClose(key);
          }}
        />
      )}
    </div>
  );
};

CustomYearView.range = (date: Date) => {
  const start = startOfYear(date);
  const end = endOfYear(date);
  const months = Array.from({ length: differenceInMonths(end, start) + 1 }, (_, i) =>
    addMonths(start, i)
  );
  return months;
};

CustomYearView.navigate = (date: Date, action: string, selectedDate?: Date) => {
  let navigateDate;
  switch (action) {
    case Navigate.PREVIOUS:
      return addYears(date, -1);

    case Navigate.NEXT:
      return addYears(date, 1);

    case Navigate.DATE:
      navigateDate = selectedDate ?? startOfMonth(date);
      return navigateDate;

    default:
      return date;
  }
};

CustomYearView.title = (date: Date) => {
  const [start] = CustomYearView.range(date);
  const Year = start?.getFullYear();

  return `${Year}`;
};

export default CustomYearView;
