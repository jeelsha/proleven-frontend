// ** IMPORTS ** //
import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import TextArea from 'components/FormElement/TextArea';
import { Option } from 'components/FormElement/types';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { AddEditCodeProps } from 'modules/AtecoCodes/types';
import { CodeValidation } from 'modules/AtecoCodes/validation';
import { ISector } from 'modules/Sectors/types';
import { useTranslation } from 'react-i18next';
import { ModalProps } from 'types/common';
import { AtecoCode } from '../types';

const AddEditCode = ({ data, modal, refetch, setData }: AddEditCodeProps) => {
  // ** Const ** //
  const { t } = useTranslation();
  const [addCodeApi, { isLoading }] = useAxiosPost();
  const [updateCodeApi] = useAxiosPut();
  const { name = '', description = '', risk = '', ateco_letter = '' } = data ?? {};
  const initialValues = { name, description, risk, ateco_letter };

  const { response } = useQueryGetFunction('/sectors');

  const options = response?.data?.data?.map((sector: ISector) => ({
    label: sector.letter,
    value: sector.letter,
  }));

  const createFormData = (
    codeData: FormikValues,
    data?: AtecoCode | null
  ): FormData => {
    const formData = new FormData();
    Object.entries(codeData).forEach(([key, value]) => {
      if (!data || (data && key === 'description')) {
        formData.append(key, value as string | Blob);
      }
    });

    if (data?.slug) {
      formData.append('slug', data.slug);
    }
    return formData;
  };

  const handleApiCall = async (
    data: AtecoCode | null,
    formData: FormData,
    modal: ModalProps,
    refetch: () => void
  ) => {
    const apiCall = data ? updateCodeApi : addCodeApi;
    const { error } = await apiCall('/ateco-code', formData);

    if (!error) {
      modal.closeModal();
      refetch();
    }
  };

  const OnSubmit = async (codeData: FormikValues) => {
    // if (!codeData) return;

    const formData = createFormData(codeData, data);
    await handleApiCall(data, formData, modal, refetch);
  };

  const headerTitle = data ? `${t('Codes.editCode')}` : `${t('Codes.addCode')}`;
  return (
    <Modal
      headerTitle={headerTitle}
      modal={modal}
      width="max-w-[500px]"
      modalClassName="!px-7"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={CodeValidation()}
        onSubmit={(values) => OnSubmit(values)}
        enableReinitialize
      >
        {({ values, setValues }) => {
          return (
            <Form className="flex flex-col gap-4">
              <InputField
                placeholder={t('Codes.codePlaceHolder')}
                type="text"
                isCompulsory
                isDisabled={!!data?.name}
                value={values.name?.toUpperCase()}
                label={t('Codes.code')}
                name="name"
              />{' '}
              <InputField
                placeholder={t('AtecoCodes.risk')}
                type="text"
                // isCompulsory
                value={values.risk?.toUpperCase()}
                label={t('AtecoCodes.risk')}
                name="risk"
              />
              <ReactSelect
                disabled={!!data?.ateco_letter}
                label="Letter"
                placeholder="Select Letter"
                options={options ?? []}
                name="ateco_letter"
                isLoading={isLoading}
                isCompulsory
                selectedValue={values?.ateco_letter}
                onChange={(selected) => {
                  const sectorData = response?.data?.data?.find(
                    (sector: ISector) => (selected as Option).value === sector.letter
                  );
                  setValues(() => {
                    return {
                      ...values,
                      ateco_letter: (selected as Option).value as string,
                      description: sectorData?.description,
                    };
                  });
                }}
              />
              <TextArea
                isCompulsory
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

export default AddEditCode;
