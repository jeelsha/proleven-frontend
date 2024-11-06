import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import NoDataFound from 'components/NoDataFound';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductFilterType, RevenueFilterProps, RevenueModalProps } from '../types';

export type IOtherTrainerProp = {
  setInitialValues?: Dispatch<SetStateAction<RevenueFilterProps | undefined>>;
  initialValues?: RevenueFilterProps;
  filterListData: ProductFilterType[];
  type?: string;
  modal: RevenueModalProps;
};

const RevenueFilter = ({
  setInitialValues,
  initialValues,
  filterListData,
  type,
  modal,
}: IOtherTrainerProp) => {
  const { t } = useTranslation();

  const [formValue, setFormValue] = useState<{
    code_id: string[];
    category_id: string[];
  }>({
    code_id: initialValues?.code_id || [],
    category_id: initialValues?.category_id || [],
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const fieldKey = type === 'category' ? 'category_id' : 'code_id';

    setFormValue((prev) => {
      const newSelected = checked
        ? [...prev[fieldKey], value]
        : prev[fieldKey].filter((id) => id !== value);

      return {
        ...prev,
        [fieldKey]: newSelected,
      };
    });
  };

  const handleSubmit = () => {
    setInitialValues?.(formValue);
    modal.toggleDropdown();
  };

  return (
    <div className="relative group">
      {Array.isArray(filterListData) && filterListData.length > 0 ? (
        <>
          <div>
            <div className=" overflow-y-auto  max-h-[255px] p-1 flex flex-col gap-y-3">
              {filterListData?.map((data, index: number) => {
                const isCheckboxChecked =
                  type === 'category'
                    ? formValue.category_id.includes(String(data?.id))
                    : formValue.code_id.includes(String(data?.id));

                return (
                  <div
                    key={`order${index + 1}`}
                    className="flex w-full gap-3 items-center"
                  >
                    <label className="text-sm left-4 text-dark flex w-full justify-between">
                      <Checkbox
                        value={String(data?.id)}
                        check={isCheckboxChecked}
                        onChange={handleCheckboxChange}
                        labelClass="rounded-md truncate flex-[1_0_0%] capitalize text-wrap"
                        id={data.id}
                        name={data.id}
                        text={data?.name ?? data?.code}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          <Button
            onClickHandler={handleSubmit}
            className="w-full !mt-5"
            variants="primary"
          >
            {t('ProjectManagement.CustomCardModal.Button.apply')}
          </Button>
        </>
      ) : (
        <NoDataFound />
      )}
    </div>
  );
};

export default RevenueFilter;
