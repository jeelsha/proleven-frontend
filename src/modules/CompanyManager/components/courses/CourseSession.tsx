// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';

// ** imports **
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

// ** constants **

// ** helpers**
import {
  formatMeetingLink,
  getAndReplaceConferenceProvideName,
  getConferenceProvideIcon,
  getCourseModeLabel,
} from 'modules/Courses/helper/CourseCommon';

// **types **
import { REACT_APP_DATE_FORMAT } from 'config';
import { CourseSessionProps } from 'modules/CompanyManager/types';
import { LessonModeEnum } from 'modules/Courses/pages/Attendance/types';

const CourseSession = ({
  sessionData,
  isCompanyEnrolled = false,
}: CourseSessionProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-primaryLight">
      <table className="table-fixed w-full">
        <thead>
          <tr>
            <th className="text-left p-1">
              <Button className="text-base font-semibold text-dark inline-block">
                {t('CompanyManager.courseDetails.sessions')}
              </Button>
            </th>
            <th className="text-left p-1">
              <Button className="text-base font-semibold text-dark inline-block">
                {t('CompanyManager.courseDetails.mode')}
              </Button>
            </th>
            <th className="text-left p-1">
              <Button className="text-base font-semibold text-dark inline-block">
                {t('CompanyManager.courseDetails.dateTime')}
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sessionData.map((session, index: number) => {
            const { session_conference_provider, mode } = session;
            return (
              <tr className="group" key={`session_${index + 1}`}>
                <td className="text-left p-2 border-b border-solid border-gray-200 align-top">
                  <p className="flex flex-col gap-2">
                    <Button className="text-sm font-normal text-dark inline-block">
                      {t('CompanyManager.courseDetails.session')} {index + 1}
                    </Button>
                  </p>
                </td>
                <td className="text-left p-2 border-b border-solid border-gray-200 align-top">
                  <div className="flex flex-col gap-y-1">
                    <Button className="text-sm font-normal text-dark inline-block">
                      {mode ? getCourseModeLabel(mode, t) : ''}
                    </Button>
                    {mode && mode !== LessonModeEnum.InPerson && (
                      <Button className="view-course-mode cursor-pointer !rounded-[6px]">
                        <Image
                          iconName={getConferenceProvideIcon(
                            session_conference_provider as string
                          )}
                          iconClassName="w-18px h-18px mr-1"
                        />
                        {getAndReplaceConferenceProvideName(
                          session_conference_provider as LessonModeEnum
                        )}
                      </Button>
                    )}
                  </div>

                  {isCompanyEnrolled && session?.provider_meeting_link ? (
                    <div className="mt-2">
                      <span className="border border-s-borderColor border-navText/30 px-2 py-1 flex gap-2.5 rounded items-center w-[60%] justify-between">
                        <Button
                          className="inline-block overflow-hidden whitespace-nowrap text-sm text-primary text-center truncate"
                          onClickHandler={() => {
                            if (session?.provider_meeting_link)
                              formatMeetingLink(session?.provider_meeting_link);
                          }}
                        >
                          {session?.provider_meeting_link}
                        </Button>

                        <Button
                          className=""
                          onClickHandler={() => {
                            if (session?.provider_meeting_link)
                              navigator?.clipboard?.writeText(
                                session?.provider_meeting_link
                              );
                          }}
                        >
                          <Image
                            iconName="copyIcon"
                            iconClassName="w-4 h-4 text-primary cursor-pointer"
                          />
                        </Button>
                      </span>
                    </div>
                  ) : (
                    ''
                  )}
                </td>
                <td className="text-left p-2 border-b border-solid border-gray-200 align-top">
                  <p className="flex gap-1">
                    <Image
                      iconName="calendarCheckIcon"
                      iconClassName="w-4 h-4 text-grayText"
                    />
                    <Button className="text-sm font-normal text-dark inline-block">
                      {session.start_time &&
                        format(
                          new Date(session.start_time),
                          REACT_APP_DATE_FORMAT as string
                        )}
                      &nbsp;-&nbsp;
                      {session.end_time &&
                        format(new Date(session.start_time), 'hh:mm a')}
                      &nbsp;-&nbsp;
                      {session.end_time &&
                        format(new Date(session.end_time), 'hh:mm a')}
                    </Button>
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CourseSession;
