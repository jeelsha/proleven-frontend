import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import { Modal } from 'components/Modal/Modal';
import { UserModalType } from 'hooks/types';
import { useAxiosPost } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import { customRandomNumberGenerator } from 'utils';
import { IAdminTrainerRequest } from './types';
import { formatToUTC } from 'utils/date';
import _ from 'lodash';
import { FilteredSlot } from 'modules/Courses/types/assignedBundleTrainer';
import { REACT_APP_DATE_FORMAT } from 'config';

type IModalProps = {
  markDateWiseAbsentModal: UserModalType;
  slug: string | undefined | null;
  item?: IAdminTrainerRequest;
  getAssignedTrainersForBundle: () => void;
  refetchTrainers: () => void;
};

type CheckDate = {
  date: string;
  available: boolean;
};
const MarkDateWiseAbsentModal = ({
  markDateWiseAbsentModal,
  slug,
  item,
  getAssignedTrainersForBundle,
  refetchTrainers,
}: IModalProps) => {
  const dispatch = useDispatch();
  const [markAsAbsentApi] = useAxiosPost();
  const { response, isLoading } = useQueryGetFunction(
    `/course/bundle/date-wise-assigned-lesson/${slug}`,
    {
      option: {
        trainer_id: item?.user?.id,
      },
    }
  );
  const { t } = useTranslation();

  const [checkedDates, setCheckedDates] = useState<CheckDate[]>([]);
  const [isNotAvailable, setIsNotAvailable] = useState(false);

  useEffect(() => {
    if (response?.data?.filteredSlots) {
      setCheckedDates(
        Object.keys(response?.data?.filteredSlots).map((date) => ({
          date,
          available: response?.data?.filteredSlots[date]?.[0]?.available || false,
        }))
      );
      setIsNotAvailable(
        Object.keys(response?.data?.filteredSlots).every(
          (date) => response?.data?.filteredSlots[date]?.[0]?.available === false
        )
      );
    }
  }, [response]);

  const handleCheckboxChange = (date: string) => {
    setCheckedDates((prevCheckedDates) =>
      prevCheckedDates.map((existingDate) =>
        existingDate.date === date
          ? { ...existingDate, available: !existingDate.available }
          : existingDate
      )
    );
  };

  const handleSubmit = async () => {
    const temp = {
      trainer_id: item?.user?.id,
      dateAvailability: checkedDates,
    };
    const { error } = await markAsAbsentApi(
      `/course/trainers/bundle/mark-as-absent/${slug}`,
      temp
    );

    if (!error) {
      getAssignedTrainersForBundle();
      refetchTrainers();
      markDateWiseAbsentModal.closeModal();
    }
  };

  return (
    <Modal
      headerTitle={t('MarkAsAbsent.SelectText')}
      modal={markDateWiseAbsentModal}
      width="max-w-[500px]"
      modalClassName="!px-7"
    >
      <>
        {isLoading ? (
          <div>
            <p className="mb-2">{t('MarkAsAbsent.CheckDates')}</p>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="p-2 rounded-lg bg-[#F3F3F5] text-sm grid content-start gap-2 mb-3 "
              >
                <div className="flex flex-row justify-between">
                  <p className="font-bold lazy" />
                </div>

                <div />
              </div>
            ))}
          </div>
        ) : (
          ''
        )}
        {!isLoading && !_.isEmpty(response?.data?.filteredSlots) && (
          <div>
            <p className="mb-2">{t('MarkAsAbsent.CheckDates')}</p>
            {Object.entries(response?.data?.filteredSlots || {})?.map(
              ([date, value], k) => {
                const isChecked = !checkedDates.find(
                  (d: { date: string }) => d.date === date
                )?.available;

                const isDisable =
                  (value as FilteredSlot[])?.[0]?.available === false;
                return (
                  <div
                    key={`${k + 1}_item`}
                    className="p-2 rounded-lg bg-[#F3F3F5] text-sm grid content-start gap-2 mb-3 "
                  >
                    <div className="flex flex-row justify-between">
                      <p className="font-bold">{formatToUTC(date, (REACT_APP_DATE_FORMAT as string))}</p>

                      <Checkbox
                        labelClass="rounded-md truncate flex-[1_0_0%] capitalize"
                        onChange={() => handleCheckboxChange(date)}
                        check={isChecked}
                        disabled={isDisable}
                      />
                    </div>

                    <div />
                  </div>
                );
              }
            )}

            <div className="flex justify-end gap-4 col-span-2 mt-5">
              <Button
                className="min-w-[90px]"
                variants="whiteBordered"
                onClickHandler={() => {
                  markDateWiseAbsentModal.closeModal();
                }}
              >
                {t('Button.cancelButton')}
              </Button>

              <Button
                onClickHandler={() => {
                  if (checkedDates.every((trainer) => trainer?.available === true)) {
                    dispatch(
                      setToast({
                        variant: 'Error',
                        message: t('MarkAsAbsent.datesValidate'),
                        type: 'error',
                        id: customRandomNumberGenerator(),
                      })
                    );
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={isNotAvailable}
                className={`min-w-[90px] ${isNotAvailable ? 'disabled:opacity-50 pointer-events-none' : ''
                  }`}
                variants="primary"
              >
                {t('MarkAsAbsent.text')}
              </Button>
            </div>
          </div>
        )}
      </>
    </Modal>
  );
};

export default MarkDateWiseAbsentModal;
