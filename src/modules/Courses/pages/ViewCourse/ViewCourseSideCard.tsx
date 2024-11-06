import Button from 'components/Button/Button';
import StatusLabel from 'components/StatusLabel';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { AuthUserType } from 'redux-toolkit/slices/authSlice';
import { ICourseDetail } from '../Attendance/types';
import { REACT_APP_DATE_FORMAT } from 'config';
import { formatCurrency, getCurrencySymbol } from 'utils';

type ICardProps = {
  course: ICourseDetail | undefined;
  isLoading: boolean;
  user: Partial<AuthUserType | null> | undefined;
};
const ViewCourseSideCard = ({ course, isLoading, user }: ICardProps) => {
  const { t } = useTranslation();

  const formatCourseValidity = (validity: number | undefined): string => {
    if (validity === 0) {
      return t('CoursesManagement.noExpiryTitle');
    }
    if (validity !== undefined && validity !== null) {
      return validity > 1
        ? `${validity} ${t('CoursesManagement.ViewCourse.years')}`
        : `${validity} ${t('CoursesManagement.ViewCourse.year')}`;
    }
    return '-';
  };

  const getFundedBy = (funded_by: string): string | JSX.Element => {
    const stringToArray = funded_by?.split(',');

    if (funded_by === 'NAN') {
      return '-';
    }

    const mappedElements = stringToArray?.map((data, index) => (
      <div key={`${index + 1}_fundedBy`} className="flex flex-col">
        <StatusLabel text={data} />
      </div>
    ));

    return <div className="flex flex-col">{mappedElements}</div>;
  };
  return (
    <div className="991:max-w-[calc(100% - 500px] w-full 991:pe-7">
      <div
        className={`${
          isLoading ? 'lazy !h-[350px]' : ''
        } flex flex-col gap-y-8 bg-offWhite2/40 border border-solid border-borderColor h-full py-6 px-5 rounded-xl`}
      >
        <div className="flex flex-col gap-1.5 text-dark">
          <div className="text-current text-sm font-medium mb-3">
            <Button>
              {course?.type ? (
                <StatusLabel text={course?.type} variants="completed" />
              ) : (
                ''
              )}
            </Button>
          </div>
          <div className="text-current text-sm font-medium">
            {t('CoursesManagement.CreateCourse.validity')} :&nbsp;
            <Button className="text-danger font-normal">
              {course ? formatCourseValidity(course?.validity) : ''}
            </Button>
          </div>
          <div className="text-current text-sm font-medium">
            {t('CoursesManagement.columnHeader.CourseCode')} :&nbsp;
            <Button> {course?.code ?? '-'}</Button>
          </div>

          {course?.start_date ? (
            <div className="text-current text-sm font-medium">
              {t('CourseBundle.startDate')} :&nbsp;
              <Button className="text-current font-normal mx-1">
                {format(
                  parseISO(course?.start_date),
                  REACT_APP_DATE_FORMAT as string
                )}
              </Button>
            </div>
          ) : (
            ''
          )}
          {course?.end_date ? (
            <div className="text-current text-sm font-medium">
              {t('CourseBundle.endDate')} :&nbsp;
              <Button className="text-current font-normal mx-1">
                {format(parseISO(course?.end_date), REACT_APP_DATE_FORMAT as string)}
              </Button>
            </div>
          ) : (
            ''
          )}
          {course?.surveyTemplate?.title ? (
            <div className="text-current text-sm font-medium">
              {t('CoursesManagement.CreateCourse.survey')} :&nbsp;
              <Button className="text-current font-normal mx-1">
                {course?.surveyTemplate?.title}
              </Button>
            </div>
          ) : (
            ''
          )}
          {course?.academy?.name ? (
            <div className="text-current text-sm font-medium">
              {t('CoursesManagement.CourseType.Academy')} :&nbsp;
              <Button className="text-current font-normal mx-1">
                {course?.academy?.name}
              </Button>
            </div>
          ) : (
            ''
          )}
          {course?.academy?.location || course?.lessons[0]?.location ? (
            <div className="text-current text-sm font-medium">
              {t('AccountSetting.AcademyAddressLabel')} :&nbsp;
              <Button className="text-current font-normal mx-1">
                {course?.academy?.location ?? course?.lessons[0]?.location}
              </Button>
            </div>
          ) : (
            ''
          )}
        </div>
        {course?.founded && (
          <div className="flex flex-col text-dark">
            <div className="text-current text-sm font-medium">
              {t('CoursesManagement.columnHeader.FundedBy')}
            </div>
            <Button className="text-current text-xl font-semibold">
              {getFundedBy(course?.funded_by)}
            </Button>
          </div>
        )}

        {user?.role_name !== ROLES.Trainer &&
        course?.type !== 'private' &&
        course?.price ? (
          <div className="mt-auto">
            <div className="text-[32px] font-bold leading-[1.1]">{`${getCurrencySymbol(
              'EUR'
            )} ${formatCurrency(Number(course?.price), 'EUR')}`}</div>
            <Button className="text-current text-sm font-medium">
              {t('CourseView.participant')}
            </Button>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default ViewCourseSideCard;
