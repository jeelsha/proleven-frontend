// translation left
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ROLES } from 'constants/roleAndPermission.constant';
import _ from 'lodash';
import 'modules/Calendar/style/calendar.css';
import { CalendarEventDetails } from 'modules/Calendar/types';
import { CourseType } from 'modules/Courses/Constants';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { customRandomNumberGenerator } from 'utils';
import { ProfileCard } from './ProfileCard';

interface Props {
  eventDetails?: CalendarEventDetails;
}
// trainer/courses/view
export const CourseDetails = ({ eventDetails }: Props) => {
  const user = useSelector(getCurrentUser);
  const courseViewUrl =
    user?.role_name === ROLES.CompanyManager
      ? '/manager/my-courses/'
      : user?.role_name === ROLES.Trainer
      ? '/trainer/courses/view/'
      : '/courses/view/';
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="max-w-[485px]">
      <div className="flex flex-col gap-y-2.5">
        <Button
          className="text-base font-semibold leading-[1.5] text-left"
          onClickHandler={() =>
            navigate(`${courseViewUrl}/${eventDetails?.slug}`, {
              state: { isTemplate: true },
            })
          }
        >
          {eventDetails?.title}
        </Button>
        <div className="h-[220px] max-w-[440px] w-full">
          <Image
            src={eventDetails?.image}
            imgClassName="w-full h-full object-cover"
            alt={eventDetails ? `${eventDetails.title} ` : 'Course Image'}
            showImageLoader
            serverPath
          />
        </div>
      </div>
      <div className="course-detail-type">
        <Button className="block text-xs text-navText">
          {t('Calendar.eventDetails.courseTitle')}
        </Button>
        <p className="text-sm leading-5 text-dark font-semibold capitalize">
          {eventDetails?.type}
        </p>
      </div>

      {eventDetails?.lessons?.[0]?.location && (
        <div className="flex flex-col gap-1.5 w-1/2 mb-3">
          <span className="block text-xs text-navText">
            {t('Trainer.invoice.trainerLocation')}
          </span>
          <p className="text-sm leading-5 text-dark capitalize">
            {eventDetails?.lessons?.[0]?.location ?? '-'}
          </p>
        </div>
      )}
      {eventDetails?.type === CourseType.Private &&
        eventDetails?.enrolled_courses &&
        eventDetails?.enrolled_courses?.length > 0 && (
          <>
            <div className="flex flex-col gap-1.5 w-1/2 mb-3">
              <span className="block text-xs text-navText">
                {t('UserManagement.courseTab.CompanyName')}
              </span>
              {eventDetails?.enrolled_courses?.map((course, index) => {
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
            <div className="flex flex-col gap-1.5 w-1/2 mb-3">
              <span className="block text-xs text-navText">
                {t('ClientManagement.clientForm.fieldInfos.manager')}
              </span>
              {eventDetails?.enrolled_courses?.map((course) =>
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
      {!_.isEmpty(eventDetails?.course_notes) && (
        <div className="course-detail-type">
          <Button className="block text-xs text-navText">
            {t('Calendar.eventDetails.notesTitle')}
          </Button>
          {eventDetails?.course_notes?.map(({ content }) => (
            <p
              className="text-sm leading-5 text-dark"
              key={customRandomNumberGenerator()}
            >
              {content}
            </p>
          ))}
        </div>
      )}
      <div className="course-detail-profile">
        {eventDetails?.createdByUser && (
          <ProfileCard
            profileData={eventDetails?.createdByUser}
            title={t('Calendar.eventDetails.creatorTitle')}
          />
        )}
        {eventDetails?.assignedTo && (
          <ProfileCard
            profileData={eventDetails?.assignedTo}
            title={t('Calendar.eventDetails.trainerTitle')}
          />
        )}
      </div>
    </div>
  );
};
