import { format, parseISO } from 'date-fns';
import { Form, Formik, FormikValues } from 'formik';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// ** components **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import ReactCheckBoxSelect from 'components/FormElement/ReactCheckBoxSelect';
import DatePicker from 'components/FormElement/datePicker';

// ** types **
import { Option } from 'components/FormElement/types';
import { SetFieldValue } from 'types/common';
import { FilterCoursePropType, LabelValuesType, MemberValueType } from '../types';

// ** constant **
import { ROLES } from 'constants/roleAndPermission.constant';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';

//  ** redux slice **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';

// ** validation **
import { DateFilterValidation } from '../validationSchema';

const FilterCourse = ({
  setSelectedValue,
  selectedValue,
  setCardAssign,
  cardAssign,
  getProjectCards,
  setFilterModal,
  setCardType,
  cardType,
  dateFilter,
  setDateFilter,
}: FilterCoursePropType) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const user = useSelector(getCurrentUser);
  const allRoles = useSelector(getRoles);
  const rolesToPass: Array<number> = [];
  const targetRoles = [ROLES.SalesRep, ROLES.TrainingSpecialist];

  allRoles.forEach((role) => {
    if (targetRoles.toString().includes(role.name)) {
      rolesToPass.push(role.id);
    }
  });

  const [getUsers] = useAxiosGet();
  const [getProjectCardDetail] = useAxiosGet();

  const [memberList, setMemberList] = useState<Option[]>([]);
  const [labelValues, setLabelValues] = useState<Option[]>([]);

  const formValue = {
    cardAssignToMe: cardAssign,
    isCheckedMember: selectedValue.selectedMember,
    isCheckedLabels: selectedValue.selectedLabels,
    private: cardType.privateCourse,
    academy: cardType.academyCourse,
    start_date: dateFilter.start_date,
    end_date: dateFilter.end_date,
  };

  const getMembers = async (search?: string) => {
    const resp = await getUsers('/users', {
      params: {
        role: rolesToPass.toString(),
        search,
      },
    });
    if (resp?.data?.data) {
      const formattedMembers = resp.data.data.map(
        ({ id, first_name }: MemberValueType) => ({
          label: first_name,
          value: id,
        })
      );
      setMemberList(formattedMembers);
    }
  };

  const getLabels = async () => {
    const apiCall = getProjectCardDetail('/label', {
      params: {
        view: true,
      },
    });
    const resp = await apiCall;
    const formattedLabels = resp.data.data.map(
      ({ id, title, color }: LabelValuesType[0]) => ({
        label: title,
        value: id,
        color,
      })
    );
    setLabelValues(formattedLabels);
  };

  useEffect(() => {
    getMembers();
    getLabels();
  }, []);

  const handleChange = {
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
    label: (
      checkData: React.ChangeEvent<HTMLInputElement>,
      values: {
        isCheckedLabels?: (string | number)[];
      }
    ) => {
      if (values.isCheckedLabels) {
        let newSelected = [...values.isCheckedLabels];
        if (!checkData.target.checked) {
          setSelectedValue((prev) => {
            return { ...prev, selectedLabels: [] };
          });
          newSelected = [];
        } else {
          const arr = labelValues.map((item) => item.value);
          setSelectedValue((prev) => {
            return { ...prev, selectedLabels: arr };
          });
          newSelected = [...arr];
        }
        return newSelected;
      }
      return [];
    },
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

  const OnSubmit = async (userData: FormikValues) => {
    const courseType = [];
    if (userData) {
      if (!_.isEmpty(userData.private)) {
        courseType.push(userData.private);
      }
      if (!_.isEmpty(userData.academy)) {
        courseType.push(userData.academy);
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
      await getProjectCards({
        labelsFilter: userData.isCheckedLabels,
        membersFilter: userData.isCheckedMember,
        courseType,
        dateFilter,
        isClear: true,
      });
      setFilterModal(false);
    }
  };

  return (
    <Formik
      validationSchema={DateFilterValidation()}
      initialValues={formValue}
      onSubmit={(data) => OnSubmit(data)}
    >
      {({ values, setFieldValue }) => {
        return (
          <Form>
            <div className="p-px">
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
                            const newVal = handleChange.member(checkData, values);
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
              <div>
                <p className="text-sm leading-5 font-semibold mt-5 pt-5 border-t border-solid border-offWhite">
                  {t('ProjectManagement.CustomCardModal.Button.label')}
                </p>
                <div className="flex flex-col gap-y-3 mt-4">
                  <div className="flex w-full gap-3 items-center ">
                    <label className="text-sm left-4 text-dark ">
                      <Checkbox
                        name="isCheckedLabels"
                        check={
                          labelValues?.length !== 0 &&
                          labelValues?.length === values?.isCheckedLabels?.length
                        }
                        onChange={(checkData) => {
                          if (!_.isUndefined(values)) {
                            const newVal = handleChange.label(checkData, values);
                            setFieldValue('isCheckedLabels', newVal);
                          }
                        }}
                      />
                    </label>
                    <div className="w-full rounded-md truncate flex-[1_0_0%]">
                      <ReactCheckBoxSelect
                        name="isCheckedLabels"
                        onChange={(values) => {
                          setSelectedValue((prev) => {
                            return { ...prev, selectedLabels: values };
                          });
                          setFieldValue('isCheckedLabels', values);
                        }}
                        selectedValue={selectedValue.selectedLabels}
                        options={labelValues}
                        placeholder={t('CourseManagement.Filter.selectLabel')}
                        parentClass="text-[14px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm leading-5 font-semibold mt-5 pt-5 border-t border-solid border-offWhite">
                  {t('Calendar.eventDetails.courseTitle')}
                </p>
                <div className="flex flex-col gap-y-3 mt-4">
                  <div className="flex w-full gap-3 items-center ">
                    <label className="text-sm left-4 text-dark ">
                      <Checkbox
                        value={values.private}
                        check={!!values.private}
                        onChange={(checkData) => {
                          if (!_.isEmpty(checkData.target.value)) {
                            setFieldValue('private', '');
                            setCardType((prev) => {
                              return { ...prev, privateCourse: '' };
                            });
                          } else {
                            setFieldValue('private', 'private');
                            setCardType((prev) => {
                              return { ...prev, privateCourse: 'private' };
                            });
                          }
                        }}
                        labelClass="rounded-md truncate flex-[1_0_0%]"
                        id="private"
                        name="private"
                        text={t('CourseManagement.Filter.privateCourseText')}
                      />
                    </label>
                  </div>
                  <div className="flex w-full gap-3 items-center ">
                    <label className="text-sm left-4 text-dark ">
                      <Checkbox
                        value={values.academy}
                        name="academy"
                        check={!!values.academy}
                        id="academy"
                        onChange={(checkData) => {
                          if (!_.isEmpty(checkData.target.value)) {
                            setFieldValue('academy', '');
                            setCardType((prev) => {
                              return { ...prev, academyCourse: '' };
                            });
                          } else {
                            setFieldValue('academy', 'academy');
                            setCardType((prev) => {
                              return { ...prev, academyCourse: 'academy' };
                            });
                          }
                        }}
                        text={t('CourseManagement.Filter.academyCourseText')}
                      />
                    </label>
                  </div>
                </div>
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
                    values.start_date ? parseISO(values.start_date) : null
                  }
                  endingDate={values.end_date ? parseISO(values.end_date) : null}
                  onRangeChange={(startDate, endDate) => {
                    handleDateRange(setFieldValue, startDate, endDate);
                  }}
                  startDatePlaceholder={t(
                    'ProjectManagement.Filter.startDatePlaceHolder'
                  )}
                  endDatePlaceholder={t(
                    'ProjectManagement.Filter.endDatePlaceHolder'
                  )}
                  maxDate={values.end_date ? parseISO(values.end_date) : undefined}
                  minDate={
                    values.start_date ? parseISO(values.start_date) : undefined
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
                onClickHandler={async () => {
                  setSelectedValue({ selectedLabels: [], selectedMember: [] });
                  setCardAssign('');
                  setCardType({ academyCourse: '', privateCourse: '' });
                  setDateFilter({ end_date: '', start_date: '' });
                  dispatch(currentPageCount({ currentPage: 1 }));
                  await getProjectCards({ isFilterCleared: true });
                  setFilterModal(false);
                }}
                className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5"
                variants="primary"
              >
                {t('CompanyManager.courses.clearFiltersTitle')}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FilterCourse;
