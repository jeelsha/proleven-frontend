import Button from 'components/Button/Button';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import { UserModalType } from 'hooks/types';
import { CompanyViewProps } from 'modules/Client/types';
import { SetStateAction } from 'react';

export interface CompanyListModalProps {
  search?: string;
  dropdownOptions: Option[];
  setSelectedOption: React.Dispatch<SetStateAction<Option | undefined>>;
  companyListModal: UserModalType;
  setCompanyData: React.Dispatch<SetStateAction<CompanyViewProps | undefined>>;
  setSearch: React.Dispatch<SetStateAction<string>>;
  loading: boolean;
}

const VatListModal = ({
  search,
  dropdownOptions,
  setSelectedOption,
  companyListModal,
  setCompanyData,
  setSearch,
  loading,
}: CompanyListModalProps) => {
  return (
    <div className="w-full bg-white rounded-lg shadow-lg shadow-black/20 border absolute z-3">
      <div className="px-5 py-3 rounded-b-lg max-h-[250px] overflow-auto">
        <div className="-mx-2">
          <Button
            className="px-2 block w-full text-left hover:bg-black/10 py-1.5 rounded-md"
            onClickHandler={() => {
              if (search) {
                setSelectedOption({ label: search, value: search });
                setCompanyData((prev) => {
                  return {
                    ...prev,
                    payment_term_id: prev?.payment_term_id
                      ? prev.payment_term_id.toString()
                      : '',
                    telephone: prev?.telephone ? prev?.telephone : '',
                    name: search,
                  };
                });
                setSearch(search);
                companyListModal.closeModal();
              }
            }}
          >
            Create {search}
          </Button>
          {dropdownOptions?.map((item, index) => {
            return (
              <Button
                className="block text-sm py-2 last:pb-0 w-full text-left hover:bg-black/10 px-2 transition-all duration-300 rounded-md"
                onClickHandler={() => {
                  setSelectedOption(item);
                  setCompanyData((prev) => {
                    return {
                      ...prev,
                      payment_term_id: prev?.payment_term_id
                        ? prev.payment_term_id.toString()
                        : '',
                      name: item?.label,
                    };
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

export default VatListModal;
