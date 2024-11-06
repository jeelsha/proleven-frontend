import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import InputField from 'components/FormElement/InputField';
import TextArea from 'components/FormElement/TextArea';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { AddEditCodeProps, Code, CodeType } from 'modules/Codes/types';
import { CodeValidation } from 'modules/Codes/validation';
import { useTranslation } from 'react-i18next';
import { ModalProps } from 'types/common';
import { getCurrencySymbol } from 'utils';

const AddEditCode = ({ data, modal, refetch, setData }: AddEditCodeProps) => {
  const { t } = useTranslation();
  const [addCodeApi, { isLoading }] = useAxiosPost();
  const [updateCodeApi] = useAxiosPut();

  const {
    code = '',
    description = '',
    course_code_type = CodeType.GENERAL,
    title = '',
    price = '',
  } = data ?? {};
  const initialValues = { code, description, course_code_type, title, price };

  const createFormData = (codeData: FormikValues, data?: Code | null): FormData => {
    const formData = new FormData();

    const appendIfNotEmpty = (key: string, value: string | Blob | undefined | null) => {
      if (value && value.toString().trim().length > 0) {
        formData.append(key, value);
      }
    };

    Object.entries(codeData).forEach(([key, value]) => {
      if (!data || (data && key === 'description')) {
        appendIfNotEmpty(key, value as string | Blob);
      }
    });

    if (data) {
      if (data.isCodeAssigned === 0 && codeData.course_code_type) {
        appendIfNotEmpty('course_code_type', codeData.course_code_type);
      }

      if (codeData.course_code_type === CodeType.GENERAL) {
        appendIfNotEmpty('title', codeData.title);
        appendIfNotEmpty('price', codeData.price);
      }

      if (data.slug) {
        appendIfNotEmpty('slug', data.slug);
      }
    }

    return formData;
  };


  const handleApiCall = async (
    data: Code | null,
    formData: FormData,
    modal: ModalProps,
    refetch: () => void
  ) => {
    const apiCall = data ? updateCodeApi : addCodeApi;
    const { error } = await apiCall('/codes', formData);

    if (!error) {
      modal.closeModal();
      refetch();
    }
  };

  const OnSubmit = async (codeData: FormikValues) => {
    if (!codeData) return;

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
        enableReinitialize
        initialValues={initialValues}
        validationSchema={CodeValidation()}
        onSubmit={(values) => OnSubmit(values)}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form className="flex flex-col gap-4">
              <InputField
                placeholder={t('Codes.codePlaceHolder')}
                type="text"
                isCompulsory
                isDisabled={!!data?.code}
                value={values.code?.toUpperCase()}
                label={t('Codes.code')}
                name="code"
              />
              <TextArea
                // isCompulsory
                rows={2}
                placeholder={t('Codes.descriptionPlaceHolder')}
                label={t('Codes.description')}
                name="description"
              />
              {values.course_code_type === CodeType.GENERAL && (
                <>
                  <InputField
                    placeholder={t('Profiles.titlePlaceholder')}
                    type="text"
                    isCompulsory
                    value={values.title}
                    label={t('Profiles.title')}
                    name="title"
                  />
                  <InputField
                    placeholder={t(
                      'CoursesManagement.CreateCourse.pricePlaceHolder'
                    )}
                    type="number"
                    prefix={getCurrencySymbol('EUR')}
                    isCompulsory
                    value={values.price}
                    label={t('Trainer.invoice.price')}
                    name="price"
                  />
                </>
              )}
              <Checkbox
                disabled={data !== null && data?.isCodeAssigned !== 0}
                id="course_code_type"
                name="course_code_type"
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? CodeType.COURSE
                    : CodeType.GENERAL;
                  setFieldValue('course_code_type', newValue);
                }}
                check={values.course_code_type === CodeType.COURSE}
                text={t('isCourseCode')}
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
