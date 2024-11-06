// **components**
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { REACT_APP_FRONT_URL } from 'config';
import { IExamModal } from 'modules/Courses/types';

// **hooks**
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// **redux**
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { clearToken } from 'redux-toolkit/slices/tokenSlice';

type examProps = {
  slug?: string;
};
const ExamModal = ({ slug }: examProps) => {
  const { t } = useTranslation();
  const [exam, setExam] = useState<IExamModal>();
  const dispatch = useDispatch();
  const { response, isLoading } = useQueryGetFunction(`/trainer/exam/qr`, {
    option: {
      course_slug: slug,
    },
  });

  useEffect(() => {
    if (response) {
      setExam(response?.data);
    }
  }, [response]);

  const handleClickLink = () => {
    dispatch(clearToken());
  };
  return (
    <div>
      {isLoading ? (
        <>
          <p className="lazy w-full h-6" />
          <div className="lazy mx-auto max-w-[650px] max-h-[650px] rounded-lg overflow-hidden my-8" />
          <div className="mx-auto flex flex-col justify-center items-center gap-4">
            <span className="lazy block text-center w-24 h-6" />
            <div className="lazy w-full px-5 py-4 flex gap-2.5 rounded-lg items-center" />
          </div>
        </>
      ) : (
        <>
          <p className="text-xl font-bold">{t('ExamModal.message')}</p>
          <div className="mx-auto max-w-[600px] max-h-[600px] rounded-lg overflow-hidden border border-solid border-navText/30 my-8">
            <Image imgClassName="w-full h-full" src={exam?.exam[0]?.qr_string} />
          </div>
          <div className="mx-auto flex flex-col justify-center items-center gap-4">
            <label className="text-base text-grayText block text-center">
              {t('ExamModal.link')}
            </label>
            <div className="w-full">
              <div className="border border-s-borderColor border-navText/30 px-5 py-3 flex gap-2.5 rounded-lg items-center">
                {exam?.exam[0]?.url && (
                  <Button
                    className="flex-[1_0_0%] inline-block overflow-hidden whitespace-nowrap text-sm text-primary text-center"
                    onClickHandler={handleClickLink}
                  >
                    <Link
                      to={`${REACT_APP_FRONT_URL}/${exam?.exam?.[0]?.url}`}
                      target="_blank"
                    >
                      {`${REACT_APP_FRONT_URL}/${exam?.exam?.[0]?.url}`}
                    </Link>
                  </Button>
                )}

                <Button
                  className=""
                  onClickHandler={() => {
                    navigator.clipboard.writeText(
                      `${REACT_APP_FRONT_URL}/${exam?.exam?.[0]?.url}`
                    );
                  }}
                  tooltipText={t('copyText')}
                  tooltipPosition="left"
                >
                  <Image
                    iconName="copyIcon"
                    iconClassName="w-4 h-4 text-primary cursor-pointer"
                  />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default ExamModal;
