import Button from 'components/Button/Button';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import { REACT_APP_DATE_FORMAT } from 'config';
import { format, parseISO } from 'date-fns';
import _ from 'lodash';
import { Conference } from 'modules/Courses/Constants';
import { formatMeetingLink } from 'modules/Courses/helper/CourseCommon';
import { useTranslation } from 'react-i18next';
import { customRandomNumberGenerator } from 'utils';
import { ICourseDetail, LessonModeEnum } from '../Attendance/types';

type ICardLessonProps = {
  isLoading: boolean;
  course: ICourseDetail | undefined;
};

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
const formatDuration = (duration: string | number) => {
  if (typeof duration === 'string')
    if (duration?.endsWith(' 0m')) {
      return `${duration?.split(' ')?.[0]}`;
    }
  return duration;
};

const getConferenceProvideIcon = (provider: string) => {
  switch (provider) {
    case Conference.ZOOM:
      return 'zoomIcon';
    case Conference.GOOGLE_CALENDAR:
      return 'googleIcon';
    case Conference.MICROSOFT_CALENDAR:
      return 'teamsIcon';
    default:
      return undefined;
  }
};

const getAndReplaceConferenceProvideName = (provider: string) => {
  switch (provider) {
    case Conference.ZOOM:
      return 'zoom';
    case Conference.GOOGLE_CALENDAR:
      return 'google calender';
    case Conference.MICROSOFT_CALENDAR:
      return 'microsoft calendar';
    default:
      return '';
  }
};

const ViewCourseLesson = ({ isLoading, course }: ICardLessonProps) => {
  const { t } = useTranslation();
  return (
    <div
      className={`${
        isLoading ? 'lazy' : ''
      } bg-offWhite2/50 border border-solid border-borderColor p-5 rounded-xl mt-9`}
    >
      <div className="mb-6">
        <h3 className="text-[24px] leading-[1.3] font-bold text-dark mb-2.5">
          {t('ViewCourse.LessonDetail')}
        </h3>
        <div className="tag-list flex flex-wrap gap-2 text-grayText items-center mb-2.5 ">
          <Button className="font-medium text-current text-[15px] leading-[1.3]">
            {`${course?.lessons?.length} ${t('Calendar.eventDetails.lessonTitle')}`}
          </Button>
          <Button className="w-1.5 h-1.5 bg-current rounded-full" />
          <Button className="font-medium text-current text-[15px] leading-[1.3]">
            {`
             ${t('ViewCourse.Length', {
               DURATION: formatDuration(course?.duration as string),
             })}`}
          </Button>
        </div>
      </div>
      <div className="grid 1400:grid-cols-3 xl:grid-cols-2 grid-cols-1 gap-4">
        {(course?.lessons ?? []).map((data) => {
          return (
            <div className="bg-white p-6 rounded-lg" key={data?.id}>
              <div className="tag-list flex flex-wrap text-secondary gap-2 items-center mb-2.5">
                <Button className="font-medium text-current text-base leading-[1.3]">
                  {`${data?.lesson_sessions?.length} ${t(
                    'Calendar.eventDetails.sessionTitle'
                  )}`}
                </Button>
                {data?.duration && (
                  <>
                    <Button className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <Button className="font-medium text-current text-base leading-[1.3]">
                      {formatDuration(data?.duration)}
                    </Button>
                  </>
                )}
              </div>
              <h4 className="text-[20px] leading-[1.3] font-semibold text-balance text-dark mb-3">
                {data?.title}
              </h4>
              <div className="flex items-center gap-1.5">
                {data?.date && (
                  <Image
                    iconName="calendarCheckIcon"
                    iconClassName="w-4 h-4 text-grayText"
                  />
                )}
                <Button className="text-sm text-dark font-medium">
                  {data?.date
                    ? format(parseISO(data?.date), REACT_APP_DATE_FORMAT as string)
                    : ''}
                </Button>
              </div>

              <div className="mt-2 flex flex-col gap-3">
                {(data?.lesson_sessions ?? []).map((lesson, index) => {
                  return (
                    <div
                      key={lesson?.id}
                      className="bg-offWhite3 p-4 rounded-lg border border-solid border-borderColor"
                    >
                      <p className="text-sm font-bold leading-[1.5]">
                        {`${t('Calendar.eventDetails.sessionTitle')} ${index + 1}`}
                      </p>
                      <div className="flex items-center gap-1.5 mt-3">
                        <Image
                          iconClassName="w-4 h-4 text-grayText"
                          iconName="clockIcon"
                        />
                        {lesson?.start_time && lesson?.end_time ? (
                          <Button className="text-sm text-dark font-normal">
                            {`${format(
                              parseISO(lesson?.start_time),
                              'hh:mm aa'
                            )} - ${format(parseISO(lesson?.end_time), 'hh:mm aa')}`}
                          </Button>
                        ) : (
                          ''
                        )}
                      </div>
                      {data?.location && (
                        <div className="flex items-center gap-1.5 mt-3">
                          <Image
                            iconClassName="w-4 h-4 text-gray-600"
                            iconName="locationIcon"
                          />
                          <span>{data?.location}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mt-5">
                        <div className="flex flex-col gap-2">
                          <label className="uppercase text-sm text-grayText block font-bold">
                            {t('CompanyManager.courseDetails.mode').toUpperCase()}
                          </label>

                          <StatusLabel
                            text={lesson?.mode ?? data?.mode}
                            className="font-bold"
                            variants={getLabelVariant(lesson?.mode ?? data?.mode)}
                          />
                          {lesson?.mode &&
                            lesson?.mode !== LessonModeEnum.InPerson &&
                            lesson.session_conference_provider && (
                              <Button className="view-course-mode cursor-pointer !rounded-[6px]">
                                <Image
                                  iconName={getConferenceProvideIcon(
                                    lesson.session_conference_provider
                                  )}
                                  iconClassName="w-18px h-18px mr-1"
                                />
                                {getAndReplaceConferenceProvideName(
                                  data.conference_provider
                                )}
                              </Button>
                            )}

                          {(lesson?.mode ??
                            data?.mode !== LessonModeEnum.VideoConference) &&
                            data?.place_address && (
                              <div className="">
                                <p className="text-sm uppercase font-semibold text-dark/50 mb-1.5">
                                  {t('Calendar.eventDetails.addressTitle')}
                                </p>
                                <p className="  block text-sm font-medium text-dark/60 w-full">
                                  {data?.place_address}
                                </p>
                              </div>
                            )}
                        </div>
                        {(course?.lessonApproval ?? []).length > 0 && (
                          <div className="flex flex-col gap-2">
                            <label className="uppercase text-sm text-grayText block font-bold">
                              {t('Calendar.eventDetails.trainerTitle')}
                            </label>
                            <div className="text-sm leading-4 text-dark flex items-center after:mx-2.5 after:opacity-50 after:block">
                              <div className="member-wrapper flex items-center gap-1">
                                <div className="flex flex-col gap-2">
                                  {!_.isEmpty(course?.lessonApproval) &&
                                    course?.lessonApproval?.map((user) => {
                                      return (
                                        <div
                                          key={customRandomNumberGenerator()}
                                          className="relative"
                                        >
                                          <div className="grid grid-cols-[20px_1fr] gap-2 items-center text-[12px]">
                                            <div className="relative h-[20px]">
                                              <Image
                                                imgClassName="w-full h-full rounded-full object-cover absolute top-0 left-0"
                                                width={40}
                                                height={40}
                                                alt="memberImage"
                                                src={
                                                  user?.profile_image ??
                                                  '/images/member.png'
                                                }
                                                serverPath
                                              />
                                            </div>
                                            <p>{user?.assignedToUser}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {!data?.client_meeting_link &&
                      lesson?.provider_meeting_link ? (
                        <div className="w-full my-3">
                          <div className="border border-s-borderColor border-navText/30 px-5 py-3 flex gap-2.5 rounded-lg items-center">
                            <Button
                              className="flex-[1_0_0%] inline-block overflow-hidden whitespace-nowrap text-sm text-primary text-center"
                              onClickHandler={() => {
                                if (lesson?.provider_meeting_link)
                                  formatMeetingLink(lesson?.provider_meeting_link);
                              }}
                            >
                              {lesson?.provider_meeting_link}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        ''
                      )}
                      {data?.client_meeting_link ? (
                        <div className="w-full my-3">
                          <div className="border border-s-borderColor border-navText/30 px-5 py-3 flex gap-2.5 rounded-lg items-center">
                            <Button
                              className="flex-[1_0_0%] inline-block overflow-hidden whitespace-nowrap text-sm text-primary text-center"
                              onClickHandler={() => {
                                if (data?.client_meeting_link)
                                  formatMeetingLink(data?.client_meeting_link);
                              }}
                            >
                              {data?.client_meeting_link}
                            </Button>

                            <Button
                              className=""
                              onClickHandler={() => {
                                if (data.client_meeting_link)
                                  navigator?.clipboard?.writeText(
                                    data.client_meeting_link
                                  );
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
                      ) : (
                        ''
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ViewCourseLesson;
