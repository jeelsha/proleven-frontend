import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Checkbox from 'components/FormElement/CheckBox';
import InputField from 'components/FormElement/InputField';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { isAfter, parseISO } from 'date-fns';
import { Form, Formik } from 'formik';
import { useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { CourseStatus } from 'modules/Courses/Constants';
import { AdminTrainerAcceptSchema } from 'modules/Courses/validation/AdminTrainerAcceptSchema';
import { useTranslation } from 'react-i18next';
import { formatCurrency, getCurrencySymbol } from 'utils';
import SessionCard from './SessionCard';
import { IForm, ITrainerCardProps } from './types';

const TrainerCard = ({
  item,
  index,
  formValue,
  handleLumpsumFunction,
  showLumpsumInBundle,
  showLumpsumField,
  profitIcon,
  selectedLessons,
  setSelectedLessons,
  slug,
  courseType,
  courseStatus,
  refetch,
  refetchShowTrainer,
  isRejected,
  paramSlug,
}: ITrainerCardProps) => {
  const { t } = useTranslation();
  const cancelRequestModal = useModal();
  const [lumpsumApi] = useAxiosPost();
  const isLessonChecked = (trainerId: number, lessonSlug: string) => {
    const trainerEntry = selectedLessons.find(
      (entry) => entry.trainerId === trainerId
    );
    return trainerEntry ? trainerEntry.lesson_slug.includes(lessonSlug) : false;
  };

  const isTrainerAbsent = item?.assignedSession?.every(
    (trainer) => trainer?.available === false
  );

  const getTotalAmount = (Amount: number, ReimbursementFees: number) => {
    const price = Number(Amount) + Number(ReimbursementFees);
    return price;
  };

  const checkAcademic =
    courseType === 'academic'
      ? courseStatus === CourseStatus.publish &&
        isAfter(
          new Date(),
          parseISO(item?.assignedSession?.[0]?.courses?.start_date)
        )
      : courseType === 'private';

  const renderDeleteModelComponent = (): JSX.Element | undefined => {
    return cancelRequestModal.isOpen ? (
      <ConfirmationPopup
        modal={cancelRequestModal}
        bodyText={t('cancelLumpsumRequest')}
        variants="primary"
        confirmButtonText={t('Button.deleteButton')}
        confirmButtonVariant="danger"
        deleteTitle={t('Button.deleteTitle')}
        cancelButtonText={t('Button.cancelButton')}
        cancelButtonFunction={cancelRequestModal.closeModal}
        confirmButtonFunction={handleCancelLumpsumRequest}
      />
    ) : (
      <></>
    );
  };

  const handleCancelLumpsumRequest = async () => {
    const values = cancelRequestModal?.modalData as unknown as IForm;
    const apiUrl = slug
      ? `/course/trainers/lump-sump-amount/${slug}`
      : `/course/trainers/lump-sump-amount/${paramSlug}`;
    const temp: { [key: string]: unknown } = {
      trainer_id: item?.user?.id,
      is_lumpsum_selected: !values?.formValues?.[index]?.isLumpsumCheck,
    };
    if (slug) {
      temp.bundle = true;
    }
    const { error } = await lumpsumApi(apiUrl, temp);
    if (!error) refetch();
  };
  return (
    <Formik
      initialValues={formValue}
      key={`${item?.user?.id}-trainer`}
      enableReinitialize
      validationSchema={AdminTrainerAcceptSchema(t, index)}
      onSubmit={(values) => {
        handleLumpsumFunction(item?.user?.id, values?.formValues?.[index]);
      }}
    >
      {({ values, setFieldValue }) => {
        return (
          <Form>
            {!isRejected && !isTrainerAbsent && (
              <CustomCard
                cardClass="!shadow-none border border-solid border-gray-300/70"
                title={t('feesCalculation')}
                minimal
                headerExtra={
                  showLumpsumField || showLumpsumInBundle ? (
                    <Checkbox
                      text={t('lumpsumAmount')}
                      disabled={
                        item?.is_lumpsum_select &&
                        item?.assignedSession?.[0]?.assigned_to_status !== 'draft'
                      }
                      check={!!values?.formValues?.[index]?.isLumpsumCheck}
                      onChange={() => {
                        if (
                          item?.is_lumpsum_select &&
                          values?.formValues?.[index]?.isLumpsumCheck
                        ) {
                          cancelRequestModal?.openModalWithData?.(values);
                        } else {
                          return setFieldValue(
                            `formValues[${index}].isLumpsumCheck`,
                            !values?.formValues?.[index]?.isLumpsumCheck
                          );
                        }
                      }}
                      labelClass="rounded-md truncate flex-[1_0_0%] capitalize"
                      id={`formValues[${index}].isLumpsumCheck`}
                      name={`formValues[${index}].isLumpsumCheck`}
                    />
                  ) : (
                    <></>
                  )
                }
              >
                <>
                  <div className="border-t border-solid border-dark/20 pt-5">
                    {!item?.is_lumpsum_select ? (
                      <div className="flex flex-wrap gap-12">
                        <div className="w-fit relative before:absolute before:content-[''] before:-right-6 before:top-0 before:h-full before:w-px before:bg-gray-200 last:before:opacity-0">
                          <p className="text-sm text-primary font-medium mb-2 block">
                            {t('UserManagement.addEditUser.hourlyRate')} :
                          </p>
                          <div className="flex gap-7">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">
                                {t('trainer.hours')}
                              </p>
                              <span className="text-sm text-dark font-bold">
                                {item?.user?.hours ?? 0}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">
                                {t('CoursesManagement.CreateCourse.price')}
                              </p>
                              <span className="text-sm text-dark font-bold">
                                {getCurrencySymbol('EUR')}{' '}
                                {formatCurrency(
                                  Number(item?.user?.trainerHourlyCharge ?? 0),
                                  'EUR'
                                )}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">
                                {t('totalPrice')}
                              </p>
                              <span className="text-sm text-dark font-bold">
                                {getCurrencySymbol('EUR')}{' '}
                                {formatCurrency(
                                  Number(item?.user?.hourlyRate),
                                  'EUR'
                                ) ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-fit relative before:absolute before:content-[''] before:-right-6 before:top-0 before:h-full before:w-px before:bg-gray-200 last:before:opacity-0">
                          <p className="text-sm text-primary font-medium mb-2 block">
                            {t('reimbursementFees')} :
                          </p>
                          <div className="flex gap-7">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">
                                {t('Payment.days')}
                              </p>
                              <span className="text-sm text-dark font-bold">
                                {item?.user?.totalDays ?? 0}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">KM</p>
                              <span className="text-sm text-dark font-bold">
                                {item?.user?.totalDistance ?? 0}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">
                                {t('CoursesManagement.CreateCourse.price')}
                              </p>
                              <span className="text-sm text-dark font-bold">
                                {getCurrencySymbol('EUR')}{' '}
                                {formatCurrency(
                                  Number(item?.user?.travelFees),
                                  'EUR'
                                ) ?? 0}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">
                                {t('trainer.totalFees')}
                              </p>
                              <span className="text-sm text-dark font-bold">
                                {getCurrencySymbol('EUR')}{' '}
                                {formatCurrency(
                                  Number(item?.user?.totalTravelFees),
                                  'EUR'
                                ) ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-fit relative before:absolute before:content-[''] before:-right-6 before:top-0 before:h-full before:w-px before:bg-gray-200 last:before:opacity-0">
                          <p className="text-sm text-primary font-medium mb-2 block">
                            {t('netTotal')} :
                          </p>
                          <div className="flex gap-7">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">
                                {t('Dashboard.courses.descriptionText1')}
                              </p>
                              <span className="text-sm text-dark font-bold">
                                {getCurrencySymbol('EUR')}{' '}
                                {formatCurrency(
                                  Number(item?.user?.totalNetFees),
                                  'EUR'
                                ) ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        {checkAcademic && Number(item?.user?.courseRevenue) !== 0 ? (
                          <div className="w-fit relative before:absolute before:content-[''] before:-right-6 before:top-0 before:h-full before:w-px before:bg-gray-200 last:before:opacity-0">
                            {profitIcon(item?.user?.profit, t)}
                            <div className="flex gap-7">
                              <div className="flex flex-col gap-1">
                                <p className="text-sm text-dark/70 font-medium">
                                  {t('trainer.courseRevenue')}
                                </p>
                                <span className="text-sm text-dark font-bold">
                                  {getCurrencySymbol('EUR')}{' '}
                                  {formatCurrency(
                                    Number(item?.user?.courseRevenue),
                                    'EUR  '
                                  ) ?? 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          ''
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-12">
                        <div className="w-fit relative before:absolute before:content-[''] before:-right-6 before:top-0 before:h-full before:w-px before:bg-gray-200 last:before:opacity-0">
                          <p className="text-sm text-primary font-medium mb-2 block">
                            {t('lumpsumpDetails')} :
                          </p>
                          <div className="flex gap-7">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">
                                {t('amount')}
                              </p>
                              <span className="text-sm text-dark font-bold">
                                {getCurrencySymbol('EUR')}{' '}
                                {formatCurrency(Number(item?.amount ?? 0), 'EUR')}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">
                                {t('reimbursementFees')}
                              </p>
                              <span className="text-sm text-dark font-bold">
                                {getCurrencySymbol('EUR')}{' '}
                                {formatCurrency(
                                  Number(item?.reimbursement_amount ?? 0),
                                  'EUR'
                                )}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">
                                {t('Trainer.invoice.totalAmount')}
                              </p>
                              <span className="text-sm text-dark font-bold">
                                {getCurrencySymbol('EUR')}{' '}
                                {item?.amount &&
                                  formatCurrency(
                                    Number(
                                      getTotalAmount(
                                        Number(item.amount),
                                        item.reimbursement_amount
                                          ? Number(item.reimbursement_amount)
                                          : 0
                                      )
                                    ),
                                    'EUR'
                                  )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {checkAcademic && Number(item?.user?.courseRevenue) !== 0 ? (
                          <div className="w-fit">
                            {profitIcon(item?.user?.profit, t)}
                            <div className="flex gap-7">
                              <div className="flex flex-col gap-1">
                                <p className="text-sm text-dark/70 font-medium">
                                  {t('trainer.courseRevenue')}
                                </p>
                                <span className="text-sm text-dark font-bold">
                                  {getCurrencySymbol('EUR')}{' '}
                                  {formatCurrency(
                                    Number(item?.user?.courseRevenue),
                                    'EUR  '
                                  ) ?? 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          ''
                        )}
                      </div>
                    )}
                  </div>
                  {values?.formValues &&
                    values?.formValues[index]?.isLumpsumCheck &&
                    (showLumpsumField || showLumpsumInBundle) && (
                      <div>
                        <div className="mt-3 flex items-start gap-2.5">
                          <InputField
                            isCompulsory
                            prefix={getCurrencySymbol('EUR')}
                            label={t('amount')}
                            type="number"
                            value={values?.formValues?.[index]?.lumpsum_amount}
                            name={`formValues[${index}].lumpsum_amount`}
                            placeholder={t('amountPlaceholder')}
                          />
                          <InputField
                            prefix={getCurrencySymbol('EUR')}
                            label={t('reimbursementFees')}
                            type="number"
                            value={values?.formValues?.[index]?.reimbursement_fee}
                            name={`formValues[${index}].reimbursement_fee`}
                            placeholder={t('reimbursePlaceholder')}
                          />
                          <Button className="mt-7" variants="primary" type="submit">
                            {t('Button.saveButton')}
                          </Button>
                        </div>
                        {!item?.amount ? (
                          <p className="text-xs font-semibold block text-orange-600 mt-5">
                            {t('lumpsumNote')}
                          </p>
                        ) : (
                          <></>
                        )}
                      </div>
                    )}
                </>
              </CustomCard>
            )}
            <div className="grid 1400:grid-cols-3 xl:grid-cols-2  gap-3 mt-3">
              {item?.assignedSession?.map((data) => {
                return (
                  <SessionCard
                    refetchShowTrainer={refetchShowTrainer}
                    key={data?.id}
                    data={data}
                    isLessonChecked={isLessonChecked}
                    slug={slug}
                    setSelectedLessons={setSelectedLessons}
                    item={item}
                    values={values}
                    refetch={refetch}
                  />
                );
              })}
            </div>

            {item?.note ? (
              <div className="mt-3 p-4 bg-white border border-borderColor border-solid rounded-lg text-[14px]">
                <p>
                  <strong className="text-primary">{t('Quote.note.title')}: </strong>
                  {item?.note}
                </p>
              </div>
            ) : (
              ''
            )}
            {renderDeleteModelComponent()}
          </Form>
        );
      }}
    </Formik>
  );
};

export default TrainerCard;
