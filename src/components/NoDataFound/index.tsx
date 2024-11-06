// ** type **
import Image from 'components/Image';
import { useTranslation } from 'react-i18next';
import { NoDataFoundProps } from './types';

const NoDataFound = ({
  message,
  className,
  desc,
  iconName,
  noDataClass,
}: NoDataFoundProps) => {
  const { t } = useTranslation();

  const imageProps = iconName
    ? { iconName, iconClassName: 'w-[100px] m-auto mb-4' }
    : {
        src: 'https://cdn-icons-png.flaticon.com/512/7486/7486754.png',
        imgClassName: 'w-[100px] m-auto mb-4',
      };

  return (
    <div className={`py-4 text-center rounded-10px ${className ?? ''}`}>
      <div>
        <Image {...imageProps} alt={t('Table.noDataFound')} />

        <p
          className={`${
            noDataClass ?? 'text-dark text-xl font-semibold max-w-[345px] mx-auto'
          }`}
        >
          {message ?? t('Table.noDataFound')}
        </p>
        <p className="max-w-[345px] mx-auto mt-2.5 text-base text-navText px-4 text-balance">
          {desc ?? t('Table.noDataFoundDesc')}
        </p>
      </div>
    </div>
  );
};

export default NoDataFound;
