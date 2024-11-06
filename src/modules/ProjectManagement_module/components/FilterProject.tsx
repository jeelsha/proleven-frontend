import { format } from 'date-fns';
import { Form, Formik, FormikValues } from 'formik';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

// ** components **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import DatePicker from 'components/FormElement/datePicker';

// ** types **
import { SetFieldValue } from 'types/common';
import { FilterProjectPropType, MemberValueType } from '../types';

// ** validation **
import ReactCheckBoxSelect from 'components/FormElement/ReactCheckBoxSelect';
import { Option } from 'components/FormElement/types';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosGet } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { setFilterState } from 'redux-toolkit/slices/pipelineFilterAssignSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { DateFilterValidation } from '../validationSchema';




const FilterProject = ({
  setSelectedValue,
  selectedValue,
  setCardAssign,
  cardAssign,
  setCardPriority,
  priority,
  getProjectCards,
  setFilterModal,
  dateFilter,
  setDateFilter,
  setFilterApply,
}: FilterProjectPropType) => {
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);
  const allRoles = useSelector(getRoles);
  const dispatch = useDispatch();
  const rolesToPass: Array<number> = [];
  const targetRoles = [ROLES.SalesRep, ROLES.TrainingSpecialist];

  allRoles.forEach((role) => {
    if (targetRoles.toString().includes(role.name)) {
      rolesToPass.push(role.id);
    }
  });

  const [getUsers] = useAxiosGet();

  const [memberList, setMemberList] = useState<Option[]>([]);
  const formValue = {
    cardAssignToMe: cardAssign,
    isCheckedMember: selectedValue.selectedMember,
    high: priority.high,
    low: priority.low,
    medium: priority.medium,
    start_date: dateFilter.start_date,
    end_date: dateFilter.end_date,
  };




  const getMembers = async (search?: string) => {
    const resp = await getUsers('/users', {
      params: {
        role: rolesToPass.toString(),
        search,
        view: true
      },
    });
    if (resp?.data?.data) {
      const formattedMembers = resp.data.data.map(
        ({ id, full_name }: MemberValueType) => ({
          label: full_name,
          value: id,
        })
      );
      setMemberList(formattedMembers);
    }
  };


  const OnSubmit = async (userData?: FormikValues, type?: string) => {

    const cardPriorityArr = [];

    if (userData) {
      if (type === 'clear') {
        setCardPriority({
          high: '',
          low: '',
          medium: ''
        })
        setSelectedValue({
          selectedLabels: [],
          selectedMember: []
        })
        userData.cardAssignToMe = ''
        dateFilter.end_date = ''
        dateFilter.start_date = ''
        dispatch(setFilterState({ isFilterAssign: false }))
        setCardAssign('')
      }
      else {
        if (!_.isEmpty(userData.high)) {
          cardPriorityArr.push(userData.high);
        }
        if (!_.isEmpty(userData.low)) {
          cardPriorityArr.push(userData.low);
        }
        if (!_.isEmpty(userData.medium)) {
          cardPriorityArr.push(userData.medium);
        }
        if (userData.cardAssignToMe !== '') {
          userData.isCheckedMember.push(userData.cardAssignToMe);
        } else {
          const index = userData.isCheckedMember.findIndex(
            (id: string) => id === user?.id
          );
          if (index !== -1) {
            userData.isCheckedMember.splice(index, 1);
          }
        }
      }
      setFilterApply?.({
        cardPriority: cardPriorityArr,
        selectedMembers: [...(userData.isCheckedMember || []), userData.cardAssignToMe],
        dateFilter: {
          start_date: dateFilter?.start_date,
          end_date: dateFilter?.end_date,
        }
      })
    }
    await getProjectCards(cardPriorityArr, dateFilter, userData?.cardAssignToMe, userData?.isCheckedMember);
    setFilterModal(false);
  };

  const priorityArray = ['high', 'medium', 'low'] as const;
  type PriorityType = typeof priorityArray[number];

  const handleChange = (
    checkData: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: SetFieldValue,
    item: PriorityType
  ) => {
    if (!_.isEmpty(checkData.target.value)) {
      setFieldValue(item, '');
      setCardPriority((prev) => {
        return { ...prev, [item]: '' };
      });
    } else {
      setFieldValue(item, item);
      setCardPriority((prev) => {
        return { ...prev, [item]: item };
      });
    }
  };

  const handleDateRange = (
    setFieldValue: SetFieldValue,
    startDate: Date,
    endDate: Date
  ) => {
    if (setFieldValue) {
      setFieldValue('start_date', startDate ? format(startDate, 'yyyy-MM-dd') : '');
      setDateFilter((prev) => {
        return {
          ...prev,
          start_date: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        };
      });

      setDateFilter((prev) => {
        return {
          ...prev,
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : '',
        };
      });
      setFieldValue('end_date', endDate ? format(endDate, 'yyyy-MM-dd') : '');
    }
  };

  useEffect(() => {
    getMembers();
  }, []);

  const handleChangeUser = {
    member: (
      checkData: React.ChangeEvent<HTMLInputElement>,
      values: {
        cardAssignToMe?: string;
        isCheckedMember?: (string | number)[];
      }
    ) => {
      if (values.isCheckedMember) {
        let newSelected = [...values.isCheckedMember];
        if (!checkData.target.checked) {
          setSelectedValue((prev) => {
            return { ...prev, selectedMember: [] };
          });
          newSelected.splice(0, newSelected.length);
        } else {
          const arr = memberList.map((item) => item.value);
          setSelectedValue((prev) => {
            return { ...prev, selectedMember: arr };
          });
          newSelected = [...arr];
        }
        return newSelected;
      }
      return [];
    },

  };

  return (
    <Formik
      initialValues={formValue}
      validationSchema={DateFilterValidation()}
      onSubmit={(data) => OnSubmit(data)}
    >
      {({ values, setFieldValue }) => {
        return (
          <Form>
            <>
              <div className='p-px'>
                {/* max-h-[calc(100dvh_-_350px)] overflow-auto pl-px */}
                <div>
                  <p className="text-sm leading-5 font-semibold">
                    {t('ProjectManagement.CustomCardModal.Button.member')}
                  </p>
                  <div className="flex flex-col gap-y-3 mt-4">
                    <div className="flex w-full gap-3 items-center ">
                      <label className="text-sm left-4 text-dark ">
                        <Checkbox
                          value={values.cardAssignToMe}
                          check={!!values.cardAssignToMe}
                          onChange={(checkData) => {
                            if (!_.isEmpty(checkData.target.value)) {
                              setFieldValue('cardAssignToMe', '');
                              setCardAssign('');
                            } else {
                              setFieldValue('cardAssignToMe', user?.id);
                              if (user?.id) setCardAssign(user.id);
                            }
                          }}
                          labelClass="rounded-md truncate flex-[1_0_0%]"
                          id="cardAssignToMe"
                          name="cardAssignToMe"
                          text={t('CourseManagement.Filter.cardAssignText')}
                        />
                      </label>
                    </div>
                    <div className="flex w-full gap-3 items-center ">
                      <label className="text-sm left-4 text-dark ">
                        <Checkbox
                          name="isCheckedMember"
                          check={
                            memberList?.length !== 0 &&
                            memberList?.length === values?.isCheckedMember?.length
                          }
                          onChange={(checkData) => {
                            if (values) {
                              const newVal = handleChangeUser.member(checkData, values);
                              setFieldValue('isCheckedMember', newVal);
                            }
                          }}
                        />
                      </label>
                      <div className="w-full rounded-md truncate flex-[1_0_0%]">
                        <ReactCheckBoxSelect
                          name="isCheckedMember"
                          onChange={(values) => {
                            setSelectedValue((prev) => {
                              return { ...prev, selectedMember: values };
                            });
                            setFieldValue('isCheckedMember', values);
                          }}
                          selectedValue={selectedValue.selectedMember}
                          options={memberList}
                          placeholder={t('CourseManagement.Filter.selectMember')}
                          parentClass="text-[14px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-5 font-semibold">
                  {t('ProjectManagement.CustomCardModal.Button.priority')}
                </p>
                <div className="flex flex-col gap-y-3 mt-4">
                  {priorityArray.map((item, index) => (
                    <div
                      key={`priority_${index + 1}`}
                      className="flex w-full gap-3 items-center "
                    >
                      <label className="text-sm left-4 text-dark ">
                        <Checkbox
                          value={values[item]}
                          check={!!values[item]}
                          onChange={(checkData) => {
                            handleChange(checkData, setFieldValue, item);
                          }}
                          labelClass="rounded-md truncate flex-[1_0_0%] capitalize"
                          id={item}
                          name={item}
                          text={item}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col mt-4 gap-y-3 border-t border-solid border-offWhite">
                  <DatePicker
                    startDateName="start_date"
                    endDateName="end_date"
                    parentClass="flex-[1_0_0%] pt-5"
                    labelClass="font-semibold rounded-md truncate flex-[1_0_0%] capitalize"
                    label={t('CoursesManagement.CreateCourse.date')}
                    range
                    selectedDate={
                      values.start_date ? new Date(values.start_date) : null
                    }
                    endingDate={values.end_date ? new Date(values.end_date) : null}
                    onRangeChange={(startDate, endDate) => {
                      handleDateRange(setFieldValue, startDate, endDate);
                    }}
                    startDatePlaceholder={t(
                      'ProjectManagement.Filter.startDatePlaceHolder'
                    )}
                    endDatePlaceholder={t(
                      'ProjectManagement.Filter.endDatePlaceHolder'
                    )}
                    maxDate={values.end_date ? new Date(values.end_date) : undefined}
                    minDate={
                      values.start_date ? new Date(values.start_date) : undefined
                    }
                    isClearable
                  />
                </div>
              </div>
              <div className="flex flex-col-2 gap-2">
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5 !py-1"
                  variants="primary"
                >
                  {t('ProjectManagement.CustomCardModal.Button.apply')}
                </Button>
                <Button
                  onClickHandler={() => {
                    OnSubmit(_, 'clear')
                  }}
                  className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5 !py-1"
                  variants="primary"
                >
                  {t('CompanyManager.courses.clearFiltersTitle')}
                </Button>
              </div>
            </>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FilterProject;
