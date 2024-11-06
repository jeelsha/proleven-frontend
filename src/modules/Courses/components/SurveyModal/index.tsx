// ** Components
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { REACT_APP_FRONT_URL } from 'config';

// ** Hooks
import { useQueryGetFunction } from 'hooks/useQuery';
import { SurveyData, SurveyModalProps } from 'modules/Courses/types/survey';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Redux
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { clearToken } from 'redux-toolkit/slices/tokenSlice';

const SurveyModal = ({ slug }: SurveyModalProps) => {
  const { t } = useTranslation();
  const [survey, setSurvey] = useState<SurveyData>();
  const dispatch = useDispatch();
  const { response, isLoading } = useQueryGetFunction(`/trainer/survey/qr`, {
    option: {
      course_slug: slug,
    },
  });

  useEffect(() => {
    if (response?.data) {
      setSurvey(response?.data);
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
          <p className="text-xl font-bold">{t('SurveyModal.message')}</p>
          <div className="mx-auto max-w-[630px] max-h-[630px] rounded-lg overflow-hidden border border-solid border-navText/30 my-8">
            <Image imgClassName="w-full h-full" src={survey?.survey_qr} />
          </div>
          <div className="mx-auto flex flex-col justify-center items-center gap-4">
            <div className="w-full">
              <div className="border border-s-borderColor border-navText/30 px-5 py-3 flex gap-2.5 rounded-lg items-center">
                {survey?.survey_url && (
                  <>
                    <Button
                      onClickHandler={handleClickLink}
                      className="flex-[1_0_0%] inline-block overflow-hidden whitespace-nowrap text-sm text-primary text-center"
                    >
                      <Link
                        to={`${REACT_APP_FRONT_URL}/${survey?.survey_url}&&course_slug=${slug}`}
                        target="_blank"
                      >
                        {`${REACT_APP_FRONT_URL}/${survey?.survey_url}&&course_slug=${slug}`}
                      </Link>
                    </Button>
                    <Button
                      className=""
                      onClickHandler={() => {
                        navigator.clipboard.writeText(
                          `${REACT_APP_FRONT_URL}/${survey?.survey_url}&&course_slug=${slug}`
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
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SurveyModal;
