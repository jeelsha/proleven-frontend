import { IconInputProps } from '../types/icons';

const AccessDeniedIcon = ({ className }: IconInputProps) => {
  return (
    <svg
      width="68"
      height="68"
      viewBox="0 0 68 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={` ${className ?? ''}`}
    >
      <path
        d="M54.9928 31.2222L54.9879 21.4352C54.9879 18.5204 52.5059 16.1489 49.5911 16.1489C48.8749 16.1489 48.1666 16.2934 47.4583 16.5527V15.0248C47.4583 12.2205 45.3977 9.91699 42.5934 9.91699H42.1918C41.5975 9.91699 40.7943 10.0806 40.2637 10.2683C40.1759 7.35566 38.0842 5.66699 35.4364 5.66699H35.0348C32.2312 5.66699 30.4583 7.8947 30.4583 10.699V11.0893C29.5204 10.7117 28.8921 10.6253 28.3226 10.6253H27.921C25.1167 10.6253 22.6666 13.0988 22.6666 15.9031V29.7524C21.9583 29.1978 21.3356 28.7799 20.4878 28.5412C18.9436 28.107 17.3647 28.2997 15.9651 29.0838C13.0963 30.6917 12.0784 34.3205 13.6509 37.1999C14.0299 38.0137 15.006 40.1855 15.2936 41.2707C16.2689 44.9483 17.7713 49.7076 20.7236 53.9073C24.5862 59.4019 29.7556 62.1863 36.0909 62.1856C36.1958 62.1856 36.3034 62.1849 36.409 62.1835C42.2209 62.0985 46.5275 60.5784 49.5755 57.5347C53.1398 53.9739 55.1033 49.2996 55.1033 44.3597L54.9928 31.2222ZM47.1693 55.1264C44.7794 57.5134 41.2441 58.7091 36.3601 58.7799C36.2716 58.7814 36.1837 58.7821 36.0959 58.7821C27.6002 58.7821 21.8726 52.7648 18.5944 40.398C18.1694 38.795 16.6748 35.5948 16.6748 35.5948C15.9729 34.3439 16.4205 32.7544 17.6714 32.0531C18.2778 31.7131 18.9797 31.6295 19.6491 31.8187C20.3178 32.0071 20.8738 32.4448 21.2131 33.0512L26.5532 41.9655C27.0363 42.7716 28.0818 43.0344 28.8886 42.5513C29.6954 42.0682 29.9412 41.0227 29.4581 40.216L26.2083 34.817V15.9031C26.2083 14.9766 26.9938 14.167 27.921 14.167H28.3226C29.2491 14.167 30.4583 14.9766 30.4583 15.9031V31.6083C30.4583 32.5482 30.935 33.3104 31.8749 33.3104C32.8149 33.3104 33.2916 32.5482 33.2916 31.6083V10.699C33.2916 9.77249 33.7945 8.50033 34.721 8.50033H35.4364C36.3636 8.50033 36.8333 9.77249 36.8333 10.699V32.4307C36.8333 33.3706 37.6642 34.1328 38.6041 34.1328C39.5441 34.1328 40.3749 33.3706 40.3749 32.4307V14.915C40.2581 13.8617 41.0202 12.7503 41.9099 12.7503H42.3115C43.238 12.7503 43.9166 14.0976 43.9166 15.0248V34.0775C43.9166 35.0175 44.7475 35.7797 45.6874 35.7797C46.6274 35.7797 47.4583 35.0175 47.4583 34.0775V22.1102C47.3697 20.3649 48.6709 19.5525 49.7087 19.5525C50.7464 19.5525 51.7083 20.3975 51.7083 21.4352V30.5068L51.7607 44.3746C51.7607 48.3901 50.0897 52.2087 47.1693 55.1264Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default AccessDeniedIcon;
