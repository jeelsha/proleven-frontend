import Button from 'components/Button/Button';
import { Modal } from 'components/Modal/Modal';
import { REACT_APP_CAPTCHA_SITE_KEY } from 'config';
import _ from 'lodash';
import { useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import { ModalProps } from 'types/common';
import { customRandomNumberGenerator } from 'utils';

function RegisterModal({ modal }: { modal: ModalProps }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const refCaptcha = useRef<ReCAPTCHA>(null);

  function checkCaptcha() {
    if (refCaptcha.current) {
      const captchaValue = refCaptcha.current.getValue();
      if (_.isEmpty(captchaValue)) {
        const random = customRandomNumberGenerator();
        dispatch(
          setToast({
            variant: 'Error',
            message: `${t('ToastMessage.errorCaptcha')}`,
            type: 'error',
            id: random,
          })
        );
      } else {
        modal.closeModal();
      }
    }
  }
  return (
    <Modal modal={modal} width="max-w-[350px]">
      <div className="mb-4 flex flex-col justify-center items-center">
        <ReCAPTCHA ref={refCaptcha} sitekey={REACT_APP_CAPTCHA_SITE_KEY as string} />
        <div className="mt-5 flex gap-6">
          <Button
            type="button"
            className="flex items-center justify-center text-xs leading-5 gap-1 min-w-28"
            variants="primary"
            onClickHandler={() => navigate('/auth/login')}
          >
            {t('EmailTemplate.cancel')}
          </Button>
          <Button
            type="submit"
            className="flex items-center justify-center text-xs leading-5 gap-1 min-w-28"
            variants="primary"
            onClickHandler={() => checkCaptcha()}
          >
            {t('Auth.RegisterCommon.nextButtonText')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default RegisterModal;
