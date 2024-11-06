// ** imports **
import Button from 'components/Button/Button';
import { useTranslation } from 'react-i18next';

// ** constants
import {
  calculateTotalTime,
  formatTotalTime,
} from 'modules/CompanyManager/constants';

// ** types **
import { CourseDetailCardProps } from 'modules/CompanyManager/types';

// ** components **
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { CourseAccordion } from 'modules/CompanyManager/components/courses/CourseAccordion';
import { CourseNotes } from 'modules/CompanyManager/components/courses/CourseNotes';
import { CourseType } from 'modules/Courses/Constants';
import CourseFundedDocument from './CourseFundedDocument';

const CourseDetailCard = ({
  CourseDetails,
  courseDetail,
}: CourseDetailCardProps) => {
  const { t } = useTranslation();
  const updateTitle = useTitle();
  const totalCourseTime = calculateTotalTime(
    courseDetail?.lessons?.flatMap((lesson) => lesson.lesson_sessions) ?? []
  );
  updateTitle(courseDetail?.title ?? 'Proleven Whiz');
  return (
    <>
      {CourseDetails && CourseDetails.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-2xl leading-[1.3] font-bold text-dark">
                {t('CompanyManager.courseDetails.courseContent')}
              </h3>
              {courseDetail?.createdByUser?.first_name && (
                <div>
                  <p className="text-sm text-black/50 font-medium">
                    {t('yourContactPerson')}
                  </p>
                  <span className="font-semibold text-black">
                    {courseDetail?.createdByUser?.first_name}
                    {courseDetail?.createdByUser?.last_name}
                  </span>
                </div>
              )}
            </div>
            <div className="tag-list flex flex-wrap gap-2 text-grayText items-center">
              <Button className="font-medium text-current text-sm leading-[1.3]">
                {courseDetail?.lessons && courseDetail?.lessons?.length > 1 ? (
                  <>
                    {courseDetail?.lessons?.length}&nbsp;
                    {t('CompanyManager.courseDetails.lectures')}
                  </>
                ) : (
                  <>
                    {courseDetail?.lessons?.length}&nbsp;
                    {t('CompanyManager.courseDetails.lecture')}
                  </>
                )}
              </Button>
              <Button className="w-1.5 h-1.5 bg-current rounded-full" />
              <Button className="font-medium text-current text-sm leading-[1.3]">
                {formatTotalTime(totalCourseTime)}&nbsp;
                {t('CompanyManager.totalLengthTitle')}
              </Button>
            </div>
          </div>
          <CourseAccordion CourseFilters={CourseDetails} />
        </>
      )}
      {courseDetail &&
        courseDetail.course_notes &&
        courseDetail.course_notes.length > 0 && (
          <CourseNotes courseNotes={courseDetail.course_notes} />
        )}
      {courseDetail?.type === CourseType.Private &&
        courseDetail &&
        !_.isEmpty(courseDetail?.course_funded_docs) && (
          <CourseFundedDocument
            courseFundedDocs={courseDetail?.course_funded_docs}
          />
        )}
      {courseDetail?.type === CourseType.Private &&
        !_.isEmpty(courseDetail?.project_funded_docs) && (
          <CourseFundedDocument
            header={t('CompanyManager.courseDetails.projectFundedDocs')}
            courseFundedDocs={courseDetail?.project_funded_docs}
          />
        )}
      {courseDetail?.course_attachments &&
        !_.isEmpty(courseDetail?.course_attachments) && (
          <CourseFundedDocument
            className="mt-2"
            header={t('CompanyManager.courseDetails.CourseAttachment')}
            courseFundedDocs={courseDetail?.course_attachments}
          />
        )}
    </>
  );
};
export default CourseDetailCard;
