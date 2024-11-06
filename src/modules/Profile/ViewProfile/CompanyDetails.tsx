import Button from 'components/Button/Button';
import Image from 'components/Image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  getCitiesJson,
  getCountriesJson,
} from 'redux-toolkit/slices/countryJsonSlice';
import { ManagerCompany, ProfileCompanyDetailsValues } from '../types';

export const CompanyDetails = ({ companyDetails }: ProfileCompanyDetailsValues) => {
  const { t } = useTranslation();
  const cities = useSelector(getCitiesJson);
  const countries = useSelector(getCountriesJson);
  const [openIndex, setOpenIndex] = useState(0);

  const handleManagerClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    event.stopPropagation();
    setOpenIndex(index === openIndex ? -1 : index);
  };
  const handleOuterDivClick = (index: number) => {
    setOpenIndex(index);
  };

  return (
    <div
      className={`${
        companyDetails && companyDetails.length > 1 ? 'bg-primaryLight' : 'bg-white'
      } rounded-xl mt-5 p-4`}
    >
      {companyDetails && companyDetails.length > 0 && (
        <p className="text-xl leading-7 font-semibold pb-3">
          {t('UserProfile.company.title')}
        </p>
      )}
      <div className="flex flex-wrap justify-between gap-y-3.5 flex-col">
        {Array.isArray(companyDetails) &&
          companyDetails &&
          companyDetails.length > 0 &&
          companyDetails?.map((managerInfo: ManagerCompany, index: number) => (
            <div
              className={`${
                companyDetails && companyDetails.length > 1
                  ? 'transition py-3.5 px-4 rounded-xl bg-white'
                  : ''
              }  `}
              key={`option_${index + 1}`}
            >
              {companyDetails && companyDetails.length > 1 && (
                <div
                  className={`flex justify-between items-center ${
                    openIndex === index ? 'mb-10' : ''
                  }`}
                  onClick={() => handleOuterDivClick(index)}
                >
                  <p className="text-xl leading-7 font-semibold capitalize">
                    {managerInfo.company.name}
                  </p>
                  <Button
                    className="w-7 h-7 cursor-pointer rounded-full border-2 p-1 border-solid border-primary text-primary"
                    onClickHandler={(event) =>
                      handleManagerClick(
                        event as unknown as React.MouseEvent<
                          HTMLDivElement,
                          MouseEvent
                        >,
                        index
                      )
                    }
                  >
                    <Image
                      iconName="chevronLeft"
                      iconClassName={`w-full h-full stroke-[3] ${
                        openIndex === index
                          ? 'rotate-90'
                          : '-rotate-90 translate-y-px'
                      }`}
                    />
                  </Button>
                </div>
              )}

              <div
                className={`grid grid-cols-2 gap-4 transition-all ${
                  openIndex === index ? '' : 'hidden'
                }`}
              >
                <Image
                  src={managerInfo.company.logo}
                  imgClassName="w-24 h-24 object-cover col-span-2 !object-contain"
                  serverPath
                />
                <div className="col-span-2">
                  <span className="text-lg block text-primary font-semibold">
                    {t('ClientManagement.viewClientDetails.companyDetailsTitle')}
                  </span>
                </div>
                <span className="flex gap-2 w-full flex-col justify-start border-b border-solid border-gray-200 pb-2">
                  <span className="text-sm leading-4 text-grayText max-w-[50%]">
                    {t('ClientManagement.clientForm.fieldInfos.companyName')}
                  </span>

                  <span className="text-sm leading-5 text-dark font-medium">
                    {managerInfo.company.name}
                  </span>
                </span>
                <span className="flex gap-2 w-full flex-col justify-start border-b border-solid border-gray-200 pb-2">
                  <span className="text-sm leading-4 text-grayText max-w-[50%]">
                    {t('ClientManagement.clientForm.fieldInfos.codiceFiscale')}
                  </span>

                  <span className="text-sm leading-5 text-dark font-medium">
                    {managerInfo.company.codice_fiscale}
                  </span>
                </span>
                <span className="flex gap-2 w-full flex-col justify-start border-b border-solid border-gray-200 pb-2">
                  <span className="text-sm leading-4 text-grayText max-w-[50%]">
                    {t('ClientManagement.clientForm.fieldInfos.vatNumber')}
                  </span>

                  <span className="text-sm leading-5 text-dark font-medium">
                    {managerInfo.company.vat_number}
                  </span>
                </span>
                <span className="flex gap-2 w-full flex-col justify-start border-b border-solid border-gray-200 pb-2">
                  <span className="text-sm leading-4 text-grayText max-w-[50%]">
                    {t('ClientManagement.clientForm.fieldInfos.companyAddress')}
                  </span>

                  <span className="text-sm leading-5 text-dark font-medium">
                    {managerInfo.company.address1}
                  </span>
                </span>
                {managerInfo.company.address2 && (
                  <span className="flex gap-2 w-full flex-col justify-start border-b border-solid border-gray-200 pb-2">
                    <span className="text-sm leading-4 text-grayText max-w-[50%]">
                      {t('ClientManagement.clientForm.fieldInfos.companyAddress2')}
                    </span>

                    <span className="text-sm leading-5 text-dark font-medium">
                      {managerInfo.company.address2}
                    </span>
                  </span>
                )}
                <span className="flex gap-2 w-full flex-col justify-start border-b border-solid border-gray-200 pb-2">
                  <span className="text-sm leading-4 text-grayText max-w-[50%]">
                    {t('ClientManagement.clientForm.fieldInfos.countryPlaceHolder')}
                  </span>

                  <span className="text-sm leading-5 text-dark font-medium">
                    {
                      countries.countries.find(
                        (item: { id: string | undefined }) =>
                          item.id === managerInfo.company.country
                      )?.name
                    }
                  </span>
                </span>
                <span className="flex gap-2 w-full flex-col justify-start border-b border-solid border-gray-200 pb-2">
                  <span className="text-sm leading-4 text-grayText max-w-[50%]">
                    {t('ClientManagement.clientForm.fieldInfos.city')}
                  </span>

                  <span className="text-sm leading-5 text-dark font-medium">
                    {
                      cities.cities.find(
                        (item: { id: string | undefined }) =>
                          item.id === managerInfo.company.city
                      )?.name
                    }
                  </span>
                </span>
                <span className="flex gap-2 w-full flex-col justify-start border-b border-solid border-gray-200 pb-2">
                  <span className="text-sm leading-4 text-grayText max-w-[50%]">
                    {t('ClientManagement.clientForm.fieldInfos.zipcode')}
                  </span>

                  <span className="text-sm leading-5 text-dark font-medium">
                    {managerInfo.company.zip}
                  </span>
                </span>
                <span className="flex gap-2 w-full flex-col justify-start border-b border-solid border-gray-200 pb-2">
                  <span className="text-sm leading-4 text-grayText max-w-[50%]">
                    {t('ClientManagement.clientForm.fieldInfos.atecoCode')}
                  </span>

                  <span className="text-sm leading-5 text-dark font-medium">
                    {managerInfo.company.ateco_code}
                  </span>
                </span>
                <span className="flex gap-2 w-full flex-col justify-start border-b border-solid border-gray-200 pb-2">
                  <span className="text-sm leading-4 text-grayText max-w-[50%]">
                    {t('ClientManagement.clientForm.fieldInfos.sdiCode')}
                  </span>

                  <span className="text-sm leading-5 text-dark font-medium">
                    {managerInfo.company.sdi_code}
                  </span>
                </span>
                {managerInfo?.company?.description && (
                  <span className="flex gap-2 w-full flex-col justify-start col-span-2 border-b border-solid border-gray-200 pb-2">
                    <span className="text-sm leading-4 text-grayText max-w-[50%]">
                      {t(
                        'ClientManagement.clientForm.fieldInfos.companyDescription'
                      )}
                    </span>

                    <span className="text-sm leading-5 text-dark font-medium">
                      {managerInfo?.company?.description}
                    </span>
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
