import CustomCard from 'components/Card';
import { Option } from 'components/FormElement/types';
import PageHeader from 'components/PageHeader/PageHeader';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosGet, useAxiosPatch } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import { getActiveUserDataApi } from 'modules/Auth/services';
import { InitialValues } from 'modules/Profile/ViewProfile/types';
import { ViewProfileValidationSchema } from 'modules/Profile/ViewProfile/validation';
import { ProfileCompanyDetailsValues } from 'modules/Profile/types';
import { formDataProps } from 'modules/UsersManagement/types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AuthUserType,
  getCurrentUser,
  setCredentials,
} from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { SetFieldValue } from 'types/common';
import AdminProfile from './components/AdminProfile';
import CompanyManagerProfile from './components/CompanyManagerProfile';
import TrainerProfile from './components/TrainerProfile';

type LatLngType = {
  lat: number;
  lng: number;
};

const ViewProfile = () => {
  const CurrentUser = useSelector(getCurrentUser);
  const [userUpdateApi, { isLoading }] = useAxiosPatch();
  const [profileGetApi] = useAxiosGet();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const updateTitle = useTitle();
  const language = useSelector(useLanguage);
  const ActiveCompany = useSelector(useCompany);

  const currentRoleId = CurrentUser?.role_id;
  const currentRoleName = CurrentUser?.role_name;

  const firstRender = useRef(false);
  const [companyData, setCompanyData] = useState([] as ProfileCompanyDetailsValues);
  const [latLng, setLatLng] = useState<LatLngType>({
    lat: 0,
    lng: 0,
  });
  const [options, setOptions] = useState<Option[]>([]);

  const { response: categories } = useQueryGetFunction('/course-sub-category', {
    option: {
      view: true,
    },
  });

  useEffect(() => {
    if (currentRoleName === ROLES.CompanyManager && firstRender.current) {
      firstRender.current = false;
      navigate(PRIVATE_NAVIGATION.dashboard.view.path);
    }
    firstRender.current = true;
  }, [ActiveCompany]);

  useEffect(() => {
    if (categories?.data?.data) {
      const data: Option[] = [];
      categories?.data?.data?.map(
        (item: {
          id: number;
          name: string;
          category: {
            name: string;
          };
        }) => {
          return data.push({
            label: `${item.name} (${item?.category?.name})`,
            value: item.id,
          });
        }
      );
      setOptions(data);
    }
  }, [categories?.data]);

  const GetManagersList = async () => {
    const { data } = await profileGetApi(`/managers/${CurrentUser?.username}`, {
      params: { role: currentRoleId, profile: true },
    });
    setCompanyData(data);
  };

  useEffect(() => {
    GetManagersList();
  }, []);

  const { getActiveUser } = getActiveUserDataApi();
  useEffect(() => {
    getActiveUser();
  }, [language?.language]);

  const initialValues: InitialValues = {
    first_name: CurrentUser?.first_name ?? '',
    last_name: CurrentUser?.last_name ?? '',
    email: CurrentUser?.email ?? '',
    contact: CurrentUser?.contact ?? '',
    profile_image: CurrentUser?.profile_image ?? '',
    role: currentRoleId,
    profile: true,
    ...(currentRoleName === ROLES.Trainer
      ? {
          trainer: {
            location: CurrentUser?.trainer?.location ?? '',
            latitude: CurrentUser?.trainer?.latitude ?? '',
            longitude: CurrentUser?.trainer?.longitude ?? '',
            hourly_rate: CurrentUser?.trainer?.hourly_rate ?? '',
            reimbursement_threshold:
              CurrentUser?.trainer?.reimbursement_threshold ?? 65,
            travel_reimbursement_fee:
              CurrentUser?.trainer?.travel_reimbursement_fee ?? '',
            sub_categories: CurrentUser?.trainer?.trainerSubCategory?.map(
              (item) => item?.sub_category?.id
            ) ?? [''],
            vat_number: CurrentUser?.trainer?.vat_number ?? '',
            codice_fiscale: CurrentUser?.trainer?.codice_fiscale ?? '',
          },
          trainer_attachment:
            CurrentUser?.trainer?.trainerAttachment?.map(
              (item) => item?.attachment_url
            ) ?? [],
        }
      : {}),
    ...(currentRoleName === ROLES.CompanyManager && {
      manager: { job_title: CurrentUser?.manager?.job_title ?? '' },
      company_data: companyData?.company_manager,
    }),
  };

  const { t } = useTranslation();
  const OnSubmit = async (data: FormikValues) => {
    let user: formDataProps = {};
    if (currentRoleName === ROLES.Trainer) {
      let trainer = {};
      trainer = JSON.stringify({
        location: data?.trainer?.location,
        latitude: latLng?.lat?.toString(),
        longitude: latLng?.lng?.toString(),
        hourly_rate: data?.trainer?.hourly_rate,
        travel_reimbursement_fee: data?.trainer?.travel_reimbursement_fee || null,
        reimbursement_threshold: data?.trainer?.reimbursement_threshold,
        sub_categories: data?.trainer?.sub_categories,
        vat_number: data?.trainer?.vat_number ?? '',
        codice_fiscale: data?.trainer?.codice_fiscale ?? '',
      });
      user.trainer_attachment = data.trainer_attachment;
      user = { ...data, trainer };
    } else if (currentRoleName === ROLES.CompanyManager) {
      user = { ...data, manager: JSON.stringify(data.manager) };
      delete user.company_data;
    } else {
      user = { ...data };
      delete user.trainer;
    }
    const formData = new FormData();
    Object.entries(user).forEach(([key, value]) => {
      if (key !== 'trainer_attachment') formData.append(key, value as string | Blob);
    });
    data?.trainer_attachment?.forEach((item: string) => {
      formData.append(`trainer_attachment`, item);
    });

    const response = await userUpdateApi(
      `/users/${CurrentUser?.username}`,
      formData
    );
    const updatedData: AuthUserType = response?.data;
    dispatch(setCredentials({ user: { ...CurrentUser, ...updatedData } }));
    if (!response?.error) {
      await getActiveUser();
    }
  };

  const renderFormRoleWise = (
    values: InitialValues,
    setFieldValue: SetFieldValue
  ) => {
    switch (currentRoleName) {
      case ROLES.CompanyManager:
        return (
          <CompanyManagerProfile
            values={values}
            setFieldValue={setFieldValue}
            isLoading={isLoading}
            company_data={initialValues.company_data}
          />
        );

      case ROLES.Trainer:
        return (
          <TrainerProfile
            values={values}
            setFieldValue={setFieldValue}
            isLoading={isLoading}
            categories={options}
            setLatLng={setLatLng}
          />
        );

      default:
        return (
          <AdminProfile
            values={values}
            setFieldValue={setFieldValue}
            isLoading={isLoading}
          />
        );
    }
  };
  updateTitle(t('ProfileSetting.ProfileTitle'));

  return (
    <section className="mt-5">
      <div className="container">
        <PageHeader
          parentClass={`${
            currentRoleName === ROLES.Admin ||
            currentRoleName === ROLES.TrainingSpecialist ||
            currentRoleName === ROLES.PrivateIndividual
              ? 'max-w-[500px] mx-auto'
              : ''
          }`}
          text={t('ProfileSetting.ProfileTitle')}
          small
        />
        <CustomCard
          cardClass={`${
            currentRoleName === ROLES.Admin ||
            currentRoleName === ROLES.TrainingSpecialist ||
            currentRoleName === ROLES.PrivateIndividual
              ? 'max-w-[500px] mx-auto'
              : ''
          }`}
          minimal
        >
          <Formik
            enableReinitialize
            validationSchema={ViewProfileValidationSchema(currentRoleName)}
            initialValues={initialValues}
            onSubmit={(values) => {
              OnSubmit(values);
            }}
          >
            {({ values, setFieldValue }) => (
              <Form
                className={` grid grid-cols-1 gap-6 items-start ${
                  currentRoleName === ROLES.CompanyManager ? ' 1200:grid-cols-2' : ''
                } `}
              >
                {renderFormRoleWise(values, setFieldValue)}
              </Form>
            )}
          </Formik>
        </CustomCard>
      </div>
    </section>
  );
};
export default ViewProfile;
