import Button from 'components/Button/Button';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { REACT_APP_FRONT_CMS_URL } from 'config';
import { AcceptDeniedModalType } from 'modules/CompanyManager/types';
import { useTranslation } from 'react-i18next';

const AccessDeniedModal = ({ modal, headerTitle, description, showButtons = true }: AcceptDeniedModalType) => {
  const { t } = useTranslation();

  const handleSupport = () => {
    window.location.href = `${REACT_APP_FRONT_CMS_URL}/contatti`;
  };

  return (
    <Modal width="max-w-[400px]" modal={modal} headerTitle={headerTitle ?? t('accessDeniedTitle')}>
      <div className="text-center">
        <div className="mb-5 w-20 h-20 rounded-full p-6 mx-auto bg-primary/10 text-primary flex justify-center items-center">
          <Image iconClassName="w-ful h-full" iconName="accessDeniedIcon" />
        </div>
        <p className="mt-5 text-lg left-7 font-medium">
          {description ?? t('accessDeniedDescription')}
        </p>

        {showButtons && <div className="flex gap-4 mt-8">
          <Button
            variants="primaryBordered"
            className="flex-[1_0_0%] justify-center"
            onClickHandler={() => {
              modal.closeModal();
            }}
          >
            {t('Button.cancelButton')}
          </Button>
          <Button
            variants="primary"
            className=" flex-[1_0_0%] justify-center"
            onClickHandler={handleSupport}
          >
            {t('contactSupport')}
          </Button>
        </div>}
      </div>
    </Modal>
  );
};

export default AccessDeniedModal;
