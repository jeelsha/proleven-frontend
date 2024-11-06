import { Form, Formik } from 'formik';

// ** hooks **
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// ** component **
import Button from 'components/Button/Button';
import OTPInput from 'react-otp-input';

// ** constant **
import { PUBLIC_NAVIGATION } from 'constants/navigation.constant';

// ** service **
import {
  getActiveUserDataApi,
  useVerificationCodeVerify,
} from 'modules/Auth/services';

// ** redux **
import { setToken } from 'redux-toolkit/slices/tokenSlice';

// ** style **
import { REACT_APP_API_URL } from 'config';
import { useAxiosGet } from 'hooks/useAxios';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import { customRandomNumberGenerator } from 'utils';
import './style/verifyCode.css';

const VerifyCode = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [callApi] = useAxiosGet();
  const { verificationCodeApi, isLoading } = useVerificationCodeVerify();
  const { getActiveUser } = getActiveUserDataApi();

  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    if (state === null || !state?.token || !state.secret) {
      navigate(PUBLIC_NAVIGATION.login);
    }
  }, [state]);

  const config = {
    headers: {
      Authorization: `jwt ${state.token}`,
    },
  };
  const OnSubmit = async () => {
    const response = await verificationCodeApi(
      {
        code: verificationCode,
        secret: state.secret,
        is_remember: state.is_remember,
      },
      config
    );
    if (response?.data?.user?.verified) {
      dispatch(setToken({ token: response?.data?.access_token }));
      await getActiveUser();
    } else if (response?.data?.verified === false) {
      dispatch(
        setToast({
          variant: 'Error',
          message: `${t('invalidOTP')}`,
          type: 'error',
          id: customRandomNumberGenerator(),
        })
      );
    }
  };
  const handleSendMail = async () => {
    const { error } = await callApi(`${REACT_APP_API_URL}/auth/2FA/qr-mail`, config);
    if (!error) {
      dispatch(
        setToast({
          variant: 'Success',
          message: `${t('Auth.TwoFactorScreen.mailSend')}`,
          type: 'success',
          id: customRandomNumberGenerator(),
        })
      );
    } else {
      dispatch(
        setToast({
          variant: 'Warning',
          message: `${t('ErrorBoundary.title')}`,
          type: 'Warning',
          id: customRandomNumberGenerator(),
        })
      );
    }
  };

  return (
    <section className="verify-code-section bg-primary2Light bg-[center_bottom] min-h-[calc(100dvh_-_90px)] bg-authbg bg-no-repeat flex justify-center items-center">
      <div className="verify-container auth-scroll">
        <h1 className="text-blacktheme text-3xl font-semibold mb-2">
          {t('Auth.AuthCode.verifyAccountText')}
        </h1>
        <p className="text-base text-grayText mt-4">
          <span className="text-blacktheme font-semibold">{state?.email}</span>
          {t('Auth.AuthCode.enterCodeText')}
        </p>
        <Formik
          enableReinitialize
          initialValues={{ verificationCode }}
          onSubmit={OnSubmit}
        >
          {({ values }) => (
            <Form>
              <div className="py-10">
                <OTPInput
                  inputStyle="otp-input"
                  numInputs={6}
                  onChange={(value) => {
                    setVerificationCode(String(value));
                  }}
                  value={values.verificationCode}
                  placeholder="------"
                  inputType="number"
                  renderInput={(props) => <input {...props} />}
                  shouldAutoFocus
                  containerStyle="flex justify-between"
                />
              </div>

              <div className="mb-10">
                <Button
                  isLoading={isLoading}
                  disabled={isLoading}
                  type="submit"
                  value={t('Auth.AuthCode.verifyButtonText')}
                  className="w-full bg-primary font-medium p-3 text-center text-white rounded-lg hover:bg-secondary transition-all"
                />
              </div>
            </Form>
          )}
        </Formik>
        <Link state={{ ...state }} className="text-secondary" to="">
          <span onClick={handleSendMail}>{t('regenerateQR')}</span>
        </Link>
      </div>
    </section>
  );
};

export default VerifyCode;
