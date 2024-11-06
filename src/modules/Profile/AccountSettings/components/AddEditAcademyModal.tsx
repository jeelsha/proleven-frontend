// ** Components **
import InputField from 'components/FormElement/InputField';
import Map from 'components/GoogleMap';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikProps, FormikValues } from 'formik';

// ** Hooks **
import { useAxiosGet, useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// ** Redux **
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

// ** Types **
import { AddEditAcademyProps } from 'modules/Profile/AccountSettings/types';

// ** Validation Schema **
import { AcademyValidationSchema } from 'modules/Profile/AccountSettings/validation';

// ** Utilities **
import { capitalizeFirstCharacter } from 'utils';

type LatLngType = {
  lat: number;
  lng: number;
};

const AddEditAcademyModal = ({
  modal,
  data,
  isView,
  refetch,
  setData,
}: AddEditAcademyProps) => {
  const { t } = useTranslation();
  const formikRef = useRef<FormikProps<FormikValues>>();

  // ** APIS
  const [createAcademyApi] = useAxiosPost();
  const [updateAcademyApi] = useAxiosPut();
  const [getAllAcademy, { isLoading }] = useAxiosGet();

  // ** States
  const [currentAcademy, setCurrentAcademy] = useState<Record<
    string,
    string
  > | null>(null);
  const [allLanguages, setAllLanguages] = useState<Record<string, string>>({});
  const [latLng, setLatLng] = useState<LatLngType>({
    lat: 0,
    lng: 0,
  });

  // ** Slices
  const activeLanguage = useSelector(useLanguage);

  // ** CONSTs
  const initialValues: Record<string, string> = {
    location: currentAcademy?.location_italian ?? '',
    longitude: currentAcademy?.longitude_italian ?? '',
    latitude: currentAcademy?.latitude_italian ?? '',
  };
  const fieldObject: {
    name: string;
    key: string;
    label: string;
  }[] = [];

  Object.values(allLanguages).forEach((lang) => {
    fieldObject.push({
      key: lang,
      name: `name_${lang}`,
      label: capitalizeFirstCharacter(lang),
    });

    initialValues[`name_${lang}`] = currentAcademy
      ? currentAcademy[`name_${lang}`]
      : '';

    if (currentAcademy) initialValues[`id_${lang}`] = currentAcademy[`id_${lang}`];
  });
  initialValues.location = currentAcademy?.location_italian ?? '';

  const fetchAcademy = async () => {
    const response = await getAllAcademy('/academy', {
      params: {
        allLanguage: true,
        simplifyResponseByLanguage: true,
        getByParentSlug: data?.slug,
      },
    });
    const academy = response.data;
    if (Array.isArray(academy?.data) && academy?.data?.length > 0) {
      setCurrentAcademy(academy?.data?.[0]);
    }
  };

  const OnSubmit = async (academy: FormikValues) => {
    if (academy) {
      academy.longitude = String(latLng.lng);
      academy.latitude = String(latLng.lat);
      const formData = new FormData();

      Object.entries(academy).forEach(([key, value]) => formData.append(key, value));

      const apiFunction = data ? updateAcademyApi : createAcademyApi;
      const { error } = await apiFunction(`/academy`, formData);

      if (!error) {
        modal.closeModal();
        if (refetch) refetch();
      }
      if (isView && setData) setData(null);
    }
  };

  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };

  // ** useEffects
  useEffect(() => {
    if (data) fetchAcademy();
  }, [data]);

  useEffect(() => {
    if (activeLanguage?.allLanguages) {
      const returnActiveLanguages = activeLanguage.allLanguages.reduce(
        (acc, item) => ({
          ...acc,
          [item.short_name]: item.name,
        }),
        {}
      );

      setAllLanguages(returnActiveLanguages);
    }
  }, [activeLanguage?.allLanguages]);

  return (
    <Modal
      showFooter
      footerSubmit={handleSubmitRef}
      footerButtonTitle={t('AccountSetting.CancelButton')}
      footerSubmitButtonTitle={
        data ? t('Codes.edit') : t('AccountSetting.AddButton')
      }
      width="!max-w-[600px]"
      headerTitle={
        data
          ? t('AccountSetting.UpdateModalTitle')
          : t('AccountSetting.AddModalTitle')
      }
      modal={modal}
      setDataClear={setData}
    >
      <Formik
        enableReinitialize
        validationSchema={AcademyValidationSchema()}
        initialValues={initialValues}
        onSubmit={(values) => {
          OnSubmit(values);
        }}
        innerRef={formikRef as React.Ref<FormikProps<FormikValues>>}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form>
              <div className="grid grid-cols-2 gap-4 pb-4">
                {fieldObject.map((language, index) => {
                  return (
                    <div
                      className="flex flex-col gap-4"
                      key={`academy_${index + 1}`}
                    >
                      <InputField
                        key={`${language.key}_name`}
                        isCompulsory
                        placeholder={t(
                          'CoursesManagement.CreateCourse.namePlaceHolder'
                        )}
                        type="text"
                        value={values[language.name]}
                        label={`${t('AccountSetting.AcademyNameLabel')}( ${
                          language.label
                        } )`}
                        name={language.name}
                        isLoading={isLoading}
                      />
                    </div>
                  );
                })}
              </div>
              <Map
                isCompulsory
                setFieldValue={setFieldValue}
                setLatLng={setLatLng}
                name="location"
                center={{
                  lng: Number(values.longitude),
                  lat: Number(values.latitude),
                }}
                locationLabel={t('Trainer.invoice.trainerLocation')}
                locationValue={currentAcademy?.location_italian ?? ''}
                isLoading={isLoading}
              />
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default AddEditAcademyModal;
