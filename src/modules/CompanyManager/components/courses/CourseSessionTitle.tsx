// ** imports **
import { useTranslation } from 'react-i18next';

// ** components **
import Button from 'components/Button/Button';

// ** constants **
import {
  calculateTotalTime,
  formatTotalTime,
} from 'modules/CompanyManager/constants';

// ** types **
import { TitleProps } from 'modules/CompanyManager/types';

const CourseSessionTitle = ({
  lessonTitle,
  lessonData,
  lessonNumber,
}: TitleProps) => {
  const { t } = useTranslation();
  const totalMinutes = calculateTotalTime(lessonData?.lesson_sessions);

  return (
    <div className="flex justify-between flex-[1_0_0%] pe-4 ">
      <p className="text-base font-semibold leading-5 max-w-[calc(100%_-_200px)] text-balance">
        {lessonNumber}. &nbsp;{lessonTitle}
      </p>
      <div className="tag-list flex flex-wrap gap-2 text-grayText items-center">
        <Button className="font-medium text-current text-sm leading-[1.3]">
          {lessonData?.lesson_sessions?.length} &nbsp;
          {t('CompanyManager.courseDetails.session')}
        </Button>
        <Button className="w-1.5 h-1.5 bg-current rounded-full" />
        <Button className="font-medium text-current text-sm leading-[1.3]">
          {formatTotalTime(totalMinutes)} {t('CompanyManager.totalLengthTitle')}
        </Button>
      </div>
    </div>
  );
};
export default CourseSessionTitle;
