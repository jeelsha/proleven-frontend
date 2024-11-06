import StatusLabel from 'components/StatusLabel';

interface Props {
  label: string;
  value?: string | string[];
  isInvoice?: boolean;
  isStatus?: boolean;
  className?: string;
}

export const CardDetails = ({
  label,
  value,
  isInvoice = false,
  isStatus = false,
  className = '',
}: Props) => {
  const statusRender = (item: string) => {
    const getStatusClass = () => {
      switch (item) {
        case 'approved':
        case 'pass':
          return 'completed';
        case 'requested':
          return 'pending';
        case 'rejected':
          return 'cancelled';
        default:
          return 'pending';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={item}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };
  const renderValue = value || '-';
  return (
    <span
      className={`flex justify-start items-center max-w-[440px] w-full gap-2 ${className}`}
    >
      <span className="text-sm leading-4 text-grayText max-w-[50%]">{label}</span>
      &nbsp;
      {isStatus && value ? (
        statusRender(value as string)
      ) : (
        <span
          className={`label text-sm leading-5 text-dark font-medium ${isInvoice ? 'bg-[#C2FF00] p-2 rounded-lg' : ''
            }`}
        >
          {renderValue}
        </span>
      )}
    </span>
  );
};
