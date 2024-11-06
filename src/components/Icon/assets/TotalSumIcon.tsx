import { IconInputProps } from '../types/icons';

const TotalSumIcon = ({ className }: IconInputProps) => {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width="512"
        height="512"
        x="0"
        y="0"
        viewBox="0 0 484.21 484.21"
        xmlSpace="preserve"
        className={` ${className ?? ''}`}
      >
        <g>
          <path
            d="M395.527 97.043V55.352h-270.99l159.46 171.507c9.983 10.749 9.848 27.458-.319 38.026L126.017 428.861h269.504v-25.18c0-15.256 12.413-27.668 27.674-27.668 15.256 0 27.681 12.412 27.681 27.668v52.848c0 15.262-12.419 27.681-27.681 27.681H61.014a27.64 27.64 0 0 1-25.464-16.834 27.64 27.64 0 0 1 5.509-30.026l184.584-191.964-184.9-198.865A27.676 27.676 0 0 1 61.014 0h362.188c15.255 0 27.68 12.413 27.68 27.68v69.363c0 15.259-12.419 27.677-27.68 27.677-15.262 0-27.675-12.412-27.675-27.677z"
            fill="currentColor"
            opacity="1"
            className=""
          />
        </g>
      </svg>
    </>
  );
};

export default TotalSumIcon;
