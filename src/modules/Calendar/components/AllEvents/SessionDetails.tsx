// translation left
import Button from 'components/Button/Button';
import { ROLES } from 'constants/roleAndPermission.constant';
import _ from 'lodash';
import { SessionCard } from 'modules/Calendar/components/AllEvents/SessionCard';
import { CalendarEventDetails, LessonSessionApproval } from 'modules/Calendar/types';
import { StageNameConstant } from 'modules/ProjectManagement_module/enum';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { customRandomNumberGenerator } from 'utils';

interface Props {
  eventDetails?: CalendarEventDetails;
}

export const SessionDetails = ({ eventDetails }: Props) => {
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);

  const markOption = () => {
    const conditionOne =
      user?.role_name === ROLES.Admin ||
      user?.role_name === ROLES.TrainingSpecialist ||
      user?.role_name === ROLES.Trainer;
    const conditionTwo =
      eventDetails?.card?.stage?.name === StageNameConstant.DateProposed ||
      eventDetails?.card?.stage?.name === StageNameConstant.DateConfirmed ||
      eventDetails?.card?.stage?.name === StageNameConstant.DateRequested;
    return (
      <div>
        {conditionOne && conditionTwo && (
          <p className="bg-secondary text-white w-fit px-2.5 py-1.5 rounded-md text-base 1200:text-sm font-medium capitalize ">
            {t('CoursesManagement.CreateCourse.option')}
          </p>
        )}
      </div>
    );
  };

  const getCourseViewUrl = () => {
    if (user?.role_name === ROLES.Trainer) {
      return `/trainer/courses/view/${eventDetails?.slug}`;
    }
    if (user?.role_name === ROLES.CompanyManager) {
      return `/manager/courses/${eventDetails?.slug}`;
    }
    return `/courses/view/${eventDetails?.slug}?status=publish&activeTab=1&type=${eventDetails?.type}&isCourse=true`;
  };

  const mainTrainers: LessonSessionApproval[] = [];
  const optionalTrainers: LessonSessionApproval[] = [];

  eventDetails?.lessonSessionApproval?.forEach((t) => {
    if (t.is_optional) optionalTrainers.push(t);
    else mainTrainers.push(t);
  });

  return (
    <div className=" relative before:absolute before:w-px before:h-full before:-left-5 before:top-0 before:content-[''] before:bg-black/10">
      <div className="flex flex-col gap-5">
        <div className="flex  gap-1.5 items-start justify-between">
          <div className="flex gap-1.5 flex-col">
            <Button className="block text-xs text-navText">
              {t('Calendar.eventDetails.lessonTitle')}:
            </Button>
            <p className="text-base font-semibold leading-[1.5]">
              {eventDetails?.lessons[0]?.title}
            </p>
          </div>

          {markOption()}
        </div>

        <hr />
        {!_.isEmpty(eventDetails?.course_resources) ? (
          <div className="flex flex-col gap-2.5">
            <Button className="block text-xs text-navText">
              {t('Calendar.eventDetails.resourceTitle')}
            </Button>
            <div className="flex flex-wrap gap-2">
              {eventDetails?.course_resources?.map((data) => (
                <Button
                  className="p-2 inline-block bg-primaryLight text-dark text-sm rounded-md leading-none"
                  key={customRandomNumberGenerator()}
                >
                  {data?.resources?.title}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          ''
        )}
        {!_.isEmpty(eventDetails?.assigned_rooms) ? (
          <div className="flex flex-col gap-2.5">
            <Button className="block text-xs text-navText">
              {t('trainerRequestAcceptModal.RoomTitle')}
            </Button>
            <div className="flex flex-wrap gap-2">
              {eventDetails?.assigned_rooms?.map((data) => (
                <Button
                  className="p-2 inline-block bg-primaryLight text-dark text-sm rounded-md leading-none"
                  key={customRandomNumberGenerator()}
                >
                  {data?.course_room?.title}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          ''
        )}

        <SessionCard eventDetails={eventDetails} />

        {eventDetails?.lessonSessionApproval?.length ? (
          <div className="grid gap-3">
            <div className="bg-primaryLight p-5 rounded-lg ">
              <p className="text-lg font-semibold leading-[1.5] pb-3">
                {t('Calendar.filterTabs.trainersTitle')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  {!_.isEmpty(mainTrainers) && (
                    <p className="font-semibold text-[15px] mb-1">
                      {t('Calendar.filterTabs.mainTrainersTitle')}
                    </p>
                  )}
                  {(mainTrainers ?? []).map((item) => {
                    return (
                      <div key={item?.id} className="text-[14px] ">
                        <p>{`${item?.assignedToUser?.first_name} ${item?.assignedToUser.last_name}`}</p>
                      </div>
                    );
                  })}
                </div>
                {!_.isEmpty(optionalTrainers) && (
                  <div>
                    <p className="font-semibold text-[15px] mb-1">
                      {t('Calendar.filterTabs.optionalTrainersTitle')}
                    </p>
                    {(optionalTrainers ?? []).map((item) => {
                      return (
                        <div key={item?.id} className="text-[14px] ">
                          <p>{`${item?.assignedToUser?.first_name} ${item?.assignedToUser.last_name}`}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          ''
        )}

        <div className="w-full my-3">
          <div className="border border-s-borderColor border-navText/30 px-5 py-3 flex gap-2.5 rounded-lg items-center">
            <Button
              className="flex-[1_0_0%] inline-block overflow-hidden whitespace-nowrap text-sm text-primary text-center"
              onClickHandler={() => {
                const url = getCourseViewUrl();
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
            >
              {t('Calendar.filterTabs.viewCourseTitle')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
