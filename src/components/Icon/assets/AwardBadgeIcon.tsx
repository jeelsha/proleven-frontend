import { IconInputProps } from '../types/icons';

const AwardBadgeIcon = ({ className }: IconInputProps) => {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      className={` ${className ?? ''}`}
    >
      <path
        d="M4.61523 11.9379V17.3221C4.61523 19.2937 4.61523 19.2937 6.47857 20.5504L11.6027 23.5079C12.3719 23.9521 13.6286 23.9521 14.3977 23.5079L19.5219 20.5504C21.3852 19.2937 21.3852 19.2937 21.3852 17.3221V11.9379C21.3852 9.96624 21.3852 9.96624 19.5219 8.70957L14.3977 5.75207C13.6286 5.3079 12.3719 5.3079 11.6027 5.75207L6.47857 8.70957C4.61523 9.96624 4.61523 9.96624 4.61523 11.9379Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.9577 8.26616V5.41699C18.9577 3.25033 17.8744 2.16699 15.7077 2.16699H10.291C8.12435 2.16699 7.04102 3.25033 7.04102 5.41699V8.19033"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.6824 11.9055L14.2999 12.8697C14.3974 13.0214 14.6141 13.173 14.7766 13.2164L15.8816 13.498C16.5641 13.6714 16.7483 14.2564 16.3041 14.798L15.5783 15.6755C15.4699 15.8164 15.3833 16.0655 15.3941 16.2389L15.4591 17.3764C15.5024 18.0805 15.0041 18.438 14.3541 18.178L13.2924 17.7555C13.1299 17.6905 12.8591 17.6905 12.6966 17.7555L11.6349 18.178C10.9849 18.438 10.4866 18.0697 10.5299 17.3764L10.5949 16.2389C10.6058 16.0655 10.5191 15.8055 10.4108 15.6755L9.68492 14.798C9.24076 14.2564 9.42492 13.6714 10.1074 13.498L11.2124 13.2164C11.3858 13.173 11.6024 13.0105 11.6891 12.8697L12.3066 11.9055C12.6966 11.3205 13.3033 11.3205 13.6824 11.9055Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AwardBadgeIcon;
