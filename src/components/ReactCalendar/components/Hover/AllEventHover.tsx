import NameBadge from 'components/Badge/NameBadge';
import Button from 'components/Button/Button';
import Image from 'components/Image';
import {
  EventHoverChildrenProps,
  EventUserDataProps,
} from 'components/ReactCalendar/types';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format } from 'date-fns';
import _ from 'lodash';
import { CourseType } from 'modules/Courses/Constants';
import { formatMeetingLink } from 'modules/Courses/helper/CourseCommon';
import { StageNameConstant } from 'modules/ProjectManagement_module/enum';
import { useTranslation } from 'react-i18next';

export const AllEventHover = ({ hoveredEvent, user }: EventHoverChildrenProps) => {
  const { t } = useTranslation();
  const renderImageOrNameBadge = (imageData: EventUserDataProps | undefined) => {
    if (imageData?.profile_image) {
      return (
        <Image
          imgClassName="w-full h-full object-cover"
          src={imageData?.profile_image}
          alt="Event"
          serverPath
        />
      );
    }
    return (
      <NameBadge FirstName={imageData?.first_name} LastName={imageData?.last_name} />
    );
  };
  const markOption = () => {
    const conditionOne =
      user.role_name === ROLES.Admin ||
      user.role_name === ROLES.TrainingSpecialist ||
      user.role_name === ROLES.Trainer;
    const conditionTwo =
      hoveredEvent?.course?.card?.stage?.name === StageNameConstant.DateProposed ||
      hoveredEvent?.course?.card?.stage?.name === StageNameConstant.DateConfirmed ||
      hoveredEvent?.course?.card?.stage?.name === StageNameConstant.DateRequested;
    return (
      <div>
        {conditionOne && conditionTwo && (
          <p className="bg-secondary text-white w-fit px-2.5 py-1.5 rounded-md text-xs font-medium capitalize">
            {t('CoursesManagement.CreateCourse.option')}
          </p>
        )}
      </div>
    );
  };
  return (
    <>
      <div className="flex items-center pb-5 mb-5 border-b border-solid border-borderColor">
        <div className="img-wrapper w-[178px] h-[120px] rounded-md">
          <Image
            src={hoveredEvent?.course?.image}
            imgClassName="w-full h-full rounded-md object-cover"
            width={180}
            height={120}
            alt="Course Image"
            serverPath
          />
        </div>

        <div className="max-w-[calc(100%_-_178px)] ps-5 w-full flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-2 justify-between">
            <span className="w-fit bg-ic_1/10 text-ic_1 px-2.5 py-1.5 rounded-md text-xs font-medium capitalize">
              {hoveredEvent?.lesson?.mode}
            </span>
            {markOption()}
          </div>

          <p className="text-base font-semibold leading-[1.5]">
            {hoveredEvent?.course?.title}
          </p>
          <span className="flex gap-1.5 items-center text-grayText text-sm">
            {hoveredEvent?.start && format(hoveredEvent?.start, 'hh:mm a')}-
            {hoveredEvent?.start && format(hoveredEvent?.end, 'hh:mm a')}
          </span>
        </div>
      </div>

      <div className="-mx-2.5 flex flex-wrap gap-y-5">
        <div className="flex flex-col gap-1.5 w-1/2 px-2.5">
          <span className="block text-xs text-navText">
            {t('Calendar.eventDetails.lessonTitle')} {hoveredEvent?.lessonIndex}
          </span>
          <p className="text-sm leading-5 text-dark">
            {hoveredEvent?.lesson?.title}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 w-1/2 px-2.5">
          <span className="block text-xs text-navText">
            {t('Calendar.eventDetails.courseTitle')}
          </span>
          <p className="text-sm leading-5 text-dark capitalize">
            {hoveredEvent?.course?.type}
          </p>
        </div>
        {hoveredEvent?.course?.lessonSessionApproval &&
          hoveredEvent?.course?.lessonSessionApproval?.length > 0 && (
            <div className="flex flex-col gap-1.5 w-1/2 px-2.5">
              <span className="block text-xs text-navText">
                {t('CourseBundle.trainer.mainTrainer')}
              </span>
              <div className="text-sm leading-5 text-dark capitalize">
                {hoveredEvent?.course?.lessonSessionApproval?.map((item, index) => {
                  return (
                    <p key={`trainer_${hoveredEvent?.id}_${index + 1}`}>
                      {item?.assignedToUser?.full_name}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        {hoveredEvent?.lesson?.location && (
          <div className="flex flex-col gap-1.5 w-1/2 px-2.5">
            <span className="block text-xs text-navText">
              {t('Trainer.invoice.trainerLocation')}
            </span>
            <p className="text-sm leading-5 text-dark capitalize">
              {hoveredEvent?.lesson?.location ?? '-'}
            </p>
          </div>
        )}

        {hoveredEvent?.course?.type === CourseType.Private &&
          hoveredEvent?.course?.enrolled_courses?.length > 0 && (
            <>
              <div className="flex flex-col gap-1.5 w-1/2 px-2.5">
                <span className="block text-xs text-navText">
                  {t('UserManagement.courseTab.CompanyName')}
                </span>
                {hoveredEvent?.course?.enrolled_courses?.map((course, index) => {
                  return (
                    <p
                      className="text-sm leading-5 text-dark capitalize"
                      key={`hover_event_course_${index + 1}`}
                    >
                      {course?.company?.name ?? '-'}
                    </p>
                  );
                })}
              </div>
              <div className="flex flex-col gap-1.5 w-1/2 px-2.5">
                <span className="block text-xs text-navText">
                  {t('ClientManagement.clientForm.fieldInfos.manager')}
                </span>
                {hoveredEvent?.course?.enrolled_courses?.map((course) =>
                  course?.company?.company_manager?.map((manager, index) => {
                    return (
                      <p
                        className="text-sm leading-5 text-dark capitalize"
                        key={`enrolled_course_${manager?.id}_${index + 1}`}
                      >
                        {manager?.manager?.user?.full_name ?? '-'}
                      </p>
                    );
                  })
                )}
              </div>
            </>
          )}
        {!_.isEmpty(hoveredEvent?.course?.course_resources) ? (
          <div className="flex flex-col gap-2.5 w-1/2 px-2.5">
            <Button className="block text-xs text-navText">
              {t('Calendar.eventDetails.resourceTitle')}
            </Button>
            <div className="flex flex-wrap gap-2">
              {hoveredEvent?.course?.course_resources?.map(
                (data, resource_index) => (
                  <Button
                    className="p-2 inline-block bg-primaryLight text-dark text-sm rounded-md leading-none"
                    key={`resource_${hoveredEvent?.course?.id}_${
                      resource_index + 1
                    }`}
                  >
                    {data?.resources?.title}
                  </Button>
                )
              )}
            </div>
          </div>
        ) : (
          ''
        )}
        {!_.isEmpty(hoveredEvent?.course?.assigned_rooms) ? (
          <div className="flex flex-col gap-2.5 w-1/2 px-2.5">
            <Button className="block text-xs text-navText">
              {t('trainerRequestAcceptModal.RoomTitle')}
            </Button>
            <div className="flex flex-wrap gap-2">
              {hoveredEvent?.course?.assigned_rooms?.map((data, room_index) => (
                <Button
                  className="p-2 inline-block bg-primaryLight text-dark text-sm rounded-md leading-none"
                  key={`resource_${hoveredEvent?.course?.id}_${room_index + 1}`}
                >
                  {data?.course_room?.title}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          ''
        )}
        {hoveredEvent?.course?.createdByUser && (
          <div className="flex flex-col gap-1.5 w-1/2 px-2.5">
            <span className="block text-xs text-navText">
              {t('Calendar.eventDetails.creatorTitle')}
            </span>
            <div className="flex items-center gap-1">
              <div className="inline-block w-8 h-8 rounded-full overflow-hidden">
                {renderImageOrNameBadge(hoveredEvent?.course?.createdByUser)}
              </div>
              <p className="text-sm leading-5 text-dark">
                {hoveredEvent?.course?.createdByUser?.full_name}
              </p>
            </div>
          </div>
        )}
        {hoveredEvent?.course?.assignedTo && (
          <div className="flex flex-col gap-1.5 w-1/2 px-2.5">
            <span className="block text-xs text-navText">
              {t('Calendar.eventDetails.trainerTitle')}
            </span>
            <div className="flex items-center gap-1">
              <div className="inline-block w-8 h-8 rounded-full overflow-hidden">
                {renderImageOrNameBadge(hoveredEvent?.course?.assignedTo)}
              </div>
              <p className="text-sm leading-5 text-dark">
                {hoveredEvent?.course?.assignedTo?.full_name}
              </p>
            </div>
          </div>
        )}
        {hoveredEvent?.lesson?.lesson_sessions?.map((session) => {
          return session?.provider_meeting_link ? (
            <div className="flex flex-col gap-1.5  w-full px-2.5">
              <span className="block text-xs text-navText">
                {t('Calendar.eventDetails.linkTitle')}
              </span>
              <Button
                className="relative py-1.5 px-2 pl-10 bg-primary/10 rounded-md flex gap-2 cursor-pointer hover:underline items-center overflow-hidden whitespace-nowrap text-sm text-primary text-left"
                onClickHandler={() => {
                  if (session?.provider_meeting_link)
                    formatMeetingLink(session?.provider_meeting_link);
                }}
              >
                <Image
                  iconName="linkIcon3"
                  iconClassName="w-5 h-5 left-2 absolute top-1.5"
                />
                <span className="block truncate">
                  {session?.provider_meeting_link}
                </span>
              </Button>
            </div>
          ) : (
            ''
          );
        })}
      </div>
    </>
  );
};
