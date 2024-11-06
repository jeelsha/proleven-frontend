// ** components **
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import { useModal } from 'hooks/useModal';
import { RejectModal } from 'modules/CompanyManager/components/RejectModal';

// ** constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

// ** imports **
import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// ** hooks **
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { courseProposedDateAction } from 'modules/CompanyManager/constants';

// ** styles **
import 'modules/CompanyManager/style/companyManager.css';

// ** types **
import {
  CourseLessonSession,
  CourseStagesTrackProps,
  CourseTrackProps,
} from 'modules/CompanyManager/types';

// ** redux **
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { REACT_APP_DATE_FORMAT } from 'config';
import { StageNameConstant } from 'modules/ProjectManagement_module/enum';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import AttendeeModal from './AttendeeModal';
import { COURSE_TYPE } from 'modules/Courses/Constants';

const TrackCourse = () => {
  const { state } = useLocation();
  const { t } = useTranslation();
  const [companyManagerGetApi] = useAxiosGet();
  const [companyManagerCreateApi, { isLoading: isAccepting }] = useAxiosPost();
  const params = useParams();
  const courseAcceptedModal = useModal();
  const attendeeAddModal = useModal();
  const courseRejectedModal = useModal();
  const navigate = useNavigate();
  const { language } = useSelector(useLanguage);
  const slugValue = params.slug;

  const [courseDetails, setCourseDetails] = useState<CourseTrackProps>();
  const [reloadData, setReloadData] = useState(false);
  const CourseDetail = async () => {
    const { data } = await companyManagerGetApi(`/course/track/${slugValue}`);
    setCourseDetails(data);
  };

  useEffect(() => {
    CourseDetail();
  }, [reloadData, language]);

  const sortedTimelineData = courseDetails?.stages
    ?.slice()
    .sort((a, b) => a.order - b.order);
  const topThreeStages = sortedTimelineData?.slice(0, 4);
  const findStage = sortedTimelineData?.find(
    (stage) => stage.id === courseDetails?.currentStage
  );
  const courseStagesData =
    findStage?.name === StageNameConstant.CoursesStandby
      ? topThreeStages
          ?.filter(
            (stageData) => stageData.name === StageNameConstant.CoursesStandby
          )
          ?.map((item: CourseStagesTrackProps) => ({
            text: item.stage_title,
            date: item.card_stage_logs[0] ? item.card_stage_logs[0].created_at : '',
            order: item.order,
          }))
      : topThreeStages
          ?.filter(
            (stageData) => stageData.name !== StageNameConstant.CoursesStandby
          )
          ?.map((item: CourseStagesTrackProps) => ({
            text: item.stage_title,
            date: item.card_stage_logs[0] ? item.card_stage_logs[0].created_at : '',
            order: item.order,
          }));
  const AcceptCourse = async () => {
    const response = await companyManagerCreateApi(
      `/course/action/proposed-date/${slugValue}`,
      { action: courseProposedDateAction.accept }
    );
    if (!response?.error) {
      attendeeAddModal.openModal();
      courseAcceptedModal?.closeModal();
      CourseDetail();
      setReloadData((prev) => !prev);
    }
  };

  const AttendeeAdd = () => {
    const activeTab = 1;
    const courseId = courseDetails?.course?.id;
    navigate(`/manager/my-courses/${slugValue}`, {
      state: {
        activeTab,
        courseId,
        courseType: COURSE_TYPE.Private,
      },
    });
  };

  return (
    <section className="mt-5">
      <div className="container">
        <PageHeader
          small
          text="Track Course"
          url={PRIVATE_NAVIGATION.companyManager.myCourses.list.path}
          passState={{ ...state }}
        />
        <CustomCard minimal>
          <div className="flex flex-wrap -mx-4">
            <div className="w-1/2 px-4">
              <div className="bg-primaryLight p-5 rounded-lg">
                {courseDetails?.course?.image ? (
                  <div className="w-full h-[424px] mb-2">
                    <Image
                      imgClassName="w-full h-full object-cover rounded-lg"
                      src={courseDetails?.course?.image ?? '/images/no-image.png'}
                      alt={courseDetails?.course?.title}
                      serverPath
                    />
                  </div>
                ) : (
                  <div className="lazy w-full h-[424px] mb-2" />
                )}

                <p className="text-[22px] mt-6 font-bold leading-[1.25] mb-4">
                  {courseDetails?.course?.title}
                </p>
                <div className="flex flex-col gap-3 last:before:hidden before:absolute before:content-[''] before:h-full before:left-[11px] before:top-1 before:border before:border-solid before:border-borderColor">
                  <p className="text-md leading-5 font-semibold">
                    {t('CompanyManager.AttendeeList.categoryTitle')}&nbsp;
                    <Button className="font-normal">
                      {courseDetails?.course?.courseCategory?.name}
                    </Button>
                  </p>
                  <p className="text-md leading-5 font-semibold">
                    {t('CompanyManager.AttendeeList.subCategoryTitle')}&nbsp;
                    <Button className="font-normal">
                      {courseDetails?.course?.courseSubCategory?.name}
                    </Button>
                  </p>
                  <p className="text-md leading-5 font-semibold">
                    {t('CompanyManager.AttendeeList.courseCodeTitle')}&nbsp;
                    <Button className="font-normal">
                      {courseDetails?.course?.title}
                    </Button>
                  </p>
                </div>
              </div>
            </div>
            <div className="w-1/2 px-4">
              <div className="ps-7">
                <p className="text-2xl font-bold">
                  {t('CompanyManager.trackCourse.trackingTitle')}
                </p>
                <div className="mt-8">
                  <ul className="flex flex-col justify-between">
                    {courseStagesData?.map((item, index: number) => (
                      <li key={`courseStage_${index + 1}`} className="stages-list">
                        <Button
                          className={`stage-list-button ${
                            item.date
                              ? 'bg-primary2  ring-primary2/30'
                              : 'bg-navText ring-navText/30'
                          } `}
                        />
                        <p className="text-current text-dark font-semibold">
                          {item?.text}
                        </p>
                        <p className="text-current text-navText">
                          {item?.date && (
                            <span>
                              {format(
                                new Date(item?.date),
                                REACT_APP_DATE_FORMAT as string
                              )}
                              <Button className="mx-2 inline-block">|</Button>
                              {t('CompanyManager.trackCourse.AtTitle')}&nbsp;
                              {item?.date && format(new Date(item?.date), 'h:mm a')}
                            </span>
                          )}
                        </p>
                        {item?.order === 2 &&
                          courseDetails?.course?.start_date &&
                          courseDetails?.course?.end_date && (
                            <>
                              <p className="text-current text-base font-medium text-dark leading-5 gap-1">
                                {t(
                                  'CompanyManager.trackCourse.modal.proposedDateTitle'
                                )}
                              </p>
                              <div className="flex flex-col border-t border-solid border-gray-200 mb-5">
                                {courseDetails?.course?.lessons?.map(
                                  (lesson, index) => {
                                    return (
                                      <div
                                        className="flex py-3 px-2 border-b border-solid border-gray-200"
                                        key={`${index + 1}_lesson`}
                                      >
                                        <div className="flex w-full">
                                          <span className="font-semibold block text-sm w-28 after:mx-3 after:opacity-20 after:content-['|']">
                                            {format(
                                              parseISO(lesson?.date),
                                              REACT_APP_DATE_FORMAT as string
                                            )}
                                          </span>
                                          <div className="flex-1">
                                            <span className="text-sm block flex-1 font-medium text-black/70">
                                              {lesson?.title}
                                            </span>
                                            <div className="">
                                              {lesson?.lesson_sessions?.map(
                                                (
                                                  sessions: CourseLessonSession,
                                                  index: number
                                                ) => {
                                                  return (
                                                    <div
                                                      className="flex items-center mt-2 pt-2 border-t border-solid border-gray-200"
                                                      key={`${index + 1}_session`}
                                                    >
                                                      <span className="block text-xs font-medium text-black">
                                                        Session :{' '}
                                                      </span>
                                                      <span className="block text-xs font-medium text-black/50">
                                                        {sessions?.start_time &&
                                                          format(
                                                            parseISO(
                                                              sessions?.start_time
                                                            ),
                                                            'hh:mm a'
                                                          )}{' '}
                                                        -{' '}
                                                        {sessions?.end_time &&
                                                          format(
                                                            parseISO(
                                                              sessions?.end_time
                                                            ),
                                                            'hh:mm a'
                                                          )}
                                                      </span>
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </>
                          )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {courseStagesData?.map(
                (item, index: number) =>
                  item.order === 2 &&
                  item.date &&
                  findStage?.name === StageNameConstant.DateProposed && (
                    <div
                      className="flex justify-end gap-2"
                      key={`buttons_${index + 1}`}
                    >
                      <Button
                        className=""
                        variants="green"
                        onClickHandler={() => courseAcceptedModal?.openModal()}
                      >
                        {t('CompanyManager.trackCourse.modal.acceptTitle')}
                      </Button>
                      <Button
                        className=""
                        variants="danger"
                        onClickHandler={() => courseRejectedModal?.openModal()}
                      >
                        {t('CompanyManager.trackCourse.modal.rejectTitle')}
                      </Button>
                    </div>
                  )
              )}
            </div>
          </div>
        </CustomCard>
        {courseAcceptedModal.isOpen && (
          <ConfirmationPopup
            popUpType="success"
            modal={courseAcceptedModal}
            variants="primary"
            confirmButtonText={t('CompanyManager.trackCourse.modal.acceptTitle')}
            // bodyText={t('trackCourseAcceptText')}
            deleteTitle={t('CompanyManager.trackCourse.acceptModal.title')}
            confirmButtonFunction={AcceptCourse}
            confirmButtonVariant="primary"
            cancelButtonText={t('Button.cancelButton')}
            cancelButtonFunction={() => {
              courseAcceptedModal.closeModal();
            }}
            isLoading={isAccepting}
          />
        )}
        {courseRejectedModal.isOpen && (
          <RejectModal
            setReloadData={setReloadData}
            modal={courseRejectedModal}
            courseSlug={slugValue}
          />
        )}
        {attendeeAddModal.isOpen && (
          <AttendeeModal modal={attendeeAddModal} AttendeeAdd={AttendeeAdd} t={t} />
        )}
      </div>
    </section>
  );
};
export default TrackCourse;
