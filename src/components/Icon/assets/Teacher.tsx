import { IconInputProps } from '../types/icons';

const Teacher = ({ className }: IconInputProps) => {
  return (
    <svg
      width="26"
      height="25"
      fill="none"
      viewBox="0 0 26 25"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className ?? ''}`}
    >
      <path
        d="M15.386 0H.757a.66.66 0 0 0-.66.66v10.841c0 .365.296.66.66.66h14.36l-1.738-1.079a1.84 1.84 0 0 1-.309-.24H1.417V1.32h13.309v6.41c.202.043.401.121.588.237l.732.455V.66a.66.66 0 0 0-.66-.66Z"
        fill="#000"
      />
      <path
        d="M11.068 6.198a.508.508 0 0 0-.628.797l2.24 1.767a1.827 1.827 0 0 1 .662-.771l-2.274-1.793ZM21.33 5.42a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8ZM25.966 8.184a2.174 2.174 0 0 0-2.17-2.158h-.92l-1.138 2.953.238-1.2a.383.383 0 0 0-.04-.26l-.373-.678.331-.603a.135.135 0 0 0-.118-.2h-.908a.135.135 0 0 0-.118.2l.33.601-.372.678a.383.383 0 0 0-.04.264l.276 1.198c-.158-.41-1.067-2.668-1.177-2.953h-.902c-1.19 0-2.163.968-2.17 2.158L16.688 9.9 14.83 8.746a.917.917 0 1 0-.967 1.558l3.249 2.017a.917.917 0 0 0 1.4-.774l.017-3.353a.192.192 0 0 1 .384 0c-.001 4.419-.02 5.654-.02 15.411a1.1 1.1 0 0 0 2.2 0v-8.793h.475v8.793a1.1 1.1 0 0 0 2.2 0V8.195a.182.182 0 0 1 .365-.001l.034 6.735a.917.917 0 0 0 .916.912h.005A.917.917 0 0 0 26 14.92l-.034-6.736Z"
        fill="#000"
      />
    </svg>
  );
};

export default Teacher;
