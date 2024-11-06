import Button from 'components/Button/Button';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import { UserModalType } from 'hooks/types';
import { SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

export interface CompanyListModalProps<T> {
  search?: string;
  dropdownOptions: Option[];
  setSelectedOption: React.Dispatch<SetStateAction<Option | undefined>>;
  companyListModal: UserModalType;
  setCompanyData: React.Dispatch<SetStateAction<T>>;
  setSearch: React.Dispatch<SetStateAction<string>>;
  loading: boolean;
  values: any;
  isRegister?: boolean;
}

const CompanyListModal = <T,>({
  search,
  dropdownOptions,
  setSelectedOption,
  companyListModal,
  setCompanyData,
  setSearch,
  loading,
  values,
  isRegister = false,
}: CompanyListModalProps<T>) => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-white rounded-lg shadow-lg shadow-black/20 border absolute z-3">
      <div className="px-5 py-3 rounded-b-lg max-h-[250px] overflow-auto">
        <div className="-mx-2">
          <Button
            className="px-2 block w-full text-left hover:bg-black/10 py-1.5 rounded-md"
            onClickHandler={() => {
              if (search) {
                setSelectedOption({ label: search, value: search });
                setCompanyData(() => {
                  const commonData = {
                    ...values,
                    logo: values?.company_logo,
                    payment_term: values?.payment_term
                      ? values.payment_term.toString()
                      : '',
                    telephone: values?.telephone ? values?.telephone : '',
                    codice_fiscal: values?.codice_fiscale
                      ? values?.codice_fiscale
                      : '',
                  };

                  const specificData = isRegister
                    ? { company_name: search }
                    : {
                        payment_term_id: values?.payment_term
                          ? values.payment_term.toString()
                          : '',
                        name: search,
                      };

                  return { ...commonData, ...specificData } as unknown as T;
                });
                setSearch(search);
                companyListModal.closeModal();
              }
            }}
          >
            {t('create')} {search}
          </Button>
          {dropdownOptions?.map((item, index) => {
            return (
              <Button
                className="block text-sm py-2 last:pb-0 w-full text-left hover:bg-black/10 px-2 transition-all duration-300 rounded-md"
                onClickHandler={() => {
                  setSelectedOption(item);
                  setCompanyData(() => {
                    const commonData = {
                      ...values,
                      logo: values?.company_logo,
                      payment_term: values?.payment_term
                        ? values.payment_term.toString()
                        : '',
                      telephone: values?.telephone ? values?.telephone : '',
                      codice_fiscal: values?.codice_fiscale
                        ? values?.codice_fiscale
                        : '',
                    };

                    const specificData = isRegister
                      ? { company_name: search }
                      : {
                          payment_term_id: values?.payment_term
                            ? values.payment_term.toString()
                            : '',
                          name: search,
                        };

                    return { ...commonData, ...specificData } as unknown as T;
                  });
                  setSearch(item.label);
                  companyListModal.closeModal();
                }}
                key={`${index + 1}_company`}
              >
                {item?.label}
              </Button>
            );
          })}
        </div>
        {loading && (
          <div className="min-h-[100px] flex items-center justify-center">
            <Image loaderType="Spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyListModal;
