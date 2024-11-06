import { Modal } from 'components/Modal/Modal';
import { UserModalType } from 'hooks/types';
import { useTranslation } from 'react-i18next';

type BreakLogModalProps = {
  breakLogModal: UserModalType;
};

const NoDataModal = ({ breakLogModal }: BreakLogModalProps) => {
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
          <p>No Data Found</p>
        </div>
      </div>
    </Modal>
  );
};

export default NoDataModal;
