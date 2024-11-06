// **components**
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import CourseFundedDocument from 'modules/CompanyManager/components/courses/CourseFundedDocument';

// **constants**
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';

// **libraries**
import _ from 'lodash';

// **hooks**
import { useQueryGetFunction } from 'hooks/useQuery';
import { SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

// **redux**
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

// **style**
import '../../style/index.css';

// **types**
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { useAxiosPatch } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useTitle } from 'hooks/useTitle';
import { CourseStatus, CourseType } from 'modules/Courses/Constants';
import { isCurrentDateInRange } from 'modules/Courses/helper/CourseCommon';
import { EnumQRCode } from 'modules/Courses/types/survey';
import { StageNameConstant } from 'modules/ProjectManagement_module/enum';
import { Role } from 'types/common';
import { ICourseDetail } from '../Attendance/types';
import ViewCourseLesson from './ViewCourseLesson';
import ViewCourseSideCard from './ViewCourseSideCard';

type viewCourseProps = {
  setCurrentTabTitle?: React.Dispatch<SetStateAction<string>>;
  setCourseBundleId?: React.Dispatch<SetStateAction<number | null>>;
  isTrainerCourse?: boolean;
};
const ViewCourse = ({
  setCurrentTabTitle,
  setCourseBundleId,
  isTrainerCourse,
}: viewCourseProps) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const updateTitle = useTitle();
  const user = useSelector(getCurrentUser);
  const url: URL = new URL(window.location.href);
  const { t } = useTranslation();
  const params = useParams();
  const currentURL = new URL(window.location.href);
  const templateSlug = currentURL.pathname
    .split('/')
    .find((item) => item === 'template');
  const [course, setCourse] = useState<ICourseDetail>();

  const [updateCard, { isLoading: updatingCard }] = useAxiosPatch();
  const dateProposeModal = useModal();

  let apiUrl = '';
  if (user?.role_name === ROLES.Trainer) {
    apiUrl = `/trainer/courses?profile=true&course_slug=${params.slug}&is_invite=true`;
  } else if (templateSlug) {
    apiUrl = `/course/template?getByParentSlug=${params?.slug}`;
  } else {
    apiUrl = `/course?getByParentSlug=${params?.slug}`;
  }

  const { response, isLoading, refetch } = useQueryGetFunction(apiUrl);
  useEffect(() => {
    if (response?.data?.data) {
      setCourse(response?.data?.data[0]);
      setCurrentTabTitle?.(response?.data?.data[0]?.title);
      setCourseBundleId?.(response?.data?.data[0]?.course_bundle_id);
    }
  }, [response]);

  const getBackUrl = (): string => {
    if (user?.role_name === ROLES.Trainer) {
      if (state?.fromDashboard) return '/';
      if (state?.isInvite) return '/courses/invitation';
      if (state?.isAllInvite) return '/courses/all-invitation';

      return `${PRIVATE_NAVIGATION.trainerCourses.view.path}${url.search ?? ''}`;
    }
    if (user?.role_name === ROLES.SalesRep && state?.comingFromCoursePipeline) {
      return PRIVATE_NAVIGATION.coursePipeline.view.path;
    }
    if (
      (user?.role_name === ROLES.SalesRep || user?.role_name === ROLES.Accounting) &&
      !state?.comingFromCoursePipeline
    ) {
      return PRIVATE_NAVIGATION.salesRepCourses.view.path;
    }
    return PRIVATE_NAVIGATION.coursesManagement.courseManagement.path;
  };

  const fundedDocs =
    !_.isEmpty(course?.course_funded_docs) &&
    course?.course_funded_docs?.map((item) => {
      return {
        attachment_url: item.attachment_url,
      };
    });

  const courseAttachments =
    !_.isEmpty(course?.course_attachments) &&
    course?.course_attachments?.map((item) => {
      return {
        attachment_url: item.attachment_url,
        show_trainer: item.show_trainer,
        show_company_manager: item.show_company_manager,
      };
    });

  const roleArray: Role[] = [ROLES.Trainer, ROLES.SalesRep, ROLES.Accounting];

  function hasNonEmptyArray(array?: Array<object>): boolean {
    return Array.isArray(array) && array.length > 0;
  }

  function courseHasResources(course: ICourseDetail | undefined): boolean {
    return (
      hasNonEmptyArray(course?.main_resources) ||
      hasNonEmptyArray(course?.optional_resources) ||
      hasNonEmptyArray(course?.main_rooms_data) ||
      hasNonEmptyArray(course?.optional_rooms_data)
    );
  }

  const hasResource = courseHasResources(course);

  const handleProposedDates = async () => {
    //
    const { error } = await updateCard(`/cards/stage/${course?.card_id}`, {
      stage_id: course?.propose_stage_id,
    });
    if (!error) refetch();
    dateProposeModal.closeModal();
  };

  updateTitle(t('ViewCourse.Title'));
  const topicsAvailable = course?.lessons?.filter((l) => l.topics?.length);
  const isCourseInRange =
    course?.start_date && course?.end_date
      ? isCurrentDateInRange(course?.start_date, course?.end_date)
      : false;

  return (
    <>
      {user?.role_name && roleArray.includes(user?.role_name as Role) ? (
        <PageHeader
          text={t('ViewCourse.Title')}
          small
          url={getBackUrl()}
          passState={{ ...state }}
          className=""
        >
          {course?.status === CourseStatus.publish &&
          user?.role_name === ROLES.Trainer ? (
            <div className="flex justify-end gap-2 flex-wrap">
              <Button
                parentClass="h-fit"
                variants="primary"
                onClickHandler={() => {
                  navigate(`/courses/attendance/${course?.slug}`, {
                    state: {
                      type: course?.type,
                      urlToNavigate: `/trainer/courses/view/${course?.slug}`,
                    },
                  });
                }}
                tooltipText={t('Tooltip.Attendance')}
              >
                <div className="flex gap-2">
                  <Image
                    iconName="calendarCheckIcon"
                    iconClassName="stroke-current w-5 h-5"
                    width={24}
                    height={24}
                  />
                  {t('CoursesManagement.CreateCourse.attendance')}
                </div>
              </Button>

              {isCourseInRange && course?.has_exam ? (
                <Link
                  target="_blank"
                  to={`/qr/${course?.slug}?mode=${EnumQRCode.Exam}`}
                >
                  <Button
                    parentClass="h-fit"
                    variants="primary"
                    tooltipText={t('Tooltip.Exam')}
                  >
                    <div className="flex gap-2">
                      <Image
                        iconName="receiptIcon"
                        iconClassName="stroke-current w-5 h-5"
                        width={24}
                        height={24}
                      />
                      {t('CoursesManagement.CreateCourse.exam')}
                    </div>
                  </Button>
                </Link>
              ) : undefined}

              {!course?.has_exam ? (
                <Link
                  target="_blank"
                  to={`/qr/${course?.slug}?mode=${EnumQRCode.Survey}`}
                >
                  <Button
                    parentClass="h-fit"
                    variants="primary"
                    tooltipText={t('Tooltip.Survey')}
                  >
                    <div className="flex gap-2">
                      <Image
                        iconName="receiptIcon"
                        iconClassName="stroke-current w-5 h-5"
                        width={24}
                        height={24}
                      />
                      {t('SurveyModal.title')}
                    </div>
                  </Button>
                </Link>
              ) : undefined}
            </div>
          ) : undefined}
        </PageHeader>
      ) : (
        ''
      )}

      {course || isLoading ? (
        <CustomCard
          cardClass={isTrainerCourse ? '' : '!shadow-none [&_.card-body]:!p-0'}
          bodyClass={isTrainerCourse ? '' : 'py-4'}
        >
          <>
            {isLoading ? (
              <div className="lazy w-[250px] h-6 mb-2.5 " />
            ) : (
              <div
                className={`tag-list flex flex-wrap justify-between items-center mb-2.5 ${
                  isTrainerCourse ? 'mt-4' : ''
                }`}
              >
                <div className="flex flex-wrap text-secondary gap-1.5 items-center">
                  <Button className="font-medium text-current text-base leading-[1.3]">
                    {course ? course?.courseCategory?.name : ''}
                  </Button>
                  {course?.courseSubCategory?.name ? (
                    <>
                      <Image
                        iconName="arrowRight"
                        iconClassName="w-3.5 h-3.5 text-primary"
                      />
                      <Button className="font-medium text-current text-base leading-[1.3]">
                        {course?.courseSubCategory?.name}
                      </Button>
                    </>
                  ) : (
                    ''
                  )}
                </div>
                {(user?.role_name === ROLES.Admin ||
                  user?.role_name === ROLES.TrainingSpecialist) &&
                course?.status === CourseStatus.draft &&
                course?.type === CourseType.Private &&
                course?.is_proposed_visible ? (
                  <Button
                    variants="primary"
                    onClickHandler={dateProposeModal.openModal}
                    className="font-medium text-base leading-[1.3] text-dark capitalize"
                  >
                    {t('CoursesManagement.ViewCourse.proposeDate')}
                  </Button>
                ) : (
                  ''
                )}
              </div>
            )}

            <div className="flex flex-wrap relative items-center gap-2">
              {isLoading ? (
                <div className="lazy w-2/3 h-6" />
              ) : (
                <div className="text-lg font-medium text-dark leading-[1.2]">
                  {course?.code_title}
                </div>
              )}
              {!isLoading && course?.code_title ? (
                <span className="shrink-0 w-6 border-x border-solid border-borderColor flex items-center justify-center px-1">
                  <Image iconName="arrowRightIcon" iconClassName="" />
                </span>
              ) : (
                ''
              )}
              {!isLoading ? (
                <div
                  className={`${
                    isLoading ? 'lazy ' : ''
                  } text-lg font-medium text-dark leading-[1.2]`}
                >
                  {course ? course?.title : ''}
                </div>
              ) : (
                ''
              )}{' '}
              {!isLoading && course?.progressive_number ? (
                <span className="   text-sm w-fit leading-4 px-2.5 py-1.5 inline-flex items-center justify-center rounded-md  bg-green2/10 text-green2">
                  {course?.progressive_number}
                </span>
              ) : (
                ''
              )}
            </div>

            {(user?.role_name === ROLES.Admin ||
              user?.role_name === ROLES.TrainingSpecialist) &&
            course?.currentStage ? (
              <Button
                className={`${
                  isLoading ? 'lazy w-36 ' : ''
                } relative py-1.5 px-2 pl-10 bg-primary/10 rounded-md flex gap-2 items-center overflow-hidden whitespace-nowrap text-sm text-primary text-left w-fit mt-3`}
              >
                <Image
                  iconName={
                    course?.currentStage === StageNameConstant.DateRequested
                      ? 'clockIcon'
                      : 'checkRoundIcon2'
                  }
                  iconClassName="w-5 h-5 left-2 absolute top-1.5"
                />
                <span className="block truncate">{course?.currentStage}</span>
              </Button>
            ) : (
              ''
            )}

            <div className="mt-8">
              <div className="flex justify-between flex-wrap 991:flex-nowrap gap-x-5 991:gap-y-0 gap-y-7">
                <div className="991:max-w-[400px] w-full">
                  <div
                    className={`${
                      isLoading ? 'lazy' : ''
                    } img-wrap h-[350px] overflow-hidden rounded-xl`}
                  >
                    <Image
                      src={course?.image}
                      imgClassName="w-full h-full object-cover"
                      serverPath
                    />
                  </div>
                </div>
                <ViewCourseSideCard
                  course={course}
                  isLoading={isLoading}
                  user={user}
                />
              </div>
              <div className="content mt-9">
                {!_.isEmpty(course?.course_notes) ? (
                  <div className={`${isLoading ? 'lazy' : ''} flex flex-col gap-5`}>
                    <h3 className="text-[24px] leading-[1.3] font-bold text-dark ">
                      {t('Calendar.eventDetails.notesTitle')}
                    </h3>
                    {course?.course_notes?.map((item, index) => {
                      return (
                        <div key={`notes_${index + 1}`}>
                          <ul className="list-disc pl-5">
                            <li className="font-base leading-[1.75] text-dark/50 font-medium break-all">
                              {item?.content}
                            </li>
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  ''
                )}
              </div>
              <ViewCourseLesson isLoading={isLoading} course={course} />
            </div>

            {user?.role_name !== ROLES.Trainer && (
              <div
                className={`${
                  isLoading ? 'lazy' : ''
                } bg-offWhite2/50 border border-solid border-borderColor rounded-xl mt-9`}
              >
                {course?.certificate_title && !course?.is_external_certificate ? (
                  <>
                    <h3 className="text-[24px] leading-[1.3] font-bold text-dark mb-2.5 p-5   ">
                      {t('CoursesManagement.ViewCourse.certificateDetails')}
                    </h3>
                    <div className="grid gap-3 bg-white py-4 px-5">
                      <div className="">
                        <span className="text-[17px] leading-[20px] font-bold pe-2 text-dark">
                          {t('CoursesManagement.columnHeader.Name')} :
                        </span>
                        <span>{course?.certificate_title}</span>
                      </div>
                      {course?.certificateTemplate?.title ? (
                        <div>
                          <span className="text-[17px] leading-[20px] font-bold pe-2 text-dark">
                            {t('CoursesManagement.ViewCourse.TemplateTitle')} :
                          </span>
                          <span>{course?.certificateTemplate?.title}</span>
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  </>
                ) : (
                  ''
                )}
                {topicsAvailable?.length && !course?.is_external_certificate ? (
                  <div className="p-5 grid gap-3">
                    <h4 className="text-[17px] leading-[20px] font-bold text-dark block">
                      {t('CoursesManagement.ViewCourse.topics')}
                    </h4>
                    <div className="grid gap-3">
                      {(course?.lessons ?? []).map((lesson) => {
                        return (
                          <div
                            className="bg-white rounded-md shadow-sm p-5"
                            key={lesson?.id}
                          >
                            <span className="text-sm font-bold leading-[1.5]">
                              {lesson?.title}
                            </span>
                            {lesson?.topics?.map((topic) => {
                              return (
                                <div className="p-1" key={topic?.id}>
                                  <ul className="list-disc pl-5 font-normal has-ul">
                                    <li
                                      className="font-base leading-[1.75] text-dark/50 font-medium break-all"
                                      key={topic?.id}
                                    >
                                      <div
                                        className="dangerous-html"
                                        dangerouslySetInnerHTML={{
                                          __html: topic?.topic,
                                        }}
                                      />
                                    </li>
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>
            )}

            {user?.role_name !== ROLES.Trainer && hasResource ? (
              <div
                className={`${
                  isLoading ? 'lazy' : ''
                } bg-offWhite2/50 border border-solid border-borderColor rounded-xl mt-9`}
              >
                <h3 className="text-[24px] leading-[1.3] font-bold text-dark p-5 pb-2">
                  {t('CoursesManagement.ViewCourse.ResourceDetails')}
                </h3>

                <div className="p-5">
                  <div className="grid lg:grid-cols-2 gap-5 items-start">
                    {Array.isArray(course?.main_resources) &&
                    (course?.main_resources ?? []).length > 0 ? (
                      <table className="border border-collapse border-borderColor w-full bg-white">
                        <thead>
                          <tr className="bg-offWhite3">
                            <th className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-bold text-dark">
                              {t('CoursesManagement.ViewCourse.mainResourceTitle')}
                            </th>
                            <th className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-bold text-dark">
                              {t(
                                'CoursesManagement.ViewCourse.mainResourceQuantity'
                              )}
                            </th>
                          </tr>
                        </thead>
                        {course?.main_resources?.map((resource) => {
                          return (
                            <tbody key={resource?.resource_id}>
                              <tr>
                                <td className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-normal text-dark">
                                  {resource?.title}
                                </td>
                                <td className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-normal text-dark">
                                  {resource?.quantity}
                                </td>
                              </tr>
                            </tbody>
                          );
                        })}
                      </table>
                    ) : (
                      ''
                    )}

                    {Array.isArray(course?.optional_resources) &&
                    (course?.optional_resources ?? []).length > 0 ? (
                      <table className="border border-collapse border-borderColor w-full bg-white">
                        <thead>
                          <tr className="bg-offWhite3">
                            <th className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-bold text-dark">
                              {t(
                                'CoursesManagement.ViewCourse.optionalResourceTitle'
                              )}
                            </th>
                            <th className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-bold text-dark">
                              {t(
                                'CoursesManagement.ViewCourse.optionalResourceQuantity'
                              )}
                            </th>
                          </tr>
                        </thead>
                        {course?.optional_resources?.map((resource) => {
                          return (
                            <tbody key={resource?.resource_id}>
                              <tr>
                                <td className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-normal text-dark">
                                  {resource?.title}
                                </td>
                                <td className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-normal text-dark">
                                  {resource?.quantity}
                                </td>
                              </tr>
                            </tbody>
                          );
                        })}
                      </table>
                    ) : (
                      ''
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid lg:grid-cols-2 gap-5 items-start">
                    {Array.isArray(course?.main_rooms_data) &&
                    (course?.main_rooms_data ?? []).length > 0 ? (
                      <table className="border border-collapse border-borderColor w-full bg-white">
                        <thead>
                          <tr className="bg-offWhite3">
                            <th className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-bold text-dark">
                              {t('CoursesManagement.ViewCourse.MainRooms')}
                            </th>
                            <th className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-bold text-dark">
                              {t('CoursesManagement.CreateCourse.maxParticipants')}
                            </th>
                          </tr>
                        </thead>
                        {course?.main_rooms_data?.map((room) => {
                          return (
                            <tbody key={room?.id}>
                              <tr>
                                <td className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-normal text-dark">
                                  {room?.title}
                                </td>
                                <td className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-normal text-dark">
                                  {room?.maximum_participate}
                                </td>
                              </tr>
                            </tbody>
                          );
                        })}
                      </table>
                    ) : (
                      ''
                    )}

                    {Array.isArray(course?.optional_rooms_data) &&
                    (course?.optional_rooms_data ?? []).length > 0 ? (
                      <table className="border border-collapse border-borderColor w-full bg-white">
                        <thead>
                          <tr className="bg-offWhite3">
                            <th className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-bold text-dark">
                              {t('CoursesManagement.ViewCourse.OptionalRooms')}
                            </th>
                            <th className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-bold text-dark">
                              {t('CoursesManagement.CreateCourse.maxParticipants')}
                            </th>
                          </tr>
                        </thead>
                        {course?.optional_rooms_data?.map((room) => {
                          return (
                            <tbody key={room?.id}>
                              <tr>
                                <td className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-normal text-dark">
                                  {room?.title}
                                </td>
                                <td className="text-[16px] leading-[18px] text-left p-3 border border-borderColor font-normal text-dark">
                                  {room?.maximum_participate}
                                </td>
                              </tr>
                            </tbody>
                          );
                        })}
                      </table>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
            ) : (
              ''
            )}

            {fundedDocs && !_.isEmpty(fundedDocs) && (
              <CourseFundedDocument courseFundedDocs={fundedDocs} />
            )}

            {courseAttachments && !_.isEmpty(courseAttachments) && (
              <CourseFundedDocument
                className="mt-2"
                header={t('CompanyManager.courseDetails.CourseAttachment')}
                courseFundedDocs={courseAttachments}
              />
            )}

            {(course?.exam ?? []).length > 0 && (
              <div className="mt-9">
                <h3
                  className={`${
                    isLoading ? 'lazy' : ''
                  } text-[24px] leading-[1.3] font-bold text-dark mb-6`}
                >
                  {t('ViewCourse.mcq')}
                </h3>
                <span className={`${isLoading ? 'lazy' : ''} block mb-2`}>
                  <span>{t('CoursesManagement.ViewCourse.passingMarks')}</span>
                  <span className="px-2">{course?.exam[0]?.passing_marks} %</span>
                </span>
                <div className="flex flex-col gap-4">
                  {course?.exam[0]?.questions?.map((data) => {
                    return (
                      <div
                        key={data?.id}
                        className={`${
                          isLoading ? 'lazy' : ''
                        } p-5 rounded-xl bg-offWhite2/50 border border-solid border-borderColor`}
                      >
                        <div className="flex flex-wrap mb-4">
                          <div className="max-w-[calc(100%_-_150px)] pe-5 w-full">
                            <p className="text-base font-semibold">
                              {data?.question}
                            </p>
                          </div>
                          <div className="max-w-[150px] w-full">
                            <div className="flex items-center justify-end text-right text-dark/50 text-base font-medium">
                              {t('CoursesManagement.CreateCourse.marksPlaceHolder')}
                              :&nbsp;
                              <Button className="text-dark text-xl font-semibold inline-block">
                                {data?.marks}
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                          {data?.answers?.map((answer, index) => {
                            return (
                              <div
                                className={`border border-solid ${
                                  answer?.is_correct
                                    ? 'border-green3 bg-green3/10'
                                    : 'border-borderColor bg-white'
                                } rounded-xl flex items-center`}
                                key={answer?.id}
                              >
                                <div
                                  className={`w-10 min-h-10 h-full rounded-lg uppercase ${
                                    answer?.is_correct
                                      ? 'bg-green3'
                                      : 'bg-grayText/50'
                                  } flex items-center justify-center font-semibold text-xl`}
                                >
                                  {String.fromCharCode(65 + index)}
                                </div>
                                <div className="flex-[1_0_0%] px-4 py-1">
                                  <p className="text-sm text-dark font-medium">
                                    {answer?.answer}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        </CustomCard>
      ) : (
        ''
      )}

      {!isLoading && !course ? <NoDataFound message={t('Table.noDataFound')} /> : ''}
      {dateProposeModal.isOpen && (
        <ConfirmationPopup
          modal={dateProposeModal}
          bodyText={t('CoursesManagement.ViewCourse.proposeDateBody')}
          popUpType="primary"
          confirmButtonText={t('CoursesManagement.confirm')}
          deleteTitle={t('CoursesManagement.ViewCourse.proposeDateTitle')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            dateProposeModal.closeModal();
          }}
          confirmButtonFunction={handleProposedDates}
          isLoading={updatingCard}
        />
      )}
    </>
  );
};

export default ViewCourse;
