import { IconInputProps } from '../types/icons';

const FilterStrokeSD = ({ className }: IconInputProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 20 20"
      fill="none"
      className={` ${className ?? ''}`}
    >
      <path
        d="M4.49967 1.75H15.4997C16.4163 1.75 17.1663 2.5 17.1663 3.41667V5.25C17.1663 5.91667 16.7497 6.75 16.333 7.16667L12.7497 10.3333C12.2497 10.75 11.9163 11.5833 11.9163 12.25V15.8333C11.9163 16.3333 11.583 17 11.1663 17.25L9.99967 18C8.91634 18.6667 7.41634 17.9167 7.41634 16.5833V12.1667C7.41634 11.5833 7.08301 10.8333 6.74967 10.4167L3.58301 7.08333C3.16634 6.66667 2.83301 5.91667 2.83301 5.41667V3.5C2.83301 2.5 3.58301 1.75 4.49967 1.75Z"
        stroke="#898989"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.10833 1.75L5 8.33333"
        stroke="#898989"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default FilterStrokeSD;
