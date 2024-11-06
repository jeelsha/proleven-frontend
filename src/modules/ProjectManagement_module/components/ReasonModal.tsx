import Button from 'components/Button/Button';
import TextArea from 'components/FormElement/TextArea';
import DatePicker from 'components/FormElement/datePicker';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikValues } from 'formik';
import { UserModalType } from 'hooks/types';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { StageNameConstant } from '../enum';
import { BoardData } from '../types';
import { useUpdateStage } from '../utils';
import { ReasonModalValidation } from '../validationSchema';

type IReasonModalProps = {
  modal: UserModalType;
  movedCardId: {
    card_id: number;
    stage_id: number;
  };
  oldPipeline: BoardData;
  setInitialBoard?: (value: React.SetStateAction<BoardData>) => void;
  getProjectStages?: () => void;
  CardModal: UserModalType;
  isMove?: React.MutableRefObject<boolean>;
};

type IModalData = {
  stageName: string;
};

const ReasonModal = ({
  modal,
  movedCardId,
  setInitialBoard,
  oldPipeline,
  getProjectStages,
  CardModal,
  isMove,
}: IReasonModalProps) => {
  const { t } = useTranslation();

  const { updateCardStage, isLoading } = useUpdateStage();

  const initialValue = {
    reject_reason: '',
    reason_date: '',
  };

  const OnSubmit = async (values: FormikValues) => {
    if (movedCardId.card_id !== -1 && movedCardId.stage_id !== -1) {
      const error = await updateCardStage({
        card_id: movedCardId.card_id,
        stageId: movedCardId.stage_id,
        reason: values.reject_reason,
        reason_date: values.reason_date,
      });
      if (!_.isEmpty(error) && !_.isUndefined(error)) {
        setInitialBoard?.(oldPipeline);
      } else {
        if (isMove?.current) {
          isMove.current = false;
        }
        getProjectStages?.();
        modal.closeModal();
        CardModal.closeModal();
      }
    }
  };

  return (
    <Modal
      closeOnEscape={false}
      headerTitle={t('ProjectManagement.ReasonModal.title')}
      modal={modal}
      hideCloseIcon
      width="max-w-[500px]"
      modalBodyClassName="[&>div]:!max-h-[unset] [&>div]:!overflow-unset "
    >
      <div>
        <Formik
          initialValues={initialValue}
          validationSchema={ReasonModalValidation(
            t,
            (modal?.modalData as IModalData)?.stageName ?? ''
          )}
          onSubmit={(values) => OnSubmit(values)}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <div className="grid col-span-1 gap-4 ">
                <TextArea
                  placeholder={
                    (modal?.modalData as IModalData)?.stageName ===
                    StageNameConstant.CoursesStandby
                      ? t('ProjectManagement.ReasonModal.placeHolder2')
                      : t('ProjectManagement.ReasonModal.placeHolder')
                  }
                  rows={5}
                  label={t('ProjectManagement.ReasonModal.title')}
                  name="reject_reason"
                  isCompulsory
                  value={values.reject_reason}
                />
                {(modal?.modalData as IModalData)?.stageName ===
                  StageNameConstant.CoursesStandby && (
                  <DatePicker
                    name="reason_date"
                    isCompulsory
                    label={t('CourseBundle.selectDate')}
                    placeholder={t('CourseBundle.selectDate')}
                    // parentClass="flex-[1_0_0%] pt-5"
                    onChange={(date) => {
                      setFieldValue('reason_date', date);
                    }}
                    minDate={new Date()}
                  />
                )}
              </div>
              <div className="flex justify-end my-4 gap-2">
                <Button
                  variants="grayLight"
                  className="min-w-[90px]"
                  onClickHandler={() => {
                    setInitialBoard?.(oldPipeline);
                    modal.closeModal();
                  }}
                  value={t('Button.cancelButton')}
                />{' '}
                <Button
                  isLoading={isLoading}
                  disabled={isLoading}
                  type="submit"
                  variants="primary"
                  className={`min-w-[90px]  ${
                    isLoading ? 'disabled:opacity-50 pointer-events-none' : ''
                  }`}
                  value={t('Auth.RegisterCommon.submitButtonText')}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default ReasonModal;
