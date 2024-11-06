// ** Components **
import Button from 'components/Button/Button';
import ErrorMessage from 'components/FormElement/ErrorMessage';
import Image from 'components/Image';
import BundleTrainerModal from 'modules/Courses/components/CourseBundle/BundleTrainerModal';

// ** Hooks **
import { useAxiosGet } from 'hooks/useAxios';
import { useToggleDropdown } from 'hooks/useToggleDropdown';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Constants **
import { TrainerSelected } from 'modules/Courses/Constants';

// ** Types **
import { ICourseTrainer } from 'modules/Courses/types';
import { CourseBundleInterface } from 'modules/Courses/types/TemplateBundle';
import { Trainer } from 'modules/Courses/types/TrainersAndRooms';
import { SetFieldValue } from 'types/common';

export interface BundleTrainersProps {
  values: CourseBundleInterface;
  isLoading?: boolean;
  course_slug: string;
  dates?: Array<string>;
  setFieldValue?: SetFieldValue;
  timeSlots?: Array<string>;
}
const BundleTrainers = ({
  values,
  dates,
  isLoading,
  course_slug,
  setFieldValue,
  timeSlots,
}: BundleTrainersProps) => {
  const { t } = useTranslation();

  // ** Modals
  const mainTrainerModal = useToggleDropdown();
  const optionalTrainerModal = useToggleDropdown();

  // ** States
  const [trainersData, setTrainersData] = useState<Array<Trainer>>([]);

  // ** CONSTs
  const {
    other: { main_trainers = [], optional_trainers = [], isErrorInTrainer },
    courses,
  } = values || {};

  const mainTrainersSet = new Set((main_trainers ?? []).map((t) => t.assigned_to));
  const optionalTrainersSet = new Set(
    (optional_trainers ?? []).map((t) => t.assigned_to)
  );
  const allAssignedTrainers = [...mainTrainersSet, ...optionalTrainersSet];

  const lessonSessionTrainers = (courses ?? []).flatMap((course) =>
    course.lesson.flatMap((l) =>
      l.session.flatMap((s) => (s.assigned_to ? [s.assigned_to] : []))
    )
  );
  const isUnavailableSelectedInMain = trainersData?.some(
    (t) =>
      t.selected_status === TrainerSelected.Unavailable && mainTrainersSet.has(t.id)
  );

  const isUnavailableSelectedInOptional = trainersData?.some(
    (t) =>
      t.selected_status === TrainerSelected.Unavailable &&
      optionalTrainersSet.has(t.id)
  );

  const generateDataObject = (
    trainers: Array<Trainer> | undefined,
    trainerSet: Set<number>,
    lessonTrainerSet: Set<number>
  ): Array<Trainer> => {
    return (trainers ?? [])?.filter(
      (trainer) => !trainerSet.has(trainer?.id) && !lessonTrainerSet.has(trainer?.id)
    );
  };

  const mainData = generateDataObject(
    trainersData,
    optionalTrainersSet,
    new Set(lessonSessionTrainers)
  );
  const optionalData = generateDataObject(
    trainersData,
    mainTrainersSet,
    new Set(lessonSessionTrainers)
  );

  useEffect(() => {
    if ((dates ?? []).filter(Boolean).length > 0) getDateWiseTrainer();
  }, [timeSlots]);

  // ** APIs
  const [getTrainers, { isLoading: isTrainerLoading }] = useAxiosGet();

  const getDateWiseTrainer = async () => {
    const { data, error } = await getTrainers('/trainer/with-filters', {
      params: {
        course_slug,
        dates: (dates ?? []).filter(Boolean).join(','),
        ...(allAssignedTrainers?.filter(Boolean)?.length > 0
          ? {
              allAssignedTrainers: allAssignedTrainers.join(','),
            }
          : {}),
        timeSlot: timeSlots?.filter((ts) => ts?.trim())?.toString(),
        view: true,
      },
    });
    if (!error && Array.isArray(data)) {
      setTrainersData(data);
    }
  };

  const filterAndSet = (
    trainers: Array<ICourseTrainer>,
    dataId: number,
    fieldName: string
  ) => {
    const dataToSet = trainers?.filter((t) => t.assigned_to !== dataId);
    setFieldValue?.(fieldName, dataToSet);
  };

  useEffect(() => {
    setFieldValue?.(
      'other.isErrorInTrainer',
      isUnavailableSelectedInOptional || isUnavailableSelectedInMain
    );
  }, [isUnavailableSelectedInMain, isUnavailableSelectedInOptional]);
  return (
    <div className="bg-primaryLight rounded-xl px-9 pb-8 pt-5 mt-4">
      <p className="text-base text-dark font-semibold mb-4">
        {t('Calendar.filterTabs.trainersTitle')}
      </p>
      <div className="flex flex-wrap gap-y-7 gap-x-4 w-full relative z-1">
        {/* ***************************   MAIN TRAINERS   *************************** */}
        <div
          ref={mainTrainerModal.dropdownRef}
          className="relative z-0 flex-[1_0_0%] "
        >
          <p className="text-sm text-dark mb-2">
            {t('CoursesManagement.CreateCourse.mainTrainers')}
            <span className="text-red-700">*</span>
          </p>
          {isTrainerLoading ? (
            <div className="lazy h-12 " />
          ) : (
            <Button
              disabled={isLoading}
              onClickHandler={mainTrainerModal.toggleDropdown}
              className="border border-borderColor w-full py-3 px-4 bg-white rounded-[10px] mb-2 flex items-center justify-between"
            >
              <span className="text-grayText text-sm font-normal ">
                {t('CoursesManagement.CreateCourse.selectMainTrainers')}
              </span>
              <Image
                iconName="downArrow"
                iconClassName="w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
          )}

          {mainTrainerModal.isDropdownOpen ? (
            <BundleTrainerModal
              response={mainData}
              name="other.main_trainers"
              selectedValues={main_trainers}
            />
          ) : (
            ''
          )}
          <div className="flex flex-wrap gap-4 pt-2">
            {(mainData ?? [])
              .filter((item) => [...mainTrainersSet]?.includes(item?.id))
              .map((data, index) => (
                <div
                  className="flex items-center gap-x-2.5 py-2.5 px-3 bg-primary/10 rounded-lg"
                  key={`multi_${index + 1}`}
                >
                  <span className="text-sm text-primary leading-5 inline-block">
                    {data.name}
                  </span>

                  {data?.selected_status === TrainerSelected.Unavailable ? (
                    <Button parentClass="h-fit">
                      <Image
                        iconName="redExclamationMarkIcon"
                        iconClassName="w-5 h-5"
                        width={24}
                        height={24}
                      />
                    </Button>
                  ) : (
                    ''
                  )}
                  <Button
                    onClickHandler={() =>
                      filterAndSet(
                        main_trainers ?? [],
                        data?.id,
                        'other.main_trainers'
                      )
                    }
                    parentClass="h-fit"
                    className="trainer-remove-icon"
                  >
                    <Image iconName="crossIcon" iconClassName="w-full h-full" />
                  </Button>
                </div>
              ))}
          </div>
          <ErrorMessage name="other.main_trainers" />
          {isErrorInTrainer && isUnavailableSelectedInMain ? (
            <ErrorMessage name="other.isErrorInTrainer" />
          ) : (
            ''
          )}
        </div>
        {/* ***************************   MAIN TRAINERS   *************************** */}

        {/* *************************** OPTIONAL TRAINERS *************************** */}
        <div
          ref={optionalTrainerModal.dropdownRef}
          className="relative z-0 flex-[1_0_0%] "
        >
          <p className="text-sm text-dark mb-2">
            {t('CoursesManagement.CreateCourse.optionalTrainers')}
          </p>
          {isTrainerLoading ? (
            <div className="lazy h-12 " />
          ) : (
            <Button
              disabled={isLoading}
              onClickHandler={optionalTrainerModal.toggleDropdown}
              className="border border-borderColor w-full py-3 px-4 bg-white rounded-[10px] mb-2 flex items-center justify-between"
            >
              <span className="text-grayText text-sm font-normal ">
                {t('CoursesManagement.CreateCourse.selectOptionalTrainers')}
              </span>
              <Image
                iconName="downArrow"
                iconClassName="w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
          )}

          {optionalTrainerModal.isDropdownOpen ? (
            <BundleTrainerModal
              response={optionalData}
              name="other.optional_trainers"
              selectedValues={optional_trainers}
            />
          ) : (
            ''
          )}
          <div className="flex flex-wrap gap-4 pt-2">
            {(optionalData ?? [])
              .filter((item) => [...optionalTrainersSet]?.includes(item?.id))
              .map((data, index) => (
                <div
                  className="flex items-center gap-x-2.5 py-2.5 px-3 bg-primary/10 rounded-lg"
                  key={`multi_${index + 1}`}
                >
                  <span className="text-sm text-primary leading-5 inline-block">
                    {data.name}
                  </span>
                  {data?.selected_status === TrainerSelected.Unavailable ? (
                    <Button parentClass="h-fit">
                      <Image
                        iconName="redExclamationMarkIcon"
                        iconClassName="w-5 h-5"
                        width={24}
                        height={24}
                      />
                    </Button>
                  ) : (
                    ''
                  )}
                  <Button
                    onClickHandler={() =>
                      filterAndSet(
                        optional_trainers ?? [],
                        data?.id,
                        'other.optional_trainers'
                      )
                    }
                    parentClass="h-fit"
                    className="trainer-remove-icon"
                  >
                    <Image iconName="crossIcon" iconClassName="w-full h-full" />
                  </Button>
                </div>
              ))}
          </div>
          <ErrorMessage name="other.optional_trainers" />
          {isErrorInTrainer && isUnavailableSelectedInOptional ? (
            <ErrorMessage name="other.isErrorInTrainer" />
          ) : (
            ''
          )}
        </div>
        {/* *************************** OPTIONAL TRAINERS *************************** */}
      </div>
    </div>
  );
};

export default BundleTrainers;
