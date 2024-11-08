import Image from 'components/Image';
import { ManagerData } from 'modules/Client/types';
import { useTranslation } from 'react-i18next';
import { CompanyDetails } from './CompanyDetails';
import { ManagerDetails } from './ManagerDetails';
import { CompanyManagerData } from './types';

const ViewDetails = ({ data }: { data: ManagerData | undefined }) => {
  const { t } = useTranslation();
  const companyManagerData =
    data?.company_manager && data?.company_manager?.length > 0
      ? data?.company_manager[0].company
      : null;
  return (
    <div className="flex flex-wrap mt-10 gap-y-7">
      <div className="w-full 1200:max-w-[400px]">
        <div className="max-w-[320px]">
          <div className=" w-full h-[180px] overflow-hidden rounded-xl">
            <Image
              src={data?.user?.profile_image ?? '/images/no-image.png'}
              imgClassName="w-full h-full object-cover"
              alt={
                companyManagerData
                  ? `${companyManagerData.name}`
                  : `${t(
                    'ClientManagement.viewClientDetails.companyManagerImageText'
                  )}`
              }
              serverPath
            />
          </div>
        </div>
      </div>
      <div className="w-full 1200:max-w-[calc(100%_-_400px)]">
        <ManagerDetails data={data} />
        {companyManagerData ? (
          <CompanyDetails companyInfo={data as unknown as CompanyManagerData} />
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

export default ViewDetails;
