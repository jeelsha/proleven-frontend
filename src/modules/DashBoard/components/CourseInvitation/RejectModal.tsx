import Button from 'components/Button/Button';
import TextArea from 'components/FormElement/TextArea';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosPut } from 'hooks/useAxios';
import { useTranslation } from 'react-i18next';
import { ModalProps } from 'types/common';

export interface CloseModalProps {
  modal: ModalProps;
  parentModal?: ModalProps;

  data: {
    course_slug: string;
    course_bundle_id: number | null;
  };
  isBundle?: boolean;
  refetchOrder?: () => void;
  refetchTrainers?: () => void;
  setSlug?: React.Dispatch<
    React.SetStateAction<{
      course_slug: string;
      course_bundle_id: number | null;
    }>
  >;
}

const RejectModal = ({
  modal,
  data,
  refetchOrder,
  setSlug,
  isBundle = false,
  parentModal,
  refetchTrainers,
}: CloseModalProps) => {
  const [rejectCourse, { isLoading }] = useAxiosPut();
  const { t } = useTranslation();
  const initialValues = {
    reject_note: '',
  };
  const OnSubmit = async (values: FormikValues) => {
    const temp: {
      course_slug: string;
      course_bundle_id?: number;
      reject_note?: string;
    } = {
      course_slug: data?.course_slug,
    };
    if (values?.reject_note) {
      temp.reject_note = values?.reject_note;
    }
    if (data?.course_bundle_id) {
      temp.course_bundle_id = data?.course_bundle_id;
    }
    const { error } = await rejectCourse(
      isBundle
        ? '/trainer/bundle/invites/reject'
        : '/trainer/courses/invites/reject',
      temp
    );
    if (!error) {
      modal.closeModal();
      setSlug?.({
        course_slug: '',
        course_bundle_id: 0,
      });
      refetchOrder?.();
      refetchTrainers?.();
      parentModal?.closeModal();
    }
  };

  return (
    <Modal
      width="max-w-[400px]"
      modal={modal}
      headerTitle={t('CompanyManager.trackCourse.modal.rejectTitle')}
    >
      <div className="text-center">
        <div className="mb-5 w-20 h-20 rounded-full p-6 mx-auto bg-danger/20 text-red-600 flex justify-center items-center">
          <Image iconClassName="w-ful h-full stroke-current" iconName="crossIcon" />
        </div>
        <p className="mt-5 mb-6 text-lg left-7  font-medium">
          {t('rejectReasonNote')}
        </p>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={(values) => OnSubmit(values)}
        >
          {({ values }) => (
            <Form className="grid lg:grid-cols-1 gap-4">
              <TextArea
                rows={3}
                placeholder={t('orderReasonPlaceHolder')}
                value={values.reject_note}
                label={t('rejectReason')}
                name="reject_note"
                labelClass="!text-left !w-full block !leading-5"
              />

              <div className="flex justify-end gap-4 mt-4">
                <Button
                  className="min-w-[90px]"
                  variants="whiteBordered"
                  onClickHandler={() => {
                    modal.closeModal();
                    setSlug?.({
                      course_slug: '',
                      course_bundle_id: 0,
                    });
                  }}
                >
                  {t('Button.cancelButton')}
                </Button>
                <Button
                  className={`min-w-[90px] ${
                    isLoading ? 'disabled:opacity-50 pointer-events-none' : ''
                  }`}
                  variants="primary"
                  type="submit"
                  isLoading={isLoading}
                >
                  {t('CompanyManager.trackCourse.modal.rejectTitle')}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default RejectModal;
