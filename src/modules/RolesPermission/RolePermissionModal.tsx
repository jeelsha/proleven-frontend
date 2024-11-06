import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import Switch from 'components/FormElement/Switch';
import { Option } from 'components/FormElement/types';
import { Modal } from 'components/Modal/Modal';
import { ROLES } from 'constants/roleAndPermission.constant';
import { Form, Formik } from 'formik';
import { UserModalType } from 'hooks/types';
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { MemberValueType } from 'modules/ProjectManagement_module/types';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { useParams } from 'react-router-dom';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { SetFieldValue } from 'types/common';
import { findKeyToPass } from '.';
import { IUserData } from './types';
import { RolePermissionModalValidation } from './validation';

type RolePermissionProps = {
  modal: UserModalType;
  refetch: () => void;
  isCourse?: boolean;
  isCourseBundle?: boolean;
  isSurveyTemplate?: boolean;
  slug?: string;
};

const RolePermissionModal = ({
  modal,
  isCourse,
  isCourseBundle,
  isSurveyTemplate,
  slug,
  refetch,
}: RolePermissionProps) => {
  const params = useParams();

  const { t } = useTranslation();

  const [addUserWithPermission, { isLoading }] = useAxiosPost();

  const allRoles = useSelector(getRoles);
  const rolesToPass: Array<number> = [];
  const targetRoles = [ROLES.SalesRep, ROLES.TrainingSpecialist];

  allRoles.forEach((role) => {
    if (targetRoles.toString().includes(role.name)) {
      rolesToPass.push(role.id);
    }
  });

  const [getUsers] = useAxiosGet();

  const [userList, setUserList] = useState<Option[]>();

  useEffect(() => {
    getMembers();
  }, []);

  const getMembers = async (search?: string) => {
    const response = await getUsers('/users', {
      params: {
        role: rolesToPass.toString(),
        view: true,
        search,
      },
    });
    if (response?.data?.data) {
      const formattedMembers = response.data.data.map(
        ({ id, full_name }: MemberValueType) => ({
          label: full_name,
          value: id,
        })
      );
      setUserList(formattedMembers);
    }
  };

  const switchChecked: IUserData = {
    user_id: '',
    users: '',
    view: false,
    edit: false,
    delete: false,
  };
  const switchConstant = [`${t('Access.Edit')}`, `${t('Access.Delete')}`];

  const handleSubmit = async (userData: IUserData) => {
    if (userData) {
      const key = findKeyToPass(isCourse, isCourseBundle, isSurveyTemplate);
      delete userData.users;
      const objToPass: { [key: string]: unknown } = {
        access_permission: [{ ...userData }],
        is_single: true,
      };
      if (key) {
        objToPass[key] = slug ?? (params.slug as string);
      }
      const { error } = await addUserWithPermission('/access/create', objToPass);
      if (!error) {
        refetch();
      }
      modal.closeModal();
    }
  };

  const handleSwitchChange = (
    item: string,
    e: ChangeEvent<HTMLInputElement>,
    setFieldValue: SetFieldValue,
    values: IUserData
  ) => {
    if (item.toLowerCase() === 'delete') {
      if (!values.edit) {
        setFieldValue(`${item}`, e.target.checked);
        setFieldValue(`edit`, e.target.checked);
      } else {
        setFieldValue(`${item}`, e.target.checked);
      }
    }

    if (item.toLowerCase() === 'edit') {
      setFieldValue(`${item}`, e.target.checked);
    }

    if (item.toLowerCase() === 'edit' || item.toLowerCase() === 'delete') {
      setFieldValue(`${t('Access.View')}`, true);
    }

    if (item.toLowerCase() === 'view') {
      if (!values.edit && !values.delete) {
        setFieldValue(`${item}`, e.target.checked);
      }
    }
  };

  return (
    <Modal
      width="max-w-[400px]"
      modal={modal}
      headerTitle={t('Access.AddButton.Title')}
    >
      <div>
        <Formik
          enableReinitialize
          initialValues={switchChecked}
          validationSchema={RolePermissionModalValidation()}
          onSubmit={(data) => handleSubmit(data)}
        >
          {({ values, setFieldValue }) => {
            return (
              <Form>
                <div>
                  <ReactSelect
                    name="user_id"
                    label={t('Access.UserDropDownText')}
                    isCompulsory
                    placeholder={t('Access.UserDropDownText')}
                    selectedValue={values.user_id}
                    options={userList}
                    onChange={(val) => {
                      setFieldValue('users', (val as Option).label);
                      setFieldValue('user_id', (val as Option).value);
                    }}
                  />
                </div>
                <div className=" mt-5">
                  <div className="text-sm text-black leading-4 inline-block">
                    <span>{t('Access.SelectPermission')}</span>
                  </div>
                  <div className="flex justify-between flex-col gap-4 mb-10 mt-2">
                    {switchConstant.map((item: string, index: number) => {
                      const checked = values[item];
                      return (
                        <Switch
                          key={`switch_${index + 1}`}
                          parentClass="justify-between border-b border-solid border-borderColor pb-4"
                          small
                          labelLeft
                          disabled={item.toLowerCase() === 'edit' && values.delete}
                          labelClass="w-10 capitalize me-12"
                          label={item}
                          checked={checked as boolean}
                          onChangeHandler={(e) => {
                            handleSwitchChange(item, e, setFieldValue, values);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <Button
                  type="submit"
                  variants="primary"
                  disabled={isLoading}
                  className={`gap-1 w-30 ms-auto ${
                    isLoading ? 'disabled:opacity-50 pointer-events-none' : ''
                  }`}
                  isLoading={isLoading}
                >
                  {t('UserManagement.add')}
                </Button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Modal>
  );
};

export default RolePermissionModal;
