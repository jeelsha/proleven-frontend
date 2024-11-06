import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { AssignedTrainerCourse, LessonSessionApproval } from './types';
import { REACT_APP_DATE_FORMAT } from 'config';

type ICourseTrainerAssignProps = {
  showAssignedTrainers: AssignedTrainerCourse | undefined;
};

const AssignedCourseTrainers = ({
  showAssignedTrainers,
}: ICourseTrainerAssignProps) => {
  const { t } = useTranslation();
  const getTrainerType = (item: LessonSessionApproval) => {
    if (!item.is_full_course) return t('ExtraTrainer');
    if (item.is_optional) return t('OptionalTrainer');
    return t('MainTrainer');
  };

  return (
    <div className="bg-[#F3F3F5] p-5 rounded-xl mb-5">
      <CustomCard
        cardClass="!shadow-none border border-solid border-gray-300/70"
        title={t('assignedTrainers')}
        minimal
      >
        <div>
          <div className="grid 1200:grid-cols-3 grid-cols-1 gap-4">
            {showAssignedTrainers?.lessons?.map((lesson) =>
              lesson?.lesson_sessions?.map((sessionTrainer, k) => {
                return (
                  <div
                    key={`${k + 1}_item`}
                    className="p-4 rounded-lg bg-[#F3F3F5] text-sm grid content-start gap-4 shadow-md"
                  >
                    <div>
                      <p className="font-bold">
                        {t('Calendar.eventDetails.sessionTitle')} ({lesson?.title}):{' '}
                      </p>
                      <div className="flex flex-row gap-3 flex-wrap pt-2">
                        <p className="text-sm leading-4 text-dark flex items-center">
                          <Button className="w-[18px] h-[18px] inline-block me-1.5 opacity-50">
                            <Image
                              iconName="calendarIcon2"
                              iconClassName="w-full h-full"
                            />
                          </Button>
                          {sessionTrainer?.start_time
                            ? `${format(
                              new Date(sessionTrainer?.start_time),
                              (REACT_APP_DATE_FORMAT as string)
                            )}`
                            : ''}
                        </p>
                        <p className="text-sm leading-4 text-dark flex items-center">
                          <Button className="w-[18px] h-[18px] inline-block me-1.5 opacity-50">
                            <Image
                              iconName="clockIcon"
                              iconClassName="w-full h-full"
                            />
                          </Button>
                          {sessionTrainer?.start_time
                            ? `${format(
                              new Date(sessionTrainer?.start_time),
                              'hh:mm a'
                            )}`
                            : ''}
                          -
                          {sessionTrainer?.end_time
                            ? `${format(
                              new Date(sessionTrainer?.end_time),
                              'hh:mm a'
                            )}`
                            : ''}
                        </p>
                      </div>
                    </div>
                    {sessionTrainer?.lessonSessionApproval
                      ?.filter((data) => data?.assigned_to_status === 'accepted')
                      ?.map((item, i) => {
                        return (
                          <div
                            key={`${i + 1}_data`}
                            className="w-full flex items-center gap-2"
                          >
                            {`${item?.assignedToUser?.first_name} ${item?.assignedToUser?.last_name}`}{' '}
                            {item.available ? (
                              ''
                            ) : (
                              <Button
                                parentClass="h-fit"
                                tooltipText={t('trainerAbsent')}
                                tooltipPosition="top"
                              >
                                <Image
                                  iconName="redExclamationMarkIcon"
                                  iconClassName="shrink-0"
                                />
                              </Button>
                            )}
                            <StatusLabel
                              className="ml-auto shrink-0"
                              text={getTrainerType(item)}
                              variants="secondary"
                            />
                          </div>
                        );
                      })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CustomCard>
    </div>
  );
};

export default AssignedCourseTrainers;
