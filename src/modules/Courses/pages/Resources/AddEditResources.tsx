import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikValues } from 'formik';
import { AddEditResourcesProps } from 'modules/Courses/types';
import { ResourcesValidation } from 'modules/Courses/validation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAxiosGet, useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import '../../style/index.css';

export type FieldObjectType = { name: string; key: string; label: string };

const AddEditResources = ({
  data,
  modal,
  refetch,
  setData,
}: AddEditResourcesProps) => {
  const { t } = useTranslation();
  const [currentData, setCurrentData] = useState<Record<string, string>>();

  const [createResourcesApi, { isLoading: IsResourcesCreatingLoading }] =
    useAxiosPost();
  const [updateResourcesApi, { isLoading: IsResourcesUpdatingLoading }] =
    useAxiosPut();
  const [getResourcesApi, { isLoading: IsResourcesLoading }] = useAxiosGet();

  const fetchResources = async () => {
    const response = await getResourcesApi('/resources', {
      params: {
        slug: data?.slug,
      },
    });
    if (response.data) setCurrentData(response.data);
  };

  useEffect(() => {
    if (data) fetchResources();
  }, [data]);

  const { title, quantity, id, slug } = currentData ?? {};
  const initialValues = { title, quantity, slug };

  const OnSubmit = async (resourcesData: FormikValues) => {
    if (resourcesData) {
      const resource: Record<string, string> = {
        ...resourcesData,
        ...(currentData ? { id } : {}),
      };
      if (!data) delete resource.slug;
      const formData = new FormData();
      Object.entries(resource).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const apiFunction = data ? updateResourcesApi : createResourcesApi;
      const response = await apiFunction(`/resources`, formData);
      if (!response.error) {
        modal.closeModal();
        if (refetch) refetch();
        if (setData) setData(null);
      }
    }
  };

  const headerTitle = data
    ? t('CoursesManagement.Resources.editResources')
    : t('CoursesManagement.Resources.addResources');
  return (
    <Modal
      headerTitle={headerTitle}
      modal={modal}
      closeOnOutsideClick
      modalBodyClassName="!p-0"
      modalClassName="!px-7"
      width="max-w-[400px]"
      modalBodyInnerClassName="!p-0"
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={ResourcesValidation()}
        onSubmit={(values) => OnSubmit(values)}
      >
        {({ values }) => {
          return (
            <Form>
              <div className="flex flex-col gap-4 py-6 px-5">
                <InputField
                  isCompulsory
                  placeholder={t('CoursesManagement.Resources.PlaceHolders.name')}
                  type="text"
                  value={values.title}
                  label={t('CoursesManagement.Resources.name')}
                  name="title"
                  isLoading={IsResourcesLoading}
                />
                <InputField
                  isCompulsory
                  placeholder={t(
                    'CoursesManagement.Resources.PlaceHolders.quantity'
                  )}
                  type="number"
                  value={values.quantity}
                  label={t('CoursesManagement.Resources.quantity')}
                  name="quantity"
                  isLoading={IsResourcesLoading}
                />
              </div>

              <div className="py-3 border-t px-5">
                <div className="flex items-center justify-end gap-4">
                  <Button
                    className=" min-w-[140px]"
                    variants="whiteBordered"
                    onClickHandler={() => {
                      if (setData) setData(null);
                      modal.closeModal();
                    }}
                  >
                    {t('Button.cancelButton')}
                  </Button>

                  <Button
                    className="add-edit-resource min-w-[140px] !p-[0.625rem_0.875rem] !rounded-[0.5rem]"
                    type="submit"
                    variants="primary"
                    isLoading={
                      IsResourcesCreatingLoading || IsResourcesUpdatingLoading
                    }
                  >
                    {data
                      ? t('CoursesManagement.Resources.update')
                      : t('CoursesManagement.Resources.add')}
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

export default AddEditResources;
