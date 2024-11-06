import { FormikProps, FormikValues } from 'formik';

export type ICounterData = {
  id: number;
  quantity: number;
  title: string;
};

export type CounterProps = {
  isCheckBox?: boolean;
  counterData?: ICounterData[];
  selectedData?: ICounterData[];
  setSelectedCounter: React.Dispatch<
    React.SetStateAction<ICounterData[] | undefined>
  >;
  formikRef?: React.MutableRefObject<FormikProps<FormikValues> | undefined>;
  trainerId?: string | number;
  isDataOnChange?: boolean;
  limit?: number;
  setRemovedResource?: React.Dispatch<
    React.SetStateAction<ICounterData | undefined>
  >;
  isPassingUpdatedData?: boolean;
};
