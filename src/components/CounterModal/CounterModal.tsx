import { Form, Formik, FormikErrors, FormikProps } from 'formik';
import _, { isEmpty } from 'lodash';

// * Component *
import Checkbox from 'components/FormElement/CheckBox';

// * type *
import Counter from 'components/Counter/Counter';
import { CounterProps, ICounterData } from './types';

const CounterModal = ({
  counterData,
  selectedData,
  setSelectedCounter,
  isCheckBox = false,
  formikRef,
  isDataOnChange = false,
  setRemovedResource,
  isPassingUpdatedData = false,
}: CounterProps) => {
  const cloneCounterData = JSON.parse(JSON.stringify(counterData));

  const handleCheckBoxOnChange = (
    data: ICounterData,
    isChecked: boolean,
    checkValue: ICounterData[]
  ) => {
    const clonedSelectedCounter = JSON.parse(JSON.stringify(checkValue));
    const dataClone = JSON.parse(JSON.stringify(data));
    const index = checkValue.findIndex((counter) => counter.id === data.id);
    const oldData = clonedSelectedCounter[index];
    if (isChecked) {
      clonedSelectedCounter.push(dataClone);
    } else if (index >= 0) {
      clonedSelectedCounter.splice(index, 1);
    }
    return { clonedSelectedCounter, indexData: oldData };
  };

  const handleIncrement = (
    item: ICounterData,
    values: ICounterData[],
    setValues: (
      values: React.SetStateAction<ICounterData[]>,
      shouldValidate?: boolean | undefined
    ) => Promise<void | (FormikErrors<ICounterData> | undefined)[]>
  ) => {
    const cloneValues = [...values];
    const singleIndex = cloneValues.findIndex((data) => data.id === item.id);
    const cloneItem = JSON.parse(JSON.stringify(item));
    if (singleIndex === -1) cloneValues.push(cloneItem);
    if (isCheckBox) {
      const index = cloneValues.findIndex((data) => data.id === item.id);
      if (isPassingUpdatedData) {
        if (item.quantity !== 0) {
          if (selectedData && !_.isEmpty(selectedData) && singleIndex !== -1) {
            cloneValues[singleIndex].quantity += 1;
          }
        }
      } else if (item.quantity !== cloneValues[index].quantity) {
        cloneValues[singleIndex].quantity += 1;
      }
    }
    if (!isCheckBox) {
      const index = cloneValues.findIndex((data) => data.id === item.id);

      if (isPassingUpdatedData) {
        if (item.quantity !== 0) {
          if (selectedData && !_.isEmpty(selectedData)) {
            cloneValues[singleIndex].quantity += 1;
          }
        }
      } else if (item.quantity !== cloneValues[index].quantity) {
        cloneValues[singleIndex].quantity += 1;
      }
    }
    if (isDataOnChange) {
      setSelectedCounter(cloneValues);
    }
    setValues(cloneValues);
  };

  const handleDecrement = (
    item: ICounterData,
    values: ICounterData[],
    setValues: (
      values: React.SetStateAction<ICounterData[]>,
      shouldValidate?: boolean | undefined
    ) => Promise<void | (FormikErrors<ICounterData> | undefined)[]>
  ) => {
    const cloneValues = JSON.parse(JSON.stringify(values));
    if (item.quantity === 0 && setRemovedResource) {
      setRemovedResource(item);
    }
    if (!isEmpty(cloneValues)) {
      const singleIndex = cloneValues.findIndex(
        (data: ICounterData) => data.id === item.id
      );

      if (values[singleIndex].quantity !== 0) {
        cloneValues[singleIndex].quantity -= 1;
      }
      if (cloneValues[singleIndex].quantity === 0) {
        cloneValues.splice(singleIndex, 1);
      }
      if (item.quantity === 0 && setRemovedResource) {
        setRemovedResource(item);
      }
      if (isDataOnChange) {
        setSelectedCounter(cloneValues);
      }
      setValues(cloneValues);
    }
  };

  return (
    <div>
      <Formik
        onSubmit={(data) => {
          setSelectedCounter(data);
        }}
        innerRef={formikRef as unknown as React.Ref<FormikProps<ICounterData[]>>}
        initialValues={selectedData ?? []}
      >
        {({ values, setValues }) => {
          return (
            <Form className="flex flex-col gap-y-2">
              {cloneCounterData?.map((item: ICounterData) => {
                const isChecked = values.some((data) => data.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-1.5 ps-3 border border-solid border-borderColor rounded-xl"
                  >
                    <div className="max-w-[calc(100%_-_140px)] w-full flex gap-2">
                      {isCheckBox && (
                        <Checkbox
                          name={item.title}
                          value={String(item.id)}
                          check={isChecked}
                          onChange={(checkData) => {
                            const { clonedSelectedCounter, indexData } =
                              handleCheckBoxOnChange(
                                item,
                                checkData.target.checked,
                                values
                              );
                            if (isDataOnChange) {
                              setSelectedCounter(clonedSelectedCounter);
                            }
                            if (setRemovedResource) {
                              setRemovedResource(indexData);
                            }
                            setValues(clonedSelectedCounter);
                          }}
                        />
                      )}
                      <p className="text-dark/70 text-sm font-medium flex-[1_0_0%]">
                        {`${item.title} (${item.quantity})`}
                      </p>
                    </div>
                    <Counter
                      handleDecrement={() => {
                        handleDecrement(item, values, setValues);
                      }}
                      handleIncrement={() => {
                        if (item.quantity !== 0) {
                          handleIncrement(item, values, setValues);
                        }
                      }}
                      counterValue={String(
                        values.find((ni) => ni.id === item.id)?.quantity ?? 0
                      )}
                    />
                  </div>
                );
              })}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default CounterModal;
