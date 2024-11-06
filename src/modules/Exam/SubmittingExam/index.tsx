import Image from 'components/Image';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SubmittingExam = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function handlePopState() {
      window.history.go(1);
    };
  }, []);

  return (
    <div className="bg-primaryLight rounded-xl p-14 text-center min-h-100dvh flex flex-col gap-3 justify-center">
      <Image
        imgClassName="mx-auto max-w-[90%] w-[600px] "
        src="/images/thankyou.svg"
      />
      <p className="font-normal"> {t('ExamSubmit.title')} </p>
      <p className="font-bold mb-4 text-2xl ">{t('ExamSubmit.subText')}</p>
    </div>
  );
};
export default SubmittingExam;
