// ** imports **
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';

// ** constants **
import { ROLES } from 'constants/roleAndPermission.constant';

// ** hooks **
import { useAxiosPost } from 'hooks/useAxios';

// ** styles **
import 'modules/CompanyManager/style/companyManager.css';

// ** types **
import { CourseDetailProps } from 'modules/CompanyManager/types';

// ** redux **
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { useModal } from 'hooks/useModal';
import _ from 'lodash';
import { CourseMarkAsEnum, CourseType } from 'modules/Courses/Constants';
import { useEffect, useState } from 'react';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import AccessDeniedModal from '../AccessDenidedModal';

// ** Helpers
import { REACT_APP_DATE_FORMAT } from 'config';
import { format, parseISO } from 'date-fns';
import AttendeeModal from 'modules/CompanyManager/pages/AttendeeModal';
import { isTodayGreaterThanGivenDate } from 'modules/Courses/helper/CourseCommon';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

const EnrollCourseCard = ({
  courseDetails,
  type,
  courseDetailLoader,
}: {
  courseDetails: CourseDetailProps | undefined;
  type?: string;
  courseDetailLoader: boolean;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [createEnrollCourse] = useAxiosPost();
  const AccessModal = useModal();
  const CurrentUser = useSelector(getCurrentUser);
  const ActiveCompany = useSelector(useCompany);
  const user = useSelector(getCurrentUser);
  const [isEnroll, setIsEnroll] = useState<boolean | undefined>(false);
  const enrollModal = useModal();
  const attendeeAddModal = useModal();
  const params = useParams();

  const isCourseCompleted = courseDetails?.end_date
    ? isTodayGreaterThanGivenDate(courseDetails?.end_date)
    : courseDetails?.end_date;

  const currentRoleFlag =
    user?.role_name === ROLES.CompanyManager
      ? courseDetails?.is_company_enrolled
      : courseDetails?.is_private_individual_id_enrolled;
  useEffect(() => {
    if (currentRoleFlag) setIsEnroll(currentRoleFlag);
  }, [currentRoleFlag]);

  const EnrollCourse = async () => {
    const enrollData = {
      ...(user?.role_name === ROLES.CompanyManager
        ? {
            manager_id: CurrentUser?.id?.toString(),
            company_id: ActiveCompany?.company?.id,
          }
        : { private_individual_id: user?.id }),

      course_slug: courseDetails?.slug,
    };
    if (ROLES.CompanyManager === user?.role_name) {
      if (ActiveCompany?.company?.id) {
        const response = await createEnrollCourse(
          `/course/company/enroll`,
          enrollData
        );
        if (!response.error) {
          enrollModal?.closeModal();
          attendeeAddModal.openModal();

          setIsEnroll(true);
        }
      } else {
        AccessModal.openModal();
      }
    } else {
      const response = await createEnrollCourse(
        `/course/company/enroll`,
        enrollData
      );
      if (!response.error) {
        enrollModal?.closeModal();
        attendeeAddModal.openModal();

        setIsEnroll(true);
      }
    }
  };

  const checkCourseSoldOut = () => {
    if (
      courseDetails?.marked_as === CourseMarkAsEnum.SoldOut ||
      courseDetails?.marked_as === CourseMarkAsEnum.TemporarySoldOut
    ) {
      return (
        <p className="enrolled-button">
          {t('CompanyManager.courseCourseSoldOutText')}
        </p>
      );
    }
    if (isCourseCompleted) {
      return (
        <Button className="mt-2 enrolled-button">
          {t('CompanyManager.courseExpiredText')}
        </Button>
      );
    }
    return (
      <Button className="mt-2">{t('CompanyManager.coursePurchaseText')}</Button>
    );
  };

  const AttendeeAdd = () => {
    const activeTab = 1;
    const courseId = 1;
    navigate(`/manager/my-courses/${params.slug}`, {
      state: {
        activeTab,
        courseId,
      },
    });
  };

  return (
    <div className="max-w-[500px] w-full">
      <div className="bg-white rounded-2xl mt-[-220px]">
        <div className="img-wrap h-[285px] w-full rounded-t-2xl overflow-hidden">
          {courseDetails ? (
            <Image
              src={courseDetails.image}
              imgClassName="w-full h-full object-cover"
              serverPath
            />
          ) : (
            ''
          )}
        </div>
        <div className="p-4 pb-5 flex flex-col gap-2.5">
          {isEnroll && courseDetails?.type !== CourseType.Private ? (
            <>
              <h5 className="text-2xl text-dark font-bold leading-[1.3] mb-3">
                {t('CompanyManager.courseDetails.purchasedTitle')}&nbsp;
                {courseDetails?.purchase_date &&
                  format(
                    parseISO(courseDetails?.purchase_date),
                    REACT_APP_DATE_FORMAT as string
                  )}
              </h5>
              <h5 className="text-xl text-dark font-bold leading-[1.3] mb-1">
                {t('CompanyManager.pricePaidTitle')} : {getCurrencySymbol('EUR')}{' '}
                {formatCurrency(Number(courseDetails?.price), 'EUR')}
              </h5>

              {courseDetails?.founded && (
                <Button className="text-secondary text-sm font-medium block">
                  {t('CompanyManager.fundedByTitle')} {courseDetails?.funded_by}
                </Button>
              )}
              {type === 'course' && (
                <div className="flex justify-between gap-1.5">
                  <p className="enrolled-button w-full">
                    {t('CompanyManager.courseEnrolledTitle')}
                  </p>
                  <Button
                    className="w-full"
                    onClickHandler={() => {
                      window.open(
                        `${PRIVATE_NAVIGATION.companyManager.myCourses.list.path}/${courseDetails?.slug}`,
                        '_blank'
                      );
                    }}
                    variants="primary"
                  >
                    {t('CompanyManager.redirectToMyCourse')}
                  </Button>
                </div>
              )}
            </>
          ) : (
            !courseDetailLoader && (
              <>
                {!isEnroll &&
                !isCourseCompleted &&
                courseDetails?.type !== CourseType.Private &&
                courseDetails?.marked_as !== CourseMarkAsEnum.SoldOut &&
                courseDetails?.marked_as !== CourseMarkAsEnum.TemporarySoldOut ? (
                  <>
                    <h5 className="text-[30px] text-dark font-bold leading-[1.3]">
                      {getCurrencySymbol('EUR')}{' '}
                      {formatCurrency(Number(courseDetails?.price), 'EUR')}
                      <Button className="text-xl font-medium">
                        {t('CompanyManager.ParticipantTitle')}
                      </Button>
                    </h5>
                    {user?.role_name !== ROLES.PrivateIndividual && (
                      <Button
                        variants="primary"
                        className="mt-2"
                        onClickHandler={() => enrollModal.openModal()}
                      >
                        {t('CompanyManager.courseDetails.enrollButton')}
                      </Button>
                    )}
                  </>
                ) : (
                  checkCourseSoldOut()
                )}
              </>
            )
          )}
        </div>
      </div>

      {enrollModal?.isOpen && (
        <ConfirmationPopup
          popUpType="success"
          modal={enrollModal}
          bodyText={t('EnrollConfirmation.Description')}
          linkText={t('EnrollConfirmation.LinkText')}
          navigateTo="/"
          variants="primary"
          confirmButtonText={t('EnrollConfirmation.Enroll.button')}
          deleteTitle={t('EnrollConfirmation.Title')}
          confirmButtonFunction={EnrollCourse}
          confirmButtonVariant="primary"
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            enrollModal.closeModal();
          }}
        />
      )}
      {attendeeAddModal.isOpen && (
        <AttendeeModal modal={attendeeAddModal} AttendeeAdd={AttendeeAdd} t={t} />
      )}

      {AccessModal.isOpen &&
        ROLES.CompanyManager === user?.role_name &&
        _.isEmpty(ActiveCompany.company) && (
          <AccessDeniedModal modal={AccessModal} />
        )}
    </div>
  );
};

export default EnrollCourseCard;
