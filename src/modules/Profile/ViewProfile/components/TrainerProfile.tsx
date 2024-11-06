import InputField from 'components/FormElement/InputField';
import PhoneNumberInput from 'components/FormElement/PhoneNumberInput';
import ProfilePictureUpload from 'components/FormElement/components/ProfilePictureUpload';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button/Button';
import DropZone from 'components/FormElement/DropZoneField';
import ReactSelect from 'components/FormElement/ReactSelect';
import { fileInputEnum } from 'components/FormElement/types';
import Map from 'components/GoogleMap';
import { useAxiosGet } from 'hooks/useAxios';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Rating } from 'react-simple-star-rating';
import { AuthUserType, getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { getCurrencySymbol } from 'utils';
import { TrainerViewProfileProps } from '../types';

const getStarRating = (user: Partial<AuthUserType | null> | undefined, trainerRating?: { rateAvg: string }) => {

  if (user && _.isUndefined(trainerRating?.rateAvg)) {
    return Number(user?.trainer?.rate_by_admin);
  }
  if (Number.isNaN(Number(trainerRating?.rateAvg))) {
    return 0;
  }
  return Number(trainerRating?.rateAvg);
}

const TrainerProfile = ({
  values,
  setFieldValue,
  isLoading,
  categories,
  setLatLng,
}: TrainerViewProfileProps) => {
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);
  const [trainerRating, setTrainerRating] = useState<{ rateAvg: string }>();

  const [getRating] = useAxiosGet();

  const getTrainerRating = async () => {
    const { data } = await getRating(
      `/trainer/survey-rating?trainer_id=${user?.id}`
    );
    if (data) setTrainerRating(data);
  };
  useEffect(() => {
    if (user?.id) getTrainerRating();
  }, [user?.id]);
  return (
    <div className="grid gap-5 768:grid-cols-2 1400:grid-cols-4">
      <div className="col-span-2 1400:col-span-4">
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
      <Map
        className="col-span-2"
        isCompulsory
        setFieldValue={setFieldValue}
        setLatLng={setLatLng}
        name="trainer.location"
        center={{
          lng: Number(values.trainer?.longitude),
          lat: Number(values.trainer?.latitude),
        }}
        locationLabel={t('Trainer.invoice.trainerLocation')}
        locationValue={values.trainer?.location ?? ''}
      />

      <DropZone
        variant={fileInputEnum.LinkFileInput}
        acceptTypes="application/pdf"
        // parentClass="col-span-2"
        parentClass="col-span-2"
        label={t('Auth.RegisterTrainer.trainerAttachment')}
        Title={t('Auth.RegisterTrainer.trainerAttachmentPlaceHolder')}
        setValue={setFieldValue}
        name="trainer_attachment"
        value={values.trainer_attachment ?? []}
        isMulti
        limit={3}
      />

      <InputField
        parentClass="col-span-2"
        placeholder="0"
        type="number"
        isCompulsory
        isDisabled
        value={values?.trainer?.reimbursement_threshold}
        label={t('trainer.threshold')}
        name="trainer.reimbursement_threshold"
      />

      <ReactSelect
        isCompulsory
        parentClass="col-span-2"
        label={t('Auth.RegisterTrainer.trainerCourse')}
        placeholder={t('Auth.RegisterTrainer.trainerCoursePlaceHolder')}
        options={categories}
        isMulti
        name="trainer.sub_categories"
      />
      <InputField
        placeholder="0000"
        type="text"
        prefix={getCurrencySymbol('EUR')}
        isCompulsory
        value={values?.trainer?.hourly_rate}
        label={t('UserManagement.addEditUser.hourlyRate')}
        name="trainer.hourly_rate"
        isDisabled
        className="bg-white"
      />

      <InputField
        prefix={getCurrencySymbol('EUR')}
        placeholder="0000"
        type="text"
        value={values?.trainer?.travel_reimbursement_fee}
        label={t('UserManagement.addEditUser.travelReimbursement')}
        name="trainer.travel_reimbursement_fee"
        isDisabled
        className="bg-white"
      />
      {values?.trainer?.rate_by_admin && (
        <InputField
          placeholder="1-5"
          type="number"
          value={values?.trainer?.rate_by_admin}
          label={t('UserManagement.addEditUser.trainerRate')}
          name="trainer.rate_by_admin"
        />
      )}
      <InputField
        placeholder={t(
          'ClientManagement.clientForm.fieldInfos.codiceFiscalePlaceHolder'
        )}
        type="text"
        value={values?.trainer?.codice_fiscale}
        label={t(
          'ClientManagement.clientForm.fieldInfos.codiceFiscale'
        )}
        name="trainer.codice_fiscale"
      />
      <InputField
        placeholder={t(
          'ClientManagement.clientForm.fieldInfos.vatNamePlaceHolder'
        )}
        type="text"
        value={values.trainer?.vat_number}
        label={t('ClientManagement.clientForm.fieldInfos.vatNumber')}
        name="trainer.vat_number"
      />

      {trainerRating || user ? (
        <div>
          <span className="block w-full text-sm leading-4 text-black mt-1 mb-2">
            {t('surveyRating')}
          </span>
          <div className="flex gap-2 items-center">
            <Rating
              size={25}
              initialValue={getStarRating(user, trainerRating)}
              transition
              readonly
              allowFraction
              SVGstyle={{ display: 'inline' }}
            />
            <span className="text-sm leading-5 text-dark font-medium">{getStarRating(user, trainerRating)}/5</span>

          </div>
        </div>
      ) : (
        ''
      )}


      <div
        className="
            col-span-2 1400:col-span-4"
      >
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
  );
};

export default TrainerProfile;
