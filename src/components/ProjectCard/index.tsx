import Button from 'components/Button/Button';

interface ProjectCardProps {
  parentClass?: string;
  variant?: 'red' | 'orange' | 'gray';
  text?: string;
  buttonText?: string;
  onclick?: () => void;
}

const ProjectCard = ({
  parentClass,
  variant,
  text,
  buttonText,
  onclick,
}: ProjectCardProps) => {
  return (
    <div className={`${parentClass}`}>
      <div
        className={`px-6 py-4 flex flex-col justify-between bg-white border-l-4 border-solid rounded-xl shadow-md relative overflow-hidden min-h-[159px]
        ${
          variant === 'red'
            ? 'border-danger'
            : variant === 'orange'
              ? 'border-orange2'
              : variant === 'gray'
                ? 'border-grayText'
                : 'border-danger'
        } `}
      >
        <h5 className="text-xl leading-8 font-semibold text-dark ">{text}</h5>
        <Button
          onClickHandler={() => onclick}
          // value={button}
          variants={variant}
          small
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;
