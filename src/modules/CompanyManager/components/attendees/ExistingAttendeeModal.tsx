import Checkbox from 'components/FormElement/CheckBox';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import NoDataFound from 'components/NoDataFound';
import SearchComponent from 'components/Table/search';
import { ROLES } from 'constants/roleAndPermission.constant';
import { Form, Formik, FormikProps, FormikValues } from 'formik';
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import _ from 'lodash';
import {
  ExistingAttendeeInitialValue,
  ExistingAttendeeProps,
  FetchAttendeeDetails,
  ICheckedAttendee,
  IHandleCheckBoxAttendee,
} from 'modules/CompanyManager/types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { useDebounce } from 'utils';

const ExistingAttendeeModal = ({
  modal,
  courseId,
  reFetchParticipate,
}: ExistingAttendeeProps) => {
  const { t } = useTranslation();

  const [allAttendee, { isLoading: isAttendee }] = useAxiosGet();
  const [uploadBulkAttendee, { isLoading }] = useAxiosPost();
  const ActiveCompany = useSelector(useCompany);
  const CurrentUser = useSelector(getCurrentUser);

  const formikRef = useRef<FormikProps<FormikValues>>();

  const [attendeeData, setAttendeeData] = useState<FetchAttendeeDetails[]>([]);
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 500);
  const checkedAttendee: ICheckedAttendee[] = [];

  const initialValue = {
    attendeeId: [] as string[],
  };
  useEffect(() => {
    getAllAttendee();
  }, [debouncedSearch]);

  const getAllAttendee = async () => {
    const { data } = await allAttendee('/course/participates', {
      params: {
        company_id: ActiveCompany.company?.id,
        view: true,
        search: debouncedSearch,
        isGroupByCode: true,
      },
    });
    if (data?.data) {
      setAttendeeData(data?.data);
    } else {
      setAttendeeData([]);
    }
  };

  const handleCheckBox = ({
    checkData,
    values,
    setFieldValue,
    item,
  }: IHandleCheckBoxAttendee) => {
    const newData = String(checkData.target.value);
    const isChecked = checkData.target.checked;
    const newSelected: string[] = [...values.attendeeId];
    if (isChecked) {
      newSelected.push(newData);
      checkedAttendee.push({
        first_name: item.first_name,
        last_name: item.last_name,
        code: item.code,
        job_title: item.job_title,
        email: item.email,
        mobile_number: item.mobile_number,
      });
    } else {
      newSelected.splice(newSelected.indexOf(newData), 1);
      checkedAttendee.splice(
        checkedAttendee.findIndex((item) => item.id === newData),
        1
      );
    }
    setFieldValue('attendeeId', newSelected);
  };

  const handleSubmit = async () => {
    if (!_.isEmpty(checkedAttendee)) {
      const attendeeObject: { [key: string]: unknown } = {
        manager_id:
          CurrentUser?.role_name === ROLES.Trainer
            ? ''
            : CurrentUser?.id?.toString(),
        company_id:
          CurrentUser?.role_name === ROLES.Trainer ? '' : ActiveCompany?.company?.id,
        participates: checkedAttendee,
      };
      if (courseId) {
        attendeeObject.course_id = courseId;
      }
      const { error } = await uploadBulkAttendee(
        '/course/participates/bulk',
        attendeeObject
      );
      if (!error) {
        reFetchParticipate?.();
      }
      modal?.closeModal?.();
    }
  };
  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };
  return (
    <Modal
      modal={modal}
      showFooter
      footerSubmitButtonTitle={t('Button.submit')}
      footerSubmit={handleSubmitRef}
      isButtonLoader={isLoading}
      isButtonDisable={isLoading || _.isEmpty(checkedAttendee)}
      headerTitle={t('CompanyManager.AttendeeList.selectAttendee')}
    >
      <div>
        <div className="pe-3 mb-5">
          <SearchComponent
            onSearch={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e?.target?.value);
            }}
            value={search}
            placeholder={t('Table.tableSearchPlaceholder')}
            onClear={() => {
              setSearch('');
            }}
          />
        </div>
        <Formik
          initialValues={initialValue}
          onSubmit={handleSubmit}
          innerRef={
            formikRef as unknown as React.Ref<
              FormikProps<ExistingAttendeeInitialValue>
            >
          }
        >
          {({ values, setFieldValue }) => {
            return (
              <Form>
                {isAttendee
                  ? [1, 2, 3].map((_, index) => (
                      <div
                        key={`${index + 1}_attendee`}
                        className="flex items-center p-4 w-full"
                      >
                        <div className="w-10 h-10 lazy rounded-full mr-4" />
                        <div className="flex flex-1 h-8 lazy" />
                      </div>
                    ))
                  : ''}
                {!_.isEmpty(attendeeData) &&
                  !isAttendee &&
                  attendeeData.map((data) => {
                    const isChecked = data?.id
                      ? values?.attendeeId?.indexOf(String(data?.id)) > -1
                      : false;
                    return (
                      <div
                        key={data?.id}
                        className="leading-normal grid grid-cols-[20px_32px_1fr_1fr_1fr] w-full mb-3 pb-3 last:mb-0 border-b border-solid border-gray-200 gap-3 items-center"
                      >
                        <Checkbox
                          value={String(data?.id)}
                          check={isChecked}
                          onChange={(checkData) => {
                            handleCheckBox({
                              checkData,
                              setFieldValue,
                              values,
                              item: data,
                            });
                          }}
                          parentClass="mt-1"
                          labelClass="rounded-md truncate flex-[1_0_0%] capitalize"
                          id={data.id}
                          name={`attendee_${data?.first_name}`}
                        />

                        <Image firstName={data?.full_name} />
                        <div className="truncate">
                          <p>{data?.full_name}</p>
                          <span className="text-[14px] text-grayText">
                            {data?.email}
                          </span>
                        </div>
                        <span className="font-semibold">{`(${data?.code})`}</span>
                        <span>{data?.mobile_number}</span>
                      </div>
                    );
                  })}

                {attendeeData?.length === 0 && !isAttendee && (
                  <NoDataFound message={t('Table.noDataFound')} />
                )}
              </Form>
            );
          }}
        </Formik>
      </div>
    </Modal>
  );
};

export default ExistingAttendeeModal;
