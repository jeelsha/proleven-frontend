import Button from 'components/Button/Button';
import { IconTypes } from 'components/Icon/types';
import Image from 'components/Image';
import { EventHoverChildrenProps } from 'components/ReactCalendar/types';
import StatusLabel from 'components/StatusLabel';
import { REACT_APP_DATE_FORMAT } from 'config';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

export const InternalEventHover = ({ hoveredEvent }: EventHoverChildrenProps) => {
  const { t } = useTranslation();
  const iconMapping: Record<string, string> = {
    zoom: 'zoomIcon',
    icalendar: 'icalIcon',
    google_calendar: 'googleMeetIcon',
    microsoft_calendar: 'teamsIcon',
  };
  return (
    <div className="">
      <div
        className={`w-full flex flex-col gap-1.5  pb-5   ${hoveredEvent?.conference_provider !== null ||
            hoveredEvent?.calendar_provider !== null
            ? 'border-b border-solid border-borderColor mb-5'
            : ''
          }`}
      >
        <StatusLabel
          text={
            hoveredEvent?.trainerUser?.id
              ? `${hoveredEvent?.trainerUser?.first_name} ${hoveredEvent?.trainerUser?.last_name}`
              : t('Calendar.EventTitle')
          }
          variants="completed"
        />
        <p className="text-base font-semibold leading-[1.5]">
          {hoveredEvent?.topic ?? hoveredEvent?.title}
        </p>
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex text-grayText gap-1 text-sm">
            <Image iconClassName="w-5 h-5" iconName="calendarIcon2" />
            <Button className="text-current">
              {hoveredEvent?.start_date &&
                format(parseISO(hoveredEvent.start_date), (REACT_APP_DATE_FORMAT as string))}
            </Button>
          </div>
          <div className="flex text-grayText gap-1 text-sm">
            <Image iconClassName="w-5 h-5" iconName="clockIcon" />
            <Button className="text-current">
              {hoveredEvent?.start_date &&
                format(parseISO(hoveredEvent?.start_date), 'hh:mm a')}
              &nbsp; to &nbsp;
              {hoveredEvent?.end_date &&
                format(parseISO(hoveredEvent?.end_date), 'hh:mm a')}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {hoveredEvent?.conference_provider && (
          <div>
            <p className="text-grayText text-xs mb-1.5">
              {t('Calendar.createEvent.conferenceTitle')}
            </p>
            <div className="inline-flex items-center gap-1 bg-primaryLight px-3.5 py-1.5 border border-solid border-primary/20 rounded-lg">
              <Image
                iconClassName="w-5 h-5"
                iconName={
                  iconMapping[
                  hoveredEvent?.conference_provider?.token_provider as IconTypes
                  ] as IconTypes
                }
              />
              <Button className="text-dark text-sm">
                {hoveredEvent?.conference_provider?.token_provider_mail}
              </Button>
            </div>
          </div>
        )}
        {hoveredEvent?.calendar_provider && (
          <div>
            <p className="text-grayText text-xs mb-1.5">
              {t('Calendar.createEvent.calendarTitle')}
            </p>
            <div className="inline-flex items-center gap-1 bg-primaryLight px-3.5 py-1.5 border border-solid border-primary/20 rounded-lg">
              <Image
                iconClassName="w-5 h-5"
                iconName={
                  iconMapping[
                  hoveredEvent?.calendar_provider?.token_provider as IconTypes
                  ] as IconTypes
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
