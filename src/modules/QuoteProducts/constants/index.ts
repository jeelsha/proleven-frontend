import { TFunction } from 'i18next';

export enum InvoiceStatus {
  NotCompleted = 'Not Completed',
  Completed = 'Completed',
  Hold = 'Hold',
  Invoiced = 'Invoiced',
}

export const ProductStatus = (t: TFunction<'translation', undefined>) => {
  return [
    {
      label: t('ProductFilter.invoiced'),
      value: 'Invoiced',
    },
    {
      label: t('ProductFilter.completed'),
      value: 'Completed',
    },
    {
      label: t('ProductFilter.hold'),
      value: 'Hold',
    }
  ];
};
export const ProductType = (t: TFunction<'translation', undefined>) => {
  return [
    {
      label: t('Header.notificationDropdown.generalTab'),
      value: 'general',
    },
    {
      label: t('CourseManagement.createSurvey.courseOption'),
      value: 'course',
    },
  ];
};
