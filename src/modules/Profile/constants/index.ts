import { ConnectedDataProps } from 'modules/Profile/types';
import { useTranslation } from 'react-i18next';
// this code not in use
export const StatusList = () => {
  const { t } = useTranslation();
  return [
    { value: 'ACTIVE', label: t('Status.active') },
    { value: 'INACTIVE', label: t('Status.inactive') },
  ];
};
export const genderOption = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

// Account settings
export const connectData: () => ConnectedDataProps[] = () => {
  const { t } = useTranslation();
  return [
    {
      icon: 'zoomIcon',
      label: t('Calendar.connection.zoomTitle'),
      provider: 'zoom',
    },
    {
      icon: 'teamsIcon',
      label: t('Calendar.connection.MicrosoftTitle'),
      provider: 'microsoft_calendar',
    },
    {
      icon: 'googleMeetIcon',
      label: t('Calendar.connection.GoogleTitle'),
      provider: 'google_calendar',
    },
    {
      icon: 'icalIcon',
      label: t('Calendar.connection.IcalendarTitle'),
      provider: 'icalendar',
    },
  ];
};

// view profile
export const UserDetails = () => {
  const { t } = useTranslation();
  return [
    { label: t('UserProfile.viewProfile.fullNameLabel'), key: 'full_name' },
    { label: t('UserProfile.viewProfile.emailIdLabel'), key: 'email' },
    { label: t('UserProfile.viewProfile.userNameLabel'), key: 'username' },
    { label: t('UserProfile.viewProfile.dobLabel'), key: 'birth_date' },
    { label: t('UserProfile.viewProfile.genderLabel'), key: 'gender' },
    { label: t('UserProfile.viewProfile.contactLabel'), key: 'contact' },
    { label: t('UserProfile.viewProfile.addressLabel'), key: 'address1' },
    { label: t('UserProfile.viewProfile.address2Label'), key: 'address2' },
    { label: t('UserProfile.viewProfile.countryLabel'), key: 'country' },
    { label: t('UserProfile.viewProfile.stateLabel'), key: 'state' },
    { label: t('UserProfile.viewProfile.cityLabel'), key: 'city' },
    { label: t('UserProfile.viewProfile.zipCodeLabel'), key: 'zip' },
    { label: t('UserProfile.viewProfile.statusLabel'), key: 'active' },
  ];
};
