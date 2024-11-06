import Button from 'components/Button/Button';
import Image from 'components/Image';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ScrollSelector } from 'redux-toolkit/slices/scrollSlice';

interface PageHeaderProps {
  text?: string;
  titleClass?: string;
  parentClass?: string;
  className?: string;
  children?: React.ReactElement;
  small?: boolean;
  url?: string;
  addSpace?: boolean;
  passState?: { [key: string]: unknown };
  customHandleBack?: () => void;
  showBackButton?: boolean;
  isScroll?: boolean;
}

const PageHeader = ({
  text,
  parentClass,
  className,
  titleClass,
  children,
  small,
  url,
  addSpace,
  passState,
  showBackButton = true,
  customHandleBack,
  isScroll = false,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const mouseScroll = useSelector(ScrollSelector);

  const handleBack = () => {
    navigate(`${url}`, {
      state: passState,
    });
  };
  const getText = () => {
    if (text) {
      if (addSpace) {
        return text.replace(/([A-Z])/g, ' $1');
      }
      return text;
    }
    return '';
  };
  return (
    <div
      className={`${parentClass ?? ''} page-header relative ${
        isScroll
          ? mouseScroll
            ? 'sticky-header sticky-false pt-6'
            : 'sticky-header sticky-true pt-4 translate-y-0 sticky top-0'
          : 'pt-6'
      } pb-4 transition-all duration-300 z-[123]`}
      id="pageHeader"
    >
      <div
        className={`flex 1200:items-center justify-between flex-col gap-5 1024:gap-4 1200:gap-0 1200:flex-row ${
          className || ''
        }`}
      >
        <div className="flex items-center">
          {showBackButton && url ? (
            <Button
              className="bg-white me-2.5 w-8 h-8 rounded-full border border-solid border-borderColor inline-flex justify-center items-center rotate-180 p-1.5 select-none cursor-pointer active:scale-95"
              onClickHandler={customHandleBack ?? handleBack}
            >
              <Image iconName="arrowRightIcon" />
            </Button>
          ) : (
            ''
          )}

          <h2
            className={`text-dark font-bold leading-[1.5] me-auto ${titleClass} ${
              small ? 'text-2xl' : 'text-4xl '
            }`}
          >
            {getText()}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
