import { Option } from 'components/FormElement/types';
import {
  ActiveStateType,
  RegisterInitialValueType,
} from 'modules/Auth/pages/Register/types';

export type RegisterComponentProps = {
  currentStep: number;
  setActive: React.Dispatch<React.SetStateAction<ActiveStateType>>;
  registerInitialValue: RegisterInitialValueType;
  setRegisterInitialValue: React.Dispatch<
    React.SetStateAction<RegisterInitialValueType>
  >;
  setUpdatedDescription?: React.Dispatch<React.SetStateAction<string>>;
  updatedDescription?: string;
  search?: string;
  setSearch?: React.Dispatch<React.SetStateAction<string>>;
  setAtecoCodeList?: React.Dispatch<React.SetStateAction<Option[]>>;
  atecoCodeList?: Option[];
};
