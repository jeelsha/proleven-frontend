import { Form, Formik, FormikValues } from 'formik';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// ** components **
import Button from 'components/Button/Button';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import SearchComponent from 'components/Table/search';

// ** hooks **
import { useAxiosGet, useAxiosPatch } from 'hooks/useAxios';

// ** redux-slice **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';

// ** utils **
import { customRandomNumberGenerator, useDebounce } from 'utils';
import { handleCheckBoxPermission } from '../utils';

// ** type **
import { ManagerModalProps } from '../types';

const ManagerModal = ({
  card_id,
  CardModal,
  companyId,
  selectedManager,
  cardMember,
}: ManagerModalProps) => {
  const { t } = useTranslation();
  const [updateManager, { isLoading: updateManagerLoader }] = useAxiosPatch();
  const [getProjectCardDetail, { isLoading }] = useAxiosGet();
  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);
  const user = useSelector(getCurrentUser);
  const dispatch = useDispatch();

  const [managerList, setManagerList] = useState<Option[]>([]);
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 300);

  const initialValues = {
    managerId: selectedManager?.user_id ?? '',
  };

  useEffect(() => {
    getManager();
  }, [debounceSearch]);

  const getManager = async () => {
    if (companyId) {
      const objToPass: { [key: string]: number | string } = {};
      objToPass.company_id = companyId;
      if (!_.isEmpty(debounceSearch)) {
        objToPass.search = debounceSearch;
      }
      const resp = await getProjectCardDetail(`/managers/dropdown`, {
        params: objToPass,
      });
      setManagerList(resp?.data);
    }
  };

  const OnSubmit = async (managerData: FormikValues) => {
    const { error } = await updateManager(`/cards/manager/${card_id}`, {
      user_id: managerData.managerId,
    });
    if (_.isEmpty(error)) {
      CardModal.closeModal();
    }
  };

  const renderElement = () => {
    if (!_.isEmpty(managerList)) {
      return (
        <div>
          <Formik initialValues={initialValues} onSubmit={(data) => OnSubmit(data)}>
            {({ values, setFieldValue }) => {
              return (
                <Form>
                  <RadioButtonGroup
                    parentClass="mb-4 mt-2"
                    optionWrapper="flex flex-col w-full gap-2.5"
                    selectedValue={values.managerId}
                    name="managerId"
                    options={managerList}
                    onChange={(radioData) => {
                      const removePermission = handleCheckBoxPermission({
                        cardMember,
                        user,
                      });
                      if (!removePermission) {
                        radioData.preventDefault();
                        dispatch(
                          setToast({
                            variant: 'Warning',
                            message: `${t('ToastMessage.quoteRemoveText')}`,
                            type: 'warning',
                            id: customRandomNumberGenerator(),
                          })
                        );
                      } else {
                        setFieldValue('managerId', Number(radioData.target.value));
                      }
                    }}
                  />
                  <Button
                    variants="primary"
                    small
                    className="w-full flex items-center justify-center text-xs leading-5 gap-1"
                    type="submit"
                    isLoading={updateManagerLoader}
                    disabled={updateManagerLoader}
                  >
                    {t('ProjectManagement.CustomCardModal.Button.apply')}
                  </Button>
                </Form>
              );
            }}
          </Formik>
        </div>
      );
    }
    return (
      <NoDataFound
        message={t('ProjectManagement.CustomCardModal.managerNotFound')}
      />
    );
  };

  return (
    <div className="absolute top-0 right-[calc(100%_+_7px)]" ref={modalRef}>
      <div className="w-[300px] bg-white rounded-lg shadow-lg shadow-black/20 border">
        <div className="p-5 rounded-b-lg">
          <div className="flex flex-col gap-y-2">
            <SearchComponent
              placeholder={t('ProjectManagement.CustomCardModal.managerSearch')}
              onSearch={(e) => setSearch(e.target.value)}
              onClear={() => {
                setSearch('');
              }}
              value={search}
            />
            {isLoading ? (
              <div className="flex justify-center">
                <Image loaderType="Spin" />
              </div>
            ) : (
              renderElement()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerModal;
