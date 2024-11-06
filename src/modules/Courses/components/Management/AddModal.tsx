// ** Components **
import Button from 'components/Button/Button';
import { Modal } from 'components/Modal/Modal';
import AddRoomResource from 'modules/Courses/components/Management/AddRoomResource';
import AddTrainerModal from 'modules/Courses/components/Management/AddTrainerModal';

// ** Hooks **
import { useModal } from 'hooks/useModal';
import { useTranslation } from 'react-i18next';

// ** Types **
import Image from 'components/Image';
import { AddTrainerModalProps } from 'modules/Courses/types/TrainersAndRooms';

const AddModal = ({ modal, ...props }: AddTrainerModalProps) => {
  const { t } = useTranslation();
  const addTrainerModal = useModal();
  const addResourceModal = useModal();
  return (
    <>
      <Modal
        headerTitle={t('CoursesManagement.ExtraTrainer.AssignTrainerAndResource')}
        modal={modal}
        closeOnOutsideClick={false}
        closeOnEscape={false}
        modalClassName="!px-7"
        width="max-w-[400px]"
      >
        <div className="grid gap-3">
          <Button
            onClickHandler={() => {
              addTrainerModal.openModal();
            }}
            variants="primaryBordered"
          >
            <Image
              iconName="userGroupIcon"
              iconClassName="mr-2 stroke-current w-5 h-5"
              width={24}
              height={24}
            />
            {t('CoursesManagement.ExtraTrainer.Trainer')}
          </Button>
          <Button
            onClickHandler={() => {
              addResourceModal.openModal();
            }}
            variants="primaryBordered"
          >
            <Image
              iconName="navHomeIcon"
              iconClassName="mr-2 stroke-current w-5 h-5"
              width={24}
              height={24}
            />
            {t('CoursesManagement.ExtraTrainer.RoomResource')}
          </Button>
        </div>
      </Modal>
      {addTrainerModal.isOpen ? (
        <AddTrainerModal {...props} modal={addTrainerModal} mainModal={modal} />
      ) : (
        ''
      )}
      {addResourceModal.isOpen ? (
        <AddRoomResource {...props} modal={addResourceModal} mainModal={modal} />
      ) : (
        ''
      )}
    </>
  );
};

export default AddModal;
