import { Form, Formik, FormikValues } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// ** components **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import Image from 'components/Image';
import SearchComponent from 'components/Table/search';

// ** utils **
import { customRandomNumberGenerator, useDebounce } from 'utils';
import { handleCheckBoxPermission, useGetCardDetail } from '../utils';

// ** types **
import {
  CheckboxMemberFormValue,
  IHandleMemberCheckBox,
  MemberModalProps,
  MemberValueType,
} from '../types';

// ** constant **
import { ROLES } from 'constants/roleAndPermission.constant';

// ** hooks **
import { useAxiosPatch } from 'hooks/useAxios';

// ** redux-slice **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';

// ** validation **
import { memberValidationSchema } from '../validationSchema';

// ** style **
import '../style/index.css';

const MemberModal = ({
  modalRef,
  memberList,
  selectedMember,
  card_id,
  setInitialBoardData,
  getMember,
  isCoursePipeline,
}: MemberModalProps) => {
  const { t } = useTranslation();

  const [updateCardPatch, { isLoading: updateLoader }] = useAxiosPatch();
  const { getCardDetail } = useGetCardDetail();
  const user = useSelector(getCurrentUser);
  const dispatch = useDispatch();

  const firstRenderEffect = useRef(false);

  const roleWiseMember = memberList?.reduce((acc, curr) => {
    const customKeyName = mapRoleNameToCustomKey(curr.role.name);
    if (!acc[customKeyName]) {
      acc[customKeyName] = [];
    }
    acc[customKeyName].push(curr);

    return acc;
  }, {} as { [key: string]: MemberValueType[] });

  function mapRoleNameToCustomKey(roleName: string) {
    switch (roleName) {
      // Add more key name as need
      case ROLES.SalesRep:
        return 'Sales-representative';
      case ROLES.TrainingSpecialist:
        return 'Training-specialist';
      default:
        return roleName;
    }
  }

  const formValue = {
    isChecked:
      selectedMember && selectedMember?.length > 0
        ? selectedMember?.map((data) => String(data?.user_id))
        : ([] as string[]),
  };

  const [search, setSearch] = useState('');

  const debounceSearch = useDebounce(search, 500);

  useEffect(() => {
    if (firstRenderEffect.current) getMember(debounceSearch);
    firstRenderEffect.current = true;
  }, [debounceSearch]);

  const handleOnChangeCheckBox = (
    checkData: React.ChangeEvent<HTMLInputElement>,
    values: CheckboxMemberFormValue
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

  const OnSubmit = async (userData: FormikValues) => {
    const url = isCoursePipeline
      ? '/boards/course-management/card/'
      : '/boards/project-management/card/';

    const bodyData = {
      user_ids: userData.isChecked,
    };
    await updateCardPatch(`/cards/members/${card_id}`, bodyData);
    modalRef.closeDropDown();
    await getCardDetail({
      url,
      card_id,
      setInitialBoardCard: setInitialBoardData,
      keyToInsert: 'card_members',
    });
  };

  const handleCheckBox = ({
    checkData,
    values,
    setFieldValue,
  }: IHandleMemberCheckBox) => {
    const removePermission = handleCheckBoxPermission({
      user,
      cardMember: selectedMember,
    });
    if (!removePermission) {
      checkData.preventDefault();
      dispatch(
        setToast({
          variant: 'Warning',
          message: `${t('ToastMessage.quoteRemoveText')}`,
          type: 'warning',
          id: customRandomNumberGenerator(),
        })
      );
      return;
    }
    const newSelected = handleOnChangeCheckBox(checkData, values);
    setFieldValue('isChecked', newSelected);
  };

  return (
    <div className="absolute top-0 right-[calc(100%_+_7px)]">
      <div className="w-[350px] bg-white rounded-lg shadow-lg shadow-black/20 border">
        <div className="inside-list-modal-title">
          <p className="text-base font-semibold leading-5 text-dark">
            {t('ProjectManagement.CustomCardModal.Button.member')}
          </p>
        </div>

        <div className="p-5 rounded-b-lg">
          <SearchComponent
            placeholder={t('ProjectManagement.CustomCardModal.memberSearch')}
            onSearch={(e) => setSearch(e.target.value)}
            parentClass="min-w-[100%]"
            value={search}
            onClear={() => {
              setSearch('');
            }}
          />

          <div className="my-4 flex flex-col gap-y-2">
            <div className="flex justify-center items-center gap-1.5">
              <Formik
                initialValues={formValue}
                validationSchema={memberValidationSchema(memberList, t)}
                onSubmit={(values) => OnSubmit(values)}
              >
                {({ values, setFieldValue, errors }) => {
                  return (
                    <Form className="w-full">
                      <div className="max-h-[300px] overflow-auto px-px">
                        {Object.keys(roleWiseMember)?.map((data, index: number) => (
                          <div
                            key={`role_${index + 1}`}
                            className="flex flex-col w-full gap-2.5 first:mt-0 mt-5"
                          >
                            <p className="text-base font-semibold leading-5 text-dark  justify-start">
                              {data.replace('-', ' ')}
                            </p>
                            {roleWiseMember[data].map((member) => {
                              const isCheckboxChecked = member?.id
                                ? values?.isChecked?.indexOf(String(member?.id)) > -1
                                : false;
                              return (
                                <div
                                  key={member?.id}
                                  className="flex w-full gap-3 items-center"
                                >
                                  <Checkbox
                                    parentClass="h-fit"
                                    name="isChecked"
                                    value={String(member?.id)}
                                    check={isCheckboxChecked}
                                    showError={false}
                                    onChange={(checkData) => {
                                      handleCheckBox({
                                        checkData,
                                        values,
                                        setFieldValue,
                                      });
                                    }}
                                  />
                                  <div className="w-full rounded-md truncate flex-[1_0_0%]">
                                    {member?.full_name}
                                  </div>
                                  <div className="w-50 h-50">
                                    <Image firstName={member?.first_name} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      {errors.isChecked && (
                        <div>
                          <span className="error-message">{errors.isChecked}</span>
                        </div>
                      )}

                      <Button
                        variants="primary"
                        small
                        type="submit"
                        isLoading={updateLoader}
                        disabled={updateLoader}
                        className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5"
                      >
                        {t('ProjectManagement.CustomCardModal.Button.apply')}
                      </Button>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberModal;
