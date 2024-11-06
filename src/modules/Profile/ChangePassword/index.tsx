// **components**
import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';

// **libraries**
import { Form, Formik, FormikProps, FormikValues } from 'formik';

// **hooks**
import { useAxiosPost } from 'hooks/useAxios';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// **types**
import { ChangePasswordProps } from 'modules/Profile/types';

// **validation**
import { ChangePasswordValidationSchema } from 'modules/Profile/validations';

const ChangePassword = ({ modal }: ChangePasswordProps) => {
  const formikRef = useRef<FormikProps<FormikValues>>();
  const [changePasswordApi] = useAxiosPost();
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState<{
    password: boolean;
    confirmPassword: boolean;
    newPassword: boolean;
  }>({
    password: false,
    confirmPassword: false,
    newPassword: false,
  });

  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };

  const OnSubmit = async (data: FormikValues) => {
    if (data) {
      const changePassword = {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      };
      const { error } = await changePasswordApi(
        '/auth/change-password',
        changePassword
      );
      if (!error) {
        modal?.closeModal();
      }
    }
  };

  return (
    <Modal
      headerTitle={t('UserProfile.ChangePassword.title')}
      modal={modal}
      showFooter
      footerButtonTitle={t('Button.cancelButton')}
      footerSubmit={handleSubmitRef}
      closeOnOutsideClick
    >
      <Formik
        initialValues={{ oldPassword: '', newPassword: '', confirmPassword: '' }}
        validationSchema={ChangePasswordValidationSchema()}
        onSubmit={(values) => OnSubmit(values)}
        innerRef={formikRef as React.Ref<FormikProps<FormikValues>>}
      >
        {({ values }) => (
          <Form className="grid lg:grid-cols-1 gap-10">
            <InputField
              isCompulsory
              placeholder={t('UserProfile.ChangePassword.oldPasswordPlaceHolder')}
              type={showPassword.password ? 'text' : 'password'}
              value={values.oldPassword}
              icon={
                <Button
                  className="cursor-pointer"
                  onClickHandler={() =>
                    setShowPassword((prev) => {
                      return { ...prev, password: !showPassword.password };
                    })
                  }
                >
                  <Image
                    iconName={
                      showPassword.password ? 'eyeIcon' : 'passwordEyeStrokeSD'
                    }
                    iconClassName="w-[18px] h-[18px]"
                  />
                </Button>
              }
              label={t('UserProfile.ChangePassword.oldPasswordLabel')}
              name="oldPassword"
            />
            <InputField
              isCompulsory
              placeholder={t('UserProfile.ChangePassword.newPasswordPlaceHolder')}
              type={showPassword.newPassword ? 'text' : 'password'}
              value={values.newPassword}
              icon={
                <Button
                  className="cursor-pointer"
                  onClickHandler={() =>
                    setShowPassword((prev) => {
                      return {
                        ...prev,
                        newPassword: !showPassword.newPassword,
                      };
                    })
                  }
                >
                  <Image
                    iconName={
                      showPassword.newPassword ? 'eyeIcon' : 'passwordEyeStrokeSD'
                    }
                    iconClassName="w-[18px] h-[18px]"
                  />
                </Button>
              }
              label={t('UserProfile.ChangePassword.newPasswordLabel')}
              name="newPassword"
            />
            <InputField
              isCompulsory
              placeholder={t(
                'UserProfile.ChangePassword.confirmPasswordPlaceHolder'
              )}
              type={showPassword.confirmPassword ? 'text' : 'password'}
              value={values.confirmPassword}
              icon={
                <Button
                  className="cursor-pointer"
                  onClickHandler={() =>
                    setShowPassword((prev) => {
                      return {
                        ...prev,
                        confirmPassword: !showPassword.confirmPassword,
                      };
                    })
                  }
                >
                  <Image
                    iconName={
                      showPassword.confirmPassword
                        ? 'eyeIcon'
                        : 'passwordEyeStrokeSD'
                    }
                    iconClassName="w-[18px] h-[18px]"
                  />
                </Button>
              }
              label={t('UserProfile.ChangePassword.confirmPasswordLabel')}
              name="confirmPassword"
            />
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ChangePassword;
