// ** Components **
import Button from 'components/Button/Button';
import Image from 'components/Image';

// ** Types **
import { IconTypes } from 'components/Icon/types';
import { TFunction } from 'i18next';
import { CourseResponse, Session, SetFieldValue } from 'modules/Courses/types';

// ** Constants
import { AssignedStatus, Conference, COURSE_TYPE } from 'modules/Courses/Constants';
import { CourseBundle } from 'modules/Courses/types/TemplateBundle';

// ** utils
import { REACT_APP_DATE_FORMAT } from 'config';
import { format, parseISO } from 'date-fns';
import _ from 'lodash';
import { NavigateFunction } from 'react-router-dom';

export const renderSessionConferenceButtons = (
  session: Session,
  index: number,
  ind: number,
  setFieldValue: SetFieldValue | undefined,
  disabled: boolean
) => {
  const conferenceProviders = [
    { provider: Conference.ZOOM, iconName: 'zoomIcon', label: 'Zoom' },
    {
      provider: Conference.MICROSOFT_CALENDAR,
      iconName: 'teamsIcon',
      label: 'Teams',
    },
    {
      provider: Conference.GOOGLE_CALENDAR,
      iconName: 'googleIcon',
      label: 'Meet',
    },
  ];

  return conferenceProviders.map(({ provider, iconName, label }) => (
    <Button
      disabled={disabled}
      key={provider}
      onClickHandler={() => {
        if (setFieldValue) {
          setFieldValue(
            `lesson[${index}].session[${ind}].session_conference_provider`,
            provider
          );
        }
      }}
      variants={
        session.session_conference_provider === provider
          ? 'primary'
          : 'whiteBordered'
      }
      className={`${
        session.session_conference_provider === provider ? 'border-primary' : ''
      } gap-1 min-w-[102px] justify-center`}
    >
      <Image iconName={iconName as IconTypes} />
      {label}
    </Button>
  ));
};
export const renderTemplatePreview = (
  courses: CourseBundle[],
  t: TFunction<'translation', undefined>,
  className = ''
) => {
  return (
    <div className={className}>
      <p className="text-sm font-semibold text-dark mb-2">
        {t('CoursesManagement.Bundle.AddEditBundle.courses')}
      </p>
      <div className="grid gap-x-5 gap-y-2 1200:grid-cols-2 mb-3">
        {(courses ?? []).map((course, i) => (
          <div
            key={`Template_${i + 1}`}
            className="flex flex-wrap items-center border border-solid border-borderColor rounded-lg"
          >
            <Image
              src={course.courseTemplate.image}
              imgClassName="w-[100px] h-[70px] rounded-lg"
              showImageLoader
              serverPath
            />
            <div className="max-w-[calc(100%_-_100px)] w-full ps-3">
              <p className="text-xs font-medium text-dark/70">
                {course.courseTemplate.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const trainerConfirmationCell = (
  { lessonApproval }: CourseResponse,
  t: TFunction<'translation', undefined>
) => {
  return (
    <div className="flex flex-col gap-1">
      {Array.isArray(lessonApproval) &&
        lessonApproval.map((item, index) => {
          return (
            <div
              key={`lessonApproval_${index + 1}`}
              className="flex items-center gap-2"
            >
              <span className="wordBreak-word w-[119px] pr-2 relative after:absolute after:right-0 after:top-1/2 after:w-[1px] after:h-full after:-translate-y-1/2 after:bg-gray-300">
                {item?.assignedToUser}
              </span>
              <span className="flex-shrink-0 flex items-center gap-1">
                {item.is_full_course && item.is_optional && (
                  <span className="text-primary font-semibold whitespace-nowrap">
                    {item.is_full_course && item.is_optional ? ` Full Optional` : ''}
                  </span>
                )}
                {item.is_full_course && !item.is_optional && (
                  <span className="text-primary font-semibold whitespace-nowrap">
                    {item.is_full_course && !item.is_optional ? ' Full Main' : ''}
                  </span>
                )}
                {!item.is_full_course && (
                  <span className="text-primary font-semibold">
                    {!item.is_full_course ? ' Session' : ''}
                  </span>
                )}

                <span className="shrink-0">
                  {renderButtonsBasedOnStatus(
                    item?.assigned_to_status,
                    t,
                    item?.trainer_assigned_to_status
                  )}
                </span>
              </span>
            </div>
          );
        })}
    </div>
  );
};

export const trainingSpecialistCell = (item: CourseResponse): string =>
  `${item?.training_specialist} (${item?.creator_role})`;

const renderStatusButton = (icon: string, color: string, toolTipText?: string) => (
  <Button
    className={`inline-flex gap-1 items-center justify-center w-18px h-18px rounded-full border border-solid ${color}`}
    tooltipText={toolTipText}
    tooltipPosition="right"
  >
    <Image iconName={icon as IconTypes} iconClassName="w-full h-full" />
  </Button>
);

export const courseCompaniesCell = (item: CourseResponse) => {
  const companyNames = !_.isEmpty(item.companies) ? item?.companies?.join(',') : [];
  return <>{!_.isEmpty(companyNames) && companyNames ? companyNames : '-'}</>;

  // return ;
};

export const renderButtonsBasedOnStatus = (
  item: string | undefined,
  t: TFunction<'translation', undefined>,
  trainer_assigned_to_status?: string
) => {
  if (
    trainer_assigned_to_status === 'accepted' &&
    item === AssignedStatus.Requested
  ) {
    return renderStatusButton(
      'checkIcon',
      'text-green2 bg-green2/20 border-green2/30 p-0.5',
      t('CourseManagement.Tooltip.Accepted')
    );
  }
  switch (item) {
    case AssignedStatus.Accepted:
      return renderStatusButton(
        'checkIconDark',
        '',
        t('CourseManagement.Tooltip.Confirmed')
      );
    case AssignedStatus.Rejected:
      return renderStatusButton(
        'crossIcon',
        'text-danger bg-danger/20 border-danger/30 p-1',
        t('CourseManagement.Tooltip.Rejected')
      );
    case AssignedStatus.Requested:
      return renderStatusButton(
        'requestIcon',
        'text-orange2 bg-orange2/20 border-orange2/30 p-0.5',
        t('CourseManagement.Tooltip.Requested')
      );
    case AssignedStatus.Draft:
      return renderStatusButton(
        'editpen2',
        'text-primary bg-primary/20 border-primary/30 p-0.5',
        t('CourseManagement.Tooltip.Draft')
      );
    default:
      return null;
  }
};

export const getCourseType = (courseType: string): string => {
  switch (courseType) {
    case COURSE_TYPE.Academy:
      return COURSE_TYPE.academy;
    case COURSE_TYPE.Private:
      return COURSE_TYPE.private;
    default:
      return '';
  }
};

export const courseTypeCell = (
  data: CourseResponse,
  navigate: NavigateFunction,
  url: string,
  activeTab?: number
) => {
  const courseType = getCourseType(data?.type);
  if (courseType.toLowerCase() === COURSE_TYPE.Private) {
    return (
      <div className="flex flex-col">
        <p>{courseType}</p>
        {data?.projects?.title ? (
          <Button
            className=" cursor-pointer text-sm text-primary underline underline-offset-4 inline-block"
            onClickHandler={() =>
              navigate('/project-management-details', {
                state: {
                  cardId: data?.projects?.card?.id,
                  activeTab,
                  url,
                },
              })
            }
          >
            {data?.projects?.title}
          </Button>
        ) : (
          ''
        )}
      </div>
    );
  }
  return courseType;
};

export const dateRender = (dateString: string) => {
  return (
    <>
      {dateString ? (
        format(parseISO(dateString), REACT_APP_DATE_FORMAT as string)
      ) : (
        <span>&nbsp;-&nbsp;</span>
      )}
    </>
  );
};
