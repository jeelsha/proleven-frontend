// ** Components **
import Button from 'components/Button/Button';
import ErrorMessage from 'components/FormElement/ErrorMessage';
import Image from 'components/Image';
import TrainerModal from 'modules/Courses/components/Management/TrainerModal';

// ** Hooks **
import { useAxiosGet } from 'hooks/useAxios';
import { useToggleDropdown } from 'hooks/useToggleDropdown';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Types **
import { TrainerSelected } from 'modules/Courses/Constants';
import { ICourseTrainer } from 'modules/Courses/types';
import {
  Trainer,
  TrainerRoomInfoProps,
} from 'modules/Courses/types/TrainersAndRooms';

// ** utils **
import { Link } from 'react-router-dom';
import { shouldDisableField } from 'utils';

const TrainersInfo = ({
  values,
  dates,
  lessonTime,
  fieldsToTranslate,
  currentLanguage,
  defaultLanguage,
  isLoading,
  setIsMainLoading,
  setFieldValue,
  lessonTrainers,
  locations,
}: TrainerRoomInfoProps) => {
  const { t } = useTranslation();

  // ** Modals
  const mainTrainerModal = useToggleDropdown();
  const optionalTrainerModal = useToggleDropdown();

  // ** States
  const [trainersData, setTrainersData] = useState<Array<Trainer>>([]);

  // ** CONSTs
  const {
    main_trainers = [],
    optional_trainers = [],
    category_id: categorySlug,
    isErrorInTrainer,
  } = values?.course || {};
  const mainTrainersSet = new Set((main_trainers ?? []).map((t) => t.assigned_to));
  const optionalTrainersSet = new Set(
    (optional_trainers ?? []).map((t) => t.assigned_to)
  );
  const allAssignedTrainers = [...mainTrainersSet, ...optionalTrainersSet];
  const currentURL = new URL(window.location.href);
  const course_slug = currentURL.searchParams.get('slug');

  const lessonTrainer = values.lesson.flatMap((l) =>
    l.session.flatMap((s) => (s.assigned_to ? [s.assigned_to] : []))
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

  const currentLocations = [...new Set(locations)];
  const hasUniqueLocations = currentLocations?.length !== 1;

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
    new Set(lessonTrainer)
  );
  const optionalData = generateDataObject(
    trainersData,
    mainTrainersSet,
    new Set(lessonTrainer)
  );

  // ** APIs
  const [getTrainers, { isLoading: isTrainerLoading }] = useAxiosGet();
  const getDateWiseTrainer = async () => {
    const newLocation = currentLocations.filter(Boolean).join(',');
    const { data, error } = await getTrainers('/trainer/with-filters', {
      params: {
        course_slug,
        dates: (dates ?? []).filter((i) => i).join(','),
        ...(allAssignedTrainers?.length > 0
          ? {
              allAssignedTrainers: allAssignedTrainers.join(','),
            }
          : {}),
        categorySlug,
        timeSlot: lessonTime?.toString(),
        view: true,
        ...(!hasUniqueLocations && newLocation ? { location: newLocation } : {}),
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

  const isDisabled = (val: string) =>
    shouldDisableField(val, fieldsToTranslate, currentLanguage, defaultLanguage);

  // ** useEffects
  useEffect(() => {
    if ((dates ?? []).length > 0) getDateWiseTrainer();
  }, [dates]);
  useEffect(() => {
    if ((lessonTime ?? []).length > 0 && (dates ?? []).length > 0) {
      getDateWiseTrainer();
    }
  }, [lessonTime]);

  useEffect(() => {
    setIsMainLoading?.(isTrainerLoading);
  }, [isTrainerLoading]);

  useEffect(() => {
    setFieldValue?.(
      'course.isErrorInTrainer',
      isUnavailableSelectedInOptional || isUnavailableSelectedInMain
    );
  }, [isUnavailableSelectedInMain, isUnavailableSelectedInOptional]);

  return (
    <div className="bg-primaryLight rounded-xl 1024:px-9 px-4 pb-8 pt-5">
      <div className="flex items-center gap-4 mb-4 justify-between">
        <p className="text-base text-dark font-semibold">
          {t('Calendar.filterTabs.trainersTitle')}
        </p>
        <div className="grid gap-y-7 gap-x-4">
          <Link target="_blank" to="/users/trainer">
            <Button className="cursor-pointer text-base text-primary underline underline-offset-4 inline-block">
              {t('CoursesManagement.CreateCourse.viewTrainer')}
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-y-7 gap-x-4 w-full relative z-1">
        {/* ***************************   MAIN TRAINERS   *************************** */}
        {isTrainerLoading ? (
          <div className="lazy h-[50px] relative z-0 flex-[1_0_0%]" />
        ) : (
          <div
            ref={mainTrainerModal.dropdownRef}
            className="relative z-0 flex-[1_0_0%] "
          >
            <p className="text-sm text-dark mb-2">
              {t('CoursesManagement.CreateCourse.mainTrainers')}
              <span className="text-red-700">*</span>
            </p>
            <Button
              disabled={isDisabled('') || isLoading}
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

            {mainTrainerModal.isDropdownOpen ? (
              <TrainerModal
                values={values}
                response={mainData}
                name="course.main_trainers"
                selectedValues={main_trainers}
                isLessonWiseTrainer
                lessonTrainers={lessonTrainers}
                setFieldValue={setFieldValue}
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
                      disabled={isDisabled('') || isLoading}
                      onClickHandler={() =>
                        filterAndSet(
                          main_trainers ?? [],
                          data?.id,
                          'course.main_trainers'
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
            <ErrorMessage name="course.main_trainers" />
            {isErrorInTrainer && isUnavailableSelectedInMain ? (
              <ErrorMessage name="course.isErrorInTrainer" />
            ) : (
              ''
            )}
          </div>
        )}

        {/* ***************************   MAIN TRAINERS   *************************** */}

        {/* *************************** OPTIONAL TRAINERS *************************** */}
        {isTrainerLoading ? (
          <div className="lazy h-[50px] relative z-0 flex-[1_0_0%]" />
        ) : (
          <div
            ref={optionalTrainerModal.dropdownRef}
            className="relative z-0 flex-[1_0_0%] "
          >
            <p className="text-sm text-dark mb-2">
              {t('CoursesManagement.CreateCourse.optionalTrainers')}
            </p>
            <Button
              disabled={isDisabled('') || isLoading}
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
            {optionalTrainerModal.isDropdownOpen ? (
              <TrainerModal
                values={values}
                response={optionalData}
                name="course.optional_trainers"
                selectedValues={optional_trainers}
                // dates={dates}
                lessonTrainers={lessonTrainers}
                setFieldValue={setFieldValue}
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
                      disabled={isDisabled('') || isLoading}
                      onClickHandler={() =>
                        filterAndSet(
                          optional_trainers ?? [],
                          data?.id,
                          'course.optional_trainers'
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
            <ErrorMessage name="course.optional_trainers" />
            {isErrorInTrainer && isUnavailableSelectedInOptional ? (
              <ErrorMessage name="course.isErrorInTrainer" />
            ) : (
              ''
            )}
          </div>
        )}

        {/* *************************** OPTIONAL TRAINERS *************************** */}
      </div>
    </div>
  );
};

export default TrainersInfo;
