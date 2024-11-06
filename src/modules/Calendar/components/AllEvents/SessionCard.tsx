// **components**
import Button from 'components/Button/Button';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';

// **libraries**
import { format } from 'date-fns';

// **styles**
import 'modules/Calendar/style/calendar.css';

// ** Utils
import {
  getAndReplaceConferenceProvideName,
  getConferenceProvideIcon,
} from 'modules/Courses/helper/CourseCommon';

// **types**
import { SessionCardProps } from 'modules/Calendar/types';
import { LessonModeEnum } from 'modules/Courses/pages/Attendance/types';

// **hooks**
import { useTranslation } from 'react-i18next';

export const SessionCard = ({ eventDetails }: SessionCardProps) => {
  const { t } = useTranslation();

  const getLabelVariant = (mode: string) => {
    switch (mode) {
      case LessonModeEnum.VideoConference:
        return 'neon';
      case LessonModeEnum.InPerson:
        return 'secondary';
      case LessonModeEnum.Hybrid:
        return 'gray';

      default:
        return 'neon';
    }
  };

  const renderConferenceSection = (
    type: string | undefined,
    mode: string | undefined
  ) => {
    return (
      <div className="flex flex-col gap-2.5 mt-2">
        <StatusLabel
          text={mode}
          className="font-bold"
          variants={getLabelVariant(mode as LessonModeEnum)}
        />
        {mode && mode !== LessonModeEnum.InPerson && (
          <Button className="view-course-mode cursor-pointer !rounded-[6px]">
            <Image
              iconName={getConferenceProvideIcon(type as string)}
              iconClassName="w-18px h-18px mr-1"
            />
            {getAndReplaceConferenceProvideName(type as LessonModeEnum)}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="grid gap-3">
      {eventDetails?.lessons[0]?.lesson_sessions?.map((session, index: number) => {
        const link = session?.provider_meeting_link
          ? session.provider_meeting_link
          : null;
        return (
          <div
            key={`session_${index + 1}`}
            className="bg-primaryLight p-5 rounded-lg"
          >
            <p className="text-lg font-semibold leading-[1.5]">
              <Button className="w-5 inline-block">{index + 1}.</Button>
              {t('Calendar.eventDetails.sessionTitle')}
            </p>
            <div className="ps-5">
              <div className="flex flex-wrap gap-7 ">
                {renderConferenceSection(
                  session?.session_conference_provider,
                  session?.mode
                )}
              </div>
              <Button className="block text-xs text-navText mt-1">
                {session?.start_time &&
                  format(new Date(session?.start_time), 'hh:mm a')}
                &nbsp; - &nbsp;
                {session?.end_time && format(new Date(session?.end_time), 'hh:mm a')}
              </Button>
              {link && (
                <div className="mt-6">
                  <Button className="block text-xs text-navText mb-2">
                    {t('Calendar.eventDetails.linkTitle')}
                  </Button>

                  <div className="session-card-link">
                    <Image
                      iconName="linkIcon"
                      iconClassName="w-4 h-4 text-primary/50"
                    />
                    <Button
                      className="flex-[1_0_0%] inline-block truncate text-sm text-primary/50 text-center"
                      onClickHandler={() => {
                        window.open(link, '_blank');
                      }}
                    >
                      {link}
                    </Button>
                    <Button
                      className=""
                      onClickHandler={() => {
                        if (session?.provider_meeting_link) {
                          navigator.clipboard.writeText(
                            session?.provider_meeting_link
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
            </div>
          </div>
        );
      })}
    </div>
  );
};
