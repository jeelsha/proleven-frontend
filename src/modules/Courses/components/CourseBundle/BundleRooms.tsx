// ** Components **
import ErrorMessage from 'components/FormElement/ErrorMessage';
import ReactSelect from 'components/FormElement/ReactSelect';

// ** Hooks **
import { useAxiosGet } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Constants **
import { TrainerSelected } from 'modules/Courses/Constants';

// ** Types **
import { CourseBundleInterface } from 'modules/Courses/types/TemplateBundle';
import { CourseRooms } from 'modules/Courses/types/TrainersAndRooms';
import { SetFieldValue } from 'types/common';

interface BundleRoomsProps {
  values: CourseBundleInterface;
  dates: Array<string>;
  timeSlots?: Array<string>;
  setFieldValue: SetFieldValue;
  isLoading?: boolean;
}
const BundleRooms = ({
  values,
  isLoading,
  dates,
  setFieldValue,
  timeSlots,
}: BundleRoomsProps) => {
  const { t } = useTranslation();

  // ** States
  const [roomsData, setRoomsData] = useState<Array<CourseRooms>>([]);

  // ** CONSTs
  const { courses, other } = values;
  const { main_rooms, optional_rooms, isErrorInRoom } = other;
  const slugs = courses?.map((c) => c.course.slug);

  const optionalRoomList = (roomsData ?? []).filter(
    (room) => !main_rooms?.some((r) => r === room.id)
  );
  const mainRoomList = (roomsData ?? []).filter(
    (room) => !optional_rooms?.some((r) => r === room.id)
  );

  const allAssignedRooms = [...(main_rooms ?? []), ...(optional_rooms ?? [])];

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
        course_slug: (slugs ?? []).filter(Boolean).join(','),
        dates: (dates ?? []).filter((i) => i).join(','),
        ...(allAssignedRooms?.length > 0
          ? {
              allAssignedRooms: allAssignedRooms.join(','),
            }
          : {}),
        view: true,
        timeSlot: timeSlots?.filter((ts) => ts?.trim())?.toString(),
      },
    });
    if (!error && Array.isArray(data?.data)) setRoomsData(data?.data);
  };

  const filterRooms = (rooms: Array<CourseRooms>) =>
    rooms.map((r) => ({ label: r.title, value: r.id }));

  // ** useEffects
  useEffect(() => {
    if ((dates ?? []).filter(Boolean).length > 0) getDateWiseRoom();
  }, [timeSlots]);

  useEffect(() => {
    setFieldValue?.(
      'other.isErrorInRoom',
      isUnavailableSelectedInOptional || isUnavailableSelectedInMain
    );
  }, [isUnavailableSelectedInMain, isUnavailableSelectedInOptional]);

  return (
    <>
      <ReactSelect
        name="other.main_rooms"
        label={t('CourseBundle.trainer.room')}
        options={filterRooms(mainRoomList ?? []) ?? []}
        placeholder={t('CourseBundle.trainer.selectRoom')}
        className="bg-white rounded-lg"
        isMulti
        isLoading={isLoading || isRoomsLoading}
        warnings={warnings}
        isCompulsory
      />
      {isErrorInRoom && isUnavailableSelectedInMain ? (
        <ErrorMessage name="other.isErrorInRoom" />
      ) : (
        ''
      )}

      <ReactSelect
        name="other.optional_rooms"
        label={t('CourseBundle.trainer.optionalRoom')}
        options={filterRooms(optionalRoomList ?? []) ?? []}
        placeholder={t('CourseBundle.trainer.selectOptionalRoom')}
        isMulti
        isLoading={isLoading || isRoomsLoading}
        warnings={warnings}
        isCompulsory={!!values?.other?.optional_trainers?.length}
        className="bg-white rounded-lg"
      />
      {isErrorInRoom && isUnavailableSelectedInOptional ? (
        <ErrorMessage name="other.isErrorInRoom" />
      ) : (
        ''
      )}
    </>
  );
};

export default BundleRooms;
