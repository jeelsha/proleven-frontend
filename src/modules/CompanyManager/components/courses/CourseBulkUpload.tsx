// *** Hooks ***
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosGet } from 'hooks/useAxios';
import { Fields } from 'modules/UsersManagement/constants';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// *** Components ***

interface BulkUploadInterface {
  selectedCourse: string | number;
  setSelectedCourse: Dispatch<SetStateAction<string | number>>;
  selectedCompany: string | number;
  setSelectedCompany: Dispatch<SetStateAction<string | number>>;
}

export const BulkUploadCourseModal = ({
  selectedCourse,
  setSelectedCourse,
  selectedCompany,
  setSelectedCompany,
}: BulkUploadInterface) => {
  const { t } = useTranslation();
  const [courseDropDownApi, { isLoading: courseLoading }] = useAxiosGet();
  const [clientGetPagginatedApi] = useAxiosGet();
  const [clientGetApi, { isLoading: isCompany }] = useAxiosGet();
  const [courseList, setCourseList] = useState<Option[]>([]);
  const [companyList, setCompanyList] = useState<Option[]>([]);
  const { Role_Fields } = Fields();
  const currentRole = Role_Fields.find(
    (role) => role.key === ROLES.PrivateIndividual
  );

  const GetCourse = async () => {
    const response = await courseDropDownApi('/course/published', {
      params: {
        label: 'title',
        is_code: true,
      },
    });
    if (response?.data) {
      const updatedList = response?.data?.data?.map(
        (item: { progressive_number: string; title: string; id: string }) => ({
          label: `${item.progressive_number} - ${item.title}`,
          value: item.id,
        })
      );
      setCourseList(updatedList);
    }
  };
  const GetPaginatedOption = async (page: number) => {
    const response = await clientGetPagginatedApi('/course/published', {
      params: {
        page,
        label: 'title',
        is_code: true,
      },
    });
    if (response?.data) {
      return response?.data?.data?.map(
        (item: { progressive_number: string; title: string; id: string }) => ({
          label: `${item.progressive_number} - ${item.title}`,
          value: item.id,
        })
      );
    }
  };

  const GetCompany = async () => {
    const response = await clientGetApi('/companies', {
      params: {
        dropdown: true,
        label: 'name',
        role: currentRole?.id,
      },
    });
    if (response?.data) setCompanyList(response?.data);
  };

  useEffect(() => {
    GetCourse();
    if (currentRole?.id) {
      GetCompany();
    }
  }, [currentRole?.id]);

  return (
    <div className="col-span-2 grid gap-4">
      <ReactSelect
        options={courseList}
        isLoading={courseLoading}
        label={t('recoverModal.courseDropDown.placeHolder')}
        placeholder={t('recoverModal.courseDropDown.placeHolder')}
        onChange={(obj) => {
          setSelectedCourse((obj as Option)?.value);
        }}
        selectedValue={selectedCourse}
        isPaginated
        loadOptions={GetPaginatedOption}
      />
      <ReactSelect
        options={companyList}
        label={t('Exam.companyTitle')}
        isCompulsory
        isLoading={isCompany}
        placeholder={t('Exam.companyTitle')}
        onChange={(obj) => {
          setSelectedCompany((obj as Option)?.value);
        }}
        selectedValue={selectedCompany}
      />
    </div>
  );
};
