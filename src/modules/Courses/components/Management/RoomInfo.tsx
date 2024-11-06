// ** Components **
import ErrorMessage from 'components/FormElement/ErrorMessage';
import ReactSelect from 'components/FormElement/ReactSelect';

// ** Types **
import { Option } from 'components/FormElement/types';
import { LessonModeEnum } from 'modules/Courses/pages/Attendance/types';
import {
  CourseRooms,
  TrainerRoomInfoProps,
} from 'modules/Courses/types/TrainersAndRooms';

// ** Constants
import { TrainerSelected } from 'modules/Courses/Constants';

// ** Hooks **
import { useAxiosGet } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Utils **
import { shouldDisableField } from 'utils';

const RoomsInfo = ({
  values,
  isLoading,
  dates,
  lessonTime,
  fieldsToTranslate,
  currentLanguage,
  defaultLanguage,
  setIsMainLoading,
  setFieldValue,
}: TrainerRoomInfoProps) => {
  const { t } = useTranslation();

  // ** States
  const [roomsData, setRoomsData] = useState<Array<CourseRooms>>([]);

  // ** CONSTs
  const {
    slug,
    main_rooms = [],
    optional_rooms = [],
    academy_id,
    optional_trainers = [],
    isErrorInRoom,
    type,
  } = values?.course || {};
  const { lesson } = values;

  const optionalRoomList = (roomsData ?? []).filter(
    (room) => !main_rooms?.some((r) => r === room.id)
  );
  const mainRoomList = (roomsData ?? []).filter(
    (room) => !optional_rooms?.some((r) => r === room.id)
  );

  const allAssignedRooms = [...(main_rooms ?? []), ...(optional_rooms ?? [])];

  const isAllVideoConference = (lesson ?? []).every((l) =>
    (l.session ?? []).every((s) => s.mode === LessonModeEnum.VideoConference)
  );
  const warnings: number[] = [];
  let isUnavailableSelectedInMain = false;
  let isUnavailableSelectedInOptional = false;

  roomsData?.forEach((r) => {
    if (r.selected_status === TrainerSelected.Unavailable) {
      warnings.push(r.id);
      if (!isUnavailableSelectedInMain && main_rooms?.includes(r.id)) {
        isUnavailableSelectedInMain = true;
      }
      if (!isUnavailableSelectedInOptional && optional_rooms?.includes(r.id)) {
        isUnavailableSelectedInOptional = true;
      }
    }
  });

  // ** APIs
  const [getRooms, { isLoading: isRoomsLoading }] = useAxiosGet();

  const getDateWiseRoom = async () => {
    const { data, error } = await getRooms('/course/available/rooms', {
      params: {
        course_slug: slug,
        dates: (dates ?? []).filter((i) => i).join(','),
        ...(allAssignedRooms?.length > 0
          ? {
              allAssignedRooms: allAssignedRooms.join(','),
            }
          : {}),
        timeSlot: lessonTime?.toString(),
        view: true,
      },
    });
    if (!error && Array.isArray(data?.data)) setRoomsData(data?.data);
  };

  const filterRooms = (rooms: Array<CourseRooms>): Array<Option> =>
    rooms.map((r) => ({ label: r.title, value: r.id }));

  const isDisabled = (val: string) =>
    shouldDisableField(val, fieldsToTranslate, currentLanguage, defaultLanguage);

  // ** useEffects
  useEffect(() => {
    if ((dates ?? []).length > 0) getDateWiseRoom();
  }, [dates, lessonTime]);

  useEffect(() => {
    setIsMainLoading?.(isRoomsLoading);
  }, [isRoomsLoading]);

  useEffect(() => {
    setFieldValue?.(
      'course.isErrorInRoom',
      isUnavailableSelectedInOptional || isUnavailableSelectedInMain
    );
  }, [isUnavailableSelectedInMain, isUnavailableSelectedInOptional]);

  useEffect(() => {
    if (isAllVideoConference) setFieldValue?.('course.academy_id', 0);
  }, [isAllVideoConference]);
  return (
    <div className="grid grid-cols-2 gap-y-7 gap-x-4 w-full">
      <div>
        <ReactSelect
          name="course.main_rooms"
          label={t('CourseBundle.trainer.room')}
          options={filterRooms(mainRoomList ?? []) ?? []}
          placeholder={t('CourseBundle.trainer.selectRoom')}
          isCompulsory={type === 'private' ? !!academy_id : !isAllVideoConference}
          isMulti
          disabled={isDisabled('main_rooms')}
          isLoading={isLoading}
          warnings={warnings}
        />
        {isErrorInRoom && isUnavailableSelectedInMain ? (
          <ErrorMessage name="course.isErrorInRoom" />
        ) : (
          ''
        )}
      </div>
      <ReactSelect
        name="course.optional_rooms"
        label={t('CourseBundle.trainer.optionalRoom')}
        options={filterRooms(optionalRoomList ?? []) ?? []}
        placeholder={t('CourseBundle.trainer.selectOptionalRoom')}
        isCompulsory={!!optional_trainers?.length && !isAllVideoConference}
        isClearable={!optional_trainers?.length}
        isMulti
        disabled={isDisabled('optional_rooms') || !optional_trainers?.length}
        isLoading={isLoading}
        warnings={warnings}
      />
      {isErrorInRoom && isUnavailableSelectedInOptional ? (
        <ErrorMessage name="course.isErrorInRoom" />
      ) : (
        ''
      )}
    </div>
  );
};

export default RoomsInfo;
