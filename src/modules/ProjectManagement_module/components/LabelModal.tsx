import { Form, Formik, FormikValues } from 'formik';
import _ from 'lodash';
import { Ref, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** component **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import InputField from 'components/FormElement/InputField';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import SearchComponent from 'components/Table/search';

// ** utils **
import { customRandomNumberGenerator, useDebounce } from 'utils';
import { handleCheckBoxPermission, useGetCardDetail } from '../utils';

// ** constant **
import { initialLabel } from '../constant';

// ** type **
import {
  CheckboxFormEditType,
  CheckboxLabelFormValue,
  IHandleLabelCheckBox,
  LabelEdit,
  LabelModalProps,
} from '../types';

// ** hooks **
import { useAxiosPatch, useAxiosPost } from 'hooks/useAxios';
import { useDispatch, useSelector } from 'react-redux';

// ** redux-slice **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';

// ** style **
import '../style/index.css';

const LabelModal = ({
  modalRef,
  labelValues,
  selectedLabels,
  setLabelValues,
  getLabels,
  setInitialBoardData,
  card_id,
  isCoursePipeline,
  isMove,
  cardMember,
  isLoading,
}: LabelModalProps) => {
  const { t } = useTranslation();

  const [createNewLabel] = useAxiosPost();
  const [updateCardPatch, { isLoading: updateLabelLoader }] = useAxiosPatch();
  const { getCardDetail } = useGetCardDetail();
  const dispatch = useDispatch();
  const user = useSelector(getCurrentUser);

  const inputRef: Ref<HTMLInputElement> = useRef(null);
  const firstRenderEffect = useRef(false);

  const [isEdit, setIsEdit] = useState<CheckboxFormEditType>({
    value: false,
    index: -1,
  });
  const [formValue, setFormValue] = useState({
    labelName: '',
    color: '',
    isChecked:
      selectedLabels && selectedLabels?.length > 0
        ? selectedLabels?.map((data) => String(data?.label?.id))
        : ([] as string[]),
  });
  const [slice, setSlice] = useState(10);
  const [search, setSearch] = useState('');

  const debounceSearch = useDebounce(search, 500);

  useEffect(() => {
    // Focus on the input field when in edit mode
    if (isEdit.value && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEdit]);

  useEffect(() => {
    if (firstRenderEffect.current) getLabels(debounceSearch);
    firstRenderEffect.current = true;
  }, [debounceSearch]);

  const OnSubmit = async (userData: FormikValues) => {
    const { labelName, color } = userData;

    const labelBody = {
      title: labelName.charAt(0).toUpperCase() + labelName.slice(1),
      color: _.isEmpty(color) ? '#0B4565' : color,
    };
    if (isEdit.newLabel) {
      await createNewLabel('/label', labelBody);
    } else {
      await updateCardPatch(`/label/${isEdit.label_id}`, labelBody);
    }

    await getLabels();
    if (isEdit.value) {
      setIsEdit({
        value: false,
        index: -1,
      });
    }
  };

  const updateLabelToDisplay = async (values: { isChecked: string[] }) => {
    if (isMove) isMove.current = true;
    const url = isCoursePipeline
      ? '/boards/course-management/card/'
      : '/boards/project-management/card/';

    const bodyData = {
      label_ids: values.isChecked,
    };
    await updateCardPatch(`/cards/labels/${card_id}`, bodyData);
    modalRef.closeDropDown();
    await getCardDetail({
      url,
      card_id,
      setInitialBoardCard: setInitialBoardData,
      keyToInsert: 'card_labels',
    });
  };

  const handleCreateLabelClick = () => {
    setLabelValues(() => {
      const newLabelValues = [...labelValues];
      newLabelValues.push(initialLabel);
      return newLabelValues;
    });
    if (!isEdit.value) {
      setIsEdit({
        value: true,
        index: labelValues.length,
        newLabel: true,
      });
    }
  };

  const handleOnChangeCheckBox = (
    checkData: React.ChangeEvent<HTMLInputElement>,
    values: CheckboxLabelFormValue
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

  const handleCheckBox = ({
    checkData,
    values,
    setFieldValue,
  }: IHandleLabelCheckBox) => {
    const removePermission = handleCheckBoxPermission({
      user,
      cardMember,
    });
    if (removePermission) {
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

  const handleCloseEdit = () => {
    setIsEdit({
      value: false,
      index: -1,
    });
    setFormValue((prev) => {
      return { ...prev, labelName: '' };
    });
    setLabelValues(labelValues.filter((data) => !_.isEmpty(data.title)));
  };

  const handleEdit = ({ data, index }: LabelEdit) => {
    setFormValue((prev) => {
      return { ...prev, labelName: data.title, color: data.color };
    });
    if (!isEdit.value) {
      setIsEdit({
        value: true,
        index,
        label_id: data.id,
      });
    }
  };

  const renderElement = () => {
    if (_.isEmpty(labelValues)) {
      return (
        <NoDataFound
          className="mb-5"
          message={t('ProjectManagement.CustomCardModal.labelNotFound')}
        />
      );
    }
    return (
      <div className="p-5 rounded-b-lg">
        <SearchComponent
          placeholder={t('ProjectManagement.CustomCardModal.labelSearch')}
          onSearch={(e) => {
            setSearch(e.target.value);
          }}
          parentClass="min-w-[100%]"
          value={search}
          onClear={() => {
            setSearch('');
          }}
        />
        <div className="mt-4 flex flex-col gap-y-2">
          <div className="flex justify-center items-center gap-1.5">
            <Formik
              enableReinitialize
              initialValues={formValue}
              onSubmit={(values) => OnSubmit(values)}
            >
              {({ values, setFieldValue }) => {
                return (
                  <Form className="flex w-full flex-col items-center gap-1.5 justify-between">
                    {labelValues
                      ?.slice(
                        0,
                        isEdit.value && isEdit.newLabel ? labelValues.length : slice
                      )
                      .map((data, index: number) => {
                        const isCheckboxChecked = data?.id
                          ? values?.isChecked?.indexOf(String(data.id)) > -1
                          : false;
                        return (
                          <div
                            key={data.title}
                            className="flex gap-3 w-full items-center"
                          >
                            {isEdit.index !== index && (
                              <Checkbox
                                parentClass="h-fit"
                                name="isChecked"
                                value={String(data.id)}
                                check={isCheckboxChecked}
                                onChange={(checkData) => {
                                  handleCheckBox({
                                    checkData,
                                    values,
                                    setFieldValue,
                                  });
                                }}
                              />
                            )}
                            {isEdit.index === index ? (
                              <>
                                <InputField
                                  className="h-[21px] !w-[21px] rounded-md overflow-hidden !p-0 cursor-pointer"
                                  type="color"
                                  parentClass="!w-fit"
                                  value={
                                    !_.isEmpty(values.color)
                                      ? values.color
                                      : '#0B4565'
                                  }
                                  name="color"
                                  ref={inputRef}
                                  onChange={(colorVal) => {
                                    setFieldValue('color', colorVal.target.value);
                                  }}
                                />
                                <InputField
                                  customStyle={{
                                    backgroundColor: values.color,
                                  }}
                                  className="h-8"
                                  type="text"
                                  parentClass="flex-[1_0_0%]"
                                  value={values.labelName}
                                  name="labelName"
                                  ref={inputRef}
                                />
                                <Button
                                  disabled={!!_.isEmpty(values.labelName)}
                                  className="inline-block w-5 h-5 text-grayText cursor-pointer"
                                  type="submit"
                                >
                                  <Image
                                    iconName="checkRoundIcon"
                                    iconClassName="w-full h-full block"
                                  />
                                </Button>
                                <Button
                                  className="inline-block w-5 h-5 text-grayText cursor-pointer"
                                  onClickHandler={handleCloseEdit}
                                >
                                  <Image
                                    iconName="crossRoundIcon"
                                    iconClassName="w-full h-full block"
                                  />
                                </Button>
                              </>
                            ) : (
                              <div
                                style={{
                                  backgroundColor: data.color,
                                  color: '#FFFFFF',
                                }}
                                className="h-7 py-1 px-2 text-sm w-full rounded-md flex-[1_0_0%] font-medium"
                              >
                                {data.title}
                              </div>
                            )}

                            {!isCheckboxChecked && !isEdit.value && (
                              <Button
                                className="inline-block w-5 h-5 text-grayText cursor-pointer"
                                onClickHandler={() => {
                                  handleEdit({ data, index });
                                }}
                              >
                                <Image
                                  iconName="penSquareIcon"
                                  iconClassName="w-full h-full"
                                />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    {labelValues?.length > 5 &&
                      !isEdit.value &&
                      !isEdit.newLabel && (
                        <Button
                          onClickHandler={() => {
                            setSlice(
                              slice !== labelValues?.length ? labelValues?.length : 5
                            );
                          }}
                          className="w-fit me-auto my-3 text-sm text-ic_1 font-medium hover:opacity-70"
                        >
                          {slice === labelValues?.length
                            ? t('ProjectManagement.CustomCardModal.showLess')
                            : t('ProjectManagement.CustomCardModal.showMore')}
                        </Button>
                      )}
                    <Button
                      variants="primary"
                      small
                      className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-3"
                      isLoading={updateLabelLoader}
                      disabled={updateLabelLoader}
                      onClickHandler={() => {
                        updateLabelToDisplay(values);
                      }}
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
    );
  };

  return (
    <div className="absolute top-0 right-[calc(100%_+_7px)]">
      <div className="w-[350px] bg-white rounded-lg shadow-lg shadow-black/20 border">
        <div className="inside-list-modal-title">
          <p className="text-base font-semibold leading-5 text-dark">
            {t('ProjectManagement.CustomCardModal.Button.label')}
          </p>
          {!isLoading && (
            <Button
              variants="whiteBordered"
              small
              className="!w-fit h-8 flex items-center justify-center text-xs leading-5 gap-1"
              disabled={isEdit.index !== -1}
              onClickHandler={handleCreateLabelClick}
            >
              <Image iconName="plusIcon" iconClassName="w-3 h-3 text-dark" />
            </Button>
          )}
        </div>

        {renderElement()}
      </div>
    </div>
  );
};

export default LabelModal;
