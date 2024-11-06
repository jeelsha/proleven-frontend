import { useTranslation } from 'react-i18next';

// ** components **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import { getFixedColors } from 'components/ReactCalendar/constant';
import { IHandleMemberCheckBox } from 'components/ReactCalendar/types';
import { ROLES } from 'constants/roleAndPermission.constant';
import { Form, Formik } from 'formik';
import { useQueryGetFunction } from 'hooks/useQuery';
import { SetStateAction, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';

export type IOtherTrainerProp = {
  setInitialValues?: React.Dispatch<
    SetStateAction<{
      trainer_id: string[];
    }>
  >;
  initialValues: { trainer_id: string[] };

  setTrainerColors: React.Dispatch<
    SetStateAction<{
      [key: string]: string;
    }>
  >;
};

const OtherTrainerCalendar = ({
  setInitialValues,
  initialValues,
  setTrainerColors,
}: IOtherTrainerProp) => {
  const { t } = useTranslation();
  const allRoles = useSelector(getRoles);
  const currentRole = allRoles.find((role) => role.name === ROLES.Trainer);
  const { response, isLoading } = useQueryGetFunction(
    `/users?role=${currentRole?.id}&is_connection_user=true`
  );
  const [tempTrainerColors, setTempTrainerColors] = useState<{
    [key: string]: string;
  }>({});

  const [formValue, setFormValue] = useState<{ trainer_id: string[] }>({
    trainer_id:
      initialValues?.trainer_id.length > 0
        ? initialValues?.trainer_id?.map((data) => String(data))
        : ([] as string[]),
  });
  const fixedColors = getFixedColors();

  useEffect(() => {
    if (response?.data?.data) {
      const colors: { [key: string]: string } = {};
      response.data.data.forEach((trainer: any, index: number) => {
        if (!colors[trainer.id]) {
          colors[trainer.id] = fixedColors[index % fixedColors.length];
        }
      });
      setTempTrainerColors(colors);
    }
  }, [response]);
  const handleCheckBox = ({
    checkData,
    values,
    setFieldValue,
  }: IHandleMemberCheckBox) => {
    const newSelected = handleOnChangeCheckBox(checkData, values);
    setFieldValue('trainer_id', newSelected);
    setFormValue({
      trainer_id: newSelected,
    });
  };

  const handleOnChangeCheckBox = (
    checkData: React.ChangeEvent<HTMLInputElement>,
    values: { trainer_id: string[] }
  ) => {
    const newData = String(checkData.target.value);
    const isChecked = checkData.target.checked;
    const newSelected: string[] = [...values.trainer_id];
    if (isChecked) {
      newSelected.push(newData);
    } else {
      newSelected.splice(newSelected.indexOf(newData), 1);
    }
    return newSelected;
  };

  const handleSubmit = () => {
    setInitialValues?.({
      trainer_id: formValue?.trainer_id,
    });
    setTrainerColors(tempTrainerColors);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Image loaderType="Spin" />
      </div>
    );
  }
  return (
    <div className="relative group">
      {!isLoading && response?.data?.data?.length === 0 && (
        <NoDataFound message={t('Table.noDataFound')} />
      )}
      {!isLoading && response?.data?.data?.length > 0 && (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, setFieldValue }) => {
            return (
              <Form>
                <div>
                  <div className="flex flex-col gap-y-3">
                    {response?.data?.data.map((data: any, index: number) => {
                      const isCheckboxChecked = data?.id
                        ? values?.trainer_id?.indexOf(String(data?.id)) > -1
                        : false;

                      const color = tempTrainerColors[data.id] || '#000000';
                      return (
                        <div
                          key={`order${index + 1}`}
                          className="flex w-full gap-3 items-center"
                        >
                          <label className="text-sm left-4 text-dark flex w-full justify-between">
                            <Checkbox
                              value={String(data?.id)}
                              check={isCheckboxChecked}
                              onChange={(checkData) =>
                                handleCheckBox({ checkData, values, setFieldValue })
                              }
                              labelClass="rounded-md truncate flex-[1_0_0%] capitalize"
                              id={data.id}
                              name={data.id}
                              text={data?.full_name}
                            />
                            <div
                              style={{ backgroundColor: color }}
                              className="w-4 h-4 rounded-sm"
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col-2 gap-2">
                  <Button
                    disabled={values?.trainer_id?.length < 1}
                    onClickHandler={() => {
                      setInitialValues?.({ trainer_id: [] });
                    }}
                    className={`w-full !mt-5 ${
                      values?.trainer_id?.length < 1
                        ? 'opacity-50 pointer-events-none'
                        : ''
                    }`}
                    variants="primary"
                  >
                    {t('CompanyManager.courses.clearFiltersTitle')}
                  </Button>
                  <Button
                    disabled={values?.trainer_id?.length < 1}
                    type="submit"
                    className={`w-full !mt-5 ${
                      values?.trainer_id?.length < 1
                        ? 'opacity-50 pointer-events-none'
                        : ''
                    }`}
                    variants="primary"
                  >
                    {t('ProjectManagement.CustomCardModal.Button.apply')}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      )}
    </div>
  );
};

export default OtherTrainerCalendar;
