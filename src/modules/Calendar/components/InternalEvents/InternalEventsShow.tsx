import Button from 'components/Button/Button';
import { IconTypes } from 'components/Icon/types';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import { format } from 'date-fns';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CalendarEventDetails } from '../../types';
import { REACT_APP_DATE_FORMAT } from 'config';

interface Props {
  eventDetails?: CalendarEventDetails;
}
export const InternalEventsShow = ({ eventDetails }: Props) => {
  const { t } = useTranslation();
  const iconMapping: Record<string, string> = {
    zoom: 'zoomIcon',
    icalendar: 'icalIcon',
    google_calendar: 'googleMeetIcon',
    microsoft_calendar: 'teamsIcon',
  };

  return (
    <div>
      <div className="w-full flex flex-col gap-2  pb-5 mb-4 border-b border-solid border-borderColor">
        <StatusLabel
          text={
            eventDetails?.trainerUser?.id
              ? `${eventDetails?.trainerUser?.first_name} ${eventDetails?.trainerUser?.last_name}`
              : t('Calendar.EventTitle')
          }
          variants={`${eventDetails?.trainerUser?.first_name ? 'primary' : 'completed'
            }`}
        />
        <p className="text-base font-semibold leading-[1.5]">
          {eventDetails?.topic ?? eventDetails?.title}
        </p>
        <div className="flex flex-wrap gap-3 mt-2">
          <div className="flex flex-wrap text-grayText gap-2 text-sm">
            <Image iconClassName="w-5 h-5" iconName="calendarIcon2" />
            <Button className="text-current">
              {eventDetails?.start_date &&
                format(new Date(eventDetails.start_date), (REACT_APP_DATE_FORMAT as string))}
            </Button>
          </div>
          <div className="flex text-grayText gap-1 text-sm">
            <Image iconClassName="w-5 h-5" iconName="clockIcon" />
            <Button className="text-current">
              {eventDetails?.start_date &&
                format(new Date(eventDetails?.start_date), 'hh:mm a')}
              &nbsp; to &nbsp;
              {eventDetails?.end_date &&
                format(new Date(eventDetails?.end_date), 'hh:mm a')}
            </Button>
          </div>
        </div>
      </div>
      {eventDetails?.agenda && (
        <div className="pb-2">
          <p className="text-base text-dark font-medium mb-1">
            {t('Calendar.createEvent.agenda')}
          </p>
          <p className="text-sm text-black/50 font-medium">{eventDetails?.agenda}</p>
        </div>
      )}
      {eventDetails?.description && (
        <div className="pb-2">
          <p className="text-base text-dark font-medium mb-1">
            {t('EmailTemplate.emailTempTableDescription')}
          </p>
          <p className="text-sm text-black/50 font-medium">
            {eventDetails?.description}
          </p>
        </div>
      )}
      {eventDetails?.hangoutLink && (
        <div className="flex flex-col gap-2 mt-5">
          <p className="text-base text-dark font-medium mb-1">{t('HangoutLink')}</p>
          <Link target="_blank" to={eventDetails?.hangoutLink}>
            {eventDetails?.hangoutLink}
          </Link>
        </div>
      )}

      {(!_.isEmpty(eventDetails?.conference_provider) ||
        !_.isEmpty(eventDetails?.calendar_provider)) && (
          <div className="grid grid-cols-[60%_1fr] gap-4 pt-5 mt-3 border-t border-solid border-borderColor">
            {eventDetails?.conference_provider && (
              <div className="max-w-full">
                <p className="text-grayText text-xs mb-1.5">
                  {t('Calendar.createEvent.conferenceTitle')}
                </p>
                <div className="inline-flex items-center gap-1 bg-primaryLight px-3.5 py-1.5 border border-solid border-primary/20 rounded-lg">
                  <Image
                    iconClassName="w-5 h-5"
                    iconName={
                      iconMapping[
                      eventDetails?.conference_provider?.token_provider as IconTypes
                      ] as IconTypes
                    }
                  />
                  <Button className="text-dark text-sm">
                    {eventDetails?.conference_provider?.token_provider_mail}
                  </Button>
                </div>

                <div className="session-card-link !bg-primaryLight !border !border-solid !border-primary/20 mt-2 !px-3.5 !py-1.5">
                  <Image iconName="linkIcon" iconClassName="w-4 h-4 text-primary/50" />
                  <Button
                    className="flex-[1_0_0%] inline-block truncate text-sm text-dark text-center"
                    onClickHandler={() => {
                      window.open(eventDetails?.meeting_start_link, '_blank');
                    }}
                  >
                    {eventDetails?.meeting_start_link}
                  </Button>
                  <Button
                    className=""
                    onClickHandler={() => {
                      if (eventDetails?.meeting_start_link) {
                        navigator.clipboard.writeText(
                          eventDetails?.meeting_start_link
                        );
                      }
                    }}
                    tooltipText={t('copyText')}
                    tooltipPosition="left"
                  >
                    <Image
                      iconName="copyIcon"
                      iconClassName="w-4 h-4 text-primary cursor-pointer"
                    />
                  </Button>
                </div>
              </div>
            )}
            {!_.isEmpty(eventDetails?.calendar_provider) && (
              <div>
                <p className="text-grayText text-xs mb-1.5 ">
                  {t('Calendar.createEvent.calendarTitle')}
                </p>
                <div className="inline-flex items-center gap-1 bg-primaryLight px-3.5 py-1.5 border border-solid border-primary/20 rounded-lg">
                  <Image
                    iconClassName="w-5 h-5"
                    iconName={
                      iconMapping[
                      eventDetails?.calendar_provider?.token_provider as IconTypes
                      ] as IconTypes
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
};
