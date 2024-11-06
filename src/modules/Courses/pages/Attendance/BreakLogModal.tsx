import Button from 'components/Button/Button';
import { Modal } from 'components/Modal/Modal';
import { format } from 'date-fns';
import { UserModalType } from 'hooks/types';
import { LessonSessionTimeSheet } from 'modules/Courses/types';
import { useTranslation } from 'react-i18next';

type BreakLogModalProps = {
  breakLogModal: UserModalType;
  courseAttendanceLog: LessonSessionTimeSheet['courseAttendanceLog'];
};

const BreakLogModal = ({
  courseAttendanceLog,
  breakLogModal,
}: BreakLogModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal
      headerTitle={t('breakLogModal.title')}
      closeOnEscape
      modal={breakLogModal}
      width="max-w-[430px]"
    >
      <div className="flex gap-3">
        <div className="flex flex-col gap-3">
          <Button className="font-medium text-dark opacity-75">
            {t('breakTimeModal.datePicker.StartTimeLabel')}
          </Button>
          {courseAttendanceLog.map((attendanceLog) => {
            return (
              <p key={attendanceLog.id} className="text-base text-dark">
                {format(new Date(attendanceLog?.break_in), 'hh:mm a')}
              </p>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          <Button className="font-medium text-dark opacity-75">
            {t('breakTimeModal.datePicker.EndTimeLabel')}
          </Button>
          {courseAttendanceLog.map((attendanceLog) => {
            return (
              <p key={attendanceLog.id + 1} className="text-base text-dark">
                {format(new Date(attendanceLog?.break_out), 'hh:mm a')}
              </p>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default BreakLogModal;
