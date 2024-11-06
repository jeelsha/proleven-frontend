//  ** hooks **
import { useTranslation } from 'react-i18next';

// ** config **

// ** type **
import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import { REACT_APP_DATE_FORMAT } from 'config';
import { format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import { Form, Formik, FormikValues } from 'formik';
import { useAxiosPost } from 'hooks/useAxios';
import _ from 'lodash';
import { TrainerType } from 'modules/Courses/types/TrainersAndRooms';
import { ITrainerInvoice } from '../types';
import { BonusValidationSchema } from '../validation';

const TrainerCourseBundleDetail = (props: {
  courseDetail: ITrainerInvoice['trainerCourseBundle'];
  slug?: string;
  courseBonus?: string;
  trainerId?: string;
  trainerType: string;
  userRole?: string;
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
      label: t('Trainer.invoice.courseBundleName'),
      value: courseDetail?.title ?? '-',
    },
    {
      label: t('Trainer.invoice.courseBundleStartEndDate'),
      value:
        (courseDetail?.end_date &&
          courseDetail?.start_date &&
          joinStartEndDate(courseDetail?.start_date, courseDetail?.end_date)) ??
        '-',
    },
    {
      label: t('Trainer.invoice.courseTrainerType'),
      value: trainerType === 'true' ? TrainerType.Optional : TrainerType.Main,
    },
  ];
  const handleBonusAdd = async (data: FormikValues) => {
    if (data) {
      await updatedBonus('/trainer/bonus', {
        bonus: data?.bonus,
        slug,
        trainer_id: trainerId,
      });
      reFetchTrainer();
    }
  };

  return (
    <div className="flex">
      <div className="h-24 w-[169px] rounded-md" />
      <div className="ps-6 max-w-[calc(100%_-_100px)] w-full">
        <div className="group grid grid-cols-2 1200:grid-cols-4 gap-4">
          {courseBasicDetail?.map((data) => (
            <div className="">
              <span className="block text-sm text-dark/50 mb-1 font-medium">
                {data?.label}
              </span>
              <p className="text-sm text-dark font-semibold">{data?.value}</p>
              <div className="border-t border-solid border-borderColor pt-5 mt-5" />
            </div>
          ))}
        </div>
        <div className="group grid grid-cols-2 1200:grid-cols-4 gap-4">
          <div className="">
            <span className="block text-sm text-dark/50 mb-1 font-medium">
              {t('Trainer.invoice.courseBonusTitle')}
            </span>
            <div className="flex items-center gap-5">
              <Formik
                initialValues={{ bonus: courseBonus }}
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

export default TrainerCourseBundleDetail;
