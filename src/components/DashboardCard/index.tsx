import Button from 'components/Button/Button';
import 'components/DashboardCard/style/index.css';
import { IconTypes } from 'components/Icon/types';
import Image from 'components/Image';
import { useNavigate } from 'react-router-dom';

export type ColorVariant =
  | 'green'
  | 'orange'
  | 'pink'
  | 'blue'
  | 'primary'
  | 'purple'
  | 'secondary'
  | 'gray';
interface DashboardCardProps {
  title: string;
  counts?: string;
  colorVariant: ColorVariant;
  iconName: IconTypes;
  StarRating?: JSX.Element;
  className?: string;
  url?: string;
  cardTitle?: string;
}
const getButtonClasses = (variant: string) => {
  switch (variant) {
    case 'green':
      return 'bg-ic_1/10 text-ic_1/70 border-ic_1/70 ';
    case 'orange':
      return 'bg-ic_2/10 text-ic_2/70 border-ic_2/70 ';
    case 'pink':
      return 'bg-ic_3/10 text-ic_3/70 border-ic_3/70 ';
    case 'blue':
      return 'bg-ic_4/10 text-ic_4/70 border-ic_4/70 ';
    case 'primary':
      return 'bg-primary/10 text-primary border-primary ';
    case 'purple':
      return 'bg-lightPurple/10 text-lightPurple border-lightPurple ';
    case 'secondary':
      return 'bg-secondary/10 text-secondary border-secondary ';
    case 'gray':
      return 'bg-grayText/10 text-grayText border-grayText ';
    default:
      return '';
  }
};
export const DashboardCard = ({
  title,
  counts,
  colorVariant,
  iconName,
  StarRating,
  className,
  url,
  cardTitle,
}: DashboardCardProps) => {
  const navigate = useNavigate();
  return (
    <div
      className={`card-top-common bg-white p-5 md:p-7 flex flex-col rounded-xl md:rounded-3xl relative ${
        className ?? ''
      }`}
    >
      {url ? (
        <Button
          className="absolute top-0 left-0 w-full h-full cursor-pointer rounded-xl md:rounded-3xl"
          onClickHandler={() => navigate(url)}
        />
      ) : (
        ''
      )}
      <p className="line-clamp-1 text-grayText text-lg 2xl:text-xl leading-6">
        {title}
      </p>
      <div className="flex gap-4 items-center mt-4 md:mt-9 justify-between">
        <span className="text-3xl 2xl:text-4xl text-dark font-bold cursor-default ">
          {cardTitle ?? ''}
          {counts ?? ''}
          {StarRating ?? ''}
        </span>
        <div
          className={`p-4 rounded-2xl w-20 h-20 border border-solid ${getButtonClasses(
            colorVariant
          )}`}
        >
          {cardTitle ? (
            <a
              // href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                iconName={iconName}
                iconClassName="text-current w-full h-full"
              />
            </a>
          ) : (
            <>
              <Image
                iconName={iconName}
                iconClassName="text-current w-full h-full"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
