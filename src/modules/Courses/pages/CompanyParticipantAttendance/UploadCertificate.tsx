import Button from 'components/Button/Button';
import DropZone from 'components/FormElement/DropZoneField';
import { EnumFileType } from 'components/FormElement/enum';
import { fileInputEnum } from 'components/FormElement/types';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik } from 'formik';
import { useAxiosPut } from 'hooks/useAxios';
import { useTranslation } from 'react-i18next';
import { ModalProps } from 'types/common';

type UploadCertificateProps = {
  modal: ModalProps;
  participateSlug?: string;
  certificateLink?: string;
  refetch: () => void;
};

const UploadCertificate = ({
  modal,
  participateSlug,
  certificateLink,
  refetch,
}: UploadCertificateProps) => {
  const { t } = useTranslation();

  // ** APIs
  const [uploadCertificate, { isLoading: uploadingCertificate }] = useAxiosPut();

  // ** CONSTs
  const initialValues = { external_certificate_pdf_link: certificateLink ?? '' };

  const OnSubmit = async (values: Record<string, string>) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const { error } = await uploadCertificate(
      `/course/participates/upload-certificate/${participateSlug}`,
      formData
    );
    if (!error) {
      modal.closeModal();
      refetch();
    }
  };
  return (
    <Modal
      headerTitle={t('CompanyParticipants.UploadCertificate')}
      modal={modal}
      width="max-w-[430px]"
    >
      <Formik initialValues={initialValues} onSubmit={(data) => OnSubmit(data)}>
        {({ values, setFieldValue }) => {
          return (
            <Form className="flex flex-col mt-3 gap-4">
              <div className="flex flex-col gap-3">
                <DropZone
                  variant={fileInputEnum.LinkFileInput}
                  className="col-span-2"
                  fileType={EnumFileType.Document}
                  acceptTypes="application/pdf"
                  name="external_certificate_pdf_link"
                  setValue={setFieldValue}
                  fileInputIcon="fileIcon"
                  value={values?.external_certificate_pdf_link}
                />

                <div className="flex justify-end mt-2 gap-3">
                  <Button
                    className="min-w-[75px] justify-center"
                    variants="whiteBordered"
                    onClickHandler={modal.closeModal}
                  >
                    {t('Button.cancelButton')}
                  </Button>
                  <Button
                    className="min-w-[75px] justify-center"
                    variants="primary"
                    disabled={
                      !values.external_certificate_pdf_link ||
                      typeof values.external_certificate_pdf_link === 'string'
                    }
                    isLoading={uploadingCertificate}
                    type="submit"
                  >
                    {t('CompanyParticipants.Upload')}
                  </Button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default UploadCertificate;
