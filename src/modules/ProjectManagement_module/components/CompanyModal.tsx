import { Form, Formik, FormikErrors, FormikValues } from 'formik';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// ** components **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import NoDataFound from 'components/NoDataFound';
import SearchComponent from 'components/Table/search';

// ** constant **
import { ROLES } from 'constants/roleAndPermission.constant';

// ** hooks **
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';

// ** redux-slice **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';

// ** utils **
import { customRandomNumberGenerator, useDebounce } from 'utils';
import { handleCheckBoxPermission, useGetCardDetail } from '../utils';

// ** type **
import { ICompanyList, ICompanyModalProps } from '../types';

// ** style **
import Image from 'components/Image';
import '../style/index.css';

const CompanyModal = ({
  projectId,
  card_id,
  cardMember,
  modalRef,
  selectedCompany,
  setInitialBoardData,
}: ICompanyModalProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const [getProjectCompany, { isLoading: getCompanyLoader }] = useAxiosGet();
  const [updateCompany, { isLoading }] = useAxiosPost();
  const { getCardDetail } = useGetCardDetail();

  const user = useSelector(getCurrentUser);
  const allRoles = useSelector(getRoles);
  const currentRole = allRoles.find((role) => role.name === ROLES.Company);

  const [companyList, setCompanyList] = useState<ICompanyList[]>([]);
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 300);

  const initialValues = {
    isChecked:
      selectedCompany && selectedCompany?.length > 0
        ? selectedCompany?.map((data) => String(data?.company_id))
        : ([] as string[]),
  };
  useEffect(() => {
    getCompany();
  }, [debounceSearch]);

  const getCompany = async () => {
    if (projectId && currentRole) {
      const objToPass: { [key: string]: number | string | boolean } = {};
      objToPass.project_id = projectId;
      objToPass.role = currentRole.id;
      objToPass.dropdown = true;
      objToPass.label = 'name';
      objToPass.value = 'id';
      if (!_.isEmpty(debounceSearch)) {
        objToPass.search = debounceSearch;
      }
      const resp = await getProjectCompany(`/companies`, {
        params: objToPass,
      });
      setCompanyList(resp?.data);
    }
  };

  const OnSubmit = async (companyData: FormikValues) => {
    if (companyData.isChecked) {
      const companyIds = companyData.isChecked.map(Number);
      const { error } = await updateCompany(`/cards/company/${card_id}`, {
        company_ids: companyIds,
      });
      if (_.isEmpty(error)) {
        modalRef.closeDropDown();
        await getCardDetail({
          url: '/boards/project-management/card/',
          card_id,
          setInitialBoardCard: setInitialBoardData,
          keyToInsert: 'card_Company',
        });
      }
    }
  };

  const handleOnChangeCheckBox = (
    checkData: React.ChangeEvent<HTMLInputElement>,
    values: {
      isChecked: string[];
    }
  ) => {
    const newData = String(checkData.target.value);
    const isChecked = checkData.target.checked;
    const newSelected: string[] = [...values.isChecked];
    if (isChecked) {
      newSelected.push(newData);
    } else {
      newSelected.splice(newSelected.indexOf(newData), 1);
    }
    return newSelected;
  };

  type HandleCheck = {
    checkData: React.ChangeEvent<HTMLInputElement>;
    values: {
      isChecked: string[];
    };
    setFieldValue: (
      field: string,
      value: string[],
      shouldValidate?: boolean | undefined
    ) => Promise<void | FormikErrors<{
      isChecked: string[];
    }>>;
    isDefault: boolean;
  };

  const handleCheckBox = ({
    checkData,
    values,
    setFieldValue,
    isDefault,
  }: HandleCheck) => {
    const removePermission = handleCheckBoxPermission({
      user,
      cardMember,
    });
    if (removePermission) {
      if (isDefault) {
        checkData?.preventDefault();
        dispatch(
          setToast({
            variant: 'Warning',
            message: `${t(
              'ProjectManagement.CustomCardModal.defaultCompanyToastMsg'
            )}`,
            type: 'warning',
            id: customRandomNumberGenerator(),
          })
        );
        return;
      }

      const newSelected = handleOnChangeCheckBox(checkData, values);
      setFieldValue('isChecked', newSelected);
    } else {
      checkData.preventDefault();
      dispatch(
        setToast({
          variant: 'Warning',
          message: `${t('ToastMessage.quoteRemoveText')}`,
          type: 'warning',
          id: customRandomNumberGenerator(),
        })
      );
    }
  };

  const getCheckedValue = (
    values: {
      isChecked: string[];
    },
    item: ICompanyList
  ) => {
    let isCheckboxChecked: boolean;

    if (item?.is_default === true) {
      isCheckboxChecked = true;
    } else if (item?.value) {
      isCheckboxChecked = values?.isChecked?.indexOf(String(item?.value)) > -1;
    } else {
      isCheckboxChecked = false;
    }
    return isCheckboxChecked;
  };

  const renderElement = () => {
    if (getCompanyLoader) {
      return (
        <div className="flex justify-center">
          <Image loaderType="Spin" />
        </div>
      );
    }
    if (_.isEmpty(companyList) && !getCompanyLoader) {
      return (
        <NoDataFound
          className="mb-5"
          message={t('ProjectManagement.CustomCardModal.companyNotFound')}
        />
      );
    }
    return (
      <div className="">
        <Formik initialValues={initialValues} onSubmit={(data) => OnSubmit(data)}>
          {({ values, setFieldValue }) => {
            return (
              <Form>
                <div className="max-h-[240px] overflow-auto pe-5 mb-2 ps-px">
                  {companyList.map((item) => {
                    const isCheckboxChecked = getCheckedValue(values, item);
                    return (
                      <Checkbox
                        key={item.value}
                        parentClass="h-fit my-4"
                        name="isChecked"
                        value={String(item.value)}
                        check={isCheckboxChecked}
                        onChange={(checkData) => {
                          handleCheckBox({
                            checkData,
                            values,
                            setFieldValue,
                            isDefault: item?.is_default,
                          });
                        }}
                        text={item.label}
                      />
                    );
                  })}
                </div>
                <Button
                  variants="primary"
                  small
                  className="w-full flex items-center justify-center text-xs leading-5 gap-1"
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {t('ProjectManagement.CustomCardModal.Button.apply')}
                </Button>
              </Form>
            );
          }}
        </Formik>
      </div>
    );
  };

  return (
    <div className="absolute top-0 right-[calc(100%_+_7px)]">
      <div className="w-[300px] bg-white rounded-lg shadow-lg shadow-black/20 border">
        <div className="inside-list-modal-title">
          <p className="text-base font-semibold leading-5 text-dark">
            {t('ProjectManagement.CustomCardModal.Button.company')}
          </p>
        </div>

        <div className="flex flex-col gap-y-2 p-5 rounded-b-lg">
          <SearchComponent
            placeholder={t('ProjectManagement.CustomCardModal.companySearch')}
            onSearch={(e) => setSearch(e.target.value)}
            onClear={() => {
              setSearch('');
            }}
            value={search}
          />

          {renderElement()}
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;
