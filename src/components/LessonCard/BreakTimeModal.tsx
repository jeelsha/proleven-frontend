import {
  FieldArray,
  FieldArrayRenderProps,
  Form,
  Formik,
  FormikValues,
} from 'formik';
import _ from 'lodash';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** components **
import Button from 'components/Button/Button';
import DatePicker from 'components/FormElement/datePicker';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';

// ** axios hooks **
import { useAxiosPost } from 'hooks/useAxios';

// ** types **
import { BreakTimeModalProps } from './types';

// ** validation **
import { BreakTimeValidationSchema } from './validation';

// ** date-fns
import { parseISO } from 'date-fns';

// ** css **
import './css/index.css';

const BreakTimeModal = ({
  breakTimeModal,
  data,
  participateSlug,
  refetch,
  lesson_session_id,
}: BreakTimeModalProps) => {
  const { t } = useTranslation();
  const [addBreakTime] = useAxiosPost();

  const [customErrors, setCustomErrors] = useState<{ [key: string]: unknown }[]>();
  const [indexOfError, setIndexOfError] = useState<(number | null)[] | undefined>();
  const zonedTime = data?.start_time ? parseISO(data?.start_time) : undefined;
  const zonedTimeEnd = data?.end_time ? parseISO(data?.end_time) : undefined;
  const initialValue = {
    breaks: [
      {
        break_in: '',
        break_out: '',
      },
    ],
  };

  const checkBreakOverlap = (
    existingBreaks: { break_in: string; break_out: string }[]
  ) => {
    const cloneForErrors: { [key: string]: unknown }[] = [...existingBreaks];
    const isOverlap =
      existingBreaks.length > 1
        ? existingBreaks.every((existingBreak, index) => {
            const existingStartTime = new Date(existingBreak.break_in);
            const existingEndTime = new Date(existingBreak.break_out);
            const nextBreaks = existingBreaks.slice(index + 1);
            return nextBreaks.every((newBreak, ind) => {
              const newStartTime = new Date(newBreak.break_in);
              const newEndTime = new Date(newBreak.break_out);
              if (
                (newStartTime >= existingStartTime &&
                  newStartTime < existingEndTime) ||
                (newEndTime > existingStartTime && newEndTime <= existingEndTime) ||
                (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
              ) {
                cloneForErrors[ind + 1].isError = true;
                return true;
              }
              delete cloneForErrors[index].isError;
              return false;
            });
          })
        : existingBreaks.every((existingBreak, index) => {
            const existingStartTime = new Date(existingBreak.break_in);
            const existingEndTime = new Date(existingBreak.break_out);
            const sessionStartDate = new Date(data?.start_time ?? '');
            const sessionEndDate = new Date(data?.end_time ?? '');
            if (
              existingEndTime < existingStartTime ||
              existingStartTime < sessionStartDate ||
              existingEndTime > sessionEndDate
            ) {
              cloneForErrors[index].isError = true;
              return true;
            }
            delete cloneForErrors[index].isError;

            return false;
          });
    return { isOverlap, cloneForErrors };
  };

  const OnSubmit = async (userBreakData: FormikValues) => {
    const { isOverlap, cloneForErrors } = checkBreakOverlap(userBreakData.breaks);

    if (!isOverlap) {
      const objToPass = {
        lesson_session_id: lesson_session_id ?? data?.id,
        breaks: userBreakData.breaks,
      };
      const { error } = await addBreakTime(
        `/course/participates/break/${participateSlug}`,
        objToPass
      );
      if (!error) {
        breakTimeModal.closeModal();
        if (refetch) {
          refetch?.();
        }
      }
    } else {
      setCustomErrors(cloneForErrors);
    }
  };

  useEffect(() => {
    const errorIndex = customErrors
      ?.map((data, index) => {
        return data.isError ? index : null;
      })
      .filter((obj) => obj !== null);
    setIndexOfError(errorIndex);
  }, [customErrors]);

  const getNewDate = (date: Date, dateTime: string) => {
    if (data && date) {
      const sessionDate =
        dateTime === 'start' ? new Date(data?.start_time) : new Date(data?.end_time);
      const updatedDate = new Date(date);
      updatedDate.setDate(sessionDate.getDate());
      updatedDate.setMonth(sessionDate.getMonth());
      updatedDate.setFullYear(sessionDate.getFullYear());

      return updatedDate;
    }
  };

  const renderAddButton = (index: number, arrayHelpers: FieldArrayRenderProps) => {
    return (
      <Button
        className={`${index === 0 ? 'mt-7 ' : ''} addIconBreakCard`}
        onClickHandler={() => {
          arrayHelpers.push(initialValue.breaks[0]);
        }}
      >
        <Image iconName="plusIcon" iconClassName="w-full h-full" />
      </Button>
    );
  };

  const renderDeleteButton = (
    index: number,
    arrayHelpers: FieldArrayRenderProps
  ) => {
    return (
      <Button
        className={`${
          index === 0 ? 'mt-7 ' : ''
        } deleteIconBreakCard dangerBorder button`}
        onClickHandler={() => {
          arrayHelpers.remove(index);
        }}
      >
        <Image iconName="deleteIcon" iconClassName="w-full h-full" />
      </Button>
    );
  };

  const fixDropdownPosition = {
    strategy: 'fixed',
  };

  return (
    <Modal
      closeOnEscape
      headerTitle={t('breakTimeModal.Title')}
      headerSubText={t('breakTimeModal.SubTitle')}
      modal={breakTimeModal}
    >
      <Formik
        enableReinitialize
        validationSchema={BreakTimeValidationSchema()}
        initialValues={initialValue}
        onSubmit={(dateData) => OnSubmit(dateData)}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form className="grid gap-2">
              <FieldArray
                name="breaks"
                render={(arrayHelpers) => {
                  return values.breaks.map((field, index) => (
                    <Fragment key={`Breaks_${index + 1}`}>
                      <div className="flex justify-between align-bottom gap-4">
                        <div className="flex-1">
                          <DatePicker
                            label={t('breakTimeModal.datePicker.StartTimeLabel')}
                            timeInterval={1}
                            name={`breaks[${index}].break_in`}
                            minTime={data?.start_time ? zonedTime : undefined}
                            maxTime={data?.end_time ? zonedTimeEnd : undefined}
                            isTimePicker
                            showTimeSelectOnly
                            dateFormat="h:mm aa"
                            placeholder={t(
                              'breakTimeModal.datePicker.StartTimePlaceHolder'
                            )}
                            selectedDate={
                              field?.break_in ? new Date(field.break_in) : undefined
                            }
                            onChange={(date) => {
                              if (date) {
                                const newDate = getNewDate(date, 'start');
                                setFieldValue(`breaks[${index}].break_in`, newDate);
                              }
                            }}
                            popperProps={fixDropdownPosition}
                          />
                        </div>
                        <div className="flex-1">
                          <DatePicker
                            label={t('breakTimeModal.datePicker.EndTimeLabel')}
                            timeInterval={1}
                            name={`breaks[${index}].break_out`}
                            minTime={data?.start_time ? zonedTime : undefined}
                            maxTime={data?.end_time ? zonedTimeEnd : undefined}
                            isTimePicker
                            showTimeSelectOnly
                            placeholder={t(
                              'breakTimeModal.datePicker.EndTimePlaceHolder'
                            )}
                            dateFormat="h:mm aa"
                            selectedDate={
                              field?.break_out
                                ? new Date(field.break_out)
                                : undefined
                            }
                            onChange={(date) => {
                              if (date && data?.start_time) {
                                const newDate = getNewDate(date, 'end');
                                setFieldValue(`breaks[${index}].break_out`, newDate);
                              }
                            }}
                            popperProps={fixDropdownPosition}
                          />
                        </div>

                        {values.breaks.length === 1 ||
                        index === values.breaks.length - 1
                          ? renderAddButton(index, arrayHelpers)
                          : renderDeleteButton(index, arrayHelpers)}
                      </div>
                      <span className="error-message">
                        {!_.isEmpty(indexOfError) &&
                          indexOfError?.map((ind) =>
                            ind === index
                              ? t('breakTimeModal.datePicker.timeOverlapValidation')
                              : ''
                          )}
                      </span>
                    </Fragment>
                  ));
                }}
              />

              <div className="flex justify-center gap-4 mt-14">
                <Button variants="primary" type="submit" className="addButton">
                  {t('Button.submit')}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default BreakTimeModal;
