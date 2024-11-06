import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import TextArea from 'components/FormElement/TextArea';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { useTranslation } from 'react-i18next';
import { ModalProps } from 'types/common';
import { AddEditSectorProps, ISector } from '../types';
import { SectorValidation } from '../validation';

const AddEditSector = ({ data, modal, refetch, setData }: AddEditSectorProps) => {
  const { t } = useTranslation();
  const [addSectorApi, { isLoading }] = useAxiosPost();
  const [updateSectorApi] = useAxiosPut();

  const { code = '', description = '', letter = '' } = data ?? {};
  const initialValues = { code, description, letter };

  const createFormData = (
    sectorData: FormikValues,
    data?: ISector | null
  ): FormData => {
    const formData = new FormData();
    Object.entries(sectorData).forEach(([key, value]) => {
      if (!data || (data && key !== 'letter')) {
        formData.append(key, value as string | Blob);
      }
    });

    if (data?.slug) {
      formData.append('slug', data.slug);
    }
    return formData;
  };

  const handleApiCall = async (
    data: ISector | null,
    formData: FormData,
    modal: ModalProps,
    refetch: () => void
  ) => {
    const apiCall = data ? updateSectorApi : addSectorApi;
    const { error } = await apiCall('/sectors', formData);

    if (!error) {
      modal.closeModal();
      refetch();
    }
  };

  const OnSubmit = async (sectorData: FormikValues) => {
    if (!sectorData) return;

    const formData = createFormData(sectorData, data);
    await handleApiCall(data, formData, modal, refetch);
  };

  const headerTitle = data ? t('editSector') : t('addSector');
  return (
    <Modal
      headerTitle={headerTitle}
      modal={modal}
      width="max-w-[500px]"
      modalClassName="!px-7"
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={SectorValidation()}
        onSubmit={(values) => OnSubmit(values)}
      >
        {({ values }) => {
          return (
            <Form className="flex flex-col gap-4">
              <InputField
                placeholder={t('letterPlaceholder')}
                type="text"
                isCompulsory
                value={values.letter?.toUpperCase()}
                label={t('letter')}
                name="letter"
                isDisabled={!!data?.letter}
              />
              <InputField
                placeholder={t('Codes.codePlaceHolder')}
                type="text"
                isCompulsory
                value={values.code?.toUpperCase()}
                label={t('Codes.code')}
                name="code"
              />

              <TextArea
                rows={2}
                placeholder={t('Codes.descriptionPlaceHolder')}
                label={t('Codes.description')}
                name="description"
              />

              <div className="flex justify-end gap-4 col-span-2">
                <Button
                  className="min-w-[90px]"
                  variants="whiteBordered"
                  onClickHandler={() => {
                    setData(null);
                    modal.closeModal();
                  }}
                >
                  {t('Button.cancelButton')}
                </Button>

                <Button
                  className="min-w-[90px]"
                  type="submit"
                  variants="primary"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {data ? t('Codes.edit') : t('Codes.add')}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default AddEditSector;
