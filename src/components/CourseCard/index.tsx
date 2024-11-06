import Button from 'components/Button/Button';
import 'components/CourseCard/style/card.css';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import { COURSE_TYPE, CourseStatus, CourseType } from 'modules/Courses/Constants';
import { CourseMode, getCourseModeEnum } from 'modules/DashBoard/constants';
import { StageNameConstant } from 'modules/ProjectManagement_module/enum';
import { useTranslation } from 'react-i18next';
import { formatCurrency, getCurrencySymbol } from 'utils';

interface CourseCardProps {
  parentClass?: string;
  imagesrc?: string;
  categories?: string;
  title?: string;
  dateTime?: string;
  courseMode?: string;
  trainnerImage?: string;
  trainnerName?: string;
  onClick?: () => void;
  coursePrice?: number;
  participant?: string;
  highLightLabel?: string;
  otherClick?: () => void;
  otherText?: string;
  courseStatus?: string;
  courseType?: string;
  courseAddress?: string;
  stageName?: string;
}

const CourseCard = ({
  parentClass,
  imagesrc,
  categories,
  title,
  dateTime,
  trainnerImage,
  trainnerName,
  onClick,
  coursePrice,
  participant,
  courseMode,
  highLightLabel,
  otherClick,
  otherText,
  courseStatus,
  courseType,
  courseAddress,
  stageName,
}: CourseCardProps) => {
  const { t } = useTranslation();

  const modeDetail = courseMode ? getCourseModeEnum(courseMode) : '';
  const modeTitle = modeDetail ? CourseMode(modeDetail) : '';

  return (
    <div className={parentClass ?? ''}>
      <div className="h-[253px] w-full overflow-hidden rounded-t-xl relative">
        {stageName === StageNameConstant.DateProposed ? (
          <div className="absolute top-1.5 left-1.5 z-1 font-semibold bg-secondary text-white rounded-md text-[11px] px-2 py-0.5">
            {stageName}
          </div>
        ) : (
          ''
        )}

        <Image
          imgClassName="w-full h-full object-cover"
          src={imagesrc}
          width={380}
          height={253}
          serverPath
        />
        {highLightLabel && (
          <Button className="card-highlight-label">
            {highLightLabel ?? 'Dummy label'}
          </Button>
        )}
      </div>
      <div className="bg-white rounded-b-xl p-5 pb-5 flex-auto h-[calc(100%_-_253px)] flex flex-col">
        <div className="flex flex-col gap-2 mb-4">
          <div className="text-base leading-4 text-secondary flex items-center">
            <Button className="font-medium after:w-1.5 after:h-1.5 after:bg-secondary after:rounded-full after:inline-block after:content-[''] after:mx-1.5">
              {categories}
            </Button>
            {modeTitle ? (
              <>
                <StatusLabel
                  className="text-base font-semibold"
                  variants="neon"
                  text={modeTitle}
                />
              </>
            ) : (
              ''
            )}
          </div>
          <h4 className="text-xl font-semibold text-dark leading-normal mt-3">
            {title}
          </h4>
          {courseStatus === CourseStatus.publish && (
            <p className="text-base leading-4 text-grayText flex items-center my-2">
              <Image
                iconName="calendarIcon2"
                iconClassName="w-[18px] h-[18px] inline-block me-1.5"
              />
              {dateTime}
            </p>
          )}
          {courseAddress && <p className="text-base wordBreak">{courseAddress}</p>}
        </div>

        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center max-w-[calc(100%_-_60px)]">
            {trainnerName || trainnerImage ? (
              <>
                <Image
                  src={trainnerImage}
                  width={24}
                  height={24}
                  imgClassName="w-6 h-6 rounded-full oveject-cover"
                  serverPath
                />
                <Button className="text-sm text-dark ms-1.5">{trainnerName}</Button>
              </>
            ) : (
              courseStatus === CourseStatus.publish &&
              courseType !== CourseType.Private && (
                <span className="flex items-center">
                  <p className="text-xl leading-normal font-semibold">
                    {coursePrice
                      ? `${getCurrencySymbol('EUR')} ${formatCurrency(
                          Number(coursePrice),
                          'EUR'
                        )}`
                      : t('CompanyManager.Course.FreeText')}
                  </p>
                  <Button className="text-base">{participant}</Button>
                </span>
              )
            )}
          </div>

          <div className="flex gap-x-3">
            {courseType === COURSE_TYPE.Private && otherText && (
              <Button
                onClickHandler={otherClick}
                className="card-button group text-[13px] font-semibold"
              >
                {otherText}
              </Button>
            )}

            <Button onClickHandler={onClick} className="card-button ">
              <Image iconName="arrowRight" iconClassName="card-button-image" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
