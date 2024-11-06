import Button from 'components/Button/Button';
import { Modal } from 'components/Modal/Modal';
import { TrackCourseAttendee } from '../types';

const AttendeeModal = ({ modal, AttendeeAdd, t }: TrackCourseAttendee) => {
  return (
    <Modal width="max-w-[400px] " modal={modal}>
      <>
        <div className="min-h-[300px] relative bg-celebrationBg bg-center bg-no-repeat bg-cover mb-5 w-[calc(100%_+_2rem)] mt-[-1rem] ml-[-1rem]" />

        <div className="max-w-[90%] w-full mx-auto text-center">
          <h2 className="text-primary font-bold leading-[1.5] text-2xl mb-2">
            {t('companyManager.attendee.add')}
          </h2>
          <p className="text-[14px]">
            {t('companyManager.attendee.addAttendee.message')} <br />
            {t('companyManager.attendee.addAttendee.otherMessage')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <Button
            variants="primaryBordered"
            onClickHandler={() => {
              modal.closeModal();
            }}
          >
            {t('Button.cancelButton')}
          </Button>
          <Button
            variants="primaryBordered"
            onClickHandler={() => {
              modal.closeModal();
              AttendeeAdd();
            }}
          >
            {t('CompanyManager.AttendeeList.addAttendeeTitle')}
          </Button>
        </div>
      </>
    </Modal>
  );
};
export default AttendeeModal;
