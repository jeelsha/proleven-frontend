import InputField from 'components/FormElement/InputField';
import PhoneNumberInput from 'components/FormElement/PhoneNumberInput';
import ProfilePictureUpload from 'components/FormElement/components/ProfilePictureUpload';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button/Button';
import { CompanyDetails } from '../CompanyDetails';
import { CompanyManagerViewProfileProps } from '../types';

const CompanyManagerProfile = ({
  values,
  setFieldValue,
  isLoading,
  company_data,
}: CompanyManagerViewProfileProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid  gap-5 grid-cols-2 ">
        <div className="col-span-2">
          <ProfilePictureUpload
            setValue={setFieldValue}
            name="profile_image"
            value={values?.profile_image ? values?.profile_image : null}
            acceptTypes="image/*"
          />
        </div>
        <InputField
          isCompulsory
          value={values.first_name}
          name="first_name"
          placeholder={t('UserManagement.placeHolders.firstName')}
          label={t('UserManagement.addEditUser.firstName')}
        />
        <InputField
          isCompulsory
          value={values.last_name}
          name="last_name"
          placeholder={t('UserManagement.placeHolders.lastName')}
          label={t('UserManagement.addEditUser.lastName')}
        />
        <InputField
          isCompulsory
          value={values.email}
          name="email"
          placeholder={t('UserManagement.placeHolders.email')}
          label={t('UserManagement.addEditUser.email')}
        />
        <PhoneNumberInput
          isCompulsory
          placeholder={t('UserManagement.placeHolders.contact')}
          label={t('UserManagement.addEditUser.contact')}
          name="contact"
        />

        <InputField
          placeholder={t('ClientManagers.clientForm.fieldInfos.jobTitlePlaceHolder')}
          type="text"
          isCompulsory
          value={values.manager?.job_title}
          label={t('ClientManagers.clientForm.fieldInfos.jobTitle')}
          name="manager.job_title"
        />
        <div className="col-span-2">
          <Button
            isLoading={isLoading}
            disabled={isLoading}
            type="submit"
            variants="primary"
            className={`w-fit min-w-[100px] ${isLoading ? 'disabled:opacity-50 pointer-events-none' : ''
              }`}
          >
            {t('Button.saveButton')}
          </Button>
        </div>
      </div>
      <div>
        <CompanyDetails companyDetails={company_data} />
      </div>
    </>
  );
};

export default CompanyManagerProfile;
