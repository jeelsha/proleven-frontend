import { ROLES } from 'constants/roleAndPermission.constant';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { StageNameConstant } from '../enum';
import { MemberValueType } from '../types';

export const cardValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    title: Yup.string().required(t('ProjectManagement.Validation.Card.title')),
  });
};

export const columnValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    title: Yup.string().required(t('ProjectManagement.Validation.Column.title')),
  });
};

export const memberValidationSchema = (
  memberList: MemberValueType[],
  t: TFunction<any, undefined>
) => {
  return Yup.object().shape({
    isChecked: Yup.array().test(
      'check-validation',
      t('ProjectManagement.Validation.memberCheckBox'),
      (value) => {
        let isSales = false;
        let isTrainingSpec = false;
        value?.forEach((item) => {
          const roleName = memberList.find((member) => member.id === Number(item))
            ?.role.name;
          if (roleName === ROLES.SalesRep) {
            isSales = true;
          }
          if (roleName === ROLES.TrainingSpecialist) {
            isTrainingSpec = true;
          }
        });
        if (isSales && isTrainingSpec) {
          return true;
        }
        return false;
      }
    ),
  });
};

export const DateFilterValidation = () => {
  const { t } = useTranslation();

  return Yup.object().shape({
    start_date: Yup.date()
      .nullable()
      .test({
        name: 'start_date_required',
        test(value) {
          const { end_date } = this.parent;
          if (end_date && !value) {
            return this.createError({
              path: 'start_date',
              message: t('CoursesManagement.Errors.Course.startDate'),
            });
          }
          return true;
        },
      }),
    end_date: Yup.date()
      .nullable()
      .test({
        name: 'end_date_required',
        test(value) {
          const { start_date } = this.parent;
          if (start_date && !value) {
            return this.createError({
              path: 'end_date',
              message: t('CoursesManagement.Errors.Course.endDate'),
            });
          }
          return true;
        },
      }),
  });
};

export const ReasonModalValidation = (
  t: TFunction<any, undefined>,
  stageName: string
) => {
  let object = {};
  if (stageName === StageNameConstant.CoursesStandby) {
    object = {
      reason_date: Yup.string().required(
        t('ProjectManagement.ReasonModal.validationDateMessage')
      ),
    };
  }
  return Yup.object().shape({
    ...object,
    reject_reason: Yup.string().required(
      t('ProjectManagement.ReasonModal.validationMessage')
    ),
  });
};

export const CardAttachmentValidation = (t: TFunction<any, undefined>) => {
  return Yup.object().shape({
    card_attachment: Yup.array().min(
      1,
      t('ProjectManagement.CardAttachment.validationMessage')
    ),
  });
};
