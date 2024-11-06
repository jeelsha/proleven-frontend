// ** imports **
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';

// ** types **
import { REACT_APP_DATE_FORMAT } from 'config';
import _ from 'lodash';
import { CourseHeaderProps } from 'modules/CompanyManager/types';
import { useNavigate } from 'react-router-dom';

export const CourseHeader = ({ courseHeaderData, state }: CourseHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setUrl = () => {
    if (!_.isEmpty(state)) {
      if (state?.comingFromDashBoard) {
        return '/';
      }
      if (state?.navigateBackUrl) {
        return state?.navigateBackUrl;
      }
      if (state?.comingFromManagerForm) {
        return '/manager/courses';
      }
      if (state?.fromAttendee) {
        return '/attendee';
      }
      return '/manager/my-courses';
    }
    return '/';
  };
  const url = setUrl();

  return (
    <div className="bg-primary py-11">
      <div className="container">
        <div className="1200:max-w-[65%] 1600:max-w-[50%]">
          <Button
            className="block text-white mb-2 font-medium text-lg cursor-pointer"
            onClickHandler={() => {
              navigate(url, {
                state: {
                  ...state,
                },
              });
            }}
          >
            <div className="flex gap-x-2 items-center">
              <Image iconName="leftDoubleArrows" />
              {t('Button.backButton')}
            </div>
          </Button>
          <Button className="block text-primary2 text-base mb-1 font-medium">
            {courseHeaderData?.courseSubCategory?.name}
          </Button>
          <h1 className="text-balance text-white font-bold text-2xl 1200:text-3xl 1400:text-4xl 1600:text-[40px]">
            {courseHeaderData?.title}
          </h1>
          <p className="flex gap-1 text-sm font-normal leading-[1.2] text-white mt-5">
            {(courseHeaderData?.start_date || courseHeaderData?.end_date) && (
              <Image iconClassName="w-4 h-4" iconName="calendarCheckIcon" />
            )}
            {courseHeaderData?.start_date &&
              format(
                new Date(courseHeaderData.start_date),
                REACT_APP_DATE_FORMAT as string
              )}
            {courseHeaderData?.end_date && (
              <>
                <p>&nbsp;-&nbsp;</p>
                <p>
                  {format(
                    new Date(courseHeaderData?.end_date),
                    REACT_APP_DATE_FORMAT as string
                  )}
                </p>
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2.5 mt-3.5 items-center">
            <p className="text-sm leading-5 font-normal text-white">
              {t('CompanyManager.courseDetails.validity')}&nbsp;
              <Button className="text-danger">
                {courseHeaderData?.validity === 0 ||
                _.isNull(courseHeaderData?.validity) ? (
                  t('CompanyManager.noExpiryTitle')
                ) : (
                  <>
                    {courseHeaderData?.validity}&nbsp;
                    {t('CompanyManager.courseDetails.years')}
                  </>
                )}
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
