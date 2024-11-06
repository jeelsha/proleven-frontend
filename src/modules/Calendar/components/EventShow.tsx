import Button from 'components/Button/Button';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import _ from 'lodash';
import { CourseDetails } from 'modules/Calendar/components/AllEvents/CourseDetails';
import { SessionDetails } from 'modules/Calendar/components/AllEvents/SessionDetails';
import { useTranslation } from 'react-i18next';
import { EventShowProps } from '../types';
import { InternalEventsShow } from './InternalEvents/InternalEventsShow';

const EventShow = ({
  modal,
  eventDetails,
  isLoading,
  EventCreateModal,
  setIsEventEdit,
  deleteModal,
  isOtherCalendar,
}: EventShowProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <Modal
        headerTitle={
          !_.isEmpty(eventDetails?.lessons)
            ? t('Calendar.courseEventTitle')
            : t('Calendar.internalEventTitle')
        }
        width={
          _.isEmpty(eventDetails?.lessons) ? '!max-w-[600px]' : '!max-w-[1200px]'
        }
        modal={modal}
        closeOnEscape={false}
      >
        {isLoading ? (
          <div className="lazy w-full  min-h-[400px] mb-2.5 " />
        ) : _.isEmpty(eventDetails?.lessons) || eventDetails?.trainerUser?.id ? (
          <>
            <InternalEventsShow eventDetails={eventDetails} />
            {!isOtherCalendar && (
              <div className="flex ml-auto gap-2 pt-5 mt-2 justify-end">
                <Button
                  onClickHandler={() => {
                    if (eventDetails) {
                      setIsEventEdit?.(true);
                      EventCreateModal?.openModalWithData?.(eventDetails);
                    }
                    setTimeout(() => {
                      modal.closeModal();
                    }, 300);
                  }}
                  small
                  className="min-w-[70px]"
                  variants="primary"
                >
                  <Image iconClassName="w-4 h-4 mr-1.5" iconName="editIcon" />
                  {t('UserManagement.edit')}
                </Button>
                <Button
                  onClickHandler={() => deleteModal?.openModal()}
                  small
                  className="min-w-[70px]"
                  variants="dangerBorder"
                >
                  <Image iconClassName="w-4 h-4 mr-1.5" iconName="deleteIcon" />
                  {t('Button.deleteButton')}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-2 gap-7">
            <CourseDetails eventDetails={eventDetails} />
            <SessionDetails eventDetails={eventDetails} />
          </div>
        )}
      </Modal>
    </div>
  );
};
export default EventShow;
