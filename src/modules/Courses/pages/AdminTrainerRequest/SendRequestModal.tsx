import Button from 'components/Button/Button';
import TextArea from 'components/FormElement/TextArea';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { isAfter, parseISO } from 'date-fns';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosPost } from 'hooks/useAxios';
import { CourseStatus } from 'modules/Courses/Constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { profitIcon } from '.';
import { IAdminTrainerRequest, sendRequestProps } from './types';

const SendRequestModal = ({
  modal,
  trainerData,
  currentTabTitle,
  refetch,
  params,
  setTrainerIds,
  bundleSlug,
  courseType,
  courseStatus,
}: sendRequestProps) => {
  const { t } = useTranslation();
  const trainer_ids = modal?.modalData as number[];
  const [sendMailTrainer, { isLoading }] = useAxiosPost();
  const [showTrainerData, setShowTrainerData] = useState<IAdminTrainerRequest[]>();

  useEffect(() => {
    if (trainerData) {
      setShowTrainerData(
        trainerData?.filter((item) => trainer_ids.includes(item?.user?.id))
      );
    }
  }, []);

  const OnSubmit = async (value: FormikValues) => {
    const noteToSend = value?.note;
    const { error } = await sendMailTrainer(
      `/course/trainers/send-mail/${bundleSlug ?? params?.slug}`,
      {
        trainer_ids,
        ...(bundleSlug ? { bundle: true } : {}),
        note: noteToSend,
      }
    );
    if (!error) {
      modal.closeModal();
      setTrainerIds([]);
      refetch();
    }
  };

  const checkAcademic =
    courseType === 'academic'
      ? courseStatus === CourseStatus.publish &&
      isAfter(
        new Date(),
        parseISO(trainerData?.[0]?.assignedSession?.[0]?.courses?.start_date)
      )
      : courseType === 'private';

  return (
    <Modal
      modal={modal}
      headerTitle={t('CourseRequest.sendRequest')}
      modalBodyClassName="!px-7"
      width="max-w-[500px]"
    >
      <Formik
        enableReinitialize
        initialValues={{ note: '' }}
        onSubmit={OnSubmit}
      // validationSchema={NoteSchema()}
      >
        {() => {
          return (
            <Form>
              <>
                <div>
                  <p>{t('sendRequestConfirmation', { currentTabTitle })}</p>

                  {showTrainerData?.map((item, index) => {
                    const totalLumpsumAmount =
                      Number(item?.amount ?? 0) +
                      Number(item?.reimbursement_amount ?? 0);
                    return (
                      <div key={`trainerData-${index + 1}`} className="mt-4">
                        <div className="p-3.5 flex border border-solid border-borderColor items-center justify-between  rounded-xl">
                          <div className="flex items-center gap-2 max-w-[calc(100%_-_60px)] w-full">
                            <Image
                              src={
                                item?.user?.profile_image ?? '/images/no-image.png'
                              }
                              imgClassName="w-12 h-12 rounded-full object-cover"
                              serverPath
                            />
                            <div className="flex-[1_0_0%] max-w-[calc(100%_-_60px)] w-full">
                              <p className="text-base text-dark font-medium">{`${item?.user?.first_name} ${item?.user?.last_name}`}</p>
                              {item?.is_lumpsum_select ? (
                                <span className="text-sm text-dark/50">
                                  {t('totalLumpsumAmount')}: {getCurrencySymbol('EUR')}{' '}{formatCurrency(Number(totalLumpsumAmount), 'EUR')}
                                </span>
                              ) : (
                                <span className="text-sm text-dark/50">
                                  {t('netTotal')}: {getCurrencySymbol('EUR')}{' '}{formatCurrency(Number(item?.user?.totalNetFees), 'EUR')}
                                </span>
                              )}
                            </div>
                          </div>
                          {checkAcademic && Number(item?.user?.courseRevenue) !== 0
                            ? profitIcon(item?.user?.profit, t)
                            : ''}
                        </div>
                      </div>
                    );
                  })}
                  <TextArea
                    // isCompulsory
                    parentClass="mt-4"
                    rows={2}
                    placeholder={t('leaveNoteForTrainers')}
                    label="Note"
                    name="note"
                  />
                </div>
                <div className="flex justify-end gap-4 col-span-2 mt-5">
                  <Button
                    className="min-w-[90px]"
                    variants="whiteBordered"
                    onClickHandler={() => {
                      setTrainerIds([]);
                      modal.closeModal();
                    }}
                  >
                    {t('Button.cancelButton')}
                  </Button>

                  <Button
                    className="min-w-[90px]"
                    variants="primary"
                    type="submit"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {t('SendMail.send')}
                  </Button>
                </div>
              </>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default SendRequestModal;
