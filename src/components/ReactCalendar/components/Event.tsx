import NameBadge from 'components/Badge/NameBadge';
import Button from 'components/Button/Button';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format } from 'date-fns';
import { StageNameConstant } from 'modules/ProjectManagement_module/enum';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { colorArray } from '../constant';
import { EventProps, TrainerEvent } from '../types';

interface EventDataProps {
  event: EventProps;
  handleMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseLeave?: () => void;
  view?: string;
  customID?: string;
  onBlur?: () => void;
  onClick?: () => void;
  trainerColors?: { [key: string]: string };
}
export const Event = ({
  event,
  view,
  customID,
  handleMouseEnter,
  handleMouseLeave,
  onBlur,
  onClick,
  trainerColors,
}: EventDataProps) => {
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);
  const renderImageOrNameBadge = () => {
    if (
      event?.course?.lessonSessionApproval &&
      event?.course?.lessonSessionApproval[0]
    ) {
      const { assignedToUser } = event.course.lessonSessionApproval[0];
      if (assignedToUser?.profile_image) {
        return (
          <Image
            imgClassName="w-8 h-8 rounded-full object-cover"
            src={assignedToUser.profile_image}
            alt="Event"
            serverPath
          />
        );
      }
      return (
        <NameBadge
          // parentClass=" translate-y-5"
          FirstName={assignedToUser?.first_name}
          LastName={assignedToUser?.last_name}
        />
      );
    }
    return null;
  };

  const renderTrainerColor =
    (trainerColors &&
      Object.entries(trainerColors).find(
        (item) =>
          Number(item[0]) === (event as unknown as TrainerEvent)?.trainerUser?.id
      )?.[1]) ||
    '#4169E1';
  const viewClassMap = {
    day: 'isDayView',
    week: 'isWeekView',
    month: 'isMonthView',
    year: 'isYearView',
  };

  const className = (view && viewClassMap[view as keyof typeof viewClassMap]) || '';
  const containerClassName =
    view === 'day'
      ? 'flex-row items-center'
      : (view === 'week' || view === 'month') && 'flex-col';

  const markOptionTag = () => {
    const conditionOne =
      user?.role_name === ROLES.Admin ||
      user?.role_name === ROLES.TrainingSpecialist ||
      user?.role_name === ROLES.Trainer;
    const conditionTwo =
      event?.course?.card?.stage?.name === StageNameConstant.DateProposed ||
      event?.course?.card?.stage?.name === StageNameConstant.DateConfirmed ||
      event?.course?.card?.stage?.name === StageNameConstant.DateRequested;
    return (
      <div>
        {conditionOne && conditionTwo && (
          <p className="bg-secondary text-white w-fit px-2.5 py-1.5 rounded-md text-xs font-medium capitalize ">
            {t('CoursesManagement.CreateCourse.option')}
          </p>
        )}
      </div>
    );
  };

  const enrolledCourses = event?.course?.enrolled_courses || [];
  const formattedCompanyNames = enrolledCourses
    .map((course) => {
      const companyName = course?.company?.name || '';
      return companyName.length > 50
        ? `${companyName.substring(0, 50)}...`
        : companyName;
    })
    .join(', ');

  const privateCourseType = t('CoursesManagement.CourseType.Private') || '';

  const result = `${formattedCompanyNames} ${privateCourseType}`;
  return (
    <div
      className={`${
        event?.color && colorArray[Number(event?.color) - 1]?.color
      } border border-solid ${
        event?.color && colorArray[Number(event?.color) - 1]?.border
      } text-xs leading-4 text-white px-3 rounded-lg py-2.5 ${
        className ?? ''
      } relative `}
      id={customID}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={onBlur}
      onClick={onClick}
    >
      <div className={`flex ${className !== '' ? ' ' : ' min-h-7'}`}>
        <div
          className={`${containerClassName}  ${
            className !== '' ? ' ' : ' items-center '
          } max-w-[calc(100%_-_36px)] w-full flex-1 pe-1 flex gap-1.5 ${
            view === 'year' ? ' items-center' : ''
          }`}
        >
          {event?.lessonIndex ? (
            <div className="flex gap-2">
              <StatusLabel variants="neon" text={`L - ${event?.lessonIndex}`} />
              {markOptionTag()}
            </div>
          ) : (
            ''
          )}
          <strong
            className={`h-fit text-dark truncate ${
              view === 'year' ? ' max-w-[calc(100%_-_200px)] ' : ''
            }`}
          >
            {event?.course?.title ?? event?.topic ?? event?.title}
          </strong>
          <Button
            className={`${
              className !== '' ? '' : ''
            } text-xs text-navText block h-fit`}
          >
            {format(new Date(event.start), 'hh:mm a')} -
            {format(new Date(event.end), 'hh:mm a')}
          </Button>
          {(event as unknown as TrainerEvent)?.trainerUser ? (
            <StatusLabel
              style={{ backgroundColor: renderTrainerColor, color: 'white' }}
              text={`${
                (event as unknown as TrainerEvent)?.trainerUser?.first_name
              } ${(event as unknown as TrainerEvent)?.trainerUser?.last_name}`}
            />
          ) : (
            ''
          )}
          <div className="flex gap-3 items-center">
            {view === 'day' ? (
              <p className="text-md font-bold text-black">
                {event?.course?.type === 'academy'
                  ? event?.course?.academy?.name
                    ? `${event?.course?.academy?.name} ${t(
                        'CoursesManagement.CreateCourse.academy'
                      )}`
                    : `${t('CoursesManagement.createCourse.otherLocation')} ${t(
                        'CoursesManagement.CreateCourse.academy'
                      )}`
                  : result}
              </p>
            ) : (
              ''
            )}
            {view === 'day' &&
            event?.course?.lessonSessionApproval?.[0]?.assignedToUser ? (
              <StatusLabel
                className={`${
                  event?.color && colorArray[Number(event.color) - 1]?.color
                } `}
                style={{ backgroundColor: renderTrainerColor }}
                text={`${event?.course?.lessonSessionApproval?.[0]?.assignedToUser?.first_name} ${event?.course?.lessonSessionApproval?.[0]?.assignedToUser?.last_name}`}
              />
            ) : (
              ''
            )}
          </div>
        </div>
        {renderImageOrNameBadge()}
      </div>
    </div>
  );
};
