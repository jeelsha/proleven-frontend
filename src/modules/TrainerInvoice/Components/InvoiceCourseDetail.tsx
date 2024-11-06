//  ** hooks **
import { useTranslation } from 'react-i18next';

import Image from 'components/Image';

// ** type **
import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import { REACT_APP_DATE_FORMAT } from 'config';
import { format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosPost } from 'hooks/useAxios';
import _ from 'lodash';
import { ITrainerInvoice } from '../types';
import { BonusValidationSchema } from '../validation';

const InvoiceCourseDetail = (props: {
  courseDetail: ITrainerInvoice['trainerCourse'];
  slug?: string;
  courseBonus?: string;
  trainerId?: string;
  userRole?: string;
  trainerType: string;
  reFetchTrainer: () => void;
}) => {
  const {
    courseDetail,
    courseBonus,
    slug,
    trainerId,
    reFetchTrainer,
    userRole,
    trainerType,
  } = props;

  const initialValue = courseBonus
    ? {
        bonus: courseBonus,
      }
    : {
        bonus: 0,
      };
  const { t } = useTranslation();
  const [updatedBonus] = useAxiosPost();
  const joinStartEndDate = (start: string, end: string) => {
    const parseStart = parseISO(start);
    const parseEnd = parseISO(end);
    const startDate = format(
      utcToZonedTime(parseStart, 'UTC'),
      REACT_APP_DATE_FORMAT as string
    );
    const endDate = format(
      utcToZonedTime(parseEnd, 'UTC'),
      REACT_APP_DATE_FORMAT as string
    );
    return startDate.concat('-', endDate);
  };

  const courseBasicDetail = [
    {
      label: t('Trainer.invoice.courseName'),
      value: courseDetail?.title ?? '-',
    },
    {
      label: t('Trainer.invoice.courseCode'),
      value: courseDetail?.code ?? '-',
    },
    {
      label: t('Trainer.invoice.courseCategory'),
      value: courseDetail?.courseCategory?.name ?? '-',
    },
    {
      label: t('Trainer.invoice.courseSubCategory'),
      value: courseDetail?.courseSubCategory?.name ?? '-',
    },
  ];

  const courseStartTypeDetail = [
    {
      label: t('Trainer.invoice.courseType'),
      value: courseDetail?.type ?? '-',
    },
    {
      label: t('Trainer.invoice.courseTrainerType'),
      value: trainerType,
    },
    {
      label: t('Trainer.invoice.courseStartEndDate'),
      value:
        (courseDetail?.end_date &&
          courseDetail?.start_date &&
          joinStartEndDate(courseDetail?.start_date, courseDetail?.end_date)) ??
        '-',
    },
  ];

  const handleBonusAdd = async (data: FormikValues) => {
    if (data) {
      const trainerOrder = await updatedBonus('/trainer/bonus', {
        bonus: data?.bonus,
        slug,
        trainer_id: trainerId,
      });
      if (trainerOrder) {
        reFetchTrainer();
      }
    }
  };

  return (
    <div className="flex">
      <div className="h-24 w-[169px] rounded-md">
        <Image
          src={courseDetail?.image ?? '/images/no-image.png'}
          imgClassName="block block w-full h-full rounded-md"
          serverPath
        />
      </div>
      <div className="ps-6 max-w-[calc(100%_-_100px)] w-full">
        <div className="group grid grid-cols-2 1200:grid-cols-4 gap-4">
          {courseBasicDetail?.map((data) => (
            <div className="">
              <span className="block text-sm text-dark/50 mb-1 font-medium">
                {data?.label}
              </span>
              <p className="text-sm text-dark font-semibold">{data?.value}</p>
            </div>
          ))}
        </div>
        <div className="group grid grid-cols-2 1200:grid-cols-4 gap-4">
          {courseStartTypeDetail?.map((data) => (
            <div className="border-t border-solid border-borderColor pt-5 mt-5">
              <span className="block text-sm text-dark/50 mb-1 font-medium ">
                {data?.label}
              </span>
              <p className="text-sm text-dark font-semibold capitalize">
                {data?.value}
              </p>
            </div>
          ))}

          <div className="border-t border-solid border-borderColor pt-5 mt-5">
            <span className="block text-sm text-dark/50 mb-1 font-medium">
              {t('Trainer.invoice.courseBonusTitle')}
            </span>
            <div className="flex items-center gap-5">
              <Formik
                initialValues={initialValue}
                validationSchema={BonusValidationSchema()}
                onSubmit={(data) => handleBonusAdd(data)}
                enableReinitialize
              >
                {({ values, setFieldValue }) => {
                  const isDisable = _.isNull(values.bonus);
                  return (
                    <Form className="flex gap-x-2">
                      <InputField
                        name="bonus"
                        type="number"
                        isDisabled={userRole === 'Trainer'}
                        value={values.bonus}
                        onChange={(e) => {
                          setFieldValue('bonus', e.target.value);
                        }}
                        className="inputField max-w-[120px] !py-2"
                        placeholder={t('Trainer.invoice.courseBonusPlaceholder')}
                      />
                      {userRole !== 'Trainer' && (
                        <Button
                          type="submit"
                          disabled={isDisable}
                          value={t('Trainer.invoice.courseAddButtonTitle')}
                          small
                          variants="primary"
                          className={`${isDisable ? 'opacity-50' : ''} min-w-[80px]`}
                        />
                      )}
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCourseDetail;
