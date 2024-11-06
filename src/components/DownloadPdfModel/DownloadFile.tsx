// ** imports **
import { useTranslation } from 'react-i18next';

// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { useState } from 'react';
import { ModalProps } from 'types/common';

type AcceptModalType = {
  modal: ModalProps;
  handleAccept: (data: string) => void;
  germanIgnore?: string;
  disabled?: boolean;
};
const DownloadFileModal: React.FC<AcceptModalType> = ({
  modal,
  handleAccept,
  germanIgnore = 'false',
  disabled,
}: AcceptModalType) => {
  const { t } = useTranslation();
  const [buttonLoader, setButtonLoader] = useState({
    italian: false,
    english: false,
    german: false,
  });
  const handleLanguageSelection = (language: string) => {
    handleAccept(language);
  };
  return (
    <Modal
      width="max-w-[400px]"
      modal={modal}
      headerTitle={t('Quote.downloadModalTitle')}
    >
      <div className="text-center">
        <div className="w-20 h-20 bg-green2/20 mx-auto rounded-full flex items-center justify-center text-green2">
          <Image iconClassName="w-ful h-full" iconName="downloadFile" />
        </div>
        <p className="mt-5 text-lg left-7 font-medium">
          {t('Quote.downloadPdfTitle')}
        </p>

        <div className="flex gap-4 mt-8">
          <Button
            variants="primary"
            className="flex-[1_0_0%] justify-center"
            isLoading={buttonLoader.italian}
            onClickHandler={() => {
              setButtonLoader((prev) => {
                return {
                  ...prev,
                  italian: true,
                };
              });
              handleLanguageSelection('italian');
            }}
            disabled={disabled}
          >
            {t('italianTitle')}
          </Button>
          <Button
            variants="primary"
            isLoading={buttonLoader.english}
            className=" flex-[1_0_0%] justify-center"
            onClickHandler={() => {
              setButtonLoader((prev) => {
                return {
                  ...prev,
                  english: true,
                };
              });
              handleLanguageSelection('english');
            }}
            disabled={disabled}
          >
            {t('englishTitle')}
          </Button>
          {germanIgnore === 'false' && (
            <Button
              variants="primary"
              isLoading={buttonLoader.german}
              className=" flex-[1_0_0%] justify-center"
              onClickHandler={() => {
                setButtonLoader((prev) => {
                  return {
                    ...prev,
                    german: true,
                  };
                });
                handleLanguageSelection('german');
              }}
              disabled={disabled}
            >
              {t('germanTitle')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DownloadFileModal;
