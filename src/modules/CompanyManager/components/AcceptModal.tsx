import Button from 'components/Button/Button';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { AcceptModalType } from 'modules/CompanyManager/types';
import { useTranslation } from 'react-i18next';

const AcceptModal = ({ modal, handleCancel, handleAccept }: AcceptModalType) => {
  const { t } = useTranslation();

  return (
    <Modal width="max-w-[400px]" modal={modal}>
      <div className="text-center">
        <div className="w-20 h-20 bg-green2/20 mx-auto rounded-full flex items-center justify-center text-green2">
          <Image iconClassName="w-ful h-full" iconName="checkRoundIcon2" />
        </div>
        <p className="mt-5 text-lg left-7 font-medium">
          {t('CompanyManager.trackCourse.acceptModal.title')}
        </p>

        <div className="flex gap-4 mt-8">
          <Button
            variants="primaryBordered"
            className="flex-[1_0_0%] justify-center"
            onClickHandler={handleCancel}
          >
            {t('Button.cancelButton')}
          </Button>
          <Button
            variants="primary"
            className=" flex-[1_0_0%] justify-center"
            onClickHandler={handleAccept}
          >
            {t('CompanyManager.trackCourse.modal.acceptTitle')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AcceptModal;
