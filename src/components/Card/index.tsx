interface CustomCardProps {
  title?: string;
  children?: JSX.Element;
  headerClass?: string;
  headerExtra?: JSX.Element;
  minimal?: boolean;
  cardClass?: string;
  bodyClass?: string;
  titleClass?: string;
  styles?: React.CSSProperties;
}

const CustomCard = ({
  title,
  children,
  headerClass,
  headerExtra,
  minimal,
  cardClass,
  bodyClass,
  titleClass,
  styles,
}: CustomCardProps) => {
  return (
    <div
      className={`card bg-white rounded-xl 512:shadow-card ${cardClass}`}
      style={{ ...styles }}
    >
      {title && (
        <div
          className={`card-header flex items-center justify-between gap-3
          ${
            minimal
              ? '991:p-6 py-6 px-4'
              : ' p-3  border-b border-solid border-gray-200'
          }
           ${headerClass}`}
        >
          <div className="title">
            <h4
              className={` capitalize text-dark ${
                minimal ? 'text-22px font-bold' : 'text-lg font-semibold'
              } ${titleClass ?? ''}`}
            >
              {title}
            </h4>
          </div>
          {headerExtra}
        </div>
      )}
      <div
        className={`card-body ${!title && minimal ? 'pt-5' : ''} ${
          minimal ? 'pb-6' : 'py-3'
        }`}
      >
        {/*  overflow-auto */}
        <div className={`  ${minimal ? '991:px-6 px-4' : 'px-4'} ${bodyClass}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomCard;
