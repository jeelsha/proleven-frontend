import { Form, Formik, FormikValues } from 'formik';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// ** components **
import Button from 'components/Button/Button';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import SearchComponent from 'components/Table/search';

// ** types **
import { Option } from 'components/FormElement/types';
import { StageModalProps } from '../types';

// ** redux-slice **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { removeToast, setToast } from 'redux-toolkit/slices/toastSlice';

// ** utils **
import { customRandomNumberGenerator, useDebounce } from 'utils';
import { findStage, handleCheckBoxPermission, useUpdateStage } from '../utils';

// ** enum **
import { useModal } from 'hooks/useModal';
import { StageNameConstant } from '../enum';
import ReasonModal from './ReasonModal';

const StageDisplay = ({
  initialBoard,
  stage_id,
  card_id,
  CardModal,
  getProjectStages,
  quotesLength,
  modal,
  isMove,
  cardMember,
  setInitialBoard,
}: StageModalProps) => {
  const { t } = useTranslation();

  const reasonModal = useModal();

  const dispatch = useDispatch();
  const user = useSelector(getCurrentUser);

  const { updateCardStage, isLoading } = useUpdateStage();

  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);

  const [searchOption, setSearchOption] = useState<Option[]>([]);
  const [search, setSearch] = useState('');
  const [movedCardId, setMovedCardId] = useState<{
    card_id: number;
    stage_id: number;
  }>({ card_id: -1, stage_id: -1 });
  const debounceSearch = useDebounce(search, 300);

  const initialValues = {
    stageId: stage_id,
  };

  const options = initialBoard.columns.map((stage) => {
    return {
      label: stage.title,
      value: stage.id,
    };
  });

  useEffect(() => {
    const searchOption = options.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(debounceSearch.toLowerCase())
      )
    );
    if (!_.isUndefined(searchOption) && !_.isEmpty(debounceSearch)) {
      setSearchOption(searchOption);
    } else {
      setSearchOption([]);
    }
  }, [debounceSearch]);

  const updateCard = async (stage_Id: number) => {
    const response = await updateCardStage({
      card_id,
      stageId: stage_Id,
    });
    if (_.isEmpty(response) && _.isUndefined(response)) {
      getProjectStages();
      CardModal.closeModal();
    }
  };

  const OnSubmit = async (stageData: FormikValues) => {
    const random = customRandomNumberGenerator();
    isMove.current = false;
    const stageName = findStage({
      destinationStageId: stageData.stageId,
      sourceStageId: stage_id,
      initialBoard,
    });

    if (stageName.currentStage === StageNameConstant.DateConfirmed) {
      if (!_.isUndefined(quotesLength) && !_.isEmpty(quotesLength)) {
        await updateCard(stageData.stageId);
      } else {
        dispatch(
          setToast({
            variant: 'Warning',
            message: `${t('ToastMessage.cardMoveValidateText')}`,
            type: 'warning',
            id: random,
          })
        );
        setTimeout(() => {
          dispatch(removeToast({ id: random }));
        }, 3000);
      }
    } else {
      if (
        stageName.currentStage === StageNameConstant.CourseRejected ||
        stageName.currentStage === StageNameConstant.CoursesStandby ||
        stageName.currentStage === StageNameConstant.ProjectRejected
      ) {
        reasonModal?.openModalWithData?.({
          stageName: stageName.currentStage,
        });
        return;
      }
      await updateCard(stageData.stageId);
      getProjectStages();
      modal.closeDropDown();
      CardModal.closeModal();
    }
  };

  return (
    <>
      <div
        className="absolute top-1/2 -translate-y-1/2 right-[calc(100%_+_7px)]"
        ref={modalRef}
      >
        <div className="w-[300px] bg-white rounded-lg shadow-lg shadow-black/20 border">
          <div className="p-5 rounded-b-lg">
            <div className="flex flex-col gap-y-2">
              <SearchComponent
                onSearch={(e) => setSearch(e.target.value)}
                onClear={() => {
                  setSearch('');
                }}
                value={search}
              />
              <div>
                <Formik
                  initialValues={initialValues}
                  onSubmit={(data) => OnSubmit(data)}
                >
                  {({ values, setFieldValue }) => {
                    return (
                      <Form>
                        <RadioButtonGroup
                          parentClass="mb-4 mt-2"
                          optionWrapper="flex flex-col w-full gap-2.5"
                          selectedValue={values.stageId}
                          name="stageId"
                          options={!_.isEmpty(searchOption) ? searchOption : options}
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
                              setFieldValue(
                                'stageId',
                                Number(radioData.target.value)
                              );
                              setMovedCardId((prev) => {
                                return {
                                  ...prev,
                                  stage_id: Number(radioData.target.value),
                                };
                              });
                            }
                          }}
                        />
                        <Button
                          isLoading={isLoading}
                          disabled={isLoading}
                          variants="primary"
                          small
                          className="w-full flex items-center justify-center text-xs leading-5 gap-1"
                          type="submit"
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
      {reasonModal.isOpen && (
        <ReasonModal
          modal={reasonModal}
          CardModal={CardModal}
          movedCardId={{
            card_id,
            stage_id: movedCardId.stage_id,
          }}
          oldPipeline={initialBoard}
          setInitialBoard={setInitialBoard}
          getProjectStages={getProjectStages}
        />
      )}
    </>
  );
};

export default StageDisplay;
