import { IconInputProps } from '../types/icons';

const CheckIconDark = ({ className }: IconInputProps) => {
  return (
    <svg
      width="496"
      height="496"
      viewBox="0 0 496 496"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M496 248C496 385 385 496 248 496C111 496 0 385 0 248C0 111 111 0 248 0C385 0 496 111 496 248ZM219.3 379.3L403.3 195.3C409.5 189.1 409.5 178.9 403.3 172.7L380.7 150.1C374.5 143.9 364.3 143.9 358.1 150.1L208 300.1L137.9 230C131.7 223.8 121.5 223.8 115.3 230L92.7 252.6C86.5 258.8 86.5 269 92.7 275.2L196.7 379.2C202.9 385.4 213.1 385.4 219.3 379.2V379.3Z"
        fill="#008000"
      />
    </svg>
  );
};

export default CheckIconDark;
