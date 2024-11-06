import {
  FILE_SUPPORTED_FORMATS,
  IMAGE_SUPPORTED_FORMATS,
  VIDEO_SUPPORTED_FORMATS,
} from 'constants/filesupport.constant';
import { TFunction } from 'i18next';

export const fileAcceptType = {
  image: IMAGE_SUPPORTED_FORMATS,
  video: VIDEO_SUPPORTED_FORMATS,
  document: FILE_SUPPORTED_FORMATS,
};

export enum AcademyTypeEnum {
  prolevenSRI = 'proleven_sri',
  prolevenGmBH = 'proleven_gmbh',
}

export const OrderStatus = (t: TFunction<'translation', undefined>) => {
  return [
    {
      label: t('filterTypeOpen'),
      value: 'Open',
    },
    {
      label: t('filterTypeClosed'),
      value: 'Closed',
    },
    {
      label: t('filterTypePartiallyClosed'),
      value: 'Partially Closed',
    },
  ];
};
export const OrderType = (t: TFunction<'translation', undefined>) => {
  return [
    {
      label: t('filterClientPurchaseTitle'),
      value: 'Client Purchase Order',
    },
    {
      label: t('filterProlevenTitle'),
      value: 'Proleven Order',
    },
  ];
};
export const OrderRoleType = (t: TFunction<'translation', undefined>) => {
  return [
    {
      label: t('filterProlevenPrivate'),
      value: 'Private',
    },
    {
      label: t('filterProlevenAcademic'),
      value: 'Academy',
    },
  ];
};

export const PONeededType = (t: TFunction<'translation', undefined>) => {
  return [
    {
      label: t('confirmationChoices.yesOption'),
      value: 'true',
    },
    {
      label: t('confirmationChoices.noOption'),
      value: 'false',
    },
  ];
};

export const ClientPOType = (t: TFunction<'translation', undefined>) => {
  return [
    {
      label: t('empty.title'),
      value: 'empty',
    },
    {
      label: t('notEmpty.title'),
      value: 'not empty',
    },
  ];
};
export const FundedByType = (t: TFunction<'translation', undefined>) => {
  return [
    {
      label: t('empty.title'),
      value: 'empty',
    },
    {
      label: t('notEmpty.title'),
      value: 'not empty',
    },
  ];
};
export const IssuedBy = (t: TFunction<'translation', undefined>) => {
  return [
    {
      label: t('ClientManagement.clientForm.fieldInfos.academyOptionSRI'),
      value: AcademyTypeEnum.prolevenSRI,
    },
    {
      label: t('ClientManagement.clientForm.fieldInfos.academyOptionGmbH'),
      value: AcademyTypeEnum.prolevenGmBH,
    },
  ];
};

export const SdiCode = (t: TFunction<'translation', undefined>) => {
  return [
    {
      label: t('empty.title'),
      value: 'empty',
    },
    {
      label: t('notEmpty.title'),
      value: 'not empty',
    },
  ];
};
