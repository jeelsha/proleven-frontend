// this component is not used
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import CityDropdown from 'components/FormElement/CityList';
import DropZone from 'components/FormElement/DropZoneField';
import InputField from 'components/FormElement/InputField';
import PhoneNumberInput from 'components/FormElement/PhoneNumberInput';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import StateDropdown from 'components/FormElement/StateList';
import DatePicker from 'components/FormElement/datePicker';
import { EnumFileType } from 'components/FormElement/enum';
import PageHeader from 'components/PageHeader/PageHeader';
import { Form, Formik, FormikValues } from 'formik';
import { useQueryGetFunction } from 'hooks/useQuery';
import { genderOption } from 'modules/Profile/constants';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getStateJson } from 'redux-toolkit/slices/countryJsonSlice';

import CountrySelect from 'components/FormElement/CountryList';
import { Trainer } from './Trainer';

interface RoleData {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const AccountSettings = () => {
  const { t } = useTranslation();

  const states = useSelector(getStateJson);

  const { response } = useQueryGetFunction('/role/get-all');
  const initialValues = {
    first_name: '',
    last_name: '',
    contact: '',
    email: '',
    address_state: '',
    address_city: '',
    address_country: '',
    address_zip: '',
    address1: '',
    address2: '',
    gender: '',
    profile_image: '',
  };
  const OnSubmit = async (managers: FormikValues) => {
    if (managers) {
      const managerData = {
        ...managers,
      };
      const formData = new FormData();
      Object.entries(managerData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
  };
  const role = 8;
  const Role = response?.data.find((item: RoleData) => item.id === role)?.name;
  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={(values) => OnSubmit(values)}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <PageHeader small text={t('UserProfile.settings.title')} />
          <CustomCard minimal>
            <div>
              <div className="xl:col-span-2">
                <DropZone
                  className="xl:max-w-[330px]"
                  label="Profile Image"
                  name="company_logo"
                  SubTitle={t('UserProfile.settings.dragDropText')}
                  setValue={setFieldValue}
                  value={values.profile_image}
                  acceptTypes="image/*"
                  fileType={EnumFileType.Image}
                />
              </div>
              <InputField
                placeholder={t('UserProfile.settings.firstNamePlaceHolder')}
                type="text"
                isCompulsory
                value={values.first_name}
                label={t('UserProfile.settings.firstName')}
                name="first_name"
              />
              <InputField
                placeholder={t('UserProfile.settings.lastNamePlaceHolder')}
                type="text"
                isCompulsory
                value={values.last_name}
                label={t('UserProfile.settings.lastName')}
                name="last_name"
              />
              <PhoneNumberInput
                isCompulsory
                placeholder={t('UserProfile.settings.contactPlaceHolder')}
                label={t('UserProfile.settings.contact')}
                name="contact"
              />
              <InputField
                parentClass=""
                placeholder={t('UserProfile.settings.emailPlaceHolder')}
                type="text"
                isCompulsory
                value={values.email}
                label={t('UserProfile.settings.email')}
                name="email"
              />
              <CountrySelect
                selectedCountry={values.address_country}
                name="address_country"
                label={t('UserProfile.settings.country')}
                placeholder={t('UserProfile.settings.countryPlaceHolder')}
                isCompulsory
              />
              <StateDropdown
                name="address_state"
                label={t('UserProfile.settings.state')}
                placeholder={t('UserProfile.settings.statePlaceHolder')}
                selectedState={values.address_state}
                selectedCountry={values.address_country}
                states={states.states}
              />
              <CityDropdown
                selectedState={values.address_state}
                selectedCity={values.address_city}
                placeholder={t('UserProfile.settings.cityPlaceHolder')}
                label={t('UserProfile.settings.region')}
                name="address_city"
              />
              <InputField
                placeholder={t('UserProfile.settings.zipPlaceHolder')}
                type="text"
                value={values.address_zip}
                label={t('UserProfile.settings.zipcode')}
                name="address_zip"
              />
              <InputField
                placeholder={t('UserProfile.settings.address1PlaceHolder')}
                type="text"
                value={values.address1}
                isCompulsory
                label={t('UserProfile.settings.address')}
                name="address_l1"
              />
              <InputField
                placeholder={t('UserProfile.settings.address2PlaceHolder')}
                type="text"
                value={values.address2}
                label={t('UserProfile.settings.address2')}
                name="address_l2"
              />
              <RadioButtonGroup
                optionWrapper="flex gap-4"
                name="gender"
                options={genderOption}
                label="Gender"
              />
              <DatePicker label="Date Of Birth" />
              {Role === 'Trainer' && <Trainer />}
              {Role === 'PrivateIndividual' && (
                <InputField
                  placeholder={t('UserProfile.settings.jobTitlePlaceHolder')}
                  type="text"
                  value={values.address2}
                  label={t('UserProfile.settings.jobTitle')}
                  name="job_title"
                />
              )}
              <div className="flex justify-end gap-4">
                <Button variants="primary" type="submit" className="addButton">
                  {t('UserProfile.settings.buttonText')}
                </Button>
              </div>
            </div>
          </CustomCard>
        </Form>
      )}
    </Formik>
  );
};
