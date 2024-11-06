import CustomCard from 'components/Card';
import PageHeader from 'components/PageHeader/PageHeader';
import ExamModal from 'modules/Courses/components/ExamModal';
import SurveyModal from 'modules/Courses/components/SurveyModal';
import { EnumQRCode } from 'modules/Courses/types/survey';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const SurveyCode = () => {
  const { t } = useTranslation();
  const params = useParams();
  const currentURL = new URL(window.location.href);
  const mode = currentURL.searchParams.get('mode');
  return (
    <div>
      <PageHeader small text={t('qrCode')} isScroll />
      <div className="tab-wrapper">
        <CustomCard minimal bodyClass="!max-h-[unset]">
          <div>
            {mode === EnumQRCode.Exam && <ExamModal slug={params?.slug} />}
            {mode === EnumQRCode.Survey && <SurveyModal slug={params?.slug} />}
          </div>
        </CustomCard>
      </div>
    </div>
  );
};

export default SurveyCode;
