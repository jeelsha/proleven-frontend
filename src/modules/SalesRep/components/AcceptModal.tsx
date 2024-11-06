import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import { Modal } from 'components/Modal/Modal';
import { ROLES } from 'constants/roleAndPermission.constant';
import { Form, Formik, FormikValues } from 'formik';
import { UserModalType } from 'hooks/types';
import { useAxiosPost } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { SalesRepValidation } from '../validation';

type acceptProps = {
  modal: UserModalType;
  slug: string;
  setSlug: React.Dispatch<SetStateAction<string>>;
  refetch: () => void;
};
const AcceptModal = ({ modal, slug, setSlug, refetch }: acceptProps) => {
  const [acceptRejectCourse, { isLoading }] = useAxiosPost();
  const { t } = useTranslation();
  const allRoles = useSelector(getRoles);
  const initialValues = {
    sales_rep_id: '',
  };

  const [salesRep, setSalesRep] = useState<Option[]>();
  const { response } = useQueryGetFunction('/users', {
    option: {
      dropdown: true,
      label: 'full_name',
      value: 'id',
      role: allRoles?.find((role) => role.name === ROLES.SalesRep)?.id,
      is_head: false,
    },
  });
  useEffect(() => {
    if (response?.data) {
      setSalesRep(response?.data);
    }
  }, [response]);
  const OnSubmit = async (values: FormikValues) => {
    const payload = {
      status: 'approved',
      sales_rep_id: Number(values?.sales_rep_id),
    };
    const { error } = await acceptRejectCourse(
      `/course-request/action/${slug}`,
      payload
    );
    if (!error) {
      modal.closeModal();
      setSlug('');
      refetch();
    }
  };

  return (
    <Modal
      headerTitle={t('selectSalesRep.title')}
      modal={modal}
      width="max-w-[430px]"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={SalesRepValidation()}
        onSubmit={(values) => {
          OnSubmit(values);
        }}
      >
        {({ values }) => {
          return (
            <Form className="flex flex-col gap-4">
              <ReactSelect
                parentClass="w-full"
                name="sales_rep_id"
                label=""
                isCompulsory
                options={salesRep}
                placeholder={t('selectSalesRep.placeholder')}
                selectedValue={values?.sales_rep_id}
              />

              <div className="flex justify-end gap-4">
                <Button
                  onClickHandler={() => {
                    modal.closeModal();
                  }}
                  className="min-w-[110px]"
                  variants="whiteBordered"
                >
                  {t('Button.cancelButton')}
                </Button>
                <Button
                  className={`min-w-[110px] ${
                    isLoading ? 'disabled:opacity-50 pointer-events-none' : ''
                  }`}
                  variants="primary"
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
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

export default AcceptModal;
